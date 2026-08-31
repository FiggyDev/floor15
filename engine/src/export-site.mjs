// export-site — turn engine scene packages into the frontend data file.
// The frontend never learns HOW a scene was made; it only gets the contract.
// Re-compiles every package's cast against CURRENT canon at export time:
// a scene that was fine yesterday cannot export today if its cast got fired.
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { validateScenePackage } from "./schema.mjs";
import { loadEvents, deriveState } from "./ledger.mjs";
import { lindaPass } from "./linda.mjs";

export function exportSite({ outDir, canonPath, targetFile }) {
  const st = deriveState(loadEvents(canonPath));
  const scenes = [];
  const skipped = [];

  for (const f of readdirSync(outDir).filter((x) => x.endsWith(".scene.json")).sort()) {
    const pkg = JSON.parse(readFileSync(join(outDir, f), "utf8"));

    // canon re-check at export time: FIRED/FROZEN cast blocks export, always
    const gone = pkg.cast.filter((who) => ["FIRED", "FROZEN"].includes(st.statuses[who]?.status));
    if (gone.length) { skipped.push({ id: pkg.id, reason: `cast ${gone.join(",")} is FIRED/FROZEN` }); continue; }

    // safety re-check: exported text must still pass Linda (belt AND suspenders —
    // a hand-edited out/ file cannot smuggle a forbidden phrase to the site)
    const v = lindaPass(pkg.lines.filter((l) => !l.interruption));
    if (v.status === "KILL") { skipped.push({ id: pkg.id, reason: "Linda KILL on export re-scan" }); continue; }

    const check = validateScenePackage(pkg);
    if (!check.ok) { skipped.push({ id: pkg.id, reason: "schema: " + check.errors.join("; ") }); continue; }

    scenes.push(pkg);
  }

  const payload = {
    contract: "floor15.scene-package.v1",
    generatedAt: new Date().toISOString(),
    scenes,   // both approved and draft; the FRONTEND filters: public = approved only
  };
  mkdirSync(join(targetFile, ".."), { recursive: true });
  writeFileSync(targetFile, JSON.stringify(payload, null, 2));
  return { written: scenes.length, skipped, targetFile };
}
