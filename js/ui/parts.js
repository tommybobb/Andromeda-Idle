// Reusable interface fragments and dialogs shared across pages.

import { G } from '../game/state.js';
import { SKILLS, SKILL_GROUPS } from '../data/skills.js';
import { ITEMS, CATEGORIES, SLOT_TYPES } from '../data/items.js';
import { SHIPS, shipSlotKeys, slotTypeOf } from '../data/ships.js';
import { esc, fmt, fmtShort, fmt1, fmtSecs, fmtTime } from '../core/util.js';
import { levelProgress } from '../core/xp.js';
import { itemIcon, icon } from './icons.js';
import { sceneSvg } from './scene.js';
import { openModal, confirmModal } from './modal.js';
import { updateBindings } from './bind.js';
import { toast } from './toast.js';
import * as bank from '../game/bank.js';
import { mod, poolPct, poolCap, describeMods } from '../game/modifiers.js';
import { masteryLevel, masteryCost, spendPool, skillLevel } from '../game/progress.js';
import { activateBooster, clearBooster, boosterCharges } from '../game/engine.js';
import { quickEquip, activeShip, loadout } from '../game/hangar.js';
import { MAX_MASTERY } from '../core/xp.js';

export const hudColour = () => getComputedStyle(document.documentElement).getPropertyValue('--hud').trim() || '#ff7a00';

// ---------------------------------------------------------------------------
// Small fragments

export function pill(id, qty, { need = false } = {}) {
  const item = ITEMS[id];
  if (!item) return '';
  const count = need
    ? `<span data-b="need" data-item="${id}" data-need="${qty}">${fmtShort(bank.qty(id))}/${fmtShort(qty)}</span>`
    : `<span>${fmtShort(qty)}</span>`;
  return `<span class="pill ${need && bank.qty(id) < qty ? 'lack' : ''}" title="${esc(item.name)}">${itemIcon(id)}${count}<small class="pill-name">${esc(item.name)}</small></span>`;
}

function reqLine(id, qty) {
  const item = ITEMS[id];
  const have = bank.qty(id);
  return `<div class="req ${have < qty ? 'lack' : ''}">${itemIcon(id, 'sm')}<span class="req-name">${esc(item.name)}</span><span class="req-n" data-b="need" data-item="${id}" data-need="${qty}">${fmtShort(have)}/${fmtShort(qty)}</span></div>`;
}

// Inputs as a checklist (owned / needed), then what the action produces.
export function ioRow(inputs, outputs) {
  const outs = (outputs || []).map((o) => pill(o.id, o.qty)).join('');
  if (!inputs?.length) return `<div class="io">${outs}</div>`;
  return `<div class="reqs">${inputs.map((i) => reqLine(i.id, i.qty)).join('')}</div><div class="io"><span class="arrow">&#9656;</span>${outs}</div>`;
}

export function masteryRow(skillId, actionId) {
  return `<div class="mastery-row" title="Mastery level">
    <span class="ml">MASTERY <span data-b="mlevel" data-skill="${skillId}" data-action="${actionId}">${masteryLevel(skillId, actionId)}</span></span>
    <div class="bar thin purple"><i data-b="m-bar" data-skill="${skillId}" data-action="${actionId}"></i></div>
  </div>`;
}

export function progressBar(skillId, actionId) {
  return `<div class="bar progress"><i data-b="progress" data-skill="${skillId}" data-action="${actionId}"></i></div>`;
}

export const groupName = (id) => SKILL_GROUPS.find((g) => g.id === id)?.name || '';

// ---------------------------------------------------------------------------
// Skill header: scene banner and the level / mastery pool / booster panels.

const BONUS_KEYS = {
  xp: 'XP', mxp: 'Mastery XP', interval: 'Interval', double: 'Double chance', preserve: 'Preservation', yield: 'Extra output',
};
const SKILL_BONUS_KEYS = {
  mining: { integrity: 'Asteroid integrity' },
  salvaging: { stealth: 'Finesse', salvageCredits: 'Salvage credits' },
  exploration: { discovery: 'Discovery chance' },
  trading: { tradeProfit: 'Trade profit', tonnagePct: 'Tonnage' },
  xenobiology: { farmYield: 'Harvest yield', growth: 'Growth time' },
};
const FLAT = new Set(['yield', 'integrity', 'stealth']);

