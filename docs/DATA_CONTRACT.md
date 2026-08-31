# Data Contract — floor15.scene-package.v1

One stable shape for every scene the frontend renders. Defined twice, changed both times or
neither: `engine/src/schema.mjs` (validator) and `src/scene-schema.ts` (types).

```ts
interface ScenePackage {
  id: string; title: string; time_block: string|null; location: string; cast: string[];
  setup: string; conflict: string;
  floors: {from:number,to:number}|null;        // elevator scenes drive the counter
  lowerThirds: [name:string, jokeTitle:string][];
  lines: { who: string|null;                    // null = CAM / stage direction
           txt: string;                         // redacted lines carry "[REDACTED]", never the original span
           redacted?: boolean; interruption?: boolean }[];
  safety: { status: "PASS"|"REDACTED";          // KILLed scenes never become packages
            hits: {line:number, rule:string, severity:string}[] };  // opaque rule ids only
  bestQuote: {txt:string, who:string}|null; clipMoment: string|null; hook: string|null;
  proposedConsequences: unknown[]; canonRefs: string[];
  generatedAt: string; airedAt: string|null;
  status: "draft"|"approved"|"aired";
  approved: boolean;                            // flipped only by a human: `engine approve <id>`
}
```

Export file: `src/generated/scenes.json` = `{ contract, generatedAt, scenes[] }`.
Frontend rule: public surfaces render `approved: true` only; drafts render only in demo mode,
always labeled INTERNAL PREVIEW. Export runs three gates every time: canon re-check against the
CURRENT ledger, Linda re-scan of the package text, schema validation.
