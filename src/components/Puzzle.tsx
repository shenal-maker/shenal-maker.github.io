"use client";

import { useEffect, useState } from "react";
import { poems, type Poem } from "./poems";

type Size = "lg" | "wide" | "tall" | "sm";

type Card = {
  id: string;
  size: Size;
  color: string;
  // Front text color, for light card colors.
  ink?: string;
  tag: string;
  title: string;
  blurb?: string;
  // Back of the card. Drop a file in public/cards/ and set `photo` to show it.
  photo?: string;
  // Transparent PNGs shown side by side on the card's color.
  cutouts?: string[];
  back: string;
  links?: { label: string; href: string }[];
};

// Fall palette
const C = {
  umber: "#381412",
  rust: "#8E442B",
  ochre: "#CB8D30",
  sienna: "#6B2926",
  terracotta: "#C16F56",
  sage: "#8A9369",
  indigo: "#144257",
  olive: "#616D40",
  plum: "#402D3E",
};

const EMAIL = "adele.l.shen@vanderbilt.edu";
const CALENDLY = "https://calendly.com/adeleleyishen/connect";
const LINKEDIN = "https://www.linkedin.com/in/adele-shen-604343226/";

const cards: Card[] = [
  {
    id: "aisafety",
    size: "lg",
    color: C.olive,
    tag: "Co-founding · Fall 2026",
    title: "Vanderbilt AI Safety",
    blurb: "The first AI safety fellowship on campus.",
    photo: "/cards/ai-safety-team.jpg",
    back:
      "A 9-week fellowship: a curriculum, a facilitator, and a community of people who want the skills to study AI safety. The first cohort started October 12.",
    links: [{ label: "the initiative", href: "https://vanderbiltaisafety.com/" }],
  },
  {
    id: "friday",
    size: "wide",
    color: C.indigo,
    tag: "2026 · 3rd place",
    title: "HackMIT",
    blurb: "Built FRIDAY for OpenAI's Teammate Challenge: a spatial engine and agent harness for furnishing real rooms.",
    back:
      "Record your room with a phone, describe how you want it to feel, and FRIDAY puts together three designs you can walk through and change. Gaussian-splat rooms, a spatial engine that checks every placement, and an agent searching 10,000+ products. Built in 19 hours with Sin, Saketh Pilli, and William Xu.",
    links: [
      { label: "try it", href: "https://friday-hackmit.vercel.app" },
      { label: "repo", href: "https://github.com/LeeSinLiang/hackmit2026" },
    ],
  },
  {
    id: "aws",
    size: "wide",
    color: C.rust,
    tag: "Hackathon · Grand Prize $10K",
    title: "AWS Disaster Response",
    blurb: "6-person team building drone + ground-robot dispatch for earthquake rescue.",
    back:
      "Bayesian survivor-probability updates drive UAV/UGV dispatch. On-board YOLO detection over a LoRa mesh kept working through simulated aftershocks. 10× more survivors found than random search.",
    links: [{ label: "deck", href: "https://drive.google.com/file/d/12nV14O641DzgYW2PmH9pJ1sL3n7uomGm/view?usp=sharing" }],
  },
  {
    id: "drones",
    size: "tall",
    color: C.sage,
    tag: "Research · Vanderbilt",
    title: "Drone swarms vs. wildfire",
    blurb: "Agent-based modeling with Dr. Gilligan.",
    back:
      "I extended a stochastic forest-fire model with autonomous drones and swept flammability, wind, ember jumps, swarm size and sensing radius. Middle-of-the-road settings win. Drones that see too far all converge on the same fire and lose coverage.",
    links: [
      { label: "paper", href: "/drone-swarm-wildfire-abm.pdf" },
      { label: "slides", href: "https://drive.google.com/file/d/1kv0N_m9XRw2TQB0HjMckFOkT5v5R29B5/view?usp=sharing" },
    ],
  },
  {
    id: "chess",
    size: "sm",
    color: C.sienna,
    tag: "Startup · 2023–25",
    title: "Founders Inc",
    back: "Co-founded an AI hiring matching platform.",
  },
  {
    id: "tedx",
    size: "sm",
    color: C.plum,
    tag: "Speaking",
    title: "TEDx",
    back: "The only undergrad speaker at TEDx@BabsonCollege.",
    links: [
      { label: "Mind Games and Melodies", href: "https://www.youtube.com/watch?v=kYTRQUEYhn0" },
      { label: "A Composer's Guide", href: "https://www.youtube.com/watch?v=tdVN7vrWu54" },
    ],
  },
  {
    id: "major",
    size: "wide",
    color: C.umber,
    tag: "My major",
    title: "Human-Centered Technology Design",
    blurb: "A major I made up, mentored by Prof. Clayton.",
    back:
      "I designed my own major at Vanderbilt, Human-Centered Technology Design, mentored by Prof. Clayton.",
  },
  {
    id: "solar",
    size: "sm",
    color: C.terracotta,
    tag: "Research",
    title: "Transparent solar cells",
    back: "Nanofab research: traced a failed heterojunction to oxygen exposure and spin-coating errors.",
    links: [{ label: "report", href: "https://drive.google.com/file/d/1nrCKIwKDq6Z71lMwoAMeUX9YG1779IJV/view?usp=sharing" }],
  },
  {
    id: "pair",
    size: "wide",
    color: C.rust,
    tag: "Fellowship · 2025",
    title: "PAIR UK",
    photo: "/cards/pair.jpg",
    back: "Program on AI and Reasoning. 24 picked from 4,000+.",
    links: [{ label: "fabric.camp", href: "https://www.fabric.camp/" }],
  },
  {
    id: "nyt",
    size: "sm",
    color: C.indigo,
    tag: "Music composing",
    title: "NYT Coming of Age",
    back: "One of 25 winners out of 4,000+ entries in the New York Times teen contest.",
    links: [
      {
        label: "read",
        href: "https://www.nytimes.com/2022/01/05/learning/what-its-like-to-be-a-teenager-now-the-winners-of-our-coming-of-age-in-2021-contest.html",
      },
    ],
  },
  {
    id: "biotech",
    size: "sm",
    color: C.indigo,
    tag: "Summer 2025 · Boston",
    title: "Biotech",
    back:
      "PriveBio: automated pharma-publication alerts for the CMO. ANAMAX venture studio: profiled 80 LPs for fundraising.",
  },
  {
    id: "poems",
    size: "tall",
    color: C.sienna,
    tag: "Writing",
    title: "Poems I wrote",
    blurb: `${poems.length} poems`,
    back: "Pick one to read.",
  },
  {
    id: "merch",
    size: "tall",
    color: C.ochre,
    ink: "#2A2116",
    tag: "Fun fact",
    title: "Thrift/merch flipping",
    cutouts: ["/cards/merch-1.png", "/cards/merch-2.png"],
    back: "I cut and sew together clothing out of campus merch I was about to throw away.",
  },
  {
    id: "moon",
    size: "tall",
    color: C.plum,
    tag: "Fun fact",
    title: "Praying to the moon",
    photo: "/cards/moon.jpg",
    back: "A friend and I invented a meditative ritual for praying to the moon, inspired by a class on Monte Verità.",
  },
  {
    id: "offline",
    size: "sm",
    color: C.sage,
    tag: "Offline",
    title: "Off the clock",
    back: "Brazilian jiu-jitsu, bouldering, Tim Burton films, composing, and long conversations over coffee.",
  },
];

