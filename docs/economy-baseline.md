# Andromeda Idle economy model

Simulated hours per action: gather 12, salvage 12, explore 12, craft 2, trade 1. Run `npm run economy` to regenerate.
Typical setup: skill at the action's level, mastery 40, specialist ship and module grade for that level. Endgame: everything maxed.
"Effort" rates divide by the real time an hour of the action costs: making its inputs at the same setup, or waiting for the hydroponics bays you can own at that level to grow its crops, whichever is longer.

## Every action

### Mining

| Action | Lvl | Typical XP/h | XP/h per effort h | Typical CR value/h | Net of inputs | Endgame XP/h | Endgame CR value/h |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Ferrite Asteroid | 1 | 8,608 | 8,608 | 4,196 | 4,196 | 35,089 | 36,365 |
| Silicate Asteroid | 1 | 8,608 | 8,608 | 4,119 | 4,119 | 35,089 | 36,270 |
| Ice Asteroid | 5 | 11,007 | 11,007 | 5,610 | 5,610 | 44,766 | 51,872 |
| Cuprite Asteroid | 10 | 17,853 | 17,853 | 8,403 | 8,403 | 68,572 | 81,579 |
| Bauxite Asteroid | 20 | 24,113 | 24,113 | 13,440 | 13,440 | 86,838 | 125,843 |
| Carbonaceous Asteroid | 30 | 33,460 | 33,460 | 16,391 | 16,391 | 118,810 | 154,225 |
| Rutile Asteroid | 40 | 44,747 | 44,747 | 25,271 | 25,271 | 148,761 | 223,023 |
| Cobaltite Asteroid | 50 | 61,661 | 61,661 | 40,450 | 40,450 | 201,866 | 357,759 |
| Metallic Asteroid | 60 | 77,784 | 77,784 | 67,516 | 67,516 | 238,440 | 550,652 |
| Iridium Asteroid | 70 | 115,385 | 115,385 | 116,063 | 116,063 | 284,108 | 767,033 |
| Osmium Asteroid | 80 | 138,910 | 138,910 | 175,241 | 175,241 | 324,674 | 1,086,559 |
| Collapsed Star Fragment | 90 | 161,495 | 161,495 | 261,488 | 261,488 | 385,747 | 1,662,120 |

### Gas Harvesting

| Action | Lvl | Typical XP/h | XP/h per effort h | Typical CR value/h | Net of inputs | Endgame XP/h | Endgame CR value/h |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Hydrogen Cloud | 1 | 12,644 | 12,644 | 1,395 | 1,395 | 50,318 | 15,936 |
| Helium Envelope | 10 | 14,285 | 14,285 | 3,105 | 3,105 | 53,841 | 34,070 |
| Methane Giant | 20 | 17,897 | 17,897 | 4,533 | 4,533 | 61,373 | 44,071 |
| Ammonia Giant | 30 | 24,386 | 24,386 | 7,203 | 7,203 | 68,442 | 57,822 |
| Argon Haze | 40 | 26,432 | 26,432 | 9,037 | 9,037 | 66,885 | 63,283 |
| Neon Shroud | 50 | 32,167 | 32,167 | 10,917 | 10,917 | 79,179 | 75,017 |
| Xenon Storm | 60 | 39,067 | 39,067 | 14,710 | 14,710 | 87,194 | 89,612 |
| Tritium Ice Giant | 70 | 39,056 | 39,056 | 16,401 | 16,401 | 84,883 | 97,257 |
| Helium-3 Gas Giant | 80 | 51,119 | 51,119 | 24,004 | 24,004 | 100,230 | 123,943 |
| Exotic Matter Haze | 90 | 60,212 | 60,212 | 35,596 | 35,596 | 115,648 | 182,193 |

### Salvaging

| Action | Lvl | Typical XP/h | XP/h per effort h | Typical CR value/h | Net of inputs | Endgame XP/h | Endgame CR value/h |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Drifting Escape Pod | 1 | 6,006 | 6,006 | 14,453 | 14,453 | 10,316 | 25,862 |
| Jettisoned Cargo | 8 | 10,832 | 10,832 | 31,905 | 31,905 | 18,568 | 57,400 |
| Scout Hull Wreck | 18 | 18,236 | 18,236 | 57,543 | 57,543 | 30,947 | 104,178 |
| Abandoned Mining Barge | 28 | 28,371 | 28,371 | 101,292 | 101,292 | 45,389 | 176,033 |
| Freighter Hulk | 40 | 38,382 | 38,382 | 193,280 | 193,280 | 66,020 | 361,997 |
| Abandoned Outpost | 52 | 42,726 | 42,726 | 255,527 | 255,527 | 92,840 | 610,892 |
| Generation Ship Remains | 64 | 50,978 | 50,978 | 411,134 | 411,134 | 123,787 | 1,081,372 |
| Alien Debris Field | 76 | 55,328 | 55,328 | 526,289 | 526,289 | 159,102 | 1,635,550 |
| Precursor Ruins | 88 | 63,210 | 63,210 | 814,106 | 814,106 | 143,157 | 1,944,699 |

### Exploration

| Action | Lvl | Typical XP/h | XP/h per effort h | Typical CR value/h | Net of inputs | Endgame XP/h | Endgame CR value/h |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Local Cluster | 1 | 11,625 | 11,625 | 44,810 | 44,810 | 60,912 | 256,226 |
| Inner Spiral Arm | 12 | 15,600 | 5,463 | 44,758 | 41,822 | 81,216 | 241,977 |
| Outer Spiral Arm | 25 | 27,241 | 9,312 | 58,322 | 55,275 | 108,288 | 222,219 |
| Nebula Expanse | 40 | 39,572 | 8,996 | 81,021 | 67,737 | 139,223 | 251,858 |
| Stellar Nursery | 52 | 47,764 | 11,859 | 79,336 | 67,504 | 164,970 | 226,615 |
| Galactic Core Approach | 65 | 73,327 | 11,751 | 151,191 | 77,061 | 191,760 | 320,644 |
| Galactic Core | 78 | 87,644 | 15,013 | 196,306 | 127,866 | 223,344 | 400,392 |
| Andromeda Approach | 90 | 119,268 | 11,070 | 273,214 | -66,736 | 253,800 | 488,974 |

