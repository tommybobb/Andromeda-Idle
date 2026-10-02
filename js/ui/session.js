// Profile flows: commander creation, switching, offline catch-up and the
// "welcome back" report.

import { G } from '../game/state.js';
import { SKILLS } from '../data/skills.js';
import { ITEMS } from '../data/items.js';
import { INSIGNIA, ACCENTS } from '../data/profile.js';
import { COMPANION_MAP } from '../data/companions.js';
import { esc, fmt, fmtTime, fmtShort } from '../core/util.js';
import { levelFromXP } from '../core/xp.js';
import { insignia, itemIcon, icon } from './icons.js';
import { openModal, closeAllModals } from './modal.js';
import { saveGame, loadProfile, createProfile, useState, readIndex, importSave } from '../game/save.js';
import { catchUp } from '../game/offline.js';
import { startUI } from './app.js';
import { checkAchievements } from '../game/services.js';

let busy = false;
export const isBusy = () => busy;

// ---------------------------------------------------------------------------
// Offline catch-up

export async function runCatchUp(elapsed) {
  if (busy) return;
  busy = true;
  const overlay = document.createElement('div');
  overlay.className = 'loading';
  overlay.innerHTML = `<div class="box panel"><h2>RESUMING FLIGHT LOG</h2><div class="small muted">Processing ${fmtTime(elapsed)} away</div><div class="bar thick seg"><i style="width:0%"></i></div></div>`;
  document.body.appendChild(overlay);
  const bar = overlay.querySelector('i');
  try {
    const sum = await catchUp(elapsed, { onProgress: (p) => (bar.style.width = `${p * 100}%`) });
    overlay.remove();
    startUI();
    saveGame();
    if (hasNews(sum)) offlineReport(sum);
  } catch (err) {
    console.error(err);
    overlay.remove();
  } finally {
    busy = false;
  }
}

function hasNews(sum) {
  return Object.keys(sum.xp).length || Object.keys(sum.items).length || sum.credits || sum.companions.length || sum.elapsed > 5 * 60000;
}

function offlineReport(sum) {
  const S = G.state;
  const xpRows = Object.entries(sum.xp)
    .sort((a, b) => b[1] - a[1])
    .map(([id, xp]) => {
      const now = levelFromXP(S.skills[id].xp);
      const before = levelFromXP(S.skills[id].xp - xp);
      return `<tr><td><div class="row">${icon(id, 'ico sm')}${esc(SKILLS[id].name)}</div></td><td class="num">+${fmt(xp)}</td><td class="num">${now > before ? `<span class="good">${before} &#9656; ${now}</span>` : now}</td></tr>`;
    })
    .join('');
  const items = Object.entries(sum.items)
    .filter(([, n]) => n !== 0)
    .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
    .slice(0, 24)
    .map(([id, n]) => `<span class="pill ${n < 0 ? 'lack' : ''}" title="${esc(ITEMS[id].name)}">${itemIcon(id)}<span>${n > 0 ? '+' : ''}${fmtShort(n)}</span><small class="pill-name">${esc(ITEMS[id].name)}</small></span>`)
    .join('');
  const act = sum.activity ? SKILLS[sum.activity.skill]?.actionMap[sum.activity.action] : null;
  openModal({
    title: `Welcome back, CMDR ${S.name}`,
    wide: true,
    body: `
      <p>You were away for <b>${fmtTime(sum.elapsed)}</b>.${sum.capped ? ` Offline progress is capped at ${fmtTime(sum.simulated)}.` : ''}</p>
      ${act ? `<p class="small">Your ship kept working on <b>${esc(act.name)}</b> (${esc(SKILLS[sum.activity.skill].name)}).${sum.stopped ? ` <span class="gold">${esc(sum.stopped)}</span>` : ''}</p>` : '<p class="small muted">No operation was running. Crops kept growing.</p>'}
      ${xpRows ? `<div class="section-title" style="margin:14px 0 8px">Experience</div><div class="table-wrap"><table class="table"><thead><tr><th>Skill</th><th class="num">XP</th><th class="num">Level</th></tr></thead><tbody>${xpRows}</tbody></table></div>` : ''}
      ${items ? `<div class="section-title" style="margin:14px 0 8px">Cargo changes</div><div class="io">${items}</div>` : ''}
      <div class="row wrap" style="margin-top:14px;gap:18px">
        ${sum.credits ? `<div><div class="tiny muted upper">Credits</div><b class="gold">${sum.credits > 0 ? '+' : ''}${fmt(sum.credits)} CR</b></div>` : ''}
        ${sum.systems ? `<div><div class="tiny muted upper">Systems discovered</div><b>${fmt(sum.systems)}</b></div>` : ''}
      </div>
      ${sum.companions.length ? `<p class="good">New companion: ${sum.companions.map((c) => esc(COMPANION_MAP[c].name)).join(', ')}</p>` : ''}`,
    actions: [{ label: 'Resume', cls: 'solid' }],
  });
}