export function bonusChips(skillId) {
  const keys = { ...BONUS_KEYS, ...(SKILL_BONUS_KEYS[skillId] || {}) };
  const chips = [];
  for (const [k, label] of Object.entries(keys)) {
    const v = mod(k, skillId);
    if (!v) continue;
    const good = k === 'interval' || k === 'growth' ? v < 0 : v > 0;
    const val = `${v > 0 ? '+' : ''}${fmt1(v)}${FLAT.has(k) ? '' : '%'}`;
    chips.push(`<span class="chip ${good ? 'good' : ''}">${label} ${val}</span>`);
  }
  return chips.length ? chips.join('') : '<span class="muted small">None yet.<span class="hint"> Fit modules, fly specialist ships and research tech to improve this skill.</span></span>';
}

export function skillHeader(skillId) {
  const sk = SKILLS[skillId];
  const active = G.state.active?.skill === skillId;
  const hasPool = sk.actions.length > 0 && sk.pool;
  const pp = poolPct(skillId) * 100;
  const ticks = hasPool ? sk.pool.map((cp) => `<span class="tick ${pp >= cp.pct ? 'on' : ''}" style="left:${cp.pct}%"></span>`).join('') : '';
  const nextCp = hasPool ? sk.pool.find((cp) => pp < cp.pct) : null;
  const b = G.state.boosters[skillId];
  const boosterPanel = sk.kind === 'passive' ? '' : `
    <div class="panel">
      <div class="ph">Booster<div class="ph-right"><button class="btn xs" data-act="booster" data-skill="${skillId}">Manage</button></div></div>
      ${b ? `<div class="row">${itemIcon(b.item, 'lg')}<div><b>${esc(ITEMS[b.item].name)}</b><div class="small muted"><span data-b="booster-charges" data-slot="${skillId}">${b.charges}</span> charges left${bank.qty(b.item) ? `, ${fmt(bank.qty(b.item))} spare` : ''}</div></div></div>`
        : '<div class="muted small">None active.<span class="hint"> Synthesise boosters with Chemistry and activate them here.</span></div>'}
      ${G.state.boosters.global ? `<div class="row small" style="margin-top:8px">${itemIcon(G.state.boosters.global.item, 'sm')}<span>${esc(ITEMS[G.state.boosters.global.item].name)} (global)</span></div>` : ''}
    </div>`;
  return `
    <div class="scene ${active ? 'active' : ''}" data-scene="${skillId}">
      ${sceneSvg(skillId, sk.scene, hudColour())}
      <div class="scene-status">${active ? 'OPERATING' : 'STANDBY'}</div>
      <div class="scene-title">
        <div class="eyebrow">${groupName(sk.group)}</div>
        <h1>${esc(sk.name)}</h1>
        <div class="lvl">LEVEL <span data-b="level" data-skill="${skillId}">${skillLevel(skillId)}</span> / 99</div>
      </div>
    </div>
    <p class="desc">${esc(sk.desc)}</p>
    <div class="skill-head">
      <div class="panel">
        <div class="ph">${icon(skillId)} Skill Level</div>
        <div class="row between"><div class="stat-big"><span data-b="level" data-skill="${skillId}">${skillLevel(skillId)}</span><small> / 99</small></div><div class="small muted" data-b="xp-text" data-skill="${skillId}"></div></div>
        <div class="bar thick seg" style="margin:8px 0"><i data-b="xp-bar" data-skill="${skillId}"></i></div>
        <div class="small muted xp-total">Total XP <b data-b="xp-total" data-skill="${skillId}"></b></div>
      </div>
      ${hasPool ? `
      <div class="panel">
        <div class="ph">Mastery Pool<div class="ph-right"><button class="btn xs" data-act="pool" data-skill="${skillId}">Spend</button></div></div>
        <div class="row between"><div class="stat-big" data-b="pool" data-skill="${skillId}">0%</div><div class="small muted"><span data-b="pool-xp" data-skill="${skillId}"></span> / ${fmtShort(poolCap(skillId))}</div></div>
        <div class="bar thick purple" style="margin:8px 0"><i data-b="pool-bar" data-skill="${skillId}"></i>${ticks}</div>
        <div class="small muted">${nextCp ? `Next at ${nextCp.pct}%: ${esc(nextCp.text)}` : 'All checkpoints active.'}</div>
      </div>` : ''}
      ${boosterPanel}
      <div class="panel">
        <div class="ph">Active Bonuses</div>
        <div class="chips">${bonusChips(skillId)}</div>
        ${sk.perkText ? `<div class="small muted perk-text" style="margin-top:8px">${esc(sk.perkText)}</div>` : ''}
      </div>
    </div>`;
}

