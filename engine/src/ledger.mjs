// Canon Ledger — append-only JSONL. The single source of truth.
// Nothing edits; corrections are new entries referencing old ones.
import { readFileSync, appendFileSync, existsSync } from "node:fs";

export function loadEvents(path) {
  if (!existsSync(path)) return [];
  return readFileSync(path, "utf8")
    .split("\n")
    .filter((l) => l.trim())
    .map((l, i) => {
      try { return JSON.parse(l); }
      catch { throw new Error(`ledger corrupt at line ${i + 1}`); }
    });
}

export function appendEvent(path, ev) {
  for (const k of ["id", "t", "type", "source"]) {
    if (!ev[k]) throw new Error(`ledger append rejected: missing ${k}`);
  }
  appendFileSync(path, JSON.stringify(ev) + "\n");
  return ev;
}

/** Fold the event stream into derived state. Pure; call with loadEvents(). */
export function deriveState(events) {
  const st = {
    statuses: {},        // who -> { status, until }
    counters: {},        // who -> { name: [num, den] }
    strikes: {},         // who -> [texts]
    lockedFacts: [],     // events with locked:true
    guards: [],          // flattened guard objects from locked facts
    relationshipDeltas: [], // raw relationship events, for the relationship engine
    openMysteries: [],
    log: events,
  };
  for (const ev of events) {
    switch (ev.type) {
      case "status":
        st.statuses[ev.who] = { status: ev.status, until: ev.until ?? null };
        break;
      case "counter": {
        const c = (st.counters[ev.who] ??= {});
        const cur = c[ev.counter] ?? [0, 0];
        c[ev.counter] = [cur[0] + ev.delta[0], cur[1] + ev.delta[1]];
        break;
      }
      case "strike":
        (st.strikes[ev.who] ??= []).push(ev.text);
        break;
      case "fact":
        if (ev.locked) {
          st.lockedFacts.push(ev);
          for (const g of ev.guards ?? []) st.guards.push({ ...g, factId: ev.id });
        }
        break;
      case "relationship":
        st.relationshipDeltas.push(ev);
        break;
      case "mystery":
        if (ev.resolution == null) st.openMysteries.push(ev);
        break;
      default:
        break; // vote_result, sponsor, override: kept in log, no derived handling in v0
    }
  }
  return st;
}
