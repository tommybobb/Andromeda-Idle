// Piloting: a passive skill fed by every ship operation.

import { G } from '../../game/state.js';
import { SKILLS, PILOT_INTERVAL_PER_LEVEL, PILOT_XP_SHARE } from '../../data/skills.js';
import { SHIPS, SHIP_ORDER } from '../../data/ships.js';
import { esc, fmt, fmt1 } from '../../core/util.js';
import { icon, shipArt } from '../icons.js';
import { skillHeader } from '../parts.js';
import { skillLevel } from '../../game/progress.js';

export default {
  render(root) {
    const lvl = skillLevel('piloting');
    const shipSkills = Object.values(SKILLS).filter((s) => s.ship);
    const rows = SHIP_ORDER.map((id) => {
      const s = SHIPS[id];
      const owned = G.state.ships.owned.includes(id);
      const can = lvl >= s.pilot;
      return `<tr><td><div class="row"><div style="width:64px;height:32px">${shipArt(s.hull, s.color, { engines: false })}</div><b>${esc(s.name)}</b></div></td>
        <td class="small muted">${esc(s.role)}</td><td class="num ${can ? 'good' : 'bad'}">${s.pilot}</td>
        <td class="small">${owned ? '<span class="good">Owned</span>' : s.craft ? 'Engineering' : `${fmt(s.price)} CR`}</td></tr>`;
    }).join('');
    root.innerHTML = `<div class="page">
      ${skillHeader('piloting')}
      <div class="grid two">
        <div class="panel"><div class="ph">${icon('piloting')} Flight systems</div>
          <div class="kvs">
            <div class="kv"><span>Ship operation speed</span><b class="good">-${fmt1(lvl * PILOT_INTERVAL_PER_LEVEL)}% interval</b></div>
            <div class="kv"><span>XP share from ship operations</span><b>${PILOT_XP_SHARE * 100}%</b></div>
            <div class="kv"><span>Ships you can fly</span><b>${SHIP_ORDER.filter((id) => SHIPS[id].pilot <= lvl).length} / ${SHIP_ORDER.length}</b></div>
          </div>
          <p class="small muted">Piloting XP comes from ${shipSkills.map((s) => esc(s.name)).join(', ')}. Each level makes all of them ${PILOT_INTERVAL_PER_LEVEL}% faster.</p>
          <a class="btn sm" href="#/hangar">${icon('hangar')} Open hangar</a>
        </div>
        <div class="panel"><div class="ph">Ship licences</div>
          <div class="table-wrap"><table class="table"><thead><tr><th>Ship</th><th>Role</th><th class="num">Pilot Lv</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table></div>
        </div>
      </div>
    </div>`;
  },
  events: {
    levelup: (d) => d.skill === 'piloting',
    ships: true,
  },
};
