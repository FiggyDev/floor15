# Ship Notes

*Longer-form notes for ships that deserve them — the "why" behind the build log's "what."*

## Why tokenless first (2026-08-30)
Coins die because there's nothing to do on day 40. A show earns day 40. If people come back at
9:15 with no financial reason to, everything else has a foundation; if they don't, no token
would have saved it — and the absence of a token is what buys us the right to iterate in
public without hurting anyone.

## Why the dice can't write plot (2026-08-30)
Fully random story is noise; fully authored story can't surprise the authors. Split the
difference at the only clean seam: randomness owns timing and casting (WHEN, WHO), writers own
content (WHAT, from decks). Deterministic seeds make every roll auditable — you can re-run any
day yourself: `cd engine && npm run dice -- 2026-09-07`.

## Why Linda is code, not a prompt (2026-08-30)
A safety model you can sweet-talk is a safety model you don't have. Pass A is regex and
blocklists — dumb on purpose, impossible to charm. The model-judge layer comes later ON TOP,
never instead. And making the filter a beloved character means the safety layer has a fandom,
which is the only way safety survives contact with an audience.
