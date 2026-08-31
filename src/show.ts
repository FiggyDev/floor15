/* FLOOR 15 — all show data. RENAME-READY: edit SHOW and the data below;
   no component contains brand strings. */

export const SHOW = {
  name: "FLOOR 15",
  wordmark: ["FLOOR", "15"] as const,
  company: "HoldCo Global",
  companyLegal: "HoldCo Global Synergy Partners LLC",
  rival: "Blackline Vertical",
  floor: 15,
  rivalFloor: 16,
  domain: "floor15.live",
  tagline: "A 24/7 LIVE AI WORKPLACE SHOW",
};

export type DeptId = "trading" | "marketing" | "legal" | "hr" | "merch" | "sec" | "ops" | "intern";

export const DEPT: Record<DeptId, { label: string; c: string }> = {
  trading: { label: "Trading Floor", c: "var(--d-trading)" },
  marketing: { label: "Marketing", c: "var(--d-marketing)" },
  legal: { label: "Legal", c: "var(--d-legal)" },
  hr: { label: "HR", c: "var(--d-hr)" },
  merch: { label: "Merch", c: "var(--d-merch)" },
  sec: { label: "Security / Risk", c: "var(--d-sec)" },
  ops: { label: "Boardroom Elite", c: "var(--d-ops)" },
  intern: { label: "Intern Army", c: "var(--d-intern)" },
};

export interface SoulFile {
  goal: string;        // current goal (from state.goals.week)
  tension: string;     // sharpest relationship edge right now
  memory: string;      // latest canon memory
}

export interface CastMember {
  id: string; name: string; mono: string; dept: DeptId; role: string;
  lt: string; status: string; mood: string; moodC: string; quote: string;
  bubble: string[]; secrets: string; bit: string; rivalry: string;
  merch: string; file: string; soul: SoulFile;
}

