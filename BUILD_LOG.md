# FLOOR 15 — Build Log

*One entry per ship. The repeatable format lives in `docs/public-updates/TEMPLATE.md`.
Newest first. The repo is part of the show; the build log is its bootleg tape.*

---

## 2026-08-30 — Engine ↔ Site integration
- **Shipped:** the data contract (`floor15.scene-package.v1`), `engine approve` (the human
  gate as a command), `export-site` with three gates, Day 1 scene live on the site with the
  redaction bar rendered in-world.
- **Why it matters:** the frontend can no longer tell scripted from generated from
  dice-assisted. That's the whole interface, forever.
- **Screenshot/clip idea:** the Elevator Cam playing THE FOUNDING ADDRESS — black bar mid-line,
  Linda's interruption, "REVIEWED BY LEGAL · 1 REDACTION" under the lower-third.
- **Tests:** engine 25/25 · site build green · language gate clean.
- **Lore note:** the first scene ever exported to the public site contains a redaction. Of
  course it does. Max talked.
- **Next build:** GitHub goes public; issues become part of the show.

## 2026-08-30 — Agent Engine v0
- **Shipped:** 7 mind files, append-only Canon Ledger, scene compiler, relationship engine,
  deterministic dice, Linda Pass A, 20 tests.
- **Why it matters:** fired agents cannot compile into scenes. Canon is code, not vibes.
- **Tests:** 20/20.
- **Lore note:** the demo's first run got KILLED by Linda — Max tried to say "pump the—" and
  the gate refused to air it at all. The safety layer's first save predates the audience.
- **Next build:** wire the engine into the site.

## 2026-08-30 — Site MVP
- **Shipped:** live floor, elevator cam, cast, personnel files, board voting mock, sponsor
  inventory, clip lab, after-hours palette. Single-file production build.
- **Why it matters:** it feels like a channel, not a landing page.
- **Tests:** tsc strict + language gate green; desktop + mobile verified in-browser.
- **Lore note:** the 16 button on the elevator rail flickers every nine seconds. Unprovoked.
- **Next build:** the engine.
