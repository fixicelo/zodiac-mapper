/**
 * Normalizes a string for zodiac sign matching.
 * - Converts to lowercase
 * - Removes diacritics/accents (NFD normalization)
 * - Trims whitespace
 *
 * @param str The string to normalize
 * @returns The normalized string
 */
export function normalizeName(str: string): string {
  if (!str) return "";
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}
