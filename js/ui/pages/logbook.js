// Logbook: achievements, companions and the exploration record.

import { G } from '../../game/state.js';
import { ACHIEVEMENTS } from '../../data/achievements.js';
import { COMPANIONS } from '../../data/companions.js';
import { STAR_CLASSES, SKILLS } from '../../data/skills.js';
import { ITEMS } from '../../data/items.js';
import { esc, fmt } from '../../core/util.js';
import { icon, companionArt, itemIcon } from '../icons.js';

let tab = 'achievements';

function achievements() {
  const S = G.state;
  const done = ACHIEVEMENTS.filter((a) => S.achievements[a.id]).length;
  return `<div class="row between"><span class="muted">${done} of ${ACHIEVEMENTS.length} unlocked</span></div>
    <div class="grid">${ACHIEVEMENTS.map((a) => {
      const t = S.achievements[a.id];
      return `<div class="ach ${t ? 'done' : ''}">${icon('medal', 'medal')}<div><div class="t">${esc(a.name)}</div><div class="small muted">${esc(a.desc)}${a.reward ? ` Reward ${fmt(a.reward)} CR.` : ''}</div>${t ? `<div class="tiny gold">${new Date(t).toLocaleDateString('en-GB')}</div>` : ''}</div></div>`;
    }).join('')}</div>`;
}

function companions() {
  const S = G.state;
  return `<p class="muted" style="margin-top:0">Companions turn up very rarely while you train. Longer actions and higher levels improve your odds. Each one gives a permanent bonus.</p>
    <div class="grid">${COMPANIONS.map((c) => {
      const found = S.companions[c.id];
      return `<div class="card companion ${found ? '' : 'unknown'}"><div class="row" style="gap:14px">${companionArt(c, !!found)}
        <div><div class="name" style="font-weight:700;font-size:17px">${found ? esc(c.name) : 'Unknown'}</div><div class="small muted">${found ? esc(c.species) : `Found through ${esc(SKILLS[c.skill].name)}`}</div>
        <div class="chip ${found ? 'good' : ''}" style="margin-top:6px;display:inline-block">${esc(c.bonus)}</div></div></div>
        ${found ? `<div class="small muted">${esc(c.desc)}</div>` : ''}</div>`;
    }).join('')}</div>`;
}

function discoveries() {
  const ex = G.state.explore;
  const stars = Object.entries(STAR_CLASSES).map(([k, s]) => `<tr><td><span class="star-dot" style="color:${s.color}"></span>${esc(s.name)}</td><td class="muted small">${esc(s.cls)}</td><td class="num">${fmt(ex.stars[k] || 0)}</td></tr>`).join('');
  const notable = Object.entries(ex.notable).map(([id, n]) => `<div class="row">${itemIcon(id, 'sm')}<span>${esc(ITEMS[id].name)}</span><b style="margin-left:auto">${fmt(n)}</b></div>`).join('');
  const log = ex.log.map((s) => `<tr><td>${esc(s.name)}</td><td class="small"><span class="star-dot" style="color:${STAR_CLASSES[s.star]?.color}"></span>${esc(STAR_CLASSES[s.star]?.name || s.star)}</td><td class="small muted">${esc(s.region)}</td><td class="small gold">${esc(s.finds.join(', '))}</td></tr>`).join('');
  return `<div class="grid two">
    <div class="panel"><div class="ph">Stellar census<div class="ph-right"><span class="small">${fmt(ex.total)} systems</span></div></div><table class="table"><tbody>${stars}</tbody></table></div>
    <div class="panel"><div class="ph">Notable finds</div><div class="stack">${notable || '<span class="muted small">Nothing remarkable yet. Keep scanning.</span>'}</div></div>
  </div>
  <div class="panel"><div class="ph">Flight log</div>${log ? `<div class="table-wrap"><table class="table"><thead><tr><th>System</th><th>Primary</th><th>Region</th><th>Notes</th></tr></thead><tbody>${log}</tbody></table></div>` : '<span class="muted small">No systems logged yet.</span>'}</div>`;
}

export default {
  render(root) {
    root.innerHTML = `<div class="page">
      <div class="page-title">${icon('logbook')} Logbook</div>
      <div class="tabs">
        <button class="tab ${tab === 'achievements' ? 'on' : ''}" data-act="tab" data-tab="achievements">Achievements</button>
        <button class="tab ${tab === 'companions' ? 'on' : ''}" data-act="tab" data-tab="companions">Companions</button>
        <button class="tab ${tab === 'discoveries' ? 'on' : ''}" data-act="tab" data-tab="discoveries">Discoveries</button>
      </div>
      ${tab === 'companions' ? companions() : tab === 'discoveries' ? discoveries() : achievements()}
    </div>`;
  },
  click(t) {
    if (t.dataset.act === 'tab') {
      tab = t.dataset.tab;
      this.render(document.getElementById('content'));
    }
  },
  events: { achievement: true, companion: true },
};
