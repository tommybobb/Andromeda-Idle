// Bridge: the home screen.

import { G } from '../../game/state.js';
import { SKILLS, SKILL_GROUPS, getAction } from '../../data/skills.js';
import { SHIPS } from '../../data/ships.js';
import { rankFor } from '../../data/profile.js';
import { ACHIEVEMENTS } from '../../data/achievements.js';
import { esc, fmt, fmtTime, fmtShort } from '../../core/util.js';
import { icon, insignia, shipArt } from '../icons.js';
import { totalLevel, skillLevel } from '../../game/progress.js';
import { readyCount } from '../../game/farming.js';
import { progressBar } from '../parts.js';

const BRIEF = [
  ['Mine some Ferrite Ore', 'mining', (S) => (S.stats.actions.mining || 0) > 0],
  ['Refine it into Iron Ingots', 'refining', (S) => (S.stats.actions.refining || 0) > 0],
  ['Plant Luminous Moss spores', 'xenobiology', (S) => S.farming.plots.some((p) => p.crop) || S.stats.harvests > 0],
  ['Fabricate a Hull Plate', 'fabrication', (S) => (S.stats.actions.fabrication || 0) > 0],
  ['Skim a Hydrogen Cloud', 'gas', (S) => (S.stats.actions.gas || 0) > 0],
  ['Salvage a Drifting Escape Pod', 'salvaging', (S) => S.stats.salvageSuccess > 0],
  ['Scan the Local Cluster', 'exploration', (S) => S.explore.total > 0],
  ['Run an Ore Shuttle trade route', 'trading', (S) => S.stats.tradeRuns > 0],
  ['Build a module with Engineering', 'engineering', (S) => (S.stats.actions.engineering || 0) > 0],
  ['Reach Piloting 5 and buy the Prospector', 'hangar', (S) => S.ships.owned.length > 1],
];

function brief() {
  const S = G.state;
  if (S.tutorialDismissed) return '';
  const done = BRIEF.filter(([, , check]) => check(S)).length;
  return `<div class="panel"><div class="ph">${icon('info')} Flight plan<div class="ph-right"><span class="small">${done} / ${BRIEF.length}</span><button class="btn xs" data-act="dismiss">Hide</button></div></div>
    <ul class="check-list">${BRIEF.map(([text, route, check]) => `<li class="${check(S) ? 'done' : ''}"><span class="box"></span><span><a href="#/${route}" style="color:inherit">${esc(text)}</a></span></li>`).join('')}</ul>
    <p class="small muted" style="margin-bottom:0">Only one operation runs at a time, but Xenobiology crops grow alongside it. Everything keeps going for up to 24 hours while you are away.</p>
  </div>`;
}

function activity() {
  const S = G.state;
  const a = S.active;
  if (!a) return `<div class="panel"><div class="ph">${icon('bridge')} Current operation</div><p class="muted" style="margin:0">Your ship is idle. Choose a skill from the menu to start an operation.</p></div>`;
  const act = getAction(a.skill, a.action);
  return `<div class="panel"><div class="ph">${icon(a.skill)} Current operation<div class="ph-right"><a class="btn xs" href="#/${a.skill}">Open</a></div></div>
    <div class="row between"><div><div class="tiny muted upper">${esc(SKILLS[a.skill].name)}</div><b style="font-size:18px">${esc(act.name)}</b></div></div>
    <div style="margin-top:10px">${progressBar(a.skill, a.action)}</div>
  </div>`;
}

export default {
  render(root) {
    const S = G.state;
    const tl = totalLevel();
    const r = rankFor(tl);
    const ship = SHIPS[S.ships.active];
    const nextPct = r.next ? (tl - r.at) / (r.next.at - r.at) : 1;
    const achDone = Object.keys(S.achievements).length;
    const tiles = SKILL_GROUPS.map((g) => Object.values(SKILLS).filter((s) => s.group === g.id).map((s) => `
      <a class="skill-tile" href="#/${s.id}" style="--sc:${s.color}">
        <div class="row">${icon(s.id)}<b>${esc(s.name)}</b><span class="lv"><span data-b="level" data-skill="${s.id}">${skillLevel(s.id)}</span></span></div>
        <div class="bar thin"><i data-b="xp-bar" data-skill="${s.id}"></i></div>
      </a>`).join('')).join('');
    const ready = readyCount();
    root.innerHTML = `<div class="page">
      <div class="panel cmdr-card">
        <div>${insignia(S.insignia)}</div>
        <div>
          <div class="tiny muted upper">Commander</div>
          <div class="cmdr-name">${esc(S.name)}</div>
          <div class="rank">${r.name}</div>
          <div class="bar seg" style="margin:8px 0 4px;max-width:320px"><i style="width:${nextPct * 100}%"></i></div>
          <div class="tiny muted">${r.next ? `Total level ${tl} of ${r.next.at} for ${r.next.name}` : 'Highest rank achieved'}</div>
        </div>
        <div style="width:min(260px,100%)"><div class="ship-art" style="height:110px">${shipArt(ship.hull, ship.color)}</div><div class="small right"><span class="muted">Flying</span> <b>${esc(ship.name)}</b></div></div>
      </div>
      ${brief()}
      <div class="grid four">
        <div class="panel"><div class="tiny muted upper">Credits</div><div class="stat-big"><span data-b="credits-short"></span></div></div>
        <div class="panel"><div class="tiny muted upper">Total level</div><div class="stat-big">${tl}<small> / ${Object.keys(SKILLS).length * 99}</small></div></div>
        <div class="panel"><div class="tiny muted upper">Systems discovered</div><div class="stat-big">${fmtShort(S.explore.total)}</div></div>
        <div class="panel"><div class="tiny muted upper">Achievements</div><div class="stat-big">${achDone}<small> / ${ACHIEVEMENTS.length}</small></div></div>
      </div>
      <div class="grid two">
        ${activity()}
        <div class="panel"><div class="ph">${icon('xenobiology')} Hydroponics</div>
          <p style="margin:0">${ready ? `<b class="good">${ready} crop${ready > 1 ? 's' : ''} ready to harvest.</b>` : `${S.farming.plots.filter((p) => p.crop).length} of ${S.farming.plots.length} bays growing.`}</p>
          <a class="btn xs" href="#/xenobiology" style="margin-top:10px">Open bays</a>
        </div>
      </div>
      <div class="section-title">Skills</div>
      <div class="skill-tiles">${tiles}</div>
      <p class="tiny muted">Time played ${fmtTime(S.stats.playTime)} &middot; offline ${fmtTime(S.stats.offlineTime)} &middot; ${fmt(S.stats.creditsEarned)} credits earned in total</p>
    </div>`;
  },

  click(t) {
    if (t.dataset.act === 'dismiss') {
      G.state.tutorialDismissed = true;
      this.render(document.getElementById('content'));
    }
  },

  events: { action: true, levelup: true, ships: true, farm: true },
};
