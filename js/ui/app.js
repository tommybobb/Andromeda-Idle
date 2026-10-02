// App shell: router, sidebar, top bar, activity strip and event wiring.

import { G } from '../game/state.js';
import { SKILLS, SKILL_GROUPS, getAction } from '../data/skills.js';
import { ACCENTS, rankFor } from '../data/profile.js';
import { on } from '../core/events.js';
import { esc, fmt } from '../core/util.js';
import { icon, itemIcon, insignia, companionArt } from './icons.js';
import { updateBindings, updateProgress } from './bind.js';
import { gainToast, notifyToast, toast } from './toast.js';
import { openModal, closeAllModals } from './modal.js';
import { stopAction } from '../game/engine.js';
import { readyCount } from '../game/farming.js';
import { totalLevel } from '../game/progress.js';
import { setStarfield } from './starfield.js';

import bridge from './pages/bridge.js';
import commander from './pages/commander.js';
import cargo from './pages/cargo.js';
import market from './pages/market.js';
import hangar from './pages/hangar.js';
import logbook from './pages/logbook.js';
import stats from './pages/stats.js';
import settings from './pages/settings.js';
import skillPage from './pages/skill.js';
import xenobiology from './pages/xenobiology.js';
import piloting from './pages/piloting.js';

const PAGES = { bridge, commander, cargo, market, hangar, logbook, stats, settings };

const NAV_TOP = [
  ['bridge', 'Bridge', 'bridge'],
  ['commander', 'Commander', 'commander'],
  ['cargo', 'Cargo Hold', 'cargo'],
  ['market', 'Station Market', 'market'],
  ['hangar', 'Hangar', 'hangar'],
];
const NAV_BOTTOM = [
  ['logbook', 'Logbook', 'logbook'],
  ['stats', 'Statistics', 'stats'],
  ['settings', 'Settings', 'settings'],
];

let current = { page: null, param: null, route: '' };
let renderQueued = false;
const $content = () => document.getElementById('content');

// ---------------------------------------------------------------------------
// Routing

