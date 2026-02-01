"use client";

import { useEffect, useRef, useState, useCallback, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ========== AUDIO ENGINE ========== */
// D Pentatonic across two registers — impossible to sound bad
const NOTES = [
  // Lower (D4–B4)
  293.66, 329.63, 369.99, 440.00, 493.88,
  // Higher (D5–B5)
  587.33, 659.25, 739.99, 880.00, 987.77,
];

type Instrument = "harp" | "kalimba" | "theremin";

let currentInstrument: Instrument = "harp";

function getAudioCtx() {
  return new (window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext })
      .webkitAudioContext)();
}

function playNote(freq: number) {
  try {
    const ctx = getAudioCtx();
    const t = ctx.currentTime;

    switch (currentInstrument) {
      case "harp": {
        const harmonics = [
          { ratio: 1, gain: 0.16 },
          { ratio: 2, gain: 0.06 },
          { ratio: 3, gain: 0.025 },
          { ratio: 4, gain: 0.01 },
        ];
        const master = ctx.createGain();
        master.gain.setValueAtTime(1, t);
        master.connect(ctx.destination);
        harmonics.forEach(({ ratio, gain: g }) => {
          const osc = ctx.createOscillator();
          const env = ctx.createGain();
          osc.type = "triangle";
          osc.frequency.value = freq * ratio;
          env.gain.setValueAtTime(0, t);
          env.gain.linearRampToValueAtTime(g, t + 0.003);
          env.gain.exponentialRampToValueAtTime(g * 0.25, t + 0.12);
          env.gain.exponentialRampToValueAtTime(0.0001, t + 1.8);
          osc.connect(env);
          env.connect(master);
          osc.start(t);
          osc.stop(t + 2.0);
        });
        setTimeout(() => ctx.close(), 2300);
        break;
      }
      case "kalimba": {
        // Metallic pluck — sharp attack, long resonant decay, hollow body
        const master = ctx.createGain();
        master.gain.setValueAtTime(0.22, t);
        master.gain.exponentialRampToValueAtTime(0.06, t + 0.08);
        master.gain.exponentialRampToValueAtTime(0.0001, t + 2.5);
        master.connect(ctx.destination);
        // Fundamental + slightly detuned "tine" resonance
        [
          { f: freq, g: 0.18, type: "sine" as OscillatorType },
          { f: freq * 1.0015, g: 0.12, type: "triangle" as OscillatorType },
          { f: freq * 3, g: 0.04, type: "sine" as OscillatorType },
          { f: freq * 5.4, g: 0.015, type: "sine" as OscillatorType },
        ].forEach(({ f, g, type }) => {
          const osc = ctx.createOscillator();
          const env = ctx.createGain();
          osc.type = type;
          osc.frequency.value = f;
          env.gain.setValueAtTime(g, t);
          env.gain.exponentialRampToValueAtTime(0.0001, t + 2.2);
          osc.connect(env);
          env.connect(master);
          osc.start(t);
          osc.stop(t + 2.5);
        });
        setTimeout(() => ctx.close(), 2800);
        break;
      }
      case "theremin": {
        // Wobbly sine with portamento, slow attack, eerie vibrato
        const master = ctx.createGain();
        master.gain.setValueAtTime(0, t);
        master.gain.linearRampToValueAtTime(0.14, t + 0.3);
        master.gain.setValueAtTime(0.14, t + 1.8);
        master.gain.exponentialRampToValueAtTime(0.0001, t + 3.5);
        master.connect(ctx.destination);
        const osc = ctx.createOscillator();
        osc.type = "sine";
        // Slide in from slightly below
        osc.frequency.setValueAtTime(freq * 0.92, t);
        osc.frequency.exponentialRampToValueAtTime(freq, t + 0.25);
        // Wide vibrato
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.frequency.value = 6.2;
        lfoGain.gain.value = freq * 0.018;
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        lfo.start(t);
        lfo.stop(t + 3.7);
        osc.connect(master);
        osc.start(t);
        osc.stop(t + 3.7);
        // Quiet octave above for body
        const oct = ctx.createOscillator();
        const octGain = ctx.createGain();
        oct.type = "sine";
        oct.frequency.value = freq * 2.001;
        octGain.gain.setValueAtTime(0, t);
        octGain.gain.linearRampToValueAtTime(0.03, t + 0.4);
        octGain.gain.exponentialRampToValueAtTime(0.0001, t + 3.2);
        oct.connect(octGain);
        octGain.connect(ctx.destination);
        oct.start(t);
        oct.stop(t + 3.5);
        setTimeout(() => ctx.close(), 4000);
        break;
      }
    }
  } catch {
    /* no audio */
  }
}

let arpeggioStart = 0;

