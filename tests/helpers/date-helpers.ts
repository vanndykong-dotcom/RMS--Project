const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Parses the app's standard timestamp format, e.g. "01/Oct/2026 09:07 AM", to epoch ms in the
 * test runner's local time (the app renders in the same Asia/Phnom_Penh time the suite runs in).
 */
export function parseRmsDateTime(text: string): number {
  const m = text.match(/(\d{2})\/([A-Z][a-z]{2})\/(\d{4}) (\d{2}):(\d{2}) (AM|PM)/);
  if (!m) throw new Error(`parseRmsDateTime: unrecognised timestamp "${text}"`);
  const hours = (Number(m[4]) % 12) + (m[6] === 'PM' ? 12 : 0);
  return new Date(Number(m[3]), MONTHS.indexOf(m[2]), Number(m[1]), hours, Number(m[5])).getTime();
}

/**
 * The Dashboard's "This Week" window. Whether the app's week starts on Sunday or Monday is
 * still an open question in the backlog (RMS-DASH-06 "week-boundary rule"), so this returns the
 * union of both conventions - Sunday 00:00 of the current week up to Monday 00:00 of the next -
 * rather than guessing one.
 */
export function currentWeekWindow(now = new Date()): { start: number; end: number } {
  const sunday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
  const nextMonday = new Date(sunday.getFullYear(), sunday.getMonth(), sunday.getDate() + 8);
  return { start: sunday.getTime(), end: nextMonday.getTime() };
}