function resolve(hash) {
  const m = (hash || '').match(/^#\/([^/?]+)(?:\/([^?]+))?/);
  const name = m?.[1] || 'bridge';
  if (PAGES[name]) return { page: PAGES[name], param: m?.[2] || null, route: name };
  const sk = SKILLS[name];
  if (sk) {
    if (sk.kind === 'farming') return { page: xenobiology, param: name, route: name };
    if (sk.kind === 'passive') return { page: piloting, param: name, route: name };
    return { page: skillPage, param: name, route: name };
  }
  return { page: bridge, param: null, route: 'bridge' };
}

export function go(route) {
  if (location.hash === `#/${route}`) renderPage();
  else location.hash = `#/${route}`;
}

function onHash() {
  const next = resolve(location.hash);
  const same = next.route === current.route;
  current = next;
  closeNav();
  renderPage({ keepScroll: same });
  renderSidebar();
}

export function renderPage({ keepScroll = true } = {}) {
  renderQueued = false;
  const el = $content();
  const top = el.scrollTop;
  current.page.render(el, current.param);
  updateBindings(el);
  if (keepScroll) el.scrollTop = top;
  else el.scrollTop = 0;
}

export function queueRender() {
  if (renderQueued) return;
  renderQueued = true;
  setTimeout(() => {
    if (renderQueued) renderPage();
  }, 120);
}

// ---------------------------------------------------------------------------
// Sidebar

function navItem(route, label, ico, extra = '') {
  const cur = current.route === route ? 'current' : '';
  return `<a class="nav-item ${cur}" href="#/${route}">${icon(ico)}<span>${label}</span>${extra}</a>`;
}

export function renderSidebar() {
  const S = G.state;
  let html = '<div class="nav-group-title">Command</div>';
  html += NAV_TOP.map(([r, l, i]) => navItem(r, l, i)).join('');
  for (const g of SKILL_GROUPS) {
    html += `<div class="nav-group-title">${g.name}</div>`;
    for (const sk of Object.values(SKILLS).filter((s) => s.group === g.id)) {
      const running = S.active?.skill === sk.id ? '<span class="dot" title="Running"></span>' : '';
      const ready = sk.kind === 'farming' ? '<span class="badge" data-farm-badge hidden></span>' : '';
      const extra = `${running}${ready}<span class="nav-lvl"><span data-b="level" data-skill="${sk.id}"></span>/99</span><span class="nav-xp"><i data-b="xp-bar" data-skill="${sk.id}"></i></span>`;
      html += navItem(sk.id, sk.name, sk.id, extra);
    }
  }
  html += '<div class="nav-group-title">Records</div>';
  html += NAV_BOTTOM.map(([r, l, i]) => navItem(r, l, i)).join('');
  html += `<div class="tiny muted" style="padding:18px 16px 0">Andromeda Idle v1.0<br>Progress saves automatically.</div>`;
  const nav = document.getElementById('sidebar');
  nav.innerHTML = html;
  updateBindings(nav);
  updateFarmBadge();
}

function updateFarmBadge() {
  const badge = document.querySelector('[data-farm-badge]');
  if (!badge) return;
  const n = readyCount();
  badge.hidden = n === 0;
  if (n) badge.textContent = n;
}

function openNav() {
  document.body.classList.add('nav-open');
  document.getElementById('menu-btn').setAttribute('aria-expanded', 'true');
}
function closeNav() {
  document.body.classList.remove('nav-open');
  document.getElementById('menu-btn')?.setAttribute('aria-expanded', 'false');
}

// ---------------------------------------------------------------------------
// Top bar and activity strip

export function renderTopCommander() {
  const S = G.state;
  const r = rankFor(totalLevel());
  document.getElementById('top-cmdr').innerHTML = `${insignia(S.insignia, 'ins')}<span class="who"><small class="muted upper tiny">CMDR</small><b>${esc(S.name)}</b><small class="hud upper tiny">${r.name}</small></span>`;
}

export function applyAccent() {
  const accent = ACCENTS.find((a) => a.id === G.state.accent) || ACCENTS[0];
  document.documentElement.style.setProperty('--hud', accent.color);
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#04060a');
}

export function applySettings() {
  const s = G.state.settings;
  setStarfield(s.starfield, !s.reduceMotion);
  document.body.classList.toggle('reduce-motion', !!s.reduceMotion);
}

let lastFarmReady = -1;

export function renderActivity() {
  const S = G.state;
  const a = S.active;
  const ready = readyCount();
  lastFarmReady = ready;
  const farm = ready ? `<a class="farm-chip" href="#/xenobiology">${ready} crop${ready > 1 ? 's' : ''} ready</a>` : '';
  let html;
  if (a) {
    const sk = SKILLS[a.skill];
    const act = getAction(a.skill, a.action);
    html = `${icon(a.skill, 'act-ico')}
      <div class="act-main">
        <div class="act-label"><small>${esc(sk.name)}</small><a href="#/${a.skill}">${esc(act.name)}</a><small class="muted" data-b="block-reason"></small></div>
        <div class="bar progress"><i data-b="progress" data-skill="${a.skill}" data-action="${a.action}"></i></div>
      </div>${farm}
      <button class="btn sm" data-stop>${icon('stop')}<span>Stop</span></button>`;
  } else {
    html = `${icon('bridge', 'act-ico')}<div class="act-main"><span class="idle">No active operation. Pick a skill to get started.</span></div>${farm}`;
  }
  const el = document.getElementById('activity');
  el.innerHTML = html;
  updateBindings(el);
}

// ---------------------------------------------------------------------------
// Event wiring

function pageWants(evt, data) {
  const handler = current.page?.events?.[evt];
  if (!handler) return false;
  return typeof handler === 'function' ? handler(data, current.param) : handler;
}

function relay(evt) {
  on(evt, (data) => {
    if (pageWants(evt, data)) queueRender();
  });
}

export function initApp() {
  document.getElementById('menu-btn').innerHTML = icon('menu');
  document.getElementById('menu-btn').addEventListener('click', () => (document.body.classList.contains('nav-open') ? closeNav() : openNav()));
  document.getElementById('nav-backdrop').addEventListener('click', closeNav);
  document.getElementById('activity').addEventListener('click', (e) => {
    if (e.target.closest('[data-stop]')) stopAction();
  });

  $content().addEventListener('click', (e) => {
    const t = e.target.closest('[data-act]');
    if (!t || !$content().contains(t)) return;
    current.page.click?.(t, e, current.param);
  });
  $content().addEventListener('change', (e) => current.page.change?.(e.target, e, current.param));
  $content().addEventListener('input', (e) => current.page.input?.(e.target, e, current.param));

  on('gain', ({ id, n }) => gainToast(id, n));
  on('notify', ({ msg, type }) => notifyToast(msg, type));
  on('levelup', ({ skill, level }) => {
    if (G.silent) return;
    toast(`${icon(skill, 'ico sm')}<span>${esc(SKILLS[skill].name)} level <b>${level}</b></span>`, 'level', 5000);
    renderTopCommander();
    if (pageWants('levelup', { skill, level })) queueRender();
  });
  on('achievement', (a) => {
    if (G.silent) return;
    toast(`${icon('medal', 'ico sm')}<span>Achievement: <b>${esc(a.name)}</b>${a.reward ? ` (+${fmt(a.reward)} CR)` : ''}</span>`, 'ach', 7000);
  });
  on('companion', (c) => {
    if (G.silent) return;
    openModal({
      title: 'New companion',
      body: `<div class="row" style="gap:16px">${companionArt(c)}<div><div class="cmdr-name">${esc(c.name)}</div><div class="rank">${esc(c.species)}</div></div></div>
        <p>${esc(c.desc)}</p><div class="chip good">${esc(c.bonus)}</div>
        <p class="small muted">Companions are permanent and their bonus is always active. See them all in the Logbook.</p>`,
      actions: [{ label: 'Welcome aboard', cls: 'solid' }],
    });
  });
  on('discovery', (sys) => {
    if (G.silent) return;
    for (const f of sys.finds) {
      toast(`${itemIcon(f.item, 'sm')}<span><b>${esc(f.label)}</b> found in ${esc(sys.name)}</span>`, 'disc', 6000);
    }
  });
  on('action', () => {
    if (G.silent) return;
    renderActivity();
    renderSidebar();
    if (pageWants('action')) queueRender();
  });
  on('salvagefail', () => {
    if (G.silent) return;
    const sc = document.querySelector('.scene');
    sc?.animate?.([{ transform: 'translateX(-3px)' }, { transform: 'translateX(3px)' }, { transform: 'none' }], { duration: 180 });
  });
  for (const evt of ['items', 'ships', 'boosters', 'research', 'farm', 'cargo', 'masterylevel', 'credits', 'complete', 'trade']) relay(evt);
  on('ships', () => {
    if (!G.silent) renderActivity();
  });

  window.addEventListener('hashchange', onHash);
}

export function startUI() {
  applyAccent();
  applySettings();
  current = resolve(location.hash);
  renderTopCommander();
  renderSidebar();
  renderActivity();
  renderPage({ keepScroll: false });
  document.getElementById('app').hidden = false;
}

export function resetUI() {
  closeAllModals();
  startUI();
}

// Called a few times a second.
export function uiTick() {
  const app = document.getElementById('app');
  if (app.hidden) return;
  updateBindings(app);
  updateBindings(document.getElementById('modal-root'));
  const ready = readyCount();
  if (ready !== lastFarmReady) {
    renderActivity();
    updateFarmBadge();
  }
  current.page?.tick?.(current.param);
}

// Called every animation frame.
export function uiFrame() {
  updateProgress(document.getElementById('content'));
  updateProgress(document.getElementById('activity'));
}

export const currentRoute = () => current.route;