// ---------------------------------------------------------------------------
// Mastery pool dialog

export function poolModal(skillId) {
  const sk = SKILLS[skillId];
  const render = (h) => {
    const pool = G.state.skills[skillId].pool;
    const pp = poolPct(skillId) * 100;
    const lvl = skillLevel(skillId);
    const rows = sk.actions
      .filter((a) => a.level <= lvl)
      .map((a) => {
        const ml = masteryLevel(skillId, a.id);
        const btns = [1, 5, 10]
          .map((n) => {
            const { cost, target } = masteryCost(skillId, a.id, n);
            return target > ml ? `<button class="btn xs" data-spend="${a.id}" data-n="${n}" ${cost > pool ? 'disabled' : ''} title="${fmt(cost)} pool XP">+${n}</button>` : '';
          })
          .join('');
        const p = levelProgress(G.state.skills[skillId].mastery[a.id] || 0, MAX_MASTERY);
        return `<tr><td>${esc(a.name)}</td><td class="num"><b class="purple">${ml}</b></td><td style="min-width:90px"><div class="bar thin purple"><i style="width:${p.pct * 100}%"></i></div></td><td class="right nowrap">${ml >= 99 ? '<span class="gold small">MAX</span>' : btns}</td></tr>`;
      })
      .join('');
    const cps = sk.pool.map((cp) => `<li class="${pp >= cp.pct ? 'good' : 'muted'}"><b>${cp.pct}%</b> ${esc(cp.text)}</li>`).join('');
    h.set(`
      <div class="row between"><div><div class="stat-big">${fmt1(pp)}%</div><div class="small muted">${fmt(pool)} / ${fmt(poolCap(skillId))} pool XP</div></div></div>
      <div class="bar thick purple" style="margin:10px 0"><i style="width:${pp}%"></i>${sk.pool.map((cp) => `<span class="tick ${pp >= cp.pct ? 'on' : ''}" style="left:${cp.pct}%"></span>`).join('')}</div>
      <ul class="small" style="margin:0 0 12px;padding-left:18px">${cps}</ul>
      <p class="small muted">Spending pool XP raises mastery one-for-one. Checkpoint bonuses only stay active while the pool is above them.</p>
      <div class="table-wrap"><table class="table"><thead><tr><th>Action</th><th class="num">Lvl</th><th>Progress</th><th class="right">Spend</th></tr></thead><tbody>${rows || '<tr><td colspan="4" class="muted">Nothing unlocked yet.</td></tr>'}</tbody></table></div>`);
  };
  openModal({
    title: `${sk.name} Mastery Pool`,
    wide: true,
    onOpen(h) {
      render(h);
      h.body.addEventListener('click', async (e) => {
        const btn = e.target.closest('[data-spend]');
        if (!btn) return;
        const n = +btn.dataset.n;
        const id = btn.dataset.spend;
        const { cost } = masteryCost(skillId, id, n);
        const after = ((G.state.skills[skillId].pool - cost) / poolCap(skillId)) * 100;
        const lost = sk.pool.filter((cp) => poolPct(skillId) * 100 >= cp.pct && after < cp.pct);
        if (lost.length && !(await confirmModal('Drop below checkpoint?', `This will deactivate: ${lost.map((c) => esc(c.text)).join(', ')}.`, { ok: 'Spend anyway' }))) return;
        spendPool(skillId, id, n);
        render(h);
      });
    },
  });
}

// ---------------------------------------------------------------------------
// Booster dialog

