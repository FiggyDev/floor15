// Scene compiler — validates a seed against canon BEFORE any generation.
// Rejections are hard errors with reasons; nothing impossible reaches the model.
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { loadEvents, deriveState } from "./ledger.mjs";

export const LOCATIONS = [
  "main_floor", "boardroom", "break_room", "elevator", "merch_warehouse",
  "ceo_office", "hr_office", "rooftop_bar", "trading_pit", "hr_corridor",
];

export function loadMinds(dir) {
  const minds = {};
  for (const f of readdirSync(dir).filter((x) => x.endsWith(".json"))) {
    const m = JSON.parse(readFileSync(join(dir, f), "utf8"));
    minds[m.id] = m;
  }
  return minds;
}

/**
 * compileSeed(seed, {minds, canonPath}) -> { ok, errors[], context? }
 * Checks: cast exists · nobody FIRED/FROZEN · location known · scripted/generated
 * text guards from locked facts · secret visibility (a character can only be
 * seeded with knowledge their mind file says they hold).
 */
export function compileSeed(seed, { minds, canonPath }) {
  const errors = [];
  const st = deriveState(loadEvents(canonPath));

  for (const k of ["id", "title", "location", "cast", "conflict"]) {
    if (!seed[k] || (Array.isArray(seed[k]) && !seed[k].length)) errors.push(`seed missing ${k}`);
  }
  if (errors.length) return { ok: false, errors };

  if (!LOCATIONS.includes(seed.location)) errors.push(`unknown location: ${seed.location}`);
  if (seed.cast.length < 1 || seed.cast.length > 4) errors.push(`cast size ${seed.cast.length} (must be 1-4)`);

  for (const who of seed.cast) {
    if (!minds[who]) { errors.push(`unknown cast member: ${who}`); continue; }
    const s = st.statuses[who];
    if (s && (s.status === "FIRED" || s.status === "FROZEN")) {
      errors.push(`CANON VIOLATION: ${who} is ${s.status}${s.until ? ` until ${s.until}` : ""} and cannot appear`);
    }
  }

  // locked-fact guards apply to any text the seed carries (scripted lines, setup)
  const text = [seed.setup ?? "", seed.conflict ?? "", ...(seed.scriptedLines ?? []).map((l) => l.txt)].join("\n");
  for (const g of st.guards) {
    for (const p of g.forbidPatterns ?? []) {
      if (new RegExp(p, "i").test(text)) {
        errors.push(`CANON VIOLATION: seed contradicts locked fact ${g.factId} (${g.note ?? p})`);
      }
    }
  }

  // secret visibility: seed.knows = { who: [secretId] } must match mind files
  for (const [who, secretIds] of Object.entries(seed.knows ?? {})) {
    for (const sid of secretIds) {
      const holder = Object.values(minds).find((m) => m.state.secrets.some((x) => x.id === sid));
      if (!holder) { errors.push(`unknown secret: ${sid}`); continue; }
      const sec = holder.state.secrets.find((x) => x.id === sid);
      const mayKnow = holder.id === who || sec.known_by.includes(who);
      if (!mayKnow) errors.push(`INFO ASYMMETRY VIOLATION: ${who} does not know secret ${sid}`);
    }
  }

  if (errors.length) return { ok: false, errors };

  // context packet per character (what a generator would receive) — v0 shape only
  const context = Object.fromEntries(
    seed.cast.map((who) => {
      const m = minds[who];
      return [who, {
        identity: m.identity,
        mood: m.state.mood,
        goal: m.state.goals.week,
        strikes: st.strikes[who]?.length ?? 0,
        knows: (seed.knows?.[who] ?? []),
      }];
    })
  );
  return { ok: true, errors: [], context, derived: st };
}
