// Build gate: the LAUNCH RULE, enforced. Fails the build if forbidden
// financial-hype language appears outside the allowlisted safe-harbor copy.
import { readFileSync } from "node:fs";
const html = readFileSync(new URL("../dist/index.html", import.meta.url), "utf8").toLowerCase();
const forbidden = [/token sale/, /\bpump\b/, /buy the (dip|token|coin)/, /price target/, /\bapy\b/, /passive income/, /guaranteed return/, /to the moon/, /\bhodl\b/, /financial freedom/];
const hits = forbidden.filter((re) => re.test(html));
if (hits.length) { console.error("LANGUAGE GATE FAILED:", hits.map(String).join(", ")); process.exit(1); }
console.log("language gate: clean");
