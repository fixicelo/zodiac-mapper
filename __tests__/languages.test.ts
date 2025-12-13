import { describe, expect, it } from "vitest";
import { getZodiacSign, ZodiacSign } from "../src";

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
