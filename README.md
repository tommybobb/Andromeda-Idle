# Andromeda Idle

A space idle game with a cockpit HUD. Mine asteroids, skim gas giants, pick through derelicts, chart the galaxy, grow alien crops, build ship modules and work your way from a battered Sparrow to the flagship that crosses the void to Andromeda.

Everything is non-combat. Your ship keeps working for up to 24 hours while you are away, and it plays on phones and desktops alike (it can be installed as an app from the browser menu).

## Playing

The game is a static site with no build step and no dependencies.

```bash
npm start          # serves the folder on http://localhost:8080
```

Any static web server works. Opening `index.html` straight from disk will not, because browsers block ES modules on `file://`.

### Hosting on GitHub Pages

`.github/workflows/pages.yml` runs the tests and publishes the game whenever `main` is pushed. Turn it on once under **Settings > Pages > Build and deployment > Source: GitHub Actions**. The game will then be at `https://<user>.github.io/<repo>/`.

## What is in it

**12 skills**, each levelling 1 to 99:

| Group | Skill | What you do |
| --- | --- | --- |
| Gathering | Mining | Laser asteroids for ore. Asteroids have integrity, deplete and respawn. 1% gem chance per ore. |
| | Gas Harvesting | Skim gas giants and nebulae. Rare Spore Clusters contain seeds. |
| | Salvaging | Finesse vs Hazard success rolls on wrecks for credits and loot tables. Failure costs a 3 second reboot. |
| | Exploration | Scan regions of the galaxy. Every scan logs a procedurally named star system. Deeper regions burn fuel. Black holes, neutron stars and Earth-like worlds pay out. |
| | Xenobiology | Hydroponics bays that grow in real time, even offline. Nutrient Gel improves survival. |
| Production | Refining | Ore into ingots and alloys. |
| | Fabrication | Ingots into components: plating, wiring, circuits, coils, processors. |
| | Chemistry | Jump fuel, Nutrient Gel and Boosters. |
| | Engineering | Ship modules, grades E to A, and two ships that can only be built. |
| Operations | Trading | Sell a full hold of goods on a trade route for a premium. Ship tonnage sets how much each run carries. |
| | Research | Turn data and artefacts into Research Points for the Tech Lab. |
| | Piloting | Levels passively from every ship operation. Unlocks ships and speeds up ship work. |

**Ships and cargo.** Twelve ships, each with built-in bonuses, trade tonnage and module slots (laser, harvester, salvage, scanner, jump drive, cargo racks and utility slots). The cargo hold has one slot per item type, unlimited stacks, expandable.

**Commander profiles.** Multiple save slots in one browser, a rank ladder based on total level, insignia, six HUD colours, and save export and import for moving between devices.

**Also:** mastery levels for every action, mastery pools with checkpoints, 12 companions, 65 achievements, a Tech Lab with 15 upgrade lines, a market, statistics and a full offline catch-up report.

## Formulas

The progression maths:

- **Skill and mastery XP curve.** `XP(L) = floor( sum_{l=1}^{L-1} floor(l + 300 * 2^(l/7)) / 4 )`. Level 2 is 83 XP and level 99 is 13,034,431 XP.
- **Mastery XP per action.** `((unlocked actions * total current mastery / (actions * 99)) + (mastery level * actions / 10)) * action seconds * 0.5`, multiplied by any Mastery XP bonuses.
- **Mastery pool.** 25% of mastery XP (50% once the skill is 99) flows into a pool capped at 500,000 XP per action. Checkpoints at 10%, 25%, 50% and 95% give bonuses while the pool stays above them. Pool XP can be spent one-for-one on mastery levels.
- **Salvage success.** `(100 + Finesse) / (100 + Hazard)`, where Finesse is skill level plus mastery level plus bonuses.
- **Offline progress.** Elapsed time is replayed through the same engine as live play, capped at 24 hours.

## Development

```bash
npm test           # engine tests (Node 20+)
npm run smoke      # browser smoke test across every page; needs playwright and a running server
npm run lint       # eslint
npm run economy    # balance report: XP, credits and item costs for every action
```

The economy model drives the real engine with fixed setups and prints a Markdown report. It is seeded, so after a data change you can diff its output against `docs/economy-baseline.md` to see exactly what moved. `docs/expansion-plan.md` is the research write-up: balance findings, what to build next and why, and how to track the game.

```
index.html            app shell
css/style.css         all styling
js/core/              XP table, formatting, event bus
js/data/              items, skills, ships, research, companions, achievements, market stock
js/game/              DOM-free simulation: state, modifiers, XP and mastery, cargo, action loop,
                      farming, ships, services, offline catch-up, saves
js/ui/                router and shell, live bindings, SVG icons and scenes, modals, toasts
js/ui/pages/          one module per screen
sw.js                 offline cache (network first)
tests/                engine tests and the browser smoke test
tools/                economy model for balancing
docs/                 economy baseline report and the expansion plan
```

Content lives in `js/data`. Adding an ore, recipe or trade route is a single line in `js/data/skills.js` plus an item in `js/data/items.js`.

## Credits

Fonts are Orbitron and Rajdhani from Google Fonts, used under the SIL Open Font Licence.

## Licence

Copyright (c) 2026 Tom Clarke. All rights reserved.
