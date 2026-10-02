// Item database. Every item in the game is defined here; skills, the market,
// loot tables and ship loadouts all reference these ids.

export const CATEGORIES = {
  ore: { name: 'Ores', order: 1 },
  gem: { name: 'Gemstones', order: 2 },
  gas: { name: 'Gases', order: 3 },
  salvage: { name: 'Salvage', order: 4 },
  container: { name: 'Containers', order: 5 },
  seed: { name: 'Seeds & Spores', order: 6 },
  crop: { name: 'Xenoflora', order: 7 },
  refined: { name: 'Refined Materials', order: 8 },
  component: { name: 'Components', order: 9 },
  fuel: { name: 'Fuel', order: 10 },
  supply: { name: 'Supplies', order: 11 },
  booster: { name: 'Boosters', order: 12 },
  data: { name: 'Exploration Data', order: 13 },
  research: { name: 'Research', order: 14 },
  module: { name: 'Ship Modules', order: 15 },
};

export const ITEMS = {};

function def(cat, shape, rows) {
  for (const [id, name, sell, color, desc, extra] of rows) {
    ITEMS[id] = { id, name, cat, sell, color, desc, shape, ...(extra || {}) };
  }
}

def('ore', 'rock', [
  ['ferrite_ore', 'Ferrite Ore', 2, '#8d939e', 'Iron-rich rock chipped from common belt asteroids. Refines into iron.'],
  ['silicate_ore', 'Silicate Ore', 2, '#cfc6a6', 'Glassy silicate rubble. The raw stuff of every viewport in the galaxy.'],
  ['water_ice', 'Water Ice', 3, '#a7dcff', 'Frozen water from icy asteroids. Life support and chemistry depend on it.'],
  ['cuprite_ore', 'Cuprite Ore', 5, '#d0703f', 'Red copper oxide. Conductive once refined.'],
  ['bauxite_ore', 'Bauxite', 8, '#c98f5c', 'Aluminium-bearing ore. Light hulls start here.'],
  ['carbon_ore', 'Carbonaceous Rock', 10, '#55555f', 'Carbon-rich chondrite. Every good alloy needs a little of it.'],
  ['rutile_ore', 'Rutile Ore', 15, '#c3c7d6', 'Titanium dioxide crystals pulled from deep belt rock.'],
  ['cobaltite_ore', 'Cobaltite', 25, '#4c74d8', 'A blue-sheened cobalt ore prized for magnetic coils.'],
  ['platinum_ore', 'Platinum Ore', 40, '#e3e9f0', 'Metallic asteroid core material. Valuable and heavy.'],
  ['iridium_ore', 'Iridium Ore', 60, '#a7d1c8', 'Extremely dense ore found in ancient impact debris.'],
  ['osmium_ore', 'Osmium Ore', 90, '#7096c0', 'The densest naturally occurring metal, sought by shipwrights.'],
  ['neutronium_shard', 'Neutronium Shard', 150, '#c590ff', 'A fragment of degenerate matter from a collapsed star. Handle with tongs.'],
]);

def('gem', 'gem', [
  ['alexandrite', 'Alexandrite', 60, '#3fbf8f', 'Colour-shifting gem, green in starlight and red under station lamps.'],
  ['benitoite', 'Benitoite', 100, '#3d7dff', 'Fluorescent blue crystal used in quantum circuitry.'],
  ['musgravite', 'Musgravite', 160, '#a9b3c2', 'A rare grey-violet gem with perfect optical clarity.'],
  ['grandidierite', 'Grandidierite', 250, '#46d6c8', 'Blue-green gem prized for laser focusing arrays.'],
  ['void_opal', 'Void Opal', 450, '#a85cff', 'Opalescent gem that seems to hold a tiny galaxy inside.'],
  ['painite', 'Painite', 900, '#ff3d63', 'The rarest gem in charted space. Collectors pay anything.'],
]);

