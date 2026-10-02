// Aggregates every bonus in the game into one flat table of modifiers.
//
// Keys are either global ("xp", "interval", "tradeProfit") or skill scoped
// ("xp.mining", "double.gas"). mod(key, skill) sums the global value, the
// skill-scoped value and any active mastery pool checkpoints for that skill.
//
// Percentages throughout: interval -10 means 10% faster.

import { G } from './state.js';
import { SKILLS, PILOT_INTERVAL_PER_LEVEL } from '../data/skills.js';
import { ITEMS } from '../data/items.js';
import { SHIPS } from '../data/ships.js';
import { TECHS } from '../data/research.js';
import { COMPANIONS } from '../data/companions.js';
import { levelFromXP } from '../core/xp.js';

let cache = null;

export function invalidateMods() {
  cache = null;
}

function addAll(target, mods, mult = 1) {
  for (const k in mods) target[k] = (target[k] || 0) + mods[k] * mult;
}

function build() {
  const S = G.state;
  const m = {};
  const ship = SHIPS[S.ships.active];
  if (ship) {
    addAll(m, ship.mods);
    const loadout = S.ships.loadouts[ship.id] || {};
    for (const key in loadout) {
      const item = ITEMS[loadout[key]];
      if (item?.module) addAll(m, item.module.mods);
    }
  }
  for (const t of TECHS) {
    const rank = S.research[t.id] || 0;
    if (rank) addAll(m, t.mods, rank);
  }
  for (const c of COMPANIONS) if (S.companions[c.id]) addAll(m, c.mods);
  for (const slot in S.boosters) {
    const b = S.boosters[slot];
    if (b && b.charges > 0 && ITEMS[b.item]?.booster) addAll(m, ITEMS[b.item].booster.mods);
  }
  const pilot = levelFromXP(S.skills.piloting.xp);
  for (const id in SKILLS) {
    if (SKILLS[id].ship) m[`interval.${id}`] = (m[`interval.${id}`] || 0) - pilot * PILOT_INTERVAL_PER_LEVEL;
  }
  return m;
}

export function allMods() {
  if (!cache) cache = build();
  return cache;
}

export function poolCap(skillId) {
  return 500000 * SKILLS[skillId].actions.length;
}

export function poolPct(skillId) {
  const cap = poolCap(skillId);
  return cap ? G.state.skills[skillId].pool / cap : 0;
}

export function poolMod(skillId, key) {
  const pool = SKILLS[skillId]?.pool;
  if (!pool) return 0;
  const p = poolPct(skillId) * 100;
  let v = 0;
  for (const cp of pool) if (p >= cp.pct && cp.mods[key]) v += cp.mods[key];
  return v;
}

export function mod(key, skillId) {
  const m = allMods();
  let v = m[key] || 0;
  if (skillId) {
    v += m[`${key}.${skillId}`] || 0;
    v += poolMod(skillId, key);
  }
  return v;
}

// Human readable labels for modifier keys, used across the interface.
const LABELS = {
  xp: ['XP', '%'],
  mxp: ['Mastery XP', '%'],
  interval: ['interval', '%'],
  double: ['double output chance', '%'],
  preserve: ['preservation chance', '%'],
  yield: ['extra output per action', ''],
  stealth: ['Finesse', ''],
  discovery: ['discovery chance', '%'],
  tonnage: ['trade tonnage', 't'],
  tonnagePct: ['trade tonnage', '%'],
  cargoSlots: ['cargo slots', ''],
  sellPrice: ['market sale prices', '%'],
  tradeProfit: ['trade profit', '%'],
  farmYield: ['harvest yield', '%'],
  growth: ['growth time', '%'],
  integrity: ['asteroid integrity', ''],
  boosterCharges: ['booster charges', '%'],
  salvageCredits: ['salvage credits', '%'],
};

export function describeMods(mods) {
  const out = [];
  for (const [key, val] of Object.entries(mods)) {
    if (!val) continue;
    const [base, skill] = key.split('.');
    const [label, unit] = LABELS[base] || [base, ''];
    const sign = val > 0 ? '+' : '';
    const scope = skill ? `${SKILLS[skill]?.name || skill} ` : '';
    const v = Number(val.toFixed(2));
    out.push(`${sign}${v}${unit} ${scope}${label}`);
  }
  return out;
}
