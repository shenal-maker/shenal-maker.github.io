"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ========== HARP AUDIO ENGINE ========== */
// Epitaph of Seikilos melody
// D4 A4 A4 F#4 G4 A4 G4 F#4 G4 A4 G4 F#4 E4 D4 E4 C4 B3 A3
const SEIKILOS = [
  293.66, 440.0, 440.0, 369.99, 392.0, 440.0, 392.0, 369.99,
  392.0, 440.0, 392.0, 369.99, 329.63, 293.66, 329.63, 261.63,
  246.94, 220.0,
];

function playHarpNote(freq: number) {
  try {
    const ctx = new (window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext)();
    const t = ctx.currentTime;
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
  } catch {
    /* no audio */
  }
}

// Arpeggio: play 6 consecutive notes from the Seikilos melody
let arpeggioStart = 0;

function playArpeggio() {
  const len = 6;
  const notes = [];
  for (let i = 0; i < len; i++) {
    notes.push(SEIKILOS[(arpeggioStart + i) % SEIKILOS.length]);
  }
  arpeggioStart = (arpeggioStart + len) % SEIKILOS.length;

  notes.forEach((freq, i) => {
    setTimeout(() => {
      try {
        const ctx = new (window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext)();
        const t = ctx.currentTime;
        const harmonics = [
          { ratio: 1, gain: 0.12 },
          { ratio: 2, gain: 0.04 },
          { ratio: 3, gain: 0.015 },
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
          env.gain.exponentialRampToValueAtTime(g * 0.15, t + 0.2);
          env.gain.exponentialRampToValueAtTime(0.0001, t + 1.5);
          osc.connect(env);
          env.connect(master);
          osc.start(t);
          osc.stop(t + 1.7);
        });
        setTimeout(() => ctx.close(), 2000);
      } catch {
        /* no audio */
      }
    }, i * 80);
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

/* ========== WORD DATA ========== */
interface WordItem {
  text: string;
  size: number;
  color: string;
  italic?: boolean;
  clickable?: boolean;
  content?: string;
  link?: string;
  noteIdx: number;
  tags?: string[];
}

const COLORS = ["#C45D3E", "#6B7FA3", "#8B7AAD", "#7A9E8E", "#B07D82", "#5E8BA0", "#A3896B"];

const words: WordItem[] = [
  {
    text: "CranberryTech",
    size: 28,
    color: COLORS[0],
    clickable: true,
    noteIdx: 0,
    tags: ["title insurance", "AI", "founder"],
    content:
      "The first AI-native title insurance company. We're not building better gloves for TSA officers — we're reimagining the entire conveyor belt. An AI insurer capturing the full value chain of a $17.1B industry.",
  },
  {
    text: "drone swarms",
    size: 24,
    color: COLORS[1],
    italic: true,
    clickable: true,
    noteIdx: 1,
    tags: ["wildfire", "exploration", "NetLogo"],
    content:
      "Agent-based modeling for autonomous wildfire suppression under Dr. Gilligan at Vanderbilt. The sweet spot isn't maximum drone coverage — it's finding the right balance between exploration and exploitation.",
  },
  {
    text: "Remote Chess",
    size: 20,
    color: COLORS[2],
    clickable: true,
    noteIdx: 2,
    tags: ["builder", "bet on myself"],
    content:
      "VC-backed chess platform. $70K pre-seed. Selected for PAIR UK (24 of 4,000+ applicants). Taught me everything about cofounder dynamics and when to pivot.",
  },
  {
    text: "TEDx",
    size: 22,
    color: COLORS[3],
    clickable: true,
    noteIdx: 3,
    tags: ["inquiry", "storyteller"],
    content:
      "Inquiry-based leadership: translating research on human decision-making into public narratives. The only undergraduate selected to speak.",
  },
  {
    text: "writing",
    size: 20,
    color: COLORS[4],
    clickable: true,
    noteIdx: 4,
    tags: ["storyteller", "home"],
    content:
      "NYT 'Coming of Age' winner. I write about the intersections I live in — startups, research, psychology, and why betting on yourself is the safest career move.",
  },
  {
    text: "GitHub",
    size: 16,
    color: COLORS[5],
    clickable: true,
    noteIdx: 5,
    link: "https://github.com/shenal-maker",
  },
  {
    text: "LinkedIn",
    size: 16,
    color: COLORS[6],
    clickable: true,
    noteIdx: 6,
    link: "https://linkedin.com/in/",
  },
  // Non-clickable — evocative & factual
  { text: "emergence", size: 22, color: COLORS[1], italic: true, noteIdx: 7 },
  { text: "wildfire", size: 18, color: COLORS[0], italic: true, noteIdx: 0 },
  { text: "collisions", size: 20, color: COLORS[4], italic: true, noteIdx: 1 },
  { text: "coordination", size: 17, color: COLORS[2], noteIdx: 2 },
  { text: "Vanderbilt", size: 18, color: COLORS[3], noteIdx: 3 },
  { text: "AI", size: 26, color: COLORS[5], noteIdx: 4 },
  { text: "complex systems", size: 18, color: COLORS[6], italic: true, noteIdx: 5 },
  { text: "builder", size: 22, color: COLORS[1], noteIdx: 6 },
  { text: "founder", size: 20, color: COLORS[0], noteIdx: 7 },
  { text: "researcher", size: 19, color: COLORS[3], italic: true, noteIdx: 0 },
  { text: "storyteller", size: 18, color: COLORS[4], italic: true, noteIdx: 1 },
  { text: "home", size: 15, color: COLORS[2], italic: true, noteIdx: 2 },
  { text: "bet on myself", size: 17, color: COLORS[6], italic: true, noteIdx: 3 },
  { text: "agent-based modeling", size: 15, color: COLORS[5], noteIdx: 4 },
  { text: "Mandarin", size: 14, color: COLORS[0], noteIdx: 5 },
  { text: "improvisation", size: 17, color: COLORS[4], italic: true, noteIdx: 6 },
  { text: "Python", size: 14, color: COLORS[3], noteIdx: 7 },
  { text: "regenerative", size: 16, color: COLORS[1], italic: true, noteIdx: 0 },
  { text: "title insurance", size: 15, color: COLORS[2], noteIdx: 1 },
  { text: "exploration", size: 18, color: COLORS[6], italic: true, noteIdx: 2 },
  { text: "exploitation", size: 16, color: COLORS[5], italic: true, noteIdx: 3 },
  { text: "NetLogo", size: 13, color: COLORS[3], noteIdx: 4 },
  { text: "inquiry", size: 18, color: COLORS[4], italic: true, noteIdx: 5 },
  { text: "cognitive studies", size: 14, color: COLORS[6], noteIdx: 6 },
  { text: "frontier tech", size: 18, color: COLORS[1], noteIdx: 7 },
  { text: "human-centered", size: 15, color: COLORS[2], noteIdx: 0 },
  { text: "design", size: 16, color: COLORS[5], noteIdx: 1 },
  { text: "trust", size: 16, color: COLORS[0], italic: true, noteIdx: 2 },
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
      (0.00015 + Math.random() * 0.0003) * (Math.random() > 0.5 ? 1 : -1);

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

/* ========== CLOUD BACKGROUND (Van Gogh) ========== */
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
  const animRef = useRef<number>(0);

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

  // Gentle orbit drift
  useEffect(() => {
    if (placed.length === 0 || dims.w === 0) return;
    const cx = dims.w / 2;
    const cy = dims.h / 2;
    const animate = () => {
      setPlaced((prev) =>
        prev.map((p) => {
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

  const handleClick = useCallback(
    (index: number, word: WordItem, posX: number, posY: number) => {
      spawnRipple(posX, posY);
      if (word.link) {
        playArpeggio();
        setTimeout(() => window.open(word.link, "_blank"), 400);
        return;
      }
      if (word.clickable) {
        playArpeggio();
        setExpanded(expanded === index ? null : index);
      } else {
        playHarpNote(SEIKILOS[word.noteIdx % SEIKILOS.length]);
      }
    },
    [expanded, spawnRipple]
  );

  const handleHover = useCallback((word: WordItem) => {
    playHarpNote(SEIKILOS[word.noteIdx % SEIKILOS.length]);
  }, []);

  const relatedIndices =
    expanded !== null && words[expanded]?.tags
      ? words[expanded].tags!
          .map((tag) => words.findIndex((w) => w.text === tag))
          .filter((idx) => idx !== -1)
      : [];

  const isExpanded = expanded !== null;

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
                className="mt-4 text-xs tracking-widest uppercase"
                style={{ color: "var(--fg-muted)", letterSpacing: "0.2em" }}
              >
                click the words &middot;{" "}
                <a
                  href="https://www.youtube.com/watch?v=hIFcIE23Su4&list=RDhIFcIE23Su4&start_radio=1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pointer-events-auto underline underline-offset-2 transition-colors duration-200"
                  style={{ color: "var(--accent)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                >
                  listen
                </a>
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded center content */}
      <AnimatePresence>
        {isExpanded && words[expanded] && (
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center z-30 pointer-events-auto px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="absolute inset-0" onClick={() => setExpanded(null)} />
            <motion.div
              className="relative text-center max-w-lg z-10"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <h2
                className="text-4xl sm:text-6xl mb-6"
                style={{
                  fontFamily: "var(--font-serif)",
                  color: words[expanded].color,
                  fontStyle: words[expanded].italic ? "italic" : "normal",
                }}
              >
                {words[expanded].text}
              </h2>
              <p
                className="text-base sm:text-lg leading-relaxed mb-8"
                style={{ color: "var(--fg-muted)" }}
              >
                {words[expanded].content}
              </p>
              <div className="flex flex-wrap justify-center gap-4">
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
              <button
                className="mt-8 text-sm tracking-wider uppercase"
                style={{ color: "var(--fg-muted)" }}
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
              {word.clickable && !word.link && (
                <span
                  className="absolute -bottom-0.5 left-2 right-2 h-px"
                  style={{ background: `${word.color}44` }}
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
        sound on
      </div>
    </div>
  );
}
