export const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

export const randInt = (lo, hi) => lo + Math.floor(Math.random() * (hi - lo + 1));

export const chance = (pct) => pct > 0 && Math.random() * 100 < pct;

export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Picks a row from a table of arrays where row[weightIndex] is the weight.
export function weightedPick(table, weightIndex = 1) {
  let total = 0;
  for (const row of table) total += row[weightIndex];
  let roll = Math.random() * total;
  for (const row of table) {
    roll -= row[weightIndex];
    if (roll < 0) return row;
  }
  return table[table.length - 1];
}

const nf = new Intl.NumberFormat('en-GB');
const nf1 = new Intl.NumberFormat('en-GB', { maximumFractionDigits: 1 });
const nf2 = new Intl.NumberFormat('en-GB', { maximumFractionDigits: 2 });

export const fmt = (n) => nf.format(Math.floor(n || 0));
export const fmt1 = (n) => nf1.format(n || 0);
export const fmt2 = (n) => nf2.format(n || 0);

export function fmtShort(n) {
  n = Math.floor(n || 0);
  const a = Math.abs(n);
  if (a < 10000) return nf.format(n);
  if (a < 1e6) return nf1.format(n / 1e3) + 'K';
  if (a < 1e9) return nf2.format(n / 1e6) + 'M';
  if (a < 1e12) return nf2.format(n / 1e9) + 'B';
  return nf2.format(n / 1e12) + 'T';
}

// Long form: "1d 4h", "3h 12m", "4m 05s", "12s"
export function fmtTime(ms) {
  ms = Math.max(0, ms);
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m`;
  if (m > 0) return `${m}m ${String(sec).padStart(2, '0')}s`;
  return `${sec}s`;
}

// Action intervals: "3.00s"
export const fmtSecs = (ms) => (ms / 1000).toFixed(2) + 's';

export const fmtPct = (v, digits = 1) => `${v > 0 ? '+' : ''}${Number(v.toFixed(digits))}%`;

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ESC[c]);

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

export const roman = (n) => ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'][n] || String(n);
