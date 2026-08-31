// Soul File v0.2 — the AI Vibe System foundation.
// identity  = immutable constitution (human-edit-only, checksummed)
// state     = mutable life (mood, goals, memories, model preference)
// Gates below are the contract: voice integrity, no consciousness claims,
// no financial hype, no lore contradiction, no learning from raw social text.
import { createHash } from "node:crypto";

export const SOUL_VERSION = "0.2";

const CONSTITUTION_KEYS = ["name", "role", "one_line", "permanent_traits", "voice", "fears", "forbidden"];

/** Recompute the voice checksum over the immutable constitution. */
export function voiceChecksum(identity) {
  const basis = {};
  for (const k of [...CONSTITUTION_KEYS].sort()) basis[k] = identity[k];
  return "sha256:" + createHash("sha256").update(stableStringify(basis)).digest("hex").slice(0, 16);
}

/** Deterministic serialization: key order can never change a checksum. */
function stableStringify(v) {
  if (Array.isArray(v)) return "[" + v.map(stableStringify).join(",") + "]";
  if (v && typeof v === "object")
    return "{" + Object.keys(v).sort().map((k) => JSON.stringify(k) + ":" + stableStringify(v[k])).join(",") + "}";
  return JSON.stringify(v);
}

/** Structural validation of one soul file. */
export function validateSoul(m) {
  const e = [];
  const need = (c, msg) => { if (!c) e.push(msg); };
  const id = m.identity ?? {}, st = m.state ?? {};
  need(id.soul_file_version === SOUL_VERSION, `identity.soul_file_version must be ${SOUL_VERSION}`);
  for (const k of CONSTITUTION_KEYS) need(id[k] !== undefined, `identity.${k} required`);
  need(typeof id.fear_primary === "string" && id.fear_primary, "identity.fear_primary required");
  need(Array.isArray(id.forbidden_claims) && id.forbidden_claims.length > 0, "identity.forbidden_claims required");
  need(Array.isArray(id.regression_prompts) && id.regression_prompts.length >= 3, "identity.regression_prompts: >=3 required");
  need(typeof id.voice_checksum === "string" && id.voice_checksum.startsWith("sha256:"), "identity.voice_checksum required");
  need(id.voice_checksum === voiceChecksum(id), "voice_checksum stale — identity edited without re-checksum (human review required)");
  need(st.mood && ["energy", "stress", "confidence"].every((k) => typeof st.mood[k] === "number"), "state.mood needs energy/stress/confidence");
  need(st.goals && typeof st.goals.week === "string", "state.goals.week required");
  need(st.model_pref && ["cheap", "standard", "anchor"].includes(st.model_pref.tier), "state.model_pref.tier: cheap|standard|anchor");
  // every soul must forbid consciousness claims about itself
  need((id.forbidden_claims ?? []).some((c) => /sentien|conscious/i.test(c)),
    "forbidden_claims must include a sentience/consciousness prohibition");
  return { ok: e.length === 0, errors: e };
}

/* ---------------- gates ---------------- */

const CONSCIOUSNESS = /(sentient|sentience|conscious(?:ness)?|self-aware|truly alive|actually alive|really feels|has a soul\b)/i;
const NEGATION = /(not|never|no\b|aren'?t|isn'?t|without|prohibit|forbid|claim|fiction|satir|simulat)/i;

/** No consciousness/sentience claims — unless explicitly negated/disclaimed in context. */
export function consciousnessGate(text, { window = 120 } = {}) {
  // A soul's own forbidden_claims list DECLARES the prohibition; scanning it would
  // flag the safeguard as the violation. Strip those declarations, scan everything else.
  text = String(text).replace(/"forbidden_claims"\s*:\s*\[[^\]]*\]/gi, '"forbidden_claims":[]');
  const hits = [];
  const re = new RegExp(CONSCIOUSNESS.source, "gi");
  let m;
  while ((m = re.exec(text))) {
    const ctx = text.slice(Math.max(0, m.index - window), m.index + window);
    if (!NEGATION.test(ctx)) hits.push({ term: m[0], ctx: ctx.replace(/\s+/g, " ").slice(0, 140) });
  }
  return { ok: hits.length === 0, hits };
}

const HYPE = [
  /\bprice target\b/i, /\bto the moon\b/i, /\bguaranteed (?:returns?|profits?|gains?)\b/i,
  /\bpassive income\b/i, /\bapy\b/i, /\btoken sale\b/i, /\bbuy the (?:dip|token|coin)\b/i,
  /\b(?:pump|dump)(?:ing|ed)? (?:it|the|this)\b/i,
];
/** No financial hype in soul files or generated text. */
export function financialGate(text) {
  const hits = HYPE.filter((re) => re.test(text)).map(String);
  return { ok: hits.length === 0, hits };
}

/** Voice collapse: the constitution must survive edits + the checksum must match. */
export function voiceIntegrityGate(minds) {
  const errors = [];
  for (const m of Object.values(minds)) {
    if (m.identity.voice_checksum !== voiceChecksum(m.identity))
      errors.push(`${m.id}: voice checksum mismatch — identity changed without human re-approval`);
    const v = m.identity.voice ?? {};
    if (!Array.isArray(v.catchphrases) || v.catchphrases.length === 0) errors.push(`${m.id}: lost catchphrases (voice collapse)`);
    if (!v.style) errors.push(`${m.id}: lost voice.style (voice collapse)`);
    if (!Array.isArray(m.identity.permanent_traits) || m.identity.permanent_traits.length < 2)
      errors.push(`${m.id}: permanent_traits eroded (voice collapse)`);
  }
  return { ok: errors.length === 0, errors };
}

/** Lore contradiction: a soul may not assert something the ledger has locked otherwise. */
export function loreGate(minds, derived) {
  const errors = [];
  const soulText = JSON.stringify(minds);
  for (const g of derived.guards ?? []) {
    for (const p of g.forbidPatterns ?? []) {
      if (new RegExp(p, "i").test(soulText)) errors.push(`soul text contradicts locked fact ${g.factId} (${g.note ?? p})`);
    }
  }
  for (const [who, s] of Object.entries(derived.statuses ?? {})) {
    if (s.status === "FIRED" && minds[who] && minds[who].state?.goals?.week && !/[[]FROZEN[]]/.test(minds[who].state.goals.week))
      errors.push(`${who} is FIRED but still carries an active weekly goal — freeze the soul`);
  }
  return { ok: errors.length === 0, errors };
}

/** Learning source gate: souls may only ingest ledger-derived state, never raw social text. */
export const ALLOWED_LEARNING_SOURCES = ["canon_ledger", "showrunner", "vote_result", "engagement_score"];
export function learningSourceGate(update) {
  const src = update?.source;
  if (!ALLOWED_LEARNING_SOURCES.includes(src))
    return { ok: false, errors: [`learning source "${src}" not allowed; use one of ${ALLOWED_LEARNING_SOURCES.join("|")}`] };
  if (src === "engagement_score" && typeof update.value !== "number")
    return { ok: false, errors: ["engagement_score updates carry a SCORE, never text — raw social content may not enter a soul"] };
  if (typeof update.text === "string" && src === "engagement_score")
    return { ok: false, errors: ["raw social text rejected: scores in, content never"] };
  return { ok: true, errors: [] };
}