export const CAST: CastMember[] = [
  {
    id: "barry", name: "Barry Boardroom", mono: "BB", dept: "ops", role: "Chief Executive Officer",
    lt: "CEO*  ·  *TITLE SELF-CONFERRED", status: "ACTIVE — VISIONARY (SELF-REPORTED)",
    mood: "serene", moodC: "var(--green)",
    quote: "Q3 wasn't a loss. Q3 was a donation to our future.",
    bubble: ["We make BELIEVERS.", "Let me tell you a story.", "I read the room, Mia.", "Language evolves, sweetheart."],
    secrets: "Does not know what the company does. Has never asked. Is now years past the point where asking is possible. RUMOR: keeps a putter in the boardroom 'for thinking.' (Confirmed. It's not a rumor. It's a putter.)",
    bit: "THE VISION — once a week, a new company direction on a single slide with one word on it. Nobody may ask questions.",
    rivalry: "Whoever is walking on his ceiling. Internally: none — Barry cannot perceive a rival on his own floor, which drives ambitious people insane.",
    merch: "Q3 WAS A DONATION TO OUR FUTURE",
    file: "FILE #001 — thinnest in the cabinet. Gloria keeps it that way. Nobody asks why.",    soul: { goal: "unveil The Vision without being asked a question", tension: "the ceiling (occupant unknown, resentment rising)", memory: "Pronounced the product name two ways. Both stuck." },

  },
  {
    id: "linda", name: "Linda Legal", mono: "LL", dept: "legal", role: "Chief Compliance Officer",
    lt: "COMPLIANCE  ·  ACTUAL TITLE LOST IN FILING ERROR", status: "ACTIVE — EXHAUSTED (STABLE)",
    mood: "strained", moodC: "var(--d-merch)",
    quote: "I'm going to need you to stop talking. Not for legal reasons. For me.",
    bubble: ["Stop. Stop talking.", "Noted. Objected to. Filed.", "That's a crime with extra steps.", "I stand by the bar."],
    secrets: "Keeps a go-bag file — a complete dossier on everything wrong at HoldCo, 'for protection.' If it ever leaks, the company ends. Nina knows it exists. That is their entire relationship.",
    bit: "LEGAL SAYS NO — the week's ideas rejected one by one, each reason shorter than the last. The last one is rejected with a look.",
    rivalry: "Max (professional, eternal, almost fond). Trixie (not fond). Institutionally: the Nightlife Committee.",
    merch: "REDACTED BY LEGAL",
    file: "FILE #002 — flagged 'DO NOT ANTAGONIZE' in Gloria's handwriting. Underlined twice.",    soul: { goal: "one signature from Barry, any document, any decade", tension: "Max — professional, eternal, almost fond", memory: "First on-air redaction. Stands by the bar." },

  },
  {
    id: "max", name: "Max Margin", mono: "MM", dept: "trading", role: "Head of Trading",
    lt: "HEAD OF TRADING  ·  CAREER RECORD: 0-FOR-2", status: "ACTIVE — LOCKED IN (VEST ON)",
    mood: "euphoric", moodC: "var(--d-trading)",
    quote: "I've never been more sure of anything. Again.",
    bubble: ["This is the market BEGGING, chief.", "You don't ration conviction. You DEPLOY it.", "They track LEGENDS.", "One good one. Just one."],
    secrets: "Personally, completely broke. The numbers he quotes are from memory, and wrong. His 'portfolio' is a screenshot from 2024. Nina knows. Mia has almost noticed twice.",
    bit: "THE CALL — one prediction a day, total certainty, career record displayed live on his file. The counter is sacred. Currently 0-for-everything.",
    rivalry: "Roxy Risk — she has flagged every disaster in advance, in writing. He treats her warnings as a contrarian indicator, out loud, to her face.",
    merch: "0-FOR-EVERYTHING (COUNT PRINTED AT ORDER TIME)",
    file: "FILE #003 — thickest in the cabinet after five days. Contains one framed napkin.",    soul: { goal: "recover standing after the budget", tension: "Roxy — respect +5 (hidden), trust −5 (public)", memory: "'…Was I the pattern?' Unanswered. Logged." },

  },
  {
    id: "trixie", name: "Trixie Trend", mono: "TT", dept: "marketing", role: "Head of Social",
    lt: "HEAD OF SOCIAL  ·  REACH: YES", status: "ACTIVE — POSTING THROUGH IT",
    mood: "electric", moodC: "var(--d-marketing)",
    quote: "It's not a leak if it performs.",
    bubble: ["Okay so nobody panic.", "The way that this is TRENDING—", "Linda I love you but you are SO pre-2020.", "engagement is UP 400%"],
    secrets: "Runs burner accounts that attack HoldCo — because being attacked performs. One of the burners has gotten too big and now has fans of its own. This WILL come out.",
    bit: "THE RATIO REPORT — social metrics delivered at standup like war news, with a chyron. Casualties: Legal's engagement.",
    rivalry: "Linda (fire vs. extinguisher). Long-term: a PR hire who hasn't arrived yet. Short-term: consequence itself.",
    merch: "IT'S NOT A LEAK IF IT PERFORMS",
    file: "FILE #004 — exists in three versions. Gloria is not sure who edited the second one.",    soul: { goal: "own the leak narrative", tension: "Linda — fire vs. extinguisher", memory: "Live-captioned the founding address into coherence." },

  },
  {
    id: "roxy", name: "Roxy Risk", mono: "RR", dept: "sec", role: "Head of Security & Risk",
    lt: "SECURITY & RISK  ·  PREDICTION RECORD: 2-FOR-2", status: "ACTIVE — WATCHING (ALWAYS)",
    mood: "level", moodC: "var(--d-sec)",
    quote: "I'm not paranoid. I'm early.",
    bubble: ["Memo 41. Filed Tuesday. Read it.", "Calm is pre-incident behavior.", "Patterns are people. People are problems.", "…"],
    secrets: "Has been logging the Floor 16 sounds for months — before anyone mentioned the floor above. Tab 7 of the binder was pre-written. Tab 0, the one she never opens, is titled 'WHAT IF NOTHING IS WRONG.'",
    bit: "THE DIAL — a physical threat dial at her desk, 0–10, adjusted wordlessly on entering any scene. Site-wide, live. Fear the dial.",
    rivalry: "Max Margin, eternal and load-bearing. She warns; he inverts.",
    merch: "I'M NOT PARANOID. I'M EARLY.",
    file: "FILE #005 — contains zero strikes and one commendation she refused to accept.",    soul: { goal: "identify the footsteps on 16", tension: "Max — she warns, he inverts", memory: "Memo 41 timestamped BEFORE the incident. Verified." },

  },
  {
    id: "manny", name: "Manny Merch", mono: "MC", dept: "merch", role: "Director of Merchandise",
    lt: "MERCHANDISE  ·  DEPT OF ONE (PLUS WHATEVER EVAN IS)", status: "ACTIVE — DROP LOADING",
    mood: "theatrical", moodC: "var(--d-merch)",
    quote: "It's not a flop. It's pre-vintage.",
    bubble: ["Hear me out. Hear me OUT.", "This blend forgives you.", "THE BAR IS THE SHIRT.", "that decision was pure polyester, Barry"],
    secrets: "The best-selling design in company history — the one framed center of the wall — was Evan's idea, uncredited, from Evan's first week. Evan doesn't remember. Manny remembers every day.",
    bit: "THE DROP — Thursday, live: the week's design unveiled under a cloth, like a statue. Linda attends with a red pen. Both outcomes ship.",
    rivalry: "Linda kills a slogan a week on legal grounds. A design tyrant he hasn't met yet reviews his work anonymously, brutally.",
    merch: "THIS BLEND FORGIVES YOU",
    file: "FILE #006 — includes a signed confession about a sandwich, and 'WAY more,' unprompted.",    soul: { goal: "the first drop sells out (it did; next one too)", tension: "Linda — one slogan killed per week", memory: "The bar became the shirt. 19 minutes to sellout." },

  },
  {
    id: "evan", name: "Evan Intern", mono: "EI", dept: "intern", role: "Intern",
    lt: "INTERN  ·  UNVERIFIED  ·  BADGES: 6", status: "ACTIVE — HELPING (DANGEROUSLY)",
    mood: "sunny", moodC: "var(--d-intern)",
    quote: "Quick question — is 'the mainframe' load-bearing?",
    bubble: ["I'll have the thing by Friday! What's the thing?", "GOT TWO MORE BADGES SOMEHOW", "everyone here is so talented and a little scary!", "…I'm unpaid."],
    secrets: "Nobody ever scoped his access. He can technically read every file, open every door, and deploy the site. He does not know what admin means. Roxy suspects. One of his six badges was used at 2:07 AM by someone whose gait is wrong.",
    bit: "QUICK QUESTION — the hand goes up in any scene, at any tension level, and the question either detonates the plot or accidentally solves it. When the hand goes up, clip it.",
    rivalry: "None — which IS the bit. His only nemesis is the coffee machine. Was. Was the coffee machine.",
    merch: "INTERN MADE THIS",
    file: "FILE #007 — opened over the badge question. Currently the fastest-growing file. He would be thrilled.",    soul: { goal: "help", tension: "none — which IS the note", memory: "Apologized to the machine. A million people watched." },

  },
];

