// Experience curve. The classic idle-game curve:
//   XP(L) = floor( 1/4 * sum_{l=1}^{L-1} floor( l + 300 * 2^(l/7) ) )
// Level 2 = 83 XP, level 99 = 13,034,431 XP.

export const MAX_LEVEL = 99;
export const MAX_MASTERY = 99;

export const XP_TABLE = (() => {
  const table = [0, 0];
  let points = 0;
  for (let l = 1; l < 120; l++) {
    points += Math.floor(l + 300 * Math.pow(2, l / 7));
    table[l + 1] = Math.floor(points / 4);
  }
  return table;
})();

export function xpForLevel(level) {
  return XP_TABLE[Math.max(1, Math.min(level, XP_TABLE.length - 1))];
}

export function levelFromXP(xp, cap = MAX_LEVEL) {
  let lo = 1;
  let hi = cap;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (XP_TABLE[mid] <= xp) lo = mid;
    else hi = mid - 1;
  }
  return lo;
}

// Progress within the current level, for progress bars.
export function levelProgress(xp, cap = MAX_LEVEL) {
  const level = levelFromXP(xp, cap);
  if (level >= cap) return { level, pct: 1, into: xp - XP_TABLE[cap], span: 0, next: XP_TABLE[cap] };
  const a = XP_TABLE[level];
  const b = XP_TABLE[level + 1];
  return { level, pct: (xp - a) / (b - a), into: xp - a, span: b - a, next: b };
}
