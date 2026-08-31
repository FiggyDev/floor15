// THE site data contract — one stable shape for every scene the frontend
// renders, regardless of whether it was scripted, generated, or dice-assisted.
// Mirrored in TypeScript at ../src/scene-schema.ts. Change BOTH or neither.
export const SCENE_STATUS = ["draft", "approved", "aired"];

export function validateScenePackage(p) {
  const errors = [];
  const need = (cond, msg) => { if (!cond) errors.push(msg); };

  need(typeof p.id === "string" && p.id, "id: string required");
  need(typeof p.title === "string" && p.title, "title: string required");
  need(typeof p.location === "string" && p.location, "location: string required");
  need(Array.isArray(p.cast) && p.cast.length >= 1, "cast: non-empty array required");
  need(SCENE_STATUS.includes(p.status), `status: one of ${SCENE_STATUS.join("|")}`);
  need(p.airedAt === null || typeof p.airedAt === "string", "airedAt: ISO string or null");
  need(typeof p.approved === "boolean", "approved: boolean required");
  need(typeof p.setup === "string", "setup: string required");
  need(typeof p.conflict === "string", "conflict: string required");

  need(Array.isArray(p.lines) && p.lines.length > 0, "lines: non-empty array required");
  for (const [i, l] of (p.lines ?? []).entries()) {
    need(l.who === null || typeof l.who === "string", `lines[${i}].who: string|null`);
    need(typeof l.txt === "string" && l.txt.length > 0, `lines[${i}].txt: string required`);
    // redacted?: true — txt then contains the [REDACTED] token, never the original span
    if (l.redacted) need(l.txt.includes("[REDACTED]"), `lines[${i}]: redacted line must carry [REDACTED] token`);
  }

  need(Array.isArray(p.lowerThirds), "lowerThirds: array of [name,title] pairs");
  for (const [i, lt] of (p.lowerThirds ?? []).entries()) {
    need(Array.isArray(lt) && lt.length === 2, `lowerThirds[${i}]: [name, title] pair`);
  }

  need(p.safety && ["PASS", "REDACTED"].includes(p.safety.status), "safety.status: PASS|REDACTED (KILLed scenes never become packages)");
  need(Array.isArray(p.safety?.hits ?? null), "safety.hits: array");
  need(p.bestQuote === null || (typeof p.bestQuote?.txt === "string" && typeof p.bestQuote?.who === "string"), "bestQuote: {txt,who}|null");
  need(p.clipMoment === null || typeof p.clipMoment === "string", "clipMoment: string|null");
  need(p.hook === null || typeof p.hook === "string", "hook: string|null");
  need(p.floors === null || (typeof p.floors?.from === "number" && typeof p.floors?.to === "number"), "floors: {from,to}|null");
  need(Array.isArray(p.proposedConsequences), "proposedConsequences: array");
  need(Array.isArray(p.canonRefs), "canonRefs: array of strings");

  return { ok: errors.length === 0, errors };
}
