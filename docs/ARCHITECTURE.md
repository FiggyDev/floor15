# Architecture Overview

```
showrunner seeds ─┐
dice (bounded) ───┼─> COMPILER ──> [generation*] ──> LINDA PASS ──> HUMAN GATE ──> export-site
decks (authored) ─┘   rejects:      *v0: scripted     redact/kill    approve <id>      │
                      fired cast,    lines; LLM                                        ▼
                      locked-fact    later, same                              src/generated/scenes.json
                      conflicts,     contract                                 (floor15.scene-package.v1)
                      info leaks                                                       │
                                                                                       ▼
CANON LEDGER (append-only) <── approved consequences                      site (Vite+React, static)
        └── derived: statuses · counters · strikes · relationships · mysteries
```

- **Site** (`/`): static single-page app; no backend, no accounts, no wallets. All interaction
  device-local. Production build is one self-contained HTML file behind a language gate.
- **Engine** (`/engine`): zero-dependency Node. Files + JSONL. Deterministic where it matters
  (dice are seeded by date; every roll is auditable).
- **The frontend cannot tell** whether a scene was scripted, generated, or dice-assisted.
  The data contract (docs/DATA_CONTRACT.md) is the entire interface.
- **The human gate is real:** `approved: false` is flipped only by a person running
  `engine approve <id>`. The pipeline cannot approve itself, and export re-checks canon and
  safety even on approved packages.