### Refining

| Action | Lvl | Typical XP/h | XP/h per effort h | Typical CR value/h | Net of inputs | Endgame XP/h | Endgame CR value/h |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Iron Ingot | 1 | 9,000 | 4,004 | 10,986 | 7,674 | 14,569 | 14,271 |
| Silica Glass | 5 | 10,800 | 3,088 | 11,013 | 4,383 | 17,483 | 14,307 |
| Recycle Scrap | 8 | 12,600 | 2,843 | 11,037 | 1,128 | 20,397 | 14,259 |
| Copper Ingot | 10 | 16,200 | 7,704 | 25,683 | 17,441 | 26,224 | 33,257 |
| Aluminium Ingot | 20 | 23,400 | 11,038 | 40,502 | 27,214 | 37,879 | 52,360 |
| Steel Ingot | 30 | 32,400 | 7,242 | 82,665 | 46,354 | 52,448 | 107,415 |
| Titanium Ingot | 40 | 45,000 | 11,046 | 119,405 | 65,190 | 72,845 | 153,693 |
| Cobalt Ingot | 50 | 59,400 | 11,461 | 201,190 | 115,115 | 96,155 | 261,250 |
| Platinum Ingot | 60 | 75,600 | 25,905 | 238,875 | 112,915 | 122,380 | 308,620 |
| Iridium Ingot | 70 | 100,800 | 16,642 | 403,260 | 246,610 | 163,173 | 522,610 |
| Osmium Ingot | 80 | 129,600 | 18,261 | 585,440 | 366,480 | 209,794 | 760,640 |
| Neutronium Plate | 90 | 180,000 | 12,800 | 2,751,750 | 1,513,820 | 291,380 | 3,585,000 |

### Fabrication

| Action | Lvl | Typical XP/h | XP/h per effort h | Typical CR value/h | Net of inputs | Endgame XP/h | Endgame CR value/h |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Hull Plate | 1 | 9,600 | 2,583 | 19,528 | 6,250 | 15,542 | 25,432 |
| Optical Lens | 5 | 12,000 | 2,319 | 19,504 | 6,358 | 19,428 | 25,480 |
| Copper Wiring | 10 | 14,400 | 6,340 | 21,960 | 6,434 | 23,313 | 28,620 |
| Circuit Board | 15 | 24,000 | 4,654 | 42,893 | 16,409 | 38,855 | 55,423 |
| Refurbish Circuitry | 18 | 21,600 | 3,045 | 43,103 | 16,523 | 34,970 | 55,633 |
| Alloy Frame | 20 | 33,600 | 6,952 | 98,000 | 24,773 | 54,397 | 127,760 |
| Heat Sink | 25 | 39,600 | 8,224 | 85,365 | 21,217 | 64,111 | 111,405 |
| Steel Girder | 30 | 48,000 | 5,373 | 196,000 | 47,028 | 77,710 | 252,800 |
| Power Coupling | 35 | 57,600 | 10,118 | 97,560 | 28,134 | 93,252 | 128,240 |
| Focusing Crystal | 40 | 69,600 | 2,620 | 122,450 | 41,662 | 112,680 | 157,550 |
| Titanium Plating | 45 | 81,600 | 10,227 | 281,520 | 76,965 | 132,108 | 362,940 |
| Sensor Array | 50 | 96,000 | 6,749 | 134,970 | 45,143 | 155,421 | 175,395 |
| Cobalt Coil | 55 | 114,000 | 12,769 | 331,560 | 80,946 | 184,562 | 425,385 |
| Plasma Conduit | 60 | 138,000 | 16,465 | 464,740 | 122,860 | 223,417 | 603,250 |
| Superconductor Coil | 65 | 156,000 | 12,412 | 637,000 | 202,904 | 252,559 | 824,460 |
| Quantum Processor | 70 | 180,000 | 3,807 | 614,500 | 207,340 | 291,414 | 789,750 |
| Gravitic Stabiliser | 80 | 228,000 | 442 | 1,345,300 | 140,060 | 369,124 | 1,739,100 |
| Exotic Matter Core | 90 | 312,000 | 9,678 | 3,690,000 | 1,476,930 | 505,118 | 4,756,500 |

### Chemistry

