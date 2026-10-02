// Station services: market purchases, cargo expansions, the Tech Lab and achievements.

import { G } from './state.js';
import { ITEMS } from '../data/items.js';
import { SHOP_SECTIONS, cargoExpansionCost, CARGO_MAX_EXPANSIONS } from '../data/shop.js';
import { TECH_MAP, techCost } from '../data/research.js';
import { ACHIEVEMENTS } from '../data/achievements.js';
import { SKILLS } from '../data/skills.js';
import { emit } from '../core/events.js';
import { invalidateMods } from './modifiers.js';
import { skillLevel, totalLevel, masteryLevel } from './progress.js';
import { notify } from './engine.js';
import * as bank from './bank.js';

export const SHOP_INDEX = {};
for (const sec of SHOP_SECTIONS) for (const entry of sec.items) SHOP_INDEX[entry.item] = entry;

export function shopLocked(entry) {
  if (!entry.req) return null;
  return skillLevel(entry.req.skill) < entry.req.level ? `Requires ${SKILLS[entry.req.skill].name} ${entry.req.level}` : null;
}

export function buy(itemId, n) {
  const entry = SHOP_INDEX[itemId];
  if (!entry || n < 1) return false;
  const lock = shopLocked(entry);
  if (lock) {
    notify(lock + '.', 'bad');
    return false;
  }
  if (!bank.canAdd(itemId)) {
    notify('Cargo hold is full.', 'bad');
    return false;
  }
  if (!bank.spendCredits(entry.price * n)) {
    notify('Not enough credits.', 'bad');
    return false;
  }
  bank.add(itemId, n, { toast: false });
  return true;
}

export const nextCargoCost = () => cargoExpansionCost(G.state.cargoBought);

export function buyCargoExpansion() {
  if (G.state.cargoBought >= CARGO_MAX_EXPANSIONS) return false;
  if (!bank.spendCredits(nextCargoCost())) {
    notify('Not enough credits.', 'bad');
    return false;
  }
  G.state.cargoBought++;
  emit('cargo');
  return true;
}

export function buyTech(id) {
  const t = TECH_MAP[id];
  const rank = G.state.research[id] || 0;
  if (!t || rank >= t.max) return false;
  if (skillLevel('research') < t.level) {
    notify(`Requires Research level ${t.level}.`, 'bad');
    return false;
  }
  const cost = techCost(t, rank);
  if (bank.qty('research_point') < cost.rp) {
    notify('Not enough Research Points.', 'bad');
    return false;
  }
  if (G.state.credits < cost.credits) {
    notify('Not enough credits.', 'bad');
    return false;
  }
  bank.remove('research_point', cost.rp);
  bank.spendCredits(cost.credits);
  G.state.research[id] = rank + 1;
  invalidateMods();
  emit('research', id);
  return true;
}

// ---------------------------------------------------------------------------
// Achievements

const api = {
  get S() {
    return G.state;
  },
  skillLevel,
  totalLevel,
  shipsOwned: () => G.state.ships.owned.length,
  companionsFound: () => Object.keys(G.state.companions).length,
  maxMasteryLevel() {
    let best = 1;
    for (const id in SKILLS) for (const a of SKILLS[id].actions) best = Math.max(best, masteryLevel(id, a.id));
    return best;
  },
};

export function checkAchievements() {
  const S = G.state;
  const fresh = [];
  for (const a of ACHIEVEMENTS) {
    if (S.achievements[a.id]) continue;
    let done = false;
    try {
      done = a.check(api);
    } catch (err) {
      console.error('achievement', a.id, err);
    }
    if (done) {
      S.achievements[a.id] = Date.now();
      if (a.reward) bank.addCredits(a.reward, 'achievement');
      fresh.push(a);
      emit('achievement', a);
    }
  }
  return fresh;
}

export const itemName = (id) => ITEMS[id]?.name || id;
