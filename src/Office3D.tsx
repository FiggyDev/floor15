/* FLOOR 15 — the 3D office, cartoon grade. Plain three.js, procedural, zero assets.
   Toon shading (3-band), black outlines, characters with faces/hair/signature props,
   decorated set (chairs, plants, rug, pendant lights, wall art, water cooler, and the
   coffee-machine memorial). Canvas = world only; broadcast UI stays DOM. WebGL failure
   -> onFail() -> caller renders the v0.4 2D stage. */
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { CAST } from "./show";

export type CamMode = "wide" | "desk" | "boardroom" | "legal" | "elevator" | "loop";

const DEPT_HEX: Record<string, number> = {
  trading: 0xd8362a, marketing: 0xe23e8e, legal: 0x24457a, hr: 0x6b7436,
  merch: 0xe07b1f, sec: 0x5c6a77, ops: 0x4a4550, intern: 0x2fa36b,
};
const SKIN_HEX: Record<string, number> = {
  barry: 0xe8b88a, linda: 0x8d5a3b, max: 0xf0c49b, trixie: 0xc68642,
  roxy: 0x6b4226, manny: 0xd9a066, evan: 0xf5d0a9,
};
const MOOD_HEX: Record<string, number> = {
  barry: 0x2fa36b, linda: 0xe07b1f, max: 0xd8362a, trixie: 0xe23e8e,
  roxy: 0x8a95a1, manny: 0xe07b1f, evan: 0x2fa36b,
};
const HAIR_HEX: Record<string, number> = {
  barry: 0xc9ccd1, linda: 0x241a10, max: 0x6b4a2f, trixie: 0x1e1520,
  roxy: 0x14100c, manny: 0x3a2a1a, evan: 0x8a5a2b,
};

const CAMS: Record<CamMode, { pos: [number, number, number]; look: [number, number, number] }> = {
  wide:      { pos: [0, 7.4, 13.6],   look: [0, 0.9, -0.5] },
  desk:      { pos: [-1.2, 2.3, 5.0], look: [0.2, 1.35, -2] },
  boardroom: { pos: [5.8, 2.4, 1.8],  look: [9.4, 1.5, -6.4] },
  legal:     { pos: [7.0, 2.2, 6.6],  look: [10.4, 1.2, 3.4] },
  elevator:  { pos: [-9.9, 1.75, 0.05], look: [-12.4, 1.28, 0] },
  loop:      { pos: [-9.98, 1.72, 0.08], look: [-12.4, 1.26, 0] },
};

interface CharRig { group: THREE.Group; headG: THREE.Group; mouth: THREE.Mesh; mood: THREE.Mesh;
  ring: THREE.Mesh; deskPos: THREE.Vector3; idlePhase: number; still: boolean; }

export interface Office3DProps {
  mode: CamMode; speakerId?: string | null; carCast?: string[]; doorsOpen?: boolean;
  night?: boolean; onFail?: () => void; className?: string;
}

let _grad: THREE.DataTexture | null = null;
function grad(): THREE.DataTexture {
  if (_grad) return _grad;
  const d = new Uint8Array([95, 95, 95, 255, 178, 178, 178, 255, 255, 255, 255, 255]);
  _grad = new THREE.DataTexture(d, 3, 1, THREE.RGBAFormat);
  _grad.needsUpdate = true; _grad.minFilter = _grad.magFilter = THREE.NearestFilter;
  return _grad;
}
const toon = (c: number) => new THREE.MeshToonMaterial({ color: c, gradientMap: grad() });
const OUTLINE_M = new THREE.MeshBasicMaterial({ color: 0x17150f, side: THREE.BackSide });

function nameSprite(text: string, color: number, w = 1.5): THREE.Sprite {
  const c = document.createElement("canvas");
  c.width = 256; c.height = 60;
  const g = c.getContext("2d")!;
  g.fillStyle = "#17150F";
  (g as CanvasRenderingContext2D & { roundRect?: unknown }).roundRect
    ? (g.beginPath(), (g as CanvasRenderingContext2D).roundRect(0, 0, 256, 60, 14), g.fill())
    : g.fillRect(0, 0, 256, 60);
  g.fillStyle = "#" + color.toString(16).padStart(6, "0"); g.fillRect(0, 0, 12, 60);
  g.fillStyle = "#F1EDE2"; g.font = "700 30px Bricolage Grotesque, Arial Narrow, sans-serif";
  g.textBaseline = "middle"; g.fillText(text.toUpperCase(), 26, 32);
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c) }));
  sp.scale.set(w, 0.35, 1);
  return sp;
}

/* mesh + its cartoon outline as one group */
function outlined(geo: THREE.BufferGeometry, mat: THREE.Material, s = 1.06): THREE.Group {
  const g = new THREE.Group();
  const line = new THREE.Mesh(geo, OUTLINE_M); line.scale.setScalar(s);
  const m = new THREE.Mesh(geo, mat); m.castShadow = true;
  g.add(line, m);
  return g;
}

