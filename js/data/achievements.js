// Achievements. Each check receives an api object from the engine:
//   { S, skillLevel(id), totalLevel(), maxMasteryLevel(), shipsOwned(), companionsFound() }

import { SKILLS, SKILL_ORDER } from './skills.js';
import { SHIP_ORDER } from './ships.js';
import { COMPANIONS } from './companions.js';

export const ACHIEVEMENTS = [];

const add = (id, name, desc, check, reward = 0) => ACHIEVEMENTS.push({ id, name, desc, check, reward });

const TIERS = [
  [10, 'Apprentice', 500],
  [50, 'Adept', 25000],
  [99, 'Master', 1000000],
];

for (const id of SKILL_ORDER) {
  for (const [lvl, title, reward] of TIERS) {
    add(`${id}_${lvl}`, `${SKILLS[id].name} ${title}`, `Reach level ${lvl} ${SKILLS[id].name}.`, (a) => a.skillLevel(id) >= lvl, reward);
  }
}

const TOTALS = [[50, 'First Steps'], [150, 'Rising Star'], [300, 'Seasoned Spacer'], [600, 'Veteran Commander'], [900, 'Legend of the Black'], [SKILL_ORDER.length * 99, 'Elite']];
for (const [n, name] of TOTALS) add(`total_${n}`, name, `Reach a total level of ${n}.`, (a) => a.totalLevel() >= n);

const CREDITS = [[10000, 'Pocket Change'], [1000000, 'Millionaire'], [100000000, 'Tycoon'], [1000000000, 'Galactic Magnate']];
for (const [n, name] of CREDITS) add(`credits_${n}`, name, `Earn ${n.toLocaleString('en-GB')} credits in total.`, (a) => a.S.stats.creditsEarned >= n);

const SYSTEMS = [[10, 'Stargazer'], [100, 'Surveyor'], [1000, 'Pathfinder'], [10000, 'Trailblazer']];
for (const [n, name] of SYSTEMS) add(`systems_${n}`, name, `Discover ${n.toLocaleString('en-GB')} star systems.`, (a) => a.S.explore.total >= n);

add('elw', 'Pale Blue Dot', 'Discover an Earth-like world.', (a) => (a.S.explore.notable.survey_elw || 0) >= 1);
add('black_hole', 'Event Horizon', 'Discover a black hole.', (a) => (a.S.explore.stars.BH || 0) >= 1);
add('quark', 'Strange Matter', 'Discover a quark star.', (a) => (a.S.explore.stars.Q || 0) >= 1);

add('ships_3', 'Fleet Owner', 'Own 3 ships.', (a) => a.shipsOwned() >= 3);
add('ships_6', 'Fleet Admiral', 'Own 6 ships.', (a) => a.shipsOwned() >= 6);
add('ships_all', 'Collector of Hulls', 'Own every ship.', (a) => a.shipsOwned() >= SHIP_ORDER.length);
add('andromeda', 'Across the Void', 'Build the Andromeda.', (a) => a.S.ships.owned.includes('andromeda'));

add('companion_1', 'Not Alone', 'Find a companion.', (a) => a.companionsFound() >= 1);
add('companion_6', 'Menagerie', 'Find 6 companions.', (a) => a.companionsFound() >= 6);
add('companion_all', 'Full Crew', 'Find every companion.', (a) => a.companionsFound() >= COMPANIONS.length);

add('mastery_99', 'Perfectionist', 'Reach mastery level 99 on any action.', (a) => a.maxMasteryLevel() >= 99);
add('gem_painite', 'Bleeding Red', 'Find a Painite.', (a) => (a.S.stats.found?.painite || 0) >= 1);
add('trade_100', 'Regular Trader', 'Complete 100 trade runs.', (a) => (a.S.stats.tradeRuns || 0) >= 100);
add('harvest_100', 'Green Fingers', 'Harvest 100 crops.', (a) => (a.S.stats.harvests || 0) >= 100);
add('cargo_10', 'Room to Breathe', 'Buy 10 cargo expansions.', (a) => a.S.cargoBought >= 10);

export const ACHIEVEMENT_MAP = Object.fromEntries(ACHIEVEMENTS.map((x) => [x.id, x]));
