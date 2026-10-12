import { Router, Request, Response } from "express";
import { requireAuth } from "../middleware/auth";
import sql from "../db";
import { DateTime } from "luxon";
import { nearestTarget } from "../lib/cycleMath";
import { createCycleRows } from "../lib/cycleRows";

const checkinRouter = Router();

// POST /checkin/add — check in for morning or night window
// the checkin row was already made ahead of time by createCycleRows, so this UPDATES it
checkinRouter.post("/add", requireAuth, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const { phase } = req.body;

        if (phase !== "morning" && phase !== "night") {
            res.status(400).json({ error: "Phase must be morning or night" });
            return;
        }

        // 1. get user's current schedule, timezone lives on users not sleep_schedule
        const [schedule] = await sql`
            SELECT ss.wake_time, ss.sleep_time, ss.thewindow, u.timezone
            FROM sleep_schedule ss
            JOIN users u ON u.id = ss.user_id
            WHERE ss.user_id = ${userId}
            AND ss.effective_date <= CURRENT_DATE
            ORDER BY ss.effective_date DESC
            LIMIT 1
        `;

        if (!schedule) {
            res.status(404).json({
                error: "No sleep schedule found. Set one first.",
            });
            return;
        }

        // 2. figure out which window this is + if we're inside it
        // nearestTarget handles midnight (23:50 sleep, 00:10 checkin = 20 mins, yesterday's row)
        const targetMinutes =
            phase === "morning" ? schedule.wake_time : schedule.sleep_time;
        const target = nearestTarget(schedule.timezone, targetMinutes, DateTime.utc());
        const withinWindow = target.diffMinutes <= schedule.thewindow;
        const tokenChange = withinWindow ? 1 : -4;

        // 3. get relationship
        const [relationship] = await sql`
            SELECT id,
                CASE
                    WHEN user1_id = ${userId} THEN user2_id
                    WHEN user2_id = ${userId} THEN user1_id
                END AS partner_id
            FROM relationship
            WHERE user1_id = ${userId} OR user2_id = ${userId}
        `;

        if (!relationship) {
            res.status(404).json({
                error: "You are not in a relationship yet",
            });
            return;
        }

        if (!relationship.partner_id) {
            res.status(400).json({ error: "Your partner has not joined yet" });
            return;
        }

        // 4. fallback: if the cron / join never made this window's row, make it now
        // pretend it's just before this window's night started, so computeCycle plans THIS cycle
        // (morning -> go back by how long you sleep to reach the night before it)
        const [existingRow] = await sql`
            SELECT id FROM checkin
            WHERE user_id = ${userId}
            AND phase = ${phase}
            AND user_local_date = ${target.localDate}
        `;

        if (!existingRow) {
            const sleepLength =
                (schedule.wake_time - schedule.sleep_time + 1440) % 1440;
            const minutesBefore = phase === "night" ? 1 : sleepLength + 1;
            await createCycleRows(
                relationship.id,
                target.targetUTC.minus({ minutes: minutesBefore })
            );
        }

        // 5. everything else happens in ONE transaction -> either it all happens or none of it
        const result = await sql.begin(async (txn) => {
            // postgres.js types bug: the transaction works like sql`...` but TS thinks it isn't callable
            const tx = txn as unknown as typeof sql;

            // lock the relationship row so if both partners check in at the same time,
            // one waits for the other -> streak can't go up twice (or zero times)
            await tx`
                SELECT id FROM relationship
                WHERE id = ${relationship.id}
                FOR UPDATE
            `;

            const [row] = await tx`
                SELECT id, has_checked_in FROM checkin
                WHERE user_id = ${userId}
                AND phase = ${phase}
                AND user_local_date = ${target.localDate}
            `;

            if (!row) {
                return {
                    status: 404,
                    body: { error: "No check-in for this window yet, make sure you both have a sleep schedule" },
                };
            }

            if (row.has_checked_in) {
                return {
                    status: 400,
                    body: { error: "You have already checked in for this window" },
                };
            }

            // before deducting check if they have enough
            const [user] = await tx`
                SELECT tokens FROM users WHERE id = ${userId}
            `;

            if (!withinWindow && user.tokens < 4) {
                return {
                    status: 400,
                    body: { error: "Not enough tokens to unlock outside your window" },
                };
            }

            // streak reset — no cron job, so we check lazily here instead
            // on the FIRST check-in of a cycle, look at the cycle before it (cycle_date - 1)
            // if it doesn't have all 4 check-ins (or its rows were never made cus nobody opened the app)
            // -> streak back to 0
            // only on the first check-in, otherwise the morning check-in would wipe the night's +1
            // ::int because count() returns bigint, which postgres.js gives back as a string
            const [cycleInfo] = await tx`
                SELECT
                    (SELECT count(*)::int FROM checkin
                     WHERE relationship_id = ${relationship.id}
                     AND cycle_date = c.cycle_date
                     AND has_checked_in = true) AS done_this_cycle,
                    (SELECT count(*)::int FROM checkin
                     WHERE relationship_id = ${relationship.id}
                     AND cycle_date = c.cycle_date - 1
                     AND has_checked_in = true) AS done_last_cycle
                FROM checkin c
                WHERE c.id = ${row.id}
            `;

            const streakReset =
                cycleInfo.done_this_cycle === 0 && cycleInfo.done_last_cycle < 4;

            if (streakReset) {
                await tx`
                    UPDATE relationship
                    SET streak_counter = 0
                    WHERE id = ${relationship.id}
                `;
            }

            // mark the pre-made row as checked in
            const [checkin] = await tx`
                UPDATE checkin
                SET has_checked_in = true, checked_in_at = NOW()
                WHERE id = ${row.id}
                RETURNING id, phase, cycle_date, user_local_date, has_checked_in, checked_in_at
            `;

            // unlock the latest locked incoming message
            await tx`
                UPDATE message
                SET unlocked = true,
                    spent_coins = ${withinWindow ? 0 : -4}
                WHERE id = (
                    SELECT id FROM message
                    WHERE to_id = ${userId}
                    AND phase = ${phase}
                    AND unlocked = false
                    ORDER BY sent_at DESC
                    LIMIT 1
                )
            `;

            // add or deduct tokens based on whether they were on time
            await tx`
                UPDATE users
                SET tokens = tokens + ${tokenChange}
                WHERE id = ${userId}
            `;

            // streak goes up only if partner ALSO checked in (has_checked_in = true, not just has a row)
            // for the same phase in the same cycle
            const [streak] = await tx`
                UPDATE relationship
                SET streak_counter = streak_counter + 1
                WHERE id = ${relationship.id}
                AND EXISTS (
                    SELECT 1 FROM checkin mine
                    JOIN checkin partner
                        ON partner.cycle_date = mine.cycle_date
                        AND partner.phase = mine.phase
                    WHERE mine.id = ${checkin.id}
                    AND partner.user_id = ${relationship.partner_id}
                    AND partner.has_checked_in = true
                )
                RETURNING streak_counter
            `;

            return {
                status: 201,
                body: {
                    checkin,
                    on_time: withinWindow,
                    token_change: tokenChange,
                    streak_updated: !!streak,
                    streak_reset: streakReset,
                },
            };
        });

        res.status(result.status).json(result.body);
    } catch (error) {
        console.error("POST /checkin error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

export default checkinRouter;