function playArpeggio() {
  const len = 5;
  const notes = [];
  for (let i = 0; i < len; i++) {
    notes.push(NOTES[(arpeggioStart + i) % NOTES.length]);
  }
  arpeggioStart = (arpeggioStart + len) % NOTES.length;
  notes.forEach((freq, i) => {
    setTimeout(() => playNote(freq), i * 90);
  });
}

/* ========== RIPPLE ========== */
interface Ripple {
  id: number;
  x: number;
  y: number;
  size: number;
}
let rippleId = 0;

/* ========== RICH CONTENT FOR EXPANDABLE WORDS ========== */

function PoemsContent() {
  const poems = [
    {
      title: "I Stay Up Late",
      stanzas: [
        "I stay up late to\nstrum the air like a ukulele.",
        "Pause,\nsit down, open my laptop,\nclick start again, stop,\nturn on airplane mode.",
        "To stay up late is popping an acne,\npanting on a treadmill with sweaty handles,\na stomach ache pill, or\na stale popcorn package opened too long.",
        "Hope here:\nfizzy,\nwith mint and lime,\nthick and quiet as a wooden coat hanger.",
        "I yawn. The Dream must be close now,\nits grandmother still dancing in the plaza downstairs.",
        "My alarm clock rings,\nimpatient like a hungry baby,\nI pick up the milk bottle and plug it back in,\nsnoozed.",
        "The soft popcorn and kernels roll in my stomach\nlike air\nin a steam locomotive.",
      ],
    },
    {
      title: "Grandmother's House",
      stanzas: [
        "The lamppost stared back.\nHollow yellow eye,\nnails stretching out\nlost puppy posters and\nadvertisement flyers.",
        "Grandmother's tomato soup climbed out\nfrom the kitchen, steaming. It had crazy eyes,\nred and swollen, what you would get\nif you let a wild cat scratch you.",
        "The past, throbbing & colorless, melts\ninto the two lips of a house, as you\nbike over\nthe bodies of loved ones like pavements.",
        "Don't look back, just keep pedaling.\nFlip a page of a dusty photo album\nheavy with Grandmother's veiny hands\nand the sound of sand",
        "whooshing past your ears as you drift\nunder the trees that surrender their arms.\nToday, the flyer of the retirement house\ndisappeared, and the soup tasted\nlike old magazine paper.",
      ],
    },
    {
      title: "Flight to Boston",
      stanzas: [
        "Thumbs tapping on a thick book, a mechanic gazed forward,\ntimid boots growing out from his cargo pants like branches.\nA man in red packed his heavy accent in an extra carry-on,\ntired sighs exhaling like palms trying to grab the air. He is\ndrowning in another place, water climbing up his white beard,\nthirsty for love. The engine murmured, hot as the soft mewl\nof a newborn, the hairs purred like the neighborhood stray.",
        "I took out the safety booklet from its lodge. It looked like\nthe Spiderman comic I read hanging upside down from\nthe round handle of the fuzzy orange couch when I was still\na child. On this plastic pamphlet, a boy raised both hands\nas two severed forearms clung onto his yellow life jacket.\nHe looked more unsure than I did when I saw her smile\nas she said planes were most likely to crash during take-off,\nstatistically.",
        "That was the last school trip, our goodbyes\nsizzled in pots and pans like lazy sesame oil, bruising\ntomatoes and lacing eggs. If mom were here, she'd just say:\nWhat are friendships anyway? Can't toss it in soups\nlike chicken legs. For a second, sadness broke its shell and grew\nfeathers. I cooked and ate the whole thing, feathers & all.",
        "The mechanic opened a little manual with tiny words packed\nneatly into righteous rectangles— nothing else moved except\nhis masseter muscles, mapping the interiors of the cars he fixed.\nAs the sunlight jumped from the window onto the back of the seat,\nthe airplane rose like blue oyster mushrooms into the clear sky.",
      ],
    },
  ];
  const [active, setActive] = useState(0);
  return (
    <div className="text-center">
      <div className="flex flex-wrap justify-center gap-3 mb-8">
        {poems.map((p, i) => (
          <button
            key={p.title}
            onClick={(e) => { e.stopPropagation(); setActive(i); }}
            className="text-xs px-3 py-1.5 rounded-full transition-all duration-200"
            style={{
              border: "1px solid var(--border)",
              background: i === active ? "var(--accent)" : "transparent",
              color: i === active ? "var(--bg)" : "var(--fg-muted)",
            }}
          >
            {p.title}
          </button>
        ))}
      </div>
      <div className="space-y-4 text-left">
        {poems[active].stanzas.map((s, i) => (
          <p key={i} className="leading-relaxed whitespace-pre-line text-sm" style={{ color: "var(--fg-muted)" }}>
            {s}
          </p>
        ))}
      </div>
    </div>
  );
}

