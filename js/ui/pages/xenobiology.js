// Xenobiology: hydroponics bays.

import { G } from '../../game/state.js';
import { SKILLS } from '../../data/skills.js';
import { ITEMS } from '../../data/items.js';
import { esc, fmt, fmtTime, fmtShort } from '../../core/util.js';
import { itemIcon, icon } from '../icons.js';
import { skillHeader, masteryRow, pill, poolModal, boosterModal } from '../parts.js';
import { openModal } from '../modal.js';
import { toast } from '../toast.js';
import { skillLevel } from '../../game/progress.js';
import * as bank from '../../game/bank.js';
import * as farming from '../../game/farming.js';
import { updateBindings } from '../bind.js';

const XENO = 'xenobiology';
let lastSig = '';
let lastCrop = 'lumimoss';

function sig() {
  const next = farming.nextPlot();
  const plots = G.state.farming.plots.map((p) => `${p.crop || '-'}:${farming.plotState(p)}:${p.gel}`).join('|');
  return `${plots}|${bank.qty('nutrient_gel') > 0}|${next ? G.state.credits >= next.cost : ''}`;
}

function plotCard(plot, i) {
  const state = farming.plotState(plot);
  const head = `<div class="row between"><b class="tiny upper muted">Bay ${i + 1}</b>${state === 'ready' ? '<span class="ready-tag">Ready</span>' : state === 'growing' ? '<span class="tiny upper blue">Growing</span>' : '<span class="tiny upper muted">Empty</span>'}</div>`;
  if (state === 'empty') {
    return `<div class="card plot">${head}
      <div class="row" style="flex:1"><div class="ico-wrap">${icon('xenobiology', 'ico')}</div><span class="muted small">Bay is empty and ready for planting.</span></div>
      <button class="btn sm solid" data-act="plant" data-plot="${i}">Plant</button></div>`;
  }
  const crop = farming.cropById(plot.crop);
  const item = ITEMS[crop.output];
  const gel = Array.from({ length: farming.MAX_GEL }, (_, k) => `<i class="${k < plot.gel ? 'on' : ''}"></i>`).join('');
  if (state === 'ready') {
    return `<div class="card plot ready">${head}
      <div class="row"><div class="ico-wrap" style="--c:${item.color}">${itemIcon(crop.output)}</div><div><b>${esc(crop.name)}</b><div class="small muted">Survival chance <span data-b="plot-chance" data-plot="${i}"></span></div></div></div>
      <div class="bar green"><i style="width:100%"></i></div>
      <button class="btn sm solid" data-act="harvest" data-plot="${i}">Harvest</button></div>`;
  }
  return `<div class="card plot">${head}
    <div class="row"><div class="ico-wrap" style="--c:${item.color}">${itemIcon(crop.output)}</div><div><b>${esc(crop.name)}</b><div class="small muted"><span data-b="plot-time" data-plot="${i}"></span> remaining</div></div></div>
    <div class="bar green"><i data-b="plot-bar" data-plot="${i}"></i></div>
    <div class="row between small"><span class="muted">Survival <b data-b="plot-chance" data-plot="${i}"></b></span><div class="gel" title="Nutrient Gel applied">${gel}</div></div>
    <button class="btn sm" data-act="gel" data-plot="${i}" ${plot.gel >= farming.MAX_GEL || !bank.qty('nutrient_gel') ? 'disabled' : ''}>Apply Nutrient Gel</button></div>`;
}

function lockedPlot() {
  const next = farming.nextPlot();
  if (!next) return '';
  const lvl = skillLevel(XENO);
  const ok = lvl >= next.level && G.state.credits >= next.cost;
  return `<div class="card plot locked" style="opacity:.75">
    <div class="row between"><b class="tiny upper muted">Bay ${G.state.farming.plots.length + 1}</b><span class="tiny upper muted">Locked</span></div>
    <div class="small">Requires Xenobiology ${next.level}<br>Costs <b>${fmt(next.cost)} CR</b></div>
    <button class="btn sm ${ok ? 'solid' : ''}" data-act="unlock" ${ok ? '' : 'disabled'}>Unlock bay</button></div>`;
}

function cropCard(crop) {
  const lvl = skillLevel(XENO);
  const locked = lvl < crop.level;
  return `<div class="card ${locked ? 'locked' : ''}">
    <div class="card-top"><div class="ico-wrap" style="--c:${ITEMS[crop.output].color}">${itemIcon(crop.output)}</div>
      <div class="card-title"><div class="name">${esc(crop.name)}</div><div class="sub">Lv ${crop.level} &middot; ${fmt(crop.xp)} XP each &middot; ${fmtTime(farming.growthTime(crop))}</div></div></div>
    <div class="io">${pill(crop.seed, crop.seedQty, { need: true })}<span class="arrow">&#9656;</span>${pill(crop.output, 3)}<span class="small muted">to 8+</span></div>
    ${locked ? '' : masteryRow(XENO, crop.id)}
  </div>`;
}

