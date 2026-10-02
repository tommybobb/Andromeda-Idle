// Procedural star system discoveries for the Exploration skill.

import { G } from './state.js';
import { STAR_CLASSES } from '../data/skills.js';
import { pick, randInt, chance, weightedPick } from '../core/util.js';

const SYL_A = ['Thry', 'Vor', 'Ael', 'Kor', 'Zel', 'Myr', 'Prae', 'Ox', 'Hel', 'Syr', 'Cass', 'Dra', 'Ery', 'Lyn', 'Qua', 'Tau', 'Ur', 'Vel', 'Xan', 'Ise', 'Bre', 'Gor', 'Nym', 'Pho', 'Rho', 'Sca', 'Wre', 'Ytt'];
const SYL_B = ['aea', 'on', 'ius', 'ar', 'eth', 'ix', 'ora', 'is', 'un', 'ae', 'ul', 'ion', 'ara', 'os', 'eia', 'yn', 'ack', 'oth'];
const SUFFIX = ['Sector', 'Reach', 'Expanse', 'Drift', 'Cluster', 'Deep', 'Veil'];
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const L = () => LETTERS[Math.floor(Math.random() * 26)];

export function systemName() {
  const mass = pick(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']);
  return `${pick(SYL_A)}${pick(SYL_B)} ${pick(SUFFIX)} ${L()}${L()}-${L()} ${mass}${randInt(1, 40)}-${randInt(0, 9)}`;
}

// Rolls a system for a region. discoveryPct boosts notable body chances.
export function rollSystem(region, notableTable, discoveryPct) {
  const table = Object.entries(region.stars);
  const [star] = weightedPick(table, 1);
  const bodies = star === 'BH' || star === 'Q' ? randInt(0, 4) : randInt(1, 18);
  const finds = [];
  const mult = 1 + discoveryPct / 100;
  if (bodies > 0) {
    for (const [itemId, label, pct] of notableTable) {
      if (chance(pct * mult)) finds.push({ item: itemId, label });
    }
  }
  if (star === 'BH') finds.push({ item: 'survey_bh', label: 'Black Hole' });
  if (star === 'N') finds.push({ item: 'survey_ns', label: 'Neutron Star' });
  if (star === 'Q') finds.push({ item: 'survey_bh', label: 'Quark Star' });
  return { name: systemName(), star, bodies, finds, region: region.name };
}

export function recordSystem(sys) {
  const ex = G.state.explore;
  ex.total += 1;
  ex.stars[sys.star] = (ex.stars[sys.star] || 0) + 1;
  for (const f of sys.finds) ex.notable[f.item] = (ex.notable[f.item] || 0) + 1;
  ex.log.unshift({ name: sys.name, star: sys.star, bodies: sys.bodies, finds: sys.finds.map((f) => f.label), region: sys.region, t: G.state.time });
  if (ex.log.length > 40) ex.log.length = 40;
  if (G.summary) G.summary.systems += 1;
}

export const starInfo = (cls) => STAR_CLASSES[cls] || { name: cls, cls, color: '#fff' };
