// Boot and main loop.

import { G } from './game/state.js';
import { advance } from './game/engine.js';
import { saveGame, readIndex, loadProfile } from './game/save.js';
import { checkAchievements } from './game/services.js';
import { initApp, uiTick, uiFrame } from './ui/app.js';
import { initStarfield } from './ui/starfield.js';
import { enterProfile, showIntro, runCatchUp, isBusy } from './ui/session.js';

// Gaps longer than this (tab asleep, phone locked) are processed as offline
// time with a summary, rather than silently.
const LIVE_GAP_MS = 60000;
const SAVE_EVERY_MS = 10000;

let lastUi = 0;
let lastSave = Date.now();
let lastAchievements = 0;

function tick() {
  const S = G.state;
  if (!S || isBusy() || document.hidden) return;
  const now = Date.now();
  const dt = now - S.time;
  if (dt <= 0) {
    S.time = Math.min(S.time, now);
    return;
  }
  if (dt > LIVE_GAP_MS) {
    runCatchUp(dt);
    return;
  }
  advance(dt);
  S.stats.playTime += dt;
  if (now - lastAchievements > 3000) {
    lastAchievements = now;
    checkAchievements();
  }
  if (now - lastSave > SAVE_EVERY_MS) {
    lastSave = now;
    saveGame();
  }
}

function frame(t) {
  try {
    tick();
    if (G.state && !isBusy()) {
      uiFrame();
      if (t - lastUi > 200) {
        lastUi = t;
        uiTick();
      }
    }
  } catch (err) {
    console.error(err);
  }
  requestAnimationFrame(frame);
}

function registerServiceWorker() {
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('sw.js').catch((err) => console.warn('Service worker not registered', err));
  }
}

async function boot() {
  initStarfield(document.getElementById('starfield'));
  initApp();
  const idx = readIndex();
  const id = idx.active || idx.profiles[0]?.id;
  const state = id ? loadProfile(id) : null;
  if (state) await enterProfile(state);
  else showIntro();

  requestAnimationFrame(frame);
  // rAF pauses in background tabs; this keeps the clock honest when it is throttled.
  setInterval(tick, 1000);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) saveGame();
    else tick();
  });
  window.addEventListener('pagehide', saveGame);
  window.addEventListener('beforeunload', saveGame);
  registerServiceWorker();
}

boot();
