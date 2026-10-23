/** True when the URL segment should load a single experience (detail) instead of a city listing. */
export function isExperienceDetailSegment(segment: string): boolean {
  const s = segment?.trim() ?? '';
  if (!s) return false;
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s)) return true;
  if (/^[a-f0-9]{24}$/i.test(s)) return true;
  return false;
}
