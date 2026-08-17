import { describe, it, expect } from "vitest";
import { DateTime } from "luxon";
import { computeCycle, ResolvedSchedule } from "./cycleMath";

/**
 * These tests are NOT invented — they are the literal paper examples
 * from the Phase 2 design work, transcribed into assertions. If the
 * code disagrees with the diagrams, the test fails and we find out
 * which one is wrong.
 *
 * All tests freeze `now` at a fixed instant so results are deterministic.
 */

// Frozen reference moment for all tests: midnight UTC, Aug 14 2026
const NOW = DateTime.fromISO("2026-08-14T00:00:00Z", { zone: "utc" });

// helper: minutes since midnight
const mins = (h: number, m: number = 0) => h * 60 + m;

// helper: getting a speicifc row out of the 4 rows 
const findRow = (
    plan: ReturnType<typeof computeCycle>,
    userId: string,
    phase: "morning" | "night"
) => {
    const row = plan.rows.find((r) => r.userId === userId && r.phase === phase);
    if (!row) throw new Error(`row not found: ${userId} ${phase}`);
    return row;
};

describe("Paper Example 1 — normal 17h gap (diagram from Aug 14 session)", () => {
    // Avery: UTC-7, sleeps 2am, wakes 10am
    // Aidan: UTC+10, sleeps 2am, wakes 10am
    const avery: ResolvedSchedule = {
        userId: "avery",
        timezone: "UTC-7",
        sleepTime: mins(2),
        wakeTime: mins(10),
    };
    const aidan: ResolvedSchedule = {
        userId: "aidan",
        timezone: "UTC+10",
        sleepTime: mins(2),
        wakeTime: mins(10),
    };

    const plan = computeCycle(avery, aidan, NOW);

    it("Avery's night opens at 9am UTC 14/8 -> her user_local_date is 14/8", () => {
        // from the diagram: 2am UTC-7 = 9am UTC same day
        expect(findRow(plan, "avery", "night").userLocalDate).toBe(
            "2026-08-14"
        );
    });

    it("Aidan's night opens at 4pm UTC 14/8, which is 2am local 15/8 -> his user_local_date is 15/8", () => {
        // from the diagram: next 2am UTC+10 after NOW lands on his local 15/8
        expect(findRow(plan, "aidan", "night").userLocalDate).toBe(
            "2026-08-15"
        );
    });

    it("cycle_date = earlier UTC night opening = Avery's (9am UTC beats 4pm UTC) = 14/8", () => {
        expect(plan.cycleDate).toBe("2026-08-14");
    });

    it("even in the 'normal' case, one partner's user_local_date differs from cycle_date", () => {
        // Aidan: user_local_date 15/8, cycle_date 14/8 — the two-key model
        // already earns its keep here, not only at extreme gaps
        // local date and cycle date for aidan shouldnt be the same 
        expect(findRow(plan, "aidan", "night").userLocalDate).not.toBe(
            plan.cycleDate
        );
    });

    it("morning rows: each partner wakes 10am their own local day", () => {
        expect(findRow(plan, "avery", "morning").userLocalDate).toBe(
            "2026-08-14"
        );
        expect(findRow(plan, "aidan", "morning").userLocalDate).toBe(
            "2026-08-15"
        );
    });
});

