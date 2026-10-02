// Cargo hold (Melvor's bank). Each distinct item takes one slot; stacks are unlimited.

import { G } from './state.js';
import { ITEMS } from '../data/items.js';
import { SHIPS } from '../data/ships.js';
import { CARGO_BASE_SLOTS, CARGO_SLOTS_PER_EXPANSION } from '../data/shop.js';
import { emit } from '../core/events.js';
import { mod } from './modifiers.js';
import { weightedPick, randInt } from '../core/util.js';

export const qty = (id) => G.state.bank[id] || 0;
export const has = (id, n = 1) => qty(id) >= n;

export function hasAll(list, mult = 1) {
  for (const { id, qty: q } of list) if (qty(id) < q * mult) return false;
  return true;
}

export function usedSlots() {
  return Object.keys(G.state.bank).length;
}

export function capacity() {
  const S = G.state;
  const ship = SHIPS[S.ships.active];
  return CARGO_BASE_SLOTS + S.cargoBought * CARGO_SLOTS_PER_EXPANSION + (ship?.cargoSlots || 0) + Math.floor(mod('cargoSlots'));
}

export const canAdd = (id) => qty(id) > 0 || usedSlots() < capacity();

export function canAddAll(list) {
  let newSlots = 0;
  for (const { id } of list) if (qty(id) === 0) newSlots++;
  return usedSlots() + newSlots <= capacity();
}

function track(id, n) {
  if (G.summary) G.summary.items[id] = (G.summary.items[id] || 0) + n;
}

// Returns false (and adds nothing) if there is no free slot for a new item type.
export function add(id, n = 1, { toast = true } = {}) {
  if (!ITEMS[id]) {
    console.warn('Unknown item', id);
    return false;
  }
  if (n <= 0) return true;
  if (!canAdd(id)) return false;
  const isNew = qty(id) === 0;
  G.state.bank[id] = qty(id) + n;
  track(id, n);
  emit('items', { id, n, isNew });
  if (toast && !G.silent) emit('gain', { id, n });
  return true;
}

export function remove(id, n = 1) {
  const have = qty(id);
  if (have < n) return false;
  if (have === n) delete G.state.bank[id];
  else G.state.bank[id] = have - n;
  track(id, -n);
  emit('items', { id, n: -n, removed: have === n });
  return true;
}

export function removeAll(list, mult = 1) {
  for (const { id, qty: q } of list) remove(id, q * mult);
}

export function addCredits(n, source) {
  if (!(n > 0)) return;
  n = Math.floor(n);
  G.state.credits += n;
  G.state.stats.creditsEarned += n;
  if (G.summary) G.summary.credits += n;
  emit('credits', { n, source });
}

export function spendCredits(n) {
  if (G.state.credits < n) return false;
  G.state.credits -= n;
  G.state.stats.creditsSpent += n;
  if (G.summary) G.summary.credits -= n;
  emit('credits', { n: -n });
  return true;
}

export const salePrice = (id) => Math.floor(ITEMS[id].sell * (1 + mod('sellPrice') / 100));

export function sell(id, n) {
  n = Math.min(n, qty(id));
  if (n <= 0 || !ITEMS[id].sell) return 0;
  const value = salePrice(id) * n;
  remove(id, n);
  addCredits(value, 'sale');
  G.state.stats.itemsSold += n;
  G.state.stats.salesValue += value;
  return value;
}

// Opens n containers. Returns a map of item id -> quantity received.
export function openContainer(id, n) {
  const item = ITEMS[id];
  if (!item?.open) return null;
  n = Math.min(n, qty(id));
  const got = {};
  let opened = 0;
  for (let i = 0; i < n; i++) {
    const [lootId, , lo, hi] = weightedPick(item.open);
    const amount = randInt(lo, hi);
    if (!add(lootId, amount, { toast: false })) break;
    got[lootId] = (got[lootId] || 0) + amount;
    opened++;
  }
  if (opened) remove(id, opened);
  return got;
}