function buildCharacter(id: string, dept: string) {
  const g = new THREE.Group();
  const skin = SKIN_HEX[id], suit = DEPT_HEX[dept], hairC = HAIR_HEX[id];

  /* body — squat, big-head cartoon proportions */
  const body = outlined(new THREE.CapsuleGeometry(0.37, 0.42, 6, 16), toon(suit), 1.045);
  body.position.y = 0.72; g.add(body);
  // arms
  for (const sx of [-1, 1]) {
    const arm = outlined(new THREE.CapsuleGeometry(0.09, 0.34, 4, 8), toon(suit), 1.12);
    arm.position.set(0.42 * sx, 0.78, 0.02); arm.rotation.z = sx * 0.5;
    g.add(arm);
  }

  /* head group (bobs + talks as a unit) */
  const headG = new THREE.Group(); headG.position.y = 1.62;
  const head = outlined(new THREE.SphereGeometry(0.42, 22, 18), toon(skin), 1.045);
  headG.add(head);
  // eyes + pupils (front = +z)
  for (const sx of [-1, 1]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.085, 10, 10), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    eye.position.set(0.15 * sx, 0.05, 0.36);
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.038, 8, 8), new THREE.MeshBasicMaterial({ color: 0x17150f }));
    pupil.position.set(0.15 * sx, 0.05, 0.435);
    headG.add(eye, pupil);
    const brow = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.035, 0.03), new THREE.MeshBasicMaterial({ color: 0x17150f }));
    const tilt: Record<string, number> = { barry: -0.15, linda: 0.3, max: -0.4, trixie: -0.1, roxy: 0.12, manny: -0.25, evan: 0.28 };
    brow.position.set(0.15 * sx, 0.2, 0.4); brow.rotation.z = (tilt[id] ?? 0) * sx;
    headG.add(brow);
  }
  // mouth (talking scales it)
  const mouth = new THREE.Mesh(new THREE.SphereGeometry(0.075, 10, 8), new THREE.MeshBasicMaterial({ color: 0x40201a }));
  mouth.position.set(0, -0.16, 0.38); mouth.scale.set(1.4, 0.5, 0.6);
  headG.add(mouth);

  /* hair — per character silhouette */
  const H = toon(hairC);
  if (id === "barry") {          // silver executive sweep
    const swoop = new THREE.Mesh(new THREE.SphereGeometry(0.43, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.45), H);
    swoop.position.y = 0.06; swoop.scale.set(1.04, 1.05, 1.04); headG.add(swoop);
  } else if (id === "linda") {   // bun + glasses pushed up
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.43, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.5), H);
    cap.position.y = 0.04; cap.scale.setScalar(1.04); headG.add(cap);
    const bun = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 10), H); bun.position.set(0, 0.42, -0.18); headG.add(bun);
    for (const sx of [-1, 1]) {
      const lens = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.018, 8, 18), new THREE.MeshBasicMaterial({ color: 0xc9a44c }));
      lens.position.set(0.13 * sx, 0.33, 0.26); lens.rotation.x = -1.1; headG.add(lens);
    }
  } else if (id === "max") {     // agitated crop
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.43, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.4), H);
    cap.position.y = 0.07; cap.scale.set(1.05, 1.1, 1.05); headG.add(cap);
    // the tie, mid-surrender
    const tie = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.34, 0.04), toon(0xc9a44c));
    tie.position.set(0.09, -0.75, 0.34); tie.rotation.z = 0.28; headG.add(tie);
  } else if (id === "trixie") {  // high pony
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.43, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.5), H);
    cap.position.y = 0.05; cap.scale.setScalar(1.04); headG.add(cap);
    const pony = new THREE.Mesh(new THREE.CapsuleGeometry(0.09, 0.4, 4, 8), H);
    pony.position.set(0.16, 0.42, -0.22); pony.rotation.z = -0.7; headG.add(pony);
  } else if (id === "roxy") {    // close crop + earpiece
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.43, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.46), H);
    cap.position.y = 0.05; cap.scale.setScalar(1.03); headG.add(cap);
    const ear = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), new THREE.MeshBasicMaterial({ color: 0x17150f }));
    ear.position.set(0.4, 0, 0.05); headG.add(ear);
  } else if (id === "manny") {   // curls + tape scarf
    for (const [px, py] of [[-0.16, 0.3], [0, 0.38], [0.16, 0.3]] as const) {
      const curl = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 10), H);
      curl.position.set(px, py, 0.02); headG.add(curl);
    }
    const scarf = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.07, 8, 20), toon(0xf5d95a));
    scarf.position.y = -0.48; scarf.rotation.x = Math.PI / 2.2; headG.add(scarf);
  } else if (id === "evan") {    // eager fluff + lanyard
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.43, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.38), H);
    cap.position.y = 0.1; cap.scale.set(1.02, 1.16, 1.02); headG.add(cap);
    const badge = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.12, 0.02), new THREE.MeshBasicMaterial({ color: 0xfbf9f4 }));
    badge.position.set(0, -0.72, 0.4); headG.add(badge);
  }
  g.add(headG);

  /* status furniture */
  const mood = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), new THREE.MeshBasicMaterial({ color: MOOD_HEX[id] }));
  mood.position.y = 2.42; g.add(mood);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.04, 8, 30), new THREE.MeshBasicMaterial({ color: 0xc9a44c }));
  ring.rotation.x = -Math.PI / 2; ring.position.y = 0.045; ring.visible = false; g.add(ring);

  return { group: g, headG, mouth, mood, ring };
}