| Action | Lvl | Typical XP/h | XP/h per effort h | Typical CR value/h | Net of inputs | Endgame XP/h | Endgame CR value/h |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Hydrogen Fuel Cell | 1 | 10,800 | 2,327 | 7,346 | 2,357 | 17,483 | 9,920 |
| Nutrient Gel | 4 | 16,200 | 1,176 | 18,385 | 3,544 | 26,224 | 24,815 |
| Laser Coolant | 6 | 21,600 | 1,563 | 54,975 | 40,085 | 34,966 | 74,670 |
| Scoop Catalyst | 10 | 28,800 | 1,379 | 82,508 | 57,510 | 46,621 | 112,095 |
| Salvage Analyser | 15 | 36,000 | 1,734 | 100,568 | 72,407 | 58,276 | 137,170 |
| Thermal Flux | 20 | 45,000 | 1,814 | 110,610 | 74,310 | 72,845 | 149,820 |
| Fusion Pellet | 25 | 50,400 | 5,976 | 32,958 | 16,338 | 81,586 | 44,631 |
| Precision Nanites | 28 | 57,600 | 2,310 | 137,250 | 87,495 | 93,242 | 185,250 |
| Cartographer's Stim | 35 | 72,000 | 1,729 | 165,735 | 92,607 | 116,552 | 220,905 |
| Growth Hormone | 40 | 82,800 | 2,483 | 183,150 | 111,758 | 134,035 | 247,700 |
| Reagent Stabiliser | 45 | 93,600 | 1,834 | 201,465 | 93,753 | 151,518 | 273,075 |
| Engineer's Focus | 50 | 108,000 | 2,448 | 257,180 | 141,407 | 174,828 | 348,040 |
| Broker's Brew | 55 | 122,400 | 2,095 | 294,480 | 129,756 | 198,138 | 396,880 |
| Tritium Fuel Rod | 62 | 140,400 | 8,995 | 220,800 | 72,233 | 227,276 | 297,360 |
| Neural Accelerant | 66 | 153,000 | 1,940 | 368,700 | 98,144 | 247,673 | 495,400 |
| Overclock Serum | 75 | 180,000 | 1,910 | 550,800 | 198,225 | 291,380 | 741,150 |
| Antimatter Pod | 85 | 225,000 | 7,108 | 1,101,000 | 582,075 | 364,225 | 1,492,800 |
| Mastery Tonic | 90 | 270,000 | 1,372 | 773,640 | 114,240 | 437,070 | 1,056,510 |

### Engineering

| Action | Lvl | Typical XP/h | XP/h per effort h | Typical CR value/h | Net of inputs | Endgame XP/h | Endgame CR value/h |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Mining Laser E | 1 | 18,000 | 721 | 130,002 | 24,786 | 29,131 | 164,900 |
| Mining Laser D | 20 | 56,000 | 1,974 | 325,000 | 57,460 | 90,630 | 422,600 |
| Mining Laser C | 40 | 115,200 | 1,998 | 634,491 | 138,021 | 186,483 | 813,813 |
| Mining Laser B | 60 | 209,440 | 2,859 | 1,072,808 | 260,318 | 339,021 | 1,375,539 |
| Mining Laser A | 80 | 360,000 | 470 | 2,450,448 | 568,568 | 582,624 | 3,131,128 |
| Gas Harvester E | 3 | 18,000 | 741 | 133,255 | 23,563 | 29,131 | 173,348 |
| Gas Harvester D | 23 | 56,000 | 2,573 | 394,944 | 70,444 | 90,630 | 515,218 |
| Gas Harvester C | 43 | 115,200 | 2,935 | 695,783 | 160,003 | 186,483 | 897,754 |
| Gas Harvester B | 63 | 209,440 | 6,320 | 1,341,340 | 311,220 | 339,021 | 1,710,709 |
| Gas Harvester A | 83 | 360,000 | 1,240 | 2,852,036 | 679,036 | 582,624 | 3,663,572 |
| Salvage Limpets E | 6 | 18,000 | 737 | 133,255 | 23,035 | 29,131 | 171,535 |
| Salvage Limpets D | 26 | 56,000 | 2,778 | 316,452 | 53,961 | 90,630 | 405,922 |
| Salvage Limpets C | 46 | 115,200 | 3,006 | 662,519 | 149,199 | 186,483 | 851,939 |
| Salvage Limpets B | 66 | 209,440 | 6,285 | 1,168,640 | 271,040 | 339,021 | 1,502,160 |
| Salvage Limpets A | 86 | 360,000 | 1,261 | 2,530,110 | 562,870 | 582,624 | 3,248,003 |
| Survey Scanner E | 9 | 18,000 | 711 | 129,015 | 22,263 | 29,131 | 166,803 |
| Survey Scanner D | 29 | 56,000 | 2,204 | 363,713 | 63,001 | 90,630 | 470,976 |
| Survey Scanner C | 49 | 115,200 | 2,582 | 649,440 | 142,240 | 186,483 | 824,560 |
| Survey Scanner B | 69 | 209,440 | 551 | 1,025,409 | 230,529 | 339,021 | 1,305,480 |
| Survey Scanner A | 89 | 360,000 | 1,224 | 2,450,448 | 535,808 | 582,624 | 3,207,204 |
| Jump Drive E | 12 | 18,000 | 845 | 133,400 | 23,510 | 29,131 | 172,695 |
| Jump Drive D | 32 | 56,000 | 2,567 | 395,912 | 70,532 | 90,630 | 516,428 |
| Jump Drive C | 52 | 115,200 | 2,951 | 660,715 | 137,555 | 186,483 | 847,429 |
| Jump Drive B | 72 | 209,440 | 6,320 | 1,331,330 | 301,210 | 339,021 | 1,767,766 |
| Jump Drive A | 92 | 360,000 | 1,313 | 2,348,500 | 540,750 | 582,624 | 3,054,975 |
| Cargo Rack E | 2 | 18,000 | 636 | 162,096 | 29,136 | 29,131 | 207,944 |
| Cargo Rack D | 22 | 56,000 | 2,606 | 412,390 | 77,510 | 90,630 | 532,818 |
| Cargo Rack C | 42 | 115,200 | 2,684 | 855,261 | 197,001 | 186,483 | 1,126,356 |
| Cargo Rack B | 62 | 209,440 | 5,801 | 1,292,638 | 311,763 | 339,021 | 1,674,750 |
| Cargo Rack A | 82 | 360,000 | 1,313 | 3,121,096 | 712,936 | 582,624 | 4,019,400 |
| Refinery Unit D | 30 | 54,000 | 3,259 | 274,290 | 52,350 | 87,394 | 353,678 |
| Refinery Unit B | 60 | 210,000 | 7,696 | 969,408 | 211,248 | 339,864 | 1,256,112 |
| Refinery Unit A | 85 | 390,000 | 1,431 | 2,129,391 | 485,601 | 631,176 | 2,706,209 |
| Fabricator Bay D | 31 | 54,000 | 3,226 | 273,844 | 49,474 | 87,394 | 354,124 |
| Fabricator Bay B | 61 | 210,000 | 7,796 | 959,904 | 211,824 | 339,864 | 1,255,320 |
| Fabricator Bay A | 86 | 390,000 | 1,420 | 2,127,664 | 471,314 | 631,176 | 2,778,743 |
| Chemistry Lab D | 32 | 54,000 | 3,259 | 273,398 | 51,458 | 87,394 | 359,476 |
| Chemistry Lab B | 62 | 210,000 | 7,854 | 972,576 | 230,256 | 339,864 | 1,242,648 |
| Chemistry Lab A | 87 | 390,000 | 1,429 | 2,119,029 | 473,669 | 631,176 | 2,766,654 |
| Hydroponics Module D | 33 | 54,000 | 3,191 | 273,844 | 46,842 | 87,394 | 346,542 |
| Hydroponics Module B | 63 | 210,000 | 7,738 | 965,448 | 211,608 | 339,864 | 1,262,448 |
| Hydroponics Module A | 88 | 390,000 | 1,457 | 2,098,305 | 484,345 | 631,176 | 2,720,025 |
| Engineering Workshop D | 34 | 54,000 | 3,226 | 273,175 | 48,805 | 87,394 | 350,110 |
| Engineering Workshop B | 64 | 210,000 | 7,803 | 972,576 | 225,216 | 339,864 | 1,256,904 |
| Engineering Workshop A | 89 | 390,000 | 1,447 | 2,110,394 | 485,444 | 631,176 | 2,721,752 |
| Trade Computer D | 35 | 54,000 | 3,276 | 272,506 | 51,781 | 87,394 | 356,800 |
| Trade Computer B | 65 | 210,000 | 7,745 | 963,864 | 210,744 | 339,864 | 1,267,992 |
| Trade Computer A | 90 | 390,000 | 1,429 | 2,101,759 | 456,399 | 631,176 | 2,733,841 |
| Research Lab D | 36 | 54,000 | 3,220 | 273,398 | 48,623 | 87,394 | 357,246 |
| Research Lab B | 66 | 210,000 | 7,810 | 971,784 | 225,144 | 339,864 | 1,250,568 |
| Research Lab A | 91 | 390,000 | 1,451 | 2,105,213 | 484,973 | 631,176 | 2,716,571 |
| AI Co-Pilot D | 37 | 54,000 | 3,223 | 272,506 | 47,934 | 87,394 | 353,678 |
| AI Co-Pilot B | 67 | 210,000 | 7,689 | 970,200 | 211,320 | 339,864 | 1,257,696 |
| AI Co-Pilot A | 92 | 390,000 | 1,404 | 2,106,940 | 431,750 | 631,176 | 2,740,749 |

