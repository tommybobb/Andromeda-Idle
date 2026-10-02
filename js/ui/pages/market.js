// Station Market: supplies, basic modules and upgrades.

import { G } from '../../game/state.js';
import { ITEMS } from '../../data/items.js';
import { SKILLS } from '../../data/skills.js';
import { SHOP_SECTIONS, CARGO_SLOTS_PER_EXPANSION, CARGO_MAX_EXPANSIONS } from '../../data/shop.js';
import { esc, fmt } from '../../core/util.js';
import { icon, itemIcon } from '../icons.js';
import { itemModal } from '../parts.js';
import { toast } from '../toast.js';
import { describeMods } from '../../game/modifiers.js';
import * as bank from '../../game/bank.js';
import { buy, shopLocked, buyCargoExpansion, nextCargoCost } from '../../game/services.js';
import { nextPlot, unlockPlot } from '../../game/farming.js';
import { skillLevel } from '../../game/progress.js';
import { updateBindings } from '../bind.js';

let tab = 'supplies';
const qtys = {};
let lastSig = '';

function entryCard(entry) {
  const item = ITEMS[entry.item];
  const lock = shopLocked(entry);
  const n = qtys[entry.item] || 1;
  const mods = item.module ? `<div class="chips">${describeMods(item.module.mods).map((t) => `<span class="chip good">${esc(t)}</span>`).join('')}</div>` : '';
  const total = entry.price * n;
  return `<div class="card ${lock ? 'locked' : ''}">
    <div class="card-top"><button class="ico-wrap" style="--c:${item.color};cursor:pointer" data-act="info" data-item="${item.id}">${itemIcon(item.id)}</button>
      <div class="card-title"><div class="name">${esc(item.name)}</div><div class="sub">${fmt(entry.price)} CR each &middot; own <span data-b="qty" data-item="${item.id}">${fmt(bank.qty(item.id))}</span></div></div></div>
    <div class="small muted">${esc(item.desc)}</div>
    ${mods}
    ${lock ? `<div class="small bad">${esc(lock)}</div>` : `<div class="row wrap">
      <button class="btn xs" data-act="qty" data-item="${item.id}" data-n="1">1</button>
      <button class="btn xs" data-act="qty" data-item="${item.id}" data-n="10">10</button>
      <button class="btn xs" data-act="qty" data-item="${item.id}" data-n="100">100</button>
      <span class="spacer"></span>
      <button class="btn sm ${G.state.credits >= total ? 'solid' : ''}" data-act="buy" data-item="${item.id}" ${G.state.credits >= total ? '' : 'disabled'}>Buy ${fmt(n)} &middot; ${fmt(total)} CR</button>
    </div>`}
  </div>`;
}

function upgrades() {
  const cost = nextCargoCost();
  const maxed = G.state.cargoBought >= CARGO_MAX_EXPANSIONS;
  const plot = nextPlot();
  const xl = skillLevel('xenobiology');
  return `<div class="grid">
    <div class="card"><div class="card-top"><div class="ico-wrap">${icon('cargo', 'ico')}</div>
      <div class="card-title"><div class="name">Cargo Expansion</div><div class="sub">+${CARGO_SLOTS_PER_EXPANSION} cargo hold slots &middot; bought ${G.state.cargoBought}</div></div></div>
      <div class="small muted">Permanent extra slots for every ship.</div>
      ${maxed ? '<div class="small gold">Fully expanded.</div>' : `<button class="btn sm ${G.state.credits >= cost ? 'solid' : ''}" data-act="expand" ${G.state.credits >= cost ? '' : 'disabled'}>Buy for ${fmt(cost)} CR</button>`}</div>
    <div class="card"><div class="card-top"><div class="ico-wrap">${icon('xenobiology', 'ico')}</div>
      <div class="card-title"><div class="name">Hydroponics Bay</div><div class="sub">You own ${G.state.farming.plots.length} bays</div></div></div>
      <div class="small muted">Another bay to grow xenoflora in.</div>
      ${plot ? `<button class="btn sm ${xl >= plot.level && G.state.credits >= plot.cost ? 'solid' : ''}" data-act="plot" ${xl >= plot.level && G.state.credits >= plot.cost ? '' : 'disabled'}>${xl >= plot.level ? `Buy for ${fmt(plot.cost)} CR` : `Requires ${SKILLS.xenobiology.name} ${plot.level}`}</button>` : '<div class="small gold">All bays unlocked.</div>'}</div>
    <div class="card"><div class="card-top"><div class="ico-wrap">${icon('hangar', 'ico')}</div>
      <div class="card-title"><div class="name">Ships</div><div class="sub">Sold at the shipyard</div></div></div>
      <div class="small muted">Browse and buy ships in your Hangar.</div>
      <a class="btn sm" href="#/hangar">Open hangar</a></div>
  </div>`;
}

const affordSig = () => {
  const sec = SHOP_SECTIONS.find((s) => s.id === tab);
  const items = sec ? sec.items.map((e) => (G.state.credits >= e.price * (qtys[e.item] || 1) ? 1 : 0)).join('') : '';
  return `${tab}${items}${G.state.credits >= nextCargoCost() ? 1 : 0}${G.state.credits >= (nextPlot()?.cost ?? Infinity) ? 1 : 0}`;
};

export default {
  render(root) {
    const sec = SHOP_SECTIONS.find((s) => s.id === tab);
    root.innerHTML = `<div class="page">
      <div class="page-title">${icon('market')} Station Market</div>
      <p class="page-sub">Supplies, basic ship modules and station upgrades. Sell items from your Cargo Hold.</p>
      <div class="tabs">
        ${SHOP_SECTIONS.map((s) => `<button class="tab ${tab === s.id ? 'on' : ''}" data-act="tab" data-tab="${s.id}">${s.name}</button>`).join('')}
        <button class="tab ${tab === 'upgrades' ? 'on' : ''}" data-act="tab" data-tab="upgrades">Upgrades</button>
      </div>
      ${sec ? `<div class="grid">${sec.items.map(entryCard).join('')}</div>` : upgrades()}
    </div>`;
    lastSig = affordSig();
  },

  click(t) {
    const act = t.dataset.act;
    const root = document.getElementById('content');
    if (act === 'tab') tab = t.dataset.tab;
    else if (act === 'qty') qtys[t.dataset.item] = +t.dataset.n;
    else if (act === 'info') return itemModal(t.dataset.item);
    else if (act === 'buy') {
      const id = t.dataset.item;
      const n = qtys[id] || 1;
      if (buy(id, n)) toast(`${itemIcon(id, 'sm')}<span>Bought ${fmt(n)} ${esc(ITEMS[id].name)}</span>`, 'gain');
    } else if (act === 'expand') buyCargoExpansion();
    else if (act === 'plot') unlockPlot();
    this.render(root);
    updateBindings(root);
  },

  tick() {
    if (affordSig() !== lastSig) {
      const root = document.getElementById('content');
      this.render(root);
      updateBindings(root);
    }
  },

  events: {},
};

