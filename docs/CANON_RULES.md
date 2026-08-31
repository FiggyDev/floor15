# Canon Ledger Rules

`engine/canon/events.jsonl` — append-only JSONL. The single source of truth. The site, the
Personnel Files, and every future scene render FROM it.

1. **Append-only.** Nothing edits. Corrections are new entries referencing the old ones.
2. **Fired means gone.** `status: FIRED` blocks that agent from compiling into any scene until
   `until`. Hard error. Their desk renders empty.
3. **Locked facts carry machine guards.** A seed contradicting a locked fact's regex guard is
   rejected at compile time — canon is code, not vibes.
4. **Betrayal never decays.** Ordinary friction drifts back toward baseline weekly; betrayal
   deltas are permanent until an on-screen reconciliation writes its own entry.
5. **Every relationship delta requires a receipt** (`why` + source scene). The engine throws
   without one. Fans can trace any grudge to its birth.
6. **Open mysteries can only close on screen.** No silent resolutions.
7. **Studio overrides are visible.** The only privileged write type requires a public reason
   and renders in the ledger. Transparency is what keeps enforced-canon credible.
8. **Receipts are never faked retroactively.** If the timestamp matters to the story, the
   timestamp is real. Scroll back and check — that's the point.
