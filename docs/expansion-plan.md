# Andromeda Idle: expansion research and plan

October 2026. What to add to the game next, whether now is the time, how to grow the item list, and how to track the game and balance its economy with data.

The balance figures come from the economy model in `tools/economy.mjs`, which runs the game's real engine. Its full output is in [economy-baseline.md](economy-baseline.md). Run `npm run economy` after any change to the game data and diff the result against that file. Runs are seeded, so any difference is down to your change.

## Contents

1. [Summary](#summary)
2. [The questions](#the-questions)
3. [The game today](#the-game-today)
4. [How the numbers were worked out](#how-the-numbers-were-worked-out)
5. [What the model found](#what-the-model-found)
6. [Should combat be built now?](#should-combat-be-built-now)
7. [A combat design sketch](#a-combat-design-sketch)
8. [Other mechanics](#other-mechanics)
9. [Growing the item list](#growing-the-item-list)
10. [Tracking the game](#tracking-the-game)
11. [Suggested order](#suggested-order)
12. [Decisions for you](#decisions-for-you)
13. [Sources](#sources)

## Summary

- **Combat is the right big expansion.** The game's real gap is having nothing to spend things on. Most of what you make is used once or sold, modules never wear out, and after about 145 hours of endgame play there is nothing left to buy. Combat would use up ammunition, repair kits and shield cells every hour, all made by the existing production skills.
- **Design it now and build it later.** First fix the balance problems in section 5 and add tracking, then put the game in front of a small group for a few weeks. Combat tuned on top of today's numbers would inherit their problems, with no data to show it.
- **Grow the item list with combat, not before it.** Most new items should be combat consumables and gear. Give existing items more uses first.
- **Track in two layers.** The design-time model (built) shows what the rules produce. Live data from players, built on a record in the save of where credits and items come from and go, shows what people actually do.
- **UK law is friendlier than it was.** Since 5 February 2026, analytics used only to improve the game don't need opt-in consent, as long as you explain them and offer an easy opt-out. UK GDPR still applies, and so does the ICO's Children's code if children are likely to play.

## The questions

- What other mechanics could the game have? Is combat a good expansion?
- Should any of them be built at this stage?
- How do we measure whether the game is working, and get the data to balance the economy?
- How should the item list grow?

## The game today

A browser idle game in the style of Melvor Idle, set in space. It is a static site with no build step and no server. Saves live in the browser's localStorage and nothing is sent anywhere.

- **12 skills**, levels 1 to 99. Gathering: Mining, Gas Harvesting, Salvaging, Exploration and Xenobiology. Production: Refining, Fabrication, Chemistry and Engineering. Operations: Trading, Research and Piloting, which is passive and earns 25% of all ship-skill XP.
- **One action at a time.** Xenobiology bays grow alongside it on real time.
- **Offline progress** replays up to 24 hours through the same engine as live play.
- **12 ships**, 10 bought and 2 built with Engineering, each with bonuses and module slots. Modules come in grades E to A.
- **171 items**, a cargo hold with one slot per item type, a market, a Tech Lab, 12 companions, mastery for every action and 65 achievements.
- The README sells the game with "Everything is non-combat", and the last change removed third-party names ahead of monetisation.

## How the numbers were worked out

The model runs every action through the real engine at two setups.

| Setup | Skill level | Mastery | Ship and modules | Everything else |
| --- | --- | --- | --- | --- |
| Typical | The action's own level | 40, empty pool | The specialist ship a player could fly at that level (Piloting 5 below the skill). Module grade by level: E below 20, D from 20, C from 40, B from 60, A from 80 | No tech, companions or boosters |
| Endgame | 99 | 99, full pool | The best ship for the job, A-grade modules including the utility slots | Every tech at rank 5, every companion, no boosters |

While an action is measured, skill XP, Piloting and mastery are put back after every completion, so the rates don't drift. Gathering actions run for 12 simulated hours, crafting for 2 and trading for 1.

**Why mastery 40.** Mastery climbs quickly. From a standing start, one hour on an action gets you to these levels, and a single 24-hour offline session gets you to the 80s or 90s.

| Skill | Action | After 1 hour | After 24 hours |
| --- | --- | ---: | ---: |
| Mining | Ferrite Asteroid | 44 | 86 |
| Gas Harvesting | Hydrogen Cloud | 42 | 84 |
| Salvaging | Drifting Escape Pod | 40 | 83 |
| Exploration | Local Cluster | 38 | 82 |
| Refining | Iron Ingot | 45 | 86 |
| Fabrication | Hull Plate | 51 | 91 |
| Chemistry | Hydrogen Fuel Cell | 51 | 91 |
| Engineering | Mining Laser E | 66 | 99 |
| Trading | Ore Shuttle | 48 | 89 |
| Research | Stellar Spectra | 42 | 84 |

Measuring at mastery 1 would badly understate Mining, where mastery adds asteroid integrity, and Salvaging, where it adds Finesse. Mastery 40 is roughly where a player is after an hour.

**Effort.** Production needs inputs. Figures "per effort hour" divide by the real time an hour of the action costs: the time to make its inputs at the same setup, or the time spent waiting for the hydroponics bays you can own at that level to grow its crops, whichever is longer. Seeds bought at the market count as free.

**Limits.**

- It models the rules, not players. The typical setup is a reasonable guess, and live data should replace it.
- Rare drops are costed as if you farmed them on purpose, ignoring whatever else the action gives.
- Boosters aren't applied to any measurement.
- Xenobiology assumes every bay is replanted the moment it is ready.

## What the model found

### Gathering skills side by side

Typical setup. The actions are the first, a level 40 and a top-tier one in each skill: Ferrite, Rutile and Collapsed Star Fragment for Mining; Hydrogen, Argon and Exotic Matter Haze for Gas; Drifting Escape Pod, Freighter Hulk and Precursor Ruins (level 88) for Salvaging; Local Cluster, Nebula Expanse and Andromeda Approach for Exploration.

XP per hour:

| Level | Mining | Gas Harvesting | Salvaging | Exploration |
| --- | ---: | ---: | ---: | ---: |
| 1 | 8,608 | 12,644 | 6,006 | 11,625 |
| 40 | 44,747 | 26,432 | 38,382 | 39,572 |
| 88 to 90 | 161,495 | 60,212 | 63,210 | 119,268 |

Credits per hour, counting credits picked up and selling everything else at the market:

| Level | Mining | Gas Harvesting | Salvaging | Exploration |
| --- | ---: | ---: | ---: | ---: |
| 1 | 4,196 | 1,395 | 14,453 | 44,810 |
| 40 | 25,271 | 9,037 | 193,280 | 81,021 (67,737 after fuel) |
| 88 to 90 | 261,488 | 35,596 | 814,106 | 273,214 (a loss after fuel) |

### Time to 99

Always doing the best XP/h action available at your level, typical setup.

| Skill | Action time only | Including making the inputs |
| --- | ---: | ---: |
| Mining | 94 hours | 94 hours |
| Gas Harvesting | 247 hours | 247 hours |
| Salvaging | 221 hours | 221 hours |
| Exploration | 134 hours | 897 hours |
| Refining | 93 hours | 517 hours |
| Fabrication | 53 hours | 801 hours |
| Chemistry | 58 hours | 1,470 hours |
| Engineering | 40 hours | 1,713 hours |
| Trading | 174 hours | 13,909 hours |
| Research | 87 hours | 729 hours |
| Xenobiology | 1,272 hours of real time, replanting every bay the moment it is ready with 5 Nutrient Gel per crop | |

### Problems, most important first

**1. Salvaging out-earns everything from level 18 onwards.** At level 40 the Freighter Hulk makes 7.6 times as much as mining Rutile and 21 times as much as harvesting Argon. Near level 90 Precursor Ruins make 3.1 times as much as the best Mining and 23 times as much as the best Gas Harvesting. Salvaging leads the earnings at every stage from level 18 to 99. If Salvaging is meant to be the money skill that's fine, but the gap is far too wide.

**2. Gathering skills take very different times to 99.** Mining takes 94 hours and Gas Harvesting 247, so Gas is 2.6 times slower and also pays the least.

**3. Trading XP ignores how much you sell.** A run pays the same XP for 6 units or 384, so the smallest hold gives the most XP per item. On the Metals Contract, with no cargo racks fitted:

| Ship | Hold | XP per run | XP per ingot |
| --- | ---: | ---: | ---: |
| Wayfarer | 6t | 15 | 2.50 |
| Sparrow Mk I | 8t | 15 | 1.88 |
| Mule | 32t | 15 | 0.47 |
| Atlas Heavy Hauler | 128t | 15 | 0.12 |
| Andromeda | 256t | 15 | 0.06 |

The best ship for Trading XP is the exploration scout. Counting the time to make the goods, Trading to 99 takes about 13,900 hours, against 500 to 1,700 for the other production skills.

**4. The farm can't feed Chemistry.** Chemistry's two-second recipes eat crops far faster than bays grow them:

| Action | Level | Bays needed for an hour | Bays you can own at that level |
| --- | ---: | ---: | ---: |
| Nutrient Gel, Laser Coolant | 4 to 6 | 41 | 3 |
| Growth Hormone | 40 | 233 | 7 |
| Overclock Serum | 75 | 943 | 10 |
| Mastery Tonic | 90 | 2,361 | 12 |
| Agricultural Supply (trade route) | 30 | 961 | 6 |
| Medical Supplies (trade route) | 58 | 10,639 | 8 |
| Xenobotany (Research) | 30 | 310 | 6 |

Players will train Chemistry on fuel instead. Keeping a booster running is a lighter load, but from level 35 onwards every crop-based booster needs more bays to run full-time than you can own at its level. At 1,200 actions an hour, Laser Coolant needs 1.2 bays, Cartographer's Stim 7.2 (6 owned), Overclock Serum 29 (10 owned) and Mastery Tonic 72 (12 owned).

**5. The best Exploration region for finds is the first one.** Every region shares one table of notable finds, so the free, fast Local Cluster earns 44,810 CR/h at level 1, ten times Mining, and is still a top-five earner at level 55. Deeper regions burn fuel for little extra:

| Region | Level | Finds per scan | Data per scan | Fuel per scan |
| --- | ---: | ---: | ---: | ---: |
| Local Cluster | 1 | 42 CR | 4 CR | 0 CR |
| Nebula Expanse | 40 | 76 CR | 24 CR | 17 CR |
| Galactic Core | 78 | 189 CR | 70 CR | 95 CR |
| Andromeda Approach | 90 | 202 CR | 160 CR | 470 CR |

Andromeda Approach spends 470 CR of fuel per scan to bring back 362 CR of finds and data.

**6. Credits run out of uses.** Every one-off purchase in the game adds up to 282 million CR:

| What you buy | Credits |
| --- | ---: |
| Every buyable ship | 6,655,000 |
| All 120 cargo expansions | 252,481,886 |
| The whole Tech Lab (plus 33,000 Research Points) | 13,200,000 |
| Every hydroponics bay | 9,710,000 |
| Total | 282,046,886 |

At endgame rates (Precursor Ruins, about 1.9 million CR/h) that's paid off in roughly 145 hours of play, and then nothing recurring is worth buying. Achievements alone pay out 12.3 million CR.

**7. Mastery comes very fast.** See the table in section 4: the 80s or 90s after one 24-hour session on any action. Engineering earns mastery XP 5.6 times faster than Research (403,231 against 72,089 an hour) because the formula scales with the number of actions in a skill, and Engineering has 56 recipes, most of them generated from tables. It reaches mastery 99 in a single day. Long-term mastery goals disappear early.

**8. The big builds are cheap in materials.** The Andromeda hull costs about 13 hours of action time from scratch at typical rates (2.6 at endgame rates), 10.5 of them on gravitic stabilisers, really the grandidierite gem inside them. The level requirement is the only real gate.

**9. Crops wait for you.** Ready crops sit until harvested by hand, and offline catch-up doesn't harvest them. 99 Xenobiology takes about 1,272 hours of real time even with perfect check-ins. That can be a deliberate check-in mechanic, but it should be a choice. An auto-harvest upgrade would also make a good credit sink.

**10. Salvage failure only matters at the top.** A failed attempt costs a 3 second reboot:

| Wreck | Level | Success at mastery 1 | At mastery 40 | Endgame |
| --- | ---: | ---: | ---: | ---: |
| Drifting Escape Pod | 1 | 100% | 100% | 100% |
| Scout Hull Wreck | 18 | 81% | 100% | 100% |
| Freighter Hulk | 40 | 80% | 96% | 100% |
| Generation Ship Remains | 64 | 66% | 78% | 100% |
| Precursor Ruins | 88 | 54% | 62% | 82% |

### What's in good shape

- No market arbitrage: nothing in the shop can be sold back or traded for more than it costs.
- Every item has a source, and only 8 of 171 are sell-only.
- Containers are worth opening: Sealed Cargo Containers sell for 25 CR and hold 46.5 CR on average, Spore Clusters 5 CR against 14.3.
- XP/h rises with level inside every skill, apart from small dips: Refurbish Circuitry (an alternative recipe) and a few Engineering modules that pay 4% to 8% less than one unlocked a few levels earlier.

## Should combat be built now?

Design it now, build it after phases 0 and 1 in section 11.

For it:

- It fixes the biggest structural gap: steady demand for goods and credits.
- It gives ships a job beyond stat bonuses, and gives the flagship a reason to exist.
- The engine can take it. `advance(ms)` is deterministic in time, so combat can run offline through the same code as live play, like every other skill.

Against doing it yet:

- It's the largest system you'd add (stats, enemies, gear, consumables, a defeat rule, offline handling) and the hardest to balance. Without player data you'd be tuning blind.
- It would sit on top of problems 1 to 6. If Salvaging still prints money, combat rewards get tuned against the wrong baseline.
- The README promises "Everything is non-combat". Some players will choose the game for that, so keep combat optional for the main goal of building the Andromeda, at least to begin with.
- New skills touch the rank ladder, achievements, the stats page and every save. Not difficult, but it needs care (see "Fitting it into the code" below).

If the business model ends up like Melvor's (a free base game with a paid full version or paid expansions), combat is a natural paid expansion. Decide that before building, because it changes what has to be in the free game.

## A combat design sketch

Built around what the game already has: ships and modules. Everything here is a starting point to test in the model, not a final design.

**Ship combat stats.** Hull (health), Shields (recharge between hits), Armour (damage reduction) and Evasion (light hulls dodge, heavy hulls soak). Every existing ship gets a profile, and 2 to 4 combat hulls join them: a corvette, a gunship, a destroyer.

**New module slots.** Weapon hardpoints, a shield generator and armour plating, graded E to A like the current lines.

**A three-way damage triangle.**

| Weapon | Damage type | Strong against | Enemy type it beats |
| --- | --- | --- | --- |
| Railgun | Kinetic | Shields | Shielded drones |
| Laser | Thermal | Armour | Armoured gunships |
| Missile launcher | Explosive | Small, evasive craft | Fast fighters |

Choosing the right weapons for an area is the main decision, and once made it stays made, which suits idle play.

**Two new skills, not seven.** Gunnery (offence, XP from damage dealt) and Damage Control (defence and repairs, XP from damage taken and repaired). Piloting takes its usual 25% share. A Bounty Hunting skill, with assigned kill contracts paying a token currency like Melvor's Slayer, can follow later.

**Consumables are the point.** Five tiers of each, made from the matching tiers of ore, gas, gem and crop, so every gathering tier gets steady demand. An example mapping:

| Tier | Levels | Railgun slugs (Fabrication) | Missiles (Engineering) | Laser charges (Chemistry) | Hull patch kits (Fabrication) | Shield cells (Chemistry) |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 1 to 19 | Iron Ingot | Hull Plate, Hydrogen | Silica Glass, Helium | Hull Plate | Luminous Moss, Hydrogen |
| 2 | 20 to 39 | Steel Ingot | Alloy Frame, Methane | Alexandrite, Ammonia | Steel Girder | Starbloom, Ammonia |
| 3 | 40 to 59 | Titanium Ingot | Titanium Plating, Argon | Benitoite, Neon | Titanium Plating | Ember Leaf, Argon |
| 4 | 60 to 79 | Iridium Ingot | Plasma Conduit, Xenon | Grandidierite, Tritium | Military Grade Alloy | Psionic Orchid, Tritium |
| 5 | 80 to 99 | Neutronium Plate | Gravitic Stabiliser, Helium-3 | Painite, Exotic Matter | Neutronium Plate | Celestial Truffle, Exotic Matter |

Shield cells add to crop demand, so fix problem 4 first.

**Auto-repair instead of auto-eat.** Patch kits are used automatically when hull falls below a threshold. Better thresholds are credit upgrades, as Auto Eat is in Melvor, which gives credits a recurring use.

**Retreat, don't die.** At zero hull the ship limps home, combat stops, and repairs cost credits and parts. Melvor takes a random equipped item when you die, which is harsh in an idle game where defeat often happens offline. A hardcore mode can come later.

**Areas and strongholds.**

| Area | Levels | Enemies | Drops |
| --- | --- | --- | --- |
| Belt Raiders | 1 to 20 | Raider skiffs (fast), raider gunboats (armoured), rogue mining drones (shielded) | Scrap Metal, ingots, Sealed Cargo Containers |
| Derelict Defence Grid | 20 to 40 | Sentry drones (shielded), turret platforms (armoured) | Damaged Circuitry, Data Cores, circuit boards |
| Xeno Swarm Nebula | 40 to 60 | Swarmers (fast), brood carriers (armoured) | Alien Biostructure, rare seeds |
| Precursor Guardians | 60 to 80 | Wardens (shielded), constructs (armoured) | Ancient Relics, Precursor Cores |
| Andromeda Vanguard | 80 to 99 | Mixed fleets | Exotic Matter, blueprints, flagship parts |

Each area gets a stronghold: a fixed run of fights ending in a boss with unique drops, such as ship and module blueprints. Unlocks follow combat level and ship class.

**Drop goods, not credits.** Credits are already over-supplied. Drop alloys, cores, research salvage, blueprints and faction tokens.

**Starting formulas.**

- Hit chance: accuracy divided by (accuracy plus evasion), kept between 10% and 95%.
- Damage: 60% to 100% of max hit, times 1.25 against the type your weapon beats, 0.75 against the type it loses to.
- Shields take damage first and recharge at a set rate per second. Armour then cuts hull damage by a percentage, capped at 75%.
- Auto-repair uses a patch kit below 40% hull, rising to 60% and 80% with upgrades.

**Fitting it into the code.**

- Add a `combat` handler beside gather, salvage, explore, craft and trade, with its own event loop inside `advance()` (your shots, the enemy's shots and shield recharge, in time order), so offline catch-up replays it like everything else. At about two events a second, a 30-minute catch-up chunk is roughly 3,600 events, well inside the loop's 500,000-step guard.
- Put enemies, areas and strongholds in a new `js/data/combat.js`, and the weapon, shield and armour lines in `js/data/items.js` beside the existing module lines.
- Mark the new skills `ship: true`, so Piloting gets its share and the Piloting speed bonus applies.
- Bump `SAVE_VERSION` in `js/game/state.js`. `migrate()` already fills in missing skills from the defaults.
- Add a combat group to `SKILL_GROUPS` so the sidebar shows the new skills.
- Extend `RANKS` in `js/data/profile.js`, which tops out at 1188 (12 skills × 99).
- Watch the "Elite" achievement. Its id is built from the skill count (`total_1188` today), so adding skills creates a new id and leaves the old one in existing saves. The Bridge counts stored ids against the length of the achievement list, so its total would come out wrong. Count only ids that are still in `ACHIEVEMENT_MAP`.
- Add the new pages to the smoke test's route list and the new files to the cache list in `sw.js`. Both lists are written out by hand.
- Add combat results (kills, retreats, consumables used) to the offline report.
- Extend the economy model to report time to kill, consumables per hour and profit per hour for every area.

**A first slice to release.** One area (Belt Raiders), three enemies, one weapon line (railguns E to C), tier 1 and 2 slugs and patch kits, Gunnery and Damage Control up to about 40, retreat and the first auto-repair upgrade. Release it to the soft-launch group, measure, then widen.

## Other mechanics

| Mechanic | What it does | What it fixes | Effort | When |
| --- | --- | --- | --- | --- |
| Contracts board | Timed orders, e.g. deliver 200 Steel Girders for credits and reputation | Item sinks, gives direction, uses mid-tier goods | Small | Phase 2 |
| Collection log | Every item found, by category, with rewards for completing sets | Retention, supports the item expansion | Small | Phase 2 |
| Hydroponics automation | A credit upgrade that harvests and replants while you're away | Problem 9, adds a credit sink | Small | Phase 2 |
| Faction reputation | Standing with 3 or 4 factions unlocks shop stock, routes and ships | Gives contracts and combat a longer purpose | Medium | With combat |
| Outposts | Settle discovered Earth-like worlds; they consume goods every hour for passive bonuses | A large recurring sink for every production skill | Large | After combat |
| Dynamic market | Prices dip when you dump goods and recover over time | Stops single-item dumping, makes routes a choice | Medium | Later |
| Drone bay | A second, slower gathering action beside the main one | A big late-game goal | Medium to build, but it doubles output, so everything needs rebalancing | Late, carefully |
| Random encounters | Distress beacons and storms during actions | Something for active players | Medium | Optional |
| Prestige | Reset for permanent bonuses | Long-term goals | Large, and it changes the game's identity | Not recommended. An Andromeda galaxy expansion with new levels, like Melvor's Abyssal levels, does the same job without a reset |

## Growing the item list

**Today.** 171 items: 54 module grades, 17 components, 13 boosters, 12 ores, 11 refined materials, 10 each of gases, salvage, seeds, crops and exploration data, 6 gems, 4 fuels, 2 containers, 1 supply and Research Points. The module grades are generated from tables, and every module line uses the same grade kit plus one signature part, so building any C-grade module draws on the same pool. Most items have exactly one use. Eight are sell-only: Painite (the rarest gem), Personal Effects, Occupied Escape Pods and the five survey types.

**Principles.**

1. **Every item needs a source and a use besides selling**, unless it's a deliberate trophy. The model already reports this. Turn it into a test so a data change can't quietly break it.
2. **Add uses before adding items.** Painite into top-tier laser charges. Personal Effects and Occupied Escape Pods into contracts or crew. Survey data into outposts or star charts.
3. **Generate tiers from tables**, as `MODULE_LINES` already does, so new families stay consistent. Set sell prices from input cost, meaning the value of the inputs plus a markup for the action time spent, rather than picking them by hand.
4. **Give modules trade-offs, not just grades.** For example a Rapid and a Precise mining laser at the same grade, plus rare named prototypes from salvage, combat and strongholds. Avoid random stat rolls: the hold is one slot per item type, and rolled items would flood it.
5. **Watch hold pressure.** Every new item type takes a slot. Some pressure is healthy, because cargo expansions are the main credit sink, but add sorting and "sell all in this category" before it gets annoying.

**What the combat expansion adds.**

| Family | Items | Made by |
| --- | ---: | --- |
| Weapon modules: railgun, laser and missile launcher, E to A | 15 | Engineering |
| Shield generators and armour plating, E to A | 10 | Engineering |
| Slugs, missiles and laser charges, 5 tiers each | 15 | Fabrication, Engineering, Chemistry |
| Hull patch kits and shield cells, 5 tiers each | 10 | Fabrication, Chemistry |
| Enemy drops and materials | about 20 | Combat |
| Faction or bounty tokens | 3 to 5 | Combat |
| Blueprints and named prototypes | 10 to 20 | Strongholds, salvage |

Roughly 90 to 100 items, taking the game to about 260 to 270, plus 2 to 4 combat hulls. Count decisions rather than items.

## Tracking the game

### Layer 1: the design-time model (built)

`npm run economy` drives the real engine and reports:

- XP/h, credits/h and value after inputs for every action, at the typical and endgame setups
- time to 99 for every skill, with and without the time to make the inputs
- the best earners at each stage of the game
- trade routes against just selling the same goods
- build costs and the rare inputs that dominate them
- crop demand against the bays you can own, for recipes and for keeping boosters running
- salvage success, mastery speed, and Trading XP by route and by ship
- credit sinks, market arbitrage and container values
- items with no source or no use

Still to add: CI checks for hard rules (no arbitrage, no unsourced items, XP/h never falls within a skill, gathering skills within an agreed ratio of each other), and a combat section once combat exists.

### Layer 2: live data from players

The model says what the rules produce. Only players show what people actually do: which actions they sit on, where they stop playing and whether credits pile up.

**A ledger in the save.** Keep running totals in the save, by day, of where credits and items come from and go, and where time goes. It costs almost nothing, works offline, can power a better Statistics page, and becomes the telemetry payload. Where to hook it in:

- **Credits in.** `bank.addCredits(n, source)` already receives a source from all four places that pay out: salvage, trade runs, market sales and achievements.
- **Credits out.** `bank.spendCredits(n)` has no reason. It is called from five places: ships (`hangar.js`), hydroponics bays (`farming.js`), and market purchases, cargo expansions and the Tech Lab (`services.js`). Add a reason argument at each.
- **Items.** `bank.add` already takes an options object (`{ toast }`). Give it and `bank.remove` a `reason`: gathered, crafted, looted, opened, bought, sold, planted, fitted, traded or burned as fuel.
- **Time.** In `advance()`, add each slice of time to the running action's total, split into online and offline (`G.silent` is true during offline catch-up).

**One small summary a day.** Not a stream of events. Sent when the game is open and the day has rolled over, held in the save if the player is offline, and never sent if they have opted out. Something like:

```json
{
  "v": 1,
  "install": "lq3k9x2a7f",
  "day": 12,
  "levels": { "mining": 54, "gas": 31, "salvaging": 47 },
  "creditsIn": { "salvage": 180000, "trade": 22000, "sale": 9000 },
  "creditsOut": { "ship": 95000, "cargo": 12000, "market": 3400 },
  "balance": 412000,
  "minutes": { "salvaging.freighter": 310, "mining.rutile": 95 },
  "offline": { "returns": 2, "capped": 1 },
  "ships": 5,
  "cargo": { "used": 61, "max": 64 }
}
```

`install` is a random id created on first launch and linked to nothing else. Don't send the save itself.

**A handful of milestone events.** First ship bought, each flight plan step completed, total level 100, 300 and 600, first 99, the Andromeda built, plus error reports.

**What to watch.**

| Question | What to measure |
| --- | --- |
| Do people come back? | Day 1, 7 and 30 retention by install week, sessions per day, time between visits |
| Is the 24-hour cap right? | Share of returns that hit the cap |
| Where do people quit? | Level and last action before 7 days of silence, flight plan steps completed |
| Is there a dominant strategy? | Share of time on each action by level band. One action taking most of it is too good |
| Is the economy inflating? | Median and 90th percentile credit balance by days played, and total credits created against total destroyed across all players, the way EVE Online's Monthly Economic Report tracks faucets and sinks |
| Are items pulling their weight? | Created against destroyed for every item, and items nobody makes or uses |
| Is the pacing right? | Hours to first ship, total level 300, first 99 and the Andromeda |
| Does the model match reality? | Real mastery levels, ships and module grades at each skill level, compared with the typical setup |

**What good looks like.** GameAnalytics' 2026 benchmarks (mobile, all genres) put median day 1 retention at 22%, day 7 at just under 4% and day 30 under 1%, with the top quarter of games at 25% to 33% on day 1. Idle games often match or beat RPGs at day 7 and day 30. A web game will differ, so the more useful comparison is your own numbers week on week.

**Where the data goes.** The game is a static site, so it needs somewhere to send data.

| Option | Good for | Weaker at |
| --- | --- | --- |
| Privacy-focused web analytics with custom events (Plausible, Umami) | Quickest to add. Visits, devices, referrers, milestone events | Per-player retention and the daily summary |
| Product analytics (PostHog, which offers EU hosting) | Retention, funnels and cohorts out of the box | More to configure, and the data sits with a third party |
| Your own endpoint, e.g. a small serverless function writing to a database | Full control of the daily summary, and the data stays with you | You build the dashboards |

A sensible start is your own small endpoint for the daily summaries, plus one of the first two for traffic.

### UK rules

**Storage and access (PECR).** Since 5 February 2026, when Schedule 12 of the Data (Use and Access) Act 2025 came into force and amended regulation 6 of PECR, storing or reading information on a player's device for analytics no longer needs opt-in consent, provided that:

- the sole purpose is collecting statistics about how the game is used, in order to improve it
- the information isn't shared, except with a processor helping you improve the game (no advertising use, no tracking across sites or devices)
- players get clear information about it and a simple, free way to object

This covers localStorage as well as cookies. In practice: a short note on the commander creation screen, a "Share anonymous gameplay statistics" switch in Settings that takes effect immediately, the random install id above, and no advertising code touching the same data.

**UK GDPR.** A random install id combined with an IP address is still personal data, so you need a privacy notice, a recorded lawful basis (legitimate interests, with the assessment written down), sensible retention limits and a processor agreement with any analytics provider.

**Children's code.** If children are likely to play, and the ICO treats games as a likely case, its Age Appropriate Design Code applies. It expects settings to be high privacy by default and profiling to be off by default unless you can show a compelling reason. Collecting aggregate statistics only, and keeping per-player detail to a minimum, keeps you on the right side of it.

**Adverts.** If monetisation brings in adverts, the advertising side needs consent, and the Children's code restricts profiling children for them.

This is a summary, not legal advice. Get it checked before launch.

## Suggested order

**Phase 0: fix and instrument**

- Trading XP per tonne sold.
- Exploration finds that improve with depth, and an Andromeda Approach worth its fuel.
- Narrow the gaps between the gathering skills. Decide which is the money skill: it can stay ahead, but by 1.5 to 2 times rather than 3 to 23. Bring Gas up the most.
- More crops per harvest, or fewer crops per recipe, so Chemistry and the top boosters aren't starved by the farm.
- Decide whether mastery should be this fast. If not, slow it, starting with Engineering.
- Uses for Painite and the sell-only salvage items.
- The ledger in the save: reasons on credit spending, items created and destroyed, time per action.
- The model's hard rules as CI checks.

**Phase 1: soft launch with tracking**

- Telemetry with the opt-out switch, a privacy notice and a basic dashboard.
- A few dozen to a few hundred players for 2 to 4 weeks. Watch retention, quit points and how time splits across actions, and check the model's typical setup against reality.

**Phase 2: cheap mechanics that add sinks**

- Contracts board, collection log and hydroponics automation.

**Phase 3: combat**

- A design document first (stats, formulas, areas, consumables), then the model extension, then the first slice described above. Release it to the soft-launch group, measure, then widen.
- The item expansion lands alongside it.

**Phase 4: bigger systems**

- Factions, outposts and perhaps a drone bay, led by what the data says players want.

## Decisions for you

1. **Combat's place.** Optional or required for building the Andromeda? Part of the free game or a paid expansion?
2. **The money skill.** Which gathering skill should earn the most, and by how much?
3. **Xenobiology.** A check-in skill (harvest by hand, as now) or fully idle (an auto-harvest upgrade)?
4. **Mastery pace.** Is reaching the 80s or 90s in one day intended?
5. **Credit sinks.** Are cargo expansions meant to be the long-term sink? Which recurring costs would feel fair: repairs, upkeep, contract fees?
6. **Monetisation.** One-off purchases and expansions, or adverts? Adverts change the consent picture.
7. **Telemetry.** Your own endpoint, a third-party tool, or both?

## Sources

- [Melvor Idle wiki: Food and Auto Eat](https://wiki.melvoridle.com/w/Food)
- [Melvor Idle wiki: Combat](https://wiki.melvoridle.com/w/Combat) and [Combat Guide](https://wiki.melvoridle.com/w/Combat_Guide)
- [Melvor Idle wiki: Offline Progression](https://wiki.melvoridle.com/w/Offline_Progression)
- [Melvor Idle wiki: Atlas of Discovery](https://wiki.melvoridle.com/w/Atlas_of_Discovery_Expansion)
- [Jagex: Atlas of Discovery announcement](https://www.jagex.com/news/melvor-idle-s-new-expansion-atlas-of-discovery-launching-this-september)
- [EVE Online: Monthly Economic Report, March 2026](https://www.eveonline.com/news/view/monthly-economic-report-march-2026)
- [Engadget: EVE Evolved, ISK sinks and faucets](https://www.engadget.com/2010-10-24-eve-evolved-isk-sinks-and-faucets.html)
- [GameAnalytics: 2026 Mobile and PC Gaming Benchmarks](https://www.gameanalytics.com/reports/2026-mobile-pc-gaming-benchmarks)
- [GameDev Reports: summary of the GameAnalytics 2026 benchmarks](https://gamedevreports.substack.com/p/gameanalytics-mobile-and-pc-game)
- [ICO: storage and access technologies, what are the exceptions?](https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guidance-on-the-use-of-storage-and-access-technologies/what-are-the-exceptions/)
- [The Data (Use and Access) Act 2025 (Commencement No. 6) Regulations 2026](https://www.legislation.gov.uk/uksi/2026/82/made)
- [GOV.UK: Data (Use and Access) Act 2025 plans for commencement](https://www.gov.uk/guidance/data-use-and-access-act-2025-plans-for-commencement)
- [ICO: Age appropriate design, a code of practice for online services](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/childrens-information/childrens-code-guidance-and-resources/age-appropriate-design-a-code-of-practice-for-online-services/)
- [ICO: Children's code standard 7, default settings](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/childrens-information/childrens-code-guidance-and-resources/age-appropriate-design-a-code-of-practice-for-online-services/7-default-settings/)
- [ICO: Our work with mobile gaming services](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/childrens-information/childrens-code-guidance-and-resources/children-s-code-strategy-progress-update-august-2026/our-work-with-mobile-gaming-services/)