### Trading

| Action | Lvl | Typical XP/h | XP/h per effort h | Typical CR value/h | Net of inputs | Endgame XP/h | Endgame CR value/h |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Ore Shuttle | 1 | 5,056 | 753 | 32,232 | 17,064 | 13,165 | 8,232,080 |
| Ice Run | 5 | 6,320 | 937 | 48,664 | 25,912 | 16,456 | 12,347,440 |
| Fuel Supply Contract | 8 | 7,596 | 376 | 58,869 | 28,485 | 19,747 | 14,817,200 |
| Metals Contract | 12 | 9,540 | 920 | 78,864 | 33,072 | 24,684 | 19,756,720 |
| Glassworks Supply | 18 | 11,520 | 737 | 79,360 | 33,280 | 29,621 | 19,756,720 |
| Wiring Wholesale | 24 | 15,731 | 431 | 659,208 | 315,984 | 36,203 | 31,488,080 |
| Agricultural Supply | 30 | 18,700 | 117 | 467,855 | 237,695 | 42,786 | 22,226,480 |
| Construction Contract | 36 | 19,858 | 82 | 9,573,609 | 4,278,249 | 45,148 | 451,715,396 |
| Electronics Export | 42 | 25,217 | 118 | 3,398,896 | 1,629,296 | 53,613 | 104,987,806 |
| Gemstone Brokerage | 50 | 35,211 | 13 | 15,855,021 | 7,456,941 | 64,900 | 169,392,982 |
| Medical Supplies | 58 | 42,562 | 32 | 5,409,580 | 2,862,508 | 77,597 | 57,170,146 |
| High-Tech Export | 66 | 48,048 | 23 | 39,767,552 | 19,942,912 | 80,223 | 288,647,760 |
| Precious Metals | 74 | 56,897 | 196 | 47,599,167 | 23,870,527 | 93,799 | 341,128,800 |
| Cartographic Data Sale | 82 | 74,183 | 31 | 44,818,005 | 23,717,205 | 111,078 | 194,489,520 |
| Exotic Tech Run | 90 | 91,938 | 8 | 324,615,168 | 171,783,168 | 135,762 | 1,389,214,500 |

### Research

| Action | Lvl | Typical XP/h | XP/h per effort h | Typical CR value/h | Net of inputs | Endgame XP/h | Endgame CR value/h |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Stellar Spectra | 1 | 9,000 | 2,532 | 0 | -9,900 | 15,958 | 0 |
| Data Core Analysis | 10 | 19,800 | 4,890 | 0 | -25,050 | 35,107 | 0 |
| Planetary Survey | 20 | 28,800 | 3,592 | 0 | -30,060 | 51,065 | 0 |
| Xenobotany | 30 | 36,000 | 698 | 0 | -74,115 | 63,832 | 0 |
| Cryptanalysis | 40 | 49,500 | 10,273 | 0 | -50,040 | 87,768 | 0 |
| Gravimetrics | 50 | 63,000 | 5,828 | 0 | -73,980 | 111,705 | 0 |
| Biostructure Study | 60 | 81,000 | 12,276 | 0 | -290,150 | 143,621 | 0 |
| Stellar Remnants | 70 | 103,500 | 4,938 | 0 | -173,355 | 183,516 | 0 |
| Precursor Technology | 80 | 135,000 | 19,768 | 0 | -574,000 | 239,369 | 0 |
| The Andromeda Signal | 90 | 198,000 | 3,245 | 0 | -1,624,590 | 351,074 | 0 |

