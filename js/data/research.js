// Tech Lab: permanent upgrades bought with Research Points and credits.
// Each tech has 5 ranks; its modifiers stack once per rank.

const tech = (id, name, level, mods, desc) => ({ id, name, level, mods, desc, max: 5 });

export const TECHS = [
  tech('prospecting', 'Advanced Prospecting', 1, { 'xp.mining': 3 }, '+3% Mining XP per rank.'),
  tech('gas_dynamics', 'Gas Dynamics', 5, { 'xp.gas': 3 }, '+3% Gas Harvesting XP per rank.'),
  tech('salvage_protocols', 'Salvage Protocols', 10, { 'xp.salvaging': 3 }, '+3% Salvaging XP per rank.'),
  tech('astrocartography', 'Astrocartography', 15, { 'xp.exploration': 3 }, '+3% Exploration XP per rank.'),
  tech('metallurgy', 'Metallurgy', 20, { 'xp.refining': 3 }, '+3% Refining XP per rank.'),
  tech('nanofabrication', 'Nanofabrication', 25, { 'xp.fabrication': 3 }, '+3% Fabrication XP per rank.'),
  tech('biochemistry', 'Biochemistry', 30, { 'xp.chemistry': 3 }, '+3% Chemistry XP per rank.'),
  tech('xenogenetics', 'Xenogenetics', 35, { 'xp.xenobiology': 3 }, '+3% Xenobiology XP per rank.'),
  tech('shipwright', 'Master Shipwright', 40, { 'xp.engineering': 3 }, '+3% Engineering XP per rank.'),
  tech('market_analytics', 'Market Analytics', 45, { sellPrice: 2, tradeProfit: 2 }, '+2% market sale prices and +2% trade profit per rank.'),
  tech('cargo_compression', 'Cargo Compression', 50, { cargoSlots: 4 }, '+4 cargo hold slots per rank.'),
  tech('neural_interface', 'Neural Interface', 60, { mxp: 3 }, '+3% Mastery XP in every skill per rank.'),
  tech('automation', 'Process Automation', 70, { interval: -2 }, '-2% interval for every action per rank.'),
  tech('quantum_logistics', 'Quantum Logistics', 80, { tonnagePct: 10 }, '+10% trade tonnage per rank.'),
  tech('singularity', 'Singularity Theory', 90, { xp: 2 }, '+2% XP in every skill per rank.'),
];

TECHS.forEach((t, i) => {
  t.tier = i + 1;
});

export const TECH_MAP = Object.fromEntries(TECHS.map((t) => [t.id, t]));

// Cost of buying the next rank (rank is the current rank, 0-based).
export function techCost(t, rank) {
  const f = (rank + 1) ** 2;
  return { rp: t.tier * 5 * f, credits: t.tier * 2000 * f };
}
