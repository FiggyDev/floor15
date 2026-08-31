/* Adapter: engine scene packages -> the shapes the existing UI renders.
   PUBLIC surfaces get approved scenes only. Drafts appear ONLY when
   demoMode is on, and always carry the INTERNAL PREVIEW label. */
import type { ScenePackage, SceneExport } from "./scene-schema";
import type { Scene, ElevScene } from "./show";
import exportData from "./generated/scenes.json";

// JSON widens tuples to string[][]; the engine validated the shape at export time.
const data = exportData as unknown as SceneExport;

/** Site-wide switch. false = approved:true scenes only, everywhere. */
export const DEMO_MODE = false;

export const enginePublic: ScenePackage[] = data.scenes.filter((s) => s.approved);
export const enginePreview: ScenePackage[] = DEMO_MODE ? data.scenes.filter((s) => !s.approved) : [];

/** Scene-feed card shape (superset flag: fromEngine + preview + safety). */
export interface EngineSceneCard extends Scene {
  fromEngine: true;
  preview: boolean;
  redactions: number;
}

export function toSceneCard(p: ScenePackage, preview = false): EngineSceneCard {
  return {
    fromEngine: true,
    preview,
    redactions: p.safety.status === "REDACTED" ? p.safety.hits.length : 0,
    title: p.title,
    time: p.time_block ?? p.location.toUpperCase(),
    loc: p.location.replace(/_/g, " ").toUpperCase(),
    cast: p.cast.join(" · "),
    canon: p.canonRefs.length > 0,
    setup: p.setup,
    conflict: p.conflict,
    quote: p.bestQuote?.txt ?? "",
    who: p.bestQuote?.who ?? "",
    clip: p.clipMoment ?? "—",
    consequence: p.canonRefs.join(" · ") || "No canon consequences proposed.",
    hook: p.hook,
  };
}

/** Elevator-cam playable shape. Non-elevator scenes hold the counter at the show's floor. */
export function toElevScene(p: ScenePackage): ElevScene & { safety: ScenePackage["safety"] } {
  return {
    title: p.title,
    from: p.floors?.from ?? 15,
    to: p.floors?.to ?? 15,
    lt: p.lowerThirds.length ? p.lowerThirds : [[p.cast.join(" / ").toUpperCase(), p.location.toUpperCase()]],
    lines: p.lines.map((l) => ({ who: l.who, txt: l.txt, redacted: l.redacted, interruption: l.interruption })),
    safety: p.safety,
  };
}

export const engineSceneCards: EngineSceneCard[] = [
  ...enginePublic.map((p) => toSceneCard(p, false)),
  ...enginePreview.map((p) => toSceneCard(p, true)),
];
export const engineElevScenes = enginePublic.map(toElevScene);
