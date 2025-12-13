import { describe, expect, it } from "vitest";
import {
  getZodiacDateRange,
  getZodiacSignFromDate,
  ZodiacSign,
} from "../src/index";

describe("date-based zodiac", () => {
  it("returns correct date range for a sign", () => {
    expect(getZodiacDateRange(ZodiacSign.ARIES)).toEqual({
      start: { month: 3, day: 21 },
      end: { month: 4, day: 19 },
      crossesYear: false,
    });

    expect(getZodiacDateRange(ZodiacSign.CAPRICORN)).toEqual({
      start: { month: 12, day: 22 },
      end: { month: 1, day: 19 },
      crossesYear: true,
    });
  });

  it("maps month/day to the correct sign (inclusive boundaries)", () => {
    expect(getZodiacSignFromDate({ month: 3, day: 21 })).toBe(ZodiacSign.ARIES);
    expect(getZodiacSignFromDate({ month: 4, day: 19 })).toBe(ZodiacSign.ARIES);
    expect(getZodiacSignFromDate({ month: 4, day: 20 })).toBe(
      ZodiacSign.TAURUS,
    );

    expect(getZodiacSignFromDate({ month: 12, day: 22 })).toBe(
      ZodiacSign.CAPRICORN,
    );
    expect(getZodiacSignFromDate({ month: 1, day: 19 })).toBe(
      ZodiacSign.CAPRICORN,
    );
    expect(getZodiacSignFromDate({ month: 1, day: 20 })).toBe(
      ZodiacSign.AQUARIUS,
    );

    // Test Gemini/Cancer boundary
    expect(getZodiacSignFromDate({ month: 6, day: 21 })).toBe(
      ZodiacSign.GEMINI,
    );
    expect(getZodiacSignFromDate({ month: 6, day: 22 })).toBe(
      ZodiacSign.CANCER,
    );

    // Test Libra/Scorpio boundary
    expect(getZodiacSignFromDate({ month: 10, day: 23 })).toBe(
      ZodiacSign.LIBRA,
    );
    expect(getZodiacSignFromDate({ month: 10, day: 24 })).toBe(
      ZodiacSign.SCORPIO,
    );
  });

  it("accepts Date input (using UTC month/day)", () => {
    expect(getZodiacSignFromDate(new Date("2000-03-21"))).toBe(
      ZodiacSign.ARIES,
    );
    expect(getZodiacSignFromDate(new Date("2000-12-31"))).toBe(
      ZodiacSign.CAPRICORN,
    );
  });

  it("accepts string input (timezone-independent)", () => {
    expect(getZodiacSignFromDate("2000-03-21")).toBe(ZodiacSign.ARIES);
    expect(getZodiacSignFromDate("03-21")).toBe(ZodiacSign.ARIES);
    expect(getZodiacSignFromDate("12-31")).toBe(ZodiacSign.CAPRICORN);
  });

  it("rejects invalid dates", () => {
    expect(() => getZodiacSignFromDate({ month: 0, day: 1 })).toThrow();
    expect(() => getZodiacSignFromDate({ month: 13, day: 1 })).toThrow();
    expect(() => getZodiacSignFromDate({ month: 2, day: 30 })).toThrow();
  });
});
