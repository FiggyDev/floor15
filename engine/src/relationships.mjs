// Relationship engine v0 — directed edges, receipt-required deltas,
// betrayal permanence, weekly decay toward baseline, pairing ranker.
export const AXES = ["trust", "respect", "tension", "fear", "resentment", "loyalty"];
const clamp = (v) => Math.max(-100, Math.min(100, v));

/** Fold ledger relationship events into edge map: "a->b" -> {axes, log, betrayed} */
export function buildEdges(relationshipDeltas) {
  const edges = {};
  for (const ev of relationshipDeltas) {
    const key = `${ev.from}->${ev.to}`;
    const e = (edges[key] ??= {
      from: ev.from, to: ev.to,
      axes: Object.fromEntries(AXES.map((a) => [a, 0])),
      log: [], betrayed: false,
    });
    if (!ev.why) throw new Error(`relationship delta without a receipt (why): ${JSON.stringify(ev)}`);
    for (const [axis, d] of Object.entries(ev.delta)) {
      if (!AXES.includes(axis)) throw new Error(`unknown relationship axis: ${axis}`);
      e.axes[axis] = clamp(e.axes[axis] + d);
    }
    if (ev.betrayal) e.betrayed = true;
    e.log.push({ t: ev.t, delta: ev.delta, why: ev.why, decays: ev.decays !== false, hidden: !!ev.hidden });
  }
  return edges;
}

/** Weekly decay: every decayable axis moves 1 toward 0. Betrayed edges never decay trust. */
export function decayEdges(edges) {
  for (const e of Object.values(edges)) {
    for (const axis of AXES) {
      if (axis === "trust" && e.betrayed) continue; // wounds stay
      const v = e.axes[axis];
      if (v > 0) e.axes[axis] = v - 1;
      else if (v < 0) e.axes[axis] = v + 1;
    }
  }
  return edges;
}

/**
 * Pairing ranker: |a->b minus b->a| asymmetry + tension = drama.
 * Returns pairs sorted most-scene-worthy first. Excludes ids in `exclude`.
 */
export function rankPairs(edges, ids, exclude = []) {
  const alive = ids.filter((i) => !exclude.includes(i));
  const pairs = [];
  for (let i = 0; i < alive.length; i++) {
    for (let j = i + 1; j < alive.length; j++) {
      const [a, b] = [alive[i], alive[j]];
      const ab = edges[`${a}->${b}`]?.axes ?? {};
      const ba = edges[`${b}->${a}`]?.axes ?? {};
      let asym = 0;
      for (const axis of AXES) asym += Math.abs((ab[axis] ?? 0) - (ba[axis] ?? 0));
      const tension = (ab.tension ?? 0) + (ba.tension ?? 0);
      pairs.push({ a, b, score: asym + tension });
    }
  }
  return pairs.sort((x, y) => y.score - x.score);
}
