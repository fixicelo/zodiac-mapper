import { ZODIAC_PER_LOCALE } from "./data/languages";
import { normalizeName } from "./utils/normalization";
import type { ZodiacSign } from "./ZodiacSign";

export interface ZodiacMatcherOptions {
  /**
   * Locales to include (generally BCP-47 tags). If omitted, all locales are included.
   * Note: `symbols` is a special built-in pseudo-locale key (not a BCP-47 tag).
   * Examples: ["en"], ["ja"], ["zh"], ["fil"], ["symbols"].
   */
  includeLocales?: string[];
  /**
   * Locales to exclude (generally BCP-47 tags). Applied after includeLocales.
   * Note: `symbols` is a special built-in pseudo-locale key (not a BCP-47 tag).
   */
  excludeLocales?: string[];
}

// Cache for the reverse map(s) (Normalized Alias -> ZodiacSign)
const reverseMapCache = new Map<string, Map<string, ZodiacSign>>();

// Cache for the search regex(es)
const searchRegexCache = new Map<string, RegExp>();

/**
 * Builds the reverse map for O(1) lookup.
 * Maps normalized aliases to ZodiacSign.
 */
function getReverseMap(
  options?: ZodiacMatcherOptions,
): Map<string, ZodiacSign> {
  const cacheKey = getLocaleFilterCacheKey(options);
  const cached = reverseMapCache.get(cacheKey);
  if (cached) return cached;

  const localeData = getLocaleDataForOptions(options);
  const map = new Map<string, ZodiacSign>();
  for (const signMap of Object.values(localeData)) {
    for (const [sign, aliases] of Object.entries(signMap)) {
      for (const alias of aliases) {
        const normalized = normalizeName(alias);
        if (normalized) {
          map.set(normalized, sign as ZodiacSign);
        }
      }
    }
  }

  reverseMapCache.set(cacheKey, map);
  return map;
}

/**
 * Builds the regex for searching zodiac signs in text.
 * Includes both original and normalized forms to support accent-insensitive matching.
 */
function getSearchRegex(options?: ZodiacMatcherOptions): RegExp {
  const cacheKey = getLocaleFilterCacheKey(options);
  const cached = searchRegexCache.get(cacheKey);
  if (cached) return cached;

  const terms = new Set<string>();
  const addAliases = (aliases: string[]) => {
    for (const alias of aliases) {
      if (!alias) continue;
      terms.add(alias.trim());
      terms.add(normalizeName(alias));
    }
  };

  const localeData = getLocaleDataForOptions(options);
  for (const signMap of Object.values(localeData)) {
    for (const aliases of Object.values(signMap)) {
      addAliases(aliases);
    }
  }

  // Sort by length descending to match longest terms first
  const sortedTerms = Array.from(terms).sort((a, b) => b.length - a.length);

  // Escape regex special characters
  const escapedTerms = sortedTerms.map((term) =>
    term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
  );

  // Note: keep the regex permissive, then apply a boundary check for Latin-like
  // matches after the fact (to avoid partial matches like "Leo" in "Leopard").

  const pattern = escapedTerms.join("|");
  // We use 'i' flag for case insensitivity.
  const regex = new RegExp(pattern, "gi");
  searchRegexCache.set(cacheKey, regex);
  return regex;
}

/**
 * Returns the ZodiacSign for a given name (case-insensitive, accent-insensitive).
 * @param name The name to look up (e.g. "Aries", "Bélier", "白羊座")
 * @returns The ZodiacSign enum or null if not found.
 */
export function getZodiacSign(
  name: string,
  options?: ZodiacMatcherOptions,
): ZodiacSign | null {
  if (!name) return null;
  const normalized = normalizeName(name);
  const map = getReverseMap(options);
  return map.get(normalized) ?? null;
}

export interface ZodiacMatcher {
  getZodiacSign(name: string): ZodiacSign | null;
  findFirstZodiacInText(text: string): ZodiacMatch | null;
  findAllZodiacInText(text: string): ZodiacMatch[];
}

/**
 * Creates a matcher bound to a specific set of options.
 * Useful when you repeatedly scan text with the same locale filtering configuration.
 */
export function createZodiacMatcher(
  options?: ZodiacMatcherOptions,
): ZodiacMatcher {
  return {
    getZodiacSign: (name) => getZodiacSign(name, options),
    findFirstZodiacInText: (text) => findFirstZodiacInText(text, options),
    findAllZodiacInText: (text) => findAllZodiacInText(text, options),
  };
}

/** Returns all locale keys supported by the built-in data (including `symbols`). */
export function getSupportedLocales(): string[] {
  return Object.keys(ZODIAC_PER_LOCALE).slice().sort();
}

export interface ZodiacMatch {
  sign: ZodiacSign;
  match: string;
  index: number;
}