export function Office3D({ mode, speakerId, carCast = [], doorsOpen = false, night = false, onFail, className }: Office3DProps) {
  const mount = useRef<HTMLDivElement>(null);
  const api = useRef<{ setMode: (m: CamMode) => void; setSpeaker: (s: string | null) => void;
    setCar: (c: string[]) => void; setDoors: (o: boolean) => void; setNight: (n: boolean) => void } | null>(null);

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
    const camera = new THREE.PerspectiveCamera(44, 16 / 9, 0.1, 60);
    const box = (w: number, h: number, d: number, c: number) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), toon(c));

    /* ---- room shell ---- */
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(26, 16), toon(0xd6cfc0));
    floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
    const rug = new THREE.Mesh(new THREE.CircleGeometry(6.4, 40), toon(0x2c2620));
    rug.rotation.x = -Math.PI / 2; rug.position.set(0, 0.01, -1); rug.receiveShadow = true; scene.add(rug);
    const rug2 = new THREE.Mesh(new THREE.CircleGeometry(5.2, 40), toon(0x4a3b2f));
    rug2.rotation.x = -Math.PI / 2; rug2.position.set(0, 0.02, -1); rug2.receiveShadow = true; scene.add(rug2);
    // elite high-rise: floor-to-ceiling glass with a procedural skyline behind it
    const skyline = (n: boolean) => {
      const c = document.createElement("canvas"); c.width = 1024; c.height = 300;
      const g = c.getContext("2d")!;
      const grd = g.createLinearGradient(0, 0, 0, 300);
      if (n) { grd.addColorStop(0, "#0b1024"); grd.addColorStop(1, "#1a2140"); }
      else { grd.addColorStop(0, "#bcd7e8"); grd.addColorStop(1, "#e8eef2"); }
      g.fillStyle = grd; g.fillRect(0, 0, 1024, 300);
      let x = 0; let seed = 7;
      const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
      while (x < 1024) {
        const w = 34 + rnd() * 60, h = 90 + rnd() * 170;
        g.fillStyle = n ? "#10141f" : "#9fb0c2";
        g.fillRect(x, 300 - h, w, h);
        if (n) { g.fillStyle = "#f5d95a";
          for (let wy = 300 - h + 8; wy < 288; wy += 14) for (let wx = x + 5; wx < x + w - 6; wx += 12)
            if (rnd() > 0.6) g.fillRect(wx, wy, 4, 6);
        }
        x += w + 6 + rnd() * 10;
      }
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
    };
    const skyDay = skyline(false), skyNight = skyline(true);
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

    /* window + the underside of Floor 16 */
    const f16 = box(19.6, 0.42, 0.16, 0x17150f); f16.position.set(-3.3, 4.85, -7.8); scene.add(f16);
    const f16light = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.18, 0.16), new THREE.MeshBasicMaterial({ color: 0x2a2416 }));
    f16light.position.set(-5.4, 4.85, -7.72); scene.add(f16light);

    /* wall art + company sign */
    for (const [x, c] of [[6.9, 0xd8362a], [8.1, 0xe23e8e], [12.2, 0xe07b1f]] as const) {
      const frame = box(1.15, 1.5, 0.08, 0x4a3b2f); frame.position.set(x, 3.1, -7.82);
      const art = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 1.24), new THREE.MeshBasicMaterial({ color: c }));
      art.position.set(x, 3.1, -7.76); scene.add(frame, art);
    }
    const sign = nameSprite("HOLDCO GLOBAL", 0xc9a44c, 3.2); sign.position.set(9.6, 4.55, -7.6); scene.add(sign);

    /* boardroom door */
    const bdFrame = box(2.6, 3.4, 0.25, 0x4a3b2f); bdFrame.position.set(9.4, 1.7, -7.8); scene.add(bdFrame);
    const bdDoor = box(2.2, 3.05, 0.15, 0x24457a); bdDoor.position.set(9.4, 1.55, -7.66); scene.add(bdDoor);
    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), new THREE.MeshBasicMaterial({ color: 0xc9a44c }));
    knob.position.set(8.7, 1.5, -7.55); scene.add(knob);
    const bdSign = nameSprite("BOARDROOM", 0xc9a44c, 1.9); bdSign.position.set(9.4, 3.75, -7.5); scene.add(bdSign);

    /* legal office: glass corner + desk + lamp */
    const legalGlass = new THREE.Mesh(new THREE.BoxGeometry(4.2, 2.9, 3.6),
      new THREE.MeshLambertMaterial({ color: 0x9db4c9, transparent: true, opacity: 0.22 }));
    legalGlass.position.set(10.4, 1.45, 3.4); scene.add(legalGlass);
    const ldesk = box(2.0, 0.16, 0.95, 0x4a3b2f); ldesk.position.set(10.4, 0.86, 3.4); ldesk.castShadow = true; scene.add(ldesk);
    for (const [dx, dz] of [[-0.85, -0.35], [0.85, -0.35], [-0.85, 0.35], [0.85, 0.35]] as const) {
      const leg = box(0.08, 0.86, 0.08, 0x2a2118); leg.position.set(10.4 + dx, 0.43, 3.4 + dz); scene.add(leg);
    }
    const lamp = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.22, 12), toon(0x24457a));
    lamp.position.set(9.8, 1.06, 3.2); scene.add(lamp);
    const legalSign = nameSprite("LEGAL", 0x24457a, 1.2); legalSign.position.set(10.4, 3.3, 3.4); scene.add(legalSign);

    /* merch corner + the coffee-machine memorial */
    const mb = 0xb08d5e;
    const boxes = [box(1.2, 1.2, 1.2, mb), box(1.0, 1.0, 1.0, mb), box(0.9, 0.9, 0.9, 0xc49e6c)];
    boxes[0].position.set(-10.6, 0.6, 5.6); boxes[1].position.set(-9.3, 0.5, 6.1);
    boxes[2].position.set(-10.2, 1.65, 5.7); boxes[2].rotation.y = 0.4;
    boxes.forEach((b) => { b.castShadow = true; scene.add(b); });
    const merchSign = nameSprite("MERCH", 0xe07b1f, 1.3); merchSign.position.set(-10, 2.9, 5.8); scene.add(merchSign);
    // the memorial: small table, the deceased's successor's predecessor, a candle
    const memTable = box(0.9, 0.7, 0.6, 0x4a3b2f); memTable.position.set(-7.6, 0.35, 6.4); scene.add(memTable);
    const machine = box(0.4, 0.5, 0.35, 0x55606b); machine.position.set(-7.7, 0.95, 6.4); machine.castShadow = true; scene.add(machine);
    const candle = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.16, 8), new THREE.MeshBasicMaterial({ color: 0xf5e9b8 }));
    candle.position.set(-7.3, 0.78, 6.55); scene.add(candle);
    const flame = new THREE.Mesh(new THREE.SphereGeometry(0.035, 6, 6), new THREE.MeshBasicMaterial({ color: 0xffb347 }));
    flame.position.set(-7.3, 0.9, 6.55); scene.add(flame);

    /* water cooler + plants */
    const cooler = box(0.5, 1.1, 0.5, 0xdfd5bc); cooler.position.set(6.6, 0.55, 6.6); cooler.castShadow = true; scene.add(cooler);
    const jug = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.24, 0.45, 12),
      new THREE.MeshLambertMaterial({ color: 0x9db4c9, transparent: true, opacity: 0.7 }));
    jug.position.set(6.6, 1.35, 6.6); scene.add(jug);
    for (const [px, pz] of [[-12, -6.4], [12, -6.4], [2.2, 6.8]] as const) {
      const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.22, 0.5, 10), toon(0xb0503c));
      pot.position.set(px, 0.25, pz); pot.castShadow = true;
      const bush = new THREE.Mesh(new THREE.SphereGeometry(0.42, 10, 10), toon(0x3f7d4e)); bush.position.set(px, 0.85, pz);
      const bush2 = new THREE.Mesh(new THREE.SphereGeometry(0.3, 10, 10), toon(0x2fa36b)); bush2.position.set(px + 0.18, 1.1, pz - 0.08);
      scene.add(pot, bush, bush2);
    }

    /* frat-dev amenities, elite edition */
    // mini hoop on the right wall
    const backboard = box(0.9, 0.65, 0.06, 0xfbf9f4); backboard.position.set(12.8, 3.0, 2.2); scene.add(backboard);
    const hoop = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.03, 8, 20), new THREE.MeshBasicMaterial({ color: 0xe07b1f }));
    hoop.position.set(12.55, 2.75, 2.2); hoop.rotation.x = Math.PI / 2; scene.add(hoop);
    const bball = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 10), toon(0xe07b1f)); bball.position.set(12.2, 0.12, 2.6); scene.add(bball);
    // putting green (Barry's) — cup, flag, abandoned confidence
    const green = new THREE.Mesh(new THREE.CircleGeometry(1.5, 30), toon(0x2f7d5a));
    green.rotation.x = -Math.PI / 2; green.position.set(-8.6, 0.02, -5.6); green.receiveShadow = true; scene.add(green);
    const cup = new THREE.Mesh(new THREE.CircleGeometry(0.09, 12), new THREE.MeshBasicMaterial({ color: 0x17150f }));
    cup.rotation.x = -Math.PI / 2; cup.position.set(-9.1, 0.03, -5.9); scene.add(cup);
    const pole = box(0.03, 1.0, 0.03, 0xfbf9f4); pole.position.set(-9.1, 0.5, -5.9); scene.add(pole);
    const flag = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.2), new THREE.MeshBasicMaterial({ color: 0xd8362a, side: THREE.DoubleSide }));
    flag.position.set(-8.93, 0.86, -5.9); scene.add(flag);
    // ping-pong table
    const pp = box(2.5, 0.12, 1.4, 0x2f7d5a); pp.position.set(8.4, 0.85, 5.4); pp.rotation.y = -0.25; pp.castShadow = true; scene.add(pp);
    const ppLine = box(2.5, 0.13, 0.05, 0xfbf9f4); ppLine.position.set(8.4, 0.855, 5.4); ppLine.rotation.y = -0.25; scene.add(ppLine);
    const net = box(0.05, 0.16, 1.4, 0xfbf9f4); net.position.set(8.4, 0.98, 5.4); net.rotation.y = -0.25; scene.add(net);
    for (const [dx, dz] of [[-1.05, -0.5], [1.05, -0.5], [-1.05, 0.5], [1.05, 0.5]] as const) {
      const l = box(0.08, 0.85, 0.08, 0x17150f); l.position.set(8.4 + dx * Math.cos(0.25) + dz * Math.sin(0.25), 0.42, 5.4 + dz * Math.cos(0.25) - dx * Math.sin(0.25)); scene.add(l);
    }
    // energy cans + pizza
    for (const [cx, cz, cc] of [[1.1, 0.6, 0x2fa36b], [1.3, 0.75, 0x24457a], [0.95, 0.85, 0xe23e8e]] as const) {
      const can = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.18, 10), toon(cc));
      can.position.set(2 + cx, 1.02, 0.8 + cz - 0.6); scene.add(can);
    }
    const pizza = box(0.85, 0.06, 0.85, 0xf0e3c8); pizza.position.set(-1.2, 0.96, 1.5); pizza.rotation.y = 0.3; scene.add(pizza);
    // bean bag + skateboard
    const bean = new THREE.Mesh(new THREE.SphereGeometry(0.62, 14, 12), toon(0xe23e8e));
    bean.scale.set(1, 0.52, 1); bean.position.set(-6.4, 0.3, 6.2); bean.castShadow = true; scene.add(bean);
    const deck = box(0.85, 0.05, 0.26, 0x24457a); deck.position.set(4.9, 0.12, 6.9); deck.rotation.y = 0.7; scene.add(deck);
    for (const wx of [-0.28, 0.28]) {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.3, 8), toon(0xf5d95a));
      wheel.rotation.x = Math.PI / 2; wheel.rotation.z = 0.7;
      wheel.position.set(4.9 + wx * Math.cos(0.7), 0.06, 6.9 - wx * Math.sin(0.7)); scene.add(wheel);
    }
    // neon sign + glow
    const neonC = document.createElement("canvas"); neonC.width = 512; neonC.height = 128;
    const ng = neonC.getContext("2d")!;
    ng.font = "italic 700 74px Bricolage Grotesque, Arial, sans-serif";
    ng.textAlign = "center"; ng.textBaseline = "middle";
    ng.shadowColor = "#ff4fd8"; ng.shadowBlur = 26; ng.fillStyle = "#ffd7f4";
    ng.fillText("SHIP IT.", 256, 66); ng.fillText("SHIP IT.", 256, 66);
    const neon = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(neonC), depthTest: false }));
    neon.scale.set(2.6, 0.65, 1); neon.position.set(12.6, 3.4, 5.2); scene.add(neon);
    const neonLight = new THREE.PointLight(0xff4fd8, 4, 8); neonLight.position.set(12.2, 3.4, 5.2); scene.add(neonLight);
    // wall TV: the chart, going down, as is tradition
    const tvC = document.createElement("canvas"); tvC.width = 256; tvC.height = 144;
    const tg = tvC.getContext("2d")!;
    tg.fillStyle = "#17150F"; tg.fillRect(0, 0, 256, 144);
    tg.strokeStyle = "#2a2620"; for (let gy = 20; gy < 144; gy += 24) { tg.beginPath(); tg.moveTo(0, gy); tg.lineTo(256, gy); tg.stroke(); }
    tg.strokeStyle = "#E8322B"; tg.lineWidth = 4; tg.beginPath(); tg.moveTo(10, 30);
    for (const [px, py] of [[50, 44], [85, 38], [120, 78], [160, 70], [200, 112], [246, 128]] as const) tg.lineTo(px, py);
    tg.stroke();
    tg.fillStyle = "#C9A44C"; tg.font = "700 20px Space Mono, monospace"; tg.fillText("Q3", 214, 24);
    const tvFrame = box(2.1, 1.25, 0.08, 0x17150f); tvFrame.position.set(12.8, 3.1, -2.6); tvFrame.rotation.y = -Math.PI / 2; scene.add(tvFrame);
    const tv = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 1.06), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(tvC) }));
    tv.position.set(12.74, 3.1, -2.6); tv.rotation.y = -Math.PI / 2; scene.add(tv);

    // wolf-of-wall-street-adjacent, HR-reviewed edition
    // beer-pong pyramid on the ping-pong table
    const cupG = new THREE.CylinderGeometry(0.055, 0.04, 0.14, 10);
    const cupM = toon(0xd8362a);
    for (const [ox, oz] of [[0, 0], [0.13, 0], [-0.13, 0], [0.065, 0.11], [-0.065, 0.11], [0, 0.22]] as const) {
      const cup = new THREE.Mesh(cupG, cupM);
      cup.position.set(9.3 + ox, 0.98, 5.15 + oz); scene.add(cup);
    }
    // champagne + flutes on the trading row
    const bottle = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.075, 0.34, 10), toon(0x1f4a2e));
    bottle.position.set(2.6, 1.1, -3.3); scene.add(bottle);
    const foil = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.04, 0.14, 8), toon(0xc9a44c));
    foil.position.set(2.6, 1.33, -3.3); scene.add(foil);
    for (const fx of [2.85, 3.0]) {
      const flute = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.018, 0.16, 8),
        new THREE.MeshLambertMaterial({ color: 0xf5e9b8, transparent: true, opacity: 0.75 }));
      flute.position.set(fx, 1.03, -3.15); scene.add(flute);
    }
    // VIP stanchions + velvet rope at the elevator (why. nobody knows. Barry knows.)
    for (const sz of [-1.5, 1.5]) {
      const postB = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 0.06, 10), toon(0xb08d3e));
      postB.position.set(-10.2, 0.03, sz);
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.0, 8), toon(0xb08d3e));
      post.position.set(-10.2, 0.53, sz);
      const knobT = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), toon(0xc9a44c));
      knobT.position.set(-10.2, 1.06, sz);
      scene.add(postB, post, knobT);
    }
    const ropeCurve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-10.2, 1.0, -1.5), new THREE.Vector3(-10.2, 0.72, 0), new THREE.Vector3(-10.2, 1.0, 1.5));
    const rope = new THREE.Mesh(new THREE.TubeGeometry(ropeCurve, 16, 0.035, 6), toon(0x8b1f4b));
    scene.add(rope);
    // disco ball over the rec zone (the after-hours confession)
    const discoCord = box(0.02, 0.9, 0.02, 0x17150f); discoCord.position.set(9.4, 4.75, 4.6); scene.add(discoCord);
    const disco = new THREE.Mesh(new THREE.SphereGeometry(0.4, 12, 10),
      new THREE.MeshStandardMaterial({ color: 0xd8d8e2, metalness: 0.95, roughness: 0.15, flatShading: true }));
    disco.position.set(9.4, 4.0, 4.6); scene.add(disco);
    // cash-confetti near trading (the quarter, distributed)
    let cseed = 13;
    const crnd = () => { cseed = (cseed * 16807) % 2147483647; return cseed / 2147483647; };
    const cashG = new THREE.PlaneGeometry(0.16, 0.08);
    const cashM = toon(0x2fa36b);
    for (let ci = 0; ci < 22; ci++) {
      const bill = new THREE.Mesh(cashG, cashM);
      bill.rotation.x = -Math.PI / 2; bill.rotation.z = crnd() * Math.PI;
      bill.position.set(0.6 + crnd() * 4.4, 0.015, -2.2 + crnd() * 2.6);
      scene.add(bill);
    }
    // whiteboard: the roadmap, as reviewed by Legal
    const wbC = document.createElement("canvas"); wbC.width = 300; wbC.height = 200;
    const wg = wbC.getContext("2d")!;
    wg.fillStyle = "#FBF9F4"; wg.fillRect(0, 0, 300, 200);
    wg.fillStyle = "#17150F"; wg.font = "italic 700 30px Bricolage Grotesque, Arial";
    wg.fillText("Q3 PLAN:", 18, 44);
    wg.fillText("TO THE", 18, 92); wg.fillRect(140, 68, 130, 32);
    wg.fillStyle = "#C9A44C"; wg.font = "700 13px Space Mono, monospace"; wg.fillText("REDACTED", 156, 89);
    wg.fillStyle = "#17150F"; wg.font = "italic 700 26px Bricolage Grotesque, Arial";
    wg.fillText("SHIP FRIDAY??", 18, 140);
    wg.fillStyle = "#D8362A"; wg.font = "700 18px Bricolage Grotesque, Arial"; wg.fillText("NO. — L.", 200, 176);
    const wbFrame = box(2.3, 1.6, 0.07, 0xb08d3e); wbFrame.position.set(-12.85, 2.6, 3.4); wbFrame.rotation.y = Math.PI / 2; scene.add(wbFrame);
    const wb = new THREE.Mesh(new THREE.PlaneGeometry(2.1, 1.42), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(wbC) }));
    wb.position.set(-12.8, 2.6, 3.4); wb.rotation.y = Math.PI / 2; scene.add(wb);

    // the giant fish tank (a room divider, a flex, a liability Roxy has assessed)
    const tankBase = box(3.6, 0.5, 0.9, 0x17150f); tankBase.position.set(4.6, 0.25, 3.2); tankBase.castShadow = true; scene.add(tankBase);
    const tank = new THREE.Mesh(new THREE.BoxGeometry(3.4, 1.5, 0.7),
      new THREE.MeshLambertMaterial({ color: 0x3e7fa8, transparent: true, opacity: 0.4 }));
    tank.position.set(4.6, 1.25, 3.2); scene.add(tank);
    const tankLid = box(3.6, 0.08, 0.9, 0xb08d3e); tankLid.position.set(4.6, 2.05, 3.2); scene.add(tankLid);
    const fish: THREE.Group[] = [];
    for (const [fc, fy, fp] of [[0xe07b1f, 1.1, 0], [0xf5d95a, 1.35, 2.2], [0xe23e8e, 1.5, 4.1], [0x2fa36b, 1.2, 5.3]] as const) {
      const f = new THREE.Group();
      const fbody = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8), toon(fc)); fbody.scale.set(1.5, 1, 0.7);
      const ftail = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.12, 6), toon(fc));
      ftail.rotation.z = Math.PI / 2; ftail.position.x = -0.16;
      f.add(fbody, ftail);
      f.position.set(4.6, fy, 3.2); f.userData = { fy, fp };
      scene.add(f); fish.push(f);
    }
    // Barry's corner office: glass, black desk, the trophy, adjacency to the putting green
    const ceoGlass = new THREE.Mesh(new THREE.BoxGeometry(4.4, 2.9, 3.4),
      new THREE.MeshLambertMaterial({ color: 0xc9d6e2, transparent: true, opacity: 0.18 }));
    ceoGlass.position.set(-10.6, 1.45, -6.1); scene.add(ceoGlass);
    const ceoDesk = box(2.2, 0.16, 1.0, 0x17150f); ceoDesk.position.set(-10.8, 0.9, -6.4); ceoDesk.castShadow = true; scene.add(ceoDesk);
    for (const [dx, dz] of [[-0.95, -0.38], [0.95, -0.38], [-0.95, 0.38], [0.95, 0.38]] as const) {
      const leg = box(0.08, 0.9, 0.08, 0xb08d3e); leg.position.set(-10.8 + dx, 0.45, -6.4 + dz); scene.add(leg);
    }
    const trophy = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.22, 8), toon(0xc9a44c));
    trophy.position.set(-11.4, 1.09, -6.3); scene.add(trophy);
    const ceoChair = box(0.9, 1.3, 0.14, 0x17150f); ceoChair.position.set(-10.8, 1.0, -7.2); scene.add(ceoChair);
    const ceoSign = nameSprite("CORNER OFFICE", 0xc9a44c, 2.0); ceoSign.position.set(-10.6, 3.25, -6.1); scene.add(ceoSign);
    // Employee of the Month: the frame contains the coffee machine. posthumously.
    const eotmC = document.createElement("canvas"); eotmC.width = 200; eotmC.height = 240;
    const eg = eotmC.getContext("2d")!;
    eg.fillStyle = "#FBF9F4"; eg.fillRect(0, 0, 200, 240);
    eg.fillStyle = "#55606B"; eg.fillRect(55, 50, 90, 110);
    eg.fillStyle = "#17150F"; eg.fillRect(70, 70, 60, 40);
    eg.fillStyle = "#D8362A"; eg.beginPath(); eg.arc(100, 135, 8, 0, 7); eg.fill();
    eg.fillStyle = "#17150F"; eg.font = "700 17px Bricolage Grotesque, Arial"; eg.textAlign = "center";
    eg.fillText("EMPLOYEE OF", 100, 190); eg.fillText("THE MONTH", 100, 210);
    eg.font = "400 11px Space Mono, monospace"; eg.fillText("(posthumous)", 100, 228);
    const eotmFrame = box(1.2, 1.5, 0.07, 0xc9a44c); eotmFrame.position.set(12.85, 2.9, 0.2); eotmFrame.rotation.y = -Math.PI / 2; scene.add(eotmFrame);
    const eotm = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 1.3), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(eotmC) }));
    eotm.position.set(12.79, 2.9, 0.2); eotm.rotation.y = -Math.PI / 2; scene.add(eotm);

    /* pendant lights */
    for (const px of [-5, 0, 5]) {
      const cord = box(0.03, 1.1, 0.03, 0x17150f); cord.position.set(px, 4.65, -1);
      const shade = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.4, 16), toon(0x17150f)); shade.position.set(px, 4.0, -1);
      const glow = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffe9b8 }));
      glow.position.set(px, 3.86, -1);
      scene.add(cord, shade, glow);
    }

    /* elevator: interior shaft + car */
    const carDepth = 2.6;
    const shaft = new THREE.Mesh(new THREE.BoxGeometry(2.8, 3.4, carDepth + 0.4),
      new THREE.MeshLambertMaterial({ color: 0x3a3122, side: THREE.BackSide }));
    shaft.position.set(-12.3, 1.7, 0); scene.add(shaft);
    const carFloor = box(2.7, 0.06, carDepth + 0.3, 0x8a713d); carFloor.position.set(-12.3, 0.03, 0); scene.add(carFloor);
    const carRail = box(0.06, 0.08, carDepth, 0xc9a44c); carRail.position.set(-13.35, 1.05, 0); scene.add(carRail);
    const carLight = new THREE.PointLight(0xffe9b8, 26, 9); carLight.position.set(-11.9, 2.7, 0); scene.add(carLight);
    const doorL = box(0.12, 3.1, carDepth / 2, 0x8a713d); doorL.position.set(-10.95, 1.55, -carDepth / 4);
    const doorR = box(0.12, 3.1, carDepth / 2, 0x8a713d); doorR.position.set(-10.95, 1.55, carDepth / 4);
    scene.add(doorL, doorR);
    const elevSign = nameSprite("CAR A", 0xc9a44c, 1.1); elevSign.position.set(-10.7, 3.55, 0); scene.add(elevSign);

    /* desks, chairs, monitors, characters */
    const rigs: Record<string, CharRig> = {};
    const deskSlots: [number, number][] = [[-6, -3.6], [-2, -3.6], [2, -3.6], [6, -3.6], [-4, 0.8], [0, 0.8], [4, 0.8]];
    CAST.forEach((c, i) => {
      const [x, z] = deskSlots[i];
      const top = box(2.3, 0.14, 1.15, 0x1e1b17); top.position.set(x, 0.86, z); top.castShadow = true; scene.add(top);
      for (const [dx, dz] of [[-1.0, -0.42], [1.0, -0.42], [-1.0, 0.42], [1.0, 0.42]] as const) {
        const leg = box(0.09, 0.86, 0.09, 0xb08d3e); leg.position.set(x + dx, 0.43, z + dz); scene.add(leg);
      }
      const mon = box(0.85, 0.55, 0.07, 0x17150f); mon.position.set(x - 0.32, 1.42, z - 0.2); mon.rotation.y = 0.22; scene.add(mon);
      const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.72, 0.44), new THREE.MeshBasicMaterial({ color: 0x35b473 }));
      scr.position.set(x - 0.32, 1.42, z - 0.16); scr.rotation.y = 0.22; scene.add(scr);
      const mug = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.12, 10), toon(0xfbf9f4));
      mug.position.set(x + 0.7, 1.0, z + 0.2); scene.add(mug);
      // chair back peeking behind the character
      const chair = box(0.8, 0.7, 0.1, 0x2f2a24); chair.position.set(x, 0.9, z - 1.7); scene.add(chair);

      const built = buildCharacter(c.id, c.dept);
      const deskPos = new THREE.Vector3(x, 0, z - 1.25);
      built.group.position.copy(deskPos);
      const tag = nameSprite(c.name.split(" ")[0], DEPT_HEX[c.dept]); tag.position.y = 2.75; built.group.add(tag);
      scene.add(built.group);
      rigs[c.id] = { group: built.group, headG: built.headG, mouth: built.mouth, mood: built.mood,
        ring: built.ring, deskPos, idlePhase: i * 1.3, still: c.id === "roxy" };
    });

    /* lights */
    const amb = new THREE.AmbientLight(0xffffff, 0.75);
    const sun = new THREE.DirectionalLight(0xfff2d9, 1.7); sun.position.set(7, 11, 7);
    sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.left = -14; sun.shadow.camera.right = 14; sun.shadow.camera.top = 12; sun.shadow.camera.bottom = -10;
    const warm = new THREE.PointLight(0xc9a44c, 26, 30); warm.position.set(0, 4.6, 2);
    scene.add(amb, sun, warm);

    const applyNight = (n: boolean) => {
      scene.background = new THREE.Color(n ? 0x0e0d12 : 0xf2ead9);
      scene.fog = new THREE.Fog(n ? 0x0e0d12 : 0xf2ead9, 20, 50);
      amb.intensity = n ? 0.32 : 0.75;
      sun.intensity = n ? 0.25 : 1.7;
      warm.intensity = n ? 42 : 26;
      cityMat.map = n ? skyNight : skyDay; cityMat.needsUpdate = true;
      neonLight.intensity = n ? 14 : 4;
    };

    /* ---- state ---- */
    let curMode: CamMode = mode;
    let speaker: string | null = speakerId ?? null;
    let car: string[] = carCast;
    let doors = doorsOpen;
    const camPos = new THREE.Vector3(...CAMS[mode].pos);
    const camLook = new THREE.Vector3(...CAMS[mode].look);
    camera.position.copy(camPos); camera.lookAt(camLook);

    const placeCar = () => {
      for (const [id, r] of Object.entries(rigs)) {
        const ci = car.indexOf(id);
        if (ci >= 0 && (curMode === "elevator" || curMode === "loop")) {
          r.group.position.set(-12.2, 0, ci === 0 ? -0.62 : 0.62);
          r.group.rotation.y = Math.PI / 2;
        } else {
          r.group.position.copy(r.deskPos);
          r.group.rotation.y = 0;
        }
      }
    };
    placeCar();

    api.current = {
      setMode: (m) => { curMode = m; placeCar(); },
      setSpeaker: (s) => { speaker = s; },
      setCar: (c) => { car = c; placeCar(); },
      setDoors: (o) => { doors = o; },
      setNight: applyNight,
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

    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!visible) return;
      const t = clock.getElapsedTime();

      for (const [id, r] of Object.entries(rigs)) {
        const bob = reduced ? 0 : Math.sin(t * (r.still ? 0.5 : 1.7) + r.idlePhase) * 0.045;
        r.group.position.y = bob;
        const talking = speaker === id;
        if (talking && !reduced) {
          r.mouth.scale.set(1.4, 0.5 + Math.abs(Math.sin(t * 12)) * 1.1, 0.7);
          r.headG.rotation.z = Math.sin(t * 6) * 0.04;
        } else {
          r.mouth.scale.set(1.4, 0.5, 0.6);
          r.headG.rotation.z = 0;
        }
        r.ring.visible = talking;
        if (talking) r.ring.rotation.z = t * 1.6;
        r.mood.position.y = 2.42 + (reduced ? 0 : Math.sin(t * 2 + r.idlePhase) * 0.06);
      }
      const target = doors ? 1.62 : 0;
      if (!reduced) {
        doorL.position.z += ((-carDepth / 4 - target) - doorL.position.z) * 0.08;
        doorR.position.z += ((carDepth / 4 + target) - doorR.position.z) * 0.08;
      } else {
        doorL.position.z = -carDepth / 4 - target;
        doorR.position.z = carDepth / 4 + target;
      }
      for (const [fi, f] of fish.entries()) {
        const sp2 = 0.5 + fi * 0.13, ph = f.userData.fp as number;
        f.position.x = 4.6 + Math.sin(t * sp2 + ph) * 1.35;
        f.position.y = (f.userData.fy as number) + Math.sin(t * 1.3 + ph) * 0.08;
        f.rotation.y = Math.cos(t * sp2 + ph) > 0 ? 0 : Math.PI;
      }
      const ft = t % 9;
      (f16light.material as THREE.MeshBasicMaterial).color.set(ft > 8.55 && ft < 8.8 ? 0xc9a44c : 0x2a2416);
      flame.scale.setScalar(reduced ? 1 : 1 + Math.sin(t * 9) * 0.25);

      const tgt = CAMS[curMode];
      camPos.lerp(new THREE.Vector3(...tgt.pos), reduced ? 1 : 0.06);
      camLook.lerp(new THREE.Vector3(...tgt.look), reduced ? 1 : 0.06);
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
  useEffect(() => { api.current?.setCar(carCast); }, [carCast.join(",")]);
  useEffect(() => { api.current?.setDoors(doorsOpen); }, [doorsOpen]);
  useEffect(() => { api.current?.setNight(night); }, [night]);

  return <div ref={mount} className={className} style={{ width: "100%", height: "100%" }} />;
}
