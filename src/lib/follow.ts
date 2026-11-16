// Exams a visitor follows, kept on their own phone only (localStorage).
// Purely a convenience: if storage is blocked, nothing is followed.

const KEY = "jka_follow";
export const FOLLOW_EVENT = "jka-follow-change";

export function getFollowed(): string[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list.filter((s) => typeof s === "string") : [];
  } catch {
    return [];
  }
}

export function toggleFollow(slug: string): boolean {
  const list = getFollowed();
  const on = !list.includes(slug);
  const next = on ? [slug, ...list] : list.filter((s) => s !== slug);
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next.slice(0, 20)));
  } catch {}
  window.dispatchEvent(new Event(FOLLOW_EVENT));
  return on;
}
