# Leonida Ledger — GTA 6 Trophy Guide & Tracker

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/rfg5r8jwbr-dot/makefun-gta6-trophy-guide-01-entry-v2/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/rfg5r8jwbr-dot/makefun-gta6-trophy-guide-01-entry-v2/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

An offline guide and tracker for all 55 Grand Theft Auto VI trophies on PlayStation 5: 1 platinum, 2 gold, 6 silver and 46 bronze, all single-player, none online. Every trophy has its official name, description and grade, a guide written in our own words with cited sources, and a checklist that saves your progress in the browser with export and import. Filters cover kind and grade, search, hide-earned and missable-only; a spoiler setting hides unearned story trophies until you earn them. A three-stage platinum roadmap (about 200 hours) sits beside a callout for the one possibly missable trophy, Positive Mental Attitude, and an explicit note that there are no online trophies to chase.

Built for the [gta6-trophy-guide-01 bounty](https://make.fun/bounty/gta6-trophy-guide-01?ref=4q7hssxn) on make.fun.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080. The guide is plain static files under `app/` with no build step, and it works with the network off: it fetches only its own `app/data/trophies.json`, and the only links out are the cited sources on each trophy's guide, which open only when you follow them.

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` validates the entry first (exactly 55 trophies, every trophy with a non-empty guide and at least one cited source, every app file and screenshot present and non-empty, screenshots within the size cap), then copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the vendored make.fun library.

## Sources

Names, descriptions and grades are the official PlayStation list as published on Exophase and cross-checked against PowerPyx and Push Square. Each trophy's guide cites its sources by name and link; where a method is still unconfirmed (for example, Bad Luck, I Guess), the guide says so instead of guessing. No Rockstar artwork is used anywhere in this guide.