def('gas', 'canister', [
  ['hydrogen', 'Hydrogen', 1, '#ff7a8f', 'The most abundant element in the universe. Ships run on it.'],
  ['helium', 'Helium', 3, '#ffd36b', 'Inert lifting and cooling gas.'],
  ['methane', 'Methane', 5, '#7bd88f', 'Reactive hydrocarbon gas skimmed from cool giants.'],
  ['ammonia', 'Ammonia', 8, '#c7b8ff', 'Industrial coolant and chemical feedstock.'],
  ['argon', 'Argon', 12, '#9d7dff', 'Noble gas used as a shielding atmosphere in fabrication.'],
  ['neon', 'Neon', 18, '#ff5277', 'Glows beautifully. Also handy in precision chemistry.'],
  ['xenon', 'Xenon', 26, '#63a9ff', 'Heavy noble gas and premium ion-thruster propellant.'],
  ['tritium', 'Tritium', 38, '#38e0a0', 'Radioactive hydrogen isotope. The fuel of long-range carriers.'],
  ['helium3', 'Helium-3', 55, '#ffe9a0', 'Clean fusion fuel harvested from deep giant atmospheres.'],
  ['exotic_matter', 'Exotic Matter', 90, '#ec7bff', 'Matter with negative energy density. Nobody fully understands it.'],
]);

def('salvage', 'scrap', [
  ['scrap_metal', 'Scrap Metal', 2, '#9c8f7e', 'Twisted hull fragments. Can be recycled into iron at a refinery.'],
  ['personal_effects', 'Personal Effects', 15, '#d9a877', 'Trinkets and keepsakes from a lost crew. Sells to collectors.', { shape: 'box' }],
  ['damaged_circuit', 'Damaged Circuitry', 8, '#7fb069', 'Burnt-out boards. A good fabricator can refurbish them.', { shape: 'chip' }],
  ['data_core', 'Data Core', 30, '#4ccbf2', 'A recovered ship computer core. Researchers love these.', { shape: 'chip' }],
  ['encrypted_data', 'Encrypted Data', 60, '#56e3ff', 'Locked archives from abandoned installations.', { shape: 'disc' }],
  ['occupied_pod', 'Occupied Escape Pod', 120, '#ffb347', 'Someone is still in here. Rescue authorities pay well.', { shape: 'pod' }],
  ['military_alloy', 'Military Grade Alloy', 200, '#8fa3b3', 'Armour-grade composite plating stripped from old warships.', { shape: 'plate' }],
  ['alien_biostructure', 'Alien Biostructure', 350, '#39d98a', 'Organic hull tissue of unknown origin. Still faintly warm.', { shape: 'organic' }],
  ['ancient_relic', 'Ancient Relic', 700, '#e6c35c', 'An artefact from a civilisation that vanished millions of years ago.', { shape: 'relic' }],
  ['precursor_core', 'Precursor Core', 1500, '#ff9e3d', 'A humming power core of precursor design. Priceless to engineers.', { shape: 'core' }],
]);

def('container', 'crate', [
  ['spore_cluster', 'Spore Cluster', 5, '#9dff9d', 'A clump of drifting spores caught in a gas scoop. Open it to sort the seeds.', {
    open: [
      ['lumimoss_spores', 40, 2, 6], ['glowcap_spores', 25, 2, 5], ['ironroot_seeds', 15, 1, 4], ['starbloom_seeds', 9, 1, 3],
      ['voidvine_seeds', 5, 1, 2], ['emberleaf_seeds', 3, 1, 2], ['cryo_lotus_seeds', 1.5, 1, 1], ['psi_orchid_seeds', 1, 1, 1],
      ['nebula_kelp_spores', 0.35, 1, 1], ['truffle_spores', 0.15, 1, 1],
    ],
  }],
  ['sealed_container', 'Sealed Cargo Container', 25, '#ffb347', 'A locked cargo canister. Could be anything inside.', {
    open: [
      ['scrap_metal', 25, 5, 15], ['iron_ingot', 15, 3, 8], ['copper_ingot', 12, 2, 6], ['personal_effects', 10, 1, 3],
      ['h_fuel_cell', 10, 3, 10], ['data_core', 8, 1, 2], ['circuit_board', 6, 1, 3], ['alexandrite', 4, 1, 1],
      ['occupied_pod', 2, 1, 1], ['benitoite', 1.5, 1, 1], ['encrypted_data', 3, 1, 1], ['steel_ingot', 6, 2, 5],
    ],
  }],
]);

