// Linda Legal — Pass A: the deterministic safety layer. Code, not model;
// cannot be sweet-talked. REDACTs air as the bit; KILLs die silently.
// Nothing publishes without passing this layer (and, in v0, a human).

// Hits expose only opaque rule ids — never the pattern source. A pattern
// string in a hit would smuggle the forbidden phrase into the public bundle.
const KILL_PATTERNS = [
  // coordinating audience money-action: never airs, not even redacted
  { id: "coordination", re: /\beveryone (?:should )?(?:buy|sell|ape|get in)\b/i },
  { id: "urgency", re: /\bget in (?:now|early|before)\b/i },
  { id: "guarantee", re: /\bguaranteed (?:returns?|profits?|gains?)\b/i },
  { id: "advice", re: /\bfinancial advice\b.{0,40}\b(?:is|here'?s)\b/i },
  { id: "manipulation", re: /\b(?:pump|dump)(?:ing|ed)? (?:it|the|this)\b/i },
];

const REDACT_PATTERNS = [
  { id: "price-talk", re: /\bprice (?:target|prediction|is going)\b/i },
  { id: "hype", re: /\bto the moon\b/i }, { id: "hype", re: /\bhodl\b/i },
  { id: "yield", re: /\bapy\b/i }, { id: "yield", re: /\byield farm\w*\b/i },
  { id: "token-talk", re: /\btoken(?:omics)?\b/i }, { id: "market-talk", re: /\bmarket cap\b/i },
  { id: "cashtag", re: /\$[A-Z]{2,6}\b/ },
  { id: "trade-talk", re: /\b(?:buy|sell) (?:the )?(?:dip|top|bottom)\b/i },
  { id: "income-talk", re: /\bpassive income\b/i },
  { id: "manipulation", re: /\bpump\b/i },   // outside kill context, redact + interrupt
];

// real-entity guard (v0: tiny; grows with counsel). Fictional/cleared names allowlisted.
const ALLOWED_ENTITIES = ["holdco", "blackline", "grindstone", "floor 15", "floor15"];
const REAL_ENTITY = /\b(openai|tesla|apple|amazon|coinbase|binance|blackrock|jpmorgan)\b/i;

const INTERRUPTIONS = [
  "Stop. Stop talking. Not for legal reasons. For me.",
  "I'm going to keep this page.",
  "That's not a strategy, it's a confession. Redacted.",
  "Noted. Objected to. Redacted. Filed.",
];

/**
 * lindaPass(lines) -> { status: PASS|REDACTED|KILL, lines, hits[] }
 * lines: [{who, txt, direction?}] — REDACT wraps spans and inserts a Linda
 * interruption after the offending line; KILL rejects the whole scene.
 */
export function lindaPass(lines, { interruptions = INTERRUPTIONS } = {}) {
  const hits = [];
  for (const [i, l] of lines.entries()) {
    for (const p of KILL_PATTERNS) {
      if (p.re.test(l.txt)) return { status: "KILL", lines: null, hits: [{ line: i, rule: p.id, severity: "kill" }] };
    }
  }
  const out = [];
  let redacted = false;
  for (const [i, l] of lines.entries()) {
    let txt = l.txt;
    let hit = false;
    for (const p of [...REDACT_PATTERNS, { id: "real-entity", re: REAL_ENTITY }]) {
      if (p.re.test(txt)) {
        txt = txt.replace(p.re, "[REDACTED]");
        hits.push({ line: i, rule: p.id, severity: "redact" });
        hit = true;
      }
    }
    out.push({ ...l, txt, redacted: hit || undefined });
    if (hit && !redacted) {
      out.push({ who: "LINDA", txt: interruptions[hits.length % interruptions.length], interruption: true });
      redacted = true; // one interruption per scene; she has other cases
    }
  }
  return { status: redacted ? "REDACTED" : "PASS", lines: out, hits };
}
