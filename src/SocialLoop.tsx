/* The #loop route — a choreographed ~26s scene built for screen recording.
   One take explains the whole show: elevator two-hander, a live redaction,
   the dial, the 16 button, a funny lower-third, the title card. Loops forever. */
import { useEffect, useRef, useState } from "react";
import { CharacterSprite } from "./sprites";
import { Office3D } from "./Office3D";
import { SHOW } from "./show";

interface Step { at: number; line?: { who: string | null; txt: string; redacted?: boolean };
  lt?: [string, string]; floor?: number; redact?: boolean; dial?: number; flash16?: boolean;
  doors?: "open" | "closed"; card?: boolean; reset?: boolean; }

const LT_MAX: [string, string] = ["MAX MARGIN", "HEAD OF TRADING · 0-FOR-EVERYTHING"];
const LT_ROXY: [string, string] = ["ROXY RISK", "SECURITY & RISK · 2-FOR-2 · UNTHANKED"];
const LT_LINDA: [string, string] = ["LINDA LEGAL", "COMPLIANCE · SHE READS EVERYTHING"];

const TIMELINE: Step[] = [
  { at: 0, reset: true, doors: "closed", floor: 15, dial: 4, lt: LT_MAX },
  { at: 700, doors: "open" },
  { at: 2000, line: { who: "MAX", txt: "You filed it before I even did it." }, lt: LT_MAX, floor: 14 },
  { at: 4600, line: { who: "ROXY", txt: "I file early." }, lt: LT_ROXY, floor: 12 },
  { at: 6900, line: { who: "MAX", txt: "Chief, one good quarter and we take this thing—" }, lt: LT_MAX, floor: 10 },
  { at: 8900, redact: true, dial: 5, flash16: true, floor: 9,
    line: { who: null, txt: "The bar sweeps in mid-sentence. The chime. The silence." } },
  { at: 10600, lt: LT_LINDA },
  { at: 11600, line: { who: "LINDA", txt: "(from four floors up, somehow) I'm going to keep this page." }, floor: 7 },
  { at: 14300, line: { who: "ROXY", txt: "…Filed that too." }, lt: LT_ROXY, floor: 5, dial: 4 },
  { at: 16600, line: { who: null, txt: "Floor 3. The longest floor in the building." }, floor: 3 },
  { at: 18300, line: { who: "MAX", txt: "…Was I the pattern?" }, lt: LT_MAX, floor: 2 },
  { at: 20600, doors: "closed", floor: 1, line: { who: null, txt: "Ding. She exits without answering." } },
  { at: 22000, card: true },
  { at: 26500, reset: true, doors: "closed", floor: 15, dial: 4, lt: LT_MAX, card: false },
];
const LOOP_MS = 27300;

export default function SocialLoop() {
  // full-bleed: the site chrome (rail/ticker padding) doesn't exist on this route
  useEffect(() => {
    const prev = [document.body.style.paddingLeft, document.body.style.paddingBottom];
    document.body.style.paddingLeft = "0";
    document.body.style.paddingBottom = "0";
    return () => { document.body.style.paddingLeft = prev[0]; document.body.style.paddingBottom = prev[1]; };
  }, []);
  const [lines, setLines] = useState<{ who: string | null; txt: string }[]>([]);
  const [lt, setLt] = useState<[string, string]>(LT_MAX);
  const [floor, setFloor] = useState(15);
  const [doors, setDoors] = useState<"open" | "closed">("closed");
  const [redact, setRedact] = useState(false);
  const [dial, setDial] = useState(4);
  const [flash16, setFlash16] = useState(false);
  const [card, setCard] = useState(false);
  const [speaker, setSpeaker] = useState<string | null>(null);
  const [gl3d, setGl3d] = useState(true);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const run = () => {
      for (const s of TIMELINE) {
        timers.current.push(window.setTimeout(() => {
          if (s.reset) { setLines([]); setRedact(false); setFlash16(false); setSpeaker(null); }
          if (s.doors) setDoors(s.doors);
          if (s.floor !== undefined) setFloor(s.floor);
          if (s.lt) setLt(s.lt);
          if (s.dial !== undefined) setDial(s.dial);
          if (s.card !== undefined) setCard(s.card);
          if (s.redact) { setRedact(true); timers.current.push(window.setTimeout(() => setRedact(false), 2600)); }
          if (s.flash16) { setFlash16(true); timers.current.push(window.setTimeout(() => setFlash16(false), 1800)); }
          if (s.line) {
            setLines((prev) => [...prev.slice(-3), s.line!]);
            setSpeaker(s.line.who ? s.line.who.toLowerCase() : null);
          }
        }, s.at));
      }
    };
    run();
    const loop = window.setInterval(run, LOOP_MS);
    return () => { clearInterval(loop); timers.current.forEach(clearTimeout); };
  }, []);

  return (
    <div className="loopwrap">
      <div className="loopstage">
        <div className="loop-top">
          <span className="livebug"><span className="livedot" />LIVE</span>
          <span className="wordmark">{SHOW.wordmark[0]} <b>{SHOW.wordmark[1]}</b></span>
          <span className="timeblock">CAM 04 — ELEVATOR, CAR A</span>
          <span className="spacer" />
          <span className="onair">ON AIR</span>
        </div>

        <div className={"loop-elev" + (doors === "open" ? " doors-open" : "")}>
          {gl3d ? (
            <Office3D mode="loop" speakerId={speaker} carCast={["max", "roxy"]} doorsOpen={doors === "open"}
              night onFail={() => setGl3d(false)} className="loop3d" />
          ) : (
            <div className="car-inner">
              <CharacterSprite id="max" size={168} talking={speaker === "max"} />
              <CharacterSprite id="roxy" size={168} talking={speaker === "roxy"} />
            </div>
          )}
          <div className={"car-redact" + (redact ? " on" : "")}>REDACTED</div>
          {!gl3d && <><div className="door l" /><div className="door r" /></>}
          <div className="loop-lines">
            {lines.map((l, i) => (
              <div className="eline show" key={i + l.txt}>
                <span className="who" style={{ color: l.who ? (l.who === "MAX" ? "var(--d-trading)" : l.who === "ROXY" ? "#9aa7b3" : "#7fa3d9") : "var(--on-ink-dim)" }}>{l.who ?? "CAM"}</span>
                <span className={"txt" + (l.who ? "" : " direction")}>{l.txt}</span>
              </div>
            ))}
          </div>
        </div>

        <span className="loop-floor num">{floor}</span>
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
          <span className="ticker-track" style={{ animationDuration: "30s" }}>
            <span><b>09:22</b> MEMO 41 FILED — READ IT</span><span>THE PRODUCT REMAINS UNNAMED</span>
            <span>SOMEBODY'S GETTING FIRED ON FRIDAY — BY YOU</span><span>AN EIGHTH FILE EXISTS</span>
            <span>FOOTSTEPS ON 16 IN A PATTERN — PATTERNS ARE PEOPLE</span>
          </span>
        </div>

        <div className={"loop-card" + (card ? " show" : "")}>
          <h1>NOBODY HERE KNOWS WHAT THE COMPANY DOES.</h1>
          <span className="wm">{SHOW.name} — A 24/7 LIVE AI OFFICE SHOW</span>
          <span className="sub">WATCHING IS FREE. NOTHING IS FOR SALE. STANDUP AT 9:15.</span>
        </div>
      </div>
    </div>
  );
}
