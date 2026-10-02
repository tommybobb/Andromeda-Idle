// The live game state lives on G.state. Everything in js/game reads and
// writes it; nothing in here touches the DOM, so the engine can be tested in Node.

import { SKILL_ORDER, SKILLS } from '../data/skills.js';
import { uid } from '../core/util.js';

export const SAVE_VERSION = 1;
export const OFFLINE_CAP_MS = 24 * 60 * 60 * 1000;

export const G = {
  state: null,
  // When true (offline catch-up), the engine records a summary instead of toasting.
  silent: false,
  summary: null,
};

function freshStats() {
  return {
    created: Date.now(),
    playTime: 0,
    offlineTime: 0,
    creditsEarned: 0,
    creditsSpent: 0,
    salesValue: 0,
    itemsSold: 0,
    actions: {},
    produced: 0,
    found: {},
    rocksDepleted: 0,
    salvageSuccess: 0,
    salvageFail: 0,
    tradeRuns: 0,
    tradeProfit: 0,
    harvests: 0,
    cropsFailed: 0,
    preserved: 0,
    doubled: 0,
  };
}

export function newState(name = 'Commander', insignia = 'chevron', accent = 'orange') {
  const skills = {};
  for (const id of SKILL_ORDER) skills[id] = { xp: 0, mastery: {}, pool: 0 };
  const now = Date.now();
  return {
    v: SAVE_VERSION,
    id: uid(),
    name,
    insignia,
    accent,
    created: now,
    time: now,
    credits: 250,
    skills,
    bank: { h_fuel_cell: 5, lumimoss_spores: 9 },
    cargoBought: 0,
    active: null,
    rocks: {},
    farming: { plots: SKILLS.xenobiology.plots.filter((p) => p.cost === 0).map(() => ({ crop: null, plantedAt: 0, gel: 0 })) },
    ships: {
      owned: ['kestrel'],
      active: 'kestrel',
      loadouts: { kestrel: { laser: 'mod_laser_e' } },
    },
    boosters: {},
    research: {},
    companions: {},
    achievements: {},
    explore: { log: [], stars: {}, notable: {}, total: 0 },
    stats: freshStats(),
    settings: {
      starfield: true,
      toasts: true,
      autoReplant: true,
      reduceMotion: false,
    },
    tutorialDismissed: false,
  };
}

// Brings an older or partial save up to the current shape without losing data.
export function migrate(raw) {
  const base = newState(raw.name, raw.insignia, raw.accent);
  const s = { ...base, ...raw };
  s.skills = { ...base.skills };
  for (const id of SKILL_ORDER) s.skills[id] = { ...base.skills[id], ...(raw.skills?.[id] || {}) };
  s.stats = { ...freshStats(), ...(raw.stats || {}) };
  s.settings = { ...base.settings, ...(raw.settings || {}) };
  s.explore = { ...base.explore, ...(raw.explore || {}) };
  s.ships = { ...base.ships, ...(raw.ships || {}) };
  s.ships.loadouts = { ...(raw.ships?.loadouts || base.ships.loadouts) };
  for (const ship of s.ships.owned) if (!s.ships.loadouts[ship]) s.ships.loadouts[ship] = {};
  s.farming = raw.farming?.plots ? raw.farming : base.farming;
  s.bank = raw.bank || {};
  for (const k of Object.keys(s.bank)) if (!(s.bank[k] > 0)) delete s.bank[k];
  if (s.active && !SKILLS[s.active.skill]?.actionMap[s.active.action]) s.active = null;
  if (typeof s.time !== 'number' || !isFinite(s.time)) s.time = Date.now();
  s.v = SAVE_VERSION;
  return s;
}
