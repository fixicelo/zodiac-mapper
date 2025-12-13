import { ZodiacSign } from "../ZodiacSign";

import { ZODIAC_PER_LOCALE } from "./languages";

export const ZODIAC_ALIASES: Record<ZodiacSign, string[]> = {
  [ZodiacSign.ARIES]: [],
  [ZodiacSign.TAURUS]: [],
  [ZodiacSign.GEMINI]: [],
  [ZodiacSign.CANCER]: [],
  [ZodiacSign.LEO]: [],
  [ZodiacSign.VIRGO]: [],
  [ZodiacSign.LIBRA]: [],
  [ZodiacSign.SCORPIO]: [],
  [ZodiacSign.SAGITTARIUS]: [],
  [ZodiacSign.CAPRICORN]: [],
  [ZodiacSign.AQUARIUS]: [],
  [ZodiacSign.PISCES]: [],
};

for (const localeData of Object.values(ZODIAC_PER_LOCALE)) {
  for (const [sign, aliases] of Object.entries(localeData)) {
    ZODIAC_ALIASES[sign as ZodiacSign].push(...aliases);
  }
}