## XP/h dips: an action that pays less XP/h than one unlocked earlier

| Skill | Action | XP/h | Better earlier action | XP/h |
| --- | ---: | ---: | ---: | ---: |
| Fabrication | Refurbish Circuitry (18) | 21,600 | Circuit Board (15) | 24,000 |
| Engineering | Refinery Unit D (30) | 54,000 | Mining Laser D (20) | 56,000 |
| Engineering | Fabricator Bay D (31) | 54,000 | Mining Laser D (20) | 56,000 |
| Engineering | Chemistry Lab D (32) | 54,000 | Mining Laser D (20) | 56,000 |
| Engineering | Hydroponics Module D (33) | 54,000 | Mining Laser D (20) | 56,000 |
| Engineering | Engineering Workshop D (34) | 54,000 | Mining Laser D (20) | 56,000 |
| Engineering | Trade Computer D (35) | 54,000 | Mining Laser D (20) | 56,000 |
| Engineering | Research Lab D (36) | 54,000 | Mining Laser D (20) | 56,000 |
| Engineering | AI Co-Pilot D (37) | 54,000 | Mining Laser D (20) | 56,000 |
| Engineering | Salvage Limpets A (86) | 360,000 | Refinery Unit A (85) | 390,000 |
| Engineering | Survey Scanner A (89) | 360,000 | Refinery Unit A (85) | 390,000 |
| Engineering | Jump Drive A (92) | 360,000 | Refinery Unit A (85) | 390,000 |

## Time to 99

Always doing the best XP/h action available at your level, typical setup. "Action time" assumes the inputs are already in the hold; "with inputs" adds the time to gather and make them yourself.

| Skill | Action time | With inputs | Last steps of the path |
| --- | ---: | ---: | ---: |
| Mining | 94h (3.9d) | 94h (3.9d) | Iridium Asteroid > Osmium Asteroid > Collapsed Star Fragment |
| Gas Harvesting | 247h (10.3d) | 247h (10.3d) | Xenon Storm > Helium-3 Gas Giant > Exotic Matter Haze |
| Salvaging | 221h (9.2d) | 221h (9.2d) | Generation Ship Remains > Alien Debris Field > Precursor Ruins |
| Exploration | 134h (5.6d) | 897h (37.4d) | Galactic Core Approach > Galactic Core > Andromeda Approach |
| Refining | 93h (3.9d) | 517h (21.5d) | Iridium Ingot > Osmium Ingot > Neutronium Plate |
| Fabrication | 53h (2.2d) | 801h (33.4d) | Quantum Processor > Gravitic Stabiliser > Exotic Matter Core |
| Chemistry | 58h (2.4d) | 1,470h (61.2d) | Overclock Serum > Antimatter Pod > Mastery Tonic |
| Engineering | 39.6h | 1,713h (71.4d) | Refinery Unit B > Mining Laser A > Refinery Unit A |
| Trading | 174h (7.2d) | 13,909h (580d) | Precious Metals > Cartographic Data Sale > Exotic Tech Run |
| Research | 87h (3.6d) | 729h (30.4d) | Stellar Remnants > Precursor Technology > The Andromeda Signal |

Xenobiology (real time, every bay replanted the moment it is ready, 5 gel per crop): **1,272h (53d)** of wall-clock time.

Piloting gets 25% of ship XP, so 99 Piloting needs 52,137,724 XP across the five ship skills (about 4 of them at 99).

## Seed supply for Xenobiology

Action time on the best dedicated source to get enough seeds to plant one bay once, typical setup.

| Crop | Lvl | Seeds per bay | Cost | Best source | Grow time |
| --- | ---: | ---: | ---: | ---: | ---: |
| Luminous Moss | 1 | 3 x Luminous Moss Spores | shop 5 CR |  | 0.1h |
| Glowcap | 8 | 3 x Glowcap Spores | shop 15 CR |  | 0.2h |
| Iron Root | 15 | 3 x Iron Root Seeds | shop 40 CR |  | 0.3h |
| Starbloom | 25 | 2 x Starbloom Seeds | shop 90 CR |  | 0.5h |
| Void Vine | 35 | 2 x Void Vine Cuttings | 50s | Salvaging: Abandoned Mining Barge | 0.8h |
| Ember Leaf | 45 | 2 x Ember Leaf Seeds | 49s | Salvaging: Freighter Hulk | 1h |
| Cryo Lotus | 55 | 1 x Cryo Lotus Seeds | 43s | Salvaging: Abandoned Outpost | 1.5h |
| Psionic Orchid | 65 | 1 x Psionic Orchid Bulb | 47s | Salvaging: Generation Ship Remains | 2h |
| Nebula Kelp | 75 | 1 x Nebula Kelp Spores | 62s | Salvaging: Alien Debris Field | 3h |
| Celestial Truffle | 85 | 1 x Celestial Truffle Spores | 65s | Salvaging: Precursor Ruins | 4h |

## Making credits

Credits per hour of total effort, selling at the market or running the trade route, typical setup. The top five at each stage of the game.

**Up to level 10:** Local Cluster (Exploration) 44,810, Jettisoned Cargo (Salvaging) 31,905, Drifting Escape Pod (Salvaging) 14,453, Copper Ingot (Refining) 12,213, Copper Wiring (Fabrication) 9,669

