// Hangar: your fleet, ship loadouts and the shipyard.

import { G } from '../../game/state.js';
import { SHIPS, SHIP_ORDER, shipSlotKeys, slotTypeOf, SHIP_RECIPES } from '../../data/ships.js';
import { ITEMS, SLOT_TYPES } from '../../data/items.js';
import { esc, fmt } from '../../core/util.js';
import { icon, itemIcon, shipArt } from '../icons.js';
import { openModal, confirmModal } from '../modal.js';
import { describeMods } from '../../game/modifiers.js';
import { skillLevel } from '../../game/progress.js';
import * as bank from '../../game/bank.js';
import * as hangar from '../../game/hangar.js';
import { tonnage } from '../../game/engine.js';
import { CARGO_BASE_SLOTS } from '../../data/shop.js';

let viewShip = null;
let lastSig = '';

const buySig = () => SHIP_ORDER.map((id) => (G.state.credits >= (SHIPS[id].price || 0) ? 1 : 0)).join('') + skillLevel('piloting');

const slotLabel = (key) => {
  const type = slotTypeOf(key);
  const n = key.match(/\d+$/);
  return `${SLOT_TYPES[type].name}${n ? ` ${+n[0] + 1}` : ''}`;
};

function loadoutMods(shipId) {
  const mods = {};
  for (const id of Object.values(hangar.loadout(shipId))) {
    for (const [k, v] of Object.entries(ITEMS[id]?.module?.mods || {})) mods[k] = (mods[k] || 0) + v;
  }
  return mods;
}

function slotButton(shipId, key) {
  const fitted = hangar.loadout(shipId)[key];
  const item = ITEMS[fitted];
  return `<button class="fit-slot ${item ? '' : 'empty'}" data-act="slot" data-slot="${key}">
    ${item ? itemIcon(fitted) : `<span class="ico" style="display:grid;place-items:center;color:var(--muted)">${icon('plus')}</span>`}
    <span><span class="slot-name">${esc(slotLabel(key))}</span><br><span class="mod-name">${item ? esc(item.name) : 'Empty'}</span></span>
  </button>`;
}

function hero(ship) {
  const active = G.state.ships.active === ship.id;
  const builtIn = describeMods(ship.mods);
  const fitted = describeMods(loadoutMods(ship.id));
  const cargo = CARGO_BASE_SLOTS + (ship.cargoSlots || 0);
  return `<div class="panel">
    <div class="ph">${icon('hangar')} ${active ? 'Active ship' : 'Viewing'}: ${esc(ship.name)}<div class="ph-right">${active ? '<span class="chip good">Flying</span>' : `<button class="btn xs solid" data-act="fly" data-ship="${ship.id}" ${skillLevel('piloting') >= ship.pilot ? '' : 'disabled'}>Fly this ship</button>`}</div></div>
    <div class="ship-hero">
      <div class="ship-art">${shipArt(ship.hull, ship.color)}</div>
      <div class="stack">
        <div><div class="cmdr-name">${esc(ship.name)}</div><div class="rank">${esc(ship.role)}</div></div>
        <p class="small muted" style="margin:0">${esc(ship.desc)}</p>
        <div class="kvs">
          <div class="kv"><span>Trade tonnage</span><b>${active ? fmt(tonnage()) : fmt(ship.tonnage)} t</b></div>
          <div class="kv"><span>Hull cargo slots</span><b>+${fmt(ship.cargoSlots || 0)}</b></div>
          <div class="kv"><span>Module slots</span><b>${shipSlotKeys(ship).length}</b></div>
          <div class="kv"><span>Pilot level</span><b>${ship.pilot}</b></div>
        </div>
        ${builtIn.length ? `<div class="chips">${builtIn.map((t) => `<span class="chip blue">${esc(t)}</span>`).join('')}</div>` : '<div class="small muted">No built-in bonuses.</div>'}
      </div>
    </div>
    <div class="section-title" style="margin:16px 0 10px">Loadout</div>
    <div class="slot-grid">${shipSlotKeys(ship).map((k) => slotButton(ship.id, k)).join('')}</div>
    ${fitted.length ? `<div class="chips" style="margin-top:10px">${fitted.map((t) => `<span class="chip good">${esc(t)}</span>`).join('')}</div>` : ''}
    <p class="tiny muted" style="margin-bottom:0">Only the ship you are flying applies its bonuses. Base cargo hold: ${cargo} slots with this hull before upgrades.</p>
  </div>`;
}

function fleetCard(ship) {
  const active = G.state.ships.active === ship.id;
  const viewing = viewShip === ship.id;
  return `<div class="card ship-card ${active ? 'active' : ''}">
    ${active ? '<span class="state-tag">FLYING</span>' : ''}
    <div class="ship-art">${shipArt(ship.hull, ship.color, { engines: active })}</div>
    <div class="card-title"><div class="name">${esc(ship.name)}</div><div class="sub">${esc(ship.role)} &middot; ${ship.tonnage} t</div></div>
    <div class="row">
      ${viewing ? '<span class="small muted">Shown above</span>' : `<button class="btn xs" data-act="view" data-ship="${ship.id}">Loadout</button>`}
      ${active ? '' : `<button class="btn xs solid" data-act="fly" data-ship="${ship.id}" ${skillLevel('piloting') >= ship.pilot ? '' : 'disabled'}>Fly</button>`}
    </div>
  </div>`;
}

