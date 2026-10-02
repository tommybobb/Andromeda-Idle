// The action loop. One action can be active at a time (as in Melvor); farming
// runs alongside on real timestamps. advance(ms) is deterministic in time, so
// the same code powers live play and offline catch-up.

import { G } from './state.js';
import { SKILLS, getAction } from '../data/skills.js';
import { ITEMS } from '../data/items.js';
import { SHIPS } from '../data/ships.js';
import { COMPANION_BY_SKILL } from '../data/companions.js';
import { emit } from '../core/events.js';
import { chance, randInt, weightedPick, clamp } from '../core/util.js';
import { mod, invalidateMods } from './modifiers.js';
import { skillLevel, masteryLevel, addXP, addMasteryXP } from './progress.js';
import * as bank from './bank.js';
import { rollSystem, recordSystem } from './exploration.js';

const STUN_MS = 3000;
const REGEN_MS = 10000;

export function notify(msg, type = 'info') {
  if (G.silent) {
    if (G.summary && type === 'stop') G.summary.stopped = msg;
    return;
  }
  emit('notify', { msg, type });
}

// ---------------------------------------------------------------------------
// Derived values

export function perks(skillId, actionId) {
  const fn = SKILLS[skillId].perks;
  return fn ? fn(masteryLevel(skillId, actionId)) : {};
}

export function actMod(skillId, act, key) {
  return mod(key, skillId) + (perks(skillId, act.id)[key] || 0);
}

export const doubleChance = (skillId, act) => clamp(actMod(skillId, act, 'double'), 0, 100);
export const preserveChance = (skillId, act) => clamp(actMod(skillId, act, 'preserve'), 0, 80);

export function actionInterval(skillId, act) {
  let ms = act.interval * (1 + mod('interval', skillId) / 100);
  if ((skillId === 'mining' || skillId === 'gas') && masteryLevel(skillId, act.id) >= 99) ms -= 200;
  return Math.max(250, act.interval * 0.25, ms);
}

export function rockMax(act) {
  return 5 + Math.floor(actMod('mining', act, 'integrity'));
}

export function getRock(act) {
  const S = G.state;
  const max = rockMax(act);
  let r = S.rocks[act.id];
  if (!r) r = S.rocks[act.id] = { hp: max, regenAt: S.time, respawnAt: 0 };
  if (r.respawnAt) {
    if (S.time >= r.respawnAt) {
      r.hp = max;
      r.respawnAt = 0;
      r.regenAt = S.time;
    }
  } else if (r.hp < max) {
    const n = Math.floor((S.time - r.regenAt) / REGEN_MS);
    if (n > 0) {
      r.hp = Math.min(max, r.hp + n);
      r.regenAt += n * REGEN_MS;
    }
  } else {
    r.hp = max;
    r.regenAt = S.time;
  }
  return r;
}

export function respawnTime(act) {
  return act.respawn * (1 + mod('respawn', 'mining') / 100);
}

export function finesse(act) {
  return skillLevel('salvaging') + actMod('salvaging', act, 'stealth');
}

// Melvor thieving style: (100 + stealth) / (100 + perception)
export function salvageChance(act) {
  return clamp(((100 + finesse(act)) / (100 + act.perception)) * 100, 0, 100);
}

export function tonnage(act) {
  const ship = SHIPS[G.state.ships.active];
  const base = (ship?.tonnage || 0) + mod('tonnage');
  const pctBonus = mod('tonnagePct', 'trading') + (act ? perks('trading', act.id).tonnagePct || 0 : 0);
  return Math.max(1, Math.floor(base * (1 + pctBonus / 100)));
}

export function tradeValue(act, units) {
  const profit = actMod('trading', act, 'tradeProfit');
  return Math.floor(units * ITEMS[act.commodity].sell * act.margin * (1 + profit / 100));
}

// ---------------------------------------------------------------------------
// Starting and stopping

export function canStart(skillId, actionId) {
  const sk = SKILLS[skillId];
  const act = getAction(skillId, actionId);
  if (!act) return { ok: false, reason: 'Unknown action.' };
  if (skillLevel(skillId) < act.level) return { ok: false, reason: `Requires ${sk.name} level ${act.level}.` };
  if (sk.handler === 'trade') {
    if (bank.qty(act.commodity) < 1) return { ok: false, reason: `You have no ${ITEMS[act.commodity].name} to trade.` };
    return { ok: true };
  }
  if (act.ship && G.state.ships.owned.includes(act.ship)) return { ok: false, reason: `You already own the ${SHIPS[act.ship].name}.` };
  if (act.inputs?.length && !bank.hasAll(act.inputs)) {
    const missing = act.inputs.filter((i) => bank.qty(i.id) < i.qty).map((i) => ITEMS[i.id].name);
    return { ok: false, reason: `${sk.handler === 'explore' ? 'Not enough fuel' : 'Missing materials'}: ${missing.join(', ')}.` };
  }
  return { ok: true };
}

