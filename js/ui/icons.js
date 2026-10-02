// All artwork is inline SVG so the game ships with no image assets.

import { ITEMS } from '../data/items.js';

// ---------------------------------------------------------------------------
// Item icons: holographic line art tinted with the item's colour.

const SHAPES = {
  rock: '<path d="M6 20 9 10l8-4 8 4 2 9-6 7H11z"/><path class="d" d="M9 10l6 5 10-5M15 15l-4 11M15 15l12 4"/>',
  gem: '<path d="M8 12l4-6h8l4 6-8 15z"/><path class="d" d="M8 12h16M12 6l4 6 4-6M16 12v15"/>',
  canister: '<rect x="10" y="7" width="12" height="20" rx="3"/><rect x="13" y="4" width="6" height="3"/><path class="d" d="M10 13h12M10 21h12"/>',
  scrap: '<path d="M5 22l5-10 4 4 5-9 8 7-4 11-11 2z"/><path class="d" d="M10 12l2 15M19 7l4 18"/>',
  box: '<path d="M6 11l10-5 10 5v11l-10 5-10-5z"/><path class="d" d="M6 11l10 5 10-5M16 16v11"/>',
  chip: '<rect x="8" y="8" width="16" height="16" rx="1"/><rect class="f2" x="12" y="12" width="8" height="8"/><path class="d" d="M11 8V4M16 8V4M21 8V4M11 24v4M16 24v4M21 24v4M8 11H4M8 16H4M8 21H4M24 11h4M24 16h4M24 21h4"/>',
  disc: '<circle cx="16" cy="16" r="11"/><circle class="f2" cx="16" cy="16" r="3"/><path class="d" d="M16 5a11 11 0 0 1 11 11M16 9a7 7 0 0 1 7 7"/>',
  pod: '<ellipse cx="16" cy="16" rx="8" ry="11"/><circle class="f2" cx="16" cy="13" r="3.5"/><path class="d" d="M9 21h14"/>',
  plate: '<path d="M5 10l17-4 5 14-17 5z"/><path class="d" d="M8 12.5h.1M20 9.5h.1M11 22h.1M23 18.5h.1M9 16l15-4"/>',
  organic: '<path d="M10 7c8-5 18 3 15 11-2 8-13 11-17 4-4-6-3-12 2-15z"/><circle class="f2" cx="14" cy="14" r="2.2"/><circle class="f2" cx="19" cy="19" r="1.6"/><path class="d" d="M9 20c3-1 5 2 8 1"/>',
  relic: '<path d="M12 26l1-17 3-5 3 5 1 17z"/><rect x="9" y="26" width="14" height="3"/><path class="d" d="M14 13h4M14 17h4M14 21h4"/>',
  core: '<circle cx="16" cy="16" r="10"/><circle class="f2" cx="16" cy="16" r="5"/><path class="d" d="M16 3v5M16 24v5M3 16h5M24 16h5"/>',
  crate: '<rect x="5" y="9" width="22" height="16"/><path class="d" d="M5 14h22M12 9v16M20 9v16"/>',
  seed: '<ellipse cx="16" cy="17" rx="7" ry="10" transform="rotate(25 16 17)"/><path class="d" d="M12 9q4 8 7 16"/>',
  leaf: '<path d="M6 26C6 12 14 5 27 5c0 13-7 21-21 21z"/><path class="d" d="M6 26 20 12M13 19h5M16 16v-5"/>',
  ingot: '<path d="M4 22l5-8h18l1 8z"/><path class="d" d="M9 14l2 4h15l1-4M11 18l-7 4M26 18l2 4"/>',
  pane: '<rect x="7" y="6" width="18" height="20"/><path class="d" d="M10 11l6-2M10 15l10-4M18 22l4-2"/>',
  lens: '<ellipse cx="16" cy="16" rx="6" ry="11"/><ellipse class="d" cx="16" cy="16" rx="2" ry="11"/>',
  coil: '<rect x="8" y="6" width="16" height="20" rx="2"/><path class="d" d="M8 10h16M8 14h16M8 18h16M8 22h16"/>',
  frame: '<rect x="6" y="6" width="20" height="20"/><rect class="f2" x="11" y="11" width="10" height="10"/><path class="d" d="M6 6l5 5M26 6l-5 5M6 26l5-5M26 26l-5-5"/>',
  fins: '<rect x="6" y="20" width="20" height="6"/><path class="d w" d="M8 20V6M12 20V6M16 20V6M20 20V6M24 20V6"/>',
  girder: '<path d="M5 8h22v3h-9v10h9v3H5v-3h9V11H5z"/>',
  plug: '<rect x="9" y="12" width="14" height="14" rx="2"/><path class="d w" d="M13 12V5M19 12V5M16 26v4"/>',
  crystal: '<path d="M16 3l7 9-4 17h-6L9 12z"/><path class="d" d="M9 12h14M16 3v26"/>',
  dish: '<path d="M5 12a11 11 0 0 0 22 0z"/><path class="d" d="M16 18v9M10 28h12M16 12l5-7"/><circle class="f2" cx="21" cy="5" r="1.5"/>',
  tube: '<rect x="4" y="12" width="24" height="8" rx="4"/><path class="d" d="M9 12v8M23 12v8"/><circle class="f2" cx="16" cy="16" r="2"/>',
  cell: '<rect x="9" y="6" width="14" height="22" rx="2"/><rect x="13" y="3" width="6" height="3"/><path class="d" d="M17 11l-4 7h5l-3 6"/>',
  vial: '<path d="M12 4h8M13 4v8L7 25q-1 3 2 3h14q3 0 2-3l-6-13V4"/><path class="f2" d="M9.2 21h13.6l2.2 4q1 3-2 3H9q-3 0-2-3z"/>',
  atom: '<circle class="f2" cx="16" cy="16" r="2.6"/><ellipse class="d" cx="16" cy="16" rx="12" ry="4.6"/><ellipse class="d" cx="16" cy="16" rx="12" ry="4.6" transform="rotate(60 16 16)"/><ellipse class="d" cx="16" cy="16" rx="12" ry="4.6" transform="rotate(-60 16 16)"/>',
  module: '<path d="M16 3l11 6.5v13L16 29 5 22.5v-13z"/><path class="d" d="M16 7l7.5 4.4v9.2L16 25l-7.5-4.4v-9.2z"/>',
};

