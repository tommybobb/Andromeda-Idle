# Expansion plan

What to add next (combat and other mechanics), whether now is the right time, how to grow the item list, and how to measure the game so the economy is balanced from data rather than guesswork.

The numbers come from `tools/economy.mjs`, which drives the real engine. Its full output is in [economy-baseline.md](economy-baseline.md). Run `npm run economy` after any data change and diff it against that file. Runs are seeded, so the only differences you see are the ones your change caused.

## The short answer

- **Combat is the right big expansion.** The game's real gap is item and credit sinks. Almost everything you make is used once or sold, and credits stop mattering after about 145 hours of endgame play. Combat is the system that eats goods every hour.
- **Design it now, build it after two smaller steps.** First fix the balance problems below and add tracking, then put the game in front of a small group for a few weeks. Combat tuned on top of today's numbers would inherit their problems, with no data to show it.
- **Grow the item list as part of combat, not before it.** Most new items should be combat consumables and gear made by the existing production skills. Expanding items first means designing them twice.
- **Track in two layers.** A design-time model (now in the repo) and live data built on a ledger of where credits and items come from and go. Under UK law since 5 February 2026, first-party analytics used only to improve the game no longer need opt-in consent, as long as you explain it and offer an easy opt-out.

## 1. Where the economy stands