const span: Record<Size, string> = {
  lg: "col-span-2 row-span-2",
  wide: "col-span-2",
  tall: "row-span-2",
  sm: "",
};

function FlipCard({ card, onOpenPoem }: { card: Card; onOpenPoem: (p: Poem) => void }) {
  const [flipped, setFlipped] = useState(false);
  const big = card.size === "lg";

  return (
    <button
      type="button"
      onClick={() => setFlipped((f) => !f)}
      aria-pressed={flipped}
      className={`${span[card.size]} relative text-left [perspective:1200px] group`}
    >
      <div
        className="absolute inset-0 transition-transform duration-700 [transform-style:preserve-3d]"
        style={{ transform: flipped ? "rotateY(180deg)" : "none" }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 rounded-xl p-4 flex flex-col justify-between [backface-visibility:hidden] transition-transform duration-300 group-hover:-translate-y-0.5"
          style={{ background: card.color, color: card.ink ?? "#FFFDF9" }}
        >
          <span className="text-[10px] uppercase tracking-[0.18em] opacity-85">{card.tag}</span>
          <div>
            <h3
              className={big ? "text-4xl sm:text-5xl leading-none" : "text-xl leading-tight"}
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {card.title}
            </h3>
            {card.blurb && (
              <p className={`mt-2 opacity-90 leading-snug ${big ? "text-base max-w-sm" : "text-sm"}`}>{card.blurb}</p>
            )}
          </div>
          <span className="absolute top-4 right-4 text-xs opacity-60">↻</span>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 rounded-xl overflow-hidden [backface-visibility:hidden] [transform:rotateY(180deg)]"
          style={{ background: card.cutouts ? card.color : "#1F1B18", color: "#FFFDF9" }}
        >
          {card.photo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={card.photo} alt="" className="absolute inset-0 w-full h-full object-cover" />
          )}
          {card.cutouts && (
            <div className="absolute inset-0 flex justify-center gap-1 px-2 pt-3">
              {card.cutouts.map((src) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={src} src={src} alt="" className="h-full min-w-0 object-contain object-top" />
              ))}
            </div>
          )}
          <div
            className="absolute inset-0 p-4 flex flex-col overflow-y-auto"
            style={{
              background: card.cutouts
                ? "linear-gradient(to top, rgba(20,16,14,0.85) 0%, rgba(20,16,14,0) 35%)"
                : card.photo
                ? "linear-gradient(to top, rgba(20,16,14,0.92) 0%, rgba(20,16,14,0.55) 55%, rgba(20,16,14,0.1) 100%)"
                : `linear-gradient(160deg, ${card.color}33, transparent 60%)`,
            }}
          >
            <p className={`mt-auto whitespace-pre-line ${big ? "text-base leading-relaxed" : card.size === "sm" ? "text-[13px] leading-snug" : "text-sm leading-relaxed"}`}>
              {card.back}
            </p>
            {card.id === "poems" && (
              <div className="flex flex-col items-start gap-2 mt-3">
                {poems.map((p) => (
                  <span
                    key={p.title}
                    role="link"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenPoem(p);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.stopPropagation();
                        onOpenPoem(p);
                      }
                    }}
                    className="text-lg italic underline underline-offset-4 cursor-pointer"
                    style={{ fontFamily: "var(--font-serif)", textDecorationColor: card.color }}
                  >
                    {p.title}
                  </span>
                ))}
              </div>
            )}
            {card.links && (
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3">
                {card.links.map((l) => (
                  <a
                    key={l.href}
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-xs uppercase tracking-wider underline underline-offset-4"
                    style={{ color: "#F2D3B8" }}
                  >
                    {l.label} ↗
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

function ContactLinks() {
  const links = [
    { label: "Book a chat", href: CALENDLY, primary: true },
    { label: "Email", href: `mailto:${EMAIL}` },
    { label: "LinkedIn", href: LINKEDIN },
    { label: "GitHub", href: "https://github.com/shenal-maker" },
  ];
  return (
    <div className="flex flex-wrap gap-2">
      {links.map((l) => (
        <a
          key={l.label}
          href={l.href}
          target={l.href.startsWith("mailto") ? undefined : "_blank"}
          rel="noopener noreferrer"
          className="text-sm px-4 py-2 rounded-full transition-colors duration-200"
          style={
            l.primary
              ? { background: "var(--accent)", color: "#FFFDF9" }
              : { border: "1px solid var(--border)", color: "var(--fg)", background: "var(--bg)" }
          }
        >
          {l.label}
        </a>
      ))}
    </div>
  );
}

function PoemReader({ poem, onClose }: { poem: Poem; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto px-4 py-12"
      style={{ background: "rgba(26,22,20,0.55)" }}
      onClick={onClose}
    >
      <article
        className="relative max-w-xl mx-auto rounded-xl p-8 sm:p-10"
        style={{ background: "var(--bg)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-5 text-xl"
          style={{ color: "var(--fg-muted)" }}
        >
          ×
        </button>
        <h2 className="text-4xl mb-8" style={{ fontFamily: "var(--font-serif)" }}>
          {poem.title}
        </h2>
        <div className="space-y-5">
          {poem.stanzas.map((s, i) => (
            <p key={i} className="whitespace-pre-line leading-relaxed" style={{ color: "var(--fg-muted)" }}>
              {s}
            </p>
          ))}
        </div>
      </article>
    </div>
  );
}

export function Puzzle() {
  const [openPoem, setOpenPoem] = useState<Poem | null>(null);

  return (
    <main className="w-full px-3 sm:px-4 py-3 sm:py-4">
      <div className="grid grid-cols-2 md:grid-cols-4 grid-rows-[auto] md:grid-rows-none auto-rows-[140px] sm:auto-rows-[145px] gap-2.5 [grid-auto-flow:dense]">
        {/* Intro: the one card that doesn't flip */}
        <section
          className="col-span-2 md:row-span-3 rounded-xl p-6 sm:p-7 flex flex-col gap-5"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/cards/profile.jpg"
              alt="Adele as a kid, rollerskating"
              className="float-right ml-4 mb-2 w-24 h-36 sm:w-32 sm:h-48 rounded-lg object-cover"
            />
            <h1 className="text-5xl sm:text-6xl leading-none tracking-tight" style={{ fontFamily: "var(--font-serif)" }}>
              Leyi Shen
            </h1>
            <p className="mt-2 flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <span className="text-xl italic" style={{ fontFamily: "var(--font-serif)", color: "var(--accent)" }}>
                call me Adele!
              </span>
              <a
                href="https://www.admonymous.co/adele-shen"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs underline underline-offset-2"
                style={{ color: "var(--fg-muted)" }}
              >
                anonymous feedback ↗
              </a>
            </p>
            <div className="mt-4 space-y-3 text-[15px] leading-relaxed max-w-lg" style={{ color: "var(--fg-muted)" }}>
              <p>
                Grew up in China, rollerskating every day, head buried in textbooks, and occasionally catching tadpoles
                &amp; throwing toads. Started composing
                music during COVID, somehow ended up in The New York Times, and eventually found my way into building
                startups.
              </p>
              <p>
                Right now, I&apos;m building{" "}
                <a
                  href="https://tryhuddle.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2"
                  style={{ color: "var(--accent)" }}
                >
                  projects for love
                </a>
                .
              </p>
              <p style={{ color: "var(--accent)" }}>Flip any card to see my past projects.</p>
            </div>
          </div>
          <ContactLinks />
        </section>

        {cards.map((c) => (
          <FlipCard key={c.id} card={c} onOpenPoem={setOpenPoem} />
        ))}

        <section
          className="col-span-2 md:col-span-4 rounded-xl p-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4"
          style={{ border: "1px dashed var(--accent)" }}
        >
          <div>
            <h2 className="text-3xl" style={{ fontFamily: "var(--font-serif)" }}>
              Let&apos;s talk<span style={{ color: "var(--accent)" }}>.</span>
            </h2>
            <p className="mt-1 text-sm" style={{ color: "var(--fg-muted)" }}>
              Spatial AI, agents, complex systems, folklore, or whatever you&apos;re building. I like meeting new people.
            </p>
          </div>
          <ContactLinks />
        </section>
      </div>

      <footer className="mt-10 text-xs" style={{ color: "var(--fg-muted)" }}>
        © {new Date().getFullYear()} Adele Shen
      </footer>

      {openPoem && <PoemReader poem={openPoem} onClose={() => setOpenPoem(null)} />}
    </main>
  );
}
