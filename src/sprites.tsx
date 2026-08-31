/* FLOOR 15 — character sprites. Pure SVG primitives, CSS-animated.
   One parameterized bust (torso-up: works at a desk AND in the elevator).
   Big silhouettes, flat shading, one signature accessory each. No assets. */
import type { ReactNode } from "react";

interface SpriteCfg {
  skin: string; outfit: string; outfit2: string; hair: ReactNode;
  accessory: ReactNode; brow: number;   // brow tilt: personality at rest
  still?: boolean;                       // Roxy: her stillness IS the bit
}

const S: Record<string, SpriteCfg> = {
  barry: {
    skin: "#E8B88A", outfit: "#4A4550", outfit2: "#FBF9F4", brow: -4,
    hair: <path d="M26 30 Q28 12 50 11 Q73 12 74 32 Q74 20 62 17 Q66 26 50 24 Q34 26 38 17 Q26 20 26 30 Z" fill="#C9CCD1" />,
    accessory: <>
      {/* wide CEO shoulders + gold pocket square */}
      <rect x="14" y="64" width="72" height="14" rx="7" fill="#4A4550" />
      <rect x="60" y="76" width="9" height="7" rx="1" fill="#C9A44C" />
      {/* the putter, present for reasons no one will learn */}
      <line x1="84" y1="118" x2="94" y2="70" stroke="#8a6f31" strokeWidth="3" strokeLinecap="round" />
      <rect x="90" y="64" width="10" height="6" rx="2" fill="#B08D3E" />
    </>,
  },
  linda: {
    skin: "#8D5A3B", outfit: "#1F3A63", outfit2: "#EAE5DA", brow: 7,
    hair: <>
      <path d="M27 34 Q26 13 50 12 Q74 13 73 34 L73 26 Q62 16 50 17 Q38 16 27 26 Z" fill="#2A2118" />
      <circle cx="50" cy="12" r="8" fill="#2A2118" />
      {/* reading glasses, pushed up, being looked for */}
      <circle cx="42" cy="16" r="5" fill="none" stroke="#C9A44C" strokeWidth="1.6" />
      <circle cx="57" cy="16" r="5" fill="none" stroke="#C9A44C" strokeWidth="1.6" />
    </>,
    accessory: <>
      {/* the legal pad, mid-note, always */}
      <rect x="64" y="88" width="20" height="26" rx="2" fill="#F5E9B8" transform="rotate(-8 74 101)" />
      <line x1="68" y1="96" x2="80" y2="94" stroke="#8a6f31" strokeWidth="1.4" />
      <line x1="68" y1="101" x2="80" y2="99" stroke="#8a6f31" strokeWidth="1.4" />
    </>,
  },
  max: {
    skin: "#F0C49B", outfit: "#D8362A", outfit2: "#FBF9F4", brow: -10,
    hair: <path d="M28 30 Q30 10 50 12 Q72 10 72 30 Q66 18 50 20 Q34 18 28 30 Z" fill="#6B4A2F" />,
    accessory: <>
      {/* THE VEST (locked in) over shirt, tie already surrendering */}
      <path d="M34 66 L44 64 L50 84 L56 64 L66 66 L64 118 L36 118 Z" fill="#8B1F16" />
      <polygon points="50,68 46,76 50,96 54,76" fill="#C9A44C" transform="rotate(9 50 82)" />
    </>,
  },
  trixie: {
    skin: "#C68642", outfit: "#E23E8E", outfit2: "#FBF9F4", brow: -2,
    hair: <>
      <path d="M28 34 Q26 12 50 12 Q74 12 72 34 L72 24 Q60 15 48 17 Q36 15 28 28 Z" fill="#1E1520" />
      <path d="M70 20 Q86 22 82 48 Q78 34 68 30 Z" fill="#1E1520" />
    </>,
    accessory: <>
      {/* phone at exactly 45 degrees, ring-light glow */}
      <g transform="rotate(45 82 84)">
        <rect x="76" y="72" width="13" height="24" rx="3" fill="#17150F" />
        <rect x="78" y="75" width="9" height="16" rx="1" fill="#FDE8F2" className="f15-glow" />
      </g>
    </>,
  },
  roxy: {
    skin: "#6B4226", outfit: "#55606B", outfit2: "#3D454D", brow: 3, still: true,
    hair: <path d="M28 36 Q27 12 50 12 Q73 12 72 36 L72 30 Q62 18 50 19 Q38 18 28 30 Z" fill="#14100C" />,
    accessory: <>
      {/* earpiece with nothing on the other end. or is there. */}
      <circle cx="71" cy="38" r="3.4" fill="#17150F" />
      <path d="M71 41 Q74 50 68 58" stroke="#17150F" strokeWidth="1.6" fill="none" />
    </>,
  },
  manny: {
    skin: "#D9A066", outfit: "#E07B1F", outfit2: "#FBF9F4", brow: -6,
    hair: <>
      <path d="M28 32 Q30 12 50 12 Q70 12 72 32 Q64 20 50 22 Q36 20 28 32 Z" fill="#3A2A1A" />
      <path d="M36 46 Q50 56 64 46 L64 52 Q50 60 36 52 Z" fill="#3A2A1A" />
    </>,
    accessory: <>
      {/* measuring-tape scarf, worn like a scarf, obviously */}
      <path d="M30 66 Q50 76 70 66 L70 74 Q50 84 30 74 Z" fill="#F5D95A" />
      <g fill="#17150F"><rect x="34" y="69" width="1.6" height="5"/><rect x="42" y="71" width="1.6" height="5"/><rect x="50" y="72" width="1.6" height="5"/><rect x="58" y="71" width="1.6" height="5"/><rect x="66" y="69" width="1.6" height="5"/></g>
    </>,
  },
  evan: {
    skin: "#F5D0A9", outfit: "#2FA36B", outfit2: "#FBF9F4", brow: 6,
    hair: <path d="M29 28 Q34 10 50 12 Q66 10 71 28 Q60 16 50 22 Q40 16 29 28 Z" fill="#8a5a2b" />,
    accessory: <>
      {/* backpack straps + the six-badge lanyard */}
      <rect x="30" y="64" width="8" height="54" rx="4" fill="#1F6B47" />
      <rect x="62" y="64" width="8" height="54" rx="4" fill="#1F6B47" />
      <line x1="44" y1="64" x2="50" y2="96" stroke="#B08D3E" strokeWidth="2" />
      <line x1="56" y1="64" x2="50" y2="96" stroke="#B08D3E" strokeWidth="2" />
      <g>
        <rect x="44" y="94" width="12" height="9" rx="1.5" fill="#FBF9F4" stroke="#B08D3E" strokeWidth="1" />
        <rect x="47" y="97" width="12" height="9" rx="1.5" fill="#FBF9F4" stroke="#B08D3E" strokeWidth="1" transform="rotate(8 53 101)" />
        <rect x="41" y="98" width="12" height="9" rx="1.5" fill="#FBF9F4" stroke="#B08D3E" strokeWidth="1" transform="rotate(-9 47 102)" />
      </g>
    </>,
  },
};