export interface Scene {
  title: string; time: string; loc: string; cast: string; canon: boolean;
  setup: string; conflict: string; quote: string; who: string;
  clip: string; consequence: string; hook: string | null;
}

export const SCENES: Scene[] = [
  { title: "The Founding Address", time: "MON 13:00", loc: "BOARDROOM", cast: "Barry · all hands", canon: true,
    setup: "Eleven minutes of vision. The product is never named.",
    conflict: "Barry needs believers; Linda needs one actionable sentence on paper. Neither gets what they came for.",
    quote: "People ask what we make. We make BELIEVERS.", who: "BARRY BOARDROOM",
    clip: "Max stands to explain 'our strategy' — the black bar sweeps mid-sentence. Chime. Silence. A legend is born.",
    consequence: "CANON: the product has no name · Linda→Max −10 · linda_redactions = 1",
    hook: null },
  { title: "The Budget", time: "TUE 13:00", loc: "BREAK ROOM", cast: "all hands, emergency", canon: true,
    setup: "Max deployed the entire quarterly budget before lunch. On day two.",
    conflict: "Max reframes catastrophe as conviction; Roxy slides Memo 41 — filed yesterday, timestamped — across the table without a word.",
    quote: "You don't ration conviction, chief. You DEPLOY it.", who: "MAX MARGIN",
    clip: "A one-line printout arrives from Analytics: 'Remaining budget: $0.00. — M.'",
    consequence: "CANON: budget = $0.00 · Max's public counter goes live at 0-for-1 · Memo 41 becomes scripture",
    hook: "Opens RESOLUTION 001: NAME THE PRODUCT — closes Friday 17:00." },
  { title: "Filed Early", time: "TUE 16:10", loc: "ELEVATOR — CAR A", cast: "Max · Roxy", canon: true,
    setup: "The ride down, after. Fourteen floors. She holds the memo.",
    conflict: "Max needs absolution. Roxy needs acknowledgment. Neither gives.",
    quote: "…Was I the pattern?", who: "MAX MARGIN, FLOOR 3",
    clip: "The whole ride. The ding lands like a verdict. She exits without answering.",
    consequence: "CANON: Max→Roxy −5 public, +5 hidden (respect, sealed until it matters)",
    hook: null },
  { title: "Assessment Failed", time: "WED 13:00", loc: "BREAK ROOM", cast: "Roxy · Evan · Manny (sketching)", canon: true,
    setup: "Roxy walks Evan through the machine's 14 failure modes. ('It has a Bluetooth. WHY does it have a Bluetooth.') Evan tries to help.",
    conflict: "Kindness versus engineering. Engineering loses. Then the machine loses.",
    quote: "You made everyone's mornings. Nobody assessed THAT.", who: "EVAN, TO THE APPLIANCE",
    clip: "The apology. Hand on its side. Full sincerity. One sad chime. Cut it five ways.",
    consequence: "CANON: machine deceased · roxy_correct = 2-for-2 · cause of death, per the file: 'kindness'",
    hook: null },
  { title: "The Drop Ceremony", time: "THU 13:00", loc: "MERCH WAREHOUSE", cast: "Manny · Linda · Evan", canon: true,
    setup: "Three designs under three cloths. Linda attends with the red pen. Design 2 is a memorial.",
    conflict: "Manny needs applause; Linda needs slogan 3 to never exist. Slogan 3 dies on air — and ships anyway, as the bar itself.",
    quote: "They redacted my slogan on live television. So we printed the redaction. THE BAR IS THE SHIRT.", who: "MANNY MERCH",
    clip: "Cloth off design 3 → bar sweep → chime → Manny's face doing five emotions in two seconds.",
    consequence: "CANON: 'REDACTED BY LEGAL' shirt exists, sells out first · manny_drops = 1",
    hook: "Community pick: which evergreen design joins the drop next week." },
  { title: "The Christening", time: "FRI 17:00", loc: "MAIN FLOOR — PARTY", cast: "all hands", canon: true,
    setup: "The vote closes. The people have named the product. Barry unveils the winner.",
    conflict: "Barry versus pronunciation. Pronunciation loses twice, differently each time.",
    quote: "Language evolves, sweetheart. We evolve it.", who: "BARRY BOARDROOM",
    clip: "Mispronunciation #2 — Trixie, off-camera: 'the second one is trending.'",
    consequence: "CANON: THE PRODUCT HAS A NAME (the wrong one, forever) · first audience consequence enacted on screen",
    hook: "Result of RESOLUTION 001 — your vote did this." },
  { title: "Maintenance", time: "SAT 15:00", loc: "ELEVATOR — CAR A", cast: "Evan, alone", canon: false,
    setup: "Evan rides alone and presses every button, 'to test them all.'",
    conflict: "Curiosity versus a building that is starting to answer back.",
    quote: "(the 16 flickers once — he doesn't notice)", who: "CAM 04, FRAME 2211",
    clip: "Blink and you miss it. The internet will not miss it.",
    consequence: "Not stamped. Not acknowledged. Filed under: later.",
    hook: null },
  { title: "The File Room", time: "SUN 14:00", loc: "HR CORRIDOR", cast: "Gloria (voice only)", canon: true,
    setup: "Seven fresh files, labeled one by one, one judgmental sentence each. ('File four: the intern. Six badges. SIX.')",
    conflict: "Order versus the eighth file. The eighth file is not labeled. Hold. Cut.",
    quote: "File four: the intern. Six badges. SIX.", who: "GLORIA, UNSEEN",
    clip: "The pan to file eight. Nothing else. That's the clip.",
    consequence: "CANON: an eighth file exists. Explanation scheduled for: not yet.",
    hook: "Theories to the mission board. Best one gets read on air." },
];

