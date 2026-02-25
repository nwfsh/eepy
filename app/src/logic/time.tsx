
// diff mode we having
export type Mode = "morning" | "night" | "default";
export type TimeOfDay = number; // storing minutes cus its timezone safe
// one day have 1440 minutes, 23:59 is 1439


export type TimeWindow = {
    start: TimeOfDay; // time since midnight 0:00 in minutes
    end: TimeOfDay; // time since midnight 0:00 in minutes
}

export function currentTimeToMins(now: Date): TimeOfDay {
    return now.getHours() * 60 + now.getMinutes();
}

export function isWithinTimeWindow(now: Date, window: TimeWindow): boolean {
    const n = currentTimeToMins(now);
    const start = window.start;
    const end = window.end;

    if(end > start) {return n >= start && n <= end}; // not normal where people stay awake past midnight 
    return n >= start || n <= end; // typical day sleep when it wraps around midnight
}

export function getMode(now: Date, morning: TimeWindow, night: TimeWindow): Mode {
    if(isWithinTimeWindow(now, morning)) { return "morning"; }
    if(isWithinTimeWindow(now, night)) { return "night"; }
    return "default";
}

