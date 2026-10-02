// Ships: buying, switching and fitting modules.

import { G } from './state.js';
import { SHIPS, shipSlotKeys, slotTypeOf } from '../data/ships.js';
import { ITEMS } from '../data/items.js';
import { emit } from '../core/events.js';
import { invalidateMods } from './modifiers.js';
import { skillLevel } from './progress.js';
import { notify } from './engine.js';
import * as bank from './bank.js';

export const ownsShip = (id) => G.state.ships.owned.includes(id);
export const activeShip = () => SHIPS[G.state.ships.active];
export const loadout = (shipId) => G.state.ships.loadouts[shipId] || (G.state.ships.loadouts[shipId] = {});

export function buyShip(id) {
  const ship = SHIPS[id];
  if (!ship || ship.craft || ownsShip(id)) return false;
  if (skillLevel('piloting') < ship.pilot) {
    notify(`Requires Piloting level ${ship.pilot}.`, 'bad');
    return false;
  }
  if (!bank.spendCredits(ship.price)) {
    notify('Not enough credits.', 'bad');
    return false;
  }
  G.state.ships.owned.push(id);
  loadout(id);
  emit('ships', id);
  return true;
}

export function setActiveShip(id) {
  const ship = SHIPS[id];
  if (!ownsShip(id)) return false;
  if (skillLevel('piloting') < ship.pilot) {
    notify(`You need Piloting level ${ship.pilot} to fly the ${ship.name}.`, 'bad');
    return false;
  }
  G.state.ships.active = id;
  invalidateMods();
  emit('ships', id);
  return true;
}

// Fits a module from the cargo hold into a slot, returning any old module to the hold.
export function equip(shipId, slotKey, itemId) {
  const ship = SHIPS[shipId];
  const item = ITEMS[itemId];
  if (!ship || !ownsShip(shipId) || !item?.module) return false;
  if (!shipSlotKeys(ship).includes(slotKey)) return false;
  if (item.module.slot !== slotTypeOf(slotKey)) {
    notify('That module does not fit this slot.', 'bad');
    return false;
  }
  const lo = loadout(shipId);
  if (slotTypeOf(slotKey) === 'utility' && item.module.line) {
    for (const k of Object.keys(lo)) {
      if (k !== slotKey && slotTypeOf(k) === 'utility' && ITEMS[lo[k]]?.module.line === item.module.line) {
        notify('A module of that type is already fitted to this ship.', 'bad');
        return false;
      }
    }
  }
  if (!bank.has(itemId)) return false;
  const old = lo[slotKey];
  bank.remove(itemId, 1);
  if (old && !bank.add(old, 1, { toast: false })) {
    bank.add(itemId, 1, { toast: false });
    notify('Cargo hold is full. Make room for the old module first.', 'bad');
    return false;
  }
  lo[slotKey] = itemId;
  invalidateMods();
  emit('ships', shipId);
  return true;
}

export function unequip(shipId, slotKey) {
  const lo = loadout(shipId);
  const old = lo[slotKey];
  if (!old) return false;
  if (!bank.add(old, 1, { toast: false })) {
    notify('Cargo hold is full.', 'bad');
    return false;
  }
  delete lo[slotKey];
  invalidateMods();
  emit('ships', shipId);
  return true;
}

// Fit a module to the first suitable slot on the active ship.
export function quickEquip(itemId) {
  const ship = activeShip();
  const item = ITEMS[itemId];
  if (!item?.module) return false;
  const keys = shipSlotKeys(ship).filter((k) => slotTypeOf(k) === item.module.slot);
  if (!keys.length) return false;
  const lo = loadout(ship.id);
  const empty = keys.find((k) => !lo[k]);
  return equip(ship.id, empty || keys[0], itemId);
}
