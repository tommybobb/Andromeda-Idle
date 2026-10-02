// Skill and action definitions.
//
// handler: which engine routine completes an action
//   gather  - Mining, Gas Harvesting (no inputs)
//   salvage - Salvaging (success roll, credits and a loot table)
//   explore - Exploration (fuel inputs, discoveries)
//   craft   - artisan skills (inputs -> outputs)
//   trade   - Trading (sells a full hold of a commodity for a margin)
// kind: 'action' (default), 'farming' or 'passive'
//
// perks(ml): bonuses an individual action gets from its own mastery level.
// pool: mastery pool checkpoints, active while the pool is at or above pct.

import { MODULE_RECIPES } from './items.js';
import { SHIP_RECIPES } from './ships.js';

const io = (...a) => {
  const out = [];
  for (let i = 0; i < a.length; i += 2) out.push({ id: a[i], qty: a[i + 1] });
  return out;
};

const artisanPerks = (ml) => ({ preserve: Math.floor(ml / 10) * 2 + (ml >= 99 ? 5 : 0), double: Math.floor(ml / 25) * 2 });
const ARTISAN_PERK_TEXT = 'Every 10 mastery levels: +2% preservation chance. Every 25 levels: +2% double output chance. Level 99: +5% extra preservation.';
const artisanPool = (name) => [
  { pct: 10, mods: { mxp: 5 }, text: `+5% ${name} Mastery XP` },
  { pct: 25, mods: { preserve: 5 }, text: '+5% preservation chance' },
  { pct: 50, mods: { double: 5 }, text: '+5% double output chance' },
  { pct: 95, mods: { preserve: 10 }, text: '+10% preservation chance' },
];

// ---------------------------------------------------------------------------
const rock = (id, name, level, xp, ore, respawn) => ({ id, name, level, xp, interval: 3000, outputs: io(ore, 1), respawn: respawn * 1000 });
const cloud = (id, name, level, xp, gas, secs) => ({ id, name, level, xp, interval: secs * 1000, outputs: io(gas, 1) });
const wreck = (id, name, level, xp, perception, credits, loot) => ({ id, name, level, xp, interval: 3000, perception, credits, loot });
const region = (id, name, level, xp, secs, outputs, inputs, stars, loot) => ({ id, name, level, xp, interval: secs * 1000, outputs, inputs, stars, loot });
const route = (id, name, level, xp, commodity, margin, secs = 6) => ({ id, name, level, xp, interval: secs * 1000, commodity, margin });
const recipe = (id, name, level, xp, interval, inputs, outputs, category) => ({ id, name, level, xp, interval, inputs, outputs, category });

export const STAR_CLASSES = {
  M: { name: 'Red Dwarf', cls: 'M', color: '#ff6b4a' },
  K: { name: 'Orange Dwarf', cls: 'K', color: '#ff9f43' },
  G: { name: 'Yellow Star', cls: 'G', color: '#ffe066' },
  F: { name: 'White Star', cls: 'F', color: '#fff6d8' },
  A: { name: 'Blue-White Star', cls: 'A', color: '#d8ecff' },
  B: { name: 'Blue Giant', cls: 'B', color: '#9fd0ff' },
  O: { name: 'Blue Supergiant', cls: 'O', color: '#7fb5ff' },
  W: { name: 'Wolf-Rayet Star', cls: 'W', color: '#b7a6ff' },
  C: { name: 'Carbon Star', cls: 'C', color: '#ff4d4d' },
  BD: { name: 'Brown Dwarf', cls: 'L/T', color: '#a0522d' },
  D: { name: 'White Dwarf', cls: 'D', color: '#f0f8ff' },
  N: { name: 'Neutron Star', cls: 'N', color: '#9fe7ff' },
  BH: { name: 'Black Hole', cls: 'BH', color: '#c9a6ff' },
  Q: { name: 'Quark Star', cls: 'Q', color: '#ec7bff' },
};