**Up to level 25:** Scout Hull Wreck (Salvaging) 57,543, Local Cluster (Exploration) 44,810, Jettisoned Cargo (Salvaging) 31,905, Alloy Frame (Fabrication) 20,278, Outer Spiral Arm (Exploration) 19,937

**Up to level 40:** Freighter Hulk (Salvaging) 193,280, Abandoned Mining Barge (Salvaging) 101,292, Scout Hull Wreck (Salvaging) 57,543, Local Cluster (Exploration) 44,810, Construction Contract (Trading) 39,499

**Up to level 55:** Abandoned Outpost (Salvaging) 255,527, Freighter Hulk (Salvaging) 193,280, Abandoned Mining Barge (Salvaging) 101,292, Scout Hull Wreck (Salvaging) 57,543, Local Cluster (Exploration) 44,810

**Up to level 70:** Generation Ship Remains (Salvaging) 411,134, Abandoned Outpost (Salvaging) 255,527, Freighter Hulk (Salvaging) 193,280, Iridium Asteroid (Mining) 116,063, Abandoned Mining Barge (Salvaging) 101,292

**Up to level 85:** Alien Debris Field (Salvaging) 526,289, Generation Ship Remains (Salvaging) 411,134, Abandoned Outpost (Salvaging) 255,527, Freighter Hulk (Salvaging) 193,280, Osmium Asteroid (Mining) 175,241

**Up to level 99:** Precursor Ruins (Salvaging) 814,106, Alien Debris Field (Salvaging) 526,289, Generation Ship Remains (Salvaging) 411,134, Collapsed Star Fragment (Mining) 261,488, Abandoned Outpost (Salvaging) 255,527

### Trade routes against selling the same goods

| Route | Lvl | Commodity | Units per run | CR/h (route only) | CR/h with sourcing | CR/h just selling it | Secs to make 1 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Ore Shuttle | 1 | Ferrite Ore | 12 | 32,232 | 4,800 | 2,654 | 2.7s |
| Ice Run | 5 | Water Ice | 12 | 48,664 | 7,216 | 3,961 | 2.7s |
| Fuel Supply Contract | 8 | Hydrogen Fuel Cell | 12 | 58,869 | 2,914 | 1,583 | 9.1s |
| Metals Contract | 12 | Iron Ingot | 12 | 78,864 | 7,605 | 4,887 | 4.4s |
| Glassworks Supply | 18 | Silica Glass | 12 | 79,360 | 5,077 | 3,149 | 6.9s |
| Wiring Wholesale | 24 | Copper Wiring | 56 | 659,208 | 18,061 | 9,669 | 3.4s |
| Agricultural Supply | 30 | Glowcap | 56 | 467,855 | 2,920 | 0 | n/a |
| Construction Contract | 36 | Steel Girder | 56 | 9,573,609 | 39,499 | 21,938 | 26.3s |
| Electronics Export | 42 | Circuit Board | 80 | 3,398,896 | 15,901 | 8,318 | 15.1s |
| Gemstone Brokerage | 50 | Alexandrite | 192 | 15,855,021 | 5,718 | 3,030 | 71.3s |
| Medical Supplies | 58 | Starbloom | 192 | 5,409,580 | 4,068 | 0 | n/a |
| High-Tech Export | 66 | Sensor Array | 256 | 39,767,552 | 19,025 | 9,489 | 41.7s |
| Precious Metals | 74 | Platinum Ingot | 256 | 47,599,167 | 163,630 | 81,852 | 5.7s |
| Cartographic Data Sale | 82 | Stellar Survey Data IV | 384 | 44,818,005 | 18,440 | 8,685 | 29s |
| Exotic Tech Run | 90 | Quantum Processor | 384 | 324,615,168 | 27,604 | 12,997 | 138s |

## What the big builds really cost

Action hours to make everything from scratch. Rare drops are costed as if farmed on purpose.

| Build | Typical | Endgame | Biggest single cost (typical) |
| --- | ---: | ---: | ---: |
| Sovereign Hull | 5.4h | 1.1h | Gravitic Stabiliser x10 (4.2h) |
| Andromeda Hull | 12.7h | 2.6h | Gravitic Stabiliser x25 (10.5h) |
| Mining Laser E | 0h | 0h | Optical Lens x4 (0h) |
| Mining Laser C | 0.1h | 0h | Focusing Crystal x3 (0.1h) |
| Mining Laser A | 1.5h | 0.5h | Grandidierite x2 (1h) |

### Rare inputs

| Item | Typical secs each | Endgame secs each | Best endgame source |
| --- | ---: | ---: | ---: |
| Alexandrite | 71 | 48 | Salvaging: Abandoned Mining Barge |
| Benitoite | 117 | 56 | Salvaging: Abandoned Outpost |
| Musgravite | 1,108 | 527 | Mining: Ice Asteroid |
| Grandidierite | 1,728 | 745 | Mining: Cobaltite Asteroid |
| Void Opal | 62 | 34 | Salvaging: Precursor Ruins |
| Painite | 155 | 86 | Salvaging: Precursor Ruins |
| Military Grade Alloy | 26 | 10 | Salvaging: Alien Debris Field |
| Precursor Core | 102 | 52 | Salvaging: Precursor Ruins |
| Exotic Matter | 9 | 2 | Gas Harvesting: Exotic Matter Haze |
| Ancient Relic | 26 | 13 | Salvaging: Precursor Ruins |
| Alien Biostructure | 24 | 9 | Salvaging: Alien Debris Field |

## Crop demand against hydroponics supply

Bays it takes to keep one hour of the action fed, typical setup, crops replanted the moment they are ready. You own 3 bays at the start and 12 at most.

