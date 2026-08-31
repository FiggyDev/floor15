import { test } from "node:test";
import assert from "node:assert/strict";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadMinds } from "../src/compiler.mjs";
import { loadEvents, deriveState } from "../src/ledger.mjs";
import { buildEdges } from "../src/relationships.mjs";
import { rollDay } from "../src/dice.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const minds = loadMinds(join(root, "minds"));
const st = deriveState(loadEvents(join(root, "canon/events.jsonl")));
const edges = buildEdges(st.relationshipDeltas);
const decksDir = join(root, "decks");

test("dice are deterministic per date (auditable, re-runnable)", () => {
  const a = rollDay("2026-09-01", { minds, edges, statuses: st.statuses, decksDir });
  const b = rollDay("2026-09-01", { minds, edges, statuses: st.statuses, decksDir });
  assert.deepEqual(a, b);
});

test("different dates roll differently", () => {
  const a = rollDay("2026-09-01", { minds, edges, statuses: st.statuses, decksDir });
  const b = rollDay("2026-09-02", { minds, edges, statuses: st.statuses, decksDir });
  assert.notDeepEqual(a, b);
});

test("dice pick WHO/WHEN from decks — WHAT is always a deck card id", () => {
  const r = rollDay("2026-09-03", { minds, edges, statuses: st.statuses, decksDir });
  assert.match(r.gossip.card, /^g\d\d$/);      // card id, never free text
  assert.match(r.bad_idea.card, /^b\d\d$/);
  assert.ok(Object.keys(minds).includes(r.gossip.spreader));
  assert.equal(typeof r.accidental_leak, "boolean"); // WHEN only; WHAT stays showrunner-flagged
});

test("fired agents are excluded from all rolls", () => {
  const statuses = { ...st.statuses, max: { status: "FIRED", until: "s2e01" } };
  for (const d of ["2026-09-01", "2026-09-02", "2026-09-03", "2026-09-04", "2026-09-05"]) {
    const r = rollDay(d, { minds, edges, statuses, decksDir });
    const names = [r.elevator_pairing?.a, r.elevator_pairing?.b, r.gossip.spreader, r.mood_swing.who, r.bad_idea.pitcher,
      r.late_night_message?.from, r.late_night_message?.to].filter(Boolean);
    assert.ok(!names.includes("max"), `fired agent rolled on ${d}: ${names.join(",")}`);
  }
});