function AestheticsContent() {
  const movies = [
    "The Tale of the Princess Kaguya",
    "Little Miss Sunshine",
    "Eternal Sunshine of the Spotless Mind",
  ];
  const songs = [
    { title: "Blackbird", artist: "The Beatles" },
    { title: "Evergreen", artist: "YEBBA" },
    { title: "I'm Like A Bird", artist: "Nelly Furtado" },
    { title: "Ingrid (Live to Tape)", artist: "Jack Van Cleaf" },
    { title: "My Fun", artist: "Suki Waterhouse" },
    { title: "Like Gold", artist: "Vance Joy" },
    { title: "The King", artist: "Sarah Kinsley" },
    { title: "Night Shift", artist: "Lucy Dacus" },
    { title: "mirrored heart", artist: "FKA twigs" },
    { title: "\u884C\u9053\u6811", artist: "\u6797\u6D77" },
    { title: "Cert-Volant", artist: "Bruno Coulais" },
    { title: "Walk Like an Egyptian", artist: "The Bangles" },
    { title: "Why Can't We Be Friends", artist: "War" },
    { title: "Vienna", artist: "Billy Joel" },
    { title: "July", artist: "Noah Cyrus / Leon Bridges" },
    { title: "Chasing Time", artist: "Rachel Croft" },
  ];
  return (
    <div className="text-left">
      <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "var(--fg-muted)" }}>Movies</p>
      <div className="space-y-1 mb-8">
        {movies.map((m) => (
          <p key={m} className="text-sm" style={{ fontFamily: "var(--font-serif)", color: "var(--fg)" }}>{m}</p>
        ))}
      </div>
      <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "var(--fg-muted)" }}>Songs</p>
      <div className="space-y-1">
        {songs.map((s) => (
          <div key={s.title} className="flex justify-between text-sm">
            <span className="italic" style={{ fontFamily: "var(--font-serif)", color: "var(--fg)" }}>{s.title}</span>
            <span className="ml-3 shrink-0" style={{ color: "var(--fg-muted)" }}>{s.artist}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FunFactsContent() {
  const facts = [
    "FABRIC PAIR\u201925",
    "I interviewed a space entrepreneur and a homicide detective",
    "I raised 75K at Founders Inc. (disbanded tho)",
    "I went to a 10-day silent meditation retreat in rural Baltimore on 5% phone battery",
    "160h on Amtrak and 1-month solo in Mexico City (at age 18)",
    "I accidentally joined and got kicked out of a cult",
  ];
  return (
    <ol className="text-left space-y-3">
      {facts.map((f, i) => (
        <li key={i} className="flex gap-3 text-sm leading-relaxed">
          <span style={{ color: "var(--accent)" }}>{i + 1}.</span>
          <span style={{ color: "var(--fg-muted)" }}>{f}</span>
        </li>
      ))}
    </ol>
  );
}

function HackathonsContent() {
  const hacks = [
    { name: "AWS Mission Autonomy", desc: "Autonomous multi-robot coordination for disaster response", link: "#aws-hackathon", won: true },
    { name: "Lightspeed Hackathon", desc: "Voice bot for blue-collar resume-filling", link: "#lightspeed-hackathon", won: true },
    { name: "HackGT", desc: "VR for Parkinson\u2019s Detection", link: "#hackgt", won: false },
  ];
  return (
    <div className="text-left">
      <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "var(--accent)" }}>Won</p>
      <div className="space-y-2 mb-6">
        {hacks.filter(h => h.won).map(h => (
          <div key={h.name}>
            <a href={h.link} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="text-sm font-medium underline underline-offset-4" style={{ fontFamily: "var(--font-serif)", color: "var(--fg)" }}>{h.name}</a>
            <p className="text-xs" style={{ color: "var(--fg-muted)" }}>{h.desc}</p>
          </div>
        ))}
      </div>
      <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "var(--fg-muted)" }}>Attended</p>
      <div className="space-y-2">
        {hacks.filter(h => !h.won).map(h => (
          <div key={h.name}>
            <a href={h.link} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="text-sm font-medium underline underline-offset-4" style={{ fontFamily: "var(--font-serif)", color: "var(--fg)" }}>{h.name}</a>
            <p className="text-xs" style={{ color: "var(--fg-muted)" }}>{h.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ResearchContent() {
  return (
    <div className="text-left space-y-4">
      <p className="text-sm leading-relaxed" style={{ color: "var(--fg-muted)" }}>
        I&apos;m studying &ldquo;Complex Intelligence: Natural, Artificial, and Collective&rdquo; at
        Vanderbilt &mdash; an independent major based on{" "}
        <a
          href="https://www.santafe.edu/research/themes/complex-intelligence-natural-artificial-and-collec"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2"
          style={{ color: "var(--accent)" }}
          onClick={(e) => e.stopPropagation()}
        >
          a theme from the Santa Fe Institute
        </a>.
      </p>
      <p className="text-sm leading-relaxed" style={{ color: "var(--fg-muted)" }}>
        I&apos;m researching nanotechnology and graphene.
      </p>
      <p className="text-sm leading-relaxed" style={{ color: "var(--fg-muted)" }}>
        I care deeply about mental resilience and creating systems that help people <strong>ask better questions</strong>.
      </p>
    </div>
  );
}

function ContactContent() {
  const links = [
    { label: "Email", href: "mailto:adele.l.shen@vanderbilt.edu", display: "adele.l.shen@vanderbilt.edu" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/adele-shen-604343226/", display: "linkedin.com/in/adele-shen-604343226" },
    { label: "Calendly", href: "https://calendly.com/adeleleyishen/connect", display: "calendly.com/adeleleyishen/connect" },
  ];
  return (
    <div className="space-y-5">
      <p className="text-sm" style={{ color: "var(--fg-muted)" }}>I like talking to new people.</p>
      {links.map((l) => (
        <div key={l.label} className="text-center">
          <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "var(--fg-muted)" }}>{l.label}</p>
          <a
            href={l.href}
            target={l.label === "Email" ? undefined : "_blank"}
            rel={l.label === "Email" ? undefined : "noopener noreferrer"}
            className="text-sm underline underline-offset-4"
            style={{ color: "var(--accent)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {l.display}
          </a>
        </div>
      ))}
    </div>
  );
}

/* ========== WORD DATA ========== */
interface WordItem {
  text: string;
  size: number;
  color: string;
  italic?: boolean;
  clickable?: boolean;
  content?: string;
  richContent?: React.ComponentType;
  link?: string;
  links?: { label: string; href: string }[];
  noteIdx: number;
  tags?: string[];
}

const COLORS = ["#C45D3E", "#6B7FA3", "#8B7AAD", "#7A9E8E", "#B07D82", "#5E8BA0", "#A3896B"];

const words: WordItem[] = [
  // --- Clickable with expandable cards ---
  {
    text: "CranberryTech",
    size: 28,
    color: COLORS[0],
    clickable: true,
    noteIdx: 0,
    tags: ["Intentional", "Focused", "Systems-minded"],
    content:
      "Building an AI-native title insurance company with my cofounder. We're reimagining the whole conveyor belt, not just making better gloves.",
    links: [{ label: "website", href: "#cranberrytech-website" }],
  },
  {
    text: "swarm intelligence",
    size: 24,
    color: COLORS[1],
    italic: true,
    clickable: true,
    noteIdx: 1,
    tags: ["Emergent", "Exploratory", "Analytical"],
    content:
      "Working on agent-based modeling for wildfire suppression at Vanderbilt with Dr. Gilligan. Basically figuring out how drones should explore vs. exploit.",
    links: [
      { label: "video", href: "#swarm-video" },
      { label: "slides", href: "#swarm-slides" },
    ],
  },
  {
    text: "failed startup",
    size: 20,
    color: COLORS[2],
    clickable: true,
    noteIdx: 2,
    tags: ["Unfinished", "Self-aware", "Reflective"],
    content:
      "VC-backed chess platform. Raised $70K pre-seed. Taught me everything about cofounder dynamics and when to walk away.",
    links: [{ label: "learn more", href: "#failed-startup" }],
  },
  {
    text: "TEDx",
    size: 22,
    color: COLORS[3],
    clickable: true,
    noteIdx: 3,
    tags: ["Curious", "Alive", "Whimsical"],
    content:
      "Gave a talk about courage and stepping outside your comfort zone. Was the only undergrad speaker.",
    links: [{ label: "watch", href: "#tedx-video" }],
  },
  {
    text: "music composing",
    size: 20,
    color: COLORS[4],
    clickable: true,
    noteIdx: 4,
    tags: ["Whimsical", "Experimental", "Reflective"],
    content:
      "NYT 'Coming of Age' winner. I write about the intersections I live in.",
  },
  {
    text: "nanotech research",
    size: 20,
    color: COLORS[5],
    clickable: true,
    noteIdx: 5,
    tags: ["Cerebral", "Frontier-oriented", "Analytical"],
    content:
      "Researching nanotechnology and graphene.",
    links: [
      { label: "powerpoint", href: "#nanotech-powerpoint" },
      { label: "photos", href: "#nanotech-photos" },
    ],
  },
  // --- Clickable with rich content ---
  {
    text: "poems I wrote",
    size: 19,
    color: COLORS[4],
    italic: true,
    clickable: true,
    noteIdx: 6,
    richContent: PoemsContent,
  },
  {
    text: "my aesthetics",
    size: 18,
    color: COLORS[6],
    clickable: true,
    noteIdx: 7,
    richContent: AestheticsContent,
  },
  {
    text: "research",
    size: 20,
    color: COLORS[1],
    italic: true,
    clickable: true,
    noteIdx: 0,
    richContent: ResearchContent,
  },
  {
    text: "fun facts",
    size: 19,
    color: COLORS[3],
    clickable: true,
    noteIdx: 1,
    richContent: FunFactsContent,
  },
  {
    text: "hackathons",
    size: 18,
    color: COLORS[0],
    clickable: true,
    noteIdx: 2,
    richContent: HackathonsContent,
  },
  {
    text: "reach out",
    size: 18,
    color: COLORS[5],
    clickable: true,
    noteIdx: 3,
    richContent: ContactContent,
  },
  {
    text: "GitHub",
    size: 16,
    color: COLORS[5],
    clickable: true,
    noteIdx: 4,
    link: "https://github.com/shenal-maker",
  },
  {
    text: "LinkedIn",
    size: 16,
    color: COLORS[6],
    clickable: true,
    noteIdx: 5,
    link: "https://www.linkedin.com/in/adele-shen-604343226/",
  },
  {
    text: "Admonymous",
    size: 16,
    color: COLORS[3],
    clickable: true,
    noteIdx: 6,
    link: "https://www.admonymous.co/adele-shen",
  },
  // --- Non-clickable ambient words ---
  { text: "Incandescent", size: 18, color: COLORS[0], italic: true, noteIdx: 0 },
  { text: "Cerebral", size: 17, color: COLORS[1], italic: true, noteIdx: 1 },
  { text: "Intentional", size: 16, color: COLORS[2], noteIdx: 2 },
  { text: "Liminal", size: 18, color: COLORS[3], italic: true, noteIdx: 3 },
  { text: "Unfinished", size: 15, color: COLORS[4], italic: true, noteIdx: 4 },
  { text: "Focused", size: 16, color: COLORS[5], noteIdx: 5 },
  { text: "Curious", size: 19, color: COLORS[6], italic: true, noteIdx: 6 },
  { text: "Analytical", size: 15, color: COLORS[0], noteIdx: 7 },
  { text: "Subversive", size: 17, color: COLORS[1], italic: true, noteIdx: 0 },
  { text: "Quietly ambitious", size: 16, color: COLORS[2], italic: true, noteIdx: 1 },
  { text: "Reflective", size: 17, color: COLORS[3], italic: true, noteIdx: 2 },
  { text: "Experimental", size: 16, color: COLORS[4], noteIdx: 3 },
  { text: "Composed", size: 15, color: COLORS[5], noteIdx: 4 },
  { text: "Optimistic", size: 17, color: COLORS[6], italic: true, noteIdx: 5 },
  { text: "Self-aware", size: 15, color: COLORS[0], noteIdx: 6 },
  { text: "Alive", size: 20, color: COLORS[1], italic: true, noteIdx: 7 },
  { text: "Whimsical", size: 17, color: COLORS[2], italic: true, noteIdx: 0 },
  { text: "Exploratory", size: 16, color: COLORS[3], italic: true, noteIdx: 1 },
  { text: "Emergent", size: 18, color: COLORS[4], italic: true, noteIdx: 2 },
  { text: "Systems-minded", size: 15, color: COLORS[5], noteIdx: 3 },
  { text: "Frontier-oriented", size: 14, color: COLORS[6], noteIdx: 4 },
];

/* ========== NON-OVERLAPPING PLACEMENT ========== */
interface Placed {
  x: number;
  y: number;
  w: number;
  h: number;
  angle: number;
  radius: number;
  speed: number;
}

function measureWord(text: string, fontSize: number) {
  return {
    w: text.length * fontSize * 0.55 + 20,
    h: fontSize * 1.4 + 8,
  };
}

function rectsOverlap(
  a: { x: number; y: number; w: number; h: number },
  b: { x: number; y: number; w: number; h: number },
  pad: number
) {
  return !(
    a.x - a.w / 2 - pad > b.x + b.w / 2 + pad ||
    a.x + a.w / 2 + pad < b.x - b.w / 2 - pad ||
    a.y - a.h / 2 - pad > b.y + b.h / 2 + pad ||
    a.y + a.h / 2 + pad < b.y - b.h / 2 - pad
  );
}

function placeWords(wordList: WordItem[], screenW: number, screenH: number): Placed[] {
  const cx = screenW / 2;
  const cy = screenH / 2;
  const placed: Placed[] = [];
  const nameRect = { x: cx, y: cy, w: 380, h: 160 };

  for (let i = 0; i < wordList.length; i++) {
    const word = wordList[i];
    const { w, h } = measureWord(word.text, word.size);

    let bestAngle = 0;
    let bestRadius = 0;
    let found = false;

    for (let r = 140; r < Math.min(screenW, screenH) * 0.48; r += 22) {
      const attempts = Math.max(12, Math.floor((r * Math.PI * 2) / 80));
      const startAngle = Math.random() * Math.PI * 2;

      for (let a = 0; a < attempts; a++) {
        const angle = startAngle + (a / attempts) * Math.PI * 2;
        const rx = r * (screenW / screenH) * 0.85;
        const ry = r * 0.9;
        const px = cx + Math.cos(angle) * rx;
        const py = cy + Math.sin(angle) * ry;
        const candidate = { x: px, y: py, w, h };

        if (
          px - w / 2 < 10 ||
          px + w / 2 > screenW - 10 ||
          py - h / 2 < 10 ||
          py + h / 2 > screenH - 10
        )
          continue;
        if (rectsOverlap(candidate, nameRect, 20)) continue;

        let overlaps = false;
        for (const p of placed) {
          if (rectsOverlap(candidate, { x: p.x, y: p.y, w: p.w, h: p.h }, 8)) {
            overlaps = true;
            break;
          }
        }

        if (!overlaps) {
          bestAngle = angle;
          bestRadius = r;
          found = true;
          break;
        }
      }
      if (found) break;
    }

    if (!found) {
      bestAngle = (i / wordList.length) * Math.PI * 2;
      bestRadius = 200 + i * 12;
    }

    const speed =
      (0.0008 + Math.random() * 0.0012) * (Math.random() > 0.5 ? 1 : -1);

    placed.push({
      x: cx + Math.cos(bestAngle) * bestRadius * (screenW / screenH) * 0.85,
      y: cy + Math.sin(bestAngle) * bestRadius * 0.9,
      w,
      h,
      angle: bestAngle,
      radius: bestRadius,
      speed,
    });
  }
  return placed;
}

/* ========== CLOUD BACKGROUND ========== */
function CloudBlobs() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[
        { x: "15%", y: "20%", w: 400, h: 250, color: "#D4DFEE", delay: 0 },
        { x: "60%", y: "10%", w: 350, h: 200, color: "#E8DDD4", delay: 2 },
        { x: "75%", y: "55%", w: 300, h: 220, color: "#C9CADF", delay: 4 },
        { x: "25%", y: "65%", w: 380, h: 240, color: "#E5E0D2", delay: 1 },
        { x: "50%", y: "40%", w: 500, h: 300, color: "#B8C8D8", delay: 3 },
        { x: "10%", y: "45%", w: 280, h: 180, color: "#DDD5E8", delay: 5 },
      ].map((blob, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            left: blob.x,
            top: blob.y,
            width: blob.w,
            height: blob.h,
            background: `radial-gradient(ellipse, ${blob.color}55, transparent 70%)`,
            filter: "blur(40px)",
            transform: "translate(-50%, -50%)",
          }}
          animate={{
            x: [0, 15, -10, 0],
            y: [0, -10, 12, 0],
            scale: [1, 1.05, 0.97, 1],
          }}
          transition={{
            duration: 20 + i * 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: blob.delay,
          }}
        />
      ))}
    </div>
  );
}

/* ========== MAIN ========== */
export function WordCloud() {
  const [placed, setPlaced] = useState<Placed[]>([]);
  const [dims, setDims] = useState({ w: 0, h: 0 });
  const [expanded, setExpanded] = useState<number | null>(null);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [instrument, setInstrument] = useState<Instrument>("harp");
  const [showInstruments, setShowInstruments] = useState(false);
  const animRef = useRef<number>(0);
  const draggingRef = useRef<number | null>(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const didDragRef = useRef(false);

  useEffect(() => {
    document.body.classList.add("pond-page");
    return () => document.body.classList.remove("pond-page");
  }, []);

  useEffect(() => {
    const layout = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      setDims({ w, h });
      setPlaced(placeWords(words, w, h));
      setExpanded(null);
    };
    layout();
    window.addEventListener("resize", layout);
    return () => window.removeEventListener("resize", layout);
  }, []);

  useEffect(() => {
    if (placed.length === 0 || dims.w === 0) return;
    const cx = dims.w / 2;
    const cy = dims.h / 2;
    const animate = () => {
      setPlaced((prev) =>
        prev.map((p, i) => {
          if (draggingRef.current === i) return p;
          const newAngle = p.angle + p.speed;
          const rx = p.radius * (dims.w / dims.h) * 0.85;
          const ry = p.radius * 0.9;
          return {
            ...p,
            angle: newAngle,
            x: cx + Math.cos(newAngle) * rx,
            y: cy + Math.sin(newAngle) * ry,
          };
        })
      );
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [dims, placed.length]);

  const spawnRipple = useCallback((x: number, y: number) => {
    const id = ++rippleId;
    const newRipples = [120, 200, 300].map((s, i) => ({ id: id + i, x, y, size: s }));
    setRipples((prev) => [...prev, ...newRipples]);
    setTimeout(() => {
      setRipples((prev) =>
        prev.filter((r) => !newRipples.find((nr) => nr.id === r.id))
      );
    }, 1800);
  }, []);

  const handlePointerDown = useCallback(
    (index: number, e: React.PointerEvent) => {
      draggingRef.current = index;
      didDragRef.current = false;
      const pos = placed[index];
      dragOffsetRef.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [placed]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (draggingRef.current === null) return;
      didDragRef.current = true;
      const i = draggingRef.current;
      const nx = e.clientX - dragOffsetRef.current.x;
      const ny = e.clientY - dragOffsetRef.current.y;
      setPlaced((prev) =>
        prev.map((p, idx) =>
          idx === i
            ? {
                ...p,
                x: nx,
                y: ny,
                angle: Math.atan2(ny - dims.h / 2, (nx - dims.w / 2) / ((dims.w / dims.h) * 0.85)),
                radius: Math.sqrt(
                  ((nx - dims.w / 2) / ((dims.w / dims.h) * 0.85)) ** 2 +
                  ((ny - dims.h / 2) / 0.9) ** 2
                ),
              }
            : p
        )
      );
    },
    [dims]
  );

  const handlePointerUp = useCallback(() => {
    draggingRef.current = null;
  }, []);

  const handleClick = useCallback(
    (index: number, word: WordItem, posX: number, posY: number) => {
      if (didDragRef.current) { didDragRef.current = false; return; }
      spawnRipple(posX, posY);

      // External link (no content to expand)
      if (word.link && !word.content && !word.richContent && !word.links) {
        playArpeggio();
        setTimeout(() => window.open(word.link, "_blank"), 400);
        return;
      }

      // Expandable card (simple content, rich content, or links)
      if (word.clickable && (word.content || word.richContent || word.links)) {
        playArpeggio();
        setExpanded(expanded === index ? null : index);
      } else {
        playNote(NOTES[word.noteIdx % NOTES.length]);
      }
    },
    [expanded, spawnRipple]
  );

  const handleHover = useCallback((word: WordItem) => {
    playNote(NOTES[word.noteIdx % NOTES.length]);
  }, []);

  const relatedIndices =
    expanded !== null && words[expanded]?.tags
      ? words[expanded].tags!
          .map((tag) => words.findIndex((w) => w.text === tag))
          .filter((idx) => idx !== -1)
      : [];

  const isExpanded = expanded !== null;
  const expandedWord = isExpanded ? words[expanded] : null;
  const hasRichContent = expandedWord?.richContent;

  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "var(--bg)" }}>
      <CloudBlobs />

      {/* Ripples */}
      {ripples.map((r) => (
        <div
          key={r.id}
          className="ripple-ring"
          style={{ left: r.x, top: r.y, width: r.size, height: r.size }}
        />
      ))}

      {/* Center name — fades when expanded */}
      <AnimatePresence>
        {!isExpanded && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.4 } }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="text-center"
            >
              <h1
                className="text-5xl sm:text-7xl lg:text-8xl leading-none tracking-tight"
                style={{ fontFamily: "var(--font-serif)", color: "var(--fg)" }}
              >
                Leyi Shen
              </h1>
              <p
                className="mt-2 text-3xl sm:text-5xl lg:text-6xl italic"
                style={{ fontFamily: "var(--font-serif)", color: "var(--accent)" }}
              >
                Adele
              </p>
              <p
                className="mt-4 text-xs tracking-widest uppercase mb-3"
                style={{ color: "var(--fg-muted)", letterSpacing: "0.2em" }}
              >
                click the words &middot;{" "}
                <button
                  className="pointer-events-auto underline underline-offset-2 transition-colors duration-200 uppercase"
                  style={{ color: "var(--accent)", background: "none", border: "none", letterSpacing: "0.2em", fontSize: "inherit" }}
                  onClick={() => setShowInstruments((v) => !v)}
                >
                  compose
                </button>
              </p>
              <AnimatePresence>
                {showInstruments && (
                  <motion.div
                    className="flex gap-2 justify-center pointer-events-auto"
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                  >
                    {(["harp", "kalimba", "theremin"] as Instrument[]).map((inst) => (
                      <button
                        key={inst}
                        onClick={() => { setInstrument(inst); currentInstrument = inst; playNote(NOTES[4]); }}
                        className="text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider transition-all duration-200"
                        style={{
                          border: "1px solid var(--border)",
                          background: instrument === inst ? "var(--accent)" : "transparent",
                          color: instrument === inst ? "var(--bg)" : "var(--fg-muted)",
                        }}
                      >
                        {inst}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded center content */}
      <AnimatePresence>
        {isExpanded && expandedWord && (
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center z-30 pointer-events-auto px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="absolute inset-0" onClick={() => setExpanded(null)} />
            <motion.div
              className={`relative text-center z-10 ${hasRichContent ? "max-w-xl w-full max-h-[70vh] overflow-y-auto px-4" : "max-w-lg"}`}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2
                className="text-4xl sm:text-6xl mb-6"
                style={{
                  fontFamily: "var(--font-serif)",
                  color: expandedWord.color,
                  fontStyle: expandedWord.italic ? "italic" : "normal",
                }}
              >
                {expandedWord.text}
              </h2>

              {/* Simple string content */}
              {expandedWord.content && (
                <p
                  className="text-base sm:text-lg leading-relaxed mb-6"
                  style={{ color: "var(--fg-muted)" }}
                >
                  {expandedWord.content}
                </p>
              )}

              {/* Rich content */}
              {expandedWord.richContent && (
                <div className="mb-6">
                  <expandedWord.richContent />
                </div>
              )}

              {/* Hyperlinks */}
              {expandedWord.links && expandedWord.links.length > 0 && (
                <div className="flex flex-wrap justify-center gap-4 mb-4">
                  {expandedWord.links.map((l) => (
                    <a
                      key={l.label}
                      href={l.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm underline underline-offset-4"
                      style={{ color: "var(--accent)" }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {l.label} &rarr;
                    </a>
                  ))}
                </div>
              )}

              {/* Related ambient words */}
              {relatedIndices.length > 0 && (
                <div className="flex flex-wrap justify-center gap-4 mb-4">
                  {relatedIndices.map((ri) => (
                    <motion.span
                      key={words[ri].text}
                      className="text-lg sm:text-xl"
                      style={{
                        fontFamily: words[ri].italic ? "var(--font-serif)" : "var(--font-sans)",
                        fontStyle: words[ri].italic ? "italic" : "normal",
                        color: words[ri].color,
                        opacity: 0.7,
                      }}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 0.7, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      {words[ri].text}
                    </motion.span>
                  ))}
                </div>
              )}

              <button
                className="mt-4 text-sm tracking-wider uppercase"
                style={{ color: "var(--fg-muted)", background: "none", border: "none" }}
                onClick={() => setExpanded(null)}
              >
                &larr; back to pond
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating words */}
      {placed.map((pos, i) => {
        const word = words[i];
        if (!word) return null;

        const isRelated = relatedIndices.includes(i);
        const isThis = expanded === i;

        let targetX = pos.x;
        let targetY = pos.y;
        let targetOpacity = 1;
        let targetScale = 1;

        if (isExpanded) {
          if (isThis) {
            targetOpacity = 0;
            targetScale = 0.5;
          } else if (isRelated) {
            targetOpacity = 0;
          } else {
            const angle = Math.atan2(pos.y - dims.h / 2, pos.x - dims.w / 2);
            targetX = pos.x + Math.cos(angle) * 200;
            targetY = pos.y + Math.sin(angle) * 150;
            targetOpacity = 0.15;
          }
        }

        return (
          <motion.div
            key={word.text}
            className="absolute z-20"
            animate={{
              left: targetX,
              top: targetY,
              opacity: targetOpacity,
              scale: targetScale,
            }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            style={{ transform: "translate(-50%, -50%)" }}
            initial={{ opacity: 0 }}
          >
            <motion.button
              onClick={() => handleClick(i, word, pos.x, pos.y)}
              onPointerDown={(e) => handlePointerDown(i, e)}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onMouseEnter={() => handleHover(word)}
              className="relative whitespace-nowrap"
              style={{
                fontFamily: word.italic ? "var(--font-serif)" : "var(--font-sans)",
                fontStyle: word.italic ? "italic" : "normal",
                fontSize: word.size,
                color: word.color,
                cursor: word.clickable ? "pointer" : "grab",
                touchAction: "none",
                opacity: word.clickable ? 1 : 0.6,
                background: "none",
                border: "none",
                padding: "4px 8px",
              }}
              whileHover={{
                scale: 1.15,
                opacity: 1,
                textShadow: `0 0 20px ${word.color}66`,
              }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: word.clickable ? 1 : 0.6 }}
              transition={{ delay: i * 0.03, duration: 0.5 }}
            >
              {word.text}
              {word.clickable && (
                <span
                  className="absolute -bottom-0.5 left-2 right-2 h-px"
                  style={{ background: `${word.color}66` }}
                />
              )}
            </motion.button>
          </motion.div>
        );
      })}

      {/* Sound hint */}
      <div
        className="absolute bottom-5 right-6 text-xs z-10"
        style={{ color: "var(--fg-muted)", opacity: 0.4 }}
      >
        sound on &middot; {instrument}
      </div>
    </div>
  );
}