export function itemIcon(id, cls = '') {
  const item = ITEMS[id];
  if (!item) return '';
  const c = item.color || '#ff7a00';
  const shape = SHAPES[item.shape] || SHAPES.box;
  const grade = item.grade ? `<text x="16" y="20" text-anchor="middle" font-size="10" font-weight="700" font-family="Orbitron, sans-serif" fill="${c}" stroke="none">${item.grade}</text>` : '';
  return `<svg class="ico ${cls}" viewBox="0 0 32 32" aria-hidden="true"><g fill="${c}" fill-opacity=".2" stroke="${c}" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round" class="iconset">${shape}${grade}</g></svg>`;
}

// ---------------------------------------------------------------------------
// Line icons for skills and navigation (24x24, currentColor).

const LINE = {
  mining: '<path d="M4 15l3-6 6-2 5 3 1 6-5 5H8z"/><path d="M9 11l2 2M13 16h1"/><path d="M14 4l6-2M17 6l5-1" stroke-dasharray="2 2"/>',
  gas: '<circle cx="12" cy="12" r="7"/><path d="M5.5 10h13M5.2 13.5h13.6M7 16.5h10"/><ellipse cx="12" cy="12" rx="11" ry="3.2" transform="rotate(-18 12 12)"/>',
  salvaging: '<path d="M3 17l5-8 4 3 4-7 5 6-3 8H6z"/><path d="M12 12l-1 9M16 5l2 15"/>',
  exploration: '<circle cx="12" cy="12" r="2.5"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/><circle cx="12" cy="12" r="7" stroke-dasharray="3 3"/>',
  xenobiology: '<path d="M12 21V11"/><path d="M12 13c-4 0-7-3-7-7 4 0 7 3 7 7zM12 11c0-4 3-7 7-7 0 4-3 7-7 7z"/><path d="M4 21h16"/>',
  refining: '<path d="M5 21h14l-2-6H7z"/><path d="M8 15c0-4 4-4 4-8 2 2 4 4 4 8"/><path d="M11 15c0-2 1-2 1-4 1 1 2 2 2 4"/>',
  fabrication: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2"/><circle cx="12" cy="12" r="7"/>',
  chemistry: '<path d="M9 3h6M10 3v6l-5 10q-1 2 1 2h12q2 0 1-2l-5-10V3"/><path d="M7 15h10"/>',
  engineering: '<path d="M14 6a4 4 0 0 0 5 5l-9 9a2 2 0 0 1-3-3l9-9a4 4 0 0 0-2-2z"/><path d="M15 3l2 2-2 2-2-2z"/>',
  trading: '<path d="M4 8h13l-3-3M20 16H7l3 3"/><circle cx="12" cy="12" r="1.5"/>',
  research: '<circle cx="12" cy="12" r="2"/><ellipse cx="12" cy="12" rx="10" ry="4"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(-60 12 12)"/>',
  piloting: '<path d="M12 2l3 8 7 3-7 2-3 7-3-7-7-2 7-3z"/>',
  bridge: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><path d="M12 12l6-6"/><circle cx="16" cy="9" r="1"/>',
  commander: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1-5 4-7 8-7s7 2 8 7"/><path d="M9 4l3-2 3 2"/>',
  cargo: '<path d="M3 8l9-5 9 5v8l-9 5-9-5z"/><path d="M3 8l9 5 9-5M12 13v8"/>',
  market: '<path d="M4 9h16l-1-5H5z"/><path d="M5 9v11h14V9M9 20v-6h6v6"/>',
  hangar: '<path d="M2 14l8-3 10-1 2 2-2 2-10-1z"/><path d="M8 11l-3-5h3l5 5M8 13l-3 5h3l5-5"/>',
  logbook: '<path d="M5 3h12a2 2 0 0 1 2 2v16H7a2 2 0 0 1-2-2z"/><path d="M5 17a2 2 0 0 1 2-2h12"/><path d="M9 7h6M9 10h4"/>',
  stats: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>',
  menu: '<path d="M3 6h18M3 12h18M3 18h12"/>',
  close: '<path d="M5 5l14 14M19 5L5 19"/>',
  play: '<path d="M7 4l13 8-13 8z"/>',
  stop: '<rect x="6" y="6" width="12" height="12"/>',
  lock: '<rect x="5" y="11" width="14" height="10"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  medal: '<circle cx="12" cy="15" r="6"/><path d="M8 3l4 6 4-6M12 12l1 2h2l-1.5 1.5.5 2-2-1-2 1 .5-2L9 14h2z"/>',
  paw: '<circle cx="7" cy="10" r="2"/><circle cx="12" cy="7" r="2"/><circle cx="17" cy="10" r="2"/><path d="M8 18c0-3 2-5 4-5s4 2 4 5c0 2-2 2-4 2s-4 0-4-2z"/>',
  star: '<circle cx="12" cy="12" r="4"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4M5 5l3 3M16 16l3 3M5 19l3-3M16 8l3-3"/>',
  credits: '<circle cx="12" cy="12" r="9"/><path d="M15 8.5a4 4 0 1 0 0 7"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
};

