// Commander profile: identity, rank, profiles and save management.

import { G } from '../../game/state.js';
import { RANKS, rankFor, INSIGNIA, ACCENTS } from '../../data/profile.js';
import { SHIPS } from '../../data/ships.js';
import { esc, fmtTime } from '../../core/util.js';
import { icon, insignia } from '../icons.js';
import { confirmModal, openModal } from '../modal.js';
import { toast } from '../toast.js';
import { totalLevel } from '../../game/progress.js';
import { saveGame, readIndex, deleteProfile, exportSave } from '../../game/save.js';
import { switchProfile, showIntro, importDialog } from '../session.js';
import { applyAccent, renderTopCommander, renderPage } from '../app.js';

function profiles() {
  const idx = readIndex();
  return idx.profiles
    .sort((a, b) => b.lastPlayed - a.lastPlayed)
    .map((p) => {
      const current = p.id === G.state.id;
      return `<div class="card ${current ? 'active' : ''}">
        <div class="card-top"><div class="ico-wrap">${insignia(p.insignia, 'ico')}</div>
          <div class="card-title"><div class="name">CMDR ${esc(p.name)}</div><div class="sub">Total level ${p.totalLevel || '?'} &middot; ${esc(SHIPS[p.ship]?.name || '')}</div></div></div>
        <div class="small muted">Last played ${new Date(p.lastPlayed).toLocaleString('en-GB')}</div>
        <div class="row">${current ? '<span class="chip good">Current</span>' : `<button class="btn xs solid" data-act="switch" data-id="${p.id}">Switch</button>`}
          <button class="btn xs danger" data-act="delete" data-id="${p.id}">Delete</button></div>
      </div>`;
    })
    .join('');
}

export default {
  render(root) {
    const S = G.state;
    const tl = totalLevel();
    const r = rankFor(tl);
    root.innerHTML = `<div class="page">
      <div class="page-title">${icon('commander')} Commander</div>
      <div class="grid two">
        <div class="panel"><div class="ph">Identity</div>
          <div class="row" style="gap:16px;align-items:flex-start">
            ${insignia(S.insignia)}
            <div class="stack" style="flex:1">
              <label class="field">Name<div class="row"><input class="input" id="rename" maxlength="20" value="${esc(S.name)}"><button class="btn sm" data-act="rename">Save</button></div></label>
              <div class="small muted">Profile created ${new Date(S.created).toLocaleDateString('en-GB')}. Time played ${fmtTime(S.stats.playTime)}.</div>
            </div>
          </div>
          <div class="field" style="margin-top:14px">Insignia</div>
          <div class="pick-grid" style="margin-top:6px">${INSIGNIA.map((i) => `<button class="pick ${i.id === S.insignia ? 'on' : ''}" data-act="insignia" data-id="${i.id}" title="${esc(i.name)}">${insignia(i.id, '')}</button>`).join('')}</div>
          <div class="field" style="margin-top:14px">HUD colour</div>
          <div class="row wrap" style="margin-top:6px">${ACCENTS.map((a) => `<button class="swatch ${a.id === S.accent ? 'on' : ''}" style="background:${a.color}" data-act="accent" data-id="${a.id}" title="${esc(a.name)}"></button>`).join('')}</div>
        </div>
        <div class="panel"><div class="ph">Rank<div class="ph-right"><span class="small">Total level ${tl}</span></div></div>
          <div class="table-wrap"><table class="table"><tbody>${RANKS.map(([at, name], i) => `<tr><td class="${i === r.index ? 'hud' : at <= tl ? '' : 'muted'}">${i === r.index ? '&#9656; ' : ''}<b>${esc(name)}</b></td><td class="num muted">${at}</td></tr>`).join('')}</tbody></table></div>
        </div>
      </div>
      <div class="section-title">Commander profiles</div>
      <p class="page-sub" style="margin-top:0">Each profile is a separate save in this browser. Switching saves the current one first.</p>
      <div class="grid">${profiles()}
        <div class="card click" data-act="new"><div class="card-top"><div class="ico-wrap">${icon('plus', 'ico')}</div><div class="card-title"><div class="name">New commander</div><div class="sub">Start a fresh career</div></div></div></div>
      </div>
      <div class="section-title">Save data</div>
      <div class="panel">
        <div class="row wrap">
          <button class="btn" data-act="save">Save now</button>
          <button class="btn" data-act="export">Export save</button>
          <button class="btn" data-act="download">Download backup</button>
          <button class="btn alt" data-act="import">Import save</button>
        </div>
        <p class="small muted" style="margin-bottom:0">Progress is saved automatically every few seconds and whenever you leave. Export a backup before clearing browser data or to move between devices.</p>
      </div>
    </div>`;
  },

  async click(t) {
    const S = G.state;
    const act = t.dataset.act;
    const root = document.getElementById('content');
    if (act === 'rename') {
      const v = document.getElementById('rename').value.trim().slice(0, 20);
      if (v) {
        S.name = v;
        saveGame();
        renderTopCommander();
        toast('<span>Name updated.</span>', 'gain');
      }
    } else if (act === 'insignia') {
      S.insignia = t.dataset.id;
      renderTopCommander();
      this.render(root);
    } else if (act === 'accent') {
      S.accent = t.dataset.id;
      applyAccent();
      renderPage();
    } else if (act === 'switch') {
      await switchProfile(t.dataset.id);
    } else if (act === 'delete') {
      const id = t.dataset.id;
      const p = readIndex().profiles.find((x) => x.id === id);
      if (!(await confirmModal('Delete commander', `Permanently delete <b>CMDR ${esc(p?.name || '')}</b>? This cannot be undone.`, { ok: 'Delete', danger: true }))) return;
      const wasCurrent = id === S.id;
      deleteProfile(id);
      if (wasCurrent) {
        G.state = null;
        const idx = readIndex();
        if (idx.profiles.length) await switchProfile(idx.profiles[0].id);
        else showIntro();
      } else this.render(root);
    } else if (act === 'new') {
      saveGame();
      showIntro({ canCancel: true });
    } else if (act === 'save') {
      saveGame();
      toast('<span>Game saved.</span>', 'gain');
    } else if (act === 'export') {
      saveGame();
      const text = exportSave();
      openModal({
        title: 'Export save',
        body: `<p class="small muted" style="margin-top:0">Copy this string somewhere safe. Import it on any device to restore this commander.</p><textarea class="input" readonly id="export-text">${text}</textarea>`,
        actions: [
          { label: 'Close' },
          {
            label: 'Copy',
            cls: 'solid',
            onClick(h) {
              const ta = h.body.querySelector('#export-text');
              ta.select();
              navigator.clipboard?.writeText(ta.value).then(
                () => toast('<span>Save copied to clipboard.</span>', 'gain'),
                () => document.execCommand?.('copy'),
              );
              return true;
            },
          },
        ],
      });
    } else if (act === 'download') {
      saveGame();
      const blob = new Blob([exportSave()], { type: 'text/plain' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `andromeda-idle-${S.name.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-${new Date().toISOString().slice(0, 10)}.txt`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        URL.revokeObjectURL(a.href);
        a.remove();
      }, 1000);
    } else if (act === 'import') importDialog();
  },

  events: { levelup: true },
};

