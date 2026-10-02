// Statistics.

import { G } from '../../game/state.js';
import { SKILLS, SKILL_ORDER } from '../../data/skills.js';
import { esc, fmt, fmtTime } from '../../core/util.js';
import { icon } from '../icons.js';
import { skillLevel, totalMastery } from '../../game/progress.js';

const row = (label, value) => `<tr><td>${label}</td><td class="num">${value}</td></tr>`;

export default {
  render(root) {
    const S = G.state;
    const st = S.stats;
    const skills = SKILL_ORDER.map((id) => {
      const sk = SKILLS[id];
      const masteryMax = sk.actions.length * 99;
      return `<tr><td><div class="row">${icon(id, 'ico sm')}${esc(sk.name)}</div></td><td class="num">${skillLevel(id)}</td><td class="num">${fmt(S.skills[id].xp)}</td>
        <td class="num">${masteryMax ? `${fmt(totalMastery(id))} / ${fmt(masteryMax)}` : '-'}</td><td class="num">${fmt(st.actions[id] || 0)}</td></tr>`;
    }).join('');
    root.innerHTML = `<div class="page">
      <div class="page-title">${icon('stats')} Statistics</div>
      <div class="grid two">
        <div class="panel"><div class="ph">Career</div><div class="table-wrap"><table class="table"><tbody>
          ${row('Time played', fmtTime(st.playTime))}
          ${row('Time offline (processed)', fmtTime(st.offlineTime))}
          ${row('Profile created', new Date(S.created).toLocaleDateString('en-GB'))}
          ${row('Items produced', fmt(st.produced))}
          ${row('Materials preserved', fmt(st.preserved))}
          ${row('Doubled outputs', fmt(st.doubled))}
          ${row('Asteroids depleted', fmt(st.rocksDepleted))}
          ${row('Successful salvages', fmt(st.salvageSuccess))}
          ${row('Salvage failures', fmt(st.salvageFail))}
          ${row('Systems discovered', fmt(S.explore.total))}
          ${row('Crops harvested', fmt(st.harvests))}
          ${row('Crops withered', fmt(st.cropsFailed))}
        </tbody></table></div></div>
        <div class="panel"><div class="ph">Economy</div><div class="table-wrap"><table class="table"><tbody>
          ${row('Credits now', `${fmt(S.credits)} CR`)}
          ${row('Credits earned', `${fmt(st.creditsEarned)} CR`)}
          ${row('Credits spent', `${fmt(st.creditsSpent)} CR`)}
          ${row('Items sold', fmt(st.itemsSold))}
          ${row('Market sales', `${fmt(st.salesValue)} CR`)}
          ${row('Trade runs', fmt(st.tradeRuns))}
          ${row('Trade income', `${fmt(st.tradeProfit)} CR`)}
          ${row('Ships owned', fmt(S.ships.owned.length))}
          ${row('Cargo expansions', fmt(S.cargoBought))}
        </tbody></table></div></div>
      </div>
      <div class="panel"><div class="ph">Skills</div><div class="table-wrap"><table class="table">
        <thead><tr><th>Skill</th><th class="num">Level</th><th class="num">XP</th><th class="num">Mastery</th><th class="num">Actions</th></tr></thead>
        <tbody>${skills}</tbody></table></div></div>
    </div>`;
  },
  events: { levelup: true },
};
