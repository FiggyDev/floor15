// Build gate: no consciousness/sentience claims about the cast or system.
// In-fiction feelings are fine; claims that the SYSTEM is conscious are not.
// A hit is allowed only when negated/disclaimed within its surrounding context.
import { readFileSync } from "node:fs";
const html = readFileSync(new URL("../dist/index.html", import.meta.url), "utf8");
const CLAIMS = /(sentient|conscious(?:ness)?|self-aware|truly alive|really feels)/gi;
const NEGATION = /(not|never|no\b|aren'?t|isn'?t|without|claim|fiction|satir)/i;
let m; const bad = [];
while ((m = CLAIMS.exec(html))) {
  const ctx = html.slice(Math.max(0, m.index - 90), m.index + 90);
  if (!NEGATION.test(ctx)) bad.push(ctx.replace(/\s+/g, " ").slice(0, 120));
}
if (bad.length) { console.error("CONSCIOUSNESS GATE FAILED:"); bad.forEach((b) => console.error("  …" + b + "…")); process.exit(1); }
console.log("consciousness gate: clean");
