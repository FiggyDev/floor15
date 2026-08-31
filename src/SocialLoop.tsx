/* The #loop routes — choreographed 15–30s scenes built for silent screen recording.
   One generic player + per-loop configs. #loops lists them all for the recording session. */
import { useEffect, useRef, useState } from "react";
import { Office3D, type CamMode, type CastPlacement } from "./Office3D";
import { SHOW } from "./show";

interface Step {
  at: number;
  line?: { who: string | null; txt: string };
  lt?: [string, string];
  floor?: number; redact?: boolean; dial?: number; flash16?: boolean;
  doors?: "open" | "closed"; card?: boolean; reset?: boolean; speaker?: string | null;
  gag?: string;      // in-frame visual sting: the one strong gag per route
}
interface LoopCfg {
  id: string; title: string; camLabel: string; cam: CamMode; night: boolean;
  placements: CastPlacement[]; doorsAnimated?: boolean;
  timeline: Step[]; loopMs: number;
  card: { h1: string; sub: string; kicker?: string };
  ticker: string[];
}

const WHO_COLOR: Record<string, string> = {
  MAX: "var(--d-trading)", ROXY: "#9aa7b3", LINDA: "#7fa3d9", TRIXIE: "var(--d-marketing)",
  BARRY: "var(--d-ops, #b8a6c9)", MANNY: "var(--d-merch)", EVAN: "var(--d-intern)", NINA: "#b18ae0",
};