export function boosterModal(skillId) {
  const render = (h) => {
    const section = (slot, label) => {
      const cur = G.state.boosters[slot];
      const options = Object.values(ITEMS).filter((i) => i.booster?.skill === slot);
      const list = options
        .map((i) => `<div class="row" style="padding:6px 0;border-bottom:1px solid var(--line)">${itemIcon(i.id)}<div style="flex:1"><b>${esc(i.name)}</b><div class="small muted">${esc(i.desc)}</div></div>
          <div class="right"><div class="small">Owned ${fmt(bank.qty(i.id))}</div><button class="btn xs" data-use="${i.id}" ${bank.qty(i.id) ? '' : 'disabled'}>${cur?.item === i.id ? 'Add dose' : 'Activate'}</button></div></div>`)
        .join('');
      return `<div class="section-title">${label}</div>
        <div class="panel" style="margin:10px 0 16px">
          ${cur ? `<div class="row between"><div class="row">${itemIcon(cur.item)}<b>${esc(ITEMS[cur.item].name)}</b><span class="muted small">${fmt(cur.charges)} charges</span></div><button class="btn xs danger" data-clear="${slot}">Remove</button></div>` : '<div class="muted small">Nothing active in this slot.</div>'}
          ${list || '<div class="muted small">No boosters exist for this slot.</div>'}
        </div>`;
    };
    h.set(`${section(skillId, `${SKILLS[skillId].name} slot`)}${section('global', 'Global slot (all skills)')}
      <p class="small muted">Each dose gives ${boosterCharges('laser_coolant')} charges (more with a high Chemistry mastery pool). A charge is spent per action, and spare doses in your cargo hold refill the slot automatically. Switching boosters discards remaining charges.</p>`);
  };
  openModal({
    title: 'Boosters',
    onOpen(h) {
      render(h);
      h.body.addEventListener('click', async (e) => {
        const use = e.target.closest('[data-use]');
        const clear = e.target.closest('[data-clear]');
        if (use) {
          const id = use.dataset.use;
          const slot = ITEMS[id].booster.skill;
          const cur = G.state.boosters[slot];
          if (cur && cur.item !== id && !(await confirmModal('Replace booster?', `${esc(ITEMS[cur.item].name)} has ${fmt(cur.charges)} charges left. They will be lost.`, { ok: 'Replace' }))) return;
          activateBooster(id);
          render(h);
        } else if (clear) {
          if (await confirmModal('Remove booster?', 'Remaining charges will be lost.', { ok: 'Remove', danger: true })) {
            clearBooster(clear.dataset.clear);
            render(h);
          }
        }
      });
    },
  });
}

// ---------------------------------------------------------------------------
// Loot table dialog

export function lootModal(title, table, { chancePct = 100, note = '' } = {}) {
  const total = table.reduce((s, r) => s + r[1], 0);
  const rows = table
    .map(([id, w, lo, hi]) => `<tr><td><div class="row">${itemIcon(id, 'sm')}${esc(ITEMS[id].name)}</div></td><td class="num">${lo === hi ? lo : `${lo}-${hi}`}</td><td class="num">${fmt1((w / total) * chancePct)}%</td></tr>`)
    .join('');
  openModal({
    title,
    body: `${note ? `<p class="small muted">${note}</p>` : ''}<div class="table-wrap"><table class="table"><thead><tr><th>Item</th><th class="num">Qty</th><th class="num">Chance</th></tr></thead><tbody>${rows}</tbody></table></div>`,
  });
}

// ---------------------------------------------------------------------------
// Item detail dialog (cargo, shop, anywhere an item is clicked)

