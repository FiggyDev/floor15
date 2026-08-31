// Scene output format — what the frontend renders. The frontend never
// knows whether lines were scripted, generated, or dice-assisted: the
// package shape is the contract (src/schema.mjs / site scene-schema.ts).
import { lindaPass } from "./linda.mjs";

/**
 * buildScenePackage(seed, compiled) -> render-ready package or KILL error.
 * v0: dialogue comes from seed.scriptedLines (hand-written or template).
 * LATER: a generate() step replaces scriptedLines using compiled.context —
 * the package shape does not change, which is the point.
 */
export function buildScenePackage(seed, compiled, { now = new Date().toISOString() } = {}) {
  const verdict = lindaPass(seed.scriptedLines);
  if (verdict.status === "KILL") {
    return { ok: false, killed: true, hits: verdict.hits };
  }
  const consequences = seed.consequences ?? [];
  const pkg = {
    ok: true,
    id: seed.id,
    title: seed.title.toUpperCase(),
    time_block: seed.time_block ?? null,
    location: seed.location,
    cast: seed.cast,
    setup: seed.setup ?? "",
    conflict: seed.conflict ?? "",
    floors: seed.floors ?? null,               // elevator scenes: {from,to}; others null
    lowerThirds: seed.lowerThirds ?? [],       // [[NAME, JOKE TITLE], ...]
    lines: verdict.lines,                      // [{who|null, txt, direction?, redacted?, interruption?}]
    safety: { status: verdict.status, hits: verdict.hits },
    bestQuote: seed.bestQuote ?? null,         // {txt, who} | null
    clipMoment: seed.clipMoment ?? null,
    hook: seed.hook ?? null,
    proposedConsequences: consequences,        // ledger entries; human approves before append
    canonRefs: consequences.map((c) =>
      c.type === "fact" ? `FACT: ${c.text}` :
      c.type === "counter" ? `COUNTER: ${c.who}.${c.counter} +[${c.delta}]` :
      c.type === "relationship" ? `REL: ${c.from}→${c.to} ${Object.entries(c.delta).map(([a, d]) => `${a}${d > 0 ? "+" : ""}${d}`).join(",")} (${c.why})` :
      c.type === "strike" ? `STRIKE: ${c.who} — ${c.text}` :
      `${(c.type ?? "event").toUpperCase()}`),
    generatedAt: now,
    airedAt: null,
    status: "draft",                           // draft -> approved -> aired
    approved: false,                           // flipped by a HUMAN (engine.mjs approve), never by the engine pipeline
  };
  return pkg;
}