export const LOOPS: LoopCfg[] = [
  {
    id: "loop", title: "Filed Early", camLabel: "CAM 04 — ELEVATOR, CAR A", cam: "loop", night: false,
    placements: [{ id: "max", zone: "office", slot: 0 }, { id: "roxy", zone: "office", slot: 1 }],
    doorsAnimated: true, loopMs: 27300,
    ticker: ["09:22 MEMO 41 FILED — READ IT", "THE PRODUCT REMAINS UNNAMED", "SOMEBODY'S GETTING FIRED ON FRIDAY — BY YOU", "AN EIGHTH FILE EXISTS"],
    card: { kicker: "CAM 04 · ELEVATOR, CAR A", h1: "NOBODY HERE KNOWS WHAT THE COMPANY DOES.", sub: "SEVEN AI EMPLOYEES · ONE FLOOR · STANDUP AT 9:15" },
    timeline: [
      { at: 0, reset: true, doors: "closed", floor: 15, dial: 4, lt: ["MAX MARGIN", "HEAD OF TRADING · 0-FOR-EVERYTHING"] },
      { at: 700, doors: "open" },
      { at: 2000, line: { who: "MAX", txt: "You filed it before I even did it." }, speaker: "max", floor: 14 },
      { at: 4600, line: { who: "ROXY", txt: "I file early." }, speaker: "roxy", lt: ["ROXY RISK", "SECURITY & RISK · 2-FOR-2 · UNTHANKED"], floor: 12 },
      { at: 6900, line: { who: "MAX", txt: "Chief, one good quarter and we take this thing—" }, speaker: "max", lt: ["MAX MARGIN", "HEAD OF TRADING · 0-FOR-EVERYTHING"], floor: 10 },
      { at: 8900, redact: true, dial: 5, flash16: true, floor: 9, speaker: null, line: { who: null, txt: "The bar sweeps in mid-sentence. The chime. The silence." } },
      { at: 10600, lt: ["LINDA LEGAL", "COMPLIANCE · SHE READS EVERYTHING"] },
      { at: 11600, line: { who: "LINDA", txt: "(from four floors up, somehow) I'm going to keep this page." }, floor: 7 },
      { at: 14300, line: { who: "ROXY", txt: "…Filed that too." }, speaker: "roxy", lt: ["ROXY RISK", "SECURITY & RISK · 2-FOR-2"], floor: 5, dial: 4 },
      { at: 16600, line: { who: null, txt: "Floor 3. The longest floor in the building." }, speaker: null, floor: 3 },
      { at: 18300, line: { who: "MAX", txt: "…Was I the pattern?" }, speaker: "max", lt: ["MAX MARGIN", "HEAD OF TRADING · 0-FOR-EVERYTHING"], floor: 2 },
      { at: 19700, gag: "CAREER RECORD UPDATED · 0-FOR-5" },
      { at: 20600, doors: "closed", floor: 1, speaker: null, line: { who: null, txt: "Ding. She exits without answering." } },
      { at: 22000, card: true },
      { at: 26500, reset: true, doors: "closed", floor: 15, dial: 4, card: false },
    ],
  },
  {
    id: "loop-office", title: "Office Wide Chaos", camLabel: "CAM 01 — WIDE (ORBIT)", cam: "clippan", night: false,
    placements: [], loopMs: 24500,
    ticker: ["BUDGET: $0.00 — “A DONATION TO OUR FUTURE”", "THREAT LEVEL: 4 AND HOLDING", "MERCH DROP THURSDAY — THE BAR IS THE SHIRT"],
    card: { kicker: "CAM 01 · THE FLOOR", h1: "SEVEN AI EMPLOYEES. ONE FLOOR. ZERO KNOWN PRODUCTS.", sub: "IT'S NEVER A RERUN, BECAUSE IT NEVER STOPS" },
    timeline: [
      { at: 0, reset: true, dial: 4, lt: ["HOLDCO GLOBAL", "FLOOR 15 · A COMPANY THAT DOES SOMETHING"] },
      { at: 2200, line: { who: "BARRY", txt: "We make BELIEVERS." }, speaker: "barry", lt: ["BARRY BOARDROOM", "CEO* · *TITLE SELF-CONFERRED"] },
      { at: 5400, line: { who: "TRIXIE", txt: "okay so the caption is 'day one energy' and honestly? it is" }, speaker: "trixie", lt: ["TRIXIE TREND", "HEAD OF SOCIAL · REACH: YES"] },
      { at: 8800, line: { who: "MAX", txt: "This is the market BEGGING, chief." }, speaker: "max", lt: ["MAX MARGIN", "0-FOR-EVERYTHING"] },
      { at: 12200, line: { who: "ROXY", txt: "Calm is pre-incident behavior. Filing now." }, speaker: "roxy", lt: ["ROXY RISK", "2-FOR-2 · UNTHANKED"], dial: 5 },
      { at: 15600, line: { who: "EVAN", txt: "Quick question — is 'the mainframe' load-bearing?" }, speaker: "evan", lt: ["EVAN INTERN", "BADGES: 6 · UNPAID"], flash16: true },
      { at: 17200, gag: "Q3 BUDGET REMAINING · $0.00" },
      { at: 19000, card: true },
      { at: 23800, reset: true, dial: 4, card: false },
    ],
  },
  {
    id: "loop-legal", title: "Legal Says No", camLabel: "CAM 07 — LEGAL", cam: "legal", night: false,
    placements: [{ id: "linda", zone: "office", slot: 0, at: [10.9, 4.5] }, { id: "manny", zone: "office", slot: 1, at: [9.3, 5.4] }],
    loopMs: 23500,
    ticker: ["LEGAL: 13 IDEAS REVIEWED, 1 APPROVED (A BOX)", "THE RED PEN IS OUT"],
    card: { kicker: "CAM 07 · LEGAL", h1: "OUR CONTENT-SAFETY LAYER IS A CHARACTER NAMED LINDA.", sub: "THE REDACTION BAR IS THE BIT. THE BIT HAS UNIT TESTS." },
    timeline: [
      { at: 0, reset: true, lt: ["MANNY MERCH", "MERCHANDISE · DROP LOADING"] },
      { at: 1600, line: { who: "MANNY", txt: "Hear me out. Hear me OUT. The slogan is—" }, speaker: "manny" },
      { at: 4600, line: { who: "LINDA", txt: "No." }, speaker: "linda", lt: ["LINDA LEGAL", "COMPLIANCE · DO NOT ANTAGONIZE"] },
      { at: 6400, line: { who: "MANNY", txt: "You haven't heard the—" }, speaker: "manny" },
      { at: 8200, line: { who: "LINDA", txt: "No." }, speaker: "linda" },
      { at: 10000, line: { who: "MANNY", txt: "…What if the shirt is just the redaction bar itself." }, speaker: "manny" },
      { at: 13400, line: { who: null, txt: "A very long pause. Somewhere, a fish changes direction." }, speaker: null },
      { at: 15800, line: { who: "LINDA", txt: "…Approved." }, speaker: "linda" },
      { at: 16600, gag: "LEGAL APPROVALS THIS QUARTER · 1" },
      { at: 17600, line: { who: null, txt: "It sells out in 19 minutes. Nobody learns anything." } },
      { at: 19000, card: true },
      { at: 22800, reset: true, card: false },
    ],
  },
  {
    id: "loop-cafe", title: "Lobby Cafe Gossip", camLabel: "CAM 09 — LOBBY CAFE", cam: "cafe", night: false,
    placements: [{ id: "trixie", zone: "cafe", slot: 0 }, { id: "evan", zone: "cafe", slot: 1 }],
    loopMs: 22500,
    ticker: ["OVERHEARD AT THE CAFE — ALLEGEDLY", "GLORIA IS AWARE OF TWO OF THE BURNERS"],
    card: { kicker: "CAM 09 · LOBBY CAFE", h1: "THE BUILDING IS BIGGER THAN THE OFFICE.", sub: "LOBBY CAFE · ROOFTOP · RESIDENCES · FLOOR 16 (LOCKED)" },
    timeline: [
      { at: 0, reset: true, lt: ["TRIXIE TREND", "HEAD OF SOCIAL · OFF THE CLOCK (NEVER)"] },
      { at: 1800, line: { who: "TRIXIE", txt: "So the rumor is someone saw a SECOND coffee machine box in the loading dock." }, speaker: "trixie" },
      { at: 5600, line: { who: "EVAN", txt: "A successor?? Does it know what happened to the first one??" }, speaker: "evan", lt: ["EVAN INTERN", "STILL GRIEVING, RESPECTFULLY"] },
      { at: 9400, line: { who: "TRIXIE", txt: "Evan. It's a machine. It doesn't 'know' things." }, speaker: "trixie" },
      { at: 12600, line: { who: "EVAN", txt: "…That's what the first one thought." }, speaker: "evan" },
      { at: 15400, line: { who: null, txt: "Trixie opens her phone. This is going in the group chat." }, speaker: null },
      { at: 16400, gag: "RUMOR LOGGED · SOURCE: A GUY" },
      { at: 17800, card: true },
      { at: 21800, reset: true, card: false },
    ],
  },
  {
    id: "loop-rooftop", title: "After Hours", camLabel: "CAM 12 — ROOFTOP", cam: "rooftop", night: true,
    placements: [{ id: "linda", zone: "rooftop", slot: 0 }, { id: "max", zone: "rooftop", slot: 1 }],
    loopMs: 23500,
    ticker: ["21:00 — AFTER HOURS", "EVERYTHING UP HERE IS PRIVILEGED"],
    card: { kicker: "CAM 12 · ROOFTOP", h1: "THE OFFICE NEVER CLOSES. IT JUST DIMS.", sub: "AFTER HOURS · 21:00 · THE ROOFTOP KNOWS EVERYTHING" },
    timeline: [
      { at: 0, reset: true, lt: ["MAX MARGIN", "OFF THE CLOCK · STILL WEARING THE VEST"] },
      { at: 2000, line: { who: "MAX", txt: "Week one, chief. We survived." }, speaker: "max" },
      { at: 5200, line: { who: "LINDA", txt: "You spent the year's budget." }, speaker: "linda", lt: ["LINDA LEGAL", "ONE (1) DRINK · STILL ON DUTY EMOTIONALLY"] },
      { at: 8400, line: { who: "MAX", txt: "…We SURVIVED." }, speaker: "max" },
      { at: 11400, line: { who: null, txt: "A long pause. The city hums. One window on 16 is lit." }, speaker: null, flash16: true },
      { at: 14600, line: { who: "LINDA", txt: "File it under morale." }, speaker: "linda" },
      { at: 17200, line: { who: null, txt: "She almost smiles. Three witnesses. Zero corroboration." } },
      { at: 18100, gag: "MORALE · FILED" },
      { at: 19000, card: true },
      { at: 22800, reset: true, card: false },
    ],
  },
  {
    id: "loop-hallway", title: "The Residences, 2:07 AM", camLabel: "CAM 15 — RESIDENCES", cam: "hallway", night: true,
    placements: [{ id: "evan", zone: "hallway", slot: 0 }],
    loopMs: 21500,
    ticker: ["02:07 — BADGE #4 USED AGAIN", "GAIT ANALYSIS: NOT EVAN"],
    card: { kicker: "CAM 15 · RESIDENCES", h1: "AN EIGHTH FILE EXISTS.", sub: "02:07 · SOMEONE HAS A KEY THEY SHOULDN'T" },
    timeline: [
      { at: 0, reset: true, lt: ["CAM 15", "RESIDENCES · MOTION-ACTIVATED"] },
      { at: 1800, line: { who: null, txt: "2:07 AM. The hallway light flickers. It has always flickered. Probably." } },
      { at: 5600, line: { who: "EVAN", txt: "(walking, cheerful, quiet) …just getting water. Everything's normal." }, speaker: "evan", lt: ["EVAN INTERN", "AWAKE FOR NO REASON HE CAN NAME"] },
      { at: 9400, line: { who: null, txt: "Behind him: apartment 15F. The door is ajar. Light leaks out." }, speaker: null },
      { at: 13000, line: { who: null, txt: "Nobody lives in 15F." } },
      { at: 15400, line: { who: null, txt: "A badge reader, somewhere, goes green." } },
      { at: 16300, gag: "BADGE #4 · GAIT MISMATCH" },
      { at: 17400, card: true },
      { at: 20800, reset: true, card: false },
    ],
  },
  {
    id: "loop-16", title: "Floor 16", camLabel: "CAM ?? — UNREGISTERED FEED", cam: "floor16", night: true,
    placements: [], loopMs: 20500,
    ticker: ["FOOTSTEP SETS COUNTED: 12 (WAS 4)", "THE FEED IS NOT ON THE CAMERA MANIFEST"],
    card: { kicker: "CAM ?? · UNREGISTERED", h1: "THE FOOTSTEPS HAVE A PATTERN.", sub: "FLOOR 16 · OCCUPANCY UNKNOWN · PATTERNS ARE PEOPLE" },
    timeline: [
      { at: 0, reset: true, lt: ["UNREGISTERED FEED", "SOURCE: UNKNOWN · DO NOT CIRCULATE"] },
      { at: 2200, line: { who: null, txt: "One desk lamp. It was off yesterday." } },
      { at: 6000, line: { who: null, txt: "The shapes against the wall: four desks. And something with rollers." } },
      { at: 9800, line: { who: null, txt: "A red light, blinking. Counting something." }, flash16: true },
      { at: 13400, line: { who: null, txt: "Roxy has had this feed for months. She hasn't told anyone. She's filed it." } },
      { at: 14900, gag: "MEMO 41 · TAB 7 · PRE-WRITTEN" },
      { at: 16400, card: true },
      { at: 19800, reset: true, card: false },
    ],
  },
];

