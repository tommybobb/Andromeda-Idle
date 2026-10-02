// Xenobiology: hydroponics bays that grow on real (simulated) time.

import { G } from './state.js';
import { SKILLS } from '../data/skills.js';
import { ITEMS } from '../data/items.js';
import { emit } from '../core/events.js';
import { randInt, chance, clamp } from '../core/util.js';
import { mod } from './modifiers.js';
import { skillLevel, addXP, addMasteryXP } from './progress.js';
import { perks, useBooster, rollCompanion, notify } from './engine.js';
import * as bank from './bank.js';

const XENO = 'xenobiology';
export const MAX_GEL = 5;

export const crops = () => SKILLS[XENO].actions;
export const cropById = (id) => SKILLS[XENO].actionMap[id];

export function growthTime(crop) {
  return crop.growth * 1000 * Math.max(0.25, 1 + mod('growth', XENO) / 100);
}

export function plotState(plot) {
  if (!plot.crop) return 'empty';
  return G.state.time >= plot.plantedAt + growthTime(cropById(plot.crop)) ? 'ready' : 'growing';
}

export function timeLeft(plot) {
  if (!plot.crop) return 0;
  return Math.max(0, plot.plantedAt + growthTime(cropById(plot.crop)) - G.state.time);
}

export function survivalChance(plot) {
  const p = perks(XENO, plot.crop);
  return clamp(50 + plot.gel * 10 + (p.success || 0) + mod('growSuccess', XENO), 0, 100);
}

export function canPlant(cropId) {
  const crop = cropById(cropId);
  if (!crop) return { ok: false, reason: 'Unknown crop.' };
  if (skillLevel(XENO) < crop.level) return { ok: false, reason: `Requires Xenobiology level ${crop.level}.` };
  if (bank.qty(crop.seed) < crop.seedQty) return { ok: false, reason: `Requires ${crop.seedQty} ${ITEMS[crop.seed].name}.` };
  return { ok: true };
}

export function plant(index, cropId) {
  const plot = G.state.farming.plots[index];
  if (!plot || plot.crop) return false;
  const check = canPlant(cropId);
  if (!check.ok) {
    notify(check.reason, 'bad');
    return false;
  }
  const crop = cropById(cropId);
  bank.remove(crop.seed, crop.seedQty);
  plot.crop = cropId;
  plot.plantedAt = G.state.time;
  plot.gel = 0;
  emit('farm', index);
  return true;
}

export function addGel(index) {
  const plot = G.state.farming.plots[index];
  if (!plot?.crop || plot.gel >= MAX_GEL || plotState(plot) === 'ready') return false;
  if (!bank.remove('nutrient_gel', 1)) {
    notify('You have no Nutrient Gel.', 'bad');
    return false;
  }
  plot.gel += 1;
  emit('farm', index);
  return true;
}

// Returns { ok, qty } or { ok:false, reason }.
export function harvest(index) {
  const S = G.state;
  const plot = S.farming.plots[index];
  if (!plot?.crop || plotState(plot) !== 'ready') return { ok: false, reason: 'Nothing to harvest.' };
  const crop = cropById(plot.crop);
  const replantId = plot.crop;
  if (!chance(survivalChance(plot))) {
    S.stats.cropsFailed++;
    plot.crop = null;
    plot.gel = 0;
    emit('farm', index);
    maybeReplant(index, replantId);
    return { ok: false, failed: true, reason: `The ${crop.name} withered before harvest.` };
  }
  if (!bank.canAdd(crop.output)) return { ok: false, reason: 'Cargo hold is full.' };
  const p = perks(XENO, crop.id);
  let n = randInt(3, 8) + (p.yield || 0);
  n = Math.max(1, Math.round(n * (1 + mod('farmYield', XENO) / 100)));
  bank.add(crop.output, n);
  S.stats.harvests++;
  S.stats.produced += n;
  plot.crop = null;
  plot.gel = 0;
  const growMs = growthTime(crop);
  addXP(XENO, crop.xp * n);
  addMasteryXP(XENO, crop.id, Math.min(growMs / 10, 600000));
  useBooster(XENO);
  useBooster('global');
  rollCompanion(XENO, growMs);
  S.stats.actions[XENO] = (S.stats.actions[XENO] || 0) + 1;
  emit('farm', index);
  maybeReplant(index, replantId);
  return { ok: true, qty: n, item: crop.output };
}

function maybeReplant(index, cropId) {
  if (G.state.settings.autoReplant && canPlant(cropId).ok) plant(index, cropId);
}

export function harvestAll() {
  const results = { harvested: 0, failed: 0, items: {} };
  G.state.farming.plots.forEach((plot, i) => {
    if (plotState(plot) !== 'ready') return;
    const r = harvest(i);
    if (r.ok) {
      results.harvested++;
      results.items[r.item] = (results.items[r.item] || 0) + r.qty;
    } else if (r.failed) results.failed++;
  });
  return results;
}

export const readyCount = () => G.state.farming.plots.filter((p) => plotState(p) === 'ready').length;

export function nextPlot() {
  const plots = SKILLS[XENO].plots;
  const owned = G.state.farming.plots.length;
  return owned < plots.length ? plots[owned] : null;
}

export function unlockPlot() {
  const next = nextPlot();
  if (!next) return false;
  if (skillLevel(XENO) < next.level) {
    notify(`Requires Xenobiology level ${next.level}.`, 'bad');
    return false;
  }
  if (!bank.spendCredits(next.cost)) {
    notify('Not enough credits.', 'bad');
    return false;
  }
  G.state.farming.plots.push({ crop: null, plantedAt: 0, gel: 0 });
  emit('farm', G.state.farming.plots.length - 1);
  return true;
}
