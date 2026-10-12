import { DateTime } from "luxon";

/**
 * One partner's resolved schedule, ready for cycle math.
 * Pure data — no DB types leak in here.
 */

// same as the one in database, leave out window as its purely for checkin.ts, and updated_at is for funsies 
export type ResolvedSchedule = {
    userId: string;
    timezone: string; 
    wakeTime: number; 
    sleepTime: number; 
};

export type CyclePlan = {
    cycleDate: string;
    rows: Array<{
        // there will be 4 rows
        userId: string;
        phase: "morning" | "night";
        userLocalDate: string; 
    }>;
};

export function nextNightOpeningUTC(
    schedule: ResolvedSchedule,
    now: DateTime
): DateTime {
    const nowInTz = now.setZone(schedule.timezone);

    const sleepHour = Math.floor(schedule.sleepTime / 60); // get the hours 
    const sleepMinute = schedule.sleepTime % 60; // get the remainder for minutes 

    let candidate = nowInTz.set({
        hour: sleepHour,
        minute: sleepMinute,
        second: 0,
        millisecond: 0,
    });

    if (candidate <= nowInTz) {
        candidate = candidate.plus({ days: 1 });
    }

    return candidate.toUTC();
}

export function correspondingMorningUTC(
    schedule: ResolvedSchedule,
    nightOpeningUTC: DateTime
): DateTime {
    const nightLocal = nightOpeningUTC.setZone(schedule.timezone);

    const wakeHour = Math.floor(schedule.wakeTime / 60);
    const wakeMinute = schedule.wakeTime % 60;

    let morningLocal = nightLocal.set({
        hour: wakeHour,
        minute: wakeMinute,
        second: 0,
        millisecond: 0,
    });

    if (morningLocal <= nightLocal) {
        morningLocal = morningLocal.plus({ days: 1 });
    }

    return morningLocal.toUTC();
}

/**
 * nearestTarget — used by checkin.ts to figure out WHICH window you're checking in for.
 *
 * Builds the target time (wake or sleep) on yesterday, today and tomorrow in the
 * user's timezone, and picks whichever is closest to now. This handles midnight:
 * sleep at 23:50, checking in at 00:10 -> the closest target is YESTERDAY's 23:50,
 * 20 mins away (not 1420 mins like Math.abs on minutes-since-midnight would say).
 *
 * localDate is the target's local date, which matches the user_local_date that
 * computeCycle gives that row.
 */
export function nearestTarget(
    timezone: string,
    targetMinutes: number,
    now: DateTime
): { targetUTC: DateTime; localDate: string; diffMinutes: number } {
    const nowInTz = now.setZone(timezone);

    const today = nowInTz.set({
        hour: Math.floor(targetMinutes / 60),
        minute: targetMinutes % 60,
        second: 0,
        millisecond: 0,
    });
    const candidates = [today.minus({ days: 1 }), today, today.plus({ days: 1 })];

    const diff = (c: DateTime) => Math.abs(c.diff(nowInTz, "minutes").minutes);
    const nearest = candidates.reduce((best, c) => (diff(c) < diff(best) ? c : best));

    const localDate = nearest.toISODate();
    if (!localDate) throw new Error(`nearestTarget: invalid timezone ${timezone}`);

    return {
        targetUTC: nearest.toUTC(),
        localDate,
        diffMinutes: diff(nearest),
    };
}

/**
 * computeCycle — the pure heart of createCycleRows.
 *
 * Given both partners' schedules and a reference `now`, determines the
 * next shared cycle:
 *   - cycle_date = ISO date of whichever partner's NIGHT window opens
 *     first in UTC ("smaller UTC timestamp wins")
 *   - each of the 4 rows (2 users x 2 phases) carries its OWN
 *     user_local_date, computed in that user's own timezone — allowed
 *     to differ between partners and from cycle_date itself
 *
 * No database access. Deterministic for a fixed `now`. This is the
 * function the unit tests validate against the paper examples.
 */

// THIS IS THE ONLY FUNCTION YOURE EVER USING, THE REST ARE HELPER FUNCTIONS 
export function computeCycle(
    schedule1: ResolvedSchedule,
    schedule2: ResolvedSchedule,
    now: DateTime
): CyclePlan {
    const night1UTC = nextNightOpeningUTC(schedule1, now); // grab avery night schedule and turn it into a UTC 
    const night2UTC = nextNightOpeningUTC(schedule2, now); // grab aidan night schedule and turn it into a UTC 

    // cycle_date = whichever NIGHT opens FIRST in UTC
    const anchorUTC = night1UTC <= night2UTC ? night1UTC : night2UTC; 
    const cycleDate = anchorUTC.toISODate(); // get the smallest night number and anchor it 

    if (!cycleDate) {
        throw new Error(
            "computeCycle: could not derive cycle_date (invalid DateTime)"
        );
    }

    const morning1UTC = correspondingMorningUTC(schedule1, night1UTC);
    const morning2UTC = correspondingMorningUTC(schedule2, night2UTC);

    const localDate = (utc: DateTime, tz: string): string => { // 
        const d = utc.setZone(tz).toISODate();
        if (!d) throw new Error(`computeCycle: invalid timezone ${tz}`);
        return d;
    };

    return {
        cycleDate,
        rows: [
            {
                userId: schedule1.userId,
                phase: "night",
                userLocalDate: localDate(night1UTC, schedule1.timezone),
            },
            {
                userId: schedule1.userId,
                phase: "morning",
                userLocalDate: localDate(morning1UTC, schedule1.timezone),
            },
            {
                userId: schedule2.userId,
                phase: "night",
                userLocalDate: localDate(night2UTC, schedule2.timezone),
            },
            {
                userId: schedule2.userId,
                phase: "morning",
                userLocalDate: localDate(morning2UTC, schedule2.timezone),
            },
        ],
    };
}

// UTC now              ( EXACT TIME STAMPS )
//  → user timezone     so you can build "their 2am" ( EXACT TIMESTAMP INCLUDING DATE ) 
// → UTC               so you can compare both partners () EXACT TIME STAMPS OF EACH )
//  → user timezone     so you can get their local calendar date for the DB ( DATE )

// the cycle is needed becu