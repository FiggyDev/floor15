#!/usr/bin/env node
// FLOOR 15 engine CLI.
//   node src/engine.mjs validate                 — compile every seed against canon
//   node src/engine.mjs demo                     — build the Day 1 scene package -> out/
//   node src/engine.mjs dice [YYYY-MM-DD]        — roll the day's bounded randomness
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadMinds, compileSeed } from "./compiler.mjs";
import { loadEvents, deriveState } from "./ledger.mjs";
import { buildEdges } from "./relationships.mjs";
import { rollDay } from "./dice.mjs";
import { buildScenePackage } from "./scenes.mjs";
import { exportSite } from "./export-site.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CANON = join(root, "canon/events.jsonl");
const minds = loadMinds(join(root, "minds"));

const cmd = process.argv[2] ?? "validate";

if (cmd === "validate") {
  let bad = 0;
  for (const f of readdirSync(join(root, "seeds")).filter((x) => x.endsWith(".json"))) {
    const seed = JSON.parse(readFileSync(join(root, "seeds", f), "utf8"));
    const r = compileSeed(seed, { minds, canonPath: CANON });
    console.log(`${r.ok ? "OK  " : "FAIL"} ${f}${r.ok ? "" : "\n      " + r.errors.join("\n      ")}`);
    if (!r.ok) bad++;
  }
  process.exit(bad ? 1 : 0);
}

if (cmd === "demo") {
  const seed = JSON.parse(readFileSync(join(root, "seeds/s1e01-founding-address.json"), "utf8"));
  const compiled = compileSeed(seed, { minds, canonPath: CANON });
  if (!compiled.ok) { console.error("compile failed:", compiled.errors); process.exit(1); }
  const pkg = buildScenePackage(seed, compiled);
  if (!pkg.ok) { console.error("scene KILLED by Linda:", pkg.hits); process.exit(1); }
  const out = join(root, "out", `${seed.id}.scene.json`);
  writeFileSync(out, JSON.stringify(pkg, null, 2));
  console.log(`scene package -> ${out}`);
  console.log(`safety: ${pkg.safety.status} (${pkg.safety.hits.length} hit${pkg.safety.hits.length === 1 ? "" : "s"})`);
  console.log(`proposed consequences: ${pkg.proposedConsequences.length} (awaiting human approval — engine never self-appends)`);
  process.exit(0);
}

if (cmd === "dice") {
  const date = process.argv[3] ?? new Date().toISOString().slice(0, 10);
  const st = deriveState(loadEvents(CANON));
  const edges = buildEdges(st.relationshipDeltas);
  const rolls = rollDay(date, { minds, edges, statuses: st.statuses, decksDir: join(root, "decks") });
  const out = join(root, "out", `dice-${date}.json`);
  writeFileSync(out, JSON.stringify(rolls, null, 2));
  console.log(JSON.stringify(rolls, null, 2));
  console.log(`\n-> ${out} (seeds for human review; nothing airs from here directly)`);
  process.exit(0);
}

if (cmd === "approve") {
  // THE human gate. A person runs this; the pipeline never does.
  const id = process.argv[3];
  if (!id) { console.error("usage: engine.mjs approve <sceneId>"); process.exit(1); }
  const p = join(root, "out", `${id}.scene.json`);
  const pkg = JSON.parse(readFileSync(p, "utf8"));
  pkg.approved = true;
  pkg.status = "approved";
  pkg.airedAt = pkg.airedAt ?? new Date().toISOString();
  writeFileSync(p, JSON.stringify(pkg, null, 2));
  console.log(`approved: ${id} (status=${pkg.status}, airedAt=${pkg.airedAt})`);
  process.exit(0);
}

if (cmd === "export-site") {
  const target = process.argv[3] ?? join(root, "../src/generated/scenes.json");
  const r = exportSite({ outDir: join(root, "out"), canonPath: CANON, targetFile: target });
  console.log(`export-site: ${r.written} scene(s) -> ${r.targetFile}`);
  for (const s of r.skipped) console.log(`  skipped ${s.id}: ${s.reason}`);
  process.exit(0);
}

console.error(`unknown command: ${cmd}`);
process.exit(1);
