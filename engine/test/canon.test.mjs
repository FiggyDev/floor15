import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { compileSeed, loadMinds } from "../src/compiler.mjs";
import { appendEvent, loadEvents, deriveState } from "../src/ledger.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const minds = loadMinds(join(root, "minds"));
const REAL_CANON = join(root, "canon/events.jsonl");

function tempCanon(lines) {
  const dir = mkdtempSync(join(tmpdir(), "f15-"));
  const p = join(dir, "events.jsonl");
  writeFileSync(p, lines.map((l) => JSON.stringify(l)).join("\n") + (lines.length ? "\n" : ""));
  return p;
}
const baseSeed = () => ({
  id: "t1", title: "Test", location: "break_room", cast: ["max", "roxy"],
  setup: "a test", conflict: "a conflict", scriptedLines: [{ who: "MAX", txt: "hello" }],
});

test("valid seed compiles against real canon", () => {
  const r = compileSeed(baseSeed(), { minds, canonPath: REAL_CANON });
  assert.equal(r.ok, true, r.errors.join("; "));
  assert.ok(r.context.max.identity.name === "Max Margin");
});

test("FIRED agent cannot appear — hard rejection", () => {
  const canon = tempCanon([
    { id: "x1", t: "2026-09-01T00:00:00Z", type: "status", who: "max", status: "FIRED", until: "s2e01", source: "vote:test" },
  ]);
  const r = compileSeed(baseSeed(), { minds, canonPath: canon });
  assert.equal(r.ok, false);
  assert.match(r.errors.join(" "), /CANON VIOLATION: max is FIRED/);
});

test("locked-fact guard rejects contradicting seed text", () => {
  const canon = tempCanon([
    { id: "x2", t: "2026-09-01T00:00:00Z", type: "fact", text: "budget is zero", locked: true, source: "s",
      guards: [{ forbidPatterns: ["budget (?:is|of) \\$[1-9]"], note: "budget is zero" }] },
  ]);
  const seed = { ...baseSeed(), setup: "Max celebrates because the budget is $4 million again." };
  const r = compileSeed(seed, { minds, canonPath: canon });
  assert.equal(r.ok, false);
  assert.match(r.errors.join(" "), /contradicts locked fact x2/);
});

test("unknown cast and location rejected", () => {
  const r = compileSeed({ ...baseSeed(), cast: ["max", "ghost"], location: "moon_base" }, { minds, canonPath: REAL_CANON });
  assert.equal(r.ok, false);
  assert.match(r.errors.join(" "), /unknown cast member: ghost/);
  assert.match(r.errors.join(" "), /unknown location: moon_base/);
});

test("information asymmetry: character cannot be seeded with a secret they don't hold", () => {
  const seed = { ...baseSeed(), cast: ["trixie", "max"], knows: { trixie: ["max_broke"] } };
  const r = compileSeed(seed, { minds, canonPath: REAL_CANON });
  assert.equal(r.ok, false);
  assert.match(r.errors.join(" "), /INFO ASYMMETRY VIOLATION: trixie/);
});

test("ledger is append-only and derives statuses/counters/strikes", () => {
  const canon = tempCanon([]);
  appendEvent(canon, { id: "a1", t: "2026-09-01T00:00:00Z", type: "strike", who: "max", text: "test strike", source: "s" });
  appendEvent(canon, { id: "a2", t: "2026-09-01T00:01:00Z", type: "counter", who: "max", counter: "predictions", delta: [0, 1], source: "s" });
  assert.throws(() => appendEvent(canon, { id: "bad" }), /missing/);
  const st = deriveState(loadEvents(canon));
  assert.equal(st.strikes.max.length, 1);
  assert.deepEqual(st.counters.max.predictions, [0, 1]);
});
