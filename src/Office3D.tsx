/* FLOOR 15 — the living cartoon world (v0.6). Plain three.js, procedural, zero assets.
   Zones laid out as far-apart sets in one scene; waypoint walking; toon shading + outlines;
   canvas-texture skylines; broadcast UI stays DOM. WebGL failure -> onFail() -> 2D stage. */
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { CAST } from "./show";

export type CamMode =
  | "wide" | "desk" | "boardroom" | "legal" | "elevator" | "loop"
  | "cafe" | "rooftop" | "hallway" | "floor16" | "merch" | "breakroom"
  | "follow" | "clippan";

export type ZoneId = "office" | "cafe" | "boardroom" | "rooftop" | "hallway" | "floor16";

const DEPT_HEX: Record<string, number> = {
  trading: 0xe03327, marketing: 0xf13f96, legal: 0x245086, hr: 0x6b7436,
  merch: 0xf07f16, sec: 0x5c6a77, ops: 0x413c4a, intern: 0x27ab6b,
};
const SKIN_HEX: Record<string, number> = {
  barry: 0xeec092, linda: 0x8d5a3b, max: 0xf5c898, trixie: 0xc68642,
  roxy: 0x6b4226, manny: 0xd9a066, evan: 0xf7d4ab,
};
const MOOD_HEX: Record<string, number> = {
  barry: 0x2fa36b, linda: 0xe07b1f, max: 0xd8362a, trixie: 0xe23e8e,
  roxy: 0x8a95a1, manny: 0xe07b1f, evan: 0x2fa36b,
};
const HAIR_HEX: Record<string, number> = {
  barry: 0xd4d7dc, linda: 0x241a10, max: 0x6b4a2f, trixie: 0x1e1520,
  roxy: 0x14100c, manny: 0x3a2a1a, evan: 0x8a5a2b,
};

/* zone origins: far-apart sets in one scene */
const ZO: Record<ZoneId, [number, number]> = {
  office: [0, 0], cafe: [46, 0], boardroom: [82, 0], rooftop: [118, 0], hallway: [154, 0], floor16: [190, 0],
};

const CAMS: Record<CamMode, { pos: [number, number, number]; look: [number, number, number] }> = {
  wide:      { pos: [0, 7.2, 13.4],   look: [0, 0.9, -0.5] },
  desk:      { pos: [-1.2, 2.3, 5.0], look: [0.2, 1.35, -2] },
  merch:     { pos: [-7.2, 2.0, 4.2], look: [-10.2, 1.0, 5.9] },
  breakroom: { pos: [-4.6, 1.9, 4.4], look: [-7.6, 1.0, 6.4] },
  legal:     { pos: [7.2, 1.7, 7.6],  look: [10.2, 1.15, 5.0] },
  elevator:  { pos: [-9.9, 1.75, 0.05], look: [-12.4, 1.28, 0] },
  loop:      { pos: [-9.98, 1.72, 0.08], look: [-12.4, 1.26, 0] },
  boardroom: { pos: [82, 2.7, 5.4],   look: [82, 1.25, -1.6] },
  cafe:      { pos: [46, 2.35, 5.6],  look: [46, 1.25, -1.6] },
  rooftop:   { pos: [118.2, 2.5, 6.4], look: [118.2, 1.2, -1.6] },
  hallway:   { pos: [149.4, 1.75, 0], look: [156, 1.3, 0] },
  floor16:   { pos: [190, 1.9, 6.8],  look: [190, 1.4, -1] },
  follow:    { pos: [0, 7.2, 13.4],   look: [0, 0.9, -0.5] },   // dynamic
  clippan:   { pos: [0, 6.4, 12.5],   look: [0, 1, 0] },        // dynamic
};

/* standing spots per zone (world coords) */
const SPOTS: Record<ZoneId, [number, number][]> = {
  office:    [[-3, 3.2], [1, 3.2], [-1, 4.6], [3, 4.6]],
  cafe:      [[45.2, -0.4], [46.9, -0.2], [44.0, 0.9], [48.0, 0.9]],
  boardroom: [[82, -1.2], [80.4, 0.4], [83.6, 0.4], [81.2, 1.8], [82.8, 1.8]],
  rooftop:   [[117.4, -0.6], [119.2, -0.4], [115.6, 0.6], [120.6, 0.4]],
  hallway:   [[153.6, 0], [155.4, 0.5], [152.2, -0.4]],
  floor16:   [[190, 0.5]],
};
const ELEV_SPOTS: [number, number][] = [[-12.2, -0.62], [-12.2, 0.62]];

/* office points of interest for ambient wandering */
const POI: [number, number][] = [[6.4, 6.0], [-7.6, 6.0], [-9.8, 5.2], [8.2, 4.2], [-8.6, -5.0], [-10.0, 1.2], [2.2, 6.2]];

export interface CastPlacement { id: string; zone: ZoneId; slot: number; at?: [number, number]; }
export interface Office3DProps {
  mode: CamMode; speakerId?: string | null; placements?: CastPlacement[]; doorsOpen?: boolean;
  night?: boolean; ambient?: boolean; followId?: string; onFail?: () => void; className?: string;
}

let _grad: THREE.DataTexture | null = null;
function grad(): THREE.DataTexture {
  if (_grad) return _grad;
  const d = new Uint8Array([100, 100, 100, 255, 182, 182, 182, 255, 255, 255, 255, 255]);
  _grad = new THREE.DataTexture(d, 3, 1, THREE.RGBAFormat);
  _grad.needsUpdate = true; _grad.minFilter = _grad.magFilter = THREE.NearestFilter;
  return _grad;
}
const toon = (c: number) => new THREE.MeshToonMaterial({ color: c, gradientMap: grad() });
const OUTLINE_M = new THREE.MeshBasicMaterial({ color: 0x17150f, side: THREE.BackSide });

function nameSprite(text: string, color: number, w = 1.15): THREE.Sprite {
  const c = document.createElement("canvas");
  c.width = 256; c.height = 64;
  const g = c.getContext("2d")!;
  g.fillStyle = "rgba(23,21,15,.92)";
  if (typeof g.roundRect === "function") { g.beginPath(); g.roundRect(0, 0, 256, 64, 18); g.fill(); }
  else { g.fillRect(0, 0, 256, 64); }
  g.fillStyle = "#" + color.toString(16).padStart(6, "0"); g.fillRect(0, 14, 10, 36);
  g.fillStyle = "#F1EDE2"; g.font = "700 32px Bricolage Grotesque, Arial, sans-serif";
  g.textBaseline = "middle"; g.fillText(text.toUpperCase(), 26, 34);
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c) }));
  sp.scale.set(w, 0.29, 1);
  return sp;
}

function outlined(geo: THREE.BufferGeometry, mat: THREE.Material, s = 1.05): THREE.Group {
  const g = new THREE.Group();
  const line = new THREE.Mesh(geo, OUTLINE_M); line.scale.setScalar(s);
  const m = new THREE.Mesh(geo, mat); m.castShadow = true;
  g.add(line, m);
  return g;
}