function findZodiacMatchesInText(
  text: string,
  options: ZodiacMatcherOptions | undefined,
  limit?: number,
): ZodiacMatch[] {
  if (!text) return [];
  const regex = getSearchRegex(options);

  const results: ZodiacMatch[] = [];
  const matches = text.matchAll(regex);

  for (const match of matches) {
    const matchedString = match[0];
    const index = match.index;

    // Check word boundaries for Latin-like matches
    if (isLatin(matchedString)) {
      const charBefore = index > 0 ? text[index - 1] : " ";
      const charAfter =
        index + matchedString.length < text.length
          ? text[index + matchedString.length]
          : " ";
      if (isWordChar(charBefore) || isWordChar(charAfter)) {
        continue; // Skip partial matches like "Leo" in "Leopard"
      }
    }

    const sign = getZodiacSign(matchedString, options);
    if (sign) {
      results.push({ sign, match: matchedString, index });
      if (limit !== undefined && results.length >= limit) break;
    }
  }

  return results;
}

/**
 * Finds the first occurrence of a zodiac sign in the given text.
 * @param text The text to search.
 * @returns The first match or null.
 */
export function findFirstZodiacInText(
  text: string,
  options?: ZodiacMatcherOptions,
): ZodiacMatch | null {
  return findZodiacMatchesInText(text, options, 1)[0] ?? null;
}

/**
 * Finds all occurrences of zodiac signs in the given text.
 * @param text The text to search.
 * @returns An array of matches.
 */
export function findAllZodiacInText(
  text: string,
  options?: ZodiacMatcherOptions,
): ZodiacMatch[] {
  return findZodiacMatchesInText(text, options);
}

/**
 * Returns the list of names/aliases for a given zodiac sign in a specific locale.
 * @param sign The zodiac sign.
 * @param locale The locale code (e.g. "en", "zh", "es").
 * @returns An array of names, or empty array if locale/sign not found.
 */
export function getZodiacNames(sign: ZodiacSign, locale: string): string[] {
  const canonical = canonicalizeLocale(locale);
  const base = getBaseLanguage(locale);

  // Try exact match (canonical)
  if (ZODIAC_PER_LOCALE[canonical]?.[sign]) {
    return ZODIAC_PER_LOCALE[canonical][sign];
  }
  // Try base language
  if (ZODIAC_PER_LOCALE[base]?.[sign]) {
    return ZODIAC_PER_LOCALE[base][sign];
  }

  return [];
}

// Helper to check if a string is Latin-script (approximate)
function isLatin(str: string): boolean {
  return /^[a-zA-Z\u00C0-\u00FF]+$/.test(str);
}

// Helper to check if a char is a word character
function isWordChar(char: string): boolean {
  return /[\w\u00C0-\u00FF]/.test(char);
}

function canonicalizeLocale(tag: string): string {
  const trimmed = tag.trim();
  if (!trimmed) return "";
  if (trimmed.toLowerCase() === "symbols") return "symbols";
  try {
    const canonical = Intl.getCanonicalLocales(trimmed)[0] ?? trimmed;
    return canonical.toLowerCase();
  } catch {
    // If runtime can't canonicalize it, treat it as an opaque key.
    return trimmed.toLowerCase();
  }
}

function getBaseLanguage(tag: string): string {
  const canonical = canonicalizeLocale(tag);
  if (!canonical) return "";
  const base = canonical.split("-")[0] ?? canonical;
  return base.toLowerCase();
}

function normalizeLocaleList(locales?: string[]): string[] {
  const list = locales ?? [];
  const normalized = new Set<string>();
  for (const locale of list) {
    const canonical = canonicalizeLocale(locale);
    if (canonical) normalized.add(canonical);
    const base = getBaseLanguage(locale);
    if (base) normalized.add(base);
  }
  return [...normalized];
}

function getLocaleFilterCacheKey(options?: ZodiacMatcherOptions): string {
  const include = normalizeLocaleList(options?.includeLocales).sort();
  const exclude = normalizeLocaleList(options?.excludeLocales).sort();
  if (include.length === 0 && exclude.length === 0) {
    return "__all__";
  }
  return `inc:${include.join(",")}|exc:${exclude.join(",")}`;
}

function getLocaleDataForOptions(
  options?: ZodiacMatcherOptions,
): Record<string, Record<string, string[]>> {
  const allLocaleKeys = Object.keys(ZODIAC_PER_LOCALE);

  const includeSet = new Set(normalizeLocaleList(options?.includeLocales));
  const excludeSet = new Set(normalizeLocaleList(options?.excludeLocales));

  // Our data keys are lowercase; compare in lowercase.
  const chosen = new Set<string>();
  if (includeSet.size > 0) {
    for (const key of allLocaleKeys) {
      const canonKey = canonicalizeLocale(key);
      const baseKey = getBaseLanguage(key);
      if (includeSet.has(canonKey) || includeSet.has(baseKey)) chosen.add(key);
    }
  } else {
    for (const key of allLocaleKeys) chosen.add(key);
  }

  for (const key of [...chosen]) {
    const canonKey = canonicalizeLocale(key);
    const baseKey = getBaseLanguage(key);
    if (excludeSet.has(canonKey) || excludeSet.has(baseKey)) chosen.delete(key);
  }

  const result: Record<string, Record<string, string[]>> = {};
  for (const key of chosen) {
    result[key] = ZODIAC_PER_LOCALE[key] as unknown as Record<string, string[]>;
  }
  return result;
}
