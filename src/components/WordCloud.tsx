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

type Instrument = "harp" | "marimba" | "theremin";

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
      case "marimba": {
        // Warm wooden marimba strike — percussive with rich harmonics
        const master = ctx.createGain();
        master.gain.setValueAtTime(0.35, t);
        master.gain.exponentialRampToValueAtTime(0.15, t + 0.08);
        master.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);
        master.connect(ctx.destination);
        
        // Warm woody tone: fundamental + octave + slight detuning
        [
          { f: freq * 0.5, g: 0.20, type: "sine" as OscillatorType },
          { f: freq, g: 0.12, type: "sine" as OscillatorType },
          { f: freq * 0.49, g: 0.10, type: "triangle" as OscillatorType },
          { f: freq * 1.5, g: 0.06, type: "sine" as OscillatorType },
        ].forEach(({ f, g, type }) => {
          const osc = ctx.createOscillator();
          const env = ctx.createGain();
          osc.type = type;
          osc.frequency.value = f;
          env.gain.setValueAtTime(g, t);
          env.gain.exponentialRampToValueAtTime(0.0001, t + 1.0);
          osc.connect(env);
          env.connect(master);
          osc.start(t);
          osc.stop(t + 1.2);
        });
        setTimeout(() => ctx.close(), 1500);
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

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function playArpeggio() {
  const len = 5;
  const shuffledNotes = shuffleArray(NOTES);
  const notes = shuffledNotes.slice(0, len);
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
    { name: "AWS Mission Autonomy", desc: "Autonomous multi-robot coordination for disaster response", link: "https://drive.google.com/file/d/12nV14O641DzgYW2PmH9pJ1sL3n7uomGm/view?usp=sharing", won: true },
    { name: "Lightspeed hackathon", desc: "resume voice-agent for blue-collar jobs", won: true },
    { name: "HackGT", desc: "VR for Parkinson's", won: false },
  ];
  return (
    <div className="text-left">
      <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "var(--accent)" }}>Won</p>
      <div className="space-y-2 mb-6">
        {hacks.filter(h => h.won).map(h => (
          <div key={h.name}>
            {h.link ? (
              <a href={h.link} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="text-sm font-medium underline underline-offset-4" style={{ fontFamily: "var(--font-serif)", color: "var(--fg)" }}>{h.name}</a>
            ) : (
              <p className="text-sm font-medium" style={{ fontFamily: "var(--font-serif)", color: "var(--fg)" }}>{h.name}</p>
            )}
            <p className="text-xs" style={{ color: "var(--fg-muted)" }}>{h.desc}</p>
          </div>
        ))}
      </div>
      <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "var(--fg-muted)" }}>Attended</p>
      <div className="space-y-2">
        {hacks.filter(h => !h.won).map(h => (
          <div key={h.name}>
            {h.link ? (
              <a href={h.link} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="text-sm font-medium underline underline-offset-4" style={{ fontFamily: "var(--font-serif)", color: "var(--fg)" }}>{h.name}</a>
            ) : (
              <p className="text-sm font-medium" style={{ fontFamily: "var(--font-serif)", color: "var(--fg)" }}>{h.name}</p>
            )}
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

function MusicComposingContent() {
  return (
    <p className="text-sm leading-relaxed" style={{ color: "var(--fg-muted)" }}>
      NYT 'Coming of Age'{" "}
      <a
        href="https://www.nytimes.com/2022/01/05/learning/what-its-like-to-be-a-teenager-now-the-winners-of-our-coming-of-age-in-2021-contest.html"
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-2"
        style={{ color: "var(--accent)" }}
        onClick={(e) => e.stopPropagation()}
      >
        winner
      </a>
      . I write about the intersections I live in.
    </p>
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
    text: "stealth startup",
    size: 22,
    color: COLORS[0],
    clickable: true,
    noteIdx: 0,
    tags: ["Intentional", "Focused", "Systems-minded"],
    content:
      "Building an AI-native insurance company with my cofounder. We're reimagining the whole conveyor belt, not just making better gloves.",
    links: [{ label: "schedule a meeting", href: "https://calendly.com/adeleleyishen/connect" }],
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
      { label: "slides", href: "https://drive.google.com/file/d/1kv0N_m9XRw2TQB0HjMckFOkT5v5R29B5/view?usp=sharing" },
    ],
  },
  {
    text: "failed startup",
    size: 20,
    color: COLORS[2],
    clickable: true,
    noteIdx: 2,
    tags: ["Self-aware", "Reflective"],
    content:
      "VC-backed chess platform. Raised $70K pre-seed. Taught me everything about cofounder dynamics and when to walk away.",
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
    links: [
      { label: "Mind Games and Melodies", href: "https://www.youtube.com/watch?v=kYTRQUEYhn0" },
      { label: "A Composer's Guide to Rescaling your Comfort Zone", href: "https://www.youtube.com/watch?v=tdVN7vrWu54" },
    ],
  },
  {
    text: "music composing",
    size: 20,
    color: COLORS[4],
    clickable: true,
    noteIdx: 4,
    tags: ["Whimsical", "Experimental", "Reflective"],
    richContent: MusicComposingContent,
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
      { label: "report", href: "https://drive.google.com/file/d/1nrCKIwKDq6Z71lMwoAMeUX9YG1779IJV/view?usp=sharing" },
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
    text: "my major",
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
  baseX: number;
  baseY: number;
  driftAngle: number;
  driftSpeed: number;
  driftRadius: number;
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

  // Sort words by size (larger first) to place them first in better positions
  const indexed = wordList.map((w, i) => ({ word: w, idx: i }));
  indexed.sort((a, b) => b.word.size - a.word.size);

  for (let idx = 0; idx < indexed.length; idx++) {
    const { word } = indexed[idx];
    const { w, h } = measureWord(word.text, word.size);

    let bestX = 0;
    let bestY = 0;
    let bestRadius = 0;
    let found = false;

    // Try radii from inner to outer
    for (let r = 140; r < Math.min(screenW, screenH) * 0.48; r += 22) {
      const attempts = Math.max(12, Math.floor((r * Math.PI * 2) / 80));
      
      // Generate candidate positions evenly spaced around a circle
      for (let a = 0; a < attempts; a++) {
        const angle = (a / attempts) * Math.PI * 2;
        const rx = r * (screenW / screenH) * 0.85;
        const ry = r * 0.9;
        const px = cx + Math.cos(angle) * rx;
        const py = cy + Math.sin(angle) * ry;
        const candidate = { x: px, y: py, w, h };

        // Check bounds
        if (
          px - w / 2 < 10 ||
          px + w / 2 > screenW - 10 ||
          py - h / 2 < 10 ||
          py + h / 2 > screenH - 10
        )
          continue;

        // Check name overlap
        if (rectsOverlap(candidate, nameRect, 20)) continue;

        // Check collision with all previously placed words
        let overlaps = false;
        for (const p of placed) {
          if (rectsOverlap(candidate, { x: p.baseX, y: p.baseY, w: p.w, h: p.h }, 12)) {
            overlaps = true;
            break;
          }
        }

        if (!overlaps) {
          bestX = px;
          bestY = py;
          bestRadius = r;
          found = true;
          break;
        }
      }
      if (found) break;
    }

    if (!found) {
      const angle = (idx / indexed.length) * Math.PI * 2;
      const r = 200 + idx * 12;
      const rx = r * (screenW / screenH) * 0.85;
      const ry = r * 0.9;
      bestX = cx + Math.cos(angle) * rx;
      bestY = cy + Math.sin(angle) * ry;
    }

    // Each word gets its own drift parameters
    const driftSpeed = 0.0012 + Math.random() * 0.0008;
    const driftRadius = 20 + Math.random() * 15;
    const driftAngle = Math.random() * Math.PI * 2;

    placed.push({
      x: bestX,
      y: bestY,
      w,
      h,
      baseX: bestX,
      baseY: bestY,
      driftAngle,
      driftSpeed,
      driftRadius,
    });
  }

  // Reorder back to original word list order
  const result: Placed[] = new Array(placed.length);
  for (let i = 0; i < indexed.length; i++) {
    result[indexed[i].idx] = placed[i];
  }

  return result;
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

    // On mobile, use CSS animations for better performance
    const isMobile = dims.w < 768;
    
    if (isMobile) {
      // Mobile: don't animate with JS
      return;
    }

    const animate = () => {
      setPlaced((prev) =>
        prev.map((p) => {
          const newDriftAngle = p.driftAngle + p.driftSpeed;
          return {
            ...p,
            driftAngle: newDriftAngle,
            x: p.baseX + Math.cos(newDriftAngle) * p.driftRadius,
            y: p.baseY + Math.sin(newDriftAngle) * p.driftRadius,
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

  const handlePointerDown = useCallback(() => {
    // No dragging anymore
  }, []);

  const handlePointerMove = useCallback(() => {
    // No dragging anymore
  }, []);

  const handlePointerUp = useCallback(() => {
    // No dragging anymore
  }, []);

  const handleClick = useCallback(
    (index: number, word: WordItem, posX: number, posY: number) => {
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
                    {(["harp", "marimba", "theremin"] as Instrument[]).map((inst) => (
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
              onMouseEnter={() => handleHover(word)}
              className="relative whitespace-nowrap"
              style={{
                fontFamily: word.italic ? "var(--font-serif)" : "var(--font-sans)",
                fontStyle: word.italic ? "italic" : "normal",
                fontSize: word.size,
                color: word.color,
                cursor: word.clickable ? "pointer" : "default",
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