def('seed', 'seed', [
  ['lumimoss_spores', 'Luminous Moss Spores', 1, '#9dff9d', 'Plant 3 in a hydroponics bay to grow Luminous Moss.'],
  ['glowcap_spores', 'Glowcap Spores', 3, '#ffb3e6', 'Plant 3 in a hydroponics bay to grow Glowcaps.'],
  ['ironroot_seeds', 'Iron Root Seeds', 6, '#b07b4f', 'Plant 3 in a hydroponics bay to grow Iron Root.'],
  ['starbloom_seeds', 'Starbloom Seeds', 12, '#fff38a', 'Plant 2 in a hydroponics bay to grow Starblooms.'],
  ['voidvine_seeds', 'Void Vine Cuttings', 20, '#7a5cff', 'Plant 2 in a hydroponics bay to grow Void Vine.'],
  ['emberleaf_seeds', 'Ember Leaf Seeds', 35, '#ff7b3d', 'Plant 2 in a hydroponics bay to grow Ember Leaf.'],
  ['cryo_lotus_seeds', 'Cryo Lotus Seeds', 60, '#9feaff', 'Plant 1 in a hydroponics bay to grow a Cryo Lotus.'],
  ['psi_orchid_seeds', 'Psionic Orchid Bulb', 90, '#e48bff', 'Plant 1 in a hydroponics bay to grow a Psionic Orchid.'],
  ['nebula_kelp_spores', 'Nebula Kelp Spores', 140, '#4fd1c5', 'Plant 1 in a hydroponics bay to grow Nebula Kelp.'],
  ['truffle_spores', 'Celestial Truffle Spores', 220, '#ffd700', 'Plant 1 in a hydroponics bay to grow Celestial Truffles.'],
]);

def('crop', 'leaf', [
  ['lumimoss', 'Luminous Moss', 3, '#9dff9d', 'A soft, glowing moss. Base ingredient for gels and coolants.'],
  ['glowcap', 'Glowcap', 6, '#ffb3e6', 'Bioluminescent fungus with useful catalytic properties.'],
  ['ironroot', 'Iron Root', 10, '#b07b4f', 'A tough tuber that leaches metals from its substrate.'],
  ['starbloom', 'Starbloom', 18, '#fff38a', 'Blossoms only under starlight. Prized by chemists.'],
  ['voidvine', 'Void Vine', 28, '#7a5cff', 'A creeping vine that thrives in vacuum-adjacent bays.'],
  ['emberleaf', 'Ember Leaf', 40, '#ff7b3d', 'Warm to the touch. Its sap is a powerful stimulant.'],
  ['cryo_lotus', 'Cryo Lotus', 60, '#9feaff', 'A frozen flower that blooms near absolute zero.'],
  ['psi_orchid', 'Psionic Orchid', 85, '#e48bff', 'Its scent is said to sharpen the mind.'],
  ['nebula_kelp', 'Nebula Kelp', 120, '#4fd1c5', 'Floating kelp that feeds on interstellar dust.'],
  ['celestial_truffle', 'Celestial Truffle', 180, '#ffd700', 'The most valuable crop in the galaxy. Smells faintly of ozone.'],
]);

def('refined', 'ingot', [
  ['iron_ingot', 'Iron Ingot', 6, '#a8adb6', 'Refined iron. The workhorse metal of every station.'],
  ['silica_glass', 'Silica Glass', 6, '#bfe8ff', 'Clear structural glass for lenses and viewports.', { shape: 'pane' }],
  ['copper_ingot', 'Copper Ingot', 14, '#e07a46', 'Highly conductive refined copper.'],
  ['aluminium_ingot', 'Aluminium Ingot', 22, '#d6dde6', 'Lightweight aluminium for frames and heat sinks.'],
  ['steel_ingot', 'Steel Ingot', 45, '#8f9aa8', 'Iron alloyed with carbon. Strong and dependable.'],
  ['titanium_ingot', 'Titanium Ingot', 65, '#c9ccd8', 'Light, strong and corrosion resistant.'],
  ['cobalt_ingot', 'Cobalt Ingot', 110, '#5a83e8', 'Magnetic cobalt alloy for coils and drives.'],
  ['platinum_ingot', 'Platinum Ingot', 130, '#eef3f8', 'Catalytic and conductive. Essential in plasma systems.'],
  ['iridium_ingot', 'Iridium Ingot', 220, '#b5ded5', 'Incredibly hard alloy used in processor fabrication.'],
  ['osmium_ingot', 'Osmium Ingot', 320, '#7fa6d0', 'Ultra-dense alloy for gravitic components.'],
  ['neutronium_plate', 'Neutronium Plate', 1500, '#cf9dff', 'Stabilised degenerate matter pressed into plating.', { shape: 'plate' }],
]);

