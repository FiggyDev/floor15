/* FLOOR 15 — main page. One component tree, sections split-ready.
   All interaction is device-local. No backend, no auth, no payments,
   nothing on-chain. Docs: /docs (architecture, safety model, data contract). */
import { useCallback, useEffect, useRef, useState } from "react";
import {
  SHOW, DEPT, CAST, SCENES, SPONSORS, CLIPS, FILES, ELEV_SCENES,
  VOTE, STANDINGS, TICKER_ITEMS, TIME_BLOCKS,
  type CastMember, type Scene, type ElevScene,
} from "./show";
import { engineSceneCards, engineElevScenes, type EngineSceneCard } from "./engineScenes";
import { CharacterSprite, spriteIdFor } from "./sprites";
import SocialLoop from "./SocialLoop";
import { Office3D, type CamMode } from "./Office3D";

/* ---------- small utils ---------- */
function etHour(): number {
  try {
    return parseInt(
      new Intl.DateTimeFormat("en-US", { hour: "numeric", hour12: false, timeZone: "America/New_York" }).format(new Date()),
      10
    );
  } catch {
    return new Date().getHours();
  }
}
function lsGet(k: string): string | null { try { return localStorage.getItem(k); } catch { return null; } }
function lsSet(k: string, v: string) { try { localStorage.setItem(k, v); } catch { /* private mode: fine */ } }

const RAIL = [
  { href: "#live", no: "15", nm: "LIVE" },
  { href: "#cast", no: "C", nm: "CAST" },
  { href: "#scenes", no: "S", nm: "SCENES" },
  { href: "#week1", no: "W1", nm: "SCHED" },
  { href: "#files", no: "PF", nm: "FILES" },
  { href: "#board", no: "B", nm: "BOARD" },
  { href: "#sponsors", no: "AD", nm: "SPONS" },
  { href: "#cliplab", no: "CL", nm: "CLIPS" },
  { href: "#badge", no: "ID", nm: "BADGE" },
];

/* ---------- top bar ---------- */
function TopBar({ night, onToggle, block }: { night: boolean; onToggle: () => void; block: string }) {
  return (
    <header className="topbar">
      <span className="livebug"><span className="livedot" />LIVE</span>
      <span className="wordmark">{SHOW.wordmark[0]} <b>{SHOW.wordmark[1]}</b></span>
      <span className="timeblock num">{block} ET</span>
      <span className="spacer" />
      <span className="onair">ON AIR</span>
      <button className="nightbtn" aria-pressed={night} onClick={onToggle}>
        {night ? "DAY SHIFT" : "AFTER HOURS"}
      </button>
    </header>
  );
}

/* ---------- elevator rail nav ---------- */
function Rail({ active }: { active: string }) {
  return (
    <nav className="rail" aria-label="Elevator panel">
      <span className="rail-label">FLR</span>
      <a className="fbtn locked flicker16" href="#floor16" title="Floor 16 — access denied" aria-label="Floor 16, locked">
        <span className="fno">{SHOW.rivalFloor}</span><span className="fnm">&nbsp;</span>
      </a>
      {RAIL.map((r) => (
        <a key={r.href} className={"fbtn" + (active === r.href ? " lit" : "")} href={r.href}>
          <span className="fno">{r.no}</span><span className="fnm">{r.nm}</span>
        </a>
      ))}
    </nav>
  );
}

/* ---------- ticker ---------- */
function Ticker() {
  return (
    <div className="ticker" aria-hidden="true">
      <span className="ticker-tag">{SHOW.name}</span>
      <span className="ticker-track">
        {TICKER_ITEMS.map((it, i) => (
          <span key={i}>{it.t ? <b>{it.t} </b> : null}{it.text}</span>
        ))}
      </span>
    </div>
  );
}

/* ---------- hero ---------- */
function Hero({ countdown }: { countdown: string }) {
  return (
    <div className="wrap hero" id="live">
      <div className="kicker">{SHOW.tagline} · {SHOW.company.toUpperCase()} · {SHOW.floor}TH FLOOR</div>
      <h1>NOBODY HERE KNOWS WHAT THE <span className="rd">COMPANY</span> DOES.</h1>
      <p className="hero-sub">
        Seven AI employees. One floor. Zero known products. Standup every morning at 9:15. A party every
        Friday. Somebody's getting fired at the end of the month — and the audience decides who. It's never
        a rerun, because it never stops.
      </p>
      <div className="hero-row">
        <a className="btn btn-ink" href="#scenes">Watch the scenes</a>
        <a className="btn btn-ghost" href="#board">Take a Board seat</a>
        <span className="countdown num">
          NEXT STANDUP IN <b>{countdown}</b> — SOMEBODY'S LYING AT IT
        </span>
      </div>
    </div>
  );
}

