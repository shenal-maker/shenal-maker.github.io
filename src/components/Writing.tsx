"use client";

import { motion, type Variants } from "framer-motion";

const posts = [
  {
    title: "Why I Left Internships to Build",
    type: "Essay",
    date: "Jan 2026",
    time: "8 min read",
    tags: ["startups", "personal"],
    preview:
      "I believe working on startups offers more job security in the long-run than being a generalist inside a generalist company.",
  },
  {
    title: "What Agent-Based Modeling Taught Me About Leadership",
    type: "Essay",
    date: "Dec 2025",
    time: "6 min read",
    tags: ["research", "AI"],
    preview:
      "The sweet spot isn't maximum coverage — it's finding the right balance between exploration and exploitation.",
  },
  {
    title: "On Coordination Under Pressure",
    type: "Note",
    date: "Jan 2026",
    time: "3 min read",
    tags: ["startups", "research"],
    preview:
      "Impact emerges not from isolated excellence, but from well-designed coordination under pressure.",
  },
  {
    title: "The Right Collisions",
    type: "Note",
    date: "Dec 2025",
    time: "2 min read",
    tags: ["personal", "AI"],
    preview:
      "Breakthroughs depend on the right collisions between people, ideas, and capital.",
  },
];

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export function Writing() {
  return (
    <section id="writing" className="px-6 py-28" style={{ background: "var(--surface)" }}>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-14">
          <span className="asterisk-motif text-xl">✳</span>
          <h2 className="text-4xl sm:text-5xl" style={{ fontFamily: "var(--font-serif)" }}>
            Writing
          </h2>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="grid sm:grid-cols-2 gap-5"
        >
          {posts.map((p) => (
            <motion.a
              key={p.title}
              variants={item}
              href="#"
              className="group block p-6 rounded-lg transition-all duration-300"
              style={{ background: "var(--bg)", border: "1px solid var(--border)" }}
              whileHover={{ y: -2, boxShadow: "0 8px 30px rgba(0,0,0,0.06)" }}
            >
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full"
                  style={{
                    background: p.type === "Essay" ? "var(--accent)" : "var(--border)",
                    color: p.type === "Essay" ? "var(--bg)" : "var(--fg-muted)",
                  }}
                >
                  {p.type}
                </span>
                <span className="text-xs" style={{ color: "var(--fg-muted)" }}>
                  {p.date} &middot; {p.time}
                </span>
              </div>
              <h3
                className="text-lg mb-2 group-hover:underline decoration-1 underline-offset-4"
                style={{ fontFamily: "var(--font-serif)", textDecorationColor: "var(--accent)" }}
              >
                {p.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--fg-muted)" }}>
                {p.preview}
              </p>
              <div className="flex gap-2 mt-3">
                {p.tags.map((t) => (
                  <span key={t} className="text-[10px] uppercase tracking-wider" style={{ color: "var(--fg-muted)", opacity: 0.6 }}>
                    #{t}
                  </span>
                ))}
              </div>
            </motion.a>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
