// Economy model. Drives the real engine with fixed setups and reports what
// every action is worth, how long each skill takes to 99, what crafted goods
// really cost in action time, where the credits go, and items that have no
// source or no use. Rerun it after any data change.
//
//   node tools/economy.mjs                  full run
//   node tools/economy.mjs --quick          shorter simulations, noisier rare drops
//   node tools/economy.mjs --json out.json  also write the raw numbers
//   node tools/economy.mjs --seed 7         different random seed (default 1)
//
// Randomness is seeded, so the same data gives the same report and a saved
// report can be diffed after a balance change.
//
// Every action is measured twice:
//   typical  skill at the action's level, mastery 40 (about an hour on the
//            action), empty pool, and the ship and module grade a player
//            would plausibly have at that level
//   endgame  99 everywhere, full pool, A-grade modules, best ship for the job,
//            every tech and companion
// Skill XP, piloting and mastery are frozen during a measurement so rates do
// not drift. Boosters are not used.

import { writeFileSync } from 'node:fs';
import { G, newState } from '../js/game/state.js';
import { useState } from '../js/game/save.js';
import { SKILLS, SKILL_ORDER, PILOT_XP_SHARE } from '../js/data/skills.js';
import { ITEMS, GRADES } from '../js/data/items.js';
import { SHIPS, SHIP_ORDER, SHIP_RECIPES, shipSlotKeys, slotTypeOf } from '../js/data/ships.js';
import { TECHS, techCost } from '../js/data/research.js';
import { COMPANIONS } from '../js/data/companions.js';
import { ACHIEVEMENTS } from '../js/data/achievements.js';
import { SHOP_SECTIONS, cargoExpansionCost, CARGO_MAX_EXPANSIONS } from '../js/data/shop.js';
import { XP_TABLE, levelFromXP } from '../js/core/xp.js';
import { on } from '../js/core/events.js';
import * as engine from '../js/game/engine.js';
import { invalidateMods, poolCap } from '../js/game/modifiers.js';

const HOUR = 3600000;
const argv = process.argv.slice(2);

