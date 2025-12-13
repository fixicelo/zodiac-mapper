import { ZodiacSign } from "./ZodiacSign";

export interface MonthDay {
  /** 1-12 */
  month: number;
  /** 1-31 */
  day: number;
}

export interface ZodiacDateRange {
  /** Inclusive start date (month/day). */
  start: MonthDay;
  /** Inclusive end date (month/day). */
  end: MonthDay;
  /** True if the range crosses the year boundary (e.g., Capricorn). */
  crossesYear: boolean;
}

function parseMonthDayString(input: string): MonthDay {
  const s = input.trim();
  if (!s) throw new RangeError("Invalid date string: empty");

  // Accept either:
  // - YYYY-MM-DD (year ignored)
  // - MM-DD
  // Always parsed as month/day (no timezone involved).
  const ymd = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (ymd) {
    return { month: Number(ymd[2]), day: Number(ymd[3]) };
  }

  const md = /^(\d{1,2})-(\d{2})$/.exec(s);
  if (md) {
    return { month: Number(md[1]), day: Number(md[2]) };
  }

  throw new RangeError(
    `Invalid date string: "${input}". Expected "YYYY-MM-DD" or "MM-DD".`,
  );
}

const ZODIAC_DATE_RANGES: Record<ZodiacSign, ZodiacDateRange> = {
  [ZodiacSign.ARIES]: {
    start: { month: 3, day: 21 },
    end: { month: 4, day: 19 },
    crossesYear: false,
  },
  [ZodiacSign.TAURUS]: {
    start: { month: 4, day: 20 },
    end: { month: 5, day: 20 },
    crossesYear: false,
  },
  [ZodiacSign.GEMINI]: {
    start: { month: 5, day: 21 },
    end: { month: 6, day: 21 },
    crossesYear: false,
  },
  [ZodiacSign.CANCER]: {
    start: { month: 6, day: 22 },
    end: { month: 7, day: 22 },
    crossesYear: false,
  },
  [ZodiacSign.LEO]: {
    start: { month: 7, day: 23 },
    end: { month: 8, day: 22 },
    crossesYear: false,
  },
  [ZodiacSign.VIRGO]: {
    start: { month: 8, day: 23 },
    end: { month: 9, day: 22 },
    crossesYear: false,
  },
  [ZodiacSign.LIBRA]: {
    start: { month: 9, day: 23 },
    end: { month: 10, day: 23 },
    crossesYear: false,
  },
  [ZodiacSign.SCORPIO]: {
    start: { month: 10, day: 24 },
    end: { month: 11, day: 21 },
    crossesYear: false,
  },
  [ZodiacSign.SAGITTARIUS]: {
    start: { month: 11, day: 22 },
    end: { month: 12, day: 21 },
    crossesYear: false,
  },
  [ZodiacSign.CAPRICORN]: {
    start: { month: 12, day: 22 },
    end: { month: 1, day: 19 },
    crossesYear: true,
  },
  [ZodiacSign.AQUARIUS]: {
    start: { month: 1, day: 20 },
    end: { month: 2, day: 18 },
    crossesYear: false,
  },
  [ZodiacSign.PISCES]: {
    start: { month: 2, day: 19 },
    end: { month: 3, day: 20 },
    crossesYear: false,
  },
};

function assertValidMonthDay(month: number, day: number): void {
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    throw new RangeError(`Invalid month: ${month}. Expected 1-12.`);
  }
  if (!Number.isInteger(day) || day < 1 || day > 31) {
    throw new RangeError(`Invalid day: ${day}. Expected 1-31.`);
  }

  // Validate against a leap year so Feb 29 is allowed.
  const date = new Date(Date.UTC(2000, month - 1, day));
  if (date.getUTCMonth() + 1 !== month || date.getUTCDate() !== day) {
    throw new RangeError(`Invalid calendar date: ${month}/${day}.`);
  }
}

function monthDayToKey(month: number, day: number): number {
  return month * 100 + day;
}

function isWithinRange(key: number, range: ZodiacDateRange): boolean {
  const startKey = monthDayToKey(range.start.month, range.start.day);
  const endKey = monthDayToKey(range.end.month, range.end.day);

  if (!range.crossesYear) {
    return key >= startKey && key <= endKey;
  }

  // Cross-year ranges (e.g., Capricorn): [start..12/31] OR [1/1..end]
  return key >= startKey || key <= endKey;
}

/**
 * Returns the tropical (Western) zodiac date range for a given sign.
 *
 * Dates are month/day only and are inclusive on both ends.
 */
export function getZodiacDateRange(sign: ZodiacSign): ZodiacDateRange {
  return ZODIAC_DATE_RANGES[sign];
}

/**
 * Returns the tropical (Western) zodiac sign for a given calendar date.
 *
 * You can pass either:
 * - a `Date` (uses UTC month/day to avoid local timezone shifts), or
 * - a `{ month, day }` pair.
 */
export function getZodiacSignFromDate(
  date: Date | MonthDay | string,
): ZodiacSign {
  const resolved: Date | MonthDay =
    typeof date === "string" ? parseMonthDayString(date) : date;

  const month =
    resolved instanceof Date ? resolved.getUTCMonth() + 1 : resolved.month;
  const day = resolved instanceof Date ? resolved.getUTCDate() : resolved.day;

  assertValidMonthDay(month, day);

  const key = monthDayToKey(month, day);
  for (const [sign, range] of Object.entries(ZODIAC_DATE_RANGES)) {
    if (isWithinRange(key, range)) return sign as ZodiacSign;
  }

  // Should be unreachable because the 12 ranges cover the whole year.
  throw new Error(`Unreachable: no zodiac sign matched for ${month}/${day}.`);
}
