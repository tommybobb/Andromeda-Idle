// Small notifications in the corner. Item gains for the same item merge into
// one toast so fast actions don't flood the screen.

import { G } from '../game/state.js';
import { ITEMS } from '../data/items.js';
import { itemIcon, icon } from './icons.js';
import { esc, fmt } from '../core/util.js';

const MAX = 5;
const root = () => document.getElementById('toasts');
const gains = new Map();

function dismiss(el) {
  if (!el.isConnected || el.classList.contains('out')) return;
  el.classList.add('out');
  setTimeout(() => el.remove(), 260);
}

function push(el, ms) {
  const r = root();
  r.appendChild(el);
  while (r.children.length > MAX) r.firstElementChild.remove();
  el._timer = setTimeout(() => dismiss(el), ms);
  el.addEventListener('click', () => dismiss(el));
  return el;
}

export function toast(html, type = 'info', ms = 3500) {
  if (!G.state?.settings.toasts && (type === 'gain' || type === 'info')) return null;
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = html;
  return push(el, ms);
}

export function gainToast(id, n) {
  if (!G.state?.settings.toasts) return;
  const item = ITEMS[id];
  if (!item) return;
  const existing = gains.get(id);
  if (existing && existing.isConnected && !existing.classList.contains('out')) {
    existing._n += n;
    existing.querySelector('.n').textContent = `+${fmt(existing._n)}`;
    clearTimeout(existing._timer);
    existing._timer = setTimeout(() => dismiss(existing), 2600);
    return;
  }
  const el = document.createElement('div');
  el.className = 'toast gain';
  el._n = n;
  el.innerHTML = `${itemIcon(id)}<b class="n">+${fmt(n)}</b><span>${esc(item.name)}</span>`;
  gains.set(id, el);
  push(el, 2600);
}

export function notifyToast(msg, type = 'info') {
  const ico = type === 'bad' ? 'info' : type === 'stop' ? 'stop' : 'info';
  return toast(`${icon(ico, 'ico sm')}<span>${esc(msg)}</span>`, type, type === 'bad' ? 3000 : 4500);
}
