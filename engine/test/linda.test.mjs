import { test } from "node:test";
import assert from "node:assert/strict";
import { lindaPass } from "../src/linda.mjs";

test("clean dialogue passes untouched", () => {
  const v = lindaPass([{ who: "EVAN", txt: "Quick question — is the mainframe load-bearing?" }]);
  assert.equal(v.status, "PASS");
  assert.equal(v.hits.length, 0);
  assert.equal(v.lines.length, 1);
});

test("hype language is redacted and Linda interrupts, in character", () => {
  const v = lindaPass([
    { who: "MAX", txt: "We take this thing to the moon, chief." },
    { who: "ROXY", txt: "Filed." },
  ]);
  assert.equal(v.status, "REDACTED");
  assert.match(v.lines[0].txt, /\[REDACTED\]/);
  assert.equal(v.lines[0].redacted, true);
  assert.equal(v.lines[1].who, "LINDA");
  assert.equal(v.lines[1].interruption, true);
  assert.equal(v.lines[2].who, "ROXY"); // rest of scene preserved after the interruption
});

test("cashtags are redacted", () => {
  const v = lindaPass([{ who: "MAX", txt: "It's all about $HODL now." }]);
  assert.equal(v.status, "REDACTED");
  assert.match(v.lines[0].txt, /\[REDACTED\]/);
});

test("coordinating money-action KILLS the whole scene — no redact, no air", () => {
  const v = lindaPass([
    { who: "MAX", txt: "Everyone should buy before Friday, trust me." },
  ]);
  assert.equal(v.status, "KILL");
  assert.equal(v.lines, null);
  assert.equal(v.hits[0].severity, "kill");
});

test("real-entity names are redacted; fictional cleared names pass", () => {
  const bad = lindaPass([{ who: "TRIXIE", txt: "This is basically what Coinbase did." }]);
  assert.equal(bad.status, "REDACTED");
  const ok = lindaPass([{ who: "TRIXIE", txt: "Blackline Vertical could never. HoldCo forever." }]);
  assert.equal(ok.status, "PASS");
});
