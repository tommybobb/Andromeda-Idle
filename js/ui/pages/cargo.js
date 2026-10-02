// Cargo hold.

import { G } from '../../game/state.js';
import { ITEMS, CATEGORIES } from '../../data/items.js';
import { CARGO_SLOTS_PER_EXPANSION } from '../../data/shop.js';
import { esc, fmt, fmtShort } from '../../core/util.js';
import { icon, itemIcon } from '../icons.js';
import { itemModal } from '../parts.js';
import { confirmModal } from '../modal.js';
import { toast } from '../toast.js';
import * as bank from '../../game/bank.js';
import { buyCargoExpansion, nextCargoCost } from '../../game/services.js';
import { updateBindings } from '../bind.js';

let filter = 'all';
let search = '';
let sort = 'category';

function sortedIds() {
  let ids = Object.keys(G.state.bank).filter((id) => ITEMS[id]);
  if (filter !== 'all') ids = ids.filter((id) => ITEMS[id].cat === filter);
  if (search) {
    const q = search.toLowerCase();
    ids = ids.filter((id) => ITEMS[id].name.toLowerCase().includes(q));
  }
  const order = Object.keys(ITEMS);
  if (sort === 'value') ids.sort((a, b) => ITEMS[b].sell * bank.qty(b) - ITEMS[a].sell * bank.qty(a));
  else if (sort === 'qty') ids.sort((a, b) => bank.qty(b) - bank.qty(a));
  else ids.sort((a, b) => CATEGORIES[ITEMS[a].cat].order - CATEGORIES[ITEMS[b].cat].order || order.indexOf(a) - order.indexOf(b));
  return ids;
}

function grid() {
  const ids = sortedIds();
  const tiles = ids
    .map((id) => {
      const it = ITEMS[id];
      return `<button class="slot" style="--c:${it.color}" data-act="item" data-item="${id}" title="${esc(it.name)}">${it.grade ? `<span class="g">${it.grade}</span>` : ''}${itemIcon(id)}<span class="q" data-b="qty-short" data-item="${id}">${fmtShort(bank.qty(id))}</span></button>`;
    })
    .join('');
  const free = filter === 'all' && !search ? Math.max(0, bank.capacity() - bank.usedSlots()) : 0;
  const empties = '<div class="slot empty"></div>'.repeat(Math.min(free, 24));
  return tiles || empties ? tiles + empties : '<p class="muted">Nothing here.</p>';
}

function sig() {
  return Object.keys(G.state.bank).join(',') + bank.capacity();
}
let lastSig = '';

export default {
  render(root) {
    const cats = [...new Set(Object.keys(G.state.bank).map((id) => ITEMS[id]?.cat).filter(Boolean))].sort((a, b) => CATEGORIES[a].order - CATEGORIES[b].order);
    if (filter !== 'all' && !cats.includes(filter)) filter = 'all';
    const used = bank.usedSlots();
    const cap = bank.capacity();
    const cost = nextCargoCost();
    root.innerHTML = `<div class="page">
      <div class="page-title">${icon('cargo')} Cargo Hold</div>
      <div class="grid four">
        <div class="panel"><div class="tiny muted upper">Slots used</div><div class="stat-big">${used}<small> / ${cap}</small></div><div class="bar seg" style="margin-top:8px"><i style="width:${(used / cap) * 100}%"></i></div></div>
        <div class="panel"><div class="tiny muted upper">Cargo value</div><div class="stat-big"><span data-b="cargo-value"></span><small> CR</small></div></div>
        <div class="panel"><div class="tiny muted upper">Credits</div><div class="stat-big"><span data-b="credits-short"></span><small> CR</small></div></div>
        <div class="panel"><div class="tiny muted upper">Expand hold (+${CARGO_SLOTS_PER_EXPANSION} slots)</div><button class="btn sm solid" data-act="expand" style="margin-top:6px" ${G.state.credits >= cost ? '' : 'disabled'}>${fmt(cost)} CR</button></div>
      </div>
      <div class="panel">
        <div class="row wrap" style="margin-bottom:10px">
          <input class="input" style="max-width:260px" type="search" placeholder="Search cargo" value="${esc(search)}" data-act="search">
          <select class="input" style="max-width:180px" data-act="sort">
            <option value="category" ${sort === 'category' ? 'selected' : ''}>Sort: Category</option>
            <option value="value" ${sort === 'value' ? 'selected' : ''}>Sort: Total value</option>
            <option value="qty" ${sort === 'qty' ? 'selected' : ''}>Sort: Quantity</option>
          </select>
          <span class="spacer"></span>
          <button class="btn sm danger" data-act="sell-junk" title="Sell every Personal Effects, Occupied Escape Pod and survey item">Sell valuables</button>
        </div>
        <div class="chips" style="margin-bottom:12px">
          <button class="chip ${filter === 'all' ? 'on' : ''}" data-act="filter" data-filter="all">All</button>
          ${cats.map((c) => `<button class="chip ${filter === c ? 'on' : ''}" data-act="filter" data-filter="${c}">${CATEGORIES[c].name}</button>`).join('')}
        </div>
        <div class="cargo-grid" id="cargo-grid">${grid()}</div>
      </div>
      <p class="small muted">Each different item takes one slot; stacks are unlimited. Bigger ships, Cargo Rack modules, expansions and the Cargo Compression tech all add slots. When the hold is full, actions that produce a new item type stop.</p>
    </div>`;
    lastSig = sig();
  },

  async click(t) {
    const act = t.dataset.act;
    if (act === 'item') itemModal(t.dataset.item);
    else if (act === 'filter') {
      filter = t.dataset.filter;
      this.render(document.getElementById('content'));
      updateBindings(document.getElementById('content'));
    } else if (act === 'expand') {
      buyCargoExpansion();
      this.render(document.getElementById('content'));
      updateBindings(document.getElementById('content'));
    } else if (act === 'sell-junk') {
      const junk = Object.keys(G.state.bank).filter((id) => ['personal_effects', 'occupied_pod'].includes(id) || id.startsWith('survey_'));
      if (!junk.length) return toast('<span>No collectables or surveys to sell.</span>', 'info');
      const value = junk.reduce((s, id) => s + bank.salePrice(id) * bank.qty(id), 0);
      if (!(await confirmModal('Sell valuables', `Sell all ${junk.map((id) => esc(ITEMS[id].name)).join(', ')} for <b>${fmt(value)} CR</b>?`, { ok: 'Sell' }))) return;
      let total = 0;
      for (const id of junk) total += bank.sell(id, bank.qty(id));
      toast(`${icon('credits', 'ico sm')}<span>Sold for <b>${fmt(total)} CR</b></span>`, 'gain');
    }
  },

  input(t) {
    if (t.dataset.act === 'search') {
      search = t.value;
      const g = document.getElementById('cargo-grid');
      g.innerHTML = grid();
      updateBindings(g);
    }
  },

  change(t) {
    if (t.dataset.act === 'sort') {
      sort = t.value;
      const g = document.getElementById('cargo-grid');
      g.innerHTML = grid();
      updateBindings(g);
    }
  },

  tick() {
    if (sig() !== lastSig) {
      lastSig = sig();
      const g = document.getElementById('cargo-grid');
      if (g && !document.activeElement?.matches('input[type=search]')) {
        this.render(document.getElementById('content'));
        updateBindings(document.getElementById('content'));
      } else if (g) {
        g.innerHTML = grid();
        updateBindings(g);
      }
    }
  },

  events: { cargo: true, ships: true, research: true },
};