def('component', 'chip', [
  ['hull_plate', 'Hull Plate', 16, '#a8adb6', 'Basic riveted iron hull plating.', { shape: 'plate' }],
  ['optical_lens', 'Optical Lens', 16, '#bfe8ff', 'Precision-ground glass lens.', { shape: 'lens' }],
  ['copper_wiring', 'Copper Wiring', 9, '#e07a46', 'Spools of insulated copper wire.', { shape: 'coil' }],
  ['circuit_board', 'Circuit Board', 35, '#5fd68a', 'Printed control circuitry.'],
  ['alloy_frame', 'Alloy Frame', 80, '#d6dde6', 'Lightweight aluminium module frame.', { shape: 'frame' }],
  ['heat_sink', 'Heat Sink', 70, '#ff9a5c', 'Finned thermal dissipator.', { shape: 'fins' }],
  ['steel_girder', 'Steel Girder', 160, '#8f9aa8', 'Structural steel beam.', { shape: 'girder' }],
  ['power_coupling', 'Power Coupling', 80, '#ffd36b', 'Conduit junction for distributing ship power.', { shape: 'plug' }],
  ['focusing_crystal', 'Focusing Crystal', 100, '#3fbf8f', 'Gem-cored lens for concentrating laser light.', { shape: 'crystal' }],
  ['titanium_plating', 'Titanium Plating', 230, '#c9ccd8', 'Lightweight armoured plating.', { shape: 'plate' }],
  ['sensor_array', 'Sensor Array', 110, '#4ccbf2', 'Multi-spectrum sensor package.', { shape: 'dish' }],
  ['cobalt_coil', 'Cobalt Coil', 270, '#5a83e8', 'High-field magnetic coil.', { shape: 'coil' }],
  ['plasma_conduit', 'Plasma Conduit', 380, '#ff7ad9', 'Platinum-lined conduit for superheated plasma.', { shape: 'tube' }],
  ['superconductor', 'Superconductor Coil', 520, '#9fe7ff', 'Ammonia-chilled coil with zero electrical resistance.', { shape: 'coil' }],
  ['quantum_processor', 'Quantum Processor', 500, '#3d7dff', 'Benitoite-lattice qubit processor.'],
  ['gravitic_stabiliser', 'Gravitic Stabiliser', 1100, '#7fa6d0', 'Dampens gravitational shear in frame shift drives.', { shape: 'core' }],
  ['exotic_matter_core', 'Exotic Matter Core', 3000, '#ec7bff', 'Contained exotic matter. The heart of an Andromeda-class drive.', { shape: 'core' }],
]);

def('fuel', 'cell', [
  ['h_fuel_cell', 'Hydrogen Fuel Cell', 4, '#ff7a8f', 'Standard jump fuel for short-range exploration.'],
  ['fusion_pellet', 'Fusion Pellet', 18, '#ffd36b', 'Compressed helium fusion fuel for mid-range jumps.'],
  ['tritium_fuel', 'Tritium Fuel Rod', 120, '#38e0a0', 'Long-range fuel rod for deep-core expeditions.'],
  ['antimatter_pod', 'Antimatter Pod', 600, '#ec7bff', 'Contained antimatter. The only fuel that reaches Andromeda.'],
]);

def('supply', 'vial', [
  ['nutrient_gel', 'Nutrient Gel', 10, '#9dff9d', 'Apply to a growing crop for +10% chance it survives to harvest (up to 5 per crop).'],
]);