| Action | Lvl | Crops used | Bays needed | Bays you can own at that level |
| --- | ---: | ---: | ---: | ---: |
| Nutrient Gel (Chemistry) | 4 | Luminous Moss | 41.3 | 3 |
| Laser Coolant (Chemistry) | 6 | Luminous Moss | 41.5 | 3 |
| Scoop Catalyst (Chemistry) | 10 | Glowcap | 83.5 | 4 |
| Salvage Analyser (Chemistry) | 15 | Glowcap | 83 | 4 |
| Thermal Flux (Chemistry) | 20 | Iron Root | 124 | 5 |
| Precision Nanites (Chemistry) | 28 | Iron Root | 125 | 5 |
| Cartographer's Stim (Chemistry) | 35 | Starbloom | 250 | 6 |
| Growth Hormone (Chemistry) | 40 | Starbloom | 233 | 7 |
| Reagent Stabiliser (Chemistry) | 45 | Void Vine | 357 | 7 |
| Engineer's Focus (Chemistry) | 50 | Void Vine | 353 | 8 |
| Broker's Brew (Chemistry) | 55 | Ember Leaf | 467 | 8 |
| Neural Accelerant (Chemistry) | 66 | Cryo Lotus | 710 | 9 |
| Overclock Serum (Chemistry) | 75 | Psionic Orchid | 943 | 10 |
| Mastery Tonic (Chemistry) | 90 | Nebula Kelp, Celestial Truffle | 2,361 | 12 |
| Agricultural Supply (Trading) | 30 | Glowcap | 961 | 6 |
| Medical Supplies (Trading) | 58 | Starbloom | 10,639 | 8 |
| Xenobotany (Research) | 30 | Starbloom | 310 | 6 |

Bays it takes to keep one booster running full-time, at 1,200 actions an hour (a 3 second action), typical setup.

| Booster | Lvl | Doses per hour | Bays needed | Bays you can own at that level |
| --- | ---: | ---: | ---: | ---: |
| Laser Coolant | 6 | 48 | 1.2 | 3 |
| Scoop Catalyst | 10 | 48 | 2.4 | 4 |
| Salvage Analyser | 15 | 48 | 2.4 | 4 |
| Thermal Flux | 20 | 48 | 3.6 | 5 |
| Precision Nanites | 28 | 48 | 3.6 | 5 |
| Cartographer's Stim | 35 | 48 | 7.2 | 6 |
| Growth Hormone | 40 | 48 | 7.2 | 7 |
| Reagent Stabiliser | 45 | 48 | 10.8 | 7 |
| Engineer's Focus | 50 | 48 | 10.8 | 8 |
| Broker's Brew | 55 | 48 | 14.4 | 8 |
| Neural Accelerant | 66 | 48 | 21.7 | 9 |
| Overclock Serum | 75 | 48 | 28.9 | 10 |
| Mastery Tonic | 90 | 48 | 72.2 | 12 |

## Exploration finds by region

Credit value of survey finds per scan, against the survey data itself and the fuel burned (fuel at market sale value), typical setup.

| Region | Lvl | Finds CR/scan | Data CR/scan | Fuel CR/scan | Scans/h |
| --- | ---: | ---: | ---: | ---: | ---: |
| Local Cluster | 1 | 41.9 | 4 | 0 | 969 |
| Inner Spiral Arm | 12 | 48.4 | 8 | 3.8 | 780 |
| Outer Spiral Arm | 25 | 58.1 | 12 | 3.8 | 811 |
| Nebula Expanse | 40 | 76.4 | 24 | 16.9 | 785 |
| Stellar Nursery | 52 | 78.4 | 30 | 16.9 | 700 |
| Galactic Core Approach | 65 | 123 | 60 | 94.5 | 784 |
| Galactic Core | 78 | 189 | 70 | 94.5 | 724 |
| Andromeda Approach | 90 | 202 | 160 | 470 | 723 |

## Research Points

Maxing the Tech Lab costs 33,000 RP and 13,200,000 CR.

| Study | Lvl | RP/h | RP per effort h | Effort to fund the whole Tech Lab |
| --- | ---: | ---: | ---: | ---: |
| Stellar Spectra | 1 | 920 | 259 | 128h (5.3d) |
| Data Core Analysis | 10 | 1,837 | 454 | 73h (3d) |
| Planetary Survey | 20 | 1,833 | 229 | 144h (6d) |
| Xenobotany | 30 | 1,841 | 36 | 925h (38.5d) |
| Cryptanalysis | 40 | 3,658 | 759 | 43.5h |
| Gravimetrics | 50 | 3,668 | 339 | 97h (4.1d) |
| Biostructure Study | 60 | 7,304 | 1,107 | 29.8h |
| Stellar Remnants | 70 | 6,423 | 306 | 108h (4.5d) |
| Precursor Technology | 80 | 13,763 | 2,015 | 16.4h |
| The Andromeda Signal | 90 | 36,640 | 600 | 55h (2.3d) |

## Trading XP per unit sold

A run pays the same XP however much it sells, so a bigger hold burns more goods for the same XP. Typical setup.