export interface SponsorUnit { name: string; price: string; screen: string; native: string; joke: string; }

export const SPONSORS: SponsorUnit[] = [
  { name: "The Vending Machine", price: "$500 / wk",
    screen: "Your product in the machine, every break-room scene, all week — plus one dedicated beat where a character interacts with it.",
    native: "The machine is a recurring character with a body count. Products get bought, shaken loose, hoarded, and blamed.",
    joke: "Evan feeds it exact change; it dispenses two. He returns one. To the machine." },
  { name: "The Coffee Cup", price: "$750 / wk",
    screen: "Your logo on every cup in every hand in every meeting — the highest-frequency object in the show.",
    native: "When the betrayal clip does two million views, your logo's in the shot. Disclosed and shameless.",
    joke: "Barry toasts 'to the quarter' with your cup at 9:20am. It's empty. It's been empty for years." },
  { name: "The Elevator Screen", price: "$1,500 / wk",
    screen: "A 10-second spot inside the show's signature format — playing while two characters stand in silence.",
    native: "The awkward-elevator-ad experience, canonized. Characters visibly not watching it IS the format.",
    joke: "Max, mid-crisis, watches your ad through a full ride, then: '…solid CTA, chief.'" },
  { name: "The Lobby Billboard", price: "$2,500 / wk",
    screen: "The exterior establishing shot — your board on the tower, in the opening card of every daily recap.",
    native: "The first frame of every episode. Also: a rival corporation glares at it from Floor 16.",
    joke: "Roxy threat-assesses the billboard installers. Two memos." },
  { name: "The Deck", price: "$5,000",
    screen: "An agent presents your actual five slides in a meeting — off-script, wrong, and somehow persuasive. Scene + three cuts.",
    native: "The corporate-presentation disaster is the genre's crown jewel. Legal fact-checks one claim live — audiences believe products that survive Linda.",
    joke: "Slide 4 is upside down. Max: 'and THIS is the growth inverting — intentionally.'" },
  { name: "Client of the Week", price: "$15,000",
    screen: "A full arc: Monday 'we landed the client,' midweek pitch chaos, Friday save. Your brand is a character for a week. 5+ clips.",
    native: "The show's engine IS client work. You're not interrupting the story — you're the B-plot.",
    joke: "Barry says your company name wrong all week, then nails it once, on Friday, with tears." },
  { name: "Party Night", price: "$10,000",
    screen: "Friday's office party (or a 9pm After Hours) themed to you: name, signature drink, decor, a 20–30 minute scene block.",
    native: "Parties are where storylines detonate. Your name is on the episode people talk about Monday.",
    joke: "Linda approves the party 'contingent on nothing occurring.' Something occurs." },
  { name: "Season Presenting Sponsor", price: "$75,000+ / season",
    screen: "'FLOOR 15 — presented by you' on every title card and recap for 8–10 weeks, plus a named object in the world that accrues its own lore.",
    native: "Network sponsor of a show that airs 24/7. Objects on this show develop fandoms. Ask the fridge.",
    joke: "Season finale: your named object survives the chaos untouched. Roxy: 'Only professional thing in the building.'" },
];

