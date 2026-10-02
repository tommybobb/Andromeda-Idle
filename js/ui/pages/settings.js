// Settings.

import { G, newState, OFFLINE_CAP_MS } from '../../game/state.js';
import { esc, fmtTime } from '../../core/util.js';
import { icon } from '../icons.js';
import { confirmModal } from '../modal.js';
import { applySettings } from '../app.js';
import { saveGame, storageAvailable, useState } from '../../game/save.js';
import { enterProfile } from '../session.js';

const TOGGLES = [
  ['starfield', 'Animated starfield', 'The moving star background. Turn off to save battery.'],
  ['reduceMotion', 'Reduce motion', 'Calms scene animations and transitions.'],
  ['toasts', 'Item notifications', 'Pop-ups when you gain items.'],
  ['autoReplant', 'Auto-replant crops', 'Replant the same crop after harvesting if you have the seeds.'],
];

export default {
  render(root) {
    const s = G.state.settings;
    root.innerHTML = `<div class="page">
      <div class="page-title">${icon('settings')} Settings</div>
      <div class="grid two">
        <div class="panel"><div class="ph">Display and gameplay</div>
          ${TOGGLES.map(([key, label, hint]) => `<label class="toggle"><span><b>${label}</b><br><span class="small muted">${hint}</span></span><input type="checkbox" data-act="toggle" data-key="${key}" ${s[key] ? 'checked' : ''}><span class="sw"></span></label>`).join('')}
        </div>
        <div class="panel"><div class="ph">About</div>
          <p style="margin-top:0">Andromeda Idle is a space idle game with a cockpit HUD. Your ship keeps working while you are away.</p>
          <ul class="small muted" style="padding-left:18px">
            <li>Skills level from 1 to 99. Level 99 needs 13,034,431 XP.</li>
            <li>Every action has its own mastery level, and each skill has a mastery pool with checkpoints at 10%, 25%, 50% and 95%.</li>
            <li>Offline progress is simulated for up to ${fmtTime(OFFLINE_CAP_MS)}.</li>
            <li>Saves are stored in this browser${storageAvailable() ? '' : ' <b class="bad">(storage is blocked, progress will not persist)</b>'}. Export backups from the Commander page.</li>
          </ul>
        </div>
      </div>
      <div class="panel"><div class="ph" style="color:var(--red)">Danger zone</div>
        <p class="small muted" style="margin-top:0">Reset wipes all progress for CMDR ${esc(G.state.name)} and starts again with the same name and insignia.</p>
        <button class="btn danger" data-act="reset">Reset this commander</button>
      </div>
    </div>`;
  },

  change(t) {
    if (t.dataset.act === 'toggle') {
      G.state.settings[t.dataset.key] = t.checked;
      applySettings();
      saveGame();
    }
  },

  async click(t) {
    if (t.dataset.act !== 'reset') return;
    const S = G.state;
    if (!(await confirmModal('Reset commander', `Erase every skill, item and ship for <b>CMDR ${esc(S.name)}</b>? This cannot be undone.`, { ok: 'Reset', danger: true }))) return;
    const fresh = newState(S.name, S.insignia, S.accent);
    fresh.id = S.id;
    useState(fresh);
    saveGame();
    await enterProfile(fresh);
  },
};
