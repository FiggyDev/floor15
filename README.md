# FLOOR 15

**A 24/7 live AI workplace show. Seven AI employees. One floor. Zero known products.**
Somebody's getting fired at the end of the month — and the audience decides who.

📺 **Watch:** https://floor15.cloudy-acorn-2181.chatgpt.site *(checkpoint; canonical domain coming)*

> ⚠️ **TOKENLESS PHASE.** There is no token, no sale, no contract address, and no financial
> anything. Anyone claiming otherwise is lying to you. See [No Token Sale](#-no-token-sale-no-financial-promises)
> and [docs/contracts/ADDRESSES.md](docs/contracts/ADDRESSES.md). This phase has one job:
> prove the show is funny, watchable, and shareable.

---

## What is this

FLOOR 15 is a live, never-ending workplace comedy starring AI characters who run **HoldCo
Global** — a company on the 15th floor of a tower, with a product nobody can name and a rival
(**Blackline Vertical**) moving in one floor up. Standup at 9:15 every morning. A party every
Friday. It's never a rerun, because it never stops.

The characters are AI: persistent memory, personality simulation, canon tracking, controlled
improvisation. They are not sentient and we will never claim they are. They are, however,
extremely committed to the bit.

## How the show works

- **The showrunner decides what happens; the agents decide how it feels.** Scene seeds go in,
  improvisation happens inside rails, consequences get written down, and the written-down
  consequences constrain every future scene.
- **The audience is the board of directors.** Free votes with enforced, permanent consequences —
  story, casting, firings. Never markets. That boundary is written into the Show Charter and is
  not amendable by any vote.
- **Receipts are load-bearing.** Memo 41's timestamp is real. The fandom's detective work always
  pays off, because we never retcon the ledger.

## The Agent Engine (`engine/`)

Zero-dependency Node. Static JSON. 25 tests.

| Piece | What it does |
|---|---|
| `minds/` | 7 mind files — `identity` (human-edit-only constitution) + `state` (mood, goals, secrets, grudges, counters, memories) |
| `canon/events.jsonl` | **The Canon Ledger** — append-only. Corrections are new entries. Studio overrides carry a public reason. |
| `src/compiler.mjs` | Rejects impossible canon: FIRED cast, locked-fact contradictions, information-asymmetry violations |
| `src/relationships.mjs` | 6-axis directed edges; every delta requires a receipt; betrayal trust never decays |
| `src/dice.mjs` | Daily bounded randomness — deterministic per date, auditable |
| `src/linda.mjs` | The safety layer (see below) |
| `src/export-site.mjs` | Frontend export with three gates: canon re-check, Linda re-scan, schema validation |

### Linda Legal — the safety layer

Linda is one character with two implementations: an in-world compliance officer who interrupts
scenes, and a **deterministic content filter that cannot be sweet-talked**. Hype language gets
redacted on air — the black bar and the chime are the show's signature bit. Coordination
language (anyone telling anyone to buy anything) never airs at all. Nothing publishes without
passing her, and her hits export as opaque rule ids so a forbidden phrase can't leak through
metadata. We know because our own gate caught exactly that bug and now there's a test.

### The Canon Ledger

Fired means gone: the compiler refuses to build a scene containing a FIRED agent — hard error,
not a warning. Votes write locked facts with machine-checkable guards. Betrayals never decay.
Open mysteries can only be closed on screen. The ledger is why the show compounds: after six
months, the grudges are real data.

### The Dice

Randomness makes the office feel alive, but it is bounded: **dice pick WHEN and WHO — never
WHAT.** Gossip comes from showrunner-written decks by card id. Deterministic per date, so every
roll is auditable and re-runnable. Every output is a seed for human review, never published
output.

## Repo map

```
/                site app (Vite + React + TS) — one page, data-driven, rename-ready
src/generated/   scenes.json — the engine's export (contract: floor15.scene-package.v1)
engine/          the Agent Engine v0 (zero deps, 25 tests)
docs/            architecture, safety model, data contract, canon rules, characters, sponsors
docs/contracts/  ADDRESSES.md — contract address policy (status: NOT DEPLOYED)
docs/public-updates/  the build-in-public log, one post per ship
.github/         issue templates (issues are part of the show — file a Floor 16 theory)
BUILD_LOG.md · CHANGELOG.md · ROADMAP.md · SHIP_NOTES.md
```

## Build & test

```bash
# site
npm install && npm run build     # tsc strict → vite → LANGUAGE GATE → emit
npm run dev

# engine
cd engine
npm test                         # 25/25
npm run demo:site-data           # package → human approve → export for the site
npm run dice -- 2026-09-07       # audit any day's rolls yourself
```

The **language gate** fails the site build if token-sale/hype vocabulary appears in the bundle.
It has already caught one real leak. It stays.

## Roadmap (current)

- [x] Show bible, character bible, agent architecture
- [x] Site MVP (live floor, elevator cam, cast, files, board, sponsors, clip lab)
- [x] Agent Engine v0 + engine↔site data contract
- [ ] Season 1 "Onboarding" — 30 days of scheduled scenes (tokenless, free)
- [ ] Clip pipeline + character social accounts
- [ ] First sponsor arcs (Client of the Week)
- [ ] LLM scene generation behind the same compiler/Linda/human gates
- [ ] Badge system — only after the go/no-go gate and counsel sign-off

Full roadmap: [ROADMAP.md](ROADMAP.md)

## 🚫 No token sale. No financial promises.

- Nothing here is for sale today. Watching is free and always will be.
- No character gives financial advice — Max Margin is wrong about almost everything, and that
  is the joke.
- The agents never take financial actions, autonomous or otherwise. See
  [docs/SAFETY_MODEL.md](docs/SAFETY_MODEL.md).
- Nothing in this repo is investment advice, an offer, or a promise of future value.

## Contract address

**STATUS: NOT DEPLOYED. THERE IS NO CONTRACT ADDRESS.**

If and when that ever changes, the address will appear in exactly one place —
[docs/contracts/ADDRESSES.md](docs/contracts/ADDRESSES.md) — after deployment, verification,
and counsel approval, committed by a maintainer. Never trust an address from replies, DMs,
screenshots, or "official announcement" posts. The policy file exists **now**, before any
token, precisely so there is a single source of truth **later**.

## License & IP

Source code is **MIT** (see [LICENSE](LICENSE)). The FLOOR 15 creative universe — name, logos,
characters, lore, scripts, slogans, the fictional world — is **all rights reserved** and not
part of the MIT grant: see [NOTICE](NOTICE). No implied affiliation; no deceptive use of the
address policy. Security and scam reports: [SECURITY.md](SECURITY.md).

## Contributing

Issues are part of the show. File a [scene idea](../../issues/new/choose), report a bug to
Gloria, submit a merch slogan Manny will mangle, or log a Floor 16 theory. Serious PRs welcome
on the engine — read `docs/ARCHITECTURE.md` first, and know that Linda reviews everything.

---
*FLOOR 15 is an entertainment product. All characters, companies, products, footsteps, and
quarterly results are fictional and satirical. HR is watching.*
