import { Router, Request, Response } from "express";
import { requireAuth } from "../middleware/auth";
import sql from "../db";
import { DateTime } from "luxon";

const checkinRouter = Router();

// POST /checkin — check in for morning or night window
checkinRouter.post("/", requireAuth, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const { phase } = req.body;

        if (phase !== "morning" && phase !== "night") {
            res.status(400).json({ error: "Phase must be morning or night" });
            return;
        }

        // 1. get user's current schedule and timezone
        const [schedule] = await sql`
            SELECT wake_time, sleep_time, thewindow, timezone
            FROM sleep_schedule
            WHERE user_id = ${userId}
            AND effective_date <= CURRENT_DATE
            ORDER BY effective_date DESC
            LIMIT 1
        `;

        if (!schedule) {
            res.status(404).json({ error: "No sleep schedule found. Set one first." });
            return;
        }

        // 2. get current time in user's timezone as minutes since midnight
        const now = new Date();
        const userTime = DateTime.now().setZone(schedule.timezone); // THIS IS THE SINGLE SOURCE OF TRUTH, ALWAYS USE THIS TIME 
        const currentMinutes = userTime.hour * 60 + userTime.minute;

        // 3. check if within window
        const targetTime = phase === "morning" ? schedule.wake_time : schedule.sleep_time;
        const withinWindow = Math.abs(currentMinutes - targetTime) <= schedule.thewindow;
        // math abs always turns the value positive -> basically asks if youre between the target time

        // before deducting check if they have enough
        const [userTokens] = await sql`
        SELECT tokens FROM users WHERE id = ${userId}
        `;

        if (!withinWindow && userTokens.tokens < 4) {
            res.status(400).json({ error: "Not enough tokens to unlock outside your window" });
            return;
        }

        // 4. get relationship
        const [relationship] = await sql`
            SELECT id, user1_id, user2_id, streak_counter,
                CASE
                    WHEN user1_id = ${userId} THEN user2_id
                    WHEN user2_id = ${userId} THEN user1_id
                END AS partner_id
            FROM relationship
            WHERE user1_id = ${userId} OR user2_id = ${userId}
        `;

        if (!relationship) {
            res.status(404).json({ error: "You are not in a relationship yet" });
            return;
        }

        // 5. check if already checked in today
        const today = userTime.toISODate();// dont use new Date as it takes YOUR DATE 
        const [existingCheckin] = await sql`
            SELECT id FROM checkin
            WHERE user_id = ${userId}
            AND phase = ${phase}
            AND cycle_date = ${today}
        `;

        if (existingCheckin) {
            res.status(400).json({ error: "You have already checked in for this phase today" });
            return;
        }

        // 6. create the checkin record
        const [checkin] = await sql`
            INSERT INTO checkin (relationship_id, user_id, phase, cycle_date, has_checked_in, checked_in_at)
            VALUES (${relationship.id}, ${userId}, ${phase}, ${today}, true, NOW())
            RETURNING id, phase, cycle_date, has_checked_in, checked_in_at
        `;


        // 7. unlock the incoming message
        await sql`
            UPDATE message
            SET unlocked = true,
                spent_coins = ${withinWindow ? 0 : -4}
            WHERE to_id = ${userId}
            AND phase = ${phase}
            AND unlocked = false
            AND id = (
                SELECT id FROM message
                WHERE to_id = ${userId}
                AND phase = ${phase}
                AND unlocked = false
                ORDER BY sent_at DESC
                LIMIT 1
            )
        `;

        // 8. add or deduct tokens based on whether they were on time
        const tokenChange = withinWindow ? 1 : -4;
        await sql`
            UPDATE users
            SET tokens = tokens + ${tokenChange}
            WHERE id = ${userId}
        `;

        // 9. check if partner also checked in today — if so, increment streak
        const [partnerCheckin] = await sql`
            SELECT id FROM checkin
            WHERE user_id = ${relationship.partner_id}
            AND phase = ${phase}
            AND cycle_date = ${today}
        `;

        if (partnerCheckin) {
            await sql`
                UPDATE relationship
                SET streak_counter = streak_counter + 1
                WHERE id = ${relationship.id}
            `;
        }

        res.status(201).json({
            checkin,
            on_time: withinWindow,
            token_change: tokenChange,
            streak_updated: !!partnerCheckin
        });

    } catch (error) {
        console.error("POST /checkin error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

export default checkinRouter;