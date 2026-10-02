// Commander ranks (by total level) and insignia choices.

export const RANKS = [
  [0, 'Recruit'],
  [30, 'Cadet'],
  [75, 'Spacer'],
  [150, 'Pilot'],
  [250, 'Navigator'],
  [380, 'Pathfinder'],
  [520, 'Captain'],
  [680, 'Commodore'],
  [850, 'Rear Admiral'],
  [1000, 'Admiral'],
  [1120, 'Fleet Admiral'],
  [1188, 'Elite'],
];

export function rankFor(totalLevel) {
  let idx = 0;
  for (let i = 0; i < RANKS.length; i++) if (totalLevel >= RANKS[i][0]) idx = i;
  const next = RANKS[idx + 1];
  return { index: idx, name: RANKS[idx][1], at: RANKS[idx][0], next: next ? { name: next[1], at: next[0] } : null };
}

export const INSIGNIA = [
  { id: 'chevron', name: 'Chevron' },
  { id: 'star', name: 'Lone Star' },
  { id: 'wings', name: 'Wings' },
  { id: 'ring', name: 'Orbit' },
  { id: 'diamond', name: 'Diamond' },
  { id: 'comet', name: 'Comet' },
  { id: 'atom', name: 'Atom' },
  { id: 'eye', name: 'Watcher' },
];

export const ACCENTS = [
  { id: 'orange', name: 'Combat Orange', color: '#ff7a00' },
  { id: 'blue', name: 'Federal Blue', color: '#3fa9ff' },
  { id: 'gold', name: 'Imperial Gold', color: '#e6c35c' },
  { id: 'green', name: 'Alliance Green', color: '#46d68a' },
  { id: 'red', name: 'Pirate Red', color: '#ff4d4d' },
  { id: 'violet', name: 'Void Violet', color: '#b07bff' },
];