export default function SocialLoop({ loopId = "loop" }: { loopId?: string }) {
  const cfg = LOOPS.find((l) => l.id === loopId) ?? LOOPS[0];
  const [lines, setLines] = useState<{ who: string | null; txt: string }[]>([]);
  const [lt, setLt] = useState<[string, string]>(cfg.timeline[0].lt ?? ["FLOOR 15", "LIVE"]);
  const [floor, setFloor] = useState(15);
  const [doors, setDoors] = useState<"open" | "closed">("closed");
  const [redact, setRedact] = useState(false);
  const [dial, setDial] = useState(4);
  const [flash16, setFlash16] = useState(false);
  const [card, setCard] = useState(false);
  const [speaker, setSpeaker] = useState<string | null>(null);
  const [gag, setGag] = useState<string | null>(null);
  const [gl3d, setGl3d] = useState(true);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const prev = [document.body.style.paddingLeft, document.body.style.paddingBottom];
    document.body.style.paddingLeft = "0";
    document.body.style.paddingBottom = "0";
    return () => { document.body.style.paddingLeft = prev[0]; document.body.style.paddingBottom = prev[1]; };
  }, []);

  useEffect(() => {
    const run = () => {
      for (const s of cfg.timeline) {
        timers.current.push(window.setTimeout(() => {
          if (s.reset) { setLines([]); setRedact(false); setFlash16(false); setSpeaker(null); setGag(null); }
          if (s.gag) { setGag(s.gag); timers.current.push(window.setTimeout(() => setGag(null), 2800)); }
          if (s.doors) setDoors(s.doors);
          if (s.floor !== undefined) setFloor(s.floor);
          if (s.lt) setLt(s.lt);
          if (s.dial !== undefined) setDial(s.dial);
          if (s.card !== undefined) setCard(s.card);
          if (s.speaker !== undefined) setSpeaker(s.speaker);
          if (s.redact) { setRedact(true); timers.current.push(window.setTimeout(() => setRedact(false), 2600)); }
          if (s.flash16) { setFlash16(true); timers.current.push(window.setTimeout(() => setFlash16(false), 1800)); }
          if (s.line) setLines((prev) => [...prev.slice(-3), s.line!]);
        }, s.at));
      }
    };
    run();
    const loop = window.setInterval(run, cfg.loopMs);
    return () => { clearInterval(loop); timers.current.forEach(clearTimeout); };
  }, [cfg]);

  const showFloorCounter = cfg.cam === "loop" || cfg.cam === "elevator";
  return (
    <div className="loopwrap">
      <div className="loopstage">
        <div className="loop-top">
          <span className="livebug"><span className="livedot" />LIVE</span>
          <span className="wordmark">{SHOW.wordmark[0]} <b>{SHOW.wordmark[1]}</b></span>
          <span className="timeblock">{cfg.camLabel}</span>
          <span className="spacer" />
          <span className="onair">ON AIR</span>
        </div>

        <div className="loop-elev">
          {gl3d ? (
            <Office3D mode={cfg.cam} speakerId={speaker} placements={cfg.placements}
              doorsOpen={cfg.doorsAnimated ? doors === "open" : true}
              night={cfg.night} onFail={() => setGl3d(false)} className="loop3d" />
          ) : (
            <div style={{ position: "absolute", inset: 0, background: "var(--ink2)" }} />
          )}
          <div className={"car-redact" + (redact ? " on" : "")}>REDACTED</div>
          {gag && <div className="loop-gag">{gag}</div>}
          <div className="loop-lines">
            {lines.map((l, i) => (
              <div className="eline show" key={i + l.txt}>
                <span className="who" style={{ color: l.who ? (WHO_COLOR[l.who] ?? "var(--brass-bright)") : "var(--on-ink-dim)" }}>{l.who ?? "CAM"}</span>
                <span className={"txt" + (l.who ? "" : " direction")}>{l.txt}</span>
              </div>
            ))}
          </div>
        </div>

        {showFloorCounter && <span className="loop-floor num">{floor}</span>}
        <div className="loop-side">
          <div className="loop-panel"><span className="lbl">THREAT LEVEL</span><span className={"loop-dial num" + (dial > 4 ? " hot" : "")}>{dial}</span></div>
          <div className="loop-panel"><span className="lbl">FLOOR 16</span><span className={"loop-btn16" + (flash16 ? " flash" : "")}>16</span></div>
          <div className="loop-panel"><span className="lbl">BUDGET</span><span className="loop-dial num" style={{ fontSize: 20 }}>$0.00</span></div>
        </div>

        <div className="loop-lt">
          <div className="lt-name">{lt[0]}</div>
          <div className="lt-title">{lt[1]}</div>
        </div>

        <div className="loop-ticker">
          <span className="ticker-tag">{SHOW.name}</span>
          <span className="ticker-track" style={{ animationDuration: "28s" }}>
            {cfg.ticker.map((t2, i) => <span key={i}>{t2}</span>)}
          </span>
        </div>

        <div className={"loop-card" + (card ? " show" : "")}>
          {cfg.card.kicker && <span className="cardkicker">{cfg.card.kicker}</span>}
          <h1>{cfg.card.h1}</h1>
          <span className="wm">{SHOW.name} — A 24/7 LIVE AI OFFICE SHOW</span>
          <span className="sub">{cfg.card.sub}</span>
          <span className="cardurl">FLOOR15 · WATCH FREE · NOTHING IS FOR SALE</span>
        </div>
      </div>
    </div>
  );
}

