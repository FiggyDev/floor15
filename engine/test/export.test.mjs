import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, readFileSync, cpSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { exportSite } from "../src/export-site.mjs";
import { validateScenePackage } from "../src/schema.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CANON = join(root, "canon/events.jsonl");

function sandbox() {
  const dir = mkdtempSync(join(tmpdir(), "f15x-"));
  cpSync(join(root, "out"), join(dir, "out"), { recursive: true });
  return dir;
}

test("export-site produces valid JSON matching the v1 contract", () => {
  const dir = sandbox();
  const target = join(dir, "scenes.json");
  const r = exportSite({ outDir: join(dir, "out"), canonPath: CANON, targetFile: target });
  assert.ok(r.written >= 2);
  const payload = JSON.parse(readFileSync(target, "utf8"));
  assert.equal(payload.contract, "floor15.scene-package.v1");
  for (const s of payload.scenes) {
    const v = validateScenePackage(s);
    assert.ok(v.ok, `${s.id}: ${v.errors.join("; ")}`);
  }
});

test("approved flags survive export; the frontend's public filter has both kinds to work with", () => {
  const dir = sandbox();
  const target = join(dir, "scenes.json");
  exportSite({ outDir: join(dir, "out"), canonPath: CANON, targetFile: target });
  const { scenes } = JSON.parse(readFileSync(target, "utf8"));
  const approved = scenes.filter((s) => s.approved);
  const drafts = scenes.filter((s) => !s.approved);
  assert.ok(approved.some((s) => s.id === "s1e01"), "s1e01 approved");
  assert.ok(drafts.some((s) => s.id === "s1e02b"), "s1e02b still draft");
  for (const d of drafts) assert.equal(d.status, "draft");
});

test("redacted scene exports carry no forbidden phrase — not in text, not in hit metadata", () => {
  const dir = sandbox();
  const target = join(dir, "scenes.json");
  exportSite({ outDir: join(dir, "out"), canonPath: CANON, targetFile: target });
  const raw = readFileSync(target, "utf8").toLowerCase();
  assert.ok(!raw.includes("to the moon"), "original span leaked");
  assert.ok(!raw.includes("hodl"), "pattern text leaked");
  const { scenes } = JSON.parse(readFileSync(target, "utf8"));
  const s1 = scenes.find((s) => s.id === "s1e01");
  assert.equal(s1.safety.status, "REDACTED");
  const redactedLine = s1.lines.find((l) => l.redacted);
  assert.match(redactedLine.txt, /\[REDACTED\]/);
  const interruption = s1.lines.find((l) => l.interruption);
  assert.equal(interruption.who, "LINDA");
  assert.equal(s1.safety.hits[0].rule, "hype");           // opaque id only
  assert.equal(s1.safety.hits[0].pattern, undefined);     // never the regex source
});

test("a scene whose cast got FIRED after packaging cannot export", () => {
  const dir = sandbox();
  const firedCanon = join(dir, "events.jsonl");
  cpSync(CANON, firedCanon);
  writeFileSync(firedCanon, readFileSync(CANON, "utf8") +
    JSON.stringify({ id: "cv-t1", t: "2026-09-08T00:00:00Z", type: "status", who: "max", status: "FIRED", until: "s2e01", source: "vote:test" }) + "\n");
  const target = join(dir, "scenes.json");
  const r = exportSite({ outDir: join(dir, "out"), canonPath: firedCanon, targetFile: target });
  const ids = JSON.parse(readFileSync(target, "utf8")).scenes.map((s) => s.id);
  assert.ok(!ids.includes("s1e01"), "s1e01 (max in cast) must not export");
  assert.ok(!ids.includes("s1e02b"), "s1e02b (max in cast) must not export");
  assert.ok(r.skipped.some((s) => /FIRED/.test(s.reason)));
});

test("a hand-edited package cannot smuggle forbidden text past export (Linda re-scan)", () => {
  const dir = sandbox();
  const p = join(dir, "out/s1e02b.scene.json");
  const pkg = JSON.parse(readFileSync(p, "utf8"));
  pkg.lines.push({ who: "MAX", txt: "Everyone should buy before Friday, trust me." });
  writeFileSync(p, JSON.stringify(pkg));
  const target = join(dir, "scenes.json");
  const r = exportSite({ outDir: join(dir, "out"), canonPath: CANON, targetFile: target });
  const ids = JSON.parse(readFileSync(target, "utf8")).scenes.map((s) => s.id);
  assert.ok(!ids.includes("s1e02b"));
  assert.ok(r.skipped.some((s) => /KILL/.test(s.reason)));
});
