// Optional post-build step for the maintainers' preview mirror: emits standalone
// copies of the built page. In a normal checkout the mirror dir doesn't exist and
// this exits quietly — the build does not depend on it.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const dist = resolve(here, "../dist/index.html");
const MIRROR = process.env.F15_MIRROR_DIR ?? "../../../docs/ventures/floor15/site";
const outDir = resolve(here, MIRROR);
if (!existsSync(outDir)) {
  console.log("standalone emit: no mirror dir — skipped (normal outside the maintainer environment)");
  process.exit(0);
}
const html = readFileSync(dist, "utf8");

const banner = "<!-- GENERATED from ventures/floor15 (npm run build). Do not edit by hand. -->\n";
writeFileSync(resolve(outDir, "index.html"), banner + html);

// body.html: head children + body children, no document shell (artifact format)
const head = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i)?.[1] ?? "";
const body = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] ?? "";
const keep = head
  .replace(/<meta[^>]*>/gi, "")            // artifact shell provides charset/viewport
  .trim();
writeFileSync(resolve(outDir, "body.html"), banner + keep + "\n" + body.trim() + "\n");
console.log(`standalone + artifact copies emitted to ${outDir}`);
