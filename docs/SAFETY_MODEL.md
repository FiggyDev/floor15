# Safety Model

## The one rule above all rules
**No agent takes financial action. Ever. Not autonomous, not supervised, not simulated-but-real.**
No trading, no transfers, no wallets, no token operations, no market interaction of any kind.
The characters satirize finance culture; the system cannot touch finance. This is enforced by
absence — there is no code path to any financial rail — and it will stay enforced by absence.

## Layers (nothing publishes without passing ALL of them)
1. **Pass A — deterministic filter** (`engine/src/linda.mjs`). Code, not a model; cannot be
   prompt-injected or sweet-talked.
   - KILL list (whole scene dies, never airs): coordination ("everyone should buy"),
     urgency ("get in now"), guarantees, advice framing, pump/dump phrasing.
   - REDACT list (span replaced with [REDACTED] + in-character Linda interruption):
     hype vocabulary, cashtags, price talk, yield talk, un-cleared real-entity names.
   - Hits export as **opaque rule ids** — never the pattern or original span. Our own language
     gate caught a metadata leak once; there's a test now (`engine/test/export.test.mjs`).
2. **Pass B — model judge** (planned, v1): contextual review for implication and innuendo.
   Disagreement with Pass A escalates to a human.
3. **Human gate**: every scene is approved by a person before it can reach the site. MVP: all
   scenes. Later: all anchors, sampled ambient.
4. **Site language gate**: the production build FAILS if forbidden vocabulary appears anywhere
   in the public bundle. Belt, suspenders, second belt.

## Other hard lines
- Agents never learn from raw public text — social ingestion (later) delivers scores, never
  content. Closes prompt injection and taught-toxicity in one rule.
- No real, identifiable private individuals, ever. Real-entity names redact by default.
- Character `identity` blocks are human-edit-only and version-controlled.
- Kill switch pauses all playback ("TECHNICAL DIFFICULTIES — LINDA IS HANDLING IT").
- The characters are AI and every character bio says so. No sentience claims, ever.