def('data', 'disc', [
  ['stellar_data_1', 'Stellar Survey Data I', 4, '#9fd3ff', 'Basic stellar spectra from nearby systems.'],
  ['stellar_data_2', 'Stellar Survey Data II', 12, '#7fc3ff', 'Survey data from the spiral arms.'],
  ['stellar_data_3', 'Stellar Survey Data III', 30, '#6fb0ff', 'Detailed scans from nebulae and stellar nurseries.'],
  ['stellar_data_4', 'Stellar Survey Data IV', 70, '#8f9bff', 'Readings from the dense stars of the galactic core.'],
  ['stellar_data_5', 'Stellar Survey Data V', 160, '#c08bff', 'Telemetry from the void between galaxies.'],
  ['survey_ww', 'Water World Survey', 800, '#4fa3ff', 'Full survey of an ocean world. Cartographers pay handsomely.'],
  ['survey_aw', 'Ammonia World Survey', 1200, '#c7b8ff', 'Survey of an ammonia world with exotic chemistry.'],
  ['survey_ns', 'Neutron Star Survey', 600, '#9fe7ff', 'Close-pass readings of a neutron star.'],
  ['survey_bh', 'Black Hole Survey', 2500, '#d9c2ff', 'Event horizon telemetry. Worth a small fortune.'],
  ['survey_elw', 'Earth-like World Survey', 5000, '#5fd68a', 'A living world with breathable air. The rarest find of all.'],
]);

def('research', 'atom', [
  ['research_point', 'Research Point', 0, '#4ccbf2', 'Processed scientific insight. Spend it in the Tech Lab.'],
]);

// ---------------------------------------------------------------------------
// Boosters (Chemistry). Activate one per skill, plus one global slot. Each
// item provides a number of charges; one charge is spent per action.
// ---------------------------------------------------------------------------
export const BOOSTER_CHARGES = 25;

const BOOSTERS = [
  ['laser_coolant', 'Laser Coolant', 'mining', { 'double.mining': 15 }, 30, '#7fd6ff', '+15% chance to double ore while Mining.'],
  ['scoop_catalyst', 'Scoop Catalyst', 'gas', { 'double.gas': 15 }, 45, '#ffd36b', '+15% chance to double gas while Gas Harvesting.'],
  ['salvage_analyser', 'Salvage Analyser', 'salvaging', { 'stealth.salvaging': 25 }, 55, '#7bd88f', '+25 Finesse while Salvaging.'],
  ['thermal_flux', 'Thermal Flux', 'refining', { 'preserve.refining': 15 }, 60, '#ff9a5c', '+15% chance to preserve materials while Refining.'],
  ['precision_nanites', 'Precision Nanites', 'fabrication', { 'preserve.fabrication': 15 }, 75, '#bfe8ff', '+15% chance to preserve materials while Fabricating.'],
  ['cartographer_stim', "Cartographer's Stim", 'exploration', { 'double.exploration': 15, discovery: 10 }, 90, '#9fd3ff', '+15% chance to double survey data and +10% discovery chance while Exploring.'],
  ['growth_hormone', 'Growth Hormone', 'xenobiology', { farmYield: 25 }, 100, '#9dff9d', '+25% harvest yield in Xenobiology (one charge per harvest).'],
  ['reagent_stabiliser', 'Reagent Stabiliser', 'chemistry', { 'preserve.chemistry': 15 }, 110, '#c7b8ff', '+15% chance to preserve reagents while doing Chemistry.'],
  ['engineers_focus', "Engineer's Focus", 'engineering', { 'preserve.engineering': 15 }, 140, '#ffb347', '+15% chance to preserve components while Engineering.'],
  ['brokers_brew', "Broker's Brew", 'trading', { tradeProfit: 10 }, 160, '#ffd700', '+10% trade profit while Trading.'],
  ['neural_accelerant', 'Neural Accelerant', 'research', { 'xp.research': 15 }, 200, '#4ccbf2', '+15% Research XP.'],
  ['overclock_serum', 'Overclock Serum', 'global', { xp: 5 }, 300, '#ff5277', '+5% XP in every skill. Uses the global booster slot.'],
  ['mastery_tonic', 'Mastery Tonic', 'global', { mxp: 10 }, 420, '#ec7bff', '+10% Mastery XP in every skill. Uses the global booster slot.'],
];

for (const [id, name, skill, mods, sell, color, effect] of BOOSTERS) {
  ITEMS[id] = {
    id, name, cat: 'booster', sell, color, shape: 'vial',
    desc: `${effect} ${BOOSTER_CHARGES} charges per dose.`,
    booster: { skill, mods, charges: BOOSTER_CHARGES },
  };
}

