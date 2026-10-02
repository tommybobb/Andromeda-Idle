// Commander profiles and persistence (localStorage, with an in-memory fallback
// when storage is blocked).

import { G, newState, migrate } from './state.js';
import { invalidateMods } from './modifiers.js';
import { totalLevel } from './progress.js';
import { uid } from '../core/util.js';

const PREFIX = 'andromeda-idle';
const INDEX_KEY = `${PREFIX}/index`;
const saveKey = (id) => `${PREFIX}/save/${id}`;

const memory = new Map();
let storageOk = true;

function read(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    storageOk = false;
    return memory.get(key) ?? null;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    storageOk = false;
    memory.set(key, value);
  }
}

function del(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    memory.delete(key);
  }
}

export const storageAvailable = () => storageOk;

export function readIndex() {
  try {
    const idx = JSON.parse(read(INDEX_KEY) || 'null');
    if (idx && Array.isArray(idx.profiles)) return idx;
  } catch {
    /* corrupted index, start again */
  }
  return { profiles: [], active: null };
}

function writeIndex(idx) {
  write(INDEX_KEY, JSON.stringify(idx));
}

function profileMeta(state) {
  return {
    id: state.id,
    name: state.name,
    insignia: state.insignia,
    accent: state.accent,
    ship: state.ships.active,
    credits: state.credits,
    lastPlayed: Date.now(),
  };
}

export function saveGame() {
  const S = G.state;
  if (!S) return;
  write(saveKey(S.id), JSON.stringify(S));
  const idx = readIndex();
  const meta = { ...profileMeta(S), totalLevel: totalLevel() };
  const i = idx.profiles.findIndex((p) => p.id === S.id);
  if (i >= 0) idx.profiles[i] = meta;
  else idx.profiles.push(meta);
  idx.active = S.id;
  writeIndex(idx);
}

export function loadProfile(id) {
  const raw = read(saveKey(id));
  if (!raw) return null;
  try {
    const state = migrate(JSON.parse(raw));
    state.id = id;
    return state;
  } catch (err) {
    console.error('Failed to load save', err);
    return null;
  }
}

export function useState(state) {
  G.state = state;
  invalidateMods();
}

export function createProfile(name, insignia, accent) {
  const state = newState(name, insignia, accent);
  useState(state);
  saveGame();
  return state;
}

export function deleteProfile(id) {
  del(saveKey(id));
  const idx = readIndex();
  idx.profiles = idx.profiles.filter((p) => p.id !== id);
  if (idx.active === id) idx.active = idx.profiles[0]?.id || null;
  writeIndex(idx);
}

// Save strings are base64 encoded JSON (UTF-8 safe).
export function exportSave(state = G.state) {
  const bytes = new TextEncoder().encode(JSON.stringify(state));
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

export function importSave(text) {
  const bin = atob(text.trim());
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  const raw = JSON.parse(new TextDecoder().decode(bytes));
  if (!raw || typeof raw !== 'object' || !raw.skills) throw new Error('Not an Andromeda Idle save.');
  const state = migrate(raw);
  // Imports always become a new profile so nothing is overwritten by accident.
  state.id = uid();
  return state;
}
