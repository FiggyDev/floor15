// The Dice — daily bounded randomness. Deterministic per date (auditable,
// re-runnable). Randomness picks WHEN and WHO. WHAT comes from showrunner
// decks or pre-flagged material. Every output is a SEED for human review,
// never published output.
import { readFileSync } from "node:fs";
import { rankPairs } from "./relationships.mjs";

function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function dateSeed(dateStr) {
  let h = 0;
  for (const ch of dateStr) h = (Math.imul(h, 31) + ch.charCodeAt(0)) | 0;
  return h;
}

export function rollDay(dateStr, { minds, edges, statuses, decksDir }) {
  const rnd = mulberry32(dateSeed(dateStr));
  const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
  const ids = Object.keys(minds);
  const gone = ids.filter((i) => ["FIRED", "FROZEN"].includes(statuses[i]?.status));

  // WHO: elevator pairing from the drama ranker, jittered among top 3
  const ranked = rankPairs(edges, ids, gone);
  const top = ranked.slice(0, Math.min(3, ranked.length));
  const pair = top.length ? top[Math.floor(rnd() * top.length)] : null;

  // WHAT comes from decks — dice only choose the card and the carrier
  const gossipDeck = JSON.parse(readFileSync(`${decksDir}/gossip.json`, "utf8")).cards;
  const badDeck = JSON.parse(readFileSync(`${decksDir}/bad_ideas.json`, "utf8")).cards;
  const alive = ids.filter((i) => !gone.includes(i));

  const rolls = {
    date: dateStr,
    elevator_pairing: pair ? { a: pair.a, b: pair.b, score: pair.score } : null,
    gossip: { card: pick(gossipDeck).id, spreader: pick(alive) },
    mood_swing: { who: pick(alive), axis: pick(["energy", "stress", "confidence"]), delta: Math.round((rnd() - 0.5) * 30) },
    bad_idea: { card: pick(badDeck).id, pitcher: pick(alive) },        // routes to Legal Says No
    accidental_leak: rnd() < 0.15,   // WHEN only; WHAT must be a leak_ok-flagged detail chosen by showrunner
    secret_meeting: rnd() < 0.10,
    late_night_message: rnd() < 0.20 ? { from: pick(alive), to: pick(alive) } : null,
  };
  if (rolls.late_night_message && rolls.late_night_message.from === rolls.late_night_message.to) {
    rolls.late_night_message = null; // no one texts themselves. except barry. no.
  }
  return rolls; // -> seeds file -> human review queue. Never straight to air.
}