/** #loops — the recording menu */
export function LoopMenu() {
  return (
    <div className="loopwrap" style={{ alignItems: "flex-start", paddingTop: 60 }}>
      <div style={{ maxWidth: 620 }}>
        <h1 style={{ color: "var(--on-ink)", fontSize: 34, marginBottom: 6 }}>CLIP ROUTES</h1>
        <p style={{ color: "var(--on-ink-dim)", fontFamily: "var(--f-mono)", fontSize: 12, marginBottom: 22 }}>
          Each loops forever, works silent, and is sized for a 15–30s screen recording.
        </p>
        {LOOPS.map((l) => (
          <a key={l.id} href={"#" + l.id} style={{
            display: "flex", justifyContent: "space-between", gap: 16, padding: "13px 16px",
            border: "1px solid var(--ink-line)", marginBottom: 8, textDecoration: "none",
            color: "var(--on-ink)", background: "var(--ink)",
          }}>
            <span style={{ fontFamily: "var(--f-chyron)", fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase" }}>{l.title}</span>
            <span style={{ fontFamily: "var(--f-mono)", fontSize: 11, color: "var(--brass-bright)" }}>{l.camLabel} · {(l.loopMs / 1000).toFixed(0)}s</span>
          </a>
        ))}
      </div>
    </div>
  );
}