// ---------------------------------------------------------------------------
// Ship modules. Grades E to A, crafted with Engineering, some sold at the market.
// ---------------------------------------------------------------------------
export const SLOT_TYPES = {
  laser: { name: 'Mining Laser', short: 'Laser' },
  harvester: { name: 'Gas Harvester', short: 'Harvester' },
  salvage: { name: 'Salvage Limpets', short: 'Salvage' },
  scanner: { name: 'Survey Scanner', short: 'Scanner' },
  fsd: { name: 'Frame Shift Drive', short: 'FSD' },
  cargo: { name: 'Cargo Rack', short: 'Cargo' },
  utility: { name: 'Utility', short: 'Utility' },
};

export const GRADES = ['E', 'D', 'C', 'B', 'A'];

const GRADE_MATS = [
  [['hull_plate', 4], ['optical_lens', 2]],
  [['alloy_frame', 2], ['circuit_board', 2], ['heat_sink', 1]],
  [['steel_girder', 2], ['power_coupling', 2], ['focusing_crystal', 1]],
  [['titanium_plating', 2], ['sensor_array', 2], ['plasma_conduit', 1]],
  [['quantum_processor', 2], ['superconductor', 2], ['gravitic_stabiliser', 1]],
];
const GRADE_XP = [20, 70, 160, 320, 600];
const GRADE_INTERVAL = [4000, 4500, 5000, 5500, 6000];

const MODULE_LINES = [
  {
    id: 'laser', slot: 'laser', name: 'Mining Laser', color: '#ff7a00', levels: [1, 20, 40, 60, 80],
    mods: (g) => ({ 'interval.mining': -(5 + 5 * g), 'double.mining': 3 * g }),
    sig: [['optical_lens', 2], ['optical_lens', 4], ['focusing_crystal', 2], ['focusing_crystal', 4], ['grandidierite', 2]],
  },
  {
    id: 'harvester', slot: 'harvester', name: 'Gas Harvester', color: '#ffd36b', levels: [3, 23, 43, 63, 83],
    mods: (g) => ({ 'interval.gas': -(5 + 5 * g), 'double.gas': 3 * g }),
    sig: [['iron_ingot', 6], ['heat_sink', 2], ['heat_sink', 4], ['plasma_conduit', 2], ['helium3', 20]],
  },
  {
    id: 'salvager', slot: 'salvage', name: 'Salvage Limpets', color: '#7bd88f', levels: [6, 26, 46, 66, 86],
    mods: (g) => ({ 'stealth.salvaging': 10 + 10 * g, 'double.salvaging': 3 * g }),
    sig: [['iron_ingot', 6], ['copper_wiring', 6], ['power_coupling', 3], ['cobalt_coil', 2], ['military_alloy', 3]],
  },
  {
    id: 'scanner', slot: 'scanner', name: 'Survey Scanner', color: '#4ccbf2', levels: [9, 29, 49, 69, 89],
    mods: (g) => ({ 'interval.exploration': -(5 + 5 * g), discovery: 5 * g }),
    sig: [['optical_lens', 2], ['circuit_board', 3], ['sensor_array', 2], ['musgravite', 2], ['quantum_processor', 1]],
  },
  {
    id: 'fsd', slot: 'fsd', name: 'Frame Shift Drive', color: '#c08bff', levels: [12, 32, 52, 72, 92],
    mods: (g) => ({ 'interval.trading': -(5 + 5 * g), 'interval.exploration': -(2 + 2 * g) }),
    sig: [['copper_wiring', 4], ['heat_sink', 2], ['power_coupling', 3], ['plasma_conduit', 2], ['exotic_matter', 4]],
  },
  {
    id: 'cargo', slot: 'cargo', name: 'Cargo Rack', color: '#d9a877', levels: [2, 22, 42, 62, 82],
    mods: (g) => ({ cargoSlots: 2 + 2 * g, tonnage: 4 * 2 ** g }),
    sig: [['hull_plate', 4], ['alloy_frame', 2], ['steel_girder', 3], ['titanium_plating', 3], ['neutronium_plate', 1]],
  },
];