// Mulberry32: small, fast and good enough for loot rolls.
let seed = argv.includes('--seed') ? Number(argv[argv.indexOf('--seed') + 1]) >>> 0 : 1;
Math.random = () => {
  seed = (seed + 0x6d2b79f5) >>> 0;
  let t = seed;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const QUICK = argv.includes('--quick');
const jsonPath = argv.includes('--json') ? argv[argv.indexOf('--json') + 1] : null;
const SIM_HOURS = { gather: 12, salvage: 12, explore: 12, craft: 2, trade: 1 };
if (QUICK) for (const k in SIM_HOURS) SIM_HOURS[k] = Math.min(SIM_HOURS[k], 1);
const TYPICAL_MASTERY = 40;

const sell = (id) => ITEMS[id]?.sell || 0;
const name = (id) => ITEMS[id]?.name || id;
const n0 = (n) => Math.round(n).toLocaleString('en-GB');
const n1 = (n) => (Math.abs(n) >= 100 ? n0(n) : (Math.round(n * 10) / 10).toLocaleString('en-GB'));
const hrs = (h) => (h >= 48 ? `${n0(h)}h (${n1(h / 24)}d)` : `${n1(h)}h`);
const maxBy = (list, f) => list.reduce((best, x) => (best === null || f(x) > f(best) ? x : best), null);

// ---------------------------------------------------------------------------
// Setups

const SPECIALISTS = {
  mining: ['prospector', 'behemoth'],
  gas: ['nimbus'],
  salvaging: ['scavenger'],
  exploration: ['wayfarer', 'horizon'],
  trading: ['mule', 'atlas'],
};
const ENDGAME_SHIP = { mining: 'behemoth', gas: 'nimbus', salvaging: 'scavenger', exploration: 'horizon' };
const SLOT_LINE = { laser: 'laser', harvester: 'harvester', salvage: 'salvager', scanner: 'scanner', fsd: 'fsd', cargo: 'cargo' };
const UTIL_LINE = { refining: 'refinery', fabrication: 'fabricator', chemistry: 'chemlab', xenobiology: 'hydroponics', engineering: 'workshop', trading: 'tradecomp', research: 'labmodule' };

function setupFor(skillId, level, endgame) {
  if (endgame) {
    return { skill: 99, pilot: 99, mastery: 99, pool: 1, ship: ENDGAME_SHIP[skillId] || 'andromeda', grade: 4, utility: true, techs: 5, companions: true };
  }
  // Piloting earns a quarter of ship XP, so it trails a little behind.
  const pilot = Math.max(1, level - 5);
  let ship = 'kestrel';
  for (const id of SPECIALISTS[skillId] || ['foundry']) if (SHIPS[id].pilot <= pilot) ship = id;
  const grade = [20, 40, 60, 80].filter((t) => level >= t).length;
  return { skill: level, pilot, mastery: TYPICAL_MASTERY, pool: 0, ship, grade, utility: false, techs: 0, companions: false };
}

function loadoutFor(ship, setup, skillId) {
  const g = GRADES[setup.grade].toLowerCase();
  const util = setup.utility ? [...new Set([UTIL_LINE[skillId], 'copilot', ...Object.values(UTIL_LINE)].filter(Boolean))] : [];
  const lo = {};
  for (const key of shipSlotKeys(ship)) {
    const type = slotTypeOf(key);
    if (type !== 'utility') lo[key] = `mod_${SLOT_LINE[type]}_${g}`;
    else if (util.length) lo[key] = `util_${util.shift()}_a`;
  }
  return lo;
}

function buildState(skillId, actionId, setup) {
  const S = newState('Model');
  useState(S);
  S.cargoBought = CARGO_MAX_EXPANSIONS;
  S.bank = {};
  S.skills[skillId].xp = XP_TABLE[setup.skill];
  S.skills.piloting.xp = Math.max(S.skills.piloting.xp, XP_TABLE[setup.pilot]);
  S.skills[skillId].mastery[actionId] = XP_TABLE[setup.mastery];
  S.skills[skillId].pool = poolCap(skillId) * setup.pool;
  const ship = SHIPS[setup.ship];
  S.ships.owned = [ship.id];
  S.ships.active = ship.id;
  S.ships.loadouts = { [ship.id]: loadoutFor(ship, setup, skillId) };
  if (setup.techs) for (const t of TECHS) S.research[t.id] = setup.techs;
  if (setup.companions) for (const c of COMPANIONS) S.companions[c.id] = 1;
  invalidateMods();
  return S;
}

// ---------------------------------------------------------------------------
// Measuring. After every completed action the meter books the XP gained and
// puts levels, mastery, pool and companions back where they started.

let meter = null;

on('complete', () => {
  if (!meter) return;
  const S = G.state;
  const b = meter.base;
  const sk = S.skills[meter.skill];
  const pl = S.skills.piloting;
  meter.xp += sk.xp - b.xp;
  meter.mxp += (sk.mastery[meter.action] || 0) - b.mxp;
  meter.pilotXp += pl.xp - b.pilot;
  meter.done++;
  let dirty = levelFromXP(pl.xp) !== levelFromXP(b.pilot);
  sk.xp = b.xp;
  sk.mastery[meter.action] = b.mxp;
  sk.pool = b.pool;
  pl.xp = b.pilot;
  if (Object.keys(S.companions).length !== b.companions.length) {
    S.companions = Object.fromEntries(b.companions.map((c) => [c, 1]));
    dirty = true;
  }
  if (dirty) invalidateMods();
});

function measure(skillId, act, setup) {
  const sk = SKILLS[skillId];
  const S = buildState(skillId, act.id, setup);
  for (const i of act.inputs || []) S.bank[i.id] = 1e12;
  if (act.commodity) S.bank[act.commodity] = 1e12;
  const hours = SIM_HOURS[sk.handler];
  G.silent = true;
  G.summary = { items: {}, credits: 0, levels: {}, systems: 0, companions: [], stopped: null };
  meter = {
    skill: skillId, action: act.id, xp: 0, mxp: 0, pilotXp: 0, done: 0,
    base: { xp: S.skills[skillId].xp, mxp: S.skills[skillId].mastery[act.id], pool: S.skills[skillId].pool, pilot: S.skills.piloting.xp, companions: Object.keys(S.companions) },
  };
  if (!engine.startAction(skillId, act.id)) throw new Error(`Could not start ${skillId}/${act.id}`);
  for (let left = hours * HOUR; left > 0 && G.state.active; left -= HOUR) engine.advance(Math.min(HOUR, left));
  const items = {};
  for (const [id, n] of Object.entries(G.summary.items)) if (n) items[id] = n / hours;
  const r = {
    skill: skillId, action: act.id, name: act.name, level: act.level, handler: sk.handler,
    actions: meter.done / hours, xp: meter.xp / hours, mxp: meter.mxp / hours, pilotXp: meter.pilotXp / hours,
    credits: G.summary.credits / hours, items, stopped: G.summary.stopped,
    interval: engine.actionInterval(skillId, act),
  };
  r.gross = r.credits + Object.entries(items).reduce((s, [id, n]) => s + (n > 0 ? n * sell(id) : 0), 0);
  r.inputValue = Object.entries(items).reduce((s, [id, n]) => s + (n < 0 ? -n * sell(id) : 0), 0);
  meter = null;
  G.summary = null;
  G.silent = false;
  return r;
}

// ---------------------------------------------------------------------------
// Chain costs: action-seconds to make one unit by the cheapest dedicated route,
// counting the time to make every input. Co-products are ignored, so a rare
// drop is costed as if you farmed it on purpose.

function chainCosts(rows) {
  const cost = {};
  const via = {};
  for (let pass = 0; pass < 20; pass++) {
    let changed = false;
    for (const r of rows) {
      let inputSecs = 0;
      let ok = true;
      for (const [id, n] of Object.entries(r.items)) {
        if (n >= 0) continue;
        if (cost[id] === undefined) ok = false;
        else inputSecs += -n * cost[id];
      }
      if (!ok) continue;
      for (const [id, n] of Object.entries(r.items)) {
        if (n <= 0) continue;
        const c = ((r.secs ?? 3600) + inputSecs) / n;
        if (cost[id] === undefined || c < cost[id] - 1e-9) {
          cost[id] = c;
          via[id] = r;
          changed = true;
        }
      }
    }
    if (!changed) break;
  }
  return { cost, via };
}

// Effort-inclusive rates: everything per hour of total action time, including
// the time spent making the inputs.
function effortHours(r, cost) {
  let secs = r.secs ?? 3600;
  for (const [id, n] of Object.entries(r.items)) if (n < 0) secs += cost[id] === undefined ? Infinity : -n * cost[id];
  return secs / 3600;
}

// Crops grow beside the action, so they cost no action time, but the bays can
// only grow so many. An action that eats crops faster than the bays you can own
// at its level can grow them is slowed to the farm's pace.
const CROP_OF = Object.fromEntries(SKILLS.xenobiology.actions.map((c) => [c.output, c]));
const cropsPerBayHour = (c, mastery) => ((5.5 + Math.floor(mastery / 10)) * Math.min(1, (50 + mastery / 2) / 100) * 3600) / c.growth;
const baysAt = (level) => SKILLS.xenobiology.plots.filter((pl) => pl.level <= level).length;

function baysNeeded(r, mastery) {
  let bays = 0;
  for (const [id, n] of Object.entries(r.items)) if (n < 0 && CROP_OF[id]) bays += -n / cropsPerBayHour(CROP_OF[id], mastery);
  return bays;
}

// Real hours one hour of the action costs: making the inputs, or waiting on the farm.
function realHours(r, cost, mastery = TYPICAL_MASTERY, level = r.level) {
  return Math.max(effortHours(r, cost), baysNeeded(r, mastery) / baysAt(level));
}

// ---------------------------------------------------------------------------
// Run

const t0 = Date.now();
const typical = [];
const endgame = [];
for (const id of SKILL_ORDER) {
  const sk = SKILLS[id];
  if (sk.kind !== 'action') continue;
  for (const act of sk.actions) {
    if (act.ship) continue;
    typical.push(measure(id, act, setupFor(id, act.level, false)));
    endgame.push(measure(id, act, setupFor(id, 99, true)));
  }
}
// Xenobiology runs beside the action, so a crop costs no action time beyond its
// seeds. Seeds sold at the market are treated as free in action time.
function farmRows(mastery) {
  const crops = SKILLS.xenobiology.actions.map((c) => {
    const crops = (5.5 + Math.floor(mastery / 10)) * Math.min(1, (50 + mastery / 2) / 100);
    return { skill: 'xenobiology', action: c.id, name: c.name, level: c.level, secs: 0, items: { [c.output]: crops, [c.seed]: -c.seedQty } };
  });
  const seeds = SHOP_SECTIONS.flatMap((sec) => sec.items).filter((e) => ITEMS[e.item].cat === 'seed')
    .map((e) => ({ skill: 'market', action: e.item, name: `Buy ${name(e.item)}`, level: 1, secs: 0, items: { [e.item]: 1 } }));
  return [...crops, ...seeds];
}
const typicalCosts = chainCosts([...typical, ...farmRows(TYPICAL_MASTERY)]);
const endgameCosts = chainCosts([...endgame, ...farmRows(99)]);
const skillName = (r) => SKILLS[r.skill]?.name || 'Market';

const out = [];
const p = (s = '') => out.push(s);
const table = (head, rows) => {
  p(`| ${head.join(' | ')} |`);
  p(`|${head.map((h, i) => (i ? ' ---: ' : ' --- ')).join('|')}|`);
  for (const row of rows) p(`| ${row.join(' | ')} |`);
  p();
};

p('# Andromeda Idle economy model');
p();
p(`Simulated hours per action: ${Object.entries(SIM_HOURS).map(([k, v]) => `${k} ${v}`).join(', ')}. Run \`npm run economy\` to regenerate.`);
p(`Typical setup: skill at the action's level, mastery ${TYPICAL_MASTERY}, specialist ship and module grade for that level. Endgame: everything maxed.`);
p('"Effort" rates divide by the real time an hour of the action costs: making its inputs at the same setup, or waiting for the hydroponics bays you can own at that level to grow its crops, whichever is longer.');
p();

// --- Per skill action tables -------------------------------------------------
p('## Every action');
p();
for (const id of SKILL_ORDER) {
  const sk = SKILLS[id];
  if (sk.kind !== 'action') continue;
  const rows = typical.filter((r) => r.skill === id);
  const ends = endgame.filter((r) => r.skill === id);
  p(`### ${sk.name}`);
  p();
  table(['Action', 'Lvl', 'Typical XP/h', 'XP/h per effort h', 'Typical CR value/h', 'Net of inputs', 'Endgame XP/h', 'Endgame CR value/h'],
    rows.map((r, i) => {
      const e = ends[i];
      const eff = realHours(r, typicalCosts.cost);
      return [r.name, r.level, n0(r.xp), isFinite(eff) ? n0(r.xp / eff) : 'n/a', n0(r.gross), n0(r.gross - r.inputValue), n0(e.xp), n0(e.gross)];
    }));
}

// --- XP curve checks -----------------------------------------------------------
p('## XP/h dips: an action that pays less XP/h than one unlocked earlier');
p();
const dips = [];
for (const id of SKILL_ORDER) {
  const rows = typical.filter((r) => r.skill === id).sort((a, b) => a.level - b.level);
  let best = null;
  for (const r of rows) {
    if (best && r.xp < best.xp * 0.98 && r.level > best.level) dips.push([SKILLS[id].name, `${r.name} (${r.level})`, n0(r.xp), `${best.name} (${best.level})`, n0(best.xp)]);
    if (!best || r.xp > best.xp) best = r;
  }
}
if (dips.length) table(['Skill', 'Action', 'XP/h', 'Better earlier action', 'XP/h'], dips);
else p('None.\n');

// --- Time to 99 ------------------------------------------------------------------
p('## Time to 99');
p();
p('Always doing the best XP/h action available at your level, typical setup. "Action time" assumes the inputs are already in the hold; "with inputs" adds the time to gather and make them yourself.');
p();
const ttRows = [];
for (const id of SKILL_ORDER) {
  const sk = SKILLS[id];
  if (sk.kind !== 'action') continue;
  const rows = typical.filter((r) => r.skill === id);
  const run = (rate) => {
    let h = 0;
    const path = [];
    for (let L = 1; L < 99; L++) {
      const best = maxBy(rows.filter((r) => r.level <= L && rate(r) > 0), rate);
      if (!best) return { h: Infinity, path };
      if (path.at(-1) !== best.name) path.push(best.name);
      h += (XP_TABLE[L + 1] - XP_TABLE[L]) / rate(best);
    }
    return { h, path };
  };
  const plain = run((r) => r.xp);
  const full = run((r) => r.xp / realHours(r, typicalCosts.cost));
  ttRows.push([sk.name, hrs(plain.h), isFinite(full.h) ? hrs(full.h) : 'n/a', plain.path.slice(-3).join(' > ')]);
}
table(['Skill', 'Action time', 'With inputs', 'Last steps of the path'], ttRows);

// Xenobiology runs on real time beside everything else.
{
  const sk = SKILLS.xenobiology;
  let h = 0;
  for (let L = 1; L < 99; L++) {
    const plots = sk.plots.filter((pl) => pl.level <= L).length;
    const best = maxBy(sk.actions.filter((c) => c.level <= L), (c) => (c.xp * (5.5 + Math.floor(TYPICAL_MASTERY / 10))) / c.growth);
    const xpPerHour = (plots * best.xp * (5.5 + Math.floor(TYPICAL_MASTERY / 10)) * 3600) / best.growth;
    h += (XP_TABLE[L + 1] - XP_TABLE[L]) / xpPerHour;
  }
  p(`Xenobiology (real time, every bay replanted the moment it is ready, 5 gel per crop): **${hrs(h)}** of wall-clock time.`);
  p();
  p(`Piloting gets ${PILOT_XP_SHARE * 100}% of ship XP, so 99 Piloting needs ${n0(XP_TABLE[99] / PILOT_XP_SHARE)} XP across the five ship skills (about ${n1(1 / PILOT_XP_SHARE)} of them at 99).`);
  p();
}

// --- Seeds: can you keep the bays full? --------------------------------------------
p('## Seed supply for Xenobiology');
p();
p('Action time on the best dedicated source to get enough seeds to plant one bay once, typical setup.');
p();
{
  const rows = SKILLS.xenobiology.actions.map((c) => {
    const secs = typicalCosts.cost[c.seed];
    const shop = SHOP_SECTIONS.flatMap((s) => s.items).find((e) => e.item === c.seed);
    const src = typicalCosts.via[c.seed];
    return [c.name, c.level, `${c.seedQty} x ${name(c.seed)}`, shop ? `shop ${n0(shop.price)} CR` : (secs ? `${n0(secs * c.seedQty)}s` : 'no source'), src && !shop ? `${skillName(src)}: ${src.name}` : '', n1(c.growth / 3600) + 'h'];
  });
  table(['Crop', 'Lvl', 'Seeds per bay', 'Cost', 'Best source', 'Grow time'], rows);
}

// --- Money ------------------------------------------------------------------------
p('## Making credits');
p();
p('Credits per hour of total effort, selling at the market or running the trade route, typical setup. The top five at each stage of the game.');
p();
const allTypical = typical.map((r) => ({ r, eff: realHours(r, typicalCosts.cost) })).filter((x) => isFinite(x.eff));
for (const cap of [10, 25, 40, 55, 70, 85, 99]) {
  const pool = allTypical.filter((x) => x.r.level <= cap).map((x) => ({ ...x, cr: x.r.gross / x.eff })).sort((a, b) => b.cr - a.cr).slice(0, 5);
  p(`**Up to level ${cap}:** ` + pool.map((x) => `${x.r.name} (${SKILLS[x.r.skill].name}) ${n0(x.cr)}`).join(', '));
  p();
}

p('### Trade routes against selling the same goods');
p();
{
  const rows = typical.filter((r) => r.handler === 'trade').map((r) => {
    const act = SKILLS.trading.actionMap[r.action];
    const c = typicalCosts.cost[act.commodity];
    const units = -(r.items[act.commodity] || 0);
    const eff = realHours(r, typicalCosts.cost);
    const sellRate = c ? (sell(act.commodity) * 3600) / Math.max(c, (baysNeeded({ items: { [act.commodity]: -1 } }, TYPICAL_MASTERY) / baysAt(r.level)) * 3600) : 0;
    return [r.name, r.level, name(act.commodity), n0(units / r.actions), n0(r.credits), n0(r.credits / eff), n0(sellRate), c ? `${n1(c)}s` : 'n/a'];
  });
  table(['Route', 'Lvl', 'Commodity', 'Units per run', 'CR/h (route only)', 'CR/h with sourcing', 'CR/h just selling it', 'Secs to make 1'], rows);
}

// --- Bottlenecks for the big builds -------------------------------------------------
p('## What the big builds really cost');
p();
p('Action hours to make everything from scratch. Rare drops are costed as if farmed on purpose.');
p();
{
  const build = (inputs, costs) => {
    let secs = 0;
    let worst = null;
    for (const { id, qty } of inputs) {
      const c = (costs[id] ?? Infinity) * qty;
      secs += c;
      if (!worst || c > worst.c) worst = { id, qty, c };
    }
    return { secs, worst };
  };
  const recipes = [...SHIP_RECIPES, ...['e', 'c', 'a'].map((g) => SKILLS.engineering.actionMap[`mod_laser_${g}`])];
  table(['Build', 'Typical', 'Endgame', 'Biggest single cost (typical)'], recipes.map((rec) => {
    const t = build(rec.inputs, typicalCosts.cost);
    const e = build(rec.inputs, endgameCosts.cost);
    return [rec.name, hrs(t.secs / 3600), hrs(e.secs / 3600), `${name(t.worst.id)} x${t.worst.qty} (${hrs(t.worst.c / 3600)})`];
  }));
}

p('### Rare inputs');
p();
{
  const rare = ['alexandrite', 'benitoite', 'musgravite', 'grandidierite', 'void_opal', 'painite', 'military_alloy', 'precursor_core', 'exotic_matter', 'ancient_relic', 'alien_biostructure'];
  table(['Item', 'Typical secs each', 'Endgame secs each', 'Best endgame source'], rare.map((id) => {
    const v = endgameCosts.via[id];
    return [name(id), typicalCosts.cost[id] ? n0(typicalCosts.cost[id]) : 'n/a', endgameCosts.cost[id] ? n0(endgameCosts.cost[id]) : 'n/a', v ? `${skillName(v)}: ${v.name}` : 'none'];
  }));
}

// --- Crops: demand against bay supply ------------------------------------------------
p('## Crop demand against hydroponics supply');
p();
p('Bays it takes to keep one hour of the action fed, typical setup, crops replanted the moment they are ready. You own 3 bays at the start and 12 at most.');
p();
{
  const rows = [];
  for (const r of typical) {
    const bays = baysNeeded(r, TYPICAL_MASTERY);
    const used = Object.keys(r.items).filter((id) => r.items[id] < 0 && CROP_OF[id]).map(name);
    if (bays) rows.push([`${r.name} (${skillName(r)})`, r.level, used.join(', '), n1(bays), baysAt(r.level)]);
  }
  table(['Action', 'Lvl', 'Crops used', 'Bays needed', 'Bays you can own at that level'], rows);
}

// --- Exploration: what a scan is worth by region -------------------------------------------
p('## Exploration finds by region');
p();
p('Credit value of survey finds per scan, against the survey data itself and the fuel burned (fuel at market sale value), typical setup.');
p();
table(['Region', 'Lvl', 'Finds CR/scan', 'Data CR/scan', 'Fuel CR/scan', 'Scans/h'], typical.filter((r) => r.handler === 'explore').map((r) => {
  let finds = 0;
  let data = 0;
  let fuel = 0;
  for (const [id, n] of Object.entries(r.items)) {
    const v = (n * sell(id)) / r.actions;
    if (id.startsWith('survey_')) finds += v;
    else if (id.startsWith('stellar_data')) data += v;
    else if (n < 0) fuel -= v;
  }
  return [r.name, r.level, n1(finds), n1(data), n1(fuel), n0(r.actions)];
}));

// --- Research: funding the Tech Lab -----------------------------------------------------------
p('## Research Points');
p();
{
  let rp = 0;
  let cr = 0;
  for (const t of TECHS) for (let rank = 0; rank < t.max; rank++) {
    const c = techCost(t, rank);
    rp += c.rp;
    cr += c.credits;
  }
  const rows = typical.filter((r) => r.skill === 'research').map((r) => {
    const per = r.items.research_point || 0;
    const eff = realHours(r, typicalCosts.cost);
    return [r.name, r.level, n0(per), isFinite(eff) ? n0(per / eff) : 'n/a', isFinite(eff) ? hrs((rp / per) * eff) : 'n/a'];
  });
  p(`Maxing the Tech Lab costs ${n0(rp)} RP and ${n0(cr)} CR.`);
  p();
  table(['Study', 'Lvl', 'RP/h', 'RP per effort h', 'Effort to fund the whole Tech Lab'], rows);
}

// --- Trading XP -------------------------------------------------------------------------------
p('## Trading XP per unit sold');
p();
p('A run pays the same XP however much it sells, so a bigger hold burns more goods for the same XP. Typical setup.');
p();
table(['Route', 'Lvl', 'XP per run', 'Units per run', 'XP per unit', 'Effort secs per XP'], typical.filter((r) => r.handler === 'trade').map((r) => {
  const act = SKILLS.trading.actionMap[r.action];
  const units = -(r.items[act.commodity] || 0) / r.actions;
  const c = typicalCosts.cost[act.commodity];
  const xpRun = r.xp / r.actions;
  const secsPerRun = (realHours(r, typicalCosts.cost) * 3600) / r.actions;
  return [r.name, r.level, n1(xpRun), n0(units), n1(xpRun / units), c !== undefined ? n1(secsPerRun / xpRun) : 'n/a'];
}));

// --- Credit sinks ---------------------------------------------------------------------
p('## Where credits go');
p();
{
  const ships = SHIP_ORDER.reduce((s, id) => s + (SHIPS[id].price || 0), 0);
  let cargo = 0;
  for (let i = 0; i < CARGO_MAX_EXPANSIONS; i++) cargo += cargoExpansionCost(i);
  let tech = 0;
  let rp = 0;
  for (const t of TECHS) for (let r = 0; r < t.max; r++) {
    const c = techCost(t, r);
    tech += c.credits;
    rp += c.rp;
  }
  const plots = SKILLS.xenobiology.plots.reduce((s, pl) => s + pl.cost, 0);
  const rewards = ACHIEVEMENTS.reduce((s, a) => s + (a.reward || 0), 0);
  const total = ships + cargo + tech + plots;
  table(['One-off sink', 'Credits'], [
    ['Ships (buyable)', n0(ships)], ['Cargo expansions (all 120)', n0(cargo)], [`Tech Lab (also ${n0(rp)} RP)`, n0(tech)], ['Hydroponics bays', n0(plots)], ['**Total**', `**${n0(total)}**`],
  ]);
  p(`Achievements pay out ${n0(rewards)} CR on their own.`);
  p();
  const best = (rows, costs, mastery, level) => maxBy(rows.map((r) => ({ r, cr: r.gross / realHours(r, costs, mastery, level ?? r.level) })).filter((x) => isFinite(x.cr)), (x) => x.cr);
  const bt = best(typical.filter((r) => r.level <= 60), typicalCosts.cost, TYPICAL_MASTERY);
  const be = best(endgame, endgameCosts.cost, 99, 99);
  p(`Best mid-game earner (typical, level 60 or below): ${bt.r.name} at ${n0(bt.cr)} CR/h. Best endgame earner: ${be.r.name} at ${n0(be.cr)} CR/h.`);
  p(`At the endgame rate every one-off sink is paid off in about ${hrs(total / be.cr)} of play. After that the only recurring sinks are market supplies.`);
  p();
}

// --- Market sanity ----------------------------------------------------------------------
p('## Market and containers');
p();
{
  const maxSell = 1 + 10 / 100; // Market Analytics rank 5
  const rows = [];
  for (const sec of SHOP_SECTIONS) for (const e of sec.items) {
    const back = Math.floor(sell(e.item) * maxSell);
    const route = SKILLS.trading.actions.find((a) => a.commodity === e.item);
    const viaRoute = route ? Math.floor(sell(e.item) * route.margin * 1.7) : 0;
    const flag = back >= e.price || viaRoute >= e.price ? 'ARBITRAGE' : '';
    rows.push([name(e.item), n0(e.price), n0(back), route ? n0(viaRoute) : '', flag]);
  }
  table(['Shop item', 'Buy', 'Best market sale', 'Best trade route sale (est.)', 'Flag'], rows);
  for (const id of Object.keys(ITEMS).filter((k) => ITEMS[k].open)) {
    const table2 = ITEMS[id].open;
    const total = table2.reduce((s, r) => s + r[1], 0);
    const ev = table2.reduce((s, [it, w, lo, hi]) => s + (w / total) * ((lo + hi) / 2) * sell(it), 0);
    p(`${name(id)}: sells for ${sell(id)} CR, contents worth ${n1(ev)} CR on average.`);
  }
  p();
}

// --- Source and sink audit ---------------------------------------------------------------
p('## Item sources and uses');
p();
{
  const sources = {};
  const uses = {};
  const addTo = (map, id, why) => (map[id] ||= new Set()).add(why);
  for (const sk of Object.values(SKILLS)) {
    for (const a of sk.actions) {
      for (const o of a.outputs || []) addTo(sources, o.id, sk.name);
      for (const i of a.inputs || []) addTo(uses, i.id, sk.name);
      for (const row of a.loot || []) addTo(sources, row[0], `${sk.name} loot`);
      if (a.commodity) addTo(uses, a.commodity, 'Trading');
      if (a.seed) addTo(uses, a.seed, 'Planting');
      if (a.output) addTo(sources, a.output, 'Xenobiology');
    }
    for (const g of sk.gems || []) addTo(sources, g[0], 'Mining gems');
    for (const nb of sk.notable || []) addTo(sources, nb[0], 'Exploration finds');
    if (sk.special) addTo(sources, sk.special.item, `${sk.name} special`);
  }
  for (const id of ['survey_bh', 'survey_ns']) addTo(sources, id, 'Exploration finds');
  for (const item of Object.values(ITEMS)) {
    for (const row of item.open || []) addTo(sources, row[0], name(item.id));
    if (item.open) addTo(uses, item.id, 'Open');
    if (item.booster) addTo(uses, item.id, 'Booster');
    if (item.module) addTo(uses, item.id, 'Fit to ship');
  }
  for (const sec of SHOP_SECTIONS) for (const e of sec.items) addTo(sources, e.item, 'Shop');
  addTo(uses, 'research_point', 'Tech Lab');
  addTo(uses, 'nutrient_gel', 'Crop gel');
  const all = Object.values(ITEMS);
  const noSource = all.filter((i) => !sources[i.id]).map((i) => i.name);
  const sellOnly = all.filter((i) => !uses[i.id]);
  p(`${all.length} items. ${sellOnly.length} have no use except selling. ${noSource.length} have no source${noSource.length ? `: ${noSource.join(', ')}` : ''}.`);
  p();
  p('No use except selling: ' + sellOnly.map((i) => `${i.name} (${i.sell})`).join(', ') + '.');
  p();
  const byCat = {};
  for (const i of all) byCat[i.cat] = (byCat[i.cat] || 0) + 1;
  p('Items per category: ' + Object.entries(byCat).map(([c, n]) => `${c} ${n}`).join(', ') + '.');
  p();
}

// --- Mastery speed --------------------------------------------------------------------------
p('## Mastery speed');
p();
p('Mastery XP per hour at typical setup, first action in each skill. The formula scales with the number of actions in the skill.');
p();
table(['Skill', 'Actions in skill', 'Mastery XP/h'], SKILL_ORDER.filter((id) => SKILLS[id].kind === 'action').map((id) => {
  const r = typical.find((x) => x.skill === id);
  return [SKILLS[id].name, SKILLS[id].actions.length, n0(r.mxp)];
}));

console.log(out.join('\n'));
console.error(`Model run took ${n1((Date.now() - t0) / 1000)}s.`);
if (jsonPath) writeFileSync(jsonPath, JSON.stringify({ typical, endgame, typicalCosts: typicalCosts.cost, endgameCosts: endgameCosts.cost }, null, 1));
