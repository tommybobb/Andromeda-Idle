// Generic page for action skills: Mining, Gas Harvesting, Salvaging,
// Exploration, Refining, Fabrication, Chemistry, Engineering, Trading, Research.

import { G } from '../../game/state.js';
import { SKILLS } from '../../data/skills.js';
import { ITEMS } from '../../data/items.js';
import { SHIPS } from '../../data/ships.js';
import { TECHS, techCost } from '../../data/research.js';
import { esc, fmt, fmtShort, fmt1 } from '../../core/util.js';
import { icon, itemIcon, shipArt } from '../icons.js';
import { skillHeader, ioRow, pill, masteryRow, progressBar, poolModal, boosterModal, lootModal, actionMeta } from '../parts.js';
import { skillLevel } from '../../game/progress.js';
import { describeMods, mod } from '../../game/modifiers.js';
import * as bank from '../../game/bank.js';
import { startAction, actionInterval, rockMax, salvageChance, finesse, tonnage, preserveChance, doubleChance, notify } from '../../game/engine.js';
import { buyTech } from '../../game/services.js';
import { starInfo } from '../../game/exploration.js';
import { updateBindings } from '../bind.js';

const filters = {};
let researchTab = 'studies';
let lastSig = '';

const CATEGORIES = {
  engineering: [['all', 'All'], ['laser', 'Lasers'], ['harvester', 'Harvesters'], ['salvage', 'Salvage'], ['scanner', 'Scanners'], ['fsd', 'Jump Drives'], ['cargo', 'Cargo'], ['utility', 'Utility'], ['ships', 'Ships']],
  chemistry: [['all', 'All'], ['fuel', 'Fuel'], ['booster', 'Boosters'], ['supply', 'Supplies']],
};

function mainItem(skillId, act) {
  if (act.commodity) return act.commodity;
  if (act.outputs?.length) return act.outputs[0].id;
  return null;
}

function lockedCard(skillId, act) {
  const id = mainItem(skillId, act);
  return `<div class="card locked">
    <span class="state-tag lock">LOCKED</span>
    <div class="card-top">
      <div class="ico-wrap">${act.ship ? icon('lock', 'ico') : id ? itemIcon(id) : icon('lock', 'ico')}</div>
      <div class="card-title"><div class="name">${esc(act.name)}</div><div class="sub">Requires ${esc(SKILLS[skillId].name)} level ${act.level}</div></div>
    </div>
  </div>`;
}

function cardBody(skillId, act) {
  const sk = SKILLS[skillId];
  switch (sk.handler) {
    case 'gather': {
      let html = ioRow(null, act.outputs);
      if (skillId === 'mining') {
        html += `<div class="kv small"><span>Integrity</span><span data-b="rock" data-action="${act.id}">${rockMax(act)}</span></div>
          <div class="bar thin green"><i data-b="rock-bar" data-action="${act.id}"></i></div>`;
      }
      const dbl = doubleChance(skillId, act);
      if (dbl) html += `<div class="kv small"><span>Double chance</span><span>${fmt1(dbl)}%</span></div>`;
      return html;
    }
    case 'salvage':
      return `<div class="kvs">
          <div class="kv small"><span>Hazard / your Finesse</span><span>${act.perception} / ${fmt(finesse(act))}</span></div>
          <div class="kv small"><span>Success chance</span><b data-b="salvage-chance" data-action="${act.id}">${fmt1(salvageChance(act))}%</b></div>
          <div class="kv small"><span>Credits</span><span>${fmt(act.credits[0])} to ${fmt(act.credits[1])} CR</span></div>
        </div>
        <button class="btn xs alt" data-act="loot" data-action="${act.id}">Loot table</button>`;
    case 'explore':
      return `${ioRow(act.inputs, act.outputs)}
        ${act.inputs.length ? `<div class="kv small"><span>Fuel preservation</span><span>${fmt1(preserveChance(skillId, act))}%</span></div>` : '<div class="small muted">No fuel needed.</div>'}
        <button class="btn xs alt" data-act="loot" data-action="${act.id}">Possible finds</button>`;
    case 'trade': {
      const item = ITEMS[act.commodity];
      return `<div class="io">${pill(act.commodity, bank.qty(act.commodity))}</div>
        <div class="kvs">
          <div class="kv small"><span>Margin</span><span>${fmt1(act.margin)}x market (${fmt(item.sell)} CR)</span></div>
          <div class="kv small"><span>Next run</span><span><span data-b="trade-units" data-action="${act.id}"></span> t for <b class="gold"><span data-b="trade-value" data-action="${act.id}"></span> CR</b></span></div>
        </div>`;
    }
    default: {
      let html = '';
      if (act.ship) {
        const ship = SHIPS[act.ship];
        html += `<div class="ship-art" style="height:70px">${shipArt(ship.hull, ship.color)}</div>`;
        if (G.state.ships.owned.includes(act.ship)) html += '<div class="small good">Already in your hangar.</div>';
      }
      html += ioRow(act.inputs, act.outputs);
      if (act.outputs?.[0] && ITEMS[act.outputs[0].id]?.module) {
        html += `<div class="chips">${describeMods(ITEMS[act.outputs[0].id].module.mods).map((t) => `<span class="chip">${esc(t)}</span>`).join('')}</div>`;
      }
      return html;
    }
  }
}