function skylineTex(n: boolean, seed0: number): THREE.CanvasTexture {
  const c = document.createElement("canvas"); c.width = 1024; c.height = 300;
  const g = c.getContext("2d")!;
  const grd = g.createLinearGradient(0, 0, 0, 300);
  if (n) { grd.addColorStop(0, "#0a0f26"); grd.addColorStop(0.7, "#1b2148"); grd.addColorStop(1, "#2a2452"); }
  else { grd.addColorStop(0, "#aed2ea"); grd.addColorStop(1, "#eef1f0"); }
  g.fillStyle = grd; g.fillRect(0, 0, 1024, 300);
  // sun / moon
  g.fillStyle = n ? "#f2ead9" : "#ffdf8a";
  g.beginPath(); g.arc(n ? 840 : 180, 64, n ? 26 : 34, 0, 7); g.fill();
  if (n) { g.fillStyle = "#0a0f26"; g.beginPath(); g.arc(852, 56, 22, 0, 7); g.fill(); }
  let seed = seed0;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  // far layer (haze)
  let x = -10;
  g.fillStyle = n ? "#141a33" : "#c3cfdd";
  while (x < 1024) { const w = 40 + rnd() * 70, h = 60 + rnd() * 110; g.fillRect(x, 300 - h, w, h); x += w + 4; }
  // near layer
  x = -10;
  while (x < 1024) {
    const w = 36 + rnd() * 62, h = 100 + rnd() * 170;
    g.fillStyle = n ? "#0d1120" : "#8fa3b8";
    g.fillRect(x, 300 - h, w, h);
    g.fillStyle = n ? "#f5d95a" : "#e8eef2";
    for (let wy = 300 - h + 10; wy < 286; wy += 15) for (let wx = x + 5; wx < x + w - 7; wx += 13)
      if (rnd() > (n ? 0.55 : 0.8)) g.fillRect(wx, wy, 4, 7);
    x += w + 6 + rnd() * 10;
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

interface CharRig {
  group: THREE.Group; headG: THREE.Group; mouth: THREE.Mesh; smile: THREE.Mesh;
  eyes: THREE.Group; arms: THREE.Group[]; mood: THREE.Mesh; ring: THREE.Mesh;
  deskPos: THREE.Vector3; idlePhase: number; still: boolean;
  target: THREE.Vector3 | null; home: THREE.Vector3; walkT: number; blinkAt: number;
  idle: IdleStyle;
}

/** Per-character idle signature — the thing you recognize before you read the name tag. */
interface IdleStyle {
  bob: number;        // vertical idle amplitude
  sway: number;       // body sway
  fidget: number;     // arm micro-motion
  headTurn: number;   // how much they look around
  speed: number;      // walk speed
  blinkGap: number;   // seconds between blinks
}
const IDLE: Record<string, IdleStyle> = {
  // Max: anxious. Constant motion, fast blinks, hands never settle.
  max:    { bob: 0.075, sway: 0.05,  fidget: 0.22, headTurn: 0.10, speed: 2.3, blinkGap: 1.7 },
  // Linda: precise stillness. Minimal motion, slow deliberate head turns.
  linda:  { bob: 0.022, sway: 0.008, fidget: 0.03, headTurn: 0.05, speed: 1.6, blinkGap: 4.2 },
  // Roxy: controlled stillness. Even less than Linda, but she SCANS.
  roxy:   { bob: 0.012, sway: 0.004, fidget: 0.01, headTurn: 0.22, speed: 1.0, blinkGap: 5.5 },
  // Barry: fake authority. Big slow gestures, expansive, unhurried.
  barry:  { bob: 0.05,  sway: 0.045, fidget: 0.16, headTurn: 0.07, speed: 1.4, blinkGap: 3.6 },
  // Trixie: phone posture. Small quick motions, head down then up.
  trixie: { bob: 0.055, sway: 0.03,  fidget: 0.18, headTurn: 0.14, speed: 2.1, blinkGap: 2.2 },
  // Manny: measuring gestures. Arms wide, rhythmic, theatrical.
  manny:  { bob: 0.06,  sway: 0.05,  fidget: 0.26, headTurn: 0.09, speed: 1.8, blinkGap: 3.0 },
  // Evan: over-helpful. Bouncy, wanders, looks everywhere.
  evan:   { bob: 0.085, sway: 0.035, fidget: 0.14, headTurn: 0.26, speed: 2.0, blinkGap: 2.6 },
};

function buildCharacter(id: string, dept: string) {
  const g = new THREE.Group();
  const skin = SKIN_HEX[id], suit = DEPT_HEX[dept], hairC = HAIR_HEX[id];

  // contact shadow
  const shadow = new THREE.Mesh(new THREE.CircleGeometry(0.52, 20),
    new THREE.MeshBasicMaterial({ color: 0x17150f, transparent: true, opacity: 0.16 }));
  shadow.rotation.x = -Math.PI / 2; shadow.position.y = 0.02; g.add(shadow);

  // body: rounder, shorter (bigger-head cartoon read)
  const body = outlined(new THREE.CapsuleGeometry(0.4, 0.3, 6, 16), toon(suit), 1.045);
  body.position.y = 0.68; g.add(body);
  const arms: THREE.Group[] = [];
  for (const sx of [-1, 1]) {
    const arm = new THREE.Group();
    const limb = outlined(new THREE.CapsuleGeometry(0.09, 0.3, 4, 8), toon(suit), 1.12);
    limb.position.y = -0.14;
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8), toon(skin));
    hand.position.y = -0.34;
    arm.add(limb, hand);
    arm.position.set(0.45 * sx, 0.92, 0.02);
    arm.rotation.z = sx * 0.42;
    g.add(arm); arms.push(arm);
  }

  const headG = new THREE.Group(); headG.position.y = 1.6;
  const head = outlined(new THREE.SphereGeometry(0.45, 24, 20), toon(skin), 1.04);
  headG.add(head);

  const eyes = new THREE.Group();
  for (const sx of [-1, 1]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 12), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    eye.scale.set(1, 1.25, 0.55); eye.position.set(0.16 * sx, 0.06, 0.38);
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), new THREE.MeshBasicMaterial({ color: 0x17150f }));
    pupil.position.set(0.16 * sx, 0.05, 0.455);
    const glint = new THREE.Mesh(new THREE.SphereGeometry(0.016, 6, 6), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    glint.position.set(0.16 * sx + 0.02, 0.09, 0.49);
    eyes.add(eye, pupil, glint);
  }
  headG.add(eyes);
  for (const sx of [-1, 1]) {
    const brow = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.04, 0.03), new THREE.MeshBasicMaterial({ color: 0x17150f }));
    const tilt: Record<string, number> = { barry: -0.15, linda: 0.3, max: -0.42, trixie: -0.1, roxy: 0.12, manny: -0.25, evan: 0.3 };
    brow.position.set(0.16 * sx, 0.23, 0.41); brow.rotation.z = (tilt[id] ?? 0) * sx;
    headG.add(brow);
  }
  // cheeks
  for (const sx of [-1, 1]) {
    const cheek = new THREE.Mesh(new THREE.CircleGeometry(0.05, 10),
      new THREE.MeshBasicMaterial({ color: 0xe8836b, transparent: true, opacity: 0.5 }));
    cheek.position.set(0.27 * sx, -0.08, 0.4); headG.add(cheek);
  }
  const mouth = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 8), new THREE.MeshBasicMaterial({ color: 0x40201a }));
  mouth.position.set(0, -0.17, 0.4); mouth.scale.set(1.4, 0.5, 0.6); mouth.visible = false;
  const smile = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.02, 6, 14, Math.PI * 0.7), new THREE.MeshBasicMaterial({ color: 0x17150f }));
  smile.position.set(0, -0.12, 0.42); smile.rotation.z = Math.PI + Math.PI * 0.15;
  headG.add(mouth, smile);

  const H = toon(hairC);
  if (id === "barry") {
    const swoop = new THREE.Mesh(new THREE.SphereGeometry(0.46, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.45), H);
    swoop.position.y = 0.07; swoop.scale.set(1.05, 1.08, 1.05); headG.add(swoop);
  } else if (id === "linda") {
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.46, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.5), H);
    cap.position.y = 0.05; cap.scale.setScalar(1.04); headG.add(cap);
    const bun = new THREE.Mesh(new THREE.SphereGeometry(0.15, 10, 10), H); bun.position.set(0, 0.45, -0.2); headG.add(bun);
    for (const sx of [-1, 1]) {
      const lens = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.018, 8, 18), new THREE.MeshBasicMaterial({ color: 0xc9a44c }));
      lens.position.set(0.13 * sx, 0.36, 0.28); lens.rotation.x = -1.1; headG.add(lens);
    }
  } else if (id === "max") {
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.46, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.4), H);
    cap.position.y = 0.08; cap.scale.set(1.05, 1.12, 1.05); headG.add(cap);
    const tie = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.36, 0.04), toon(0xc9a44c));
    tie.position.set(0.1, -0.78, 0.36); tie.rotation.z = 0.3; headG.add(tie);
  } else if (id === "trixie") {
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.46, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.5), H);
    cap.position.y = 0.05; cap.scale.setScalar(1.04); headG.add(cap);
    const pony = new THREE.Mesh(new THREE.CapsuleGeometry(0.1, 0.44, 4, 8), H);
    pony.position.set(0.18, 0.44, -0.24); pony.rotation.z = -0.7; headG.add(pony);
  } else if (id === "roxy") {
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.46, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.46), H);
    cap.position.y = 0.06; cap.scale.setScalar(1.03); headG.add(cap);
    const ear = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 8), new THREE.MeshBasicMaterial({ color: 0x17150f }));
    ear.position.set(0.43, 0, 0.05); headG.add(ear);
  } else if (id === "manny") {
    for (const [px, py] of [[-0.18, 0.32], [0, 0.42], [0.18, 0.32]] as const) {
      const curl = new THREE.Mesh(new THREE.SphereGeometry(0.17, 10, 10), H);
      curl.position.set(px, py, 0.02); headG.add(curl);
    }
    const scarf = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.075, 8, 20), toon(0xf5d95a));
    scarf.position.y = -0.5; scarf.rotation.x = Math.PI / 2.2; headG.add(scarf);
  } else if (id === "evan") {
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.46, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.38), H);
    cap.position.y = 0.11; cap.scale.set(1.02, 1.18, 1.02); headG.add(cap);
    const badge = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.13, 0.02), new THREE.MeshBasicMaterial({ color: 0xfbf9f4 }));
    badge.position.set(0, -0.76, 0.42); headG.add(badge);
  }
  g.add(headG);

  const mood = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), new THREE.MeshBasicMaterial({ color: MOOD_HEX[id] }));
  mood.position.y = 2.5; g.add(mood);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.58, 0.04, 8, 30), new THREE.MeshBasicMaterial({ color: 0xc9a44c }));
  ring.rotation.x = -Math.PI / 2; ring.position.y = 0.045; ring.visible = false; g.add(ring);

  return { group: g, headG, mouth, smile, eyes, arms, mood, ring };
}

