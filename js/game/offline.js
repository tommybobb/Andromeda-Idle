// Offline catch-up: replays elapsed time through the normal engine (capped at
// 24 hours) and collects a summary for the "welcome back" report.

import { G, OFFLINE_CAP_MS } from './state.js';
import { SKILL_ORDER } from '../data/skills.js';
import { advance } from './engine.js';
import { checkAchievements } from './services.js';

const CHUNK_MS = 30 * 60 * 1000;

export async function catchUp(elapsedMs, { onProgress, yieldEvery = true } = {}) {
  const S = G.state;
  const simulated = Math.min(Math.max(0, elapsedMs), OFFLINE_CAP_MS);
  const xpBefore = {};
  for (const id of SKILL_ORDER) xpBefore[id] = S.skills[id].xp;
  const activeBefore = S.active ? { ...S.active } : null;

  G.summary = { items: {}, credits: 0, levels: {}, systems: 0, companions: [], stopped: null };
  G.silent = true;
  try {
    let left = simulated;
    while (left > 0) {
      const step = Math.min(CHUNK_MS, left);
      advance(step);
      left -= step;
      onProgress?.(simulated ? 1 - left / simulated : 1);
      if (yieldEvery && left > 0) await new Promise((r) => setTimeout(r, 0));
    }
    // Time past the cap still passes (crops keep growing) but actions do not progress.
    if (elapsedMs > simulated) S.time += elapsedMs - simulated;
    S.stats.offlineTime += elapsedMs;
    checkAchievements();
  } finally {
    G.silent = false;
  }

  const sum = G.summary;
  G.summary = null;
  sum.elapsed = elapsedMs;
  sum.simulated = simulated;
  sum.capped = elapsedMs > simulated;
  sum.activity = activeBefore;
  sum.xp = {};
  for (const id of SKILL_ORDER) {
    const d = S.skills[id].xp - xpBefore[id];
    if (d > 0.5) sum.xp[id] = d;
  }
  return sum;
}
