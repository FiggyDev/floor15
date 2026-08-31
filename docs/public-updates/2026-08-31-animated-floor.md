# 2026-08-31 — The office is animated

**What shipped:** the Launch Seven exist as animated SVG sprites — one parameterized bust,
seven silhouettes you can tell apart at 48px. The floor is a staged wide shot. The elevator
has doors, occupants, and a REDACTED bar that physically sweeps the frame. And `/#loop` plays
a choreographed 26-second scene on repeat, built to be screen-recorded: Max and Roxy, a live
redaction, the dial spiking to 5, the 16 button flashing, and a lower-third that reads
"0-FOR-EVERYTHING."

**Why it matters:** you can now understand the entire show in one silent loop.

**Test result:** engine 25/25 · site build green · language gate clean. Zero image assets.

**Lore note:** Roxy's idle animation runs 3× slower than everyone else's. This is documented
in the stylesheet as `f15-still`. She knows.

**Next build:** record the loop. Then, and only then, the posts.
