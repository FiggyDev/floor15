# Changelog

All notable changes. Format: Keep a Changelog-ish; versions are ships, not releases yet.

## [0.6.0] — 2026-08-31 — the living world
### Added
- Six zones in one scene: Floor 15 office, lobby cafe, boardroom interior, rooftop bar,
  residence hallway, Floor 16 tease (silhouettes, one lamp, a blinking red light)
- Movement: waypoint walking with arm swing + step bob, turn-toward-speaker, talking gestures,
  ambient wandering to points of interest (Roxy walks slower and abstains — canon)
- Cameras: wide/desk/elevator/boardroom/legal/orbit/follow + cafe/rooftop/hallway/floor16;
  glide within a zone, hard cut between zones
- Elevator world nav (PH/17/16/ROOF/15/RES/L — locked floors stay locked, 16 flickers)
- Visible daily schedule strip (coffee → standup → desk → gossip → incident → elevator → COB →
  after hours → 02:07)
- Soul File cards: mood, current goal, relationship tension, latest canon memory
- 7 clip routes (#loop, #loop-office, #loop-legal, #loop-cafe, #loop-rooftop, #loop-hallway,
  #loop-16) + #loops recording menu
- Scene metadata drives location/camera via locationToMode(); engine scenes carry `location`
- Expressive faces (eye whites, pupils, glints, cheeks, resting smile vs. talking mouth),
  blinking, contact shadows, hemisphere light, readable night mode, dual-layer skylines
- **Consciousness gate** in the build: fails on sentience/consciousness claims unless negated

## [0.5.0] — 2026-08-31 — the 3D office
### Added
- three.js cartoon office (toon shading, outlines, procedural only, zero assets): skyline glass
  wall, corner office + putting green, fish tank with swimming fish, ping-pong + beer-pong cups,
  velvet rope, disco ball, neon SHIP IT sign, crashing-chart TV, Employee of the Month (the
  coffee machine, posthumous), pendant lights, plants, cash confetti
- Cartoon characters with faces, hair silhouettes, signature props, talking mouths, speaker rings
- Camera system: wide/desk/boardroom/legal/elevator/loop with glide transitions
- 3D elevator car (doors, interior, occupants) wired to the existing scene contract; #loop now 3D
- Design identity pass: Bricolage Grotesque / Instrument Sans / Space Mono, asymmetric-corner
  cards, skewed broadcast buttons
- WebGL failure falls back to the v0.4 2D animated stage (kept intact)
### Baseline
- v0.4 preserved: tag v0.4.0-animated-floor-baseline + branch stable/animated-floor-baseline

## [0.4.0] — 2026-08-31 — animated floor
### Added
- SVG character sprites for the Launch Seven (idle/blink/talking states, signature props)
- Animated office stage (desks, monitors, wall, Floor 16 window) replacing card grid
- Elevator car view: doors, sprites, in-frame REDACTED sweep
- `#loop` route: choreographed ~26s social-recording scene (redaction beat, dial spike,
  16 flash, title card), full-bleed, loops forever
- All pure CSS/SVG; reduced-motion respected; no image assets

## [0.3.0] — 2026-08-30 — engine-integrated
### Added
- Scene data contract `floor15.scene-package.v1` (engine validator + TS mirror)
- `engine approve <id>` (human gate) · `engine export-site` (canon re-check + Linda re-scan + schema)
- Engine scenes render in Scene Feed and Elevator Cam; redaction bar + Linda interruption +
  safety marker; approved-only public filtering; INTERNAL PREVIEW labeling for drafts
- 5 export tests (25 total)
### Fixed
- Safety hits leaked regex source (and thus forbidden phrases) into the public bundle —
  caught by the site language gate; hits now carry opaque rule ids. Test added.

## [0.2.0] — 2026-08-30 — agent engine v0
### Added
- Mind files (7), append-only Canon Ledger, scene compiler (fired/locked/asymmetry rejection),
  6-axis relationship engine, deterministic daily dice, Linda Pass A, scene packages,
  Day 1 sample, 20 tests

## [0.1.0] — 2026-08-30 — site MVP
### Added
- Full show site (Vite+React+TS, single-file build), language gate in the build,
  standalone/artifact emit