export function icon(name, cls = '') {
  const body = LINE[name] || LINE.info;
  return `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
}

// ---------------------------------------------------------------------------
// Commander insignia (64x64)

const INSIGNIA_ART = {
  chevron: '<path d="M10 22l22-12 22 12v8L32 18 10 30z"/><path d="M10 36l22-12 22 12v8L32 32 10 44z"/><path d="M18 50l14-8 14 8v4l-14-8-14 8z"/>',
  star: '<path d="M32 6l7 18h19L43 35l6 19-17-11-17 11 6-19L6 24h19z"/>',
  wings: '<circle cx="32" cy="30" r="7"/><path d="M25 30C17 24 9 24 3 20c4 10 12 16 22 16M39 30c8-6 16-6 22-10-4 10-12 16-22 16"/><path d="M32 37v18M26 55h12"/>',
  ring: '<circle cx="32" cy="32" r="12"/><ellipse cx="32" cy="32" rx="28" ry="9" transform="rotate(-20 32 32)"/><circle cx="54" cy="22" r="3"/>',
  diamond: '<path d="M32 4l24 28-24 28L8 32z"/><path d="M32 14l15 18-15 18-15-18z"/><path d="M8 32h48"/>',
  comet: '<circle cx="44" cy="20" r="9"/><path d="M37 26L8 55M40 28L18 56M34 22L6 46"/>',
  atom: '<circle cx="32" cy="32" r="5"/><ellipse cx="32" cy="32" rx="26" ry="10"/><ellipse cx="32" cy="32" rx="26" ry="10" transform="rotate(60 32 32)"/><ellipse cx="32" cy="32" rx="26" ry="10" transform="rotate(-60 32 32)"/>',
  eye: '<path d="M4 32c8-14 18-20 28-20s20 6 28 20c-8 14-18 20-28 20S12 46 4 32z"/><circle cx="32" cy="32" r="10"/><circle cx="32" cy="32" r="4"/>',
};

export function insignia(id, cls = 'insignia') {
  const art = INSIGNIA_ART[id] || INSIGNIA_ART.chevron;
  return `<svg class="${cls}" viewBox="0 0 64 64" fill="currentColor" fill-opacity=".12" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round" aria-hidden="true"><path d="M32 1l29 9v22c0 15-13 26-29 31C16 58 3 47 3 32V10z" fill-opacity=".05" stroke-opacity=".35" stroke-width="1.5"/>${art}</svg>`;
}

// ---------------------------------------------------------------------------
// Ship silhouettes, top-down with the nose pointing right (120x60).

