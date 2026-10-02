// Skill XP, mastery XP and the mastery pool, following Melvor Idle's formulas.

import { G } from './state.js';
import { SKILLS, SKILL_ORDER, PILOT_XP_SHARE } from '../data/skills.js';
import { levelFromXP, XP_TABLE, MAX_MASTERY } from '../core/xp.js';
import { emit } from '../core/events.js';
import { mod, invalidateMods, poolCap } from './modifiers.js';

export const skillXP = (id) => G.state.skills[id].xp;
export const skillLevel = (id) => levelFromXP(G.state.skills[id].xp);
export const masteryXP = (skill, action) => G.state.skills[skill].mastery[action] || 0;
export const masteryLevel = (skill, action) => levelFromXP(masteryXP(skill, action), MAX_MASTERY);

export function totalLevel() {
  let t = 0;
  for (const id of SKILL_ORDER) t += skillLevel(id);
  return t;
}

export function totalMastery(skillId) {
  let t = 0;
  for (const a of SKILLS[skillId].actions) t += masteryLevel(skillId, a.id);
  return t;
}

function noteSummary(fn) {
  if (G.summary) fn(G.summary);
}

// Grants skill XP with all bonuses applied. Returns the XP actually granted.
export function addXP(skillId, base) {
  if (!(base > 0)) return 0;
  const s = G.state.skills[skillId];
  const amount = base * (1 + mod('xp', skillId) / 100);
  const before = levelFromXP(s.xp);
  s.xp += amount;
  const after = levelFromXP(s.xp);
  if (after > before) {
    if (skillId === 'piloting') invalidateMods();
    emit('levelup', { skill: skillId, level: after });
    noteSummary((sum) => {
      sum.levels[skillId] = after;
    });
  }
  if (SKILLS[skillId].ship) addXP('piloting', amount * PILOT_XP_SHARE);
  return amount;
}

// Melvor mastery formula:
//   ((unlocked actions * total current mastery / total max mastery)
//     + (action mastery level * total actions / 10)) * action seconds * 0.5
export function masteryGain(skillId, actionId, intervalMs) {
  const sk = SKILLS[skillId];
  const actions = sk.actions;
  const lvl = skillLevel(skillId);
  let unlocked = 0;
  let current = 0;
  for (const a of actions) {
    if (a.level <= lvl) unlocked++;
    current += masteryLevel(skillId, a.id);
  }
  const ml = masteryLevel(skillId, actionId);
  const base = (unlocked * current) / (actions.length * MAX_MASTERY) + (ml * actions.length) / 10;
  return base * (intervalMs / 1000) * 0.5 * (1 + mod('mxp', skillId) / 100);
}

export function addMasteryXP(skillId, actionId, intervalMs) {
  const s = G.state.skills[skillId];
  const gain = masteryGain(skillId, actionId, intervalMs);
  const before = masteryLevel(skillId, actionId);
  const capXP = XP_TABLE[MAX_MASTERY];
  s.mastery[actionId] = Math.min(capXP, (s.mastery[actionId] || 0) + gain);
  const after = masteryLevel(skillId, actionId);
  if (after > before) emit('masterylevel', { skill: skillId, action: actionId, level: after });
  addPoolXP(skillId, gain * (skillLevel(skillId) >= 99 ? 0.5 : 0.25));
  return gain;
}

export function addPoolXP(skillId, amount) {
  const s = G.state.skills[skillId];
  s.pool = Math.min(poolCap(skillId), s.pool + amount);
}

// Spend pool XP to raise an action's mastery by `levels` (1:1 XP cost, like Melvor).
export function masteryCost(skillId, actionId, levels) {
  const cur = masteryLevel(skillId, actionId);
  const target = Math.min(MAX_MASTERY, cur + levels);
  if (target <= cur) return { target: cur, cost: 0 };
  return { target, cost: Math.ceil(XP_TABLE[target] - masteryXP(skillId, actionId)) };
}

export function spendPool(skillId, actionId, levels) {
  const { target, cost } = masteryCost(skillId, actionId, levels);
  const s = G.state.skills[skillId];
  if (cost <= 0 || s.pool < cost) return false;
  s.pool -= cost;
  s.mastery[actionId] = XP_TABLE[target];
  emit('masterylevel', { skill: skillId, action: actionId, level: target });
  return true;
}