export const SKILLS = {
  mining: {
    name: 'Mining', group: 'gathering', handler: 'gather', ship: true, color: '#ff9a3c', scene: 'asteroid', verb: 'Mine',
    desc: 'Fire your mining laser into asteroids to extract ore. Each asteroid has integrity that drops as you mine and recovers over time. Mining also turns up rare gemstones.',
    perks: (ml) => ({ double: Math.floor(ml / 10) * 2, integrity: ml, yield: ml >= 99 ? 1 : 0 }),
    perkText: 'Each mastery level: +1 asteroid integrity. Every 10 levels: +2% double ore chance. Level 99: +1 ore per action and -0.2s interval.',
    pool: [
      { pct: 10, mods: { mxp: 5 }, text: '+5% Mining Mastery XP' },
      { pct: 25, mods: { integrity: 10 }, text: '+10 asteroid integrity' },
      { pct: 50, mods: { double: 5 }, text: '+5% double ore chance' },
      { pct: 95, mods: { yield: 1 }, text: '+1 ore per action' },
    ],
    gems: [['alexandrite', 40], ['benitoite', 25], ['musgravite', 17], ['grandidierite', 12], ['void_opal', 6]],
    gemChance: 1,
    actions: [
      rock('ferrite', 'Ferrite Asteroid', 1, 7, 'ferrite_ore', 5),
      rock('silicate', 'Silicate Asteroid', 1, 7, 'silicate_ore', 5),
      rock('ice', 'Ice Asteroid', 5, 9, 'water_ice', 6),
      rock('cuprite', 'Cuprite Asteroid', 10, 14, 'cuprite_ore', 8),
      rock('bauxite', 'Bauxite Asteroid', 20, 18, 'bauxite_ore', 10),
      rock('carbon', 'Carbonaceous Asteroid', 30, 25, 'carbon_ore', 12),
      rock('rutile', 'Rutile Asteroid', 40, 32, 'rutile_ore', 15),
      rock('cobaltite', 'Cobaltite Asteroid', 50, 45, 'cobaltite_ore', 20),
      rock('platinum', 'Metallic Asteroid', 60, 55, 'platinum_ore', 25),
      rock('iridium', 'Iridium Asteroid', 70, 70, 'iridium_ore', 35),
      rock('osmium', 'Osmium Asteroid', 80, 85, 'osmium_ore', 45),
      rock('neutronium', 'Collapsed Star Fragment', 90, 110, 'neutronium_shard', 60),
    ],
  },

  gas: {
    name: 'Gas Harvesting', group: 'gathering', handler: 'gather', ship: true, color: '#ffd36b', scene: 'gasgiant', verb: 'Harvest',
    desc: 'Skim the upper atmospheres of gas giants and nebulae for valuable gases. Your scoops occasionally catch drifting Spore Clusters full of seeds.',
    perks: (ml) => ({ double: Math.floor(ml / 10) * 2, yield: ml >= 99 ? 1 : 0 }),
    perkText: 'Every 10 mastery levels: +2% double gas chance. Level 99: +1 gas per action and -0.2s interval.',
    pool: [
      { pct: 10, mods: { mxp: 5 }, text: '+5% Gas Harvesting Mastery XP' },
      { pct: 25, mods: { interval: -5 }, text: '-5% harvesting interval' },
      { pct: 50, mods: { double: 5 }, text: '+5% double gas chance' },
      { pct: 95, mods: { yield: 1 }, text: '+1 gas per action' },
    ],
    special: { item: 'spore_cluster', chance: 0.5 },
    actions: [
      cloud('hydrogen', 'Hydrogen Cloud', 1, 10, 'hydrogen', 3),
      cloud('helium', 'Helium Envelope', 10, 15, 'helium', 4),
      cloud('methane', 'Methane Giant', 20, 22, 'methane', 5),
      cloud('ammonia', 'Ammonia Giant', 30, 30, 'ammonia', 6),
      cloud('argon', 'Argon Haze', 40, 40, 'argon', 8),
      cloud('neon', 'Neon Shroud', 50, 60, 'neon', 10),
      cloud('xenon', 'Xenon Storm', 60, 80, 'xenon', 12),
      cloud('tritium', 'Tritium Ice Giant', 70, 105, 'tritium', 16),
      cloud('helium3', 'Helium-3 Gas Giant', 80, 140, 'helium3', 18),
      cloud('exotic', 'Exotic Matter Haze', 90, 180, 'exotic_matter', 20),
    ],
  },

  salvaging: {
    name: 'Salvaging', group: 'gathering', handler: 'salvage', ship: true, color: '#7bd88f', scene: 'wreck', verb: 'Salvage',
    desc: 'Pick through derelicts for credits and loot. Your Finesse (level + mastery + bonuses) is tested against each wreck\'s Hazard rating. A failed attempt forces a 3 second systems reboot.',
    perks: (ml) => ({ stealth: ml, double: ml >= 99 ? 10 : 0 }),
    perkText: 'Each mastery level: +1 Finesse on that wreck. Level 99: +10% double loot chance.',
    pool: [
      { pct: 10, mods: { mxp: 5 }, text: '+5% Salvaging Mastery XP' },
      { pct: 25, mods: { stealth: 15 }, text: '+15 Finesse' },
      { pct: 50, mods: { double: 5 }, text: '+5% double loot chance' },
      { pct: 95, mods: { salvageCredits: 50 }, text: '+50% credits found' },
    ],
    lootChance: 75,
    actions: [
      wreck('escape_pod', 'Drifting Escape Pod', 1, 5, 10, [1, 15], [
        ['scrap_metal', 50, 1, 3], ['personal_effects', 15, 1, 1], ['lumimoss_spores', 25, 1, 4], ['glowcap_spores', 10, 1, 2],
      ]),
      wreck('canisters', 'Jettisoned Cargo', 8, 9, 30, [5, 30], [
        ['scrap_metal', 40, 2, 4], ['damaged_circuit', 25, 1, 2], ['personal_effects', 20, 1, 2], ['ironroot_seeds', 10, 1, 2], ['sealed_container', 5, 1, 1],
      ]),
      wreck('scout_wreck', 'Scout Hull Wreck', 18, 15, 60, [10, 60], [
        ['scrap_metal', 35, 3, 6], ['damaged_circuit', 30, 1, 3], ['data_core', 15, 1, 1], ['copper_ingot', 10, 1, 2], ['starbloom_seeds', 10, 1, 2],
      ]),
      wreck('mining_barge', 'Abandoned Mining Barge', 28, 22, 90, [20, 90], [
        ['cuprite_ore', 20, 5, 10], ['bauxite_ore', 15, 3, 8], ['carbon_ore', 15, 3, 6], ['scrap_metal', 20, 4, 8],
        ['data_core', 15, 1, 1], ['voidvine_seeds', 10, 1, 2], ['alexandrite', 5, 1, 1],
      ]),
      wreck('freighter', 'Freighter Hulk', 40, 32, 140, [40, 200], [
        ['sealed_container', 15, 1, 1], ['steel_ingot', 15, 2, 4], ['personal_effects', 15, 1, 3], ['data_core', 20, 1, 2],
        ['encrypted_data', 8, 1, 1], ['circuit_board', 12, 1, 2], ['emberleaf_seeds', 10, 1, 2], ['occupied_pod', 5, 1, 1],
      ]),
      wreck('outpost', 'Abandoned Outpost', 52, 45, 190, [80, 350], [
        ['encrypted_data', 20, 1, 1], ['data_core', 20, 1, 2], ['titanium_ingot', 15, 2, 3], ['sealed_container', 15, 1, 1],
        ['cryo_lotus_seeds', 10, 1, 1], ['military_alloy', 8, 1, 1], ['benitoite', 4, 1, 1],
      ]),
      wreck('generation_ship', 'Generation Ship Remains', 64, 60, 240, [150, 600], [
        ['personal_effects', 20, 3, 6], ['encrypted_data', 20, 1, 2], ['military_alloy', 15, 1, 1], ['platinum_ingot', 15, 1, 3],
        ['psi_orchid_seeds', 10, 1, 1], ['occupied_pod', 10, 1, 1], ['ancient_relic', 3, 1, 1],
      ]),
      wreck('alien_debris', 'Alien Debris Field', 76, 80, 300, [250, 900], [
        ['alien_biostructure', 25, 1, 1], ['encrypted_data', 20, 1, 2], ['exotic_matter', 15, 1, 3], ['military_alloy', 15, 1, 2],
        ['nebula_kelp_spores', 10, 1, 1], ['void_opal', 5, 1, 1], ['ancient_relic', 5, 1, 1],
      ]),
      wreck('precursor_ruins', 'Precursor Ruins', 88, 105, 380, [400, 1500], [
        ['ancient_relic', 25, 1, 1], ['alien_biostructure', 20, 1, 1], ['neutronium_shard', 15, 1, 2], ['void_opal', 10, 1, 1],
        ['truffle_spores', 10, 1, 1], ['precursor_core', 6, 1, 1], ['painite', 4, 1, 1],
      ]),
    ],
  },

  exploration: {
    name: 'Exploration', group: 'gathering', handler: 'explore', ship: true, color: '#4ccbf2', scene: 'star', verb: 'Explore',
    desc: 'Jump into uncharted regions and scan every system you find. Each scan returns survey data and logs a new system. Look out for black holes, neutron stars and the rare Earth-like world. Deeper regions need fuel.',
    perks: (ml) => ({ discovery: Math.floor(ml / 10) * 2, preserve: ml >= 99 ? 20 : Math.floor(ml / 20) * 3 }),
    perkText: 'Every 10 mastery levels: +2% discovery chance. Every 20 levels: +3% fuel preservation. Level 99: 20% fuel preservation.',
    pool: [
      { pct: 10, mods: { mxp: 5 }, text: '+5% Exploration Mastery XP' },
      { pct: 25, mods: { interval: -5 }, text: '-5% scan interval' },
      { pct: 50, mods: { discovery: 10 }, text: '+10% discovery chance' },
      { pct: 95, mods: { preserve: 25 }, text: '+25% fuel preservation' },
    ],
    rareChance: 4,
    notable: [
      ['survey_elw', 'Earth-like World', 0.25],
      ['survey_ww', 'Water World', 1.5],
      ['survey_aw', 'Ammonia World', 0.8],
    ],
    actions: [
      region('local', 'Local Cluster', 1, 12, 4, io('stellar_data_1', 1), [],
        { M: 40, K: 20, G: 12, F: 8, A: 4, BD: 10, D: 5, N: 0.5, BH: 0.1 },
        [['lumimoss_spores', 30, 2, 5], ['glowcap_spores', 25, 1, 3], ['silicate_ore', 25, 3, 8], ['water_ice', 20, 3, 8]]),
      region('inner_arm', 'Inner Spiral Arm', 12, 20, 5, io('stellar_data_1', 2), io('h_fuel_cell', 1),
        { M: 35, K: 20, G: 13, F: 9, A: 5, B: 2, BD: 9, D: 5, N: 1, BH: 0.3 },
        [['ironroot_seeds', 30, 1, 3], ['starbloom_seeds', 20, 1, 2], ['cuprite_ore', 30, 3, 8], ['alexandrite', 10, 1, 1], ['data_core', 10, 1, 1]]),
      region('outer_arm', 'Outer Spiral Arm', 25, 32, 6, io('stellar_data_2', 1), io('h_fuel_cell', 1),
        { M: 33, K: 19, G: 13, F: 10, A: 6, B: 3, O: 0.5, BD: 9, D: 5, N: 1.5, BH: 0.5, C: 0.5 },
        [['starbloom_seeds', 25, 1, 2], ['voidvine_seeds', 20, 1, 2], ['benitoite', 10, 1, 1], ['data_core', 25, 1, 2], ['rutile_ore', 20, 3, 6]]),
      region('nebula', 'Nebula Expanse', 40, 48, 7, io('stellar_data_2', 2), io('fusion_pellet', 1),
        { M: 25, K: 15, G: 12, F: 12, A: 10, B: 8, O: 3, W: 1, BD: 6, D: 5, N: 2, BH: 1, C: 1 },
        [['voidvine_seeds', 25, 1, 2], ['emberleaf_seeds', 20, 1, 2], ['musgravite', 10, 1, 1], ['encrypted_data', 15, 1, 1], ['argon', 30, 5, 10]]),
      region('nursery', 'Stellar Nursery', 52, 65, 8, io('stellar_data_3', 1), io('fusion_pellet', 1),
        { M: 20, K: 12, G: 10, F: 12, A: 14, B: 12, O: 6, W: 2, BD: 8, D: 2, N: 1.5, BH: 0.8 },
        [['emberleaf_seeds', 25, 1, 2], ['cryo_lotus_seeds', 20, 1, 1], ['grandidierite', 10, 1, 1], ['helium3', 25, 3, 6], ['encrypted_data', 20, 1, 1]]),
      region('core_approach', 'Galactic Core Approach', 65, 85, 9, io('stellar_data_3', 2), io('tritium_fuel', 1),
        { M: 25, K: 25, G: 10, F: 8, A: 6, B: 5, O: 3, W: 2, C: 2, D: 6, N: 4, BH: 2 },
        [['cryo_lotus_seeds', 20, 1, 1], ['psi_orchid_seeds', 15, 1, 1], ['void_opal', 10, 1, 1], ['alien_biostructure', 15, 1, 1], ['iridium_ore', 40, 3, 6]]),
      region('core', 'Galactic Core', 78, 110, 10, io('stellar_data_4', 1), io('tritium_fuel', 1),
        { M: 20, K: 25, G: 8, F: 6, A: 6, B: 6, O: 4, W: 3, C: 3, D: 7, N: 6, BH: 4, Q: 0.05 },
        [['psi_orchid_seeds', 20, 1, 1], ['nebula_kelp_spores', 15, 1, 1], ['painite', 5, 1, 1], ['ancient_relic', 10, 1, 1], ['neutronium_shard', 30, 1, 2], ['osmium_ore', 20, 2, 5]]),
      region('andromeda', 'Andromeda Approach', 90, 150, 12, io('stellar_data_5', 1), io('antimatter_pod', 1),
        { M: 18, K: 18, G: 10, F: 8, A: 8, B: 7, O: 5, W: 4, C: 3, D: 7, N: 5, BH: 5, Q: 0.3 },
        [['nebula_kelp_spores', 20, 1, 1], ['truffle_spores', 15, 1, 1], ['precursor_core', 8, 1, 1], ['painite', 10, 1, 1], ['exotic_matter', 47, 2, 5]]),
    ],
  },

  xenobiology: {
    name: 'Xenobiology', group: 'gathering', kind: 'farming', color: '#9dff9d', scene: 'greenhouse', verb: 'Grow',
    desc: 'Cultivate alien flora in hydroponics bays. Crops grow in real time, even while you are away. Nutrient Gel improves the chance a crop survives. Harvest manually when ready.',
    perks: (ml) => ({ yield: Math.floor(ml / 10), success: ml / 2 }),
    perkText: 'Each mastery level: +0.5% crop survival chance. Every 10 levels: +1 harvest yield.',
    pool: [
      { pct: 10, mods: { mxp: 5 }, text: '+5% Xenobiology Mastery XP' },
      { pct: 25, mods: { farmYield: 10 }, text: '+10% harvest yield' },
      { pct: 50, mods: { growth: -10 }, text: '-10% growth time' },
      { pct: 95, mods: { farmYield: 25 }, text: '+25% harvest yield' },
    ],
    plots: [
      { level: 1, cost: 0 }, { level: 1, cost: 0 }, { level: 1, cost: 0 },
      { level: 10, cost: 5000 }, { level: 20, cost: 15000 }, { level: 30, cost: 40000 },
      { level: 40, cost: 100000 }, { level: 50, cost: 250000 }, { level: 60, cost: 600000 },
      { level: 70, cost: 1200000 }, { level: 80, cost: 2500000 }, { level: 90, cost: 5000000 },
    ],
    actions: [
      { id: 'lumimoss', name: 'Luminous Moss', level: 1, xp: 8, growth: 300, seed: 'lumimoss_spores', seedQty: 3, output: 'lumimoss' },
      { id: 'glowcap', name: 'Glowcap', level: 8, xp: 14, growth: 600, seed: 'glowcap_spores', seedQty: 3, output: 'glowcap' },
      { id: 'ironroot', name: 'Iron Root', level: 15, xp: 22, growth: 900, seed: 'ironroot_seeds', seedQty: 3, output: 'ironroot' },
      { id: 'starbloom', name: 'Starbloom', level: 25, xp: 35, growth: 1800, seed: 'starbloom_seeds', seedQty: 2, output: 'starbloom' },
      { id: 'voidvine', name: 'Void Vine', level: 35, xp: 50, growth: 2700, seed: 'voidvine_seeds', seedQty: 2, output: 'voidvine' },
      { id: 'emberleaf', name: 'Ember Leaf', level: 45, xp: 70, growth: 3600, seed: 'emberleaf_seeds', seedQty: 2, output: 'emberleaf' },
      { id: 'cryo_lotus', name: 'Cryo Lotus', level: 55, xp: 95, growth: 5400, seed: 'cryo_lotus_seeds', seedQty: 1, output: 'cryo_lotus' },
      { id: 'psi_orchid', name: 'Psionic Orchid', level: 65, xp: 130, growth: 7200, seed: 'psi_orchid_seeds', seedQty: 1, output: 'psi_orchid' },
      { id: 'nebula_kelp', name: 'Nebula Kelp', level: 75, xp: 175, growth: 10800, seed: 'nebula_kelp_spores', seedQty: 1, output: 'nebula_kelp' },
      { id: 'celestial_truffle', name: 'Celestial Truffle', level: 85, xp: 240, growth: 14400, seed: 'truffle_spores', seedQty: 1, output: 'celestial_truffle' },
    ],
  },

  refining: {
    name: 'Refining', group: 'production', handler: 'craft', color: '#ff7a45', scene: 'station', verb: 'Refine',
    desc: 'Smelt raw ore into ingots and alloys. Higher grade alloys need Carbonaceous Rock as a reagent.',
    perks: artisanPerks, perkText: ARTISAN_PERK_TEXT, pool: artisanPool('Refining'),
    actions: [
      recipe('iron', 'Iron Ingot', 1, 5, 2000, io('ferrite_ore', 1), io('iron_ingot', 1)),
      recipe('glass', 'Silica Glass', 5, 6, 2000, io('silicate_ore', 2), io('silica_glass', 1)),
      recipe('scrap', 'Recycle Scrap', 8, 7, 2000, io('scrap_metal', 3), io('iron_ingot', 1)),
      recipe('copper', 'Copper Ingot', 10, 9, 2000, io('cuprite_ore', 1), io('copper_ingot', 1)),
      recipe('aluminium', 'Aluminium Ingot', 20, 13, 2000, io('bauxite_ore', 1), io('aluminium_ingot', 1)),
      recipe('steel', 'Steel Ingot', 30, 18, 2000, io('ferrite_ore', 1, 'carbon_ore', 2), io('steel_ingot', 1)),
      recipe('titanium', 'Titanium Ingot', 40, 25, 2000, io('rutile_ore', 1, 'carbon_ore', 2), io('titanium_ingot', 1)),
      recipe('cobalt', 'Cobalt Ingot', 50, 33, 2000, io('cobaltite_ore', 1, 'carbon_ore', 3), io('cobalt_ingot', 1)),
      recipe('platinum', 'Platinum Ingot', 60, 42, 2000, io('platinum_ore', 2), io('platinum_ingot', 1)),
      recipe('iridium', 'Iridium Ingot', 70, 56, 2000, io('iridium_ore', 1, 'carbon_ore', 4), io('iridium_ingot', 1)),
      recipe('osmium', 'Osmium Ingot', 80, 72, 2000, io('osmium_ore', 1, 'carbon_ore', 5), io('osmium_ingot', 1)),
      recipe('neutronium', 'Neutronium Plate', 90, 100, 2000, io('neutronium_shard', 1, 'osmium_ingot', 2), io('neutronium_plate', 1)),
    ],
  },

  fabrication: {
    name: 'Fabrication', group: 'production', handler: 'craft', color: '#bfe8ff', scene: 'station', verb: 'Fabricate',
    desc: 'Turn refined materials into the components that Engineering needs: plating, wiring, circuitry, coils and exotic cores.',
    perks: artisanPerks, perkText: ARTISAN_PERK_TEXT, pool: artisanPool('Fabrication'),
    actions: [
      recipe('hull_plate', 'Hull Plate', 1, 8, 3000, io('iron_ingot', 2), io('hull_plate', 1)),
      recipe('optical_lens', 'Optical Lens', 5, 10, 3000, io('silica_glass', 2), io('optical_lens', 1)),
      recipe('copper_wiring', 'Copper Wiring', 10, 12, 3000, io('copper_ingot', 1), io('copper_wiring', 2)),
      recipe('circuit_board', 'Circuit Board', 15, 20, 3000, io('copper_wiring', 2, 'silica_glass', 1), io('circuit_board', 1)),
      recipe('refurb', 'Refurbish Circuitry', 18, 18, 3000, io('damaged_circuit', 3), io('circuit_board', 1)),
      recipe('alloy_frame', 'Alloy Frame', 20, 28, 3000, io('aluminium_ingot', 3), io('alloy_frame', 1)),
      recipe('heat_sink', 'Heat Sink', 25, 33, 3000, io('aluminium_ingot', 2, 'copper_ingot', 1), io('heat_sink', 1)),
      recipe('steel_girder', 'Steel Girder', 30, 40, 3000, io('steel_ingot', 3), io('steel_girder', 1)),
      recipe('power_coupling', 'Power Coupling', 35, 48, 3000, io('copper_wiring', 2, 'steel_ingot', 1), io('power_coupling', 1)),
      recipe('focusing_crystal', 'Focusing Crystal', 40, 58, 3000, io('optical_lens', 1, 'alexandrite', 1), io('focusing_crystal', 1)),
      recipe('titanium_plating', 'Titanium Plating', 45, 68, 3000, io('titanium_ingot', 3), io('titanium_plating', 1)),
      recipe('sensor_array', 'Sensor Array', 50, 80, 3000, io('circuit_board', 2, 'optical_lens', 1), io('sensor_array', 1)),
      recipe('cobalt_coil', 'Cobalt Coil', 55, 95, 3000, io('cobalt_ingot', 2, 'copper_wiring', 2), io('cobalt_coil', 1)),
      recipe('plasma_conduit', 'Plasma Conduit', 60, 115, 3000, io('platinum_ingot', 2, 'heat_sink', 1), io('plasma_conduit', 1)),
      recipe('superconductor', 'Superconductor Coil', 65, 130, 3000, io('cobalt_coil', 1, 'platinum_ingot', 1, 'ammonia', 2), io('superconductor', 1)),
      recipe('quantum_processor', 'Quantum Processor', 70, 150, 3000, io('circuit_board', 2, 'iridium_ingot', 1, 'benitoite', 1), io('quantum_processor', 1)),
      recipe('gravitic_stabiliser', 'Gravitic Stabiliser', 80, 190, 3000, io('osmium_ingot', 2, 'cobalt_coil', 1, 'grandidierite', 1), io('gravitic_stabiliser', 1)),
      recipe('exotic_matter_core', 'Exotic Matter Core', 90, 260, 3000, io('neutronium_plate', 1, 'exotic_matter', 2, 'void_opal', 1), io('exotic_matter_core', 1)),
    ],
  },

  chemistry: {
    name: 'Chemistry', group: 'production', handler: 'craft', color: '#c7b8ff', scene: 'lab', verb: 'Synthesise',
    desc: 'Process gases and xenoflora into jump fuel, Nutrient Gel and Boosters. Boosters give a skill a bonus for a number of actions.',
    perks: artisanPerks, perkText: ARTISAN_PERK_TEXT,
    pool: [
      { pct: 10, mods: { mxp: 5 }, text: '+5% Chemistry Mastery XP' },
      { pct: 25, mods: { preserve: 5 }, text: '+5% preservation chance' },
      { pct: 50, mods: { boosterCharges: 20 }, text: '+20% booster charges (all boosters)' },
      { pct: 95, mods: { double: 10 }, text: '+10% double output chance' },
    ],
    actions: [
      recipe('h_fuel_cell', 'Hydrogen Fuel Cell', 1, 6, 2000, io('hydrogen', 3), io('h_fuel_cell', 1), 'fuel'),
      recipe('nutrient_gel', 'Nutrient Gel', 4, 9, 2000, io('water_ice', 1, 'lumimoss', 2), io('nutrient_gel', 1), 'supply'),
      recipe('laser_coolant', 'Laser Coolant', 6, 12, 2000, io('lumimoss', 2, 'water_ice', 1), io('laser_coolant', 1), 'booster'),
      recipe('scoop_catalyst', 'Scoop Catalyst', 10, 16, 2000, io('glowcap', 2, 'helium', 1), io('scoop_catalyst', 1), 'booster'),
      recipe('salvage_analyser', 'Salvage Analyser', 15, 20, 2000, io('glowcap', 2, 'methane', 1), io('salvage_analyser', 1), 'booster'),
      recipe('thermal_flux', 'Thermal Flux', 20, 25, 2000, io('ironroot', 2, 'hydrogen', 2), io('thermal_flux', 1), 'booster'),
      recipe('fusion_pellet', 'Fusion Pellet', 25, 28, 2000, io('helium', 2, 'h_fuel_cell', 1), io('fusion_pellet', 1), 'fuel'),
      recipe('precision_nanites', 'Precision Nanites', 28, 32, 2000, io('ironroot', 2, 'methane', 2), io('precision_nanites', 1), 'booster'),
      recipe('cartographer_stim', "Cartographer's Stim", 35, 40, 2000, io('starbloom', 2, 'ammonia', 1), io('cartographer_stim', 1), 'booster'),
      recipe('growth_hormone', 'Growth Hormone', 40, 46, 2000, io('starbloom', 2, 'nutrient_gel', 1), io('growth_hormone', 1), 'booster'),
      recipe('reagent_stabiliser', 'Reagent Stabiliser', 45, 52, 2000, io('voidvine', 2, 'argon', 1), io('reagent_stabiliser', 1), 'booster'),
      recipe('engineers_focus', "Engineer's Focus", 50, 60, 2000, io('voidvine', 2, 'neon', 1), io('engineers_focus', 1), 'booster'),
      recipe('brokers_brew', "Broker's Brew", 55, 68, 2000, io('emberleaf', 2, 'xenon', 1), io('brokers_brew', 1), 'booster'),
      recipe('tritium_fuel', 'Tritium Fuel Rod', 62, 78, 2000, io('tritium', 2, 'fusion_pellet', 1), io('tritium_fuel', 1), 'fuel'),
      recipe('neural_accelerant', 'Neural Accelerant', 66, 85, 2000, io('cryo_lotus', 2, 'xenon', 2), io('neural_accelerant', 1), 'booster'),
      recipe('overclock_serum', 'Overclock Serum', 75, 100, 2000, io('psi_orchid', 2, 'helium3', 1), io('overclock_serum', 1), 'booster'),
      recipe('antimatter_pod', 'Antimatter Pod', 85, 125, 2000, io('exotic_matter', 1, 'tritium_fuel', 2), io('antimatter_pod', 1), 'fuel'),
      recipe('mastery_tonic', 'Mastery Tonic', 90, 150, 2000, io('nebula_kelp', 2, 'celestial_truffle', 1), io('mastery_tonic', 1), 'booster'),
    ],
  },

  engineering: {
    name: 'Engineering', group: 'production', handler: 'craft', color: '#ffb347', scene: 'shipyard', verb: 'Build',
    desc: 'Build ship modules from fabricated components, and eventually construct ships that cannot be bought. Fit modules to your ships in the Hangar.',
    perks: artisanPerks, perkText: ARTISAN_PERK_TEXT, pool: artisanPool('Engineering'),
    actions: [...MODULE_RECIPES, ...SHIP_RECIPES],
  },

  trading: {
    name: 'Trading', group: 'operations', handler: 'trade', ship: true, color: '#ffd700', scene: 'trade', verb: 'Run',
    desc: 'Haul your goods to stations that pay a premium. Each run sells a full hold of the commodity, up to your ship\'s tonnage, for far more than the market price.',
    perks: (ml) => ({ tradeProfit: ml * 0.2, tonnagePct: ml >= 99 ? 10 : 0 }),
    perkText: 'Each mastery level: +0.2% profit on that route. Level 99: +10% tonnage on that route.',
    pool: [
      { pct: 10, mods: { mxp: 5 }, text: '+5% Trading Mastery XP' },
      { pct: 25, mods: { interval: -5 }, text: '-5% trade run time' },
      { pct: 50, mods: { tradeProfit: 5 }, text: '+5% trade profit' },
      { pct: 95, mods: { tonnagePct: 25 }, text: '+25% tonnage' },
    ],
    actions: [
      route('ore_shuttle', 'Ore Shuttle', 1, 8, 'ferrite_ore', 2.0),
      route('ice_run', 'Ice Run', 5, 10, 'water_ice', 2.0),
      route('fuel_supply', 'Fuel Supply Contract', 8, 12, 'h_fuel_cell', 1.8),
      route('metals', 'Metals Contract', 12, 15, 'iron_ingot', 1.6),
      route('glassworks', 'Glassworks Supply', 18, 18, 'silica_glass', 1.6),
      route('wiring', 'Wiring Wholesale', 24, 22, 'copper_wiring', 1.7),
      route('agri', 'Agricultural Supply', 30, 26, 'glowcap', 1.8),
      route('construction', 'Construction Contract', 36, 32, 'steel_girder', 1.6, 7),
      route('electronics', 'Electronics Export', 42, 38, 'circuit_board', 1.7, 7),
      route('gems', 'Gemstone Brokerage', 50, 46, 'alexandrite', 1.6, 7),
      route('medical', 'Medical Supplies', 58, 55, 'starbloom', 1.8, 7),
      route('hightech', 'High-Tech Export', 66, 65, 'sensor_array', 1.7, 8),
      route('precious', 'Precious Metals', 74, 76, 'platinum_ingot', 1.7, 8),
      route('cartography', 'Cartographic Data Sale', 82, 90, 'stellar_data_4', 1.8, 8),
      route('exotic', 'Exotic Tech Run', 90, 110, 'quantum_processor', 1.8, 8),
    ],
  },

  research: {
    name: 'Research', group: 'operations', handler: 'craft', color: '#4ccbf2', scene: 'lab', verb: 'Study',
    desc: 'Analyse survey data, salvaged cores and alien artefacts to produce Research Points. Spend them in the Tech Lab on permanent upgrades.',
    perks: artisanPerks, perkText: ARTISAN_PERK_TEXT,
    pool: [
      { pct: 10, mods: { mxp: 5 }, text: '+5% Research Mastery XP' },
      { pct: 25, mods: { preserve: 5 }, text: '+5% preservation chance' },
      { pct: 50, mods: { double: 5 }, text: '+5% double Research Points chance' },
      { pct: 95, mods: { xp: 10 }, text: '+10% Research XP' },
    ],
    actions: [
      recipe('spectra', 'Stellar Spectra', 1, 10, 4000, io('stellar_data_1', 3), io('research_point', 1)),
      recipe('cores', 'Data Core Analysis', 10, 22, 4000, io('data_core', 1), io('research_point', 2)),
      recipe('planetary', 'Planetary Survey', 20, 32, 4000, io('stellar_data_2', 3), io('research_point', 2)),
      recipe('botany', 'Xenobotany', 30, 40, 4000, io('starbloom', 5), io('research_point', 2)),
      recipe('crypto', 'Cryptanalysis', 40, 55, 4000, io('encrypted_data', 1), io('research_point', 4)),
      recipe('gravimetrics', 'Gravimetrics', 50, 70, 4000, io('stellar_data_3', 3), io('research_point', 4)),
      recipe('biostructure', 'Biostructure Study', 60, 90, 4000, io('alien_biostructure', 1), io('research_point', 8)),
      recipe('remnants', 'Stellar Remnants', 70, 115, 4000, io('stellar_data_4', 3), io('research_point', 7)),
      recipe('precursor', 'Precursor Technology', 80, 150, 4000, io('ancient_relic', 1), io('research_point', 15)),
      recipe('signal', 'The Andromeda Signal', 90, 220, 4000, io('stellar_data_5', 3, 'precursor_core', 1), io('research_point', 40)),
    ],
  },

  piloting: {
    name: 'Piloting', group: 'operations', kind: 'passive', color: '#ff5277', scene: 'flight', verb: 'Fly',
    desc: 'Your skill at the stick. Piloting levels up passively: you earn 25% of the XP from every ship operation (Mining, Gas Harvesting, Salvaging, Exploration and Trading). Higher levels let you fly bigger ships and make every ship operation faster.',
    actions: [],
  },
};

export const SKILL_ORDER = Object.keys(SKILLS);

export const SKILL_GROUPS = [
  { id: 'gathering', name: 'Gathering' },
  { id: 'production', name: 'Production' },
  { id: 'operations', name: 'Operations' },
];

for (const [id, skill] of Object.entries(SKILLS)) {
  skill.id = id;
  skill.kind = skill.kind || 'action';
  skill.actionMap = {};
  for (const a of skill.actions) skill.actionMap[a.id] = a;
}

export const getAction = (skillId, actionId) => SKILLS[skillId]?.actionMap[actionId];

// Piloting: each level shaves 0.1% off every ship operation's interval.
export const PILOT_INTERVAL_PER_LEVEL = 0.1;
export const PILOT_XP_SHARE = 0.25;