export function startAction(skillId, actionId) {
  const S = G.state;
  if (S.active && S.active.skill === skillId && S.active.action === actionId) {
    stopAction();
    return false;
  }
  const check = canStart(skillId, actionId);
  if (!check.ok) {
    notify(check.reason, 'bad');
    return false;
  }
  S.active = { skill: skillId, action: actionId, progress: 0, stunUntil: 0 };
  emit('action', S.active);
  return true;
}

export function stopAction(reason) {
  const S = G.state;
  if (!S.active) return;
  S.active = null;
  emit('action', null);
  if (reason) notify(reason, 'stop');
}

function blockedUntil(a) {
  let t = a.stunUntil || 0;
  if (a.skill === 'mining') {
    const r = getRock(getAction('mining', a.action));
    if (r.respawnAt > t) t = r.respawnAt;
  }
  return t;
}

// What the active action is waiting on, for the interface.
export function activeBlock() {
  const a = G.state.active;
  if (!a) return null;
  const until = blockedUntil(a);
  if (until <= G.state.time) return null;
  return { until, reason: a.skill === 'mining' && !(a.stunUntil > G.state.time) ? 'Asteroid depleted, respawning' : 'Systems rebooting' };
}

// ---------------------------------------------------------------------------
// Main loop

export function advance(dt) {
  const S = G.state;
  let remaining = dt;
  let guard = 0;
  while (remaining > 0 && guard++ < 500000) {
    const a = S.active;
    if (!a) {
      S.time += remaining;
      break;
    }
    const block = blockedUntil(a);
    if (block > S.time) {
      const wait = Math.min(remaining, block - S.time);
      a.progress = 0;
      S.time += wait;
      remaining -= wait;
      continue;
    }
    const act = getAction(a.skill, a.action);
    const interval = actionInterval(a.skill, act);
    const need = interval - a.progress;
    if (remaining >= need) {
      S.time += need;
      remaining -= need;
      a.progress = 0;
      completeAction(a, act, interval);
    } else {
      a.progress += remaining;
      S.time += remaining;
      remaining = 0;
    }
  }
}

function completeAction(a, act, interval) {
  const sk = SKILLS[a.skill];
  if (skillLevel(a.skill) < act.level) return stopAction('Requirements no longer met.');
  HANDLERS[sk.handler](a.skill, act, interval, a);
}

// Shared rewards for any successful action.
function reward(skillId, act, interval, xp = act.xp) {
  addXP(skillId, xp);
  addMasteryXP(skillId, act.id, interval);
  useBooster(skillId);
  useBooster('global');
  rollCompanion(skillId, interval);
  const st = G.state.stats;
  st.actions[skillId] = (st.actions[skillId] || 0) + 1;
  emit('complete', { skill: skillId, action: act.id });
}

function found(id, n) {
  const f = G.state.stats.found;
  f[id] = (f[id] || 0) + n;
}

function gather(skillId, act, interval) {
  const sk = SKILLS[skillId];
  const out = act.outputs[0];
  let n = out.qty + Math.floor(actMod(skillId, act, 'yield'));
  if (chance(doubleChance(skillId, act))) {
    n *= 2;
    G.state.stats.doubled++;
  }
  if (!bank.add(out.id, n)) return stopAction('Cargo hold is full.');
  G.state.stats.produced += n;
  if (skillId === 'mining') {
    if (chance(sk.gemChance * (1 + mod('gemChance') / 100))) {
      const [gem] = weightedPick(sk.gems);
      if (bank.add(gem, 1)) found(gem, 1);
    }
    const rock = getRock(act);
    rock.hp -= 1;
    if (rock.hp <= 0) {
      rock.hp = 0;
      rock.respawnAt = G.state.time + respawnTime(act);
      G.state.stats.rocksDepleted++;
    }
  }
  if (sk.special && chance(sk.special.chance * (1 + mod('rare') / 100))) {
    if (bank.add(sk.special.item, 1)) found(sk.special.item, 1);
  }
  reward(skillId, act, interval);
}

function salvage(skillId, act, interval, a) {
  const sk = SKILLS[skillId];
  if (!chance(salvageChance(act))) {
    a.stunUntil = G.state.time + STUN_MS;
    G.state.stats.salvageFail++;
    emit('salvagefail', { action: act.id });
    return;
  }
  G.state.stats.salvageSuccess++;
  const credits = randInt(act.credits[0], act.credits[1]) * (1 + mod('salvageCredits', skillId) / 100);
  bank.addCredits(credits, 'salvage');
  if (chance(sk.lootChance)) {
    const [id, , lo, hi] = weightedPick(act.loot);
    let n = randInt(lo, hi);
    if (chance(doubleChance(skillId, act))) n *= 2;
    if (bank.add(id, n)) found(id, n);
    else notify('Cargo hold is full. Salvage was left behind.', 'bad');
  }
  reward(skillId, act, interval);
}

