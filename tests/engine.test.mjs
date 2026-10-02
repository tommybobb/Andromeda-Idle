// Engine tests. Run with: node --test tests/
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { XP_TABLE, levelFromXP } from '../js/core/xp.js';
import { G, newState, migrate } from '../js/game/state.js';
import { useState } from '../js/game/save.js';
import { SKILLS, SKILL_ORDER } from '../js/data/skills.js';
import { ITEMS } from '../js/data/items.js';
import { SHIPS } from '../js/data/ships.js';
import { SHOP_SECTIONS } from '../js/data/shop.js';
import { ACHIEVEMENTS } from '../js/data/achievements.js';
import * as engine from '../js/game/engine.js';
import * as bank from '../js/game/bank.js';
import * as farming from '../js/game/farming.js';
import * as hangar from '../js/game/hangar.js';
import * as services from '../js/game/services.js';
import { masteryGain, skillLevel, spendPool, masteryLevel, totalLevel } from '../js/game/progress.js';
import { mod, poolCap } from '../js/game/modifiers.js';
import { catchUp } from '../js/game/offline.js';

function fresh() {
  const s = newState('Test');
  useState(s);
  return s;
}

test('XP table matches Melvor Idle', () => {
  assert.equal(XP_TABLE[2], 83);
  assert.equal(XP_TABLE[10], 1154);
  assert.equal(XP_TABLE[50], 101333);
  assert.equal(XP_TABLE[99], 13034431);
  assert.equal(levelFromXP(0), 1);
  assert.equal(levelFromXP(82), 1);
  assert.equal(levelFromXP(83), 2);
  assert.equal(levelFromXP(13034431), 99);
  assert.equal(levelFromXP(1e12), 99);
});

test('every referenced item exists', () => {
  const missing = [];
  const check = (id, where) => {
    if (!ITEMS[id]) missing.push(`${id} (${where})`);
  };
  for (const sk of Object.values(SKILLS)) {
    for (const a of sk.actions) {
      for (const io of [...(a.inputs || []), ...(a.outputs || [])]) check(io.id, `${sk.id}.${a.id}`);
      for (const row of a.loot || []) check(row[0], `${sk.id}.${a.id} loot`);
      if (a.commodity) check(a.commodity, `${sk.id}.${a.id}`);
      if (a.seed) check(a.seed, `${sk.id}.${a.id}`);
      if (a.output) check(a.output, `${sk.id}.${a.id}`);
    }
    for (const g of sk.gems || []) check(g[0], `${sk.id} gems`);
    for (const n of sk.notable || []) check(n[0], `${sk.id} notable`);
    if (sk.special) check(sk.special.item, `${sk.id} special`);
  }
  for (const item of Object.values(ITEMS)) for (const row of item.open || []) check(row[0], `${item.id} contents`);
  for (const sec of SHOP_SECTIONS) for (const e of sec.items) check(e.item, 'shop');
  assert.deepEqual(missing, []);
});

test('action ids are unique within each skill', () => {
  for (const sk of Object.values(SKILLS)) {
    const ids = sk.actions.map((a) => a.id);
    assert.equal(new Set(ids).size, ids.length, sk.id);
  }
});

test('mining produces ore, XP, mastery and depletes the asteroid', () => {
  const S = fresh();
  assert.ok(engine.startAction('mining', 'ferrite'));
  engine.advance(60000);
  // 6 hits deplete a fresh asteroid, which then respawns after 5s
  assert.ok(bank.qty('ferrite_ore') >= 12, 'ore gained');
  assert.ok(S.skills.mining.xp > 0);
  assert.ok(S.skills.mining.mastery.ferrite > 0);
  assert.ok(S.skills.piloting.xp > 0, 'piloting gains passive XP');
  assert.ok(S.skills.mining.pool > 0);
  assert.ok(S.stats.rocksDepleted >= 1, 'asteroid depleted at least once');
});

test('mastery gain uses the Melvor formula', () => {
  fresh();
  // 12 actions, 2 unlocked at level 1, all mastery level 1, 3s action, 0.5 factor
  const expected = ((2 * 12) / (12 * 99) + (1 * 12) / 10) * 3 * 0.5;
  // The fresh ship has an E-grade laser but no mastery bonuses.
  assert.ok(Math.abs(masteryGain('mining', 'ferrite', 3000) - expected) < 1e-9);
});

test('refining consumes ore and stops when it runs out', () => {
  const S = fresh();
  S.bank.ferrite_ore = 5;
  engine.startAction('refining', 'iron');
  engine.advance(2000 * 20);
  assert.equal(S.active, null, 'stopped when out of ore');
  assert.ok(bank.qty('iron_ingot') >= 5);
  assert.equal(bank.qty('ferrite_ore'), 0);
});

test('locked actions cannot start', () => {
  fresh();
  assert.equal(engine.startAction('mining', 'neutronium'), false);
  assert.equal(G.state.active, null);
});

