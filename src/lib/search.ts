export function normalizeSearchQuery(query: string): string | null {
  const normalized = query.trim();
  const nonWhitespaceCharacters = normalized.match(/\S/gu) ?? [];

  return nonWhitespaceCharacters.length >= 2 ? normalized : null;
}