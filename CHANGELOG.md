# Changelog

All notable changes. Format: Keep a Changelog-ish; versions are ships, not releases yet.

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