const UTIL_GRADES = [1, 3, 4]; // D, B, A
const UTIL_LEVELS = [30, 60, 85];
const UTIL_MATS = [
  [['circuit_board', 3], ['heat_sink', 2], ['alloy_frame', 2]],
  [['sensor_array', 2], ['plasma_conduit', 2], ['titanium_plating', 2]],
  [['quantum_processor', 2], ['superconductor', 2], ['gravitic_stabiliser', 1]],
];
const UTIL_XP = [90, 350, 650];

const UTILITY_LINES = [
  { id: 'refinery', name: 'Refinery Unit', color: '#ff9a5c', mods: (t) => ({ 'preserve.refining': 5 * (t + 1) }) },
  { id: 'fabricator', name: 'Fabricator Bay', color: '#bfe8ff', mods: (t) => ({ 'preserve.fabrication': 5 * (t + 1) }) },
  { id: 'chemlab', name: 'Chemistry Lab', color: '#c7b8ff', mods: (t) => ({ 'preserve.chemistry': 5 * (t + 1) }) },
  { id: 'hydroponics', name: 'Hydroponics Module', color: '#9dff9d', mods: (t) => ({ farmYield: 10 * (t + 1) }) },
  { id: 'workshop', name: 'Engineering Workshop', color: '#ffb347', mods: (t) => ({ 'preserve.engineering': 5 * (t + 1) }) },
  { id: 'tradecomp', name: 'Trade Computer', color: '#ffd700', mods: (t) => ({ tradeProfit: 4 * (t + 1) }) },
  { id: 'labmodule', name: 'Research Lab', color: '#4ccbf2', mods: (t) => ({ 'xp.research': 5 * (t + 1) }) },
  { id: 'copilot', name: 'AI Co-Pilot', color: '#ff5277', mods: (t) => ({ xp: 2 * (t + 1) }) },
];

// Combines repeated materials (a grade's base kit and a line's signature part can overlap).
function mergeMats(mats) {
  const out = new Map();
  for (const [id, qty] of mats) out.set(id, (out.get(id) || 0) + qty);
  return [...out.entries()];
}

const sellOf = (mats) => Math.round(mats.reduce((s, [id, q]) => s + (ITEMS[id]?.sell || 0) * q, 0) * 1.1);

// Engineering recipes are generated alongside the module items.
export const MODULE_RECIPES = [];

for (const line of MODULE_LINES) {
  GRADES.forEach((grade, g) => {
    const id = `mod_${line.id}_${grade.toLowerCase()}`;
    const mats = mergeMats([...GRADE_MATS[g], line.sig[g]]);
    const inputs = mats.map(([iid, qty]) => ({ id: iid, qty }));
    ITEMS[id] = {
      id, name: `${line.name} ${grade}`, cat: 'module', shape: 'module', color: line.color, grade,
      sell: sellOf(mats),
      desc: `Grade ${grade} ${SLOT_TYPES[line.slot].name.toLowerCase()} module.`,
      module: { slot: line.slot, mods: line.mods(g), grade },
    };
    MODULE_RECIPES.push({
      id, name: ITEMS[id].name, level: line.levels[g], xp: GRADE_XP[g], interval: GRADE_INTERVAL[g],
      inputs, outputs: [{ id, qty: 1 }], category: line.slot,
    });
  });
}

UTILITY_LINES.forEach((line, i) => {
  UTIL_GRADES.forEach((g, t) => {
    const grade = GRADES[g];
    const id = `util_${line.id}_${grade.toLowerCase()}`;
    ITEMS[id] = {
      id, name: `${line.name} ${grade}`, cat: 'module', shape: 'module', color: line.color, grade,
      sell: sellOf(UTIL_MATS[t]),
      desc: `Grade ${grade} utility module. Fits any utility slot.`,
      module: { slot: 'utility', mods: line.mods(t), grade, line: line.id },
    };
    MODULE_RECIPES.push({
      id, name: ITEMS[id].name, level: UTIL_LEVELS[t] + i, xp: UTIL_XP[t], interval: 6000,
      inputs: UTIL_MATS[t].map(([iid, qty]) => ({ id: iid, qty })), outputs: [{ id, qty: 1 }], category: 'utility',
    });
  });
});

export const itemList = () => Object.values(ITEMS);
