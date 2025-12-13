import { describe, expect, it } from "vitest";
import { getZodiacSign, ZodiacSign } from "../src";

describe("Emoji Support", () => {
  it("should support zodiac emojis", () => {
    expect(getZodiacSign("♈")).toBe(ZodiacSign.ARIES);
    expect(getZodiacSign("♉")).toBe(ZodiacSign.TAURUS);
    expect(getZodiacSign("♊")).toBe(ZodiacSign.GEMINI);
    expect(getZodiacSign("♋")).toBe(ZodiacSign.CANCER);
    expect(getZodiacSign("♌")).toBe(ZodiacSign.LEO);
    expect(getZodiacSign("♍")).toBe(ZodiacSign.VIRGO);
    expect(getZodiacSign("♎")).toBe(ZodiacSign.LIBRA);
    expect(getZodiacSign("♏")).toBe(ZodiacSign.SCORPIO);
    expect(getZodiacSign("♐")).toBe(ZodiacSign.SAGITTARIUS);
    expect(getZodiacSign("♑")).toBe(ZodiacSign.CAPRICORN);
    expect(getZodiacSign("♒")).toBe(ZodiacSign.AQUARIUS);
    expect(getZodiacSign("♓")).toBe(ZodiacSign.PISCES);
  });
});