export function Office3D({ mode, speakerId, placements = [], doorsOpen = false, night = false,
  ambient = false, followId, onFail, className }: Office3DProps) {
  const mount = useRef<HTMLDivElement>(null);
  const api = useRef<{
    setMode: (m: CamMode) => void; setSpeaker: (s: string | null) => void;
    setPlacements: (p: CastPlacement[]) => void; setDoors: (o: boolean) => void;
    setNight: (n: boolean) => void; setFollow: (id: string | undefined) => void;
    wander: () => void;
  } | null>(null);

  useEffect(() => {
    const el = mount.current!;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "low-power" });
      if (!renderer.getContext()) throw new Error("no webgl");
    } catch { onFail?.(); return; }
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(44, 16 / 9, 0.1, 80);
    const box = (w: number, h: number, d: number, c: number) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), toon(c));

    const skyDay = skylineTex(false, 7), skyNight = skylineTex(true, 7);
    const skyDay2 = skylineTex(false, 99), skyNight2 = skylineTex(true, 99);

    /* ================= ZONE: office (unchanged core from v0.5, condensed) ================= */
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(26, 16), toon(0xd8d1c2));
    floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
    const rug = new THREE.Mesh(new THREE.CircleGeometry(6.4, 40), toon(0x2c2620));
    rug.rotation.x = -Math.PI / 2; rug.position.set(0, 0.01, -1); scene.add(rug);
    const rug2 = new THREE.Mesh(new THREE.CircleGeometry(5.2, 40), toon(0x4a3b2f));
    rug2.rotation.x = -Math.PI / 2; rug2.position.set(0, 0.02, -1); scene.add(rug2);
    const cityMat = new THREE.MeshBasicMaterial({ map: skyDay });
    const city = new THREE.Mesh(new THREE.PlaneGeometry(19.4, 5.0), cityMat);
    city.position.set(-3.3, 2.5, -8.05); scene.add(city);
    for (const mx of [-12.6, -8.6, -4.6, -0.6, 3.4, 6.2]) {
      const mullion = box(0.1, 5.0, 0.08, 0xb08d3e); mullion.position.set(mx, 2.5, -7.9); scene.add(mullion);
    }
    const spandrel = box(19.6, 0.28, 0.2, 0x17150f); spandrel.position.set(-3.3, 0.14, -7.9); scene.add(spandrel);
    const wallB = box(7.2, 5.2, 0.3, 0xe8dfca); wallB.position.set(9.6, 2.6, -8); scene.add(wallB);
    const wallL = box(0.3, 5.2, 16, 0xdfd5bc); wallL.position.set(-13, 2.6, 0); scene.add(wallL);
    const wallR = box(0.3, 5.2, 16, 0xdfd5bc); wallR.position.set(13, 2.6, 0); scene.add(wallR);
    const f16 = box(19.6, 0.42, 0.16, 0x17150f); f16.position.set(-3.3, 4.85, -7.8); scene.add(f16);
    const f16light = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.18, 0.16), new THREE.MeshBasicMaterial({ color: 0x2a2416 }));
    f16light.position.set(-5.4, 4.85, -7.72); scene.add(f16light);
    for (const [x, c] of [[6.9, 0xd8362a], [8.1, 0xe23e8e], [12.2, 0xe07b1f]] as const) {
      const frame = box(1.15, 1.5, 0.08, 0x4a3b2f); frame.position.set(x, 3.1, -7.82);
      const art = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 1.24), new THREE.MeshBasicMaterial({ color: c }));
      art.position.set(x, 3.1, -7.76); scene.add(frame, art);
    }
    const sign = nameSprite("HOLDCO GLOBAL", 0xc9a44c, 2.6); sign.position.set(9.6, 4.55, -7.6); scene.add(sign);
    const bdFrame = box(2.6, 3.4, 0.25, 0x4a3b2f); bdFrame.position.set(9.4, 1.7, -7.8); scene.add(bdFrame);
    const bdDoor = box(2.2, 3.05, 0.15, 0x2450a6); bdDoor.position.set(9.4, 1.55, -7.66); scene.add(bdDoor);
    const legalGlass = new THREE.Mesh(new THREE.BoxGeometry(4.2, 2.9, 3.6),
      new THREE.MeshLambertMaterial({ color: 0x9db4c9, transparent: true, opacity: 0.22 }));
    legalGlass.position.set(10.4, 1.45, 3.4); scene.add(legalGlass);
    const ldesk = box(2.0, 0.16, 0.95, 0x17150f); ldesk.position.set(10.4, 0.86, 3.4); scene.add(ldesk);
    const legalSign = nameSprite("LEGAL", 0x2450a6, 0.95); legalSign.position.set(10.4, 3.3, 3.4); scene.add(legalSign);
    const mb = 0xb08d5e;
    for (const [bx, by, bz, bs, rr] of [[-10.6, 0.6, 5.6, 1.2, 0], [-9.3, 0.5, 6.1, 1.0, 0], [-10.2, 1.65, 5.7, 0.9, 0.4]] as const) {
      const b = box(bs, bs, bs, rr ? 0xc49e6c : mb); b.position.set(bx, by, bz); b.rotation.y = rr; b.castShadow = true; scene.add(b);
    }
    const merchSign = nameSprite("MERCH", 0xe07b1f, 0.95); merchSign.position.set(-10, 2.9, 5.8); scene.add(merchSign);
    const memTable = box(0.9, 0.7, 0.6, 0x4a3b2f); memTable.position.set(-7.6, 0.35, 6.4); scene.add(memTable);
    const machine = box(0.4, 0.5, 0.35, 0x55606b); machine.position.set(-7.7, 0.95, 6.4); scene.add(machine);
    const flame = new THREE.Mesh(new THREE.SphereGeometry(0.035, 6, 6), new THREE.MeshBasicMaterial({ color: 0xffb347 }));
    flame.position.set(-7.3, 0.9, 6.55); scene.add(flame);
    const cooler = box(0.5, 1.1, 0.5, 0xdfd5bc); cooler.position.set(6.6, 0.55, 6.6); scene.add(cooler);
    for (const [px, pz] of [[-12, -6.4], [12, -6.4], [2.2, 6.8]] as const) {
      const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.22, 0.5, 10), toon(0xb0503c)); pot.position.set(px, 0.25, pz);
      const bush = new THREE.Mesh(new THREE.SphereGeometry(0.42, 10, 10), toon(0x3f7d4e)); bush.position.set(px, 0.85, pz);
      scene.add(pot, bush);
    }
    // rec + party dressing (v0.5, kept)
    const backboard = box(0.9, 0.65, 0.06, 0xfbf9f4); backboard.position.set(12.8, 3.0, 2.2); scene.add(backboard);
    const hoop = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.03, 8, 20), new THREE.MeshBasicMaterial({ color: 0xe07b1f }));
    hoop.position.set(12.55, 2.75, 2.2); hoop.rotation.x = Math.PI / 2; scene.add(hoop);
    const green = new THREE.Mesh(new THREE.CircleGeometry(1.5, 30), toon(0x2f7d5a));
    green.rotation.x = -Math.PI / 2; green.position.set(-8.6, 0.02, -5.6); scene.add(green);
    const pole = box(0.03, 1.0, 0.03, 0xfbf9f4); pole.position.set(-9.1, 0.5, -5.9); scene.add(pole);
    const flagM = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.2), new THREE.MeshBasicMaterial({ color: 0xd8362a, side: THREE.DoubleSide }));
    flagM.position.set(-8.93, 0.86, -5.9); scene.add(flagM);
    const pp = box(2.5, 0.12, 1.4, 0x2f7d5a); pp.position.set(8.4, 0.85, 5.4); pp.rotation.y = -0.25; scene.add(pp);
    const net = box(0.05, 0.16, 1.4, 0xfbf9f4); net.position.set(8.4, 0.98, 5.4); net.rotation.y = -0.25; scene.add(net);
    const pongBall = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), new THREE.MeshBasicMaterial({ color: 0xfbf9f4 }));
    scene.add(pongBall);
    const cupG = new THREE.CylinderGeometry(0.055, 0.04, 0.14, 10);
    const cupM = toon(0xd8362a);
    for (const [ox, oz] of [[0, 0], [0.13, 0], [-0.13, 0], [0.065, 0.11], [-0.065, 0.11], [0, 0.22]] as const) {
      const cup = new THREE.Mesh(cupG, cupM); cup.position.set(9.3 + ox, 0.98, 5.15 + oz); scene.add(cup);
    }
    const bean = new THREE.Mesh(new THREE.SphereGeometry(0.62, 14, 12), toon(0xe23e8e));
    bean.scale.set(1, 0.52, 1); bean.position.set(-6.4, 0.3, 6.2); scene.add(bean);
    for (const sz of [-1.5, 1.5]) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.0, 8), toon(0xb08d3e)); post.position.set(-10.2, 0.53, sz);
      const knobT = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), toon(0xc9a44c)); knobT.position.set(-10.2, 1.06, sz);
      scene.add(post, knobT);
    }
    const rope = new THREE.Mesh(new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-10.2, 1.0, -1.5), new THREE.Vector3(-10.2, 0.72, 0), new THREE.Vector3(-10.2, 1.0, 1.5)), 16, 0.035, 6), toon(0x8b1f4b));
    scene.add(rope);
    const disco = new THREE.Mesh(new THREE.SphereGeometry(0.4, 12, 10),
      new THREE.MeshStandardMaterial({ color: 0xd8d8e2, metalness: 0.95, roughness: 0.15, flatShading: true }));
    disco.position.set(9.4, 4.0, 4.6); scene.add(disco);
    const tankBase = box(3.6, 0.5, 0.9, 0x17150f); tankBase.position.set(4.6, 0.25, 3.2); scene.add(tankBase);
    const tank = new THREE.Mesh(new THREE.BoxGeometry(3.4, 1.5, 0.7),
      new THREE.MeshLambertMaterial({ color: 0x3e7fa8, transparent: true, opacity: 0.4 }));
    tank.position.set(4.6, 1.25, 3.2); scene.add(tank);
    const fish: THREE.Group[] = [];
    for (const [fc, fy, fp] of [[0xe07b1f, 1.1, 0], [0xf5d95a, 1.35, 2.2], [0xe23e8e, 1.5, 4.1], [0x2fa36b, 1.2, 5.3]] as const) {
      const f = new THREE.Group();
      const fbody = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8), toon(fc)); fbody.scale.set(1.5, 1, 0.7);
      const ftail = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.12, 6), toon(fc)); ftail.rotation.z = Math.PI / 2; ftail.position.x = -0.16;
      f.add(fbody, ftail); f.position.set(4.6, fy, 3.2); f.userData = { fy, fp };
      scene.add(f); fish.push(f);
    }
    const ceoGlass = new THREE.Mesh(new THREE.BoxGeometry(4.4, 2.9, 3.4),
      new THREE.MeshLambertMaterial({ color: 0xc9d6e2, transparent: true, opacity: 0.18 }));
    ceoGlass.position.set(-10.6, 1.45, -6.1); scene.add(ceoGlass);
    const ceoDesk = box(2.2, 0.16, 1.0, 0x17150f); ceoDesk.position.set(-10.8, 0.9, -6.4); scene.add(ceoDesk);
    const ceoSign = nameSprite("CORNER OFFICE", 0xc9a44c, 1.5); ceoSign.position.set(-10.6, 3.25, -6.1); scene.add(ceoSign);
    const neonC = document.createElement("canvas"); neonC.width = 512; neonC.height = 128;
    const ng = neonC.getContext("2d")!;
    ng.font = "italic 700 74px Bricolage Grotesque, Arial, sans-serif";
    ng.textAlign = "center"; ng.textBaseline = "middle";
    ng.shadowColor = "#ff4fd8"; ng.shadowBlur = 26; ng.fillStyle = "#ffd7f4";
    ng.fillText("SHIP IT.", 256, 66); ng.fillText("SHIP IT.", 256, 66);
    const neon = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(neonC), depthTest: false }));
    neon.scale.set(2.6, 0.65, 1); neon.position.set(12.6, 3.4, 5.2); scene.add(neon);
    const neonLight = new THREE.PointLight(0xff4fd8, 4, 8); neonLight.position.set(12.2, 3.4, 5.2); scene.add(neonLight);
    // elevator
    const carDepth = 2.6;
    const shaft = new THREE.Mesh(new THREE.BoxGeometry(2.8, 3.4, carDepth + 0.4),
      new THREE.MeshLambertMaterial({ color: 0x3a3122, side: THREE.BackSide }));
    shaft.position.set(-12.3, 1.7, 0); scene.add(shaft);
    const carFloor = box(2.7, 0.06, carDepth + 0.3, 0x8a713d); carFloor.position.set(-12.3, 0.03, 0); scene.add(carFloor);
    const carLight = new THREE.PointLight(0xffe9b8, 26, 9); carLight.position.set(-11.9, 2.7, 0); scene.add(carLight);
    const doorL = box(0.12, 3.1, carDepth / 2, 0x8a713d); doorL.position.set(-10.95, 1.55, -carDepth / 4);
    const doorR = box(0.12, 3.1, carDepth / 2, 0x8a713d); doorR.position.set(-10.95, 1.55, carDepth / 4);
    scene.add(doorL, doorR);
    // desks + chairs
    const deskSlots: [number, number][] = [[-6, -3.6], [-2, -3.6], [2, -3.6], [6, -3.6], [-4, 0.8], [0, 0.8], [4, 0.8]];
    deskSlots.forEach(([x, z]) => {
      const top = box(2.3, 0.14, 1.15, 0x1e1b17); top.position.set(x, 0.86, z); top.castShadow = true; scene.add(top);
      for (const [dx, dz] of [[-1.0, -0.42], [1.0, -0.42], [-1.0, 0.42], [1.0, 0.42]] as const) {
        const leg = box(0.09, 0.86, 0.09, 0xb08d3e); leg.position.set(x + dx, 0.43, z + dz); scene.add(leg);
      }
      const mon = box(0.85, 0.55, 0.07, 0x17150f); mon.position.set(x - 0.32, 1.42, z - 0.2); mon.rotation.y = 0.22; scene.add(mon);
      const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.72, 0.44), new THREE.MeshBasicMaterial({ color: 0x35b473 }));
      scr.position.set(x - 0.32, 1.42, z - 0.16); scr.rotation.y = 0.22; scene.add(scr);
    });
    for (const px of [-5, 0, 5]) {
      const shade = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.4, 16), toon(0x17150f)); shade.position.set(px, 4.0, -1);
      const glow = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffe9b8 }));
      glow.position.set(px, 3.86, -1);
      scene.add(shade, glow);
    }

    /* ================= ZONE: lobby cafe ================= */
    {
      const [ox] = ZO.cafe;
      const cfFloor = new THREE.Mesh(new THREE.PlaneGeometry(16, 12), toon(0xcbb99a));
      cfFloor.rotation.x = -Math.PI / 2; cfFloor.position.set(ox, 0, 0); cfFloor.receiveShadow = true; scene.add(cfFloor);
      const back = box(16, 4.6, 0.3, 0x8b4d3a); back.position.set(ox, 2.3, -6); scene.add(back);
      const counter = box(5.4, 1.1, 1.1, 0x4a3b2f); counter.position.set(ox, 0.55, -3.6); counter.castShadow = true; scene.add(counter);
      const counterTop = box(5.6, 0.1, 1.3, 0xc9a44c); counterTop.position.set(ox, 1.12, -3.6); scene.add(counterTop);
      const espresso = box(0.9, 0.7, 0.55, 0x55606b); espresso.position.set(ox - 1.4, 1.55, -3.7); scene.add(espresso);
      const menu = nameSprite("LOBBY CAFE", 0xe07b1f, 2.0); menu.position.set(ox, 3.6, -5.6); scene.add(menu);
      for (const sx of [-1.6, 0, 1.6]) {
        const stool = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.3, 0.66, 10), toon(0xb0503c));
        stool.position.set(ox + sx, 0.33, -2.3); scene.add(stool);
      }
      for (const [tx, tz] of [[-3.4, 0.8], [3.2, 1.2]] as const) {
        const tbl = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.08, 0.06, 14), toon(0xfbf9f4));
        tbl.position.set(ox + tx, 1.0, tz);
        const tleg = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.0, 8), toon(0x17150f));
        tleg.position.set(ox + tx, 0.5, tz); scene.add(tbl, tleg);
        const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.05, 0.12, 8), toon(0xfbf9f4));
        cup.position.set(ox + tx + 0.2, 1.1, tz); scene.add(cup);
      }
      const cfPlant = new THREE.Mesh(new THREE.SphereGeometry(0.5, 10, 10), toon(0x3f7d4e));
      cfPlant.position.set(ox + 6.4, 1.0, -4.6); scene.add(cfPlant);
    }

    /* ================= ZONE: boardroom interior ================= */
    {
      const [ox] = ZO.boardroom;
      const bFloor = new THREE.Mesh(new THREE.PlaneGeometry(14, 10), toon(0x3a3140));
      bFloor.rotation.x = -Math.PI / 2; bFloor.position.set(ox, 0, 0); bFloor.receiveShadow = true; scene.add(bFloor);
      const bCityMat = new THREE.MeshBasicMaterial({ map: skyDay2 });
      const bCity = new THREE.Mesh(new THREE.PlaneGeometry(13.6, 4.4), bCityMat);
      bCity.position.set(ox, 2.2, -4.9); scene.add(bCity);
      const table = box(6.2, 0.18, 2.2, 0x17150f); table.position.set(ox, 1.0, -0.6); table.castShadow = true; scene.add(table);
      const tbase = box(4.6, 0.9, 1.2, 0x2c2620); tbase.position.set(ox, 0.45, -0.6); scene.add(tbase);
      for (const cx of [-2.2, -0.75, 0.75, 2.2]) {
        for (const cz of [-1.9, 0.7]) {
          const ch = box(0.75, 1.15, 0.12, 0x413c4a); ch.position.set(ox + cx, 0.95, cz + (cz < 0 ? 0 : 0.35)); scene.add(ch);
        }
      }
      const brSign = nameSprite("BOARDROOM", 0xc9a44c, 1.9); brSign.position.set(ox, 3.5, -4.4); scene.add(brSign);
      const vision = nameSprite("THE VISION: SOUP?", 0xfbf9f4, 2.2); vision.position.set(ox - 4.6, 2.4, -4.4); scene.add(vision);
      (scene as THREE.Scene & { userData: Record<string, unknown> }).userData.bCityMat = bCityMat;
    }

    /* ================= ZONE: rooftop bar (always night-ish) ================= */
    {
      const [ox] = ZO.rooftop;
      const rFloor = new THREE.Mesh(new THREE.PlaneGeometry(16, 12), toon(0x2a2733));
      rFloor.rotation.x = -Math.PI / 2; rFloor.position.set(ox, 0, 0); rFloor.receiveShadow = true; scene.add(rFloor);
      const rCity = new THREE.Mesh(new THREE.PlaneGeometry(22, 6.4), new THREE.MeshBasicMaterial({ map: skyNight2 }));
      rCity.position.set(ox, 2.6, -6.4); scene.add(rCity);
      const parapet = box(15.6, 0.9, 0.3, 0x17150f); parapet.position.set(ox, 0.45, -4.4); scene.add(parapet);
      const bar = box(4.6, 1.05, 1.0, 0x241f2b); bar.position.set(ox - 2, 0.53, 1.6); scene.add(bar);
      const barTop = box(4.8, 0.08, 1.2, 0xc9a44c); barTop.position.set(ox - 2, 1.1, 1.6); scene.add(barTop);
      for (const sx of [-3.4, -2, -0.6]) {
        const st = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, 0.62, 10), toon(0x8b1f4b));
        st.position.set(ox + sx, 0.31, 2.7); scene.add(st);
      }
      // string lights
      for (let i = 0; i < 9; i++) {
        const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 6), new THREE.MeshBasicMaterial({ color: 0xf5d95a }));
        bulb.position.set(ox - 6 + i * 1.5, 2.9 + Math.sin(i * 1.1) * 0.25, -1.4); scene.add(bulb);
      }
      const rooftopLight = new THREE.PointLight(0xf5d95a, 20, 16); rooftopLight.position.set(ox, 3.2, 0); scene.add(rooftopLight);
      const ahSign = nameSprite("AFTER HOURS", 0x7b3fd1, 1.9); ahSign.position.set(ox + 5.2, 2.9, -2.6); scene.add(ahSign);
    }

    /* ================= ZONE: residence hallway ================= */
    {
      const [ox] = ZO.hallway;
      const hFloor = new THREE.Mesh(new THREE.PlaneGeometry(12, 8), toon(0x5c4a63));
      hFloor.rotation.x = -Math.PI / 2; hFloor.position.set(ox, 0, 0); hFloor.receiveShadow = true; scene.add(hFloor);
      const carpet = box(9.6, 0.02, 1.6, 0x8b1f4b); carpet.position.set(ox, 0.02, 0); scene.add(carpet);
      const hw1 = box(12, 3.6, 0.3, 0xcdbfa8); hw1.position.set(ox, 1.8, -2.2); scene.add(hw1);
      const hw2 = box(12, 3.6, 0.3, 0xcdbfa8); hw2.position.set(ox, 1.8, 2.2); scene.add(hw2);
      const hEnd = box(0.3, 3.6, 4.7, 0xcdbfa8); hEnd.position.set(ox + 6, 1.8, 0); scene.add(hEnd);
      for (const [i, dx] of [-3.4, 0, 3.4].entries()) {
        for (const side of [-1, 1]) {
          const door = box(1.15, 2.5, 0.12, 0x4a3b2f); door.position.set(ox + dx + (side < 0 ? 0 : 0.6), 1.25, 2.06 * side); scene.add(door);
          const num = nameSprite(`15${String.fromCharCode(65 + i * 2 + (side < 0 ? 0 : 1))}`, 0xc9a44c, 0.5);
          num.position.set(ox + dx + (side < 0 ? 0 : 0.6), 2.5, 1.8 * side); scene.add(num);
        }
      }
      // the ajar door with light leaking
      const ajar = box(1.15, 2.5, 0.12, 0x4a3b2f); ajar.position.set(ox + 4.9, 1.25, -1.95); ajar.rotation.y = 0.5; scene.add(ajar);
      const leak = new THREE.PointLight(0xf5d95a, 8, 5); leak.position.set(ox + 5.2, 1.2, -1.6); scene.add(leak);
      const hallLight = new THREE.PointLight(0xf2ead9, 10, 12); hallLight.position.set(ox, 3.0, 0); scene.add(hallLight);
      (scene as THREE.Scene & { userData: Record<string, unknown> }).userData.hallLight = hallLight;
      const resSign = nameSprite("THE RESIDENCES", 0x8b1f4b, 2.0); resSign.position.set(ox, 3.3, -2.0); scene.add(resSign);
    }

    /* ================= ZONE: Floor 16 tease ================= */
    {
      const [ox] = ZO.floor16;
      const gFloor = new THREE.Mesh(new THREE.PlaneGeometry(14, 10), toon(0x111018));
      gFloor.rotation.x = -Math.PI / 2; gFloor.position.set(ox, 0, 0); scene.add(gFloor);
      const backW = box(14, 4.4, 0.3, 0x17151f); backW.position.set(ox, 2.2, -4.4); scene.add(backW);
      // silhouettes: desks, a printing press shape, crates
      for (const [sx, sz, sw, sh] of [[-3, -2, 2.2, 1.0], [1.5, -2.6, 1.6, 1.2], [4.2, -1.4, 1.2, 2.0], [-0.5, -0.8, 3.0, 0.8]] as const) {
        const sil = box(sw, sh, 0.9, 0x0c0b12); sil.position.set(ox + sx, sh / 2, sz); scene.add(sil);
      }
      const lamp = new THREE.PointLight(0xc9a44c, 5, 7); lamp.position.set(ox - 3, 1.6, -2); scene.add(lamp);
      const lampGlow = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), new THREE.MeshBasicMaterial({ color: 0xf5d95a }));
      lampGlow.position.set(ox - 3, 1.5, -2); scene.add(lampGlow);
      const redDot = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), new THREE.MeshBasicMaterial({ color: 0xe8322b }));
      redDot.position.set(ox + 4.2, 2.6, -1.4); scene.add(redDot);
      (scene as THREE.Scene & { userData: Record<string, unknown> }).userData.redDot = redDot;
      const sixteen = nameSprite("FLOOR 16", 0xe8322b, 1.5); sixteen.position.set(ox, 3.2, -4.0); scene.add(sixteen);
    }

    /* ================= characters ================= */
    const rigs: Record<string, CharRig> = {};
    CAST.forEach((c, i) => {
      const [x, z] = deskSlots[i];
      const built = buildCharacter(c.id, c.dept);
      const deskPos = new THREE.Vector3(x, 0, z - 1.25);
      built.group.position.copy(deskPos);
      const tag = nameSprite(c.name.split(" ")[0], DEPT_HEX[c.dept]); tag.position.y = 2.85; built.group.add(tag);
      scene.add(built.group);
      rigs[c.id] = { group: built.group, headG: built.headG, mouth: built.mouth, smile: built.smile,
        eyes: built.eyes, arms: built.arms, mood: built.mood, ring: built.ring,
        deskPos, idlePhase: i * 1.3, still: c.id === "roxy",
        target: null, home: deskPos.clone(), walkT: 0, blinkAt: 2 + i * 0.7,
        idle: IDLE[c.id] ?? IDLE.evan };
    });

    /* ================= lights ================= */
    const hemi = new THREE.HemisphereLight(0xbfd8e2, 0x8a6f4a, 0.5);
    const amb = new THREE.AmbientLight(0xffffff, 0.62);
    const sun = new THREE.DirectionalLight(0xfff2d9, 1.55); sun.position.set(7, 11, 7);
    sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.left = -14; sun.shadow.camera.right = 14; sun.shadow.camera.top = 12; sun.shadow.camera.bottom = -10;
    const warm = new THREE.PointLight(0xc9a44c, 24, 30); warm.position.set(0, 4.6, 2);
    scene.add(hemi, amb, sun, warm);

    const applyNight = (n: boolean) => {
      scene.background = new THREE.Color(n ? 0x14121c : 0xf2ead9);
      scene.fog = new THREE.Fog(n ? 0x14121c : 0xf2ead9, 24, 70);
      amb.intensity = n ? 0.5 : 0.62;                       // readable night
      hemi.intensity = n ? 0.35 : 0.5;
      hemi.color.set(n ? 0x7b3fd1 : 0xbfd8e2);
      sun.intensity = n ? 0.22 : 1.55;
      warm.intensity = n ? 40 : 24;
      cityMat.map = n ? skyNight : skyDay; cityMat.needsUpdate = true;
      const bMat = (scene as THREE.Scene & { userData: Record<string, unknown> }).userData.bCityMat as THREE.MeshBasicMaterial;
      bMat.map = n ? skyNight2 : skyDay2; bMat.needsUpdate = true;
      neonLight.intensity = n ? 14 : 4;
    };

    /* ================= state + movement ================= */
    let curMode: CamMode = mode;
    let speaker: string | null = speakerId ?? null;
    let curPlacements: CastPlacement[] = placements;
    let doors = doorsOpen;
    let follow: string | undefined = followId;
    const camPos = new THREE.Vector3(...CAMS[mode].pos);
    const camLook = new THREE.Vector3(...CAMS[mode].look);
    camera.position.copy(camPos); camera.lookAt(camLook);

    const spotFor = (zone: ZoneId, slot: number): THREE.Vector3 => {
      const s = SPOTS[zone][slot % SPOTS[zone].length];
      return new THREE.Vector3(s[0], 0, s[1]);
    };
    const applyPlacements = () => {
      const placed = new Set<string>();
      const elevModes = curMode === "elevator" || curMode === "loop";
      curPlacements.forEach((p, i) => {
        const r = rigs[p.id]; if (!r) return;
        placed.add(p.id);
        if (elevModes) {
          const e = ELEV_SPOTS[i % 2];
          r.group.position.set(e[0], 0, e[1]); r.group.rotation.y = Math.PI / 2; r.target = null;
        } else {
          const dest = p.at ? new THREE.Vector3(p.at[0], 0, p.at[1]) : spotFor(p.zone, p.slot);
          const sameZone = p.zone === "office" && !p.at;   // explicit marks are director blocking: cut, don't walk
          if (sameZone && !reduced) { r.target = dest; }           // walk there
          else { r.group.position.copy(dest); r.target = null; }   // remote zones: cut (v0.6)
        }
      });
      for (const [id, r] of Object.entries(rigs)) {
        if (!placed.has(id)) {
          if (!reduced && r.group.position.distanceTo(r.home) > 0.5 && r.group.position.x < 20) r.target = r.home.clone();
          else if (r.group.position.x >= 20) { r.group.position.copy(r.home); r.target = null; }
        }
      }
    };
    applyPlacements();

    const wander = () => {
      // one random character strolls to a POI (office only); Roxy abstains
      const ids = Object.keys(rigs).filter((i) => i !== "roxy" && !curPlacements.some((p) => p.id === i));
      if (!ids.length || reduced) return;
      const id = ids[Math.floor(Math.random() * ids.length)];
      const r = rigs[id];
      if (r.group.position.x > 20) return;
      const going = r.target !== null;
      if (going) return;
      const away = r.group.position.distanceTo(r.home) > 0.6;
      if (away) { r.target = r.home.clone(); return; }
      const poi = POI[Math.floor(Math.random() * POI.length)];
      r.target = new THREE.Vector3(poi[0], 0, poi[1]);
    };

    api.current = {
      setMode: (m) => { curMode = m; applyPlacements(); },
      setSpeaker: (s) => { speaker = s; },
      setPlacements: (p) => { curPlacements = p; applyPlacements(); },
      setDoors: (o) => { doors = o; },
      setNight: applyNight,
      setFollow: (id) => { follow = id; },
      wander,
    };
    applyNight(night);

    const resize = () => {
      const w = el.clientWidth, h = el.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h; camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize); ro.observe(el);

    let visible = true, raf = 0;
    const io = new IntersectionObserver((es) => { visible = es[0]?.isIntersecting ?? true; }, { threshold: 0.02 });
    io.observe(el);
    const clock = new THREE.Clock();
    const tmpV = new THREE.Vector3();

    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!visible) return;
      const t = clock.getElapsedTime();
      const dt = Math.min(clock.getDelta() + 0.016, 0.05);

      for (const [id, r] of Object.entries(rigs)) {
        const talking = speaker === id;
        // walking
        if (r.target) {
          tmpV.copy(r.target).sub(r.group.position); tmpV.y = 0;
          const d = tmpV.length();
          if (d < 0.12) { r.target = null; r.walkT = 0; }
          else {
            tmpV.normalize();
            const speed = r.idle.speed;
            r.group.position.addScaledVector(tmpV, speed * dt);
            r.group.rotation.y = Math.atan2(tmpV.x, tmpV.z);
            r.walkT += dt * 9;
          }
        } else if (!talking && speaker && rigs[speaker] && rigs[speaker] !== r
                   && rigs[speaker].group.position.distanceTo(r.group.position) < 8) {
          // react: turn toward whoever is talking
          tmpV.copy(rigs[speaker].group.position).sub(r.group.position);
          const want = Math.atan2(tmpV.x, tmpV.z);
          r.group.rotation.y += (want - r.group.rotation.y) * 0.035;
        } else if (talking) {
          // face nearest other cast member in scene, gently
          const other = Object.entries(rigs).find(([oid, or]) => oid !== id && or.group.position.distanceTo(r.group.position) < 5);
          if (other) {
            tmpV.copy(other[1].group.position).sub(r.group.position);
            const want = Math.atan2(tmpV.x, tmpV.z);
            r.group.rotation.y += (want - r.group.rotation.y) * 0.06;
          }
        }
        const walking = r.target !== null;
        const bob = reduced ? 0 :
          walking ? Math.abs(Math.sin(r.walkT)) * 0.09
          : Math.sin(t * (r.still ? 0.5 : 1.7) + r.idlePhase) * r.idle.bob;
        r.group.position.y = bob;
        // body sway + head scanning: the per-character idle signature
        if (!reduced && !walking) {
          r.group.rotation.z = Math.sin(t * 0.9 + r.idlePhase) * r.idle.sway;
          if (!talking) r.headG.rotation.y = Math.sin(t * 0.42 + r.idlePhase) * r.idle.headTurn;
        }
        // arms: swing while walking, gesture while talking
        for (const [ai, arm] of r.arms.entries()) {
          const sx = ai === 0 ? -1 : 1;
          if (walking && !reduced) arm.rotation.x = Math.sin(r.walkT + ai * Math.PI) * 0.7;
          else if (talking && !reduced) { arm.rotation.x = Math.sin(t * 7 + ai) * (0.3 + r.idle.fidget) - 0.3; }
          else if (!reduced) { arm.rotation.x = Math.sin(t * 2.4 + ai * 2 + r.idlePhase) * r.idle.fidget * 0.35; }
          else arm.rotation.x = 0;
          arm.rotation.z = sx * 0.42;
        }
        // face
        if (talking && !reduced) {
          r.mouth.visible = true; r.smile.visible = false;
          r.mouth.scale.set(1.4, 0.5 + Math.abs(Math.sin(t * 12)) * 1.1, 0.7);
          r.headG.rotation.z = Math.sin(t * 6) * 0.045;
        } else {
          r.mouth.visible = false; r.smile.visible = true;
          r.headG.rotation.z += (0 - r.headG.rotation.z) * 0.12;
        }
        // blink
        if (t > r.blinkAt) { r.eyes.scale.y = 0.12; if (t > r.blinkAt + 0.12) { r.eyes.scale.y = 1; r.blinkAt = t + r.idle.blinkGap + Math.random() * 1.5; } }
        r.ring.visible = talking;
        if (talking) r.ring.rotation.z = t * 1.6;
        r.mood.position.y = 2.5 + (reduced ? 0 : Math.sin(t * 2 + r.idlePhase) * 0.06);
      }

      // doors
      const target = doors ? 1.62 : 0;
      if (!reduced) {
        doorL.position.z += ((-carDepth / 4 - target) - doorL.position.z) * 0.08;
        doorR.position.z += ((carDepth / 4 + target) - doorR.position.z) * 0.08;
      } else {
        doorL.position.z = -carDepth / 4 - target;
        doorR.position.z = carDepth / 4 + target;
      }
      // ambient props
      for (const [fi, f] of fish.entries()) {
        const sp2 = 0.5 + fi * 0.13, ph = f.userData.fp as number;
        f.position.x = 4.6 + Math.sin(t * sp2 + ph) * 1.35;
        f.position.y = (f.userData.fy as number) + Math.sin(t * 1.3 + ph) * 0.08;
        f.rotation.y = Math.cos(t * sp2 + ph) > 0 ? 0 : Math.PI;
      }
      disco.rotation.y = t * 0.6;
      pongBall.position.set(8.4 + Math.sin(t * 2.2) * 1.0, 1.0 + Math.abs(Math.sin(t * 4.4)) * 0.5, 5.4 - Math.sin(t * 2.2) * 0.25);
      flame.scale.setScalar(reduced ? 1 : 1 + Math.sin(t * 9) * 0.25);
      const ft = t % 9;
      (f16light.material as THREE.MeshBasicMaterial).color.set(ft > 8.55 && ft < 8.8 ? 0xc9a44c : 0x2a2416);
      const rd = (scene as THREE.Scene & { userData: Record<string, unknown> }).userData.redDot as THREE.Mesh;
      (rd.material as THREE.MeshBasicMaterial).color.set(Math.sin(t * 2.4) > 0.6 ? 0xe8322b : 0x3a0f0d);
      const hl = (scene as THREE.Scene & { userData: Record<string, unknown> }).userData.hallLight as THREE.PointLight;
      hl.intensity = (t % 6) > 5.6 ? 3 : 10;   // hallway flicker

      // camera
      let tp: THREE.Vector3, tl: THREE.Vector3;
      if (curMode === "follow" && follow && rigs[follow]) {
        const fp = rigs[follow].group.position;
        tp = tmpV.clone().set(fp.x + 2.6, 2.4, fp.z + 4.2);
        tl = fp.clone().setY(1.3);
      } else if (curMode === "clippan") {
        const a = t * 0.06;
        tp = new THREE.Vector3(Math.sin(a) * 7.5, 4.2 + Math.sin(t * 0.19) * 0.4, Math.cos(a) * 6.5 + 4.2);
        tl = new THREE.Vector3(0, 1.25, -1.4);
      } else {
        const c = CAMS[curMode];
        tp = new THREE.Vector3(...c.pos); tl = new THREE.Vector3(...c.look);
        if (curMode === "wide" && !reduced) { tp.x += Math.sin(t * 0.18) * 0.5; tp.y += Math.sin(t * 0.14) * 0.2; }
      }
      // zones are far-apart sets: CUT between them, glide within one
      if (camPos.distanceTo(tp) > 20) { camPos.copy(tp); camLook.copy(tl); }
      else { camPos.lerp(tp, reduced ? 1 : 0.045); camLook.lerp(tl, reduced ? 1 : 0.055); }
      camera.position.copy(camPos); camera.lookAt(camLook);

      renderer.render(scene, camera);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf); ro.disconnect(); io.disconnect();
      renderer.dispose(); el.removeChild(renderer.domElement);
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.geometry) m.geometry.dispose();
        const mat = m.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(mat)) mat.forEach((x) => x.dispose()); else mat?.dispose();
      });
      api.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { api.current?.setMode(mode); }, [mode]);
  useEffect(() => { api.current?.setSpeaker(speakerId ?? null); }, [speakerId]);
  useEffect(() => { api.current?.setPlacements(placements); }, [JSON.stringify(placements)]);
  useEffect(() => { api.current?.setDoors(doorsOpen); }, [doorsOpen]);
  useEffect(() => { api.current?.setNight(night); }, [night]);
  useEffect(() => { api.current?.setFollow(followId); }, [followId]);
  useEffect(() => {
    if (!ambient) return;
    const id = setInterval(() => api.current?.wander(), 15000);
    const kick = setTimeout(() => api.current?.wander(), 3500);
    return () => { clearInterval(id); clearTimeout(kick); };
  }, [ambient]);

  return <div ref={mount} className={className} style={{ width: "100%", height: "100%" }} />;
}

/** Map a scene package's location string to a camera mode + zone. */
export function locationToMode(loc: string): { cam: CamMode; zone: ZoneId } {
  const L = loc.toUpperCase();
  if (L.includes("ELEVATOR")) return { cam: "elevator", zone: "office" };
  if (L.includes("BOARDROOM")) return { cam: "boardroom", zone: "boardroom" };
  if (L.includes("BREAK")) return { cam: "breakroom", zone: "office" };
  if (L.includes("MERCH")) return { cam: "merch", zone: "office" };
  if (L.includes("HR") || L.includes("CORRIDOR") || L.includes("HALLWAY")) return { cam: "hallway", zone: "hallway" };
  if (L.includes("ROOFTOP") || L.includes("BAR")) return { cam: "rooftop", zone: "rooftop" };
  if (L.includes("CAFE") || L.includes("LOBBY")) return { cam: "cafe", zone: "cafe" };
  return { cam: "desk", zone: "office" };
}