describe("Paper Example 2 — extreme 25h gap, Kiribati vs American Samoa (diagram from Aug 15 session)", () => {
    // Avery: Kiribati UTC+14, sleeps 2am, wakes 10am
    // Aidan: American Samoa UTC-11, sleeps 2am, wakes 10am
    const avery: ResolvedSchedule = {
        userId: "avery",
        timezone: "UTC+14",
        sleepTime: mins(2),
        wakeTime: mins(10),
    };
    const aidan: ResolvedSchedule = {
        userId: "aidan",
        timezone: "UTC-11",
        sleepTime: mins(2),
        wakeTime: mins(10),
    };

    const plan = computeCycle(avery, aidan, NOW);

    it("Avery's night: 2am UTC+14 = 12pm UTC (matches the diagram's '12pm sleep')", () => {
        // her local date for that occurrence is 15/8 (2am on HER 15th)
        expect(findRow(plan, "avery", "night").userLocalDate).toBe(
            "2026-08-15"
        );
    });

    it("Aidan's night: 2am UTC-11 = 1pm UTC (matches the diagram's '1pm sleep')", () => {
        expect(findRow(plan, "aidan", "night").userLocalDate).toBe(
            "2026-08-14"
        );
    });

    it("cycle_date anchored by Avery (12pm UTC beats 1pm UTC) = 14/8", () => {
        expect(plan.cycleDate).toBe("2026-08-14");
    });

    it("THE core two-key proof: different user_local_dates, same shared cycle_date", () => {
        const averyNight = findRow(plan, "avery", "night");
        const aidanNight = findRow(plan, "aidan", "night");
        // A != B ...
        expect(averyNight.userLocalDate).not.toBe(aidanNight.userLocalDate);
        // ... but cycle_date is one shared value (Task 2.2.3's exact assertion)
        expect(plan.cycleDate).toBe("2026-08-14");
    });
});

describe("Paper Example — midnight-crossing window (Task 2.2.2)", () => {
    // sleep 10pm, wake 1am: the window itself crosses local midnight.
    // The calendar date flipping at midnight must NOT split the session.
    const user: ResolvedSchedule = {
        userId: "u1",
        timezone: "UTC",
        sleepTime: mins(22), // 10pm
        wakeTime: mins(1), // 1am — numerically BEFORE sleep, the tricky part
    };
    const partner: ResolvedSchedule = {
        userId: "u2",
        timezone: "UTC",
        sleepTime: mins(22),
        wakeTime: mins(1),
    };

    const plan = computeCycle(user, partner, NOW);

    it("night belongs to 14/8 (10pm on the 14th)", () => {
        expect(findRow(plan, "u1", "night").userLocalDate).toBe("2026-08-14");
    });

    it("the corresponding morning rolls to the NEXT local day (1am on the 15th), not the same day", () => {
        // if the code naively used same-day 1am, morning would come BEFORE
        // night — the exact bug this example exists to catch
        expect(findRow(plan, "u1", "morning").userLocalDate).toBe("2026-08-15");
    });
});

describe("Invariants that must hold regardless of inputs", () => {
    const avery: ResolvedSchedule = {
        userId: "avery",
        timezone: "UTC+14",
        sleepTime: mins(2),
        wakeTime: mins(10),
    };
    const aidan: ResolvedSchedule = {
        userId: "aidan",
        timezone: "UTC-11",
        sleepTime: mins(2),
        wakeTime: mins(10),
    };

    it("argument order doesn't matter: cycle_date is the same whichever partner is passed first", () => {
        const ab = computeCycle(avery, aidan, NOW);
        const ba = computeCycle(aidan, avery, NOW);
        expect(ab.cycleDate).toBe(ba.cycleDate);
    });

    it("always exactly 4 rows: 2 users x 2 phases", () => {
        const plan = computeCycle(avery, aidan, NOW);
        expect(plan.rows).toHaveLength(4);
        const phases = plan.rows.map((r) => `${r.userId}:${r.phase}`).sort();
        expect(phases).toEqual([
            "aidan:morning",
            "aidan:night",
            "avery:morning",
            "avery:night",
        ]);
    });

    it("real IANA zone behaves like its fixed offset (America/Vancouver in August = UTC-7)", () => {
        const averyIana: ResolvedSchedule = {
            ...avery,
            timezone: "America/Vancouver",
        };
        const averyFixed: ResolvedSchedule = { ...avery, timezone: "UTC-7" };
        const a = computeCycle(averyIana, aidan, NOW);
        const b = computeCycle(averyFixed, aidan, NOW);
        expect(a.cycleDate).toBe(b.cycleDate);
        expect(findRow(a, "avery", "night").userLocalDate).toBe(
            findRow(b, "avery", "night").userLocalDate
        );
    });
});
