import { describe, expect, it } from "vitest";
import { getZodiacNames, getZodiacSign, ZodiacSign } from "../src";

describe("getZodiacNames", () => {
  it("should return names for a valid locale", () => {
    const names = getZodiacNames(ZodiacSign.ARIES, "en");
    expect(names).toContain("Aries");
    expect(names).toContain("The Ram");
  });

  it("should return names for Chinese", () => {
    const names = getZodiacNames(ZodiacSign.TAURUS, "zh");
    expect(names).toContain("金牛座");
  });

  it("should handle locale fallback (zh-CN -> zh)", () => {
    const names = getZodiacNames(ZodiacSign.GEMINI, "zh-CN");
    expect(names).toContain("双子座");
  });

  it("should return symbols", () => {
    const symbols = getZodiacNames(ZodiacSign.LEO, "symbols");
    expect(symbols).toEqual(["♌"]);
  });

  it("should return empty array for unknown locale", () => {
    const names = getZodiacNames(ZodiacSign.ARIES, "xx-YY");
    expect(names).toEqual([]);
  });
});

describe("New Languages Support", () => {
  it("should support Frisian (fy)", () => {
    expect(getZodiacSign("Stienbok")).toBe(ZodiacSign.CAPRICORN);
    expect(getZodiacSign("Faam")).toBe(ZodiacSign.VIRGO);
  });

  it("should support Latin (la)", () => {
    expect(getZodiacSign("Aries")).toBe(ZodiacSign.ARIES);
    expect(getZodiacSign("Capricornus")).toBe(ZodiacSign.CAPRICORN);
  });

  it("should support Sanskrit (sa)", () => {
    expect(getZodiacSign("Mesha")).toBe(ZodiacSign.ARIES);
  });

  it("should support Esperanto (eo)", () => {
    expect(getZodiacSign("Pesilo")).toBe(ZodiacSign.LIBRA);
  });

  it("should support Manx (gv)", () => {
    expect(getZodiacSign("An Goayr")).toBe(ZodiacSign.CAPRICORN);
  });
});