// ---------------------------------------------------------------------------
// Entering and switching profiles

export async function enterProfile(state) {
  closeAllModals();
  useState(state);
  document.getElementById('intro').hidden = true;
  const elapsed = Date.now() - state.time;
  if (elapsed > 60000) await runCatchUp(elapsed);
  else {
    startUI();
    saveGame();
  }
  checkAchievements();
}

export async function switchProfile(id) {
  if (G.state) saveGame();
  const st = loadProfile(id);
  if (st) await enterProfile(st);
}

// Parses synchronously so callers can catch a bad save string.
export function importProfile(text) {
  const st = importSave(text);
  if (G.state) saveGame();
  useState(st);
  saveGame();
  enterProfile(st);
  return st;
}

// ---------------------------------------------------------------------------
// Commander creation screen

export function showIntro({ canCancel = false } = {}) {
  const intro = document.getElementById('intro');
  document.getElementById('app').hidden = true;
  let ins = INSIGNIA[0].id;
  let accent = ACCENTS[0].id;
  const hasProfiles = readIndex().profiles.length > 0;
  const render = () => {
    const color = ACCENTS.find((a) => a.id === accent).color;
    document.documentElement.style.setProperty('--hud', color);
    intro.innerHTML = `<div class="intro-box">
      <div class="intro-logo"><h1>ANDROMEDA</h1><p>Idle</p></div>
      <div class="panel">
        <div class="ph">${icon('commander')} Commander registration</div>
        <p class="small muted" style="margin-top:0">Mine, harvest, salvage, explore, trade and build your way from a battered Kestrel to the flagship that crosses the void to Andromeda. Your ship keeps working while you are away for up to 24 hours.</p>
        <label class="field">Commander name<input class="input" id="cmdr-name" maxlength="20" placeholder="Jameson" autocomplete="off" value="${esc(intro._name || '')}"></label>
        <div class="field" style="margin-top:14px">Insignia</div>
        <div class="pick-grid" style="margin-top:6px">${INSIGNIA.map((i) => `<button class="pick ${i.id === ins ? 'on' : ''}" data-ins="${i.id}" title="${esc(i.name)}">${insignia(i.id, '')}</button>`).join('')}</div>
        <div class="field" style="margin-top:14px">HUD colour</div>
        <div class="row wrap" style="margin-top:6px">${ACCENTS.map((a) => `<button class="swatch ${a.id === accent ? 'on' : ''}" style="background:${a.color}" data-accent="${a.id}" title="${esc(a.name)}"></button>`).join('')}</div>
        <div class="row wrap" style="margin-top:18px">
          <button class="btn solid" id="launch">${icon('play')} Launch</button>
          ${canCancel || hasProfiles ? '<button class="btn" id="cancel-intro">Back</button>' : ''}
          <span class="spacer"></span>
          <button class="btn alt sm" id="import-intro">Import save</button>
        </div>
      </div>
      <p class="tiny muted" style="text-align:center">A fan-made idle game inspired by Melvor Idle. Saves stay in this browser.</p>
    </div>`;
    const nameInput = intro.querySelector('#cmdr-name');
    nameInput.addEventListener('input', () => (intro._name = nameInput.value));
    intro.querySelectorAll('[data-ins]').forEach((b) => b.addEventListener('click', () => { ins = b.dataset.ins; render(); }));
    intro.querySelectorAll('[data-accent]').forEach((b) => b.addEventListener('click', () => { accent = b.dataset.accent; render(); }));
    intro.querySelector('#launch').addEventListener('click', async () => {
      const name = (nameInput.value || '').trim().slice(0, 20) || 'Jameson';
      intro._name = '';
      const st = createProfile(name, ins, accent);
      await enterProfile(st);
    });
    intro.querySelector('#cancel-intro')?.addEventListener('click', async () => {
      intro.hidden = true;
      if (G.state) startUI();
      else {
        const idx = readIndex();
        if (idx.profiles[0]) await switchProfile(idx.active || idx.profiles[0].id);
      }
    });
    intro.querySelector('#import-intro').addEventListener('click', () => importDialog());
  };
  intro.hidden = false;
  render();
}

export function importDialog() {
  openModal({
    title: 'Import save',
    body: `<p class="small muted" style="margin-top:0">Paste an exported save string. It will be added as a new commander profile.</p>
      <textarea class="input" id="import-text" placeholder="Paste save here"></textarea>
      <div class="small bad" id="import-err"></div>`,
    actions: [
      { label: 'Cancel' },
      {
        label: 'Import',
        cls: 'solid',
        onClick(h) {
          const text = h.body.querySelector('#import-text').value;
          try {
            importProfile(text);
          } catch (err) {
            h.body.querySelector('#import-err').textContent = `Could not import: ${err.message}`;
            return true;
          }
          return false;
        },
      },
    ],
  });
}