function card(skillId, act) {
  const sk = SKILLS[skillId];
  const active = G.state.active?.skill === skillId && G.state.active.action === act.id;
  const id = mainItem(skillId, act);
  const interval = actionInterval(skillId, act);
  const art = act.ship ? itemIcon('precursor_core') : id ? itemIcon(id) : icon(skillId, 'ico');
  const colour = id ? ITEMS[id]?.color : SHIPS[act.ship]?.color;
  return `<div class="card click ${active ? 'active' : ''}" data-act="start" data-action="${act.id}" role="button" tabindex="0">
    ${active ? '<span class="state-tag">ACTIVE</span>' : ''}
    <div class="card-top">
      <div class="ico-wrap" style="--c:${colour || 'var(--hud)'}">${art}</div>
      <div class="card-title"><div class="name">${esc(act.name)}</div><div class="sub">${actionMeta(skillId, act, interval)}</div></div>
    </div>
    ${cardBody(skillId, act)}
    ${masteryRow(skillId, act.id)}
    <div class="card-foot"><span class="go-label">${active ? '&#9632; Stop' : `&#9654; ${esc(sk.verb)}`}</span></div>
    ${progressBar(skillId, act.id)}
  </div>`;
}

function actionsGrid(skillId) {
  const sk = SKILLS[skillId];
  const lvl = skillLevel(skillId);
  const cats = CATEGORIES[skillId];
  const filter = filters[skillId] || 'all';
  let list = sk.actions;
  if (cats && filter !== 'all') list = list.filter((a) => a.category === filter);
  const unlocked = list.filter((a) => a.level <= lvl);
  const locked = list.filter((a) => a.level > lvl).sort((a, b) => a.level - b.level).slice(0, 3);
  const chips = cats
    ? `<div class="chips">${cats.map(([id, label]) => `<button class="chip ${filter === id ? 'on' : ''}" data-act="filter" data-filter="${id}">${label}</button>`).join('')}</div>`
    : '';
  return `${chips}<div class="grid">${unlocked.map((a) => card(skillId, a)).join('')}${locked.map((a) => lockedCard(skillId, a)).join('')}</div>`;
}

// ---------------------------------------------------------------------------
// Skill-specific panels

function explorationPanel() {
  const ex = G.state.explore;
  const stars = Object.entries(ex.stars).sort((a, b) => b[1] - a[1]);
  const log = ex.log.slice(0, 8).map((s) => {
    const info = starInfo(s.star);
    return `<tr><td><span class="star-dot" style="color:${info.color}"></span>${esc(s.name)}</td><td class="small muted">${esc(info.name)}</td><td class="num">${s.bodies}</td><td class="small ${s.finds.length ? 'gold' : 'muted'}">${s.finds.length ? esc(s.finds.join(', ')) : esc(s.region)}</td></tr>`;
  }).join('');
  return `<div class="grid two">
    <div class="panel"><div class="ph">${icon('star')} Recent discoveries<div class="ph-right"><span class="small">${fmt(ex.total)} systems</span></div></div>
      ${log ? `<div class="table-wrap"><table class="table"><thead><tr><th>System</th><th>Primary</th><th class="num">Bodies</th><th>Notes</th></tr></thead><tbody>${log}</tbody></table></div>` : '<div class="muted small">Start scanning to fill your logbook.</div>'}
    </div>
    <div class="panel"><div class="ph">Stellar census</div>
      ${stars.length ? `<div class="chips">${stars.map(([cls, n]) => `<span class="chip"><span class="star-dot" style="color:${starInfo(cls).color}"></span>${esc(starInfo(cls).name)} ${fmt(n)}</span>`).join('')}</div>` : '<div class="muted small">No stars catalogued yet.</div>'}
      <p class="small muted">Black holes, neutron stars and rare worlds return valuable survey data that sells well or feeds Research.</p>
    </div>
  </div>`;
}

function tradingPanel() {
  const ship = SHIPS[G.state.ships.active];
  return `<div class="panel"><div class="ph">${icon('hangar')} Hauling capacity</div>
    <div class="row wrap" style="gap:24px">
      <div><div class="tiny muted upper">Active ship</div><b>${esc(ship.name)}</b></div>
      <div><div class="tiny muted upper">Tonnage per run</div><b data-b="tonnage">${fmt(tonnage())} t</b></div>
      <div><div class="tiny muted upper">Trade profit bonus</div><b>${fmt1(mod('tradeProfit', 'trading'))}%</b></div>
    </div>
    <p class="small muted">Bigger haulers and Cargo Rack modules carry more per run. Each run sells as much as your hold allows, so the XP is the same but the credits scale with tonnage.</p>
  </div>`;
}

function techPanel() {
  const lvl = skillLevel('research');
  const rp = bank.qty('research_point');
  const rows = TECHS.map((t) => {
    const rank = G.state.research[t.id] || 0;
    const maxed = rank >= t.max;
    const cost = techCost(t, rank);
    const locked = lvl < t.level;
    const affordable = !maxed && !locked && rp >= cost.rp && G.state.credits >= cost.credits;
    const pips = Array.from({ length: t.max }, (_, i) => `<i class="${i < rank ? 'on' : ''}"></i>`).join('');
    return `<div class="card ${locked ? 'locked' : ''}">
      <div class="card-top"><div class="ico-wrap">${icon('research', 'ico')}</div>
        <div class="card-title"><div class="name">${esc(t.name)}</div><div class="sub">${locked ? `Requires Research ${t.level}` : esc(t.desc)}</div></div></div>
      <div class="row between"><div class="pips">${pips}</div><span class="small">Rank ${rank} / ${t.max}</span></div>
      ${maxed ? '<div class="small gold upper">Fully researched</div>' : `<div class="kv small"><span>Next rank</span><span>${fmt(cost.rp)} RP + ${fmtShort(cost.credits)} CR</span></div>
      <button class="btn sm ${affordable ? 'solid' : ''}" data-act="tech" data-tech="${t.id}" ${affordable ? '' : 'disabled'}>Research</button>`}
    </div>`;
  }).join('');
  return `<div class="panel"><div class="ph">${icon('research')} Tech Lab<div class="ph-right">${itemIcon('research_point', 'sm')}<b data-b="qty" data-item="research_point">${fmt(rp)}</b> RP</div></div>
    <p class="small muted" style="margin-top:0">Permanent upgrades. Every rank stacks.</p>
    <div class="grid">${rows}</div></div>`;
}

function techSig() {
  const lvl = skillLevel('research');
  const rp = bank.qty('research_point');
  return TECHS.map((t) => {
    const rank = G.state.research[t.id] || 0;
    const c = techCost(t, rank);
    return `${rank}${lvl >= t.level ? 1 : 0}${rp >= c.rp && G.state.credits >= c.credits ? 1 : 0}`;
  }).join('');
}

// ---------------------------------------------------------------------------

export default {
  render(root, skillId) {
    const sk = SKILLS[skillId];
    let extra = '';
    let body = actionsGrid(skillId);
    if (skillId === 'exploration') extra = `<div id="explore-panel">${explorationPanel()}</div>`;
    if (skillId === 'trading') extra = tradingPanel();
    if (skillId === 'research') {
      const tabs = `<div class="tabs"><button class="tab ${researchTab === 'studies' ? 'on' : ''}" data-act="rtab" data-tab="studies">Studies</button><button class="tab ${researchTab === 'tech' ? 'on' : ''}" data-act="rtab" data-tab="tech">Tech Lab</button></div>`;
      body = tabs + (researchTab === 'tech' ? `<div id="tech-panel">${techPanel()}</div>` : actionsGrid(skillId));
    }
    root.innerHTML = `<div class="page">
      ${skillHeader(skillId)}
      ${extra}
      <div class="section-title">${esc(sk.name === 'Research' ? 'Laboratory' : 'Operations')}</div>
      ${body}
    </div>`;
    lastSig = skillId === 'research' ? techSig() : skillId === 'exploration' ? String(G.state.explore.total) : '';
  },

  click(t, e, skillId) {
    const act = t.dataset.act;
    if (act === 'start') {
      const card = SKILLS[skillId].actionMap[t.dataset.action];
      if (card && skillLevel(skillId) < card.level) return notify(`Requires ${SKILLS[skillId].name} level ${card.level}.`, 'bad');
      startAction(skillId, t.dataset.action);
    } else if (act === 'loot') {
      e.stopPropagation();
      const a = SKILLS[skillId].actionMap[t.dataset.action];
      if (skillId === 'salvaging') lootModal(`${a.name} loot`, a.loot, { chancePct: SKILLS.salvaging.lootChance, note: 'Rolled on every successful salvage, alongside the credits.' });
      else lootModal(`${a.name} finds`, a.loot, { chancePct: SKILLS.exploration.rareChance, note: 'Rolled on every scan, on top of the survey data.' });
    } else if (act === 'pool') poolModal(skillId);
    else if (act === 'booster') boosterModal(skillId);
    else if (act === 'filter') {
      filters[skillId] = t.dataset.filter;
      this.render(document.getElementById('content'), skillId);
      updateBindings(document.getElementById('content'));
    } else if (act === 'rtab') {
      researchTab = t.dataset.tab;
      this.render(document.getElementById('content'), skillId);
      updateBindings(document.getElementById('content'));
    } else if (act === 'tech') {
      if (buyTech(t.dataset.tech)) {
        const panel = document.getElementById('tech-panel');
        if (panel) panel.innerHTML = techPanel();
        lastSig = techSig();
      }
    }
  },

  tick(skillId) {
    if (skillId === 'exploration') {
      const sig = String(G.state.explore.total);
      if (sig !== lastSig) {
        lastSig = sig;
        const p = document.getElementById('explore-panel');
        if (p) p.innerHTML = explorationPanel();
      }
    } else if (skillId === 'research' && researchTab === 'tech') {
      const sig = techSig();
      if (sig !== lastSig) {
        lastSig = sig;
        const p = document.getElementById('tech-panel');
        if (p) {
          p.innerHTML = techPanel();
          updateBindings(p);
        }
      }
    }
  },

  events: {
    action: true,
    levelup: (d, skillId) => d.skill === skillId || d.skill === 'piloting',
    boosters: true,
    ships: true,
    research: true,
    masterylevel: (d, skillId) => d.skill === skillId && (d.level === 99 || d.level % 10 === 0),
  },
};

