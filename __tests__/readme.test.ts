import { describe, expect, it } from "vitest";
import {
  createZodiacMatcher,
  findAllZodiacInText,
  findFirstZodiacInText,
  getSupportedLocales,
  getZodiacSign,
  ZodiacSign,
} from "../src/index";

describe("README examples", () => {
  it("Usage snippet stays correct", () => {
    expect(getZodiacSign("Taureau")).toBe(ZodiacSign.TAURUS);
    expect(getZodiacSign("Unknown")).toBeNull();
    const first = findFirstZodiacInText("My sign is Löwe");
    expect(first).toEqual({ sign: ZodiacSign.LEO, match: "Löwe", index: 11 });

    const all = findAllZodiacInText("Aries, Taurus, and Löwe");
    expect(all).toEqual([
      { sign: ZodiacSign.ARIES, match: "Aries", index: 0 },
      { sign: ZodiacSign.TAURUS, match: "Taurus", index: 7 },
      { sign: ZodiacSign.LEO, match: "Löwe", index: 19 },
    ]);

    // Inspect available locale data keys
    const locales = getSupportedLocales();
    expect(locales).toContain("pt");

    // Reuse a matcher with fixed options (saves repeated option passing)
    const ptOnly = createZodiacMatcher({ includeLocales: ["pt"] });
    expect(ptOnly.getZodiacSign("Áries")).toBe(ZodiacSign.ARIES);
  });

  it("Locale filtering snippet stays correct", () => {
    // Only match Portuguese
    expect(getZodiacSign("Áries", { includeLocales: ["pt"] })).toBe(
      ZodiacSign.ARIES,
    );

    // Scan text but exclude Portuguese
    expect(
      findFirstZodiacInText("I am Áries", { excludeLocales: ["pt"] }),
    ).toBeNull();
  });
});
