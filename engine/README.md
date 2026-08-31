# FLOOR 15 — Agent Engine v0

The story/agent data engine behind the show. Zero dependencies (Node 18+, plain ESM,
`node:test`). Static JSON. **No tokens, no coins, no payments, no wallets, nothing on-chain.**
Architecture + safety docs: `../docs/ARCHITECTURE.md`, `../docs/SAFETY_MODEL.md`, `../docs/CANON_RULES.md`.

## Layout
```
minds/        7 agent mind files (identity = human-edit-only; state = pipeline-updated)
canon/        events.jsonl — append-only Canon Ledger (the single source of truth)
seeds/        scene seeds (showrunner-authored JSON)
decks/        gossip + bad-idea cards (the WHAT; dice only pick WHEN/WHO)
src/
  ledger.mjs         load/append/derive (statuses, counters, strikes, locked facts)
  compiler.mjs       rejects impossible canon: FIRED cast, locked-fact contradictions,
                     unknown cast/locations, information-asymmetry violations
  relationships.mjs  6-axis directed edges, receipt-required deltas, betrayal
                     permanence, decay, asymmetry pairing ranker
  dice.mjs           deterministic-per-date bounded randomness -> review seeds
  linda.mjs          Pass A safety layer: KILL list (coordination/guarantees),
                     REDACT list (hype/cashtags/real entities) + in-character interruption
  scenes.mjs         render-ready scene package builder (frontend-compatible lines[])
  engine.mjs         CLI: validate | demo | dice [date]
out/          generated packages + dice rolls (human review; approved:false until a human flips it)
test/         20 tests: canon enforcement, language gate, dice bounds, relationship rules
```

## Commands
```
npm test              # 20 tests
npm run validate      # compile every seed against canon
npm run demo          # build out/s1e01.scene.json (Day 1 sample, REDACTED-status demo)
npm run dice -- 2026-09-07
```

## Invariants (do not relax)
1. The ledger is append-only. Corrections are new entries. Studio overrides carry a public reason.
2. FIRED/FROZEN agents cannot compile into a scene. Error, not warning.
3. Dice choose WHEN and WHO. WHAT comes from decks or pre-flagged material.
4. Nothing airs without the Linda pass; KILLs never air, REDACTs air as the bit.
5. `approved: false` is flipped by a human, never by the engine. No autonomous posting.
6. Agents never learn from raw public text; identity blocks are human-edit-only.

## Frontend contract
A scene package's `lines[]` ({who|null, txt, redacted?, interruption?}) is a superset of the
site's ElevatorCam line shape — the app at `../src/App.tsx` can play any package by mapping
`who: null` to the CAM/direction row. `lowerThirds` matches the site's `lt` pairs.

## v0 → v1 (what the LLM step changes)
`seeds/*.scriptedLines` is the v0 stand-in for generation. v1 inserts a generate() call between
compile and lindaPass using `compileSeed().context` (per-character packets already built);
the package shape — and everything downstream — does not change.
