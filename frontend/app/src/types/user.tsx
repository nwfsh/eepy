import type { TimeWindow } from "../logic/time"; // Adjust the path as necessary

export type UserProfile = {
  userId: string;
  email: string;
  timeZone: string;       // e.g. IANA TIMEZONES
  wakeWindow: TimeWindow;
  windDownWindow?: TimeWindow;
};

export type Couple = {
    me: UserProfile;
    partner: UserProfile;
    partnerId: string;
    partneremail: string;
    streak: CoupleStreak
  };

export type CoupleStreak = {
    current: number;
    lastCompletedDateKey?: string; // couple-day key, see below
};

export type DailyCheckin = {
    dateKey: string;        // "YYYY-MM-DD" in *that user's timezone*
    wokeOnTime: boolean;
    checkedAtIso: string;   // when they actually checked/unlocked (ISO)
  }
