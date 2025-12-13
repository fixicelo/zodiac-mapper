# zodiac-mapper
A lightweight, zero-dependency TypeScript NPM package that maps **zodiac sign names in dozens of languages and regional variants** to a standardized `ZodiacSign` enum.

Perfect for internationalized astrology apps, horoscope tools, multilingual chatbots, or any project needing robust zodiac name recognition.

Supports **50+ locales** including English, Chinese, Japanese, German, French, Spanish, Arabic, Persian, Russian, Greek, Hebrew, and more.

Data note: the built-in locale alias dataset was generated and curated with AI assistance. While we try to keep it accurate and conventional, it may contain mistakes or regional variations—please open an issue/PR if you spot a problem.

## Features

- Map any language variant → standard zodiac enum
- Case-insensitive, accent-insensitive, and whitespace-tolerant matching
- Find the first or all zodiac mentions in a text string
- No external dependencies
- Fully typed with TypeScript

## Usage

```ts
import {
  createZodiacMatcher,
  findAllZodiacInText,
  findFirstZodiacInText,
  getZodiacSign,
  getSupportedLocales,
  ZodiacSign,
} from "zodiac-mapper";

// 1) Map a single name to a ZodiacSign (or null if unknown)
getZodiacSign("Taureau") === ZodiacSign.TAURUS;
getZodiacSign("Unknown") === null;

// 2) Scan text: find the first match (or null if none)
const first = findFirstZodiacInText("My sign is Löwe");
// first => { sign: ZodiacSign.LEO, match: "Löwe", index: 11 }

// 3) Scan text: find all matches (empty array if none)
const all = findAllZodiacInText("Aries, Taurus, and Löwe");
// all => [
//   { sign: ZodiacSign.ARIES, match: "Aries", index: 0 },
//   { sign: ZodiacSign.TAURUS, match: "Taurus", index: 7 },
//   { sign: ZodiacSign.LEO, match: "Löwe", index: 19 },
// ]

// Inspect available locale data keys
const locales = getSupportedLocales();
// locales => ["en", "fr", "de", ...]

// 4) Reuse a matcher with fixed options (saves repeated option passing)
const ptOnly = createZodiacMatcher({ includeLocales: ["pt"] });
ptOnly.getZodiacSign("Áries") === ZodiacSign.ARIES;
```

### Locale Filtering (include / exclude)

When scanning free text, limiting languages can reduce false positives.

```ts
// Only match Portuguese
getZodiacSign("Áries", { includeLocales: ["pt"] });

// Scan text but exclude Portuguese
findFirstZodiacInText("I am Áries", { excludeLocales: ["pt"] });
```

Notes:
- Locales are treated as BCP-47 tags; tags like `zh-Hant` will be treated as `zh` for filtering.
- `symbols` is a special built-in pseudo-locale key (not a BCP-47 tag).
- The default is permissive (all locales). This is great for astrology-specific text, but can be noisy in general-purpose text.