export function itemModal(id) {
  const item = ITEMS[id];
  if (!item) return;
  let amount = 1;
  const render = (h) => {
    const have = bank.qty(id);
    amount = Math.max(1, Math.min(amount, have || 1));
    const price = bank.salePrice(id);
    let extra = '';
    if (item.module) {
      const ship = activeShip();
      const fits = shipSlotKeys(ship).some((k) => slotTypeOf(k) === item.module.slot);
      const fitted = Object.values(loadout(ship.id)).filter((x) => x === id).length;
      extra += `<div class="panel" style="margin-top:12px"><div class="ph">Module</div>
        <div class="small muted">${SLOT_TYPES[item.module.slot].name} slot, grade ${item.module.grade}</div>
        <div class="chips" style="margin:8px 0">${describeMods(item.module.mods).map((t) => `<span class="chip good">${esc(t)}</span>`).join('')}</div>
        ${fitted ? `<div class="small good">Fitted to your ${esc(ship.name)}.</div>` : ''}
        ${have ? `<button class="btn sm solid" data-fit ${fits ? '' : 'disabled'}>Fit to ${esc(ship.name)}</button>` : ''}</div>`;
    }
    if (item.booster) {
      extra += `<div class="panel" style="margin-top:12px"><div class="ph">Booster</div>
        <div class="small">${item.booster.skill === 'global' ? 'Uses the global slot.' : `For ${esc(SKILLS[item.booster.skill].name)}.`}</div>
        ${have ? '<button class="btn sm solid" data-activate style="margin-top:8px">Activate</button>' : ''}</div>`;
    }
    if (item.open) {
      extra += `<div class="panel" style="margin-top:12px"><div class="ph">Container</div>
        <div class="row wrap"><button class="btn sm solid" data-open="1" ${have ? '' : 'disabled'}>Open 1</button><button class="btn sm" data-open="${have}" ${have > 1 ? '' : 'disabled'}>Open all</button><button class="btn sm alt" data-contents>Contents</button></div></div>`;
    }
    if (item.cat === 'seed') {
      const crop = SKILLS.xenobiology.actions.find((c) => c.seed === id);
      if (crop) extra += `<div class="small muted" style="margin-top:10px">Plant in Xenobiology (level ${crop.level}). Grows in ${fmtTime(crop.growth * 1000)}.</div>`;
    }
    const sellable = item.sell > 0 && have > 0;
    h.set(`
      <div class="item-head">
        <div class="ico-wrap lg" style="--c:${item.color}">${itemIcon(id, 'xl')}</div>
        <div>
          <div class="name">${esc(item.name)}</div>
          <div class="small upper muted">${esc(CATEGORIES[item.cat]?.name || item.cat)}</div>
          <div class="small">Owned <b data-b="qty" data-item="${id}">${fmt(have)}</b></div>
        </div>
      </div>
      <p>${esc(item.desc || '')}</p>
      ${item.sell ? `<div class="kv"><span>Sale price</span><b>${fmt(price)} CR each</b></div>` : '<div class="small muted">Cannot be sold.</div>'}
      ${extra}
      ${sellable ? `
      <div class="panel" style="margin-top:12px">
        <div class="ph">Sell</div>
        <div class="sell-row">
          <button class="btn xs" data-amt="-10">-10</button><button class="btn xs" data-amt="-1">-1</button>
          <input class="input qty-input" type="number" min="1" max="${have}" value="${amount}" inputmode="numeric" data-amount>
          <button class="btn xs" data-amt="1">+1</button><button class="btn xs" data-amt="10">+10</button>
          <button class="btn xs" data-set="${Math.max(1, have - 1)}">All but 1</button><button class="btn xs" data-set="${have}">All</button>
        </div>
        <button class="btn solid block" data-sell style="margin-top:10px">Sell ${fmt(amount)} for ${fmt(amount * price)} CR</button>
      </div>` : ''}`);
  };
  openModal({
    title: item.name,
    onOpen(h) {
      render(h);
      h.body.addEventListener('input', (e) => {
        if (e.target.matches('[data-amount]')) {
          amount = Math.max(1, Math.min(bank.qty(id), Math.floor(+e.target.value || 1)));
          const btn = h.body.querySelector('[data-sell]');
          if (btn) btn.textContent = `Sell ${fmt(amount)} for ${fmt(amount * bank.salePrice(id))} CR`;
        }
      });
      h.body.addEventListener('click', (e) => {
        const t = e.target.closest('button');
        if (!t) return;
        if (t.dataset.amt) {
          amount += +t.dataset.amt;
          render(h);
        } else if (t.dataset.set) {
          amount = +t.dataset.set;
          render(h);
        } else if (t.hasAttribute('data-sell')) {
          const value = bank.sell(id, amount);
          if (value) toast(`${icon('credits', 'ico sm')}<span>Sold ${fmt(amount)} ${esc(item.name)} for <b>${fmt(value)} CR</b></span>`, 'gain');
          if (bank.qty(id) === 0) h.close();
          else render(h);
        } else if (t.hasAttribute('data-fit')) {
          if (quickEquip(id)) {
            toast(`${itemIcon(id, 'sm')}<span>Fitted ${esc(item.name)}</span>`, 'gain');
            h.close();
          }
        } else if (t.hasAttribute('data-activate')) {
          activateBooster(id);
          toast(`${itemIcon(id, 'sm')}<span>${esc(item.name)} activated</span>`, 'gain');
          h.close();
        } else if (t.dataset.open) {
          const got = bank.openContainer(id, +t.dataset.open);
          if (got && Object.keys(got).length) {
            toast(`${itemIcon(id, 'sm')}<span>Opened: ${Object.entries(got).map(([k, v]) => `${fmt(v)} ${esc(ITEMS[k].name)}`).join(', ')}</span>`, 'gain', 6000);
          } else toast('<span>Cargo hold is full.</span>', 'bad');
          if (bank.qty(id) === 0) h.close();
          else render(h);
        } else if (t.hasAttribute('data-contents')) {
          lootModal(`${item.name} contents`, item.open);
        }
        updateBindings(h.el);
      });
    },
  });
}

export function actionMeta(skillId, act, interval) {
  const parts = [`Lv ${act.level}`, `${fmt(act.xp)} XP`, fmtSecs(interval)];
  return parts.join(' &middot; ');
}

export function shipName(id) {
  return SHIPS[id]?.name || id;
}