function seedPicker(plotIndex) {
  const lvl = skillLevel(XENO);
  const render = (h) => {
    const rows = SKILLS[XENO].actions
      .map((c) => {
        const ok = farming.canPlant(c.id).ok;
        const locked = lvl < c.level;
        return `<div class="row" style="padding:8px 0;border-bottom:1px solid var(--line);${locked ? 'opacity:.4' : ''}">
          ${itemIcon(c.output)}<div style="flex:1"><b>${esc(c.name)}</b><div class="small muted">${locked ? `Requires level ${c.level}` : `${c.seedQty} x ${esc(ITEMS[c.seed].name)} (own ${fmt(bank.qty(c.seed))}) &middot; ${fmtTime(farming.growthTime(c))}`}</div></div>
          <button class="btn xs ${ok ? 'solid' : ''}" data-crop="${c.id}" ${ok ? '' : 'disabled'}>Plant</button></div>`;
      })
      .join('');
    h.set(`<p class="small muted" style="margin-top:0">Seeds come from the market, Spore Clusters (Gas Harvesting), Salvaging and Exploration.</p>${rows}
      <label class="toggle"><span>Plant in every empty bay</span><input type="checkbox" data-all ${plotIndex === null ? 'checked' : ''}><span class="sw"></span></label>`);
  };
  openModal({
    title: 'Choose a crop',
    onOpen(h) {
      render(h);
      h.body.addEventListener('click', (e) => {
        const b = e.target.closest('[data-crop]');
        if (!b) return;
        const all = h.body.querySelector('[data-all]')?.checked;
        lastCrop = b.dataset.crop;
        let planted = 0;
        if (all) {
          G.state.farming.plots.forEach((p, i) => {
            if (!p.crop && farming.canPlant(lastCrop).ok && farming.plant(i, lastCrop)) planted++;
          });
        } else if (farming.plant(plotIndex, lastCrop)) planted++;
        if (planted) h.close();
      });
    },
  });
}

export default {
  render(root) {
    const plots = G.state.farming.plots;
    const ready = farming.readyCount();
    const empty = plots.filter((p) => !p.crop).length;
    root.innerHTML = `<div class="page">
      ${skillHeader(XENO)}
      <div class="panel"><div class="ph">${icon('xenobiology')} Hydroponics<div class="ph-right"><span class="small">${plots.length} bays</span></div></div>
        <div class="row wrap">
          <button class="btn solid" data-act="harvest-all" ${ready ? '' : 'disabled'}>Harvest all (${ready})</button>
          <button class="btn" data-act="plant-all" ${empty ? '' : 'disabled'}>Plant empty bays (${empty})</button>
          <label class="toggle" style="border:none;padding:0;gap:10px"><span class="small upper">Auto-replant</span><input type="checkbox" data-act="replant" ${G.state.settings.autoReplant ? 'checked' : ''}><span class="sw"></span></label>
          <span class="spacer"></span>
          <span class="row small">${itemIcon('nutrient_gel', 'sm')} Nutrient Gel <b data-b="qty" data-item="nutrient_gel">${fmtShort(bank.qty('nutrient_gel'))}</b></span>
        </div>
        <p class="small muted" style="margin-bottom:0">Crops grow in real time, including while you are offline. Every crop starts with a 50% chance to survive; each Nutrient Gel adds 10%. Harvests give XP per item.</p>
      </div>
      <div class="grid narrow">${plots.map(plotCard).join('')}${lockedPlot()}</div>
      <div class="section-title">Crops</div>
      <div class="grid">${SKILLS[XENO].actions.map(cropCard).join('')}</div>
    </div>`;
    lastSig = sig();
  },

  click(t) {
    const act = t.dataset.act;
    const i = t.dataset.plot !== undefined ? +t.dataset.plot : null;
    if (act === 'plant') seedPicker(i);
    else if (act === 'plant-all') seedPicker(null);
    else if (act === 'gel') farming.addGel(i);
    else if (act === 'harvest') {
      const r = farming.harvest(i);
      if (!r.ok) toast(`<span>${esc(r.reason)}</span>`, 'bad');
    } else if (act === 'harvest-all') {
      const r = farming.harvestAll();
      const got = Object.entries(r.items).map(([id, n]) => `${fmt(n)} ${esc(ITEMS[id].name)}`).join(', ');
      if (got) toast(`<span>Harvested ${got}</span>`, 'gain', 5000);
      if (r.failed) toast(`<span>${r.failed} crop${r.failed > 1 ? 's' : ''} withered.</span>`, 'bad');
    } else if (act === 'unlock') farming.unlockPlot();
    else if (act === 'pool') poolModal(XENO);
    else if (act === 'booster') boosterModal(XENO);
  },

  change(t) {
    if (t.dataset.act === 'replant') G.state.settings.autoReplant = t.checked;
  },

  tick() {
    if (sig() !== lastSig) {
      const root = document.getElementById('content');
      this.render(root);
      updateBindings(root);
    }
  },

  events: {
    farm: true,
    levelup: (d) => d.skill === XENO,
    boosters: true,
  },
};