export function CharacterSprite({ id, talking = false, size = 100 }:
  { id: string; talking?: boolean; size?: number }) {
  const c = S[id];
  if (!c) return null;
  return (
    <svg
      viewBox="0 0 100 120" width={size} height={size * 1.2}
      className={"f15-sprite" + (c.still ? " f15-still" : "") + (talking ? " f15-talking" : "")}
      aria-hidden="true"
    >
      {/* torso */}
      <rect x="20" y="62" width="60" height="58" rx="14" fill={c.outfit} />
      <path d="M40 62 L50 78 L60 62 Z" fill={c.outfit2} />
      {c.accessory}
      {/* head */}
      <g className="f15-head">
        <circle cx="50" cy="36" r="24" fill={c.skin} />
        {c.hair}
        {/* brows */}
        <line x1="38" y1={27} x2="46" y2={27 + c.brow / 3} stroke="#17150F" strokeWidth="2.2" strokeLinecap="round" transform={`rotate(${c.brow} 42 27)`} />
        <line x1="54" y1={27 + c.brow / 3} x2="62" y2={27} stroke="#17150F" strokeWidth="2.2" strokeLinecap="round" transform={`rotate(${-c.brow} 58 27)`} />
        {/* eyes (blink via CSS) */}
        <g className="f15-eyes">
          <circle cx="42" cy="34" r="2.6" fill="#17150F" />
          <circle cx="58" cy="34" r="2.6" fill="#17150F" />
        </g>
        {/* mouth: line at rest, bouncing ellipse when talking */}
        {talking
          ? <ellipse className="f15-mouth" cx="50" cy="47" rx="6" ry="4" fill="#17150F" />
          : <path d="M44 47 Q50 50 56 47" stroke="#17150F" strokeWidth="2" fill="none" strokeLinecap="round" />}
      </g>
    </svg>
  );
}

/** Map a spoken name (e.g. "MAX", "LINDA LEGAL") to a sprite id. */
export function spriteIdFor(who: string | null): string | null {
  if (!who) return null;
  const first = who.split(" ")[0].toLowerCase();
  return S[first] ? first : null;
}
