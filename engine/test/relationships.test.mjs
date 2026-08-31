import { test } from "node:test";
import assert from "node:assert/strict";
import { buildEdges, decayEdges, rankPairs } from "../src/relationships.mjs";

const ev = (from, to, delta, extra = {}) => ({
  t: "2026-09-01T00:00:00Z", type: "relationship", from, to, delta, why: "test receipt", source: "s", ...extra,
});

test("deltas fold and clamp at ±100", () => {
  const edges = buildEdges([ev("a", "b", { trust: -80 }), ev("a", "b", { trust: -50 })]);
  assert.equal(edges["a->b"].axes.trust, -100);
});

test("every delta requires a receipt (why)", () => {
  assert.throws(() => buildEdges([{ t: "x", type: "relationship", from: "a", to: "b", delta: { trust: 1 }, source: "s" }]), /receipt/);
});

test("decay moves ordinary wounds toward baseline; betrayal trust never decays", () => {
  const edges = buildEdges([
    ev("a", "b", { trust: -3, tension: 2 }),
    ev("c", "d", { trust: -50 }, { betrayal: true }),
  ]);
  decayEdges(edges);
  assert.equal(edges["a->b"].axes.trust, -2);
  assert.equal(edges["a->b"].axes.tension, 1);
  assert.equal(edges["c->d"].axes.trust, -50); // the wound stays
  assert.equal(edges["c->d"].betrayed, true);
});

test("pairing ranker surfaces asymmetric high-tension pairs first", () => {
  const edges = buildEdges([
    ev("max", "roxy", { tension: 60, trust: -30 }),   // max feels a lot
    ev("roxy", "max", { tension: 5 }),                // roxy feels little — asymmetry = drama
    ev("barry", "evan", { trust: 10 }),
    ev("evan", "barry", { trust: 12 }),               // symmetric warmth = low rank
  ]);
  const ranked = rankPairs(edges, ["max", "roxy", "barry", "evan"]);
  assert.deepEqual([ranked[0].a, ranked[0].b].sort(), ["max", "roxy"]);
  const warm = ranked.find((p) => [p.a, p.b].sort().join() === "barry,evan");
  assert.ok(ranked[0].score > warm.score);
});

test("excluded (fired) ids never appear in pairs", () => {
  const edges = buildEdges([ev("max", "roxy", { tension: 90 })]);
  const ranked = rankPairs(edges, ["max", "roxy", "linda"], ["max"]);
  assert.ok(ranked.every((p) => p.a !== "max" && p.b !== "max"));
});