| Route | Lvl | XP per run | Units per run | XP per unit | Effort secs per XP |
| --- | ---: | ---: | ---: | ---: | ---: |
| Ore Shuttle | 1 | 8 | 12 | 0.7 | 4.8 |
| Ice Run | 5 | 10 | 12 | 0.8 | 3.8 |
| Fuel Supply Contract | 8 | 12 | 12 | 1 | 9.6 |
| Metals Contract | 12 | 15 | 12 | 1.3 | 3.9 |
| Glassworks Supply | 18 | 18 | 12 | 1.5 | 4.9 |
| Wiring Wholesale | 24 | 23.1 | 56 | 0.4 | 8.4 |
| Agricultural Supply | 30 | 27.3 | 56 | 0.5 | 30.8 |
| Construction Contract | 36 | 33.6 | 56 | 0.6 | 43.9 |
| Electronics Export | 42 | 39.9 | 80 | 0.5 | 30.5 |
| Gemstone Brokerage | 50 | 48.3 | 192 | 0.3 | 283 |
| Medical Supplies | 58 | 57.8 | 192 | 0.3 | 112 |
| High-Tech Export | 66 | 68.3 | 256 | 0.3 | 157 |
| Precious Metals | 74 | 79.8 | 256 | 0.3 | 18.4 |
| Cartographic Data Sale | 82 | 94.5 | 384 | 0.2 | 118 |
| Exotic Tech Run | 90 | 116 | 384 | 0.3 | 460 |

The same route on different ships: Metals Contract, no cargo racks fitted.

| Ship | Hold | XP per run | XP per ingot |
| --- | ---: | ---: | ---: |
| Wayfarer | 6t | 15 | 2.50 |
| Sparrow Mk I | 8t | 15 | 1.88 |
| Mule | 32t | 15 | 0.47 |
| Atlas Heavy Hauler | 128t | 15 | 0.12 |
| Andromeda | 256t | 15 | 0.06 |

## Salvage success

Chance an attempt succeeds. A failure costs a 3 second reboot. Typical setup at mastery 1 and 40, and endgame.

| Wreck | Lvl | Hazard | Mastery 1 | Mastery 40 | Endgame |
| --- | ---: | ---: | ---: | ---: | ---: |
| Drifting Escape Pod | 1 | 10 | 100% | 100% | 100% |
| Jettisoned Cargo | 8 | 30 | 92% | 100% | 100% |
| Scout Hull Wreck | 18 | 60 | 81% | 100% | 100% |
| Abandoned Mining Barge | 28 | 90 | 89% | 100% | 100% |
| Freighter Hulk | 40 | 140 | 80% | 96% | 100% |
| Abandoned Outpost | 52 | 190 | 70% | 83% | 100% |
| Generation Ship Remains | 64 | 240 | 66% | 78% | 100% |
| Alien Debris Field | 76 | 300 | 59% | 69% | 98% |
| Precursor Ruins | 88 | 380 | 54% | 62% | 82% |

## Where credits go

| One-off sink | Credits |
| --- | ---: |
| Ships (buyable) | 6,655,000 |
| Cargo expansions (all 120) | 252,481,886 |
| Tech Lab (also 33,000 RP) | 13,200,000 |
| Hydroponics bays | 9,710,000 |
| **Total** | **282,046,886** |

Achievements pay out 12,306,000 CR on their own.

Best mid-game earner (typical, level 60 or below): Abandoned Outpost at 255,527 CR/h. Best endgame earner: Precursor Ruins at 1,944,699 CR/h.
At the endgame rate every one-off sink is paid off in about 145h (6d) of play. After that the only recurring sinks are market supplies.

## Market and containers

| Shop item | Buy | Best market sale | Best trade route sale (est.) | Flag |
| --- | ---: | ---: | ---: | ---: |
| Luminous Moss Spores | 5 | 1 |  |  |
| Glowcap Spores | 15 | 3 |  |  |
| Iron Root Seeds | 40 | 6 |  |  |
| Starbloom Seeds | 90 | 13 |  |  |
| Nutrient Gel | 40 | 11 |  |  |
| Hydrogen Fuel Cell | 20 | 4 | 12 |  |
| Fusion Pellet | 110 | 19 |  |  |
| Mining Laser E | 600 | 155 |  |  |
| Gas Harvester E | 600 | 159 |  |  |
| Salvage Limpets E | 900 | 159 |  |  |
| Survey Scanner E | 900 | 155 |  |  |
| Jump Drive E | 1,200 | 159 |  |  |
| Cargo Rack E | 800 | 193 |  |  |
| Mining Laser D | 12,000 | 440 |  |  |
| Gas Harvester D | 12,000 | 532 |  |  |
| Salvage Limpets D | 15,000 | 427 |  |  |
| Survey Scanner D | 15,000 | 490 |  |  |
| Jump Drive D | 18,000 | 532 |  |  |
| Cargo Rack D | 14,000 | 556 |  |  |

Spore Cluster: sells for 5 CR, contents worth 14.3 CR on average.
Sealed Cargo Container: sells for 25 CR, contents worth 46.5 CR on average.

## Item sources and uses

171 items. 8 have no use except selling. 0 have no source.

No use except selling: Painite (900), Personal Effects (15), Occupied Escape Pod (120), Water World Survey (800), Ammonia World Survey (1200), Neutron Star Survey (600), Black Hole Survey (2500), Earth-like World Survey (5000).

Items per category: ore 12, gem 6, gas 10, salvage 10, container 2, seed 10, crop 10, refined 11, component 17, fuel 4, supply 1, data 10, research 1, booster 13, module 54.

## Mastery speed

Mastery XP per hour at typical setup, first action in each skill. The formula scales with the number of actions in the skill.

| Skill | Actions in skill | Mastery XP/h |
| --- | ---: | ---: |
| Mining | 12 | 84,171 |
| Gas Harvesting | 10 | 72,085 |
| Salvaging | 9 | 64,895 |
| Exploration | 8 | 57,705 |
| Refining | 12 | 86,477 |
| Fabrication | 18 | 129,658 |
| Chemistry | 18 | 129,658 |
| Engineering | 56 | 403,231 |
| Trading | 15 | 108,024 |
| Research | 10 | 72,089 |

Mastery level reached on that action from a standing start, with skill XP and mastery rising as they would in play. A full offline session is 24 hours.

| Skill | Action | After 1 hour | After 24 hours |
| --- | ---: | ---: | ---: |
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

