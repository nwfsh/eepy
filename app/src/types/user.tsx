import type { TimeWindow } from "../logic/time"; // Adjust the path as necessary

export type UserProfile = {
  userId: string;
  email: string;
  timeZone: string;       // e.g. PST BLA BLA
  wakeWindow: TimeWindow;
  windDownWindow?: TimeWindow;
};

type Couple = {
    me: UserProfile;
    partner: UserProfile;
  };