function explore(skillId, act, interval) {
  const sk = SKILLS[skillId];
  if (!bank.hasAll(act.inputs)) return stopAction(`Out of fuel for ${act.name}.`);
  const out = act.outputs[0];
  if (!bank.canAdd(out.id)) return stopAction('Cargo hold is full.');
  if (act.inputs.length) {
    if (chance(preserveChance(skillId, act))) G.state.stats.preserved++;
    else bank.removeAll(act.inputs);
  }
  let n = out.qty;
  if (chance(doubleChance(skillId, act))) n *= 2;
  bank.add(out.id, n);
  const sys = rollSystem(act, sk.notable, actMod(skillId, act, 'discovery'));
  for (const f of sys.finds) {
    if (bank.add(f.item, 1, { toast: false })) found(f.item, 1);
  }
  recordSystem(sys);
  if (sys.finds.length) emit('discovery', sys);
  if (chance(sk.rareChance * (1 + mod('rare') / 100))) {
    const [id, , lo, hi] = weightedPick(act.loot);
    const qty = randInt(lo, hi);
    if (bank.add(id, qty)) found(id, qty);
  }
  reward(skillId, act, interval);
}

function craft(skillId, act, interval) {
  if (act.ship && G.state.ships.owned.includes(act.ship)) return stopAction(`You already own the ${SHIPS[act.ship].name}.`);
  if (!bank.hasAll(act.inputs)) return stopAction(`Out of materials for ${act.name}.`);
  if (act.outputs && !bank.canAddAll(act.outputs)) return stopAction('Cargo hold is full.');
  if (chance(preserveChance(skillId, act))) G.state.stats.preserved++;
  else bank.removeAll(act.inputs);
  if (act.ship) {
    grantShip(act.ship);
    reward(skillId, act, interval);
    return stopAction(`The ${SHIPS[act.ship].name} has rolled out of the shipyard. Find it in your Hangar.`);
  }
  const mult = chance(doubleChance(skillId, act)) ? 2 : 1;
  if (mult === 2) G.state.stats.doubled++;
  for (const o of act.outputs) {
    bank.add(o.id, o.qty * mult);
    G.state.stats.produced += o.qty * mult;
  }
  reward(skillId, act, interval);
}

function trade(skillId, act, interval) {
  const units = Math.min(bank.qty(act.commodity), tonnage(act));
  if (units < 1) return stopAction(`No ${ITEMS[act.commodity].name} left to trade.`);
  bank.remove(act.commodity, units);
  const value = tradeValue(act, units);
  bank.addCredits(value, 'trade');
  G.state.stats.tradeRuns++;
  G.state.stats.tradeProfit += value;
  emit('trade', { action: act.id, units, value });
  reward(skillId, act, interval);
}

const HANDLERS = { gather, salvage, explore, craft, trade };

// ---------------------------------------------------------------------------
// Ships granted by Engineering (purchases live in hangar.js)

export function grantShip(shipId) {
  const S = G.state;
  if (S.ships.owned.includes(shipId)) return;
  S.ships.owned.push(shipId);
  S.ships.loadouts[shipId] = S.ships.loadouts[shipId] || {};
  emit('ships', shipId);
}

// ---------------------------------------------------------------------------
// Boosters

export function boosterCharges(itemId) {
  const base = ITEMS[itemId].booster.charges;
  return Math.round(base * (1 + mod('boosterCharges', 'chemistry') / 100));
}

export function activateBooster(itemId) {
  const item = ITEMS[itemId];
  if (!item?.booster || !bank.has(itemId)) return false;
  const slot = item.booster.skill;
  bank.remove(itemId, 1);
  const cur = G.state.boosters[slot];
  if (cur && cur.item === itemId) cur.charges += boosterCharges(itemId);
  else G.state.boosters[slot] = { item: itemId, charges: boosterCharges(itemId) };
  invalidateMods();
  emit('boosters', slot);
  return true;
}

export function clearBooster(slot) {
  delete G.state.boosters[slot];
  invalidateMods();
  emit('boosters', slot);
}

export function useBooster(slot) {
  const b = G.state.boosters[slot];
  if (!b) return;
  b.charges -= 1;
  if (b.charges > 0) return;
  if (bank.qty(b.item) > 0) {
    bank.remove(b.item, 1);
    b.charges += boosterCharges(b.item);
    return;
  }
  const name = ITEMS[b.item].name;
  delete G.state.boosters[slot];
  invalidateMods();
  emit('boosters', slot);
  notify(`${name} has run out.`, 'info');
}

// ---------------------------------------------------------------------------
// Companions

function grantCompanion(comp) {
  G.state.companions[comp.id] = G.state.time;
  invalidateMods();
  if (G.summary) G.summary.companions.push(comp.id);
  emit('companion', comp);
}

export function companionChance(skillId, intervalMs) {
  const lvl = skillLevel(skillId);
  return ((intervalMs / 1000) * (lvl + 50)) / (100 * 300000) * (1 + mod('rare') / 100);
}

export function rollCompanion(skillId, intervalMs) {
  const S = G.state;
  const comp = COMPANION_BY_SKILL[skillId];
  if (comp && !S.companions[comp.id] && Math.random() < companionChance(skillId, intervalMs)) grantCompanion(comp);
  if (SKILLS[skillId].ship && !S.companions.ace && Math.random() < companionChance('piloting', intervalMs) / 2) {
    grantCompanion(COMPANION_BY_SKILL.piloting);
  }
}