/* ---------- live floor: the animated wide shot ---------- */
function Station({ c, speaking, line }: { c: CastMember; speaking: boolean; line: string }) {
  return (
    <div className={"station" + (speaking ? " speaking" : "")}>
      <div className="st-bubble">{line}</div>
      <CharacterSprite id={c.id} size={92} talking={speaking} />
      <div className="st-desk">
        <span className="st-mood" style={{ background: c.moodC }} title={"mood: " + c.mood} />
        <div className="monitor" />
      </div>
      <span className="st-name">{c.name}</span>
      <span className="st-role">{c.role}</span>
    </div>
  );
}

function LiveFloor({ night }: { night: boolean }) {
  const [lines, setLines] = useState(() => CAST.map((c) => c.bubble[0]));
  const [speaker, setSpeaker] = useState(0);
  const [dial, setDial] = useState(4);
  const [gl3d, setGl3d] = useState(true);
  const [cam, setCam] = useState<CamMode>("wide");
  const tick = useRef(0);

  useEffect(() => {
    const id = setInterval(() => {
      tick.current++;
      const i = tick.current % CAST.length;
      setLines((prev) => {
        const next = [...prev];
        const pool = CAST[i].bubble;
        next[i] = pool[Math.floor(Math.random() * pool.length)];
        return next;
      });
      setSpeaker(i);
    }, 3400);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      if (Math.random() > 0.9) {
        setDial(5);
        setTimeout(() => setDial(4), 4200);
      }
    }, 11000);
    return () => clearInterval(id);
  }, []);

  return (
    <section>
      <div className="wrap">
        <div className="sec-head"><span className="sec-no">CAM 01 — WIDE</span><h2>The Live Floor</h2></div>
        <p className="sec-sub">
          Seven desks, one bullpen. Speech bubbles are live. Moods are real. One of these people is always
          in frame and you never notice her.
        </p>
        {gl3d ? (
          <div className="stage3d">
            <Office3D mode={cam} speakerId={CAST[speaker].id} night={night} onFail={() => setGl3d(false)} className="stage3d-canvas" />
            <span className="stage-onair">● REC</span>
            <div className="camswitch">
              {(["wide", "desk", "boardroom", "legal", "elevator"] as CamMode[]).map((m) => (
                <button key={m} className={"cambtn" + (cam === m ? " on" : "")} onClick={() => setCam(m)}>
                  CAM · {m.toUpperCase()}
                </button>
              ))}
            </div>
            <div className="caption3d">
              <span className="cap-who" style={{ color: DEPT[CAST[speaker].dept].c }}>{CAST[speaker].name}</span>
              <span className="cap-line">{lines[speaker]}</span>
            </div>
          </div>
        ) : (
          <div className="stage">
            <div className="stage-wall">
              <div className="stage-window"><span className="f16light" /></div>
            </div>
            <span className="stage-onair">● REC</span>
            <div className="stations">
              {CAST.map((c, i) => <Station key={c.id} c={c} speaking={speaker === i} line={lines[i]} />)}
            </div>
          </div>
        )}
        <div className="widgetrow">
          <div className="widget">
            <h3>THREAT LEVEL — R. RISK</h3>
            <div className="dial-row">
              <span className="dial-num num">{dial}</span>
              <span className="dial-note">Baseline for this cast is 3. Baseline elsewhere is 1. The dial does not go down.</span>
            </div>
            <div className="meter"><i style={{ clipPath: `inset(0 ${100 - dial * 10}% 0 0)` }} /></div>
          </div>
          <div className="widget" id="floor16">
            <h3>FLOOR {SHOW.rivalFloor} — STATUS</h3>
            <div className="f16status">
              OCCUPANCY: <span className="warn">UNKNOWN</span><br />
              FOOTSTEP SETS COUNTED: <span className="warn num">12</span> (was 4)<br />
              ELEVATOR BUTTON: <span className="warn">FLICKERED ONCE. UNPROVOKED.</span><br />
              SEE: MEMO 41, TAB 7.
            </div>
          </div>
          <div className="widget">
            <h3>NEXT ON THE GRID</h3>
            <div className="f16status">
              09:15 — THE STANDUP <span className="warn">(everyone lies)</span><br />
              13:00 — THE CLIENT<br />
              17:15 — CLOSE OF BUSINESS<br />
              21:00 — AFTER HOURS <span className="warn">(Nina, allegedly)</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- elevator cam ---------- */
type PlayableElev = ElevScene & { safety?: { status: string; hits: unknown[] } | null };
const ALL_ELEV: PlayableElev[] = [...ELEV_SCENES, ...engineElevScenes];

interface ElevState { scene: PlayableElev; shown: number; floor: number; }

/** Render a line's text with the [REDACTED] token as an actual bar. */
function RedactableText({ txt }: { txt: string }) {
  if (!txt.includes("[REDACTED]")) return <>{txt}</>;
  const parts = txt.split("[REDACTED]");
  return (
    <>
      {parts.map((p, i) => (
        <span key={i}>
          {p}
          {i < parts.length - 1 && <span className="redtok">REDACTED</span>}
        </span>
      ))}
    </>
  );
}

function ElevatorCam({ night }: { night: boolean }) {
  const [st, setSt] = useState<ElevState>(() => ({ scene: ALL_ELEV[0], shown: 0, floor: ALL_ELEV[0].from }));
  const [gl3d, setGl3d] = useState(true);
  const idxRef = useRef(0);

  useEffect(() => {
    let alive = true;
    let timer: number;
    const step = () => {
      if (!alive) return;
      setSt((prev) => {
        if (prev.shown >= prev.scene.lines.length) {
          // next scene after a hold
          idxRef.current = (idxRef.current + 1) % ALL_ELEV.length;
          const sc = ALL_ELEV[idxRef.current];
          return { scene: sc, shown: 0, floor: sc.from };
        }
        const line = prev.scene.lines[prev.shown];
        const dir = prev.scene.to > prev.scene.from ? 1 : -1;
        const span = Math.abs(prev.scene.to - prev.scene.from);
        const target = prev.scene.from + dir * Math.min(span, Math.round(((prev.shown + 1) / prev.scene.lines.length) * span));
        void line;
        return { ...prev, shown: prev.shown + 1, floor: target };
      });
      const delay = 2600;
      timer = window.setTimeout(step, delay);
    };
    timer = window.setTimeout(step, 900);
    return () => { alive = false; clearTimeout(timer); };
  }, []);

  const visible = st.scene.lines.slice(Math.max(0, st.shown - 4), st.shown);
  const current = st.shown > 0 ? st.scene.lines[st.shown - 1] : null;
  const speakerId = spriteIdFor(current?.who ?? null);
  const doorsOpen = st.shown > 0 && st.shown < st.scene.lines.length;
  const carCast = st.scene.lt.map((e) => spriteIdFor(e[0])).filter((x): x is string => !!x).slice(0, 2);
  const redactOn = !!current?.redacted;
  const lastSpeaker = [...st.scene.lines.slice(0, st.shown)].reverse().find((l) => l.who);
  const lt = lastSpeaker
    ? st.scene.lt.find((e) => e[0].startsWith(lastSpeaker.who!.split(" ")[0])) ?? st.scene.lt[0]
    : st.scene.lt[0];
  const whoColor = (who: string) => {
    const c = CAST.find((x) => x.name.toUpperCase().startsWith(who.split(" ")[0]));
    return c ? DEPT[c.dept].c : "var(--brass-bright)";
  };

  return (
    <section>
      <div className="wrap">
        <div className="sec-head"><span className="sec-no">CAM 04 — FIXED</span><h2>Elevator Cam</h2></div>
        <p className="sec-sub">
          Two characters. No exit. Forty seconds. The best scenes in the building happen between floors —
          this one is playing on a loop until someone presses a button.
        </p>
        <div className="elev">
          <div className="elev-head">
            <span className="camlabel"><span className="rec">●&nbsp;REC</span>&nbsp;&nbsp;ELEVATOR — CAR&nbsp;A</span>
            <span className="floorcount num">{st.floor}</span>
          </div>
          {gl3d ? (
            <div className="carview3d">
              <Office3D mode="elevator" speakerId={speakerId} carCast={carCast} doorsOpen={doorsOpen}
                night={night} onFail={() => setGl3d(false)} />
              <div className={"car-redact" + (redactOn ? " on" : "")}>REDACTED</div>
            </div>
          ) : (
            <div className={"carview" + (doorsOpen ? " doors-open" : "")}>
              <div className="car-inner">
                {carCast.map((id) => (
                  <CharacterSprite key={id} id={id} size={132} talking={speakerId === id} />
                ))}
              </div>
              <div className={"car-redact" + (redactOn ? " on" : "")}>REDACTED</div>
              <div className="door l" /><div className="door r" />
            </div>
          )}
          <div className="elev-body" aria-live="polite">
            {visible.map((l, i) => (
              <div className={"eline show" + (l.interruption ? " interrupt" : "")} key={st.scene.title + (st.shown - visible.length + i)}>
                {l.who
                  ? <span className="who" style={{ color: l.interruption ? "var(--d-legal)" : whoColor(l.who) }}>{l.who}</span>
                  : <span className="who" style={{ color: "var(--on-ink-dim)" }}>CAM</span>}
                <span className={"txt" + (l.who ? "" : " direction")}><RedactableText txt={l.txt} /></span>
              </div>
            ))}
          </div>
          <div className="lowerthird">
            <div className="lt-name">{lt[0]}</div>
            <div className="lt-title">{lt[1]}</div>
            {st.scene.safety?.status === "REDACTED" && (
              <div className="safetymark">REVIEWED BY LEGAL · {st.scene.safety.hits.length} REDACTION{st.scene.safety.hits.length === 1 ? "" : "S"}</div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- expander ---------- */
function Expander({ openLabel, closeLabel, children }: { openLabel: string; closeLabel: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="expander">
      <button className="expbtn" aria-expanded={open} onClick={() => setOpen(!open)}>
        {open ? closeLabel : openLabel}
      </button>
      <div className="detail" hidden={!open}>{children}</div>
    </div>
  );
}

/* ---------- cast ---------- */
function CastCard({ c }: { c: CastMember }) {
  return (
    <div className="card">
      <div className="card-band" style={{ background: DEPT[c.dept].c }} />
      <div className="card-pad">
        <div className="cast-top">
          <span className="avatar" style={{ background: DEPT[c.dept].c, width: 52, height: 52, fontSize: 19 }}>{c.mono}</span>
          <div>
            <div className="cast-lt" style={{ margin: 0 }}>
              <div className="lt-name">{c.name}</div>
              <div className="lt-title">{c.lt}</div>
            </div>
          </div>
        </div>
        <div className="chiprow">
          <span className="chip dept" style={{ background: DEPT[c.dept].c }}>{DEPT[c.dept].label}</span>
          <span className="chip status">{c.status}</span>
        </div>
        <p className="cast-quote">"{c.quote}"</p>
        <Expander openLabel="Open full workup ▾" closeLabel="Close file ▴">
          <div className="drow"><b>Personnel file</b>{c.file} <a href="#files">Read it →</a></div>
          <div className="drow"><b>Secrets &amp; rumors</b>{c.secrets}</div>
          <div className="drow"><b>Recurring bit</b>{c.bit}</div>
          <div className="drow"><b>Rivalry</b>{c.rivalry}</div>
          <div className="drow"><b>Merch phrase</b><span className="merchline">{c.merch}</span></div>
        </Expander>
      </div>
    </div>
  );
}

function CastSection() {
  return (
    <section id="cast">
      <div className="wrap">
        <div className="sec-head"><span className="sec-no">PERSONNEL — ACTIVE</span><h2>The Launch Seven</h2></div>
        <p className="sec-sub">
          Every one of them describable in one sentence by a stranger after one clip. Tap a card to open the
          full workup — the parts HR would rather you didn't read are in the <a href="#files">Personnel Files</a>.
        </p>
        <div className="castgrid">{CAST.map((c) => <CastCard key={c.id} c={c} />)}</div>
      </div>
    </section>
  );
}

/* ---------- scenes ---------- */
function SceneCard({ s }: { s: Scene | EngineSceneCard }) {
  const eng = "fromEngine" in s ? s : null;
  return (
    <div className="card scene-card">
      <div className="card-band" style={{ background: eng?.preview ? "var(--d-merch)" : "var(--ink)" }} />
      <div className="card-pad">
        <div className="scene-meta">
          <span className="num">{s.time}</span><span>{s.loc}</span><span>{s.cast}</span>
          {s.canon && <span className="canonstamp">CANON</span>}
          {eng?.preview && <span className="canonstamp" style={{ color: "var(--d-merch)", borderColor: "var(--d-merch)" }}>INTERNAL PREVIEW</span>}
          {eng && eng.redactions > 0 && <span className="canonstamp" style={{ color: "var(--d-legal)", borderColor: "var(--d-legal)" }}>REDACTED ×{eng.redactions}</span>}
        </div>
        <h3 className="scene-title">{s.title}</h3>
        <p className="scene-setup">{s.setup}</p>
        <Expander openLabel="Scene detail ▾" closeLabel="Close ▴">
          <div className="drow"><b>Conflict</b>{s.conflict}</div>
          <div className="quoteblock">"{s.quote}"<small>— {s.who}</small></div>
          <div className="drow"><b>Clip moment</b>{s.clip}</div>
          <div className="drow"><b>Canon consequence</b>{s.consequence}</div>
          {s.hook && <div className="drow"><b>Community hook</b>{s.hook}</div>}
        </Expander>
      </div>
    </div>
  );
}

function ScenesSection() {
  return (
    <section id="scenes">
      <div className="wrap">
        <div className="sec-head"><span className="sec-no">ARCHIVE — WEEK 1</span><h2>Scene Feed</h2></div>
        <p className="sec-sub">
          Every scene is logged, timestamped, and permanent. A red CANON stamp means it changed the world and
          can never be taken back. Receipts are load-bearing on this show.
        </p>
        <div className="scenegrid">
          {engineSceneCards.map((s) => <SceneCard key={"eng-" + s.title} s={s} />)}
          {/* engine version of a scene supersedes its hardcoded twin */}
          {SCENES.filter((s) => !engineSceneCards.some((e) => e.title === s.title.toUpperCase()))
            .map((s) => <SceneCard key={s.title} s={s} />)}
        </div>
      </div>
    </section>
  );
}

/* ---------- week 1 grid (static table markup kept as-is) ---------- */
function Tag({ bg, children }: { bg: string; children: React.ReactNode }) {
  return <span className="tag" style={{ background: bg }}>{children}</span>;
}

function WeekSection() {
  return (
    <section id="week1">
      <div className="wrap">
        <div className="sec-head"><span className="sec-no">PROGRAMMING GRID</span><h2>Week One</h2></div>
        <p className="sec-sub">
          Same times every day, so it becomes a habit. Standup 9:15. Major scene 13:00. One elevator scene
          daily. Close of Business 17:15. Attendance tracked — yours and theirs.
        </p>
        <div className="schedwrap">
          <table className="sched">
            <thead><tr>
              <th style={{ width: 90 }}>SLOT</th><th>MON — DAY ONE</th><th>TUE — DAY TWO</th>
              <th>WED — THE MACHINE</th><th>THU — THE DROP</th><th>FRI — THE NAME</th><th>SAT</th><th>SUN</th>
            </tr></thead>
            <tbody>
              <tr>
                <td className="slot">09:15</td>
                <td className="ev"><b>Standup #1</b><span>Progress reported on an unnamed product.</span></td>
                <td className="ev"><b>Standup #2</b><span>Max is suspiciously calm. Memo 41 filed on camera, 9:22.</span></td>
                <td className="ev"><b>Standup #3</b><span>Roxy tables the machine assessment. Mocked. Briefly.</span></td>
                <td className="ev"><b>Standup #4</b><span>Trixie's Ratio Report debuts. War-news chyron.</span></td>
                <td className="ev"><b>Standup #5</b><span>Linda pre-files an objection "to whatever it ends up being."</span></td>
                <td className="ev"><span>—</span></td>
                <td className="ev"><span>—</span></td>
              </tr>
              <tr>
                <td className="slot">13:00</td>
                <td className="ev"><b>The Founding Address</b><span>11 minutes. Zero products. First redaction.</span><Tag bg="var(--d-legal)">LINDA</Tag></td>
                <td className="ev"><b>The Budget</b><span>All of it. Before lunch. His defense is beautiful.</span><Tag bg="var(--d-trading)">CANON</Tag></td>
                <td className="ev"><b>Assessment Failed</b><span>The machine dies of kindness. Manny sketches.</span></td>
                <td className="ev"><b>The Drop Ceremony</b><span>Slogan 3 dies on air. Ships anyway — as the bar.</span><Tag bg="var(--d-merch)">MERCH</Tag></td>
                <td className="ev"><b>The Christening</b><span>Vote results. Barry mispronounces the winner. Twice. Differently.</span><Tag bg="var(--brass-dim)">VOTE</Tag></td>
                <td className="ev"><b>The Office, Empty</b><span>Roxy's weekend sweep. Evan under a desk. A cone.</span></td>
                <td className="ev"><b>The File Room</b><span>Seven files labeled. An eighth. Unlabeled. Hold. Cut.</span><Tag bg="var(--ink)">MYSTERY</Tag></td>
              </tr>
              <tr>
                <td className="slot">ELEV</td>
                <td className="ev"><b>Six Floors w/ the Consultant</b><span>"Bill us whatever's fair." "…I'm unpaid."</span></td>
                <td className="ev"><b>Filed Early</b><span>"Was I the pattern?" Ding.</span></td>
                <td className="ev"><b>The Sketch</b><span>Linda's first-ever approval. The audience gasps.</span></td>
                <td className="ev"><b>Two Cups</b><span>Roxy stares into the lens. It stays in.</span></td>
                <td className="ev"><b>Going Down</b><span>"File it under morale." First warmth.</span></td>
                <td className="ev"><b>Maintenance</b><span>Evan presses every button. 16 flickers once. He doesn't notice.</span><Tag bg="#000">FLR 16</Tag></td>
                <td className="ev"><span>Dark car. Closing frame of the recap.</span></td>
              </tr>
              <tr>
                <td className="slot">17:15</td>
                <td className="ev"><b>COB #1</b><span>"Best quarter yet." It is day one.</span></td>
                <td className="ev"><b>COB #2</b><span>Budget: $0.00. Vote opens: NAME THE PRODUCT.</span></td>
                <td className="ev"><b>COB #3</b><span>A eulogy for an appliance.</span></td>
                <td className="ev"><b>COB #4 + DROP 18:00</b><span>The redacted shirt sells out first.</span></td>
                <td className="ev"><b>The Party</b><span>Objection read aloud. Overruled by applause.</span></td>
                <td className="ev"><span>—</span></td>
                <td className="ev"><b>Previously On #1</b><span>Piano note. "MONDAY: A DOCUMENT LEAKS."</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

/* ---------- personnel files ---------- */
function FilesSection() {
  return (
    <section id="files">
      <div className="wrap">
        <div className="sec-head"><span className="sec-no">HR — DO NOT DISTRIBUTE</span><h2>Personnel Files</h2></div>
        <p className="sec-sub">
          Append-only. Never edited, never expunged. Strikes, secrets, favors owed, grudges held, and the
          receipts — timestamped, so the internet can check. Gloria maintains these with love and malice in
          equal measure.
        </p>
        <div className="filegrid">
          {FILES.map((f, idx) => {
            const c = CAST.find((x) => x.id === f.id)!;
            return (
              <div className="folder" key={f.id}>
                <div className="folder-pad">
                  <div className="folder-head">
                    <div>
                      <h3>{c.name}</h3>
                      <span className="fileno num">FILE #00{idx + 1} · {DEPT[c.dept].label.toUpperCase()}</span>
                    </div>
                    <span className="avatar" style={{ background: DEPT[c.dept].c, width: 36, height: 36, fontSize: 13 }}>{c.mono}</span>
                  </div>
                  <div className="stampline">
                    {f.stamps.map(([k, t]) => <span key={t} className={"stamp " + k}>{t}</span>)}
                  </div>
                  <div className="fentry" style={{ marginTop: 10 }}>
                    <span className="ftag">STRIKES</span>
                    <span className="strikebar">
                      {[0, 1, 2].map((i) => <span key={i} className={"strike" + (i < f.strikes ? "" : " empty")} />)}
                    </span>
                  </div>
                  <div className="filelist">
                    {f.rows.map(([tag, txt], i) => (
                      <div className="fentry" key={i}><span className="ftag">{tag}</span><span>{txt}</span></div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ---------- board / vote ---------- */
function BoardSection() {
  const [myVote, setMyVote] = useState<string | null>(() => lsGet(VOTE.key));
  const total = VOTE.options.reduce((t, o) => t + o.base + (myVote === o.id ? 1 : 0), 0);

  return (
    <section id="board">
      <div className="wrap">
        <div className="sec-head"><span className="sec-no">GOVERNANCE — OF THE SHOW</span><h2>The Board</h2></div>
        <p className="sec-sub">
          You are the board of directors of a fictional company. Free to join, one account one vote. The Board
          runs the company — the story, the casting, the firings. <b>It does not, and will never, run anything
          with a price on it.</b>
        </p>
        <div className="boardwrap">
          <div className="resolution">
            <div className="res-no">{VOTE.no}</div>
            <h3>{VOTE.title}</h3>
            <p className="res-body">{VOTE.body}</p>
            <div>
              {VOTE.options.map((o) => {
                const n = o.base + (myVote === o.id ? 1 : 0);
                const pct = Math.round((100 * n) / total);
                return (
                  <button
                    key={o.id}
                    className={"voteopt" + (myVote === o.id ? " picked" : "")}
                    onClick={() => { setMyVote(o.id); lsSet(VOTE.key, o.id); }}
                  >
                    <span className="vo-label">{o.label}</span>
                    <span className="vo-cons">{o.consPlain} <b>{o.consBold}</b></span>
                    <span className="tallybar"><i style={{ width: pct + "%" }} /></span>
                    <span className="vo-pct num">{pct}% · {n} votes{myVote === o.id ? " · YOURS" : ""}</span>
                  </button>
                );
              })}
            </div>
            <p className="vo-pct">
              {myVote
                ? "Vote recorded on this device. On the live show, Friday's scene enacts the result — permanently."
                : "Live tally — demo vote, stored on your device only."}
            </p>
          </div>
          <div>
            <div className="govnote">
              <h3>WHAT THE BOARD CANNOT TOUCH</h3>
              <p>This is show governance, not market governance. Written into the Show Charter, not amendable by any vote:</p>
              <p className="lockline">
                ✕ prices, trading, treasuries, listings<br />
                ✕ financial promises of any kind<br />
                ✕ real people, real data, real harm<br />
                ✕ Linda's veto. Ever.
              </p>
              <p style={{ marginTop: 10 }}>
                The Board votes on story, casting, budgets <i>inside the fiction</i>, merch, parties, and who
                gets walked to the elevator with a box.
              </p>
            </div>
            <div className="lb">
              <h3>DEPARTMENT STANDINGS — WEEK 1</h3>
              {STANDINGS.map((s, i) => (
                <div className="lbrow" key={s.dept}>
                  <span className="rank num">{i + 1}</span>
                  <span className="dsw" style={{ background: DEPT[s.dept].c }} />
                  <span className="dname">{DEPT[s.dept].label}</span>
                  <span className="note">{s.note}</span>
                  <span className="pts num">{s.pts}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- sponsors ---------- */
function SponsorsSection() {
  return (
    <section id="sponsors">
      <div className="wrap">
        <div className="sec-head"><span className="sec-no">AD SALES — IN-WORLD ONLY</span><h2>Sponsor Inventory</h2></div>
        <p className="sec-sub">
          No banners. Every unit is a joke the show wants to tell anyway. Every placement is disclosed on
          screen with a brass SPONSOR tag, and every creative is reviewed by our compliance character — on
          camera. Rejections become a segment.
        </p>
        <div className="spongrid">
          {SPONSORS.map((s) => (
            <div className="card spon" key={s.name}>
              <div className="card-band" style={{ background: "var(--brass)" }} />
              <div className="card-pad">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 }}>
                  <h3 className="scene-title">{s.name}</h3><span className="price num">{s.price}</span>
                </div>
                <div className="detail" style={{ marginTop: 10 }}>
                  <div className="drow"><b>On screen</b>{s.screen}</div>
                  <div className="drow"><b>Why it's native</b>{s.native}</div>
                </div>
                <div className="joke">"{s.joke}"<small>SAMPLE IN-WORLD BEAT — YOU APPROVE THE SETUP, THE SHOW OWNS THE PUNCHLINE</small></div>
              </div>
            </div>
          ))}
        </div>
        <p className="disclose">
          HOUSE RULES: disclosure always (#ad + in-world tag) · no financial products, health claims, or
          politics · you approve the setup, the show owns the punchline · Linda's veto is real and final ·
          one free make-good if your beat misfires. Rates are launch-tier and reprice quarterly.
        </p>
      </div>
    </section>
  );
}

/* ---------- clip lab ---------- */
function ClipLabSection() {
  return (
    <section id="cliplab">
      <div className="wrap">
        <div className="sec-head"><span className="sec-no">DISTRIBUTION — DAILY</span><h2>The Clip Lab</h2></div>
        <p className="sec-sub">
          Named formats compound. These seven ship on a schedule — vertical, captioned, and pointed straight
          back at the live floor.
        </p>
        <div className="clipgrid">
          {CLIPS.map((c) => (
            <div className="clip" key={c.name}>
              <span className="freq">{c.freq}</span>
              <h3>{c.name}</h3>
              <p className="shape">{c.shape}</p>
              <div className="cap">{c.cap}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- badge ---------- */
function BadgeSection() {
  const [email, setEmail] = useState("");
  const [note, setNote] = useState(
    "Demo capture — stored on your device only in this preview. No pricing, no dates, no promises. Watching is free and always will be."
  );
  const join = () => {
    if (!email.trim() || !email.includes("@")) {
      setNote("That doesn't look like an email. Gloria has opened a file on it.");
      return;
    }
    lsSet("f15_waitlist", email.trim());
    setNote("Noted on this device (demo). When badges are real, the waitlist hears first — and hears honestly.");
  };

  return (
    <section id="badge">
      <div className="wrap">
        <div className="sec-head"><span className="sec-no">COMING — WHEN IT'S EARNED</span><h2>The Badge</h2></div>
        <div className="badgewrap">
          <div className="badgecard" aria-hidden="true">
            <div className="badge-photo">YOU</div>
            <div className="badge-name">Your Name Here</div>
            <div className="badge-title">TITLE PENDING · DEPT PENDING</div>
            <div className="clearance">
              <span className="cdot on" /><span className="cdot on" /><span className="cdot" /><span className="cdot" /><span className="cdot" />
            </div>
            <div className="badge-since">{SHOW.company.toUpperCase()} · EMPLOYEE SINCE S1</div>
          </div>
          <div className="badge-copy">
            <p>
              A Badge is your ID at HoldCo: your face when you walk into a scene, your clearance for the
              locked floors, your seat in the Boardroom, and a service record that grows every season — votes
              cast, missions won, rooms you were in when it happened. You can't buy a three-season service
              record. You can only have been here.
            </p>
            <p>
              Badges are access, participation, and recognition inside a fictional show. They are not an
              investment, they promise no returns, and nothing here is for sale today. Right now the show is
              free, and proving itself. That's the whole phase.
            </p>
            <div className="waitrow">
              <input
                type="email" value={email} placeholder="you@somewhere.com"
                aria-label="Email for badge waitlist" onChange={(e) => setEmail(e.target.value)}
              />
              <button className="btn btn-ink" onClick={join}>Join the waitlist</button>
            </div>
            <p className="waitnote">{note}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- footer ---------- */
function Footer() {
  return (
    <footer>
      <div className="wrap">
        <p>
          <b>{SHOW.name}</b> is an entertainment product. All characters, companies, products, footsteps, and
          quarterly results are fictional and satirical. The Board governs the show universe — story, casting,
          events, access. It has no authority over markets, and it never will.
        </p>
        <p className="fine">
          Nothing on this site is financial advice. Max Margin is wrong about almost everything, and that is
          the joke. · HR IS WATCHING · © {SHOW.companyLegal}, a company that does something.
        </p>
      </div>
    </footer>
  );
}

/* ---------- root ---------- */
function useHash(): string {
  const [h, setH] = useState(() => window.location.hash);
  useEffect(() => {
    const on = () => setH(window.location.hash);
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  return h;
}

export default function App() {
  const hash = useHash();
  if (hash === "#loop") return <SocialLoop />;
  return <SitePage />;
}

function SitePage() {
  const [night, setNight] = useState(() => {
    const saved = lsGet("f15_night");
    if (saved !== null) return saved === "1";
    const h = etHour();
    return h >= 21 || h < 7;
  });
  const [block, setBlock] = useState("—");
  const [countdown, setCountdown] = useState("--:--");
  const [active, setActive] = useState("#live");

  // night palette on <html> so tokens cascade everywhere
  useEffect(() => {
    document.documentElement.classList.toggle("night", night);
  }, [night]);
  const toggleNight = useCallback(() => {
    setNight((n) => { lsSet("f15_night", n ? "0" : "1"); return !n; });
  }, []);

  // clock: ET time block + countdown to next 9:15 standup
  useEffect(() => {
    const update = () => {
      const h = etHour();
      let label = TIME_BLOCKS[0][1];
      for (const [start, name] of TIME_BLOCKS) if (h >= start) label = name;
      setBlock(label);
      const now = new Date();
      const next = new Date(now);
      next.setHours(9, 15, 0, 0);
      if (now > next) next.setDate(next.getDate() + 1);
      const ms = next.getTime() - now.getTime();
      const hh = Math.floor(ms / 3.6e6), mm = Math.floor((ms % 3.6e6) / 6e4);
      setCountdown(`${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`);
    };
    update();
    const id = setInterval(update, 30000);
    return () => clearInterval(id);
  }, []);

  // rail highlight on scroll
  useEffect(() => {
    const map = RAIL.map((r) => [r.href, document.querySelector(r.href)] as const).filter(([, el]) => el);
    const io = new IntersectionObserver(
      (es) => {
        for (const e of es) {
          if (e.isIntersecting) {
            const hit = map.find(([, el]) => el === e.target);
            if (hit) setActive(hit[0]);
          }
        }
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    map.forEach(([, el]) => io.observe(el!));
    return () => io.disconnect();
  }, []);

  return (
    <>
      <TopBar night={night} onToggle={toggleNight} block={block} />
      <Rail active={active} />
      <main>
        <Hero countdown={countdown} />
        <LiveFloor night={night} />
        <ElevatorCam night={night} />
        <CastSection />
        <ScenesSection />
        <WeekSection />
        <FilesSection />
        <BoardSection />
        <SponsorsSection />
        <ClipLabSection />
        <BadgeSection />
        <Footer />
      </main>
      <Ticker />
    </>
  );
}
