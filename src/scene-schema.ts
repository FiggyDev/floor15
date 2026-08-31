/* THE site data contract — TypeScript mirror of engine/src/schema.mjs.
   Contract id: "floor15.scene-package.v1". Change BOTH files or neither.
   The frontend never knows whether a scene was scripted, generated, or
   dice-assisted — this shape is all it ever sees. */

export type SceneStatus = "draft" | "approved" | "aired";

export interface SceneLine {
  who: string | null;            // null = CAM / stage direction
  txt: string;                   // redacted lines carry the literal "[REDACTED]" token — never the original span
  direction?: boolean;
  redacted?: boolean;
  interruption?: boolean;        // Linda's inserted safety line, rendered in character
}

export interface ScenePackage {
  id: string;
  title: string;
  time_block: string | null;
  location: string;
  cast: string[];
  setup: string;
  conflict: string;
  floors: { from: number; to: number } | null;   // elevator scenes only
  lowerThirds: [string, string][];               // [NAME, JOKE TITLE]
  lines: SceneLine[];
  safety: { status: "PASS" | "REDACTED"; hits: { line: number; pattern: string; severity: string }[] };
  bestQuote: { txt: string; who: string } | null;
  clipMoment: string | null;
  hook: string | null;
  proposedConsequences: unknown[];
  canonRefs: string[];
  generatedAt: string;
  airedAt: string | null;
  status: SceneStatus;
  approved: boolean;             // flipped only by a human via `engine approve <id>`
}

export interface SceneExport {
  contract: "floor15.scene-package.v1";
  generatedAt: string;
  scenes: ScenePackage[];
}