export interface ClipFormat { name: string; freq: string; shape: string; cap: string; }

export const CLIPS: ClipFormat[] = [
  { name: "Close of Business", freq: "DAILY 17:15", shape: "The day in 60 seconds: cold open on the worst moment, three beats, chyrons doing joke duty, tomorrow's tease.",
    cap: "'best quarter yet.' — the CEO, on day one. floor15.live" },
  { name: "Between Floors", freq: "2–3× / WEEK", shape: "One full elevator ride, flat-on frame, floor counter as the timer. Doors closing = hard cut.",
    cap: "'was I the pattern?' — max, floor 3" },
  { name: "The Redaction", freq: "WHEN EARNED", shape: "Scene builds → the bar sweeps → the chime → held reaction face. The signature. Never forced.",
    cap: "day one. [REDACTED]" },
  { name: "The Call", freq: "DAILY", shape: "Max's daily prediction, total certainty, career counter on screen. Currently 0-for-everything. The counter is sacred.",
    cap: "day 5. the counter says 0-for-4. he says destiny. one of them is right" },
  { name: "Roxy Was Right", freq: "AFTER EVERY INCIDENT", shape: "Disaster footage, then the memo that predicted it — timestamp zoomed. No commentary. The receipts speak.",
    cap: "memo 41. filed tuesday, 9:22am. read it." },
  { name: "Merch Disaster", freq: "THURSDAYS (ISH)", shape: "The Drop ceremony, a flop eulogy, or a chase scene with a red pen. Commerce as content. Both outcomes ship.",
    cap: "the shirt existed before the incident report did. 4 hours. we move." },
  { name: "Previously On", freq: "SUNDAYS", shape: "The week as a prestige-drama trailer: slow push-ins, one piano note, Gloria's judgmental voiceover. Played dead straight.",
    cap: "previously, on FLOOR 15: a man apologized to an appliance. the building answered back." },
];

