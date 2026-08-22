import sql from "../db";
import { DateTime } from "luxon";
import { computeCycle, ResolvedSchedule } from "./cycleMath";

// bridge between cycle math + database 

type CreatedRow = {
    id: string;
    user_id: string;
    phase: "morning" | "night";
    cycle_date: string;
    user_local_date: string;
    has_checked_in: boolean;
};



// pulling from user + sleep_schedule, to get tiemzone and schedule
// get the latest one where affective date is applicable
async function getActiveSchedule(
    userId: string
): Promise<ResolvedSchedule | null> {
    const [row] = await sql`
        SELECT ss.wake_time, ss.sleep_time, u.timezone
        FROM sleep_schedule ss
        JOIN users u ON u.id = ss.user_id
        WHERE ss.user_id = ${userId}
        AND ss.effective_date <= CURRENT_DATE
        ORDER BY ss.effective_date DESC
        LIMIT 1
    `;

    if (!row) {
        console.log("no sleep schedule")
        return null};

    return {
        userId,
        timezone: row.timezone,
        wakeTime: row.wake_time,
        sleepTime: row.sleep_time,
    };
}

/**
 * createCycleRows — the reusable, idempotent entry point of the streak
 * system. Called from THREE places (by design, per the Aug 8 task doc):
 *   1. the daily cron trigger route
 *   2. the relationship-just-formed flow
 *   3. the lazy fallback inside checkin.ts (Task 5.2)
 *
 * All cycle math lives in cycleMath.computeCycle (pure, unit-tested).
 * This file only does: fetch inputs -> compute -> insert.
 *
 * Idempotent via ON CONFLICT DO NOTHING against the DB unique constraint
 * on (user_id, phase, user_local_date) — safe to call repeatedly and
 * concurrently; duplicates are structurally impossible.
 *
 * Returns the rows actually inserted this call (empty array if they all
 * already existed). Return value is for logging/observability ONLY —
 * callers must never pluck "their" row out of it; checkin.ts always does
 * its own lookup by user_id + phase + user_local_date afterwards.
 */
export async function createCycleRows(
    relationshipId: string
): Promise<CreatedRow[]> {
    // grab their ids 
    const [relationship] = await sql`
        SELECT id, user1_id, user2_id
        FROM relationship
        WHERE id = ${relationshipId}
    `;

    // if it doesnt exist throw error
    if (!relationship) {
        throw new Error(
            `createCycleRows: relationship ${relationshipId} not found`
        );
    }

    // use cycleMath fucntion, to get their sleep schedule, check if it even exists first before creating rows 
    const [schedule1, schedule2] = await Promise.all([
        getActiveSchedule(relationship.user1_id),
        getActiveSchedule(relationship.user2_id),
    ]);

    if (!schedule1 || !schedule2) {
        // A partner hasn't set a schedule yet — nothing to create.
        // Not an error: the relationship-formed trigger can legitimately
        // fire before both schedules exist.
        return [];
        console.log("pls get both to set sleep schedules")
    }

    // 3. Pure math: cycle_date + all 4 rows' user_local_dates
    const plan = computeCycle(schedule1, schedule2, DateTime.utc());

    // 4. Insert. ON CONFLICT DO NOTHING = idempotency, enforced by the
    //    unique constraint, race-condition-safe (no check-then-insert gap).
    // const created: CreatedRow[] = [];

    // // mvp

    // OLD METHOD 
    // for (const row of plan.rows) {
    //     const [inserted] = await sql`
    //         INSERT INTO checkin (relationship_id, user_id, phase, cycle_date, user_local_date, has_checked_in)
    //         VALUES (${relationshipId}, ${row.userId}, ${row.phase}, ${plan.cycleDate}, ${row.userLocalDate}, false)
    //         ON CONFLICT (user_id, phase, user_local_date) DO NOTHING
    //         RETURNING id, user_id, phase, cycle_date, user_local_date, has_checked_in
    //     `;

    //     if (inserted) {
    //         created.push(inserted);
    //     }
    // }

    // dont insert row by row into database, put the whole chunk of 4 rows, then put it all at the same time 
const created = await sql<CreatedRow[]>`
    INSERT INTO checkin ${sql(
        plan.rows.map((r) => ({
            relationship_id: relationshipId,
            user_id: r.userId,
            phase: r.phase,
            cycle_date: plan.cycleDate,
            user_local_date: r.userLocalDate,
            has_checked_in: false,
        }))
    )}
    ON CONFLICT (user_id, phase, user_local_date) DO NOTHING
    RETURNING id, user_id, phase, cycle_date, user_local_date, has_checked_in
`;


    return created;
}