test('cargo hold capacity is enforced', () => {
  const S = fresh();
  const cap = bank.capacity();
  for (const id of Object.keys(ITEMS)) {
    if (bank.usedSlots() >= cap) break;
    S.bank[id] = 1;
  }
  assert.equal(bank.usedSlots(), cap);
  const newId = Object.keys(ITEMS).find((id) => !S.bank[id]);
  assert.equal(bank.add(newId, 1), false);
});

test('salvaging gives credits and can fail with a stun', () => {
  const S = fresh();
  engine.startAction('salvaging', 'escape_pod');
  engine.advance(3000 * 200);
  assert.ok(S.stats.salvageSuccess > 0);
  assert.ok(S.credits > 250);
});

test('exploration logs systems and consumes fuel in deeper regions', () => {
  const S = fresh();
  engine.startAction('exploration', 'local');
  engine.advance(4000 * 25);
  assert.ok(S.explore.total >= 20);
  assert.ok(bank.qty('stellar_data_1') >= 20);
  S.skills.exploration.xp = XP_TABLE[12];
  engine.startAction('exploration', 'inner_arm');
  engine.advance(5000 * 10);
  assert.equal(S.active, null, 'stops when fuel runs out');
  assert.equal(bank.qty('h_fuel_cell'), 0);
});

test('trading sells a hold of goods for profit', () => {
  const S = fresh();
  S.bank.ferrite_ore = 20;
  const before = S.credits;
  engine.startAction('trading', 'ore_shuttle');
  engine.advance(6000);
  const sold = 20 - bank.qty('ferrite_ore');
  assert.equal(sold, engine.tonnage());
  assert.ok(S.credits - before >= sold * 2 * 2);
});

test('farming grows over time and harvests', () => {
  const S = fresh();
  S.settings.autoReplant = false;
  assert.ok(farming.plant(0, 'lumimoss'));
  assert.equal(farming.plotState(S.farming.plots[0]), 'growing');
  engine.advance(301 * 1000);
  assert.equal(farming.plotState(S.farming.plots[0]), 'ready');
  let got = false;
  for (let i = 0; i < 20 && !got; i++) {
    S.farming.plots[0] = { crop: 'lumimoss', plantedAt: 0, gel: 5 };
    const r = farming.harvest(0);
    got = r.ok;
  }
  assert.ok(got);
  assert.ok(bank.qty('lumimoss') > 0);
  assert.ok(S.skills.xenobiology.xp > 0);
});

test('modules change modifiers and ships can be bought', () => {
  const S = fresh();
  assert.equal(mod('interval', 'mining') < 0, true, 'starter laser speeds mining');
  S.credits = 1e6;
  S.skills.piloting.xp = XP_TABLE[10];
  assert.ok(hangar.buyShip('prospector'));
  assert.ok(hangar.setActiveShip('prospector'));
  assert.ok(mod('double', 'mining') >= 5);
  S.bank.mod_laser_d = 1;
  assert.ok(hangar.equip('prospector', 'laser', 'mod_laser_d'));
  assert.ok(mod('interval', 'mining') <= -10);
});

test('boosters activate, spend charges and expire', () => {
  const S = fresh();
  S.bank.laser_coolant = 1;
  assert.ok(engine.activateBooster('laser_coolant'));
  assert.ok(mod('double', 'mining') >= 15);
  engine.startAction('mining', 'ferrite');
  engine.advance(3000 * 40);
  assert.equal(S.boosters.mining, undefined, 'booster expired');
});

test('mastery pool can be spent', () => {
  const S = fresh();
  S.skills.mining.pool = poolCap('mining');
  assert.ok(spendPool('mining', 'ferrite', 10));
  assert.equal(masteryLevel('mining', 'ferrite'), 11);
});

test('offline catch-up is capped at 24 hours and summarises gains', async () => {
  fresh();
  engine.startAction('mining', 'ferrite');
  const sum = await catchUp(30 * 60 * 60 * 1000, { yieldEvery: false });
  assert.ok(sum.capped);
  assert.ok(sum.xp.mining > 0);
  assert.ok(sum.items.ferrite_ore > 20000);
  assert.ok(skillLevel('mining') > 40);
});

test('saves migrate cleanly', () => {
  const S = fresh();
  const raw = JSON.parse(JSON.stringify(S));
  delete raw.settings;
  delete raw.explore;
  raw.skills = { mining: { xp: 500 } };
  const m = migrate(raw);
  assert.equal(m.skills.mining.xp, 500);
  for (const id of SKILL_ORDER) assert.ok(m.skills[id]);
  assert.ok(m.settings.toasts);
});

test('achievements can be evaluated', () => {
  fresh();
  G.state.skills.mining.xp = XP_TABLE[10];
  const got = services.checkAchievements();
  assert.ok(got.some((a) => a.id === 'mining_10'));
  assert.ok(ACHIEVEMENTS.length > 40);
  assert.ok(totalLevel() >= SKILL_ORDER.length);
});

test('every ship and module definition is valid', () => {
  for (const ship of Object.values(SHIPS)) assert.ok(ship.name && ship.slots);
  for (const item of Object.values(ITEMS)) {
    if (item.module) assert.ok(item.module.slot, item.id);
    if (item.booster) assert.ok(item.booster.skill, item.id);
  }
});