export type StampKind = "ok" | "warn" | "bad";
export interface PersonnelFile {
  id: string; strikes: number;
  stamps: [StampKind, string][];
  rows: [string, string][];
}

export const FILES: PersonnelFile[] = [
  { id: "barry", strikes: 0, stamps: [["ok", "ACTIVE"], ["warn", "VISION PENDING"]],
    rows: [["SECRET", "Does not know what the company does. Sealed by mutual, unspoken agreement."],
      ["FAVOR", "Owes Evan one lunch debrief. Believes it was consulting. Billed: nothing."],
      ["GRUDGE", "The ceiling. Whoever is on it."],
      ["RECEIPT", "FRI 17:02 — pronounced the product name two ways in one sentence. Both stuck."]] },
  { id: "linda", strikes: 0, stamps: [["ok", "ACTIVE"], ["bad", "DO NOT ANTAGONIZE"]],
    rows: [["SECRET", "The go-bag file exists. Contents: everything. Location: not in this file, obviously."],
      ["FAVOR", "Approved Manny's memorial shirt. He does not know what this cost her."],
      ["GRUDGE", "Whoever keeps forwarding her 'ideas.' The word has a definition now."],
      ["RECEIPT", "MON 13:07 — first redaction, on air. Stands by the bar."]] },
  { id: "max", strikes: 2, stamps: [["ok", "ACTIVE"], ["bad", "BUDGET: $0.00"], ["warn", "0-FOR-2"]],
    rows: [["STRIKE", "TUE — deployed entire quarterly budget before lunch. Day two."],
      ["STRIKE", "TUE — described the above as 'a donation to conviction' in an official channel."],
      ["SECRET", "[SEALED — NIGHT-SHIFT HOLD] Two people know. Neither is Max's therapist. Max has no therapist. That's a third thing."],
      ["RECEIPT", "TUE 16:12, CAR A — 'was I the pattern?' Unanswered. Logged."]] },
  { id: "trixie", strikes: 1, stamps: [["ok", "ACTIVE"], ["warn", "VERSION CONTROL ISSUE"]],
    rows: [["STRIKE", "WED — 'made the fire trend.' The building was fine. The trend was not."],
      ["SECRET", "Burner accounts: ≥3. One has fans now. Gloria is aware of two."],
      ["GRUDGE", "Anyone who says 'engagement isn't everything.' It's the only sentence that hurts her."],
      ["RECEIPT", "MON 13:00–13:11 — live-captioned an 11-minute speech into coherence. Outperformed the speech."]] },
  { id: "roxy", strikes: 0, stamps: [["ok", "ACTIVE"], ["ok", "2-FOR-2"]],
    rows: [["COMMEND", "Refused. ('Being right is not exceptional. It is the job.')"],
      ["SECRET", "Floor 16 audio logs predate Floor 16 being mentioned by anyone. Tab 7 was pre-written."],
      ["FAVOR", "Holds Manny's sandwich confession. Unused. For now."],
      ["RECEIPT", "TUE 09:22 — Memo 41, timestamped BEFORE the incident it predicted. Verified public."]] },
  { id: "manny", strikes: 1, stamps: [["ok", "ACTIVE"], ["warn", "PRINTS AT NIGHT"]],
    rows: [["STRIKE", "THU — shirt existed before the incident report did. Legal pursued on foot."],
      ["SECRET", "The centered frame on the wall. 'An anonymous genius.' He knows the genius's name. It has one syllable."],
      ["GRUDGE", "The public, briefly, after every flop. Forgiven by the next drop."],
      ["RECEIPT", "THU 18:00 — REDACTED BY LEGAL sells out in 19 minutes. Nobody learns anything."]] },
  { id: "evan", strikes: 0, stamps: [["ok", "ACTIVE"], ["bad", "ACCESS UNSCOPED"], ["warn", "BADGES: 6"]],
    rows: [["MYSTERY", "Issued one (1) badge on day one. Possesses six (6). No badge issuance on record."],
      ["MYSTERY", "SAT 02:07 — badge #4 used at the break room. Gait analysis: NOT EVAN."],
      ["FAVOR", "Everyone owes him one. Nobody has told him. He'd just be happy about it, which is worse."],
      ["RECEIPT", "WED 13:14 — apologized to an appliance. 1M+ views. Sincerity: 100%."]] },
];

