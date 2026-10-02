// Animated banner for each skill page: your ship working on the target.

import { G } from '../game/state.js';
import { SHIPS } from '../data/ships.js';
import { hullPaths } from './icons.js';

function seeded(seed) {
  let s = 0;
  for (const ch of seed) s = (s * 31 + ch.charCodeAt(0)) >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function starsSvg(rand, n = 70) {
  let out = '';
  for (let i = 0; i < n; i++) {
    const x = (rand() * 800).toFixed(1);
    const y = (rand() * 160).toFixed(1);
    const r = (0.4 + rand() * 1.1).toFixed(2);
    out += `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" opacity="${(0.25 + rand() * 0.6).toFixed(2)}"/>`;
  }
  return out;
}

function rockPath(rand, cx, cy, r, points = 11) {
  let d = '';
  for (let i = 0; i < points; i++) {
    const a = (i / points) * Math.PI * 2;
    const rr = r * (0.72 + rand() * 0.38);
    d += `${i ? 'L' : 'M'}${(cx + Math.cos(a) * rr).toFixed(1)} ${(cy + Math.sin(a) * rr * 0.85).toFixed(1)}`;
  }
  return d + 'Z';
}

const SHIP_X = 400;
const SHIP_Y = 58;
const NOSE_X = SHIP_X + 112 * 0.9;
const NOSE_Y = SHIP_Y + 30 * 0.9;

function playerShip(hud) {
  const ship = SHIPS[G.state?.ships.active] || SHIPS.kestrel;
  const paths = hullPaths(ship.hull).map((d) => `<path d="${d}"/>`).join('');
  return `<g class="bob"><g transform="translate(${SHIP_X} ${SHIP_Y}) scale(0.9)">
    <g fill="${hud}" fill-opacity=".18" stroke="${hud}" stroke-width="1.4" stroke-linejoin="round">${paths}</g>
    <g class="engine"><circle cx="2" cy="27" r="3" fill="#7fd6ff"/><circle cx="2" cy="33" r="3" fill="#7fd6ff"/><ellipse cx="-6" cy="30" rx="12" ry="6" fill="#7fd6ff" opacity=".2"/></g>
  </g></g>`;
}

const beam = (x2, y2, color, width = 3) =>
  `<line class="beam" x1="${NOSE_X}" y1="${NOSE_Y}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${width}" filter="url(#sglow)" stroke-linecap="round"/>`;

const TARGETS = {
  asteroid(rand, hud) {
    const big = rockPath(rand, 0, 0, 52, 13);
    let craters = '';
    for (let i = 0; i < 5; i++) craters += `<circle cx="${(rand() * 50 - 25).toFixed(1)}" cy="${(rand() * 40 - 20).toFixed(1)}" r="${(3 + rand() * 6).toFixed(1)}" fill="#1c1813" stroke="#5a4a3c" stroke-width="1"/>`;
    let debris = '';
    for (let i = 0; i < 6; i++) debris += `<path d="${rockPath(rand, 560 + rand() * 220, 20 + rand() * 120, 4 + rand() * 7, 7)}" fill="#2c2620" stroke="#5a4a3c"/>`;
    return `${debris}<g transform="translate(655 82)"><g class="spin"><path d="${big}" fill="#2f2822" stroke="#7a6654" stroke-width="1.5"/>${craters}</g></g>
      ${beam(612, 84, hud)}<circle class="sparks" cx="612" cy="84" r="7" fill="${hud}" filter="url(#sglow)"/>`;
  },
  gasgiant(rand, hud) {
    const bands = ['#c9a36b', '#a87d4a', '#e0c08a', '#8f6a3e', '#d2b07a', '#b58a55', '#e8cf9e'];
    let stripes = '';
    bands.forEach((c, i) => {
      stripes += `<rect x="560" y="${10 + i * 24}" width="260" height="${14 + (i % 3) * 6}" fill="${c}" opacity=".85"/>`;
    });
    return `<defs><clipPath id="gclip"><circle cx="690" cy="96" r="84"/></clipPath>
      <radialGradient id="gshade" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".75"/></radialGradient></defs>
      <circle cx="690" cy="96" r="84" fill="#b48a55"/>
      <g clip-path="url(#gclip)">${stripes}</g>
      <circle cx="690" cy="96" r="84" fill="url(#gshade)"/>
      <ellipse cx="690" cy="96" rx="130" ry="20" fill="none" stroke="#e6cfa3" stroke-opacity=".35" stroke-width="5" transform="rotate(-12 690 96)"/>
      ${beam(612, 70, '#ffd36b', 6)}`;
  },
  wreck(rand, hud) {
    return `<g transform="translate(640 80) rotate(-14)" fill="#262b30" stroke="#6f7c87" stroke-width="1.5">
        <path d="M-70 -14 L10 -22 L30 -6 L-10 4 L-60 6 Z"/><path d="M18 2 L60 -4 L80 10 L40 22 L14 16 Z"/>
        <path d="M-40 10 L-20 30 L-50 34 Z"/><path d="M-20 -20 L-30 -42 L0 -24 Z"/>
        <path d="M-60 -6 H0 M30 8 H70" stroke="#ff7a45" stroke-opacity=".6" fill="none"/>
      </g>
      <circle class="sparks" cx="628" cy="78" r="3" fill="#ffd36b"/><circle class="sparks" cx="660" cy="90" r="2" fill="#ffd36b"/>
      ${beam(625, 80, '#4cc3ff', 3)}`;
  },
  star(rand, hud) {
    return `<defs><radialGradient id="sstar"><stop offset="0" stop-color="#fff"/><stop offset=".35" stop-color="#ffe9a8"/><stop offset=".7" stop-color="#ffb347" stop-opacity=".5"/><stop offset="1" stop-color="#ff7a00" stop-opacity="0"/></radialGradient></defs>
      <circle cx="690" cy="80" r="110" fill="url(#sstar)" opacity=".55"/>
      <circle cx="690" cy="80" r="34" fill="#fff6dc" filter="url(#sglow)"/>
      <circle class="pulse-ring" cx="${NOSE_X - 40}" cy="${NOSE_Y}" r="150" fill="none" stroke="#4cc3ff" stroke-width="2"/>
      <circle class="pulse-ring r2" cx="${NOSE_X - 40}" cy="${NOSE_Y}" r="150" fill="none" stroke="#4cc3ff" stroke-width="2"/>`;
  },
  greenhouse() {
    let plants = '';
    for (let i = 0; i < 7; i++) {
      const x = 600 + i * 22;
      plants += `<path d="M${x} 118 q-6 -18 0 -30 q6 12 0 30" fill="#5ef08f" fill-opacity=".35" stroke="#5ef08f"/>`;
    }
    return `<rect x="560" y="118" width="230" height="10" fill="#1d242b" stroke="#5c6b77"/>
      <path d="M575 118 A100 76 0 0 1 775 118" fill="#5ef08f" fill-opacity=".06" stroke="#9fe7ff" stroke-opacity=".6"/>
      <path d="M625 118 A50 70 0 0 1 675 46 M725 118 A50 70 0 0 0 675 46 M585 92 H765" fill="none" stroke="#9fe7ff" stroke-opacity=".35"/>
      ${plants}<circle cx="675" cy="60" r="5" fill="#fff6dc" filter="url(#sglow)" opacity=".7"/>`;
  },
  station(rand, hud) {
    return `<g transform="translate(670 80)">
        <g class="spin fast"><ellipse rx="86" ry="86" fill="none" stroke="#7b8792" stroke-width="10" stroke-opacity=".5"/>
        <ellipse rx="86" ry="86" fill="none" stroke="${hud}" stroke-width="1" stroke-dasharray="4 10"/>
        <path d="M-86 0 H86 M0 -86 V86" stroke="#7b8792" stroke-width="3" stroke-opacity=".6"/></g>
        <circle r="18" fill="#1d242b" stroke="#9aa6b1" stroke-width="2"/><circle r="7" fill="${hud}" filter="url(#sglow)"/>
      </g>
      <circle class="sparks" cx="610" cy="96" r="3" fill="#ffd36b"/><circle class="sparks" cx="640" cy="60" r="2" fill="#fff"/>
      ${beam(652, 80, hud, 2)}`;
  },
  lab(rand, hud) {
    return `<g transform="translate(680 82)">
        <path d="M0 -60 L52 -30 V30 L0 60 L-52 30 V-30 Z" fill="#141a20" stroke="#7b8792" stroke-width="2"/>
        <path d="M0 -40 L35 -20 V20 L0 40 L-35 20 V-20 Z" fill="none" stroke="${hud}" stroke-opacity=".5"/>
        <circle r="16" fill="#b98bff" filter="url(#sglow)" opacity=".85"/>
        <circle class="pulse-ring" r="70" fill="none" stroke="#b98bff" stroke-width="1.5"/>
      </g>${beam(628, 82, '#b98bff', 2)}`;
  },
  shipyard(rand, hud) {
    const ship = hullPaths('capital').map((d) => `<path d="${d}"/>`).join('');
    return `<g stroke="#7b8792" stroke-width="2" fill="none" stroke-opacity=".7">
        <path d="M560 22 H790 M560 138 H790 M580 22 V138 M770 22 V138 M580 22 L620 138 M770 22 L730 138"/>
      </g>
      <g transform="translate(610 50) scale(1.15)" fill="${hud}" fill-opacity=".08" stroke="${hud}" stroke-width="1" stroke-dasharray="3 3">${ship}</g>
      <circle class="sparks" cx="640" cy="70" r="3" fill="#ffd36b"/><circle class="sparks" cx="700" cy="96" r="2.5" fill="#ffd36b"/><circle class="sparks" cx="740" cy="64" r="2" fill="#fff"/>`;
  },
  trade(rand, hud) {
    const st = (x) => `<g transform="translate(${x} 80)"><rect x="-22" y="-30" width="44" height="60" fill="#141a20" stroke="#9aa6b1" stroke-width="1.5"/><rect x="-8" y="-6" width="16" height="12" fill="${hud}" opacity=".6"/><path d="M-22 -18 H22 M-22 18 H22" stroke="#9aa6b1"/></g>`;
    return `${st(250)}${st(735)}<path d="M275 80 H710" stroke="${hud}" stroke-opacity=".35" stroke-dasharray="2 8"/>`;
  },
  flight() {
    let lines = '';
    for (let i = 0; i < 14; i++) lines += `<line x1="${560 + i * 17}" y1="${20 + ((i * 37) % 120)}" x2="${600 + i * 17}" y2="${20 + ((i * 37) % 120)}" stroke="#7fd6ff" stroke-opacity=".35"/>`;
    return lines;
  },
};

export function sceneSvg(skillId, scene, hud) {
  const rand = seeded(skillId);
  const target = (TARGETS[scene] || TARGETS.flight)(rand, hud);
  const isTrade = scene === 'trade';
  const ship = isTrade
    ? `<g class="trader"><g transform="translate(280 64) scale(.5)">${hullPaths((SHIPS[G.state?.ships.active] || SHIPS.kestrel).hull).map((d) => `<path d="${d}" fill="${hud}" fill-opacity=".2" stroke="${hud}" stroke-width="2"/>`).join('')}</g></g>`
    : playerShip(hud);
  return `<svg viewBox="0 0 800 160" preserveAspectRatio="xMaxYMid slice" aria-hidden="true">
    <defs><filter id="sglow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
    ${starsSvg(rand)}
    ${target}
    ${ship}
  </svg>`;
}