Measured at a "typical" setup (skill at the action's level, mastery 40, the ship and module grade a player would plausibly have at that level) and at a maxed endgame setup.

### Problems, most important first

1. **Salvaging out-earns everything from level 18 onwards.** At level 40 the Freighter Hulk makes 193,000 CR/h, against 25,000 for Rutile (Mining) and 9,000 for Argon (Gas). Near 90, Precursor Ruins make 814,000 against 261,000 for Mining and 36,000 for Gas. Gas Harvesting is the worst earner at every level. If Salvaging is meant to be the money skill that's fine, but the gap is 3 to 23 times.
2. **Gathering skills take very different times to 99.** Mining 94 hours, Exploration 134, Salvaging 221, Gas Harvesting 247. Gas is 2.6 times slower than Mining and also pays the least.
3. **Trading XP ignores how much you sell.** A run pays the same XP for 6 units or 384. On the Metals Contract the 6-tonne Wayfarer earns 2.5 XP per ingot and the 256-tonne Andromeda earns 0.06, so the best ship for Trading XP is the exploration scout. Counting the time to make the goods, Trading to 99 takes about 13,900 hours, against 500 to 1,700 for the other production skills.
4. **The farm can't feed Chemistry.** A two-second recipe that uses crops needs 41 to 2,380 hydroponics bays to run for an hour, and you can own 3 to 12. Players will train Chemistry on fuel instead. Running a booster full-time is fine for the cheap ones (Laser Coolant needs about 1 bay) but not the top two: Overclock Serum needs 31 bays and Mastery Tonic 78. The Agricultural Supply and Medical Supplies routes and the Xenobotany study have the same problem.
5. **The best region for finds is the first one.** Every Exploration region shares one table of notable finds, so the free, fast Local Cluster earns 45,000 CR/h at level 1 (ten times Mining) and is still a top-five earner at level 55. Deeper regions burn fuel for little extra: Andromeda Approach spends 470 CR of fuel per scan to find 362 CR, a loss.
6. **Credits run out of uses.** One-off purchases total 282 million CR, and 252 million of that is cargo expansions. At endgame rates (about 1.9 million CR/h) the lot is paid off in roughly 145 hours. After that nothing recurring is worth buying. Achievements alone pay out 12.3 million CR.
7. **Mastery comes very fast.** Around level 40 to 50 after an hour on an action, and the 80s after one 24-hour offline session. Engineering's mastery is 5.6 times faster than Research's because the formula scales with the number of actions, and Engineering has 56 generated recipes. Long-term mastery goals disappear early.
8. **The big builds are cheap in materials.** The Andromeda hull costs about 13 hours of action time from scratch at typical rates, 10.5 of them on gravitic stabilisers (really the grandidierite gem in them). The level requirement is the only real gate.
9. **Crops wait for you.** Ready crops sit until harvested by hand, and offline catch-up doesn't harvest them. 99 Xenobiology needs about 1,272 hours of real time even with perfect check-ins. That can be a deliberate check-in mechanic, but it should be a choice. An auto-harvest upgrade would also make a good credit sink.
10. **Salvage failure only matters at the top.** The first four wrecks reach 100% success after about an hour's mastery. Precursor Ruins still fail 38% of the time.

What's in good shape: no market arbitrage, every item has a source, only 8 of 171 items are sell-only, containers are worth opening, and XP/h rises with level inside every skill (two negligible dips in Engineering).

## 2. Should combat be built now?

Design now, build after phases 0 and 1 below.

For it:

- It fixes the biggest structural gap: steady demand for goods and credits.
- It gives ships a job beyond stat bonuses and gives the flagship a reason to exist.
- The engine can take it. `advance(ms)` is deterministic in time, so combat can run offline through the same code as live play, like every other skill.

Against doing it yet:

- It's the largest system you'd add (stats, enemies, gear, consumables, a defeat rule, offline handling) and the hardest to balance. Without player data you'd be tuning blind.
- It would sit on problems 1 to 6. If Salvaging still prints money, combat rewards get tuned against the wrong baseline.
- The README sells the game with "Everything is non-combat". Some players will choose it for that. Keep combat optional for the main goal (building the Andromeda), at least to begin with.
- New skills touch the rank ladder (`RANKS` tops out at 12 × 99 = 1188), total-level achievements, the stats page and every save. Not difficult, but it wants a save version bump and tests.

If the business model ends up like Melvor's (free base game, paid full version or expansions), combat is a natural paid expansion. Decide that before building, because it changes what has to be in the free game.

## 3. A combat sketch for this game

Built around what already exists: ships and modules.

- **Ship combat stats.** Hull (health), Shields (recharge between hits), Armour (damage reduction) and Evasion (light hulls dodge, heavy hulls soak). Every existing ship gets a profile, plus 2 to 4 combat hulls (corvette, gunship, destroyer).
- **New module slots.** Weapon hardpoints, a shield generator and armour plating, graded E to A like the current lines.
- **A three-way damage triangle.** Railguns (kinetic, strong against shields), lasers (thermal, strong against armour) and missiles (explosive, strong against small, evasive craft). Enemy types match: shielded drones, armoured gunships, fast fighters. Picking the right weapons for an area is the main decision, and it's set-and-forget, which suits idle play.
- **Two new skills, not seven.** Gunnery (offence, XP from damage dealt) and Damage Control (defence and repairs, XP from damage taken and repaired). Piloting takes its usual 25% share. A Bounty Hunting skill (assigned kill contracts paying a token currency, like Melvor's Slayer) can follow later.
- **Consumables are the point.** Ammunition for railguns and missiles (Fabrication from ingots, Engineering for missiles), laser charges (Chemistry from gases and crystals), hull patch kits (Fabrication) and shield cells (Chemistry). Five tiers each, made from the matching ore, gas and crop tiers, so every gathering tier gets ongoing demand.
- **Auto-repair instead of auto-eat.** Patch kits are used automatically below a hull threshold. Better thresholds are credit upgrades, as Auto Eat is in Melvor.
- **Retreat, don't die.** At zero hull the ship limps home, combat stops, and repairs cost credits and parts. Melvor takes a random equipped item when you die, which is harsh in an idle game where defeat often happens offline. A hardcore mode can come later.
- **Areas and strongholds.** Pirate-held belts, derelict defence drones, xeno swarms, precursor guardians and an Andromeda vanguard. Strongholds are fixed sequences ending in a boss with unique drops (ship and module blueprints). Unlocks follow combat level and ship class.
- **Drop goods, not credits.** Credits are already over-supplied. Drop alloys, cores, research salvage, blueprints and faction tokens.
- **Engine fit.** A `combat` handler with two timers (yours and the enemy's) inside the existing loop, and a `js/data/combat.js` for enemies and areas. Extend the economy model to report time to kill, consumables per hour and profit per hour for every area before shipping it.

## 4. Other mechanics

| Mechanic | What it does | What it fixes | Effort | When |
| --- | --- | --- | --- | --- |
| Contracts board | Timed orders, e.g. deliver 200 Steel Girders for credits and reputation | Item sinks, gives direction, uses mid-tier goods | Small | Phase 2 |
| Collection log | Every item found, by category, with rewards for completing sets | Retention, supports the item expansion | Small | Phase 2 |
| Hydroponics automation | Credit upgrade that harvests and replants while you're away | Problem 9, adds a credit sink | Small | Phase 2 |
| Faction reputation | Standing with 3 or 4 factions unlocks shop stock, routes and ships | Gives contracts and combat a longer purpose | Medium | With combat |
| Outposts | Settle discovered Earth-like worlds; they consume goods every hour for passive bonuses | A large recurring sink for every production skill | Large | After combat |
| Dynamic market | Prices dip when you dump goods and recover over time | Stops single-item dumping, makes routes a choice | Medium | Later |
| Drone bay | A second, slower gathering action beside the main one | A big late-game goal | Medium to build, but it doubles output, so everything needs rebalancing | Late, carefully |
| Random encounters | Distress beacons and storms during actions | Something for active players | Medium | Optional |
| Prestige | Reset for permanent bonuses | Long tail | Large, and it changes the game's identity | Not recommended. An Andromeda galaxy expansion with new levels (like Melvor's Abyssal levels) does the same job without a reset |

## 5. Growing the item list

Today there are 171 items. 54 of them are module grades generated from tables, and every module line uses the same grade kit plus one signature part, so building any C-grade module draws on the same pool. 8 items are sell-only, including Painite, the rarest gem. Most items have exactly one use.

Principles:

1. **Every item needs a source and a use besides selling**, unless it's a deliberate trophy. The model already reports this. Turn it into a test so a data change can't quietly break it.
2. **Add uses before adding items.** Painite into top-tier weapon crystals. Personal Effects and Occupied Escape Pods into contracts or crew. Survey data into outposts or star charts.
3. **Generate tiers from tables**, as `MODULE_LINES` already does, so new families stay consistent. Set sell prices from input cost (the value of the inputs plus a markup for the action time spent) rather than picking them by hand.
4. **Give modules trade-offs, not just grades.** For example a Rapid and a Precise mining laser at the same grade, plus rare named prototypes from salvage, combat and strongholds. Avoid random stat rolls: the hold is one slot per item type, and rolled items would flood it.
5. **Watch hold pressure.** Every new item type takes a slot. Some pressure is healthy because cargo expansions are the main credit sink, but add sorting and "sell all in this category" before it gets annoying.

Rough size for the combat expansion: three weapon lines plus shield and armour lines at five grades (25 modules), ammunition and repair consumables (about 25), enemy drops, tokens and materials (about 25), blueprints and prototypes (10 to 20) and 2 to 4 hulls. Roughly 90 to 100 items, taking the game to about 270. Count decisions rather than items.

## 6. Tracking

### Layer 1: the design-time model (built)

`npm run economy` drives the real engine with fixed setups and reports:

- XP/h, credits/h and value net of inputs for every action, at typical and endgame setups
- time to 99 for every skill, with and without the time to make the inputs
- the best earners at each stage, counting the time to make inputs or wait for crops
- trade routes against just selling the same goods
- build costs and the rare inputs that dominate them
- crop demand against the bays you can own
- credit sinks, market arbitrage and container values
- items with no source or no use

Next for the model: CI checks for hard rules (no arbitrage, no unsourced items, XP/h never falls within a skill, gathering skills within an agreed ratio of each other), and a combat section once combat exists.

### Layer 2: live data from players

The model says what the numbers are. Only players show what people actually do: which actions they sit on, where they stop playing, and whether credits pile up.

**Start with a ledger in the save.** Most credit income is already tagged (`addCredits(n, 'salvage')`), but spending has no reason attached. Add a reason to every `spendCredits` call and keep running totals of credits by source and sink, items created and destroyed by reason, and time spent per action, online and offline. It costs almost nothing, works offline, can power a better Statistics page, and becomes the telemetry payload.

**Send one small summary a day, not a stream of events.** Per player per day: days since install, levels, credits earned by source and spent by sink, credit balance, hours per skill and top actions, ships owned, cargo slots used, offline returns and whether they hit the 24-hour cap. Add a handful of milestone events (first ship bought, first 99, Andromeda built) and error reports.

| Question | What to measure |
| --- | --- |
| Do people come back? | Day 1, 7 and 30 retention by install week, sessions per day, time between visits |
| Is the 24-hour cap right? | Share of returns that hit the cap |
| Where do people quit? | Level and last action before 7 days of silence, flight plan steps completed |
| Is there a dominant strategy? | Share of time on each action by level band. One action taking most of it is too good |
| Is the economy inflating? | Median and 90th percentile credit balance by days played, and total faucets against total sinks across all players (the way EVE Online's Monthly Economic Report does it) |
| Are items pulling their weight? | Created against destroyed for every item, and items nobody makes or uses |
| Is the pacing right? | Hours to first ship, total level 300, first 99 and the Andromeda |

For a rough idea of "good": GameAnalytics' 2026 benchmarks (mobile, all genres) put median day 1 retention at 22% and day 7 at just under 4%, with the top quarter of games at 25% to 33% on day 1. Idle games hold up better than most at day 7 and day 30. A web game will differ, so the more useful comparison is your own numbers week on week.

**Where the data goes.** The game is a static site, so it needs somewhere to send data:

- **Privacy-focused web analytics with custom events** (Plausible, Umami). Quickest to add. Good for visits and milestone events, weaker for per-player retention.
- **Product analytics** (PostHog, which offers EU hosting). Retention, funnels and cohorts out of the box.
- **Your own endpoint**, for example a small serverless function writing to a database. Most control over the daily summary, and the data stays with you.

A sensible start is your own small endpoint for the daily summaries, plus one of the first two for traffic.

### UK rules

Since 5 February 2026 (the Data (Use and Access) Act 2025, Schedule 12, amending regulation 6 of PECR), storing or reading information on a player's device for analytics no longer needs opt-in consent, provided that:

- the sole purpose is collecting statistics about how the game is used, in order to improve it
- the information isn't shared, except with a processor helping you improve the game (no advertising use, no tracking across sites or devices)
- players get clear information about it and a simple, free way to object

This covers localStorage as well as cookies. In practice that means a short note on the commander creation screen, a "Share anonymous gameplay statistics" switch in Settings that takes effect immediately, a random install ID that isn't linked to anything else, and no advertising code touching the same data. UK GDPR still applies on top: a privacy notice, a recorded lawful basis (legitimate interests), sensible retention limits and a processor agreement with any analytics provider. If monetisation brings in adverts, those need consent. This is a summary rather than legal advice, so get it checked before launch.

## 7. Suggested order

**Phase 0: fix and instrument**

- Trading XP per tonne sold.
- Exploration finds that improve with depth, and an Andromeda Approach worth its fuel.
- Narrow the gaps between gathering skills. Decide which skill is the money skill; it can stay ahead, but by 1.5 to 2 times rather than 3 to 23. Bring Gas up the most.
- More crops per harvest or fewer crops per recipe, so Chemistry and the top boosters aren't starved by the farm.
- Uses for Painite and the sell-only salvage items.
- The ledger in the save: reasons on credit spending, items created and destroyed, time per action.
- The model's hard rules as CI checks.

**Phase 1: soft launch with tracking (2 to 4 weeks of data)**

- Telemetry with the opt-out switch, a privacy notice and a basic dashboard.
- A few dozen to a few hundred players. Watch retention, quit points and how time splits across actions.

**Phase 2: cheap mechanics that add sinks**

- Contracts board, collection log, hydroponics automation.

**Phase 3: combat**

- A design document first (stats, formulas, areas, consumables), then the model extension, then a first slice: one area, three enemies, one weapon line, ammunition and patch kits. Release it to the soft-launch group, measure, then widen.
- The item expansion lands alongside it.

**Phase 4: bigger systems**

- Factions, outposts and perhaps a drone bay, led by what the data says players want.

## Sources

- [Melvor Idle wiki: Food and Auto Eat](https://wiki.melvoridle.com/w/Food)
- [Melvor Idle wiki: Combat](https://wiki.melvoridle.com/w/Combat) and [Combat Guide](https://wiki.melvoridle.com/w/Combat_Guide)
- [Melvor Idle wiki: Offline Progression](https://wiki.melvoridle.com/w/Offline_Progression)
- [Jagex: Atlas of Discovery expansion](https://www.jagex.com/news/melvor-idle-s-new-expansion-atlas-of-discovery-launching-this-september)
- [Melvor Idle wiki: Atlas of Discovery](https://wiki.melvoridle.com/w/Atlas_of_Discovery_Expansion)
- [EVE Online: Monthly Economic Report, March 2026](https://www.eveonline.com/news/view/monthly-economic-report-march-2026)
- [Engadget: EVE Evolved, ISK sinks and faucets](https://www.engadget.com/2010-10-24-eve-evolved-isk-sinks-and-faucets.html)
- [GameAnalytics: 2026 Mobile and PC Gaming Benchmarks](https://www.gameanalytics.com/reports/2026-mobile-pc-gaming-benchmarks)
- [GameDev Reports: summary of the GameAnalytics 2026 benchmarks](https://gamedevreports.substack.com/p/gameanalytics-mobile-and-pc-game)
- [ICO: storage and access technologies, what are the exceptions?](https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guidance-on-the-use-of-storage-and-access-technologies/what-are-the-exceptions/)
- [The Data (Use and Access) Act 2025 (Commencement No. 6) Regulations 2026](https://www.legislation.gov.uk/uksi/2026/82/made)
- [GOV.UK: Data (Use and Access) Act 2025 plans for commencement](https://www.gov.uk/guidance/data-use-and-access-act-2025-plans-for-commencement)
