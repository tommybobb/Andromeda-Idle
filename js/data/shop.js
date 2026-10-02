// Station Market stock. Ships are sold in the Hangar; cargo expansions and
// hydroponics bays are upgrades with escalating prices.

export const SHOP_SECTIONS = [
  {
    id: 'supplies', name: 'Supplies',
    items: [
      { item: 'lumimoss_spores', price: 5 },
      { item: 'glowcap_spores', price: 15 },
      { item: 'ironroot_seeds', price: 40, req: { skill: 'xenobiology', level: 15 } },
      { item: 'starbloom_seeds', price: 90, req: { skill: 'xenobiology', level: 25 } },
      { item: 'nutrient_gel', price: 40 },
      { item: 'h_fuel_cell', price: 20 },
      { item: 'fusion_pellet', price: 110, req: { skill: 'exploration', level: 40 } },
    ],
  },
  {
    id: 'modules', name: 'Ship Modules',
    items: [
      { item: 'mod_laser_e', price: 600 },
      { item: 'mod_harvester_e', price: 600 },
      { item: 'mod_salvager_e', price: 900 },
      { item: 'mod_scanner_e', price: 900 },
      { item: 'mod_fsd_e', price: 1200 },
      { item: 'mod_cargo_e', price: 800 },
      { item: 'mod_laser_d', price: 12000, req: { skill: 'piloting', level: 15 } },
      { item: 'mod_harvester_d', price: 12000, req: { skill: 'piloting', level: 15 } },
      { item: 'mod_salvager_d', price: 15000, req: { skill: 'piloting', level: 20 } },
      { item: 'mod_scanner_d', price: 15000, req: { skill: 'piloting', level: 20 } },
      { item: 'mod_fsd_d', price: 18000, req: { skill: 'piloting', level: 25 } },
      { item: 'mod_cargo_d', price: 14000, req: { skill: 'piloting', level: 15 } },
    ],
  },
];

export const CARGO_BASE_SLOTS = 24;
export const CARGO_SLOTS_PER_EXPANSION = 2;
export const CARGO_MAX_EXPANSIONS = 120;

export function cargoExpansionCost(bought) {
  return Math.round(Math.min(5000000, 400 * Math.pow(1.13, bought)));
}