function shipyardCard(ship) {
  const lvl = skillLevel('piloting');
  const recipe = SHIP_RECIPES.find((r) => r.ship === ship.id);
  const canFly = lvl >= ship.pilot;
  const affordable = G.state.credits >= (ship.price || 0);
  return `<div class="card ship-card ${canFly ? '' : 'locked'}">
    <div class="ship-art">${shipArt(ship.hull, ship.color, { engines: false })}</div>
    <div class="card-title"><div class="name">${esc(ship.name)}</div><div class="sub">${esc(ship.role)} &middot; Piloting ${ship.pilot}</div></div>
    <div class="small muted">${esc(ship.desc)}</div>
    <div class="chips">${describeMods(ship.mods).map((t) => `<span class="chip">${esc(t)}</span>`).join('') || '<span class="chip">Multirole</span>'}<span class="chip">${ship.tonnage} t</span><span class="chip">${ship.slots.cargo} cargo / ${ship.slots.utility} utility slots</span></div>
    ${ship.craft
      ? `<div class="small hud">Built with Engineering level ${recipe?.level}. Find the hull in the Engineering ships tab.</div>`
      : `<div class="row between"><b class="gold">${fmt(ship.price)} CR</b><button class="btn sm ${canFly && affordable ? 'solid' : ''}" data-act="buy" data-ship="${ship.id}" ${canFly && affordable ? '' : 'disabled'}>${canFly ? 'Buy' : `Piloting ${ship.pilot}`}</button></div>`}
  </div>`;
}

function slotPicker(shipId, key) {
  const type = slotTypeOf(key);
  const fitted = hangar.loadout(shipId)[key];
  const options = Object.keys(G.state.bank).filter((id) => ITEMS[id]?.module?.slot === type);
  options.sort((a, b) => ITEMS[b].sell - ITEMS[a].sell);
  const list = options.map((id) => `<div class="row" style="padding:8px 0;border-bottom:1px solid var(--line)">${itemIcon(id)}
      <div style="flex:1"><b>${esc(ITEMS[id].name)}</b> <span class="small muted">x${fmt(bank.qty(id))}</span>
      <div class="chips" style="margin-top:4px">${describeMods(ITEMS[id].module.mods).map((t) => `<span class="chip good">${esc(t)}</span>`).join('')}</div></div>
      <button class="btn xs solid" data-fit="${id}">Fit</button></div>`).join('');
  openModal({
    title: slotLabel(key),
    body: `${fitted ? `<div class="panel" style="margin-bottom:12px"><div class="row">${itemIcon(fitted)}<div style="flex:1"><b>${esc(ITEMS[fitted].name)}</b><div class="chips">${describeMods(ITEMS[fitted].module.mods).map((t) => `<span class="chip good">${esc(t)}</span>`).join('')}</div></div><button class="btn xs danger" data-remove>Remove</button></div></div>` : ''}
      ${list || `<p class="muted">You have no ${esc(SLOT_TYPES[type].name)} modules in your cargo hold. Build them with Engineering or buy basic ones at the Station Market.</p>`}`,
    onOpen(h) {
      h.body.addEventListener('click', (e) => {
        const fit = e.target.closest('[data-fit]');
        if (fit && hangar.equip(shipId, key, fit.dataset.fit)) h.close();
        if (e.target.closest('[data-remove]') && hangar.unequip(shipId, key)) h.close();
      });
    },
  });
}

export default {
  render(root) {
    const S = G.state;
    if (!viewShip || !S.ships.owned.includes(viewShip)) viewShip = S.ships.active;
    const owned = SHIP_ORDER.filter((id) => S.ships.owned.includes(id)).map((id) => SHIPS[id]);
    const forSale = SHIP_ORDER.filter((id) => !S.ships.owned.includes(id)).map((id) => SHIPS[id]);
    root.innerHTML = `<div class="page">
      <div class="page-title">${icon('hangar')} Hangar</div>
      <p class="page-sub">Your fleet. The ship you fly sets your trade tonnage and adds its bonuses and fitted modules to every action.</p>
      ${hero(SHIPS[viewShip])}
      <div class="section-title">Fleet (${owned.length})</div>
      <div class="grid">${owned.map(fleetCard).join('')}</div>
      ${forSale.length ? `<div class="section-title">Shipyard</div><div class="grid">${forSale.map(shipyardCard).join('')}</div>` : ''}
    </div>`;
    lastSig = buySig();
  },

  tick() {
    if (buySig() !== lastSig) this.render(document.getElementById('content'));
  },

  async click(t) {
    const act = t.dataset.act;
    const id = t.dataset.ship;
    if (act === 'fly') {
      hangar.setActiveShip(id);
      viewShip = id;
    } else if (act === 'view') {
      viewShip = id;
      this.render(document.getElementById('content'));
      document.getElementById('content').scrollTop = 0;
    } else if (act === 'buy') {
      const ship = SHIPS[id];
      if (await confirmModal('Purchase ship', `Buy the <b>${esc(ship.name)}</b> for <b>${fmt(ship.price)} CR</b>?`, { ok: 'Buy' })) {
        if (hangar.buyShip(id)) viewShip = id;
      }
    } else if (act === 'slot') slotPicker(viewShip, t.dataset.slot);
  },

  events: { ships: true, levelup: (d) => d.skill === 'piloting' },
};
