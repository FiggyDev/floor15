# 2026-08-30 — The engine talks to the site

**What shipped:** a stable data contract between the Agent Engine and the site. Scenes export
through three gates (canon re-check, Linda re-scan, schema validation), a human flips
`approved`, and the frontend renders the result without knowing how the scene was made.
Day 1's "The Founding Address" is live — including an on-air redaction, rendered as an actual
bar with Linda's interruption under it.

**Why it matters:** the UI is now permanently decoupled from how scenes get written. Scripted
today, LLM-generated later — same contract, same gates, zero frontend changes.

**Screenshot/clip idea:** the Elevator Cam mid-scene: Max's sentence dies under the black bar,
"REVIEWED BY LEGAL · 1 REDACTION" glows under the lower-third.

**Test result:** engine 25/25 · site build green · language gate clean.

**Lore note:** the first scene ever published through the pipeline required a redaction.
Linda has already filed this fact under "told you."

**Next build:** the repo becomes part of the show. Bring your Floor 16 theories.