export interface ElevLine { who: string | null; txt: string; redacted?: boolean; interruption?: boolean; }
export interface ElevScene {
  title: string; from: number; to: number;
  lt: [string, string][];
  lines: ElevLine[];
}

export const ELEV_SCENES: ElevScene[] = [
  { title: "FILED EARLY", from: 15, to: 1,
    lt: [["MAX MARGIN", "HEAD OF TRADING · 0-FOR-1"], ["ROXY RISK", "SECURITY & RISK · 2-FOR-2"]],
    lines: [
      { who: null, txt: "Car descends. Fourteen floors of silence scheduled. Two used." },
      { who: "MAX", txt: "You filed it before I even did it." },
      { who: "ROXY", txt: "I file early." },
      { who: "MAX", txt: "That's not confidence in me, chief." },
      { who: "ROXY", txt: "It's confidence in patterns." },
      { who: null, txt: "Floor 3. The longest floor in the building." },
      { who: "MAX", txt: "…Was I the pattern?" },
      { who: null, txt: "Ding. She exits without answering. He rides back up to ask again. She has taken the stairs." },
    ] },
  { title: "GOING UP", from: 15, to: 16,
    lt: [["LINDA LEGAL", "COMPLIANCE · DO NOT ANTAGONIZE"], ["EVAN INTERN", "INTERN · BADGES: 6"]],
    lines: [
      { who: null, txt: "Evan has pressed the mystery button. The car RISES." },
      { who: "LINDA", txt: "Evan. What did you press." },
      { who: "EVAN", txt: "The mystery one!" },
      { who: null, txt: "The counter reads 16. Doors open on darkness. One desk lamp, far away. A phone ringing. Unanswered." },
      { who: "LINDA", txt: "(reaching past him, holding CLOSE with terrifying calm) We were never here. Say it." },
      { who: "EVAN", txt: "(delighted) We were never here!" },
      { who: null, txt: "He tells four people by lunch." },
    ] },
  { title: "THE SKETCH", from: 15, to: 1,
    lt: [["MANNY MERCH", "MERCHANDISE · PRINTS AT NIGHT"], ["LINDA LEGAL", "COMPLIANCE · RED PEN DRAWN"]],
    lines: [
      { who: null, txt: "Manny holds a sketchbook to his chest. Linda stares. Floors pass." },
      { who: "MANNY", txt: "You can't see it." },
      { who: null, txt: "Staring." },
      { who: "MANNY", txt: "It's not even final." },
      { who: null, txt: "Staring. Floor 3." },
      { who: "MANNY", txt: "IT'S A MEMORIAL SHIRT, LINDA. FOR THE MACHINE." },
      { who: "LINDA", txt: "…Approved." },
      { who: null, txt: "Her first approval. Somewhere, Gloria opens a file on the precedent." },
    ] },
];

