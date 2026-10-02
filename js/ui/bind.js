// Live bindings: elements tagged with data-b="type" are refreshed in place
// several times a second, so pages only re-render when their structure changes.

import { G } from '../game/state.js';
import { SKILLS, getAction } from '../data/skills.js';
import { ITEMS } from '../data/items.js';
import { levelProgress, MAX_MASTERY } from '../core/xp.js';
import { fmt, fmtShort, fmtTime, fmt1 } from '../core/util.js';
import * as bank from '../game/bank.js';
import { poolPct } from '../game/modifiers.js';
import { masteryXP } from '../game/progress.js';
import { getRock, rockMax, salvageChance, tonnage, tradeValue, actionInterval, activeBlock } from '../game/engine.js';
import { timeLeft, growthTime, plotState, survivalChance } from '../game/farming.js';

function text(el, v) {
  if (el._v !== v) {
    el._v = v;
    el.textContent = v;
  }
}

function width(el, frac) {
  const v = `${Math.max(0, Math.min(1, frac)) * 100}%`;
  if (el._w !== v) {
    el._w = v;
    el.style.width = v;
  }
}

function toggle(el, cls, on) {
  if (el.classList.contains(cls) !== on) el.classList.toggle(cls, on);
}

const B = {
  credits: (el) => text(el, fmt(G.state.credits)),
  'credits-short': (el) => text(el, fmtShort(G.state.credits)),
  cargo: (el) => text(el, `${bank.usedSlots()} / ${bank.capacity()}`),
  qty: (el) => text(el, fmt(bank.qty(el.dataset.item))),
  'qty-short': (el) => text(el, fmtShort(bank.qty(el.dataset.item))),
  need: (el) => {
    const have = bank.qty(el.dataset.item);
    const need = +el.dataset.need;
    text(el, `${fmtShort(have)}/${fmtShort(need)}`);
    toggle(el.closest('.pill, .req') || el, 'lack', have < need);
  },
  level: (el) => text(el, String(levelProgress(G.state.skills[el.dataset.skill].xp).level)),
  'xp-text': (el) => {
    const p = levelProgress(G.state.skills[el.dataset.skill].xp);
    text(el, p.span ? `${fmt(p.into)} / ${fmt(p.span)} XP` : `${fmt(G.state.skills[el.dataset.skill].xp)} XP (max)`);
  },
  'xp-total': (el) => text(el, fmt(G.state.skills[el.dataset.skill].xp)),
  'xp-bar': (el) => width(el, levelProgress(G.state.skills[el.dataset.skill].xp).pct),
  pool: (el) => text(el, `${fmt1(poolPct(el.dataset.skill) * 100)}%`),
  'pool-xp': (el) => text(el, fmt(G.state.skills[el.dataset.skill].pool)),
  'pool-bar': (el) => width(el, poolPct(el.dataset.skill)),
  mlevel: (el) => text(el, String(levelProgress(masteryXP(el.dataset.skill, el.dataset.action), MAX_MASTERY).level)),
  'm-bar': (el) => width(el, levelProgress(masteryXP(el.dataset.skill, el.dataset.action), MAX_MASTERY).pct),
  progress: (el) => {
    const a = G.state.active;
    if (a && a.skill === el.dataset.skill && a.action === el.dataset.action) {
      const act = getAction(a.skill, a.action);
      width(el, a.progress / actionInterval(a.skill, act));
    } else width(el, 0);
  },
  rock: (el) => {
    const act = getAction('mining', el.dataset.action);
    const r = getRock(act);
    const max = rockMax(act);
    if (r.respawnAt) text(el, `Respawning ${fmtTime(r.respawnAt - G.state.time + 999)}`);
    else text(el, `${r.hp} / ${max}`);
  },
  'rock-bar': (el) => {
    const act = getAction('mining', el.dataset.action);
    const r = getRock(act);
    width(el, r.respawnAt ? 1 - (r.respawnAt - G.state.time) / act.respawn : r.hp / rockMax(act));
    toggle(el.parentElement, 'red', !!r.respawnAt);
  },
  'salvage-chance': (el) => text(el, `${fmt1(salvageChance(getAction('salvaging', el.dataset.action)))}%`),
  'trade-units': (el) => {
    const act = getAction('trading', el.dataset.action);
    text(el, fmt(Math.min(bank.qty(act.commodity), tonnage(act))));
  },
  'trade-value': (el) => {
    const act = getAction('trading', el.dataset.action);
    text(el, fmt(tradeValue(act, Math.min(bank.qty(act.commodity), tonnage(act)))));
  },
  tonnage: (el) => text(el, `${fmt(tonnage())} t`),
  'plot-time': (el) => {
    const plot = G.state.farming.plots[+el.dataset.plot];
    text(el, plot?.crop ? (plotState(plot) === 'ready' ? 'Ready' : fmtTime(timeLeft(plot) + 999)) : '');
  },
  'plot-bar': (el) => {
    const plot = G.state.farming.plots[+el.dataset.plot];
    if (!plot?.crop) return width(el, 0);
    const total = growthTime(SKILLS.xenobiology.actionMap[plot.crop]);
    width(el, 1 - timeLeft(plot) / total);
  },
  'plot-chance': (el) => {
    const plot = G.state.farming.plots[+el.dataset.plot];
    if (plot?.crop) text(el, `${Math.round(survivalChance(plot))}%`);
  },
  'booster-charges': (el) => {
    const b = G.state.boosters[el.dataset.slot];
    text(el, b ? fmt(b.charges) : '0');
  },
  'block-reason': (el) => {
    const b = activeBlock();
    text(el, b ? `${b.reason} (${fmtTime(b.until - G.state.time + 999)})` : '');
  },
  'item-value': (el) => text(el, fmt(bank.salePrice(el.dataset.item) * bank.qty(el.dataset.item))),
  'cargo-value': (el) => {
    let v = 0;
    for (const id in G.state.bank) v += (ITEMS[id]?.sell || 0) * G.state.bank[id];
    text(el, fmtShort(v));
  },
};

export function updateBindings(root = document) {
  for (const el of root.querySelectorAll('[data-b]')) {
    const fn = B[el.dataset.b];
    if (fn) fn(el);
  }
}

// Called every animation frame, only for the smooth progress bars.
export function updateProgress(root = document) {
  for (const el of root.querySelectorAll('[data-b="progress"]')) B.progress(el);
}