const HULLS = {
  light: ['M8 26L60 20l40 7 12 3-12 3-40 7L8 34z', 'M40 22L28 6l34 15z', 'M40 38L28 54l34-15z', 'M92 27l12 3-12 3z'],
  miner: ['M10 18h60l25 6 15 6-15 6-25 6H10z', 'M70 18l10-10h16l-6 12z', 'M70 42l10 10h16l-6-12z', 'M30 18v24M50 18v24'],
  explorer: ['M6 28l74-4 34 6-34 6-74 4z', 'M20 26L10 12l26 13z', 'M20 34L10 48l26-13z', 'M60 24l6-10 6 10'],
  hauler: ['M8 14h78l18 8v16l-18 8H8z', 'M30 14v32M52 14v32M74 14v32', 'M96 26l8 4-8 4'],
  salvager: ['M8 22l52-4 40 8 10 4-10 4-40 8-52-4z', 'M100 26l16-8-4 8z', 'M100 34l16 8-4-8z', 'M40 18v24'],
  skimmer: ['M10 30L50 8l40 12 22 10-22 10-40 12z', 'M30 30h70', 'M50 8v44'],
  industrial: ['M8 16h82v28H8z', 'M90 22l20 4v8l-20 4', 'M24 16v28M40 16v28M56 16v28', 'M74 22h10v16H74z'],
  heavy: ['M4 16h92l16 8v12l-16 8H4z', 'M20 16v28M36 16v28M52 16v28M68 16v28M84 16v28', 'M100 26l6 4-6 4'],
  explorer2: ['M6 30l34-14 56 6 20 8-20 8-56 6z', 'M40 10a6 20 0 1 0 .1 0', 'M70 22v16'],
  barge: ['M6 10h74l20 8v24l-20 8H6z', 'M80 18l14-10h12l-8 12z', 'M80 42l14 10h12l-8-12z', 'M100 26h14v8h-14', 'M26 10v40M46 10v40M66 10v40'],
  capital: ['M6 30l24-16 50 2 34 14-34 14-50 2z', 'M30 14l-8-10 28 11z', 'M30 46l-8 10 28-11z', 'M70 24h14l6 6-6 6H70z'],
  flagship: ['M4 30l20-20 46 2 34 10 14 8-14 8-34 10-46 2z', 'M24 10v40M44 12v36M70 14v32', 'M50 30a8 8 0 1 0 .1 0', 'M104 26l10 4-10 4'],
};

export function shipArt(hull, color = 'currentColor', { engines = true } = {}) {
  const parts = HULLS[hull] || HULLS.light;
  const glow = engines
    ? `<g class="engine"><circle cx="6" cy="27" r="2.6" fill="#7fd6ff"/><circle cx="6" cy="33" r="2.6" fill="#7fd6ff"/><circle cx="4" cy="30" r="6" fill="#7fd6ff" opacity=".18"/></g>`
    : '';
  return `<svg viewBox="-4 0 128 60" aria-hidden="true"><g fill="${color}" fill-opacity=".16" stroke="${color}" stroke-width="1.3" stroke-linejoin="round">${parts.map((d) => `<path d="${d}"/>`).join('')}</g>${glow}</svg>`;
}

export const hullPaths = (hull) => HULLS[hull] || HULLS.light;

// Companion art: a soft glowing creature blob with eyes, tinted per companion.
export function companionArt(c, known = true) {
  const col = known ? c.color : '#555';
  return `<svg class="companion-art" viewBox="0 0 64 64" aria-hidden="true">
    <defs><radialGradient id="cg-${c.id}" cx="50%" cy="40%" r="60%"><stop offset="0" stop-color="${col}" stop-opacity=".9"/><stop offset="1" stop-color="${col}" stop-opacity=".1"/></radialGradient></defs>
    <circle cx="32" cy="34" r="22" fill="url(#cg-${c.id})" stroke="${col}" stroke-width="1.5"/>
    <path d="M14 22l-4-12 12 8M50 22l4-12-12 8" fill="${col}" fill-opacity=".4" stroke="${col}" stroke-width="1.5" stroke-linejoin="round"/>
    ${known ? '<circle cx="25" cy="32" r="3.5" fill="#000"/><circle cx="39" cy="32" r="3.5" fill="#000"/><circle cx="26" cy="31" r="1.2" fill="#fff"/><circle cx="40" cy="31" r="1.2" fill="#fff"/><path d="M28 41q4 3 8 0" stroke="#000" stroke-width="1.6" fill="none" stroke-linecap="round"/>' : `<text x="32" y="40" text-anchor="middle" font-size="18" font-family="Orbitron" fill="${col}">?</text>`}
  </svg>`;
}
