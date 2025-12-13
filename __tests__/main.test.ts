import { describe, expect, it } from "vitest";
import {
  createZodiacMatcher,
  findAllZodiacInText,
  findFirstZodiacInText,
  getSupportedLocales,
  getZodiacSign,
  ZodiacSign,
} from "../src/index";

describe("zodiac-mapper", () => {
  it("should map English names", () => {
    expect(getZodiacSign("Aries")).toBe(ZodiacSign.ARIES);
    expect(getZodiacSign("aries")).toBe(ZodiacSign.ARIES);
    expect(getZodiacSign("The Ram")).toBe(ZodiacSign.ARIES);
  });

  it("should map French names", () => {
    expect(getZodiacSign("Bélier")).toBe(ZodiacSign.ARIES);
    expect(getZodiacSign("belier")).toBe(ZodiacSign.ARIES);
  });

  it("should map German names", () => {
    expect(getZodiacSign("Löwe")).toBe(ZodiacSign.LEO);
    expect(getZodiacSign("lowe")).toBe(ZodiacSign.LEO);
    expect(getZodiacSign("Steinbock")).toBe(ZodiacSign.CAPRICORN);
  });

  it("should map Chinese names", () => {
    expect(getZodiacSign("白羊座")).toBe(ZodiacSign.ARIES);
    expect(getZodiacSign("狮子座")).toBe(ZodiacSign.LEO);
    // Pinyin (tone marks are stripped by normalization)
    expect(getZodiacSign("shanyangzuo")).toBe(ZodiacSign.CAPRICORN);
  });

  it("should map Japanese names", () => {
    expect(getZodiacSign("おひつじ座")).toBe(ZodiacSign.ARIES);
  });

  it("should expose supported locales", () => {
    const locales = getSupportedLocales();
    expect(locales).toContain("en");
    expect(locales).toContain("zh");
    expect(locales).toContain("ja");
    expect(locales).toContain("symbols");
  });

  it("should support createZodiacMatcher()", () => {
    const matcher = createZodiacMatcher({ includeLocales: ["ja"] });
    expect(matcher.getZodiacSign("おひつじ座")).toBe(ZodiacSign.ARIES);
  });

  it("should support locale include/exclude options", () => {
    // Exclude Japanese
    expect(getZodiacSign("おひつじ座", { excludeLocales: ["ja"] })).toBeNull();

    // Include only Japanese
    expect(getZodiacSign("おひつじ座", { includeLocales: ["ja"] })).toBe(
      ZodiacSign.ARIES,
    );

    // Canonicalization example: tl -> fil
    expect(getZodiacSign("Pisces", { includeLocales: ["tl"] })).toBe(
      ZodiacSign.PISCES,
    );
  });

  it("should return null for unknown names", () => {
    expect(getZodiacSign("Unknown")).toBeNull();
    expect(getZodiacSign("")).toBeNull();
  });

  it("should find first zodiac in text", () => {
    const text = "My sign is Löwe and hers is Skorpion.";
    const result = findFirstZodiacInText(text);
    expect(result).toEqual({ sign: ZodiacSign.LEO, match: "Löwe", index: 11 });
  });

  it("should find all zodiacs in text", () => {
    const text = "I am a 白羊座, my friend is 金牛座, and another is 獅子座!";
    const results = findAllZodiacInText(text);
    expect(results).toHaveLength(3);
    expect(results[0]).toEqual({
      sign: ZodiacSign.ARIES,
      match: "白羊座",
      index: 7,
    });
    expect(results[1]).toEqual({
      sign: ZodiacSign.TAURUS,
      match: "金牛座",
      index: 25,
    });
    expect(results[2]).toEqual({
      sign: ZodiacSign.LEO,
      match: "獅子座",
      index: 45,
    });
  });

  it("should handle word boundaries in Latin scripts", () => {
    const text = "The leopard is not a Leo.";
    const results = findAllZodiacInText(text);
    // Should only find "Leo" at the end, not inside "leopard"
    expect(results).toHaveLength(1);
    expect(results[0].sign).toBe(ZodiacSign.LEO);
    expect(results[0].match).toBe("Leo");
  });

  it("should handle accent insensitive search", () => {
    const text = "My sign is Lowe."; // User typed "Lowe" instead of "Löwe"
    const result = findFirstZodiacInText(text);
    expect(result).toEqual({ sign: ZodiacSign.LEO, match: "Lowe", index: 11 });
  });

  it("should support locale options for text search", () => {
    const text = "私はおひつじ座です";
    expect(findFirstZodiacInText(text, { includeLocales: ["ja"] })?.sign).toBe(
      ZodiacSign.ARIES,
    );
    expect(findFirstZodiacInText(text, { excludeLocales: ["ja"] })).toBeNull();
  });
});
