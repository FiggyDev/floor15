/* Director Mode — INTERNAL staging tool (#director). Not an admin surface, not a
   promise of one: it composes a shot in the existing world so a human can frame and
   record it. No writes, no approvals, no engine mutation. */
import { useMemo, useState } from "react";
import { Office3D, type CamMode, type CastPlacement, type ZoneId } from "./Office3D";
import { CAST, DEPT, SHOW } from "./show";

const LOCATIONS: { id: ZoneId; label: string; cam: CamMode }[] = [
  { id: "office", label: "Floor 15 office", cam: "wide" },
  { id: "office", label: "Elevator, Car A", cam: "elevator" },
  { id: "boardroom", label: "Boardroom", cam: "boardroom" },
  { id: "office", label: "Legal", cam: "legal" },
  { id: "cafe", label: "Lobby cafe", cam: "cafe" },
  { id: "rooftop", label: "Rooftop bar", cam: "rooftop" },
  { id: "hallway", label: "The Residences", cam: "hallway" },
  { id: "floor16", label: "Floor 16 (tease)", cam: "floor16" },
];

const SHOTS: { id: CamMode; label: string }[] = [
  { id: "wide", label: "Wide" }, { id: "follow", label: "Follow" }, { id: "desk", label: "Close-up" },
  { id: "elevator", label: "Two-shot" }, { id: "clippan", label: "Orbit" },
  { id: "breakroom", label: "Security cam" }, { id: "loop", label: "Elevator cam" },
];

const TONES = [
  { id: "funny", label: "Funny", note: "Let the joke land, then hold two beats on a reaction." },
  { id: "tense", label: "Tense", note: "Slow the cut rate. Silence is the tool. Nobody moves first." },
  { id: "romantic", label: "Romantic tension", note: "Two-shot, warm light, one person looks away first." },
  { id: "betrayal", label: "Betrayal", note: "The receipt enters frame before the accusation does." },
  { id: "party", label: "Party", note: "Wide, crowded, overlapping. Cut on the wrong person's face." },
  { id: "panic", label: "Corporate panic", note: "Everyone talks; the dial moves; nobody solves anything." },
  { id: "legal", label: "Legal interruption", note: "Build the sentence. Kill it mid-word. Hold the silence." },
] as const;

const LENGTHS = [15, 25, 45] as const;

export default function Director() {
  const [locIdx, setLocIdx] = useState(0);
  const [shot, setShot] = useState<CamMode>("wide");
  const [tone, setTone] = useState<(typeof TONES)[number]["id"]>("funny");
  const [picked, setPicked] = useState<string[]>(["max", "roxy"]);
  const [len, setLen] = useState<(typeof LENGTHS)[number]>(25);
  const [night, setNight] = useState(false);

  const loc = LOCATIONS[locIdx];
  const shotDef = SHOTS.find((s) => s.id === shot) ?? SHOTS[0];
  const cam: CamMode = shot === "follow" ? "follow" : shot === "wide" ? loc.cam : shot;
  const placements: CastPlacement[] = useMemo(
    () => picked.map((id, i) => ({ id, zone: loc.id, slot: i })), [picked, loc.id]);
  const toneNote = TONES.find((t) => t.id === tone)!.note;

  const toggle = (id: string) =>
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : p.length >= 4 ? p : [...p, id]));

  const recipe = [
    `LOCATION  ${loc.label}`,
    `SHOT      ${shotDef.label}${shot === "wide" && loc.cam !== "wide" ? " (" + loc.label + " default)" : ""}`,
    `TONE      ${TONES.find((t) => t.id === tone)?.label} — ${toneNote}`,
    `CAST      ${picked.map((p) => CAST.find((c) => c.id === p)?.name).join(" · ") || "(none)"}`,
    `LENGTH    ${len}s${len === 15 ? " — one beat, one punchline" : len === 25 ? " — setup, turn, punchline, hold" : " — two turns, let it breathe"}`,
    `LIGHT     ${night ? "After hours" : "Day shift"}`,
  ].join("\n");

  return (
    <div className="dirwrap">
      <div className="dirbar">
        <span className="internal">INTERNAL — STAGING TOOL</span>
        <span className="wordmark">{SHOW.wordmark[0]} <b>{SHOW.wordmark[1]}</b> DIRECTOR</span>
        <span className="spacer" />
        <a className="dirlink" href="#loops">clip routes →</a>
        <a className="dirlink" href="#live">site →</a>
      </div>

      <div className="dirgrid">
        <div className="dirviewer">
          <Office3D mode={cam} placements={placements} doorsOpen night={night}
            speakerId={picked[0] ?? null} followId={picked[0]} className="dircanvas" />
          <div className="dirlt">
            <div className="lt-name">{picked[0] ? CAST.find((c) => c.id === picked[0])?.name : "FLOOR 15"}</div>
            <div className="lt-title">{loc.label.toUpperCase()} · {shotDef.label.toUpperCase()}</div>
          </div>
        </div>

        <div className="dirpanel">
          <fieldset><legend>Location</legend>
            <div className="dirchips">
              {LOCATIONS.map((l, i) => (
                <button key={l.label} className={"dirchip" + (locIdx === i ? " on" : "")}
                  onClick={() => { setLocIdx(i); setShot("wide"); }}>{l.label}</button>
              ))}
            </div>
          </fieldset>
          <fieldset><legend>Camera</legend>
            <div className="dirchips">
              {SHOTS.map((s) => (
                <button key={s.id + s.label} className={"dirchip" + (shot === s.id ? " on" : "")}
                  onClick={() => setShot(s.id)}>{s.label}</button>
              ))}
            </div>
          </fieldset>
          <fieldset><legend>Tone</legend>
            <div className="dirchips">
              {TONES.map((t) => (
                <button key={t.id} className={"dirchip" + (tone === t.id ? " on" : "")}
                  onClick={() => setTone(t.id)}>{t.label}</button>
              ))}
            </div>
            <p className="dirnote">{toneNote}</p>
          </fieldset>
          <fieldset><legend>Cast <span className="dim">(max 4)</span></legend>
            <div className="dirchips">
              {CAST.map((c) => (
                <button key={c.id} className={"dirchip" + (picked.includes(c.id) ? " on" : "")}
                  style={picked.includes(c.id) ? { borderColor: DEPT[c.dept].c } : undefined}
                  onClick={() => toggle(c.id)}>{c.name.split(" ")[0]}</button>
              ))}
            </div>
          </fieldset>
          <fieldset><legend>Loop length</legend>
            <div className="dirchips">
              {LENGTHS.map((l) => (
                <button key={l} className={"dirchip" + (len === l ? " on" : "")} onClick={() => setLen(l)}>{l}s</button>
              ))}
              <button className={"dirchip" + (night ? " on" : "")} onClick={() => setNight(!night)}>
                {night ? "After hours" : "Day shift"}
              </button>
            </div>
          </fieldset>
          <div className="dirrecipe">
            <div className="dirrecipe-head">RECORD THIS</div>
            <pre>{recipe}</pre>
            <p className="dirnote">
              Frame it here, then record from a clip route (<a href="#loops">#loops</a>) or capture this
              viewer directly. Staging only — nothing here writes to canon, approves a scene, or posts anything.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
