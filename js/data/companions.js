// Companions are rare finds, like pets. Each skill has one; the chance
// per action scales with the action's length and your skill level.

export const COMPANIONS = [
  { id: 'grit', name: 'Grit', species: 'Rock Mite', skill: 'mining', mods: { 'double.mining': 3 }, color: '#ff9a3c', bonus: '+3% double ore chance', desc: 'A tiny silicon-based critter that hitched a ride on a chunk of ferrite. Purrs when you fire the laser.' },
  { id: 'puff', name: 'Puff', species: 'Gasbag Drifter', skill: 'gas', mods: { 'double.gas': 3 }, color: '#ffd36b', bonus: '+3% double gas chance', desc: 'A floating jellyfish-like creature that drifted into your scoop and decided to stay.' },
  { id: 'whiskers', name: 'Whiskers', species: "Ship's Cat", skill: 'salvaging', mods: { 'stealth.salvaging': 10 }, color: '#7bd88f', bonus: '+10 Finesse', desc: 'Found asleep in a derelict cargo bay. Has opinions about your piloting.' },
  { id: 'nova', name: 'Nova', species: 'Lumen Fox', skill: 'exploration', mods: { discovery: 5 }, color: '#4ccbf2', bonus: '+5% discovery chance', desc: 'A shimmering creature of light that follows your ship from system to system.' },
  { id: 'sprout', name: 'Sprout', species: 'Spore Sprite', skill: 'xenobiology', mods: { farmYield: 5 }, color: '#9dff9d', bonus: '+5% harvest yield', desc: 'A sentient puff of spores that sings to the crops. They seem to like it.' },
  { id: 'ember', name: 'Ember', species: 'Furnace Salamander', skill: 'refining', mods: { 'preserve.refining': 3 }, color: '#ff7a45', bonus: '+3% Refining preservation', desc: 'Lives in the smelter. Do not let it near the fuel tanks.' },
  { id: 'bolt', name: 'Bolt', species: 'Fab Drone', skill: 'fabrication', mods: { 'preserve.fabrication': 3 }, color: '#bfe8ff', bonus: '+3% Fabrication preservation', desc: 'A self-assembled drone made of leftover parts. Hums while it works.' },
  { id: 'fizz', name: 'Fizz', species: 'Gel Slime', skill: 'chemistry', mods: { 'preserve.chemistry': 3 }, color: '#c7b8ff', bonus: '+3% Chemistry preservation', desc: 'An escaped batch of Nutrient Gel that became self-aware. Mostly harmless.' },
  { id: 'wrench', name: 'Wrench', species: 'Maintenance Bot', skill: 'engineering', mods: { 'preserve.engineering': 3 }, color: '#ffb347', bonus: '+3% Engineering preservation', desc: 'An ancient maintenance unit that insists on tightening every bolt twice.' },
  { id: 'jangles', name: 'Jangles', species: 'Market Parrot', skill: 'trading', mods: { tradeProfit: 3 }, color: '#ffd700', bonus: '+3% trade profit', desc: 'Repeats commodity prices from every station it hears. Surprisingly accurate.' },
  { id: 'byte', name: 'Byte', species: 'Holo-Owl', skill: 'research', mods: { 'xp.research': 3 }, color: '#4ccbf2', bonus: '+3% Research XP', desc: 'A holographic owl that escaped from a university archive. Very wise. Very smug.' },
  { id: 'ace', name: 'Ace', species: 'Space Hamster', skill: 'piloting', mods: { interval: -1 }, color: '#ff5277', bonus: '-1% interval on everything', desc: 'Rides in the cockpit in a tiny gimballed ball. Found during any ship operation.' },
];

export const COMPANION_BY_SKILL = Object.fromEntries(COMPANIONS.map((c) => [c.skill, c]));
export const COMPANION_MAP = Object.fromEntries(COMPANIONS.map((c) => [c.id, c]));
