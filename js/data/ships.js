// Ships. The active ship's built-in bonuses and its fitted modules apply to
// every action. Ships need a Piloting level to fly.

export const FIXED_SLOTS = ['laser', 'harvester', 'salvage', 'scanner', 'fsd'];

export const SHIPS = {
  kestrel: {
    name: 'Kestrel Mk I', role: 'Starter Multirole', pilot: 1, price: 0, hull: 'light', color: '#ff7a00',
    tonnage: 8, cargoSlots: 0, slots: { cargo: 1, utility: 1 }, mods: {},
    desc: 'A dependable light ship handed to every new commander. Does a bit of everything, none of it brilliantly.',
  },
  prospector: {
    name: 'Prospector', role: 'Mining', pilot: 5, price: 15000, hull: 'miner', color: '#ff9a3c',
    tonnage: 12, cargoSlots: 2, slots: { cargo: 2, utility: 1 }, mods: { 'double.mining': 5, 'xp.mining': 5 },
    desc: 'Reinforced prospecting hull with an oversized hardpoint for belt work.',
  },
  wayfarer: {
    name: 'Wayfarer', role: 'Exploration', pilot: 10, price: 30000, hull: 'explorer', color: '#4ccbf2',
    tonnage: 6, cargoSlots: 0, slots: { cargo: 1, utility: 2 }, mods: { 'interval.exploration': -10, discovery: 10, 'xp.exploration': 5 },
    desc: 'Long-legged scout with a huge fuel tank and sensitive survey optics.',
  },
  mule: {
    name: 'Mule', role: 'Hauler', pilot: 15, price: 45000, hull: 'hauler', color: '#d9a877',
    tonnage: 32, cargoSlots: 8, slots: { cargo: 3, utility: 1 }, mods: { tradeProfit: 5, 'xp.trading': 5 },
    desc: 'Ugly, slow and beloved by traders. A flying cargo box.',
  },
  scavenger: {
    name: 'Scavenger', role: 'Salvage', pilot: 20, price: 70000, hull: 'salvager', color: '#7bd88f',
    tonnage: 16, cargoSlots: 4, slots: { cargo: 2, utility: 2 }, mods: { 'stealth.salvaging': 20, 'double.salvaging': 5, 'xp.salvaging': 5 },
    desc: 'Salvage tug with grapple arms and a quiet power plant for picking through wrecks.',
  },
  nimbus: {
    name: 'Nimbus Skimmer', role: 'Gas Harvesting', pilot: 25, price: 95000, hull: 'skimmer', color: '#ffd36b',
    tonnage: 16, cargoSlots: 4, slots: { cargo: 2, utility: 2 }, mods: { 'interval.gas': -10, 'double.gas': 5, 'xp.gas': 5 },
    desc: 'Heat-shielded skimmer built to dive through gas giant upper atmospheres.',
  },
  foundry: {
    name: 'Foundry', role: 'Industrial', pilot: 35, price: 300000, hull: 'industrial', color: '#ff5c3c',
    tonnage: 24, cargoSlots: 6, slots: { cargo: 2, utility: 3 },
    mods: { 'preserve.refining': 5, 'preserve.fabrication': 5, 'preserve.chemistry': 5, 'preserve.engineering': 5 },
    desc: 'A mobile factory with onboard smelters and clean rooms.',
  },
  atlas: {
    name: 'Atlas Heavy Hauler', role: 'Heavy Hauler', pilot: 45, price: 850000, hull: 'heavy', color: '#c9a16b',
    tonnage: 128, cargoSlots: 20, slots: { cargo: 4, utility: 2 }, mods: { tradeProfit: 10, 'interval.trading': -10, 'xp.trading': 5 },
    desc: 'Megafreighter with enough hold space to supply a small colony.',
  },
  horizon: {
    name: 'Horizon Deep Explorer', role: 'Deep Exploration', pilot: 55, price: 1750000, hull: 'explorer2', color: '#6fb0ff',
    tonnage: 12, cargoSlots: 4, slots: { cargo: 2, utility: 3 },
    mods: { 'interval.exploration': -15, discovery: 20, 'xp.exploration': 10, 'preserve.exploration': 15 },
    desc: 'Purpose-built for the deep black. Its scanners can hear a star cough from forty light years.',
  },
  behemoth: {
    name: 'Behemoth Mining Barge', role: 'Industrial Mining', pilot: 65, price: 3500000, hull: 'barge', color: '#ff7a00',
    tonnage: 48, cargoSlots: 10, slots: { cargo: 3, utility: 3 },
    mods: { 'interval.mining': -15, 'double.mining': 10, 'double.gas': 5, 'xp.mining': 10, 'xp.gas': 5 },
    desc: 'A mining platform with engines bolted on. Eats asteroids for breakfast.',
  },
  sovereign: {
    name: 'Sovereign', role: 'Elite Multirole', pilot: 75, craft: true, hull: 'capital', color: '#e6c35c',
    tonnage: 96, cargoSlots: 15, slots: { cargo: 3, utility: 4 },
    mods: { 'xp.mining': 5, 'xp.gas': 5, 'xp.salvaging': 5, 'xp.exploration': 5, 'xp.trading': 5, interval: -3 },
    desc: 'A luxurious multirole cruiser. Cannot be bought, only built by a master shipwright.',
  },
  andromeda: {
    name: 'Andromeda', role: 'Flagship', pilot: 90, craft: true, hull: 'flagship', color: '#ec7bff',
    tonnage: 256, cargoSlots: 40, slots: { cargo: 4, utility: 5 },
    mods: { xp: 5, mxp: 5, interval: -5, tradeProfit: 10 },
    desc: 'The first ship designed to cross the void to the Andromeda galaxy. Powered by exotic matter.',
  },
};

for (const [id, ship] of Object.entries(SHIPS)) ship.id = id;

export const SHIP_ORDER = Object.keys(SHIPS);

// All slot keys a ship exposes, in display order.
export function shipSlotKeys(ship) {
  const keys = [...FIXED_SLOTS];
  for (let i = 0; i < ship.slots.cargo; i++) keys.push(`cargo${i}`);
  for (let i = 0; i < ship.slots.utility; i++) keys.push(`util${i}`);
  return keys;
}

export const slotTypeOf = (key) => (key.startsWith('cargo') ? 'cargo' : key.startsWith('util') ? 'utility' : key);

// Engineering recipes for the ships that cannot be bought.
export const SHIP_RECIPES = [
  {
    id: 'ship_sovereign', ship: 'sovereign', name: 'Sovereign Hull', level: 75, xp: 30000, interval: 60000, category: 'ships',
    inputs: [
      { id: 'titanium_plating', qty: 40 }, { id: 'gravitic_stabiliser', qty: 10 }, { id: 'quantum_processor', qty: 15 },
      { id: 'superconductor', qty: 15 }, { id: 'military_alloy', qty: 20 },
    ],
  },
  {
    id: 'ship_andromeda', ship: 'andromeda', name: 'Andromeda Hull', level: 92, xp: 150000, interval: 120000, category: 'ships',
    inputs: [
      { id: 'neutronium_plate', qty: 40 }, { id: 'exotic_matter_core', qty: 15 }, { id: 'precursor_core', qty: 10 },
      { id: 'gravitic_stabiliser', qty: 25 }, { id: 'quantum_processor', qty: 30 },
    ],
  },
];
