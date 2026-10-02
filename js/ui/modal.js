// HUD-styled modal dialogs (a bottom sheet on phones).

import { icon } from './icons.js';
import { esc } from '../core/util.js';

let stack = [];

export function openModal({ title, body, wide = false, onOpen, onClose, actions }) {
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.innerHTML = `
    <div class="modal panel ${wide ? 'wide' : ''}" role="dialog" aria-modal="true" aria-label="${esc(title)}">
      <div class="ph"><span>${esc(title)}</span><button class="modal-close" aria-label="Close">${icon('close')}</button></div>
      <div class="modal-body"></div>
    </div>`;
  const box = backdrop.querySelector('.modal');
  const bodyEl = backdrop.querySelector('.modal-body');
  const handle = {
    el: box,
    body: bodyEl,
    set(html) {
      bodyEl.innerHTML = html;
    },
    close() {
      if (!backdrop.isConnected) return;
      backdrop.remove();
      stack = stack.filter((h) => h !== handle);
      onClose?.();
    },
  };
  if (typeof body === 'string') bodyEl.innerHTML = body;
  if (actions?.length) {
    const bar = document.createElement('div');
    bar.className = 'modal-actions';
    for (const a of actions) {
      const b = document.createElement('button');
      b.className = `btn ${a.cls || ''}`;
      b.textContent = a.label;
      b.addEventListener('click', () => {
        const keep = a.onClick?.(handle);
        if (keep !== true) handle.close();
      });
      bar.appendChild(b);
    }
    box.appendChild(bar);
  }
  backdrop.addEventListener('mousedown', (e) => {
    if (e.target === backdrop) handle.close();
  });
  backdrop.querySelector('.modal-close').addEventListener('click', () => handle.close());
  document.getElementById('modal-root').appendChild(backdrop);
  stack.push(handle);
  onOpen?.(handle);
  return handle;
}

export function closeTopModal() {
  const top = stack[stack.length - 1];
  if (top) {
    top.close();
    return true;
  }
  return false;
}

export function closeAllModals() {
  for (const h of [...stack]) h.close();
}

export function confirmModal(title, message, { ok = 'Confirm', danger = false } = {}) {
  return new Promise((resolve) => {
    let answered = false;
    openModal({
      title,
      body: `<p>${message}</p>`,
      onClose: () => {
        if (!answered) resolve(false);
      },
      actions: [
        { label: 'Cancel', onClick: () => { answered = true; resolve(false); } },
        { label: ok, cls: danger ? 'danger' : 'solid', onClick: () => { answered = true; resolve(true); } },
      ],
    });
  });
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeTopModal();
});