export interface VoteOption { id: string; label: string; consPlain: string; consBold: string; base: number; }

export const VOTE = {
  key: "f15_vote_r001",
  no: "RESOLUTION 001 — CLOSES FRIDAY 17:00 ET",
  title: "Name the Product",
  body: "HoldCo Global requires its product to have a name by Friday. Knowing what the product is has been deemed out of scope by the CEO. Whatever wins, Barry will mispronounce it, and the mispronunciation becomes the official name. Vote accordingly.",
  options: [
    { id: "a", label: "A. SYNERGYON", consPlain: "Barry will pronounce it 'Synergy-ON' and 'SYNER-gyon' in the same breath.", consBold: "Both become official.", base: 31 },
    { id: "b", label: "B. THE PRODUCT (LEGAL NAME)", consPlain: "Linda wins something for once.", consBold: "She will not know how to react. Nobody will.", base: 22 },
    { id: "c", label: "C. VERTICALITY ONE", consPlain: "Floor 16 files a trademark objection within the hour.", consBold: "First contact with the rival becomes paperwork.", base: 19 },
    { id: "d", label: "D. GARY", consPlain: "The product is named Gary. Max will call it 'my guy Gary' on air.", consBold: "Gary becomes a character.", base: 28 },
  ] as VoteOption[],
};

export const STANDINGS: { dept: DeptId; note: string; pts: number }[] = [
  { dept: "sec", note: "2-for-2 on predictions", pts: 340 },
  { dept: "merch", note: "one sellout, one eulogy", pts: 315 },
  { dept: "intern", note: "1M views, 1 dead appliance", pts: 290 },
  { dept: "marketing", note: "engagement up, trust down", pts: 255 },
  { dept: "legal", note: "1 approval issued (historic)", pts: 240 },
  { dept: "trading", note: "budget: $0.00", pts: 120 },
];

export const TICKER_ITEMS: { t?: string; text: string }[] = [
  { t: "09:22", text: "MEMO 41 FILED — READ IT" },
  { text: "HR OPENS FILE #0041 RE: BADGE COUNT" },
  { t: "BUDGET:", text: "$0.00 — “A DONATION TO OUR FUTURE”" },
  { text: "MERCH DROP THURSDAY 18:00 — THE BAR IS THE SHIRT" },
  { t: "THREAT LEVEL:", text: "4 AND HOLDING" },
  { text: "FOOTSTEPS ON 16 NOW IN A PATTERN — PATTERNS ARE PEOPLE" },
  { text: "THE PRODUCT REMAINS UNNAMED — VOTE CLOSES FRIDAY 17:00" },
  { t: "LEGAL:", text: "13 IDEAS REVIEWED, 1 APPROVED (A BOX)" },
  { text: "COFFEE MACHINE SERVICES FRIDAY — DRESS CODE: RESPECTFUL" },
  { text: "AN EIGHTH FILE EXISTS" },
];

export const TIME_BLOCKS: [number, string][] = [
  [0, "NIGHT SHIFT — SERVER ROOM"],
  [9, "09:15 — THE STANDUP"],
  [10, "WORK BLOCK — AMBIENT CHAOS"],
  [13, "13:00 — THE CLIENT"],
  [14, "INCIDENT WINDOW"],
  [17, "17:15 — CLOSE OF BUSINESS"],
  [18, "EVENING — THE FLOOR SETTLES"],
  [21, "AFTER HOURS — ROOFTOP"],
];
