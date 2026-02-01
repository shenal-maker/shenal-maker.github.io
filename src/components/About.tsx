"use client";

import { motion } from "framer-motion";

const highlights = [
  "PAIR UK Fellow (24 of 4,000+ applicants)",
  "Babson College Presidential Scholar",
  "NYT 'Coming of Age' Winner",
  "TEDx Speaker",
  "AWS Hackathon Grand Prize ($10K)",
];

const skills = [
  "Python", "R", "MATLAB", "SQL", "TensorFlow", "YOLO",
  "NetLogo", "AWS", "Figma", "Notion", "Salesforce",
];

const languages = [
  { name: "English", level: "Native" },
  { name: "Mandarin", level: "Native" },
  { name: "French", level: "B2" },
  { name: "Spanish", level: "A2" },
];

export function About() {
  return (
    <section id="about" className="px-6 py-28">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-14">
          <span className="asterisk-motif text-xl">✳</span>
          <h2 className="text-4xl sm:text-5xl" style={{ fontFamily: "var(--font-serif)" }}>
            About
          </h2>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid lg:grid-cols-5 gap-12"
        >
          {/* Story — 3 cols */}
          <div className="lg:col-span-3 space-y-5">
            {/* Photo placeholder */}
            <div
              className="w-full aspect-[3/2] rounded-lg mb-8 flex items-center justify-center"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <span className="text-sm" style={{ color: "var(--fg-muted)" }}>
                Photo coming soon
              </span>
            </div>

            <p className="text-lg leading-relaxed" style={{ color: "var(--fg-muted)" }}>
              I believe working on startups offers more job security in the long-run than being a
              &ldquo;generalist inside a generalist company.&rdquo; I decided to stop applying to
              summer internships, bet on myself, and treat startup as a serious career.
            </p>
            <p className="leading-relaxed" style={{ color: "var(--fg-muted)" }}>
              My journey: I&apos;ve researched and pivoted between industries for 1-2 years. Started
              with a lab trading business (halted by tariffs), then joined a consumer tech product
              (got VC funding, failed — taught me about cofounder compatibility and founder-market
              fit). Pivoted to mental health tech but the revenue model was unclear. Now with
              CranberryTech, my cofounder and I have a clear vision.
            </p>
            <p className="leading-relaxed" style={{ color: "var(--fg-muted)" }}>
              Why frontier tech specifically: I&apos;ve seen that breakthroughs depend on the right
              collisions between people, ideas, and capital. Having co-founded a startup and worked
              within venture-backed biotech ecosystems, I learned that impact emerges not from
              isolated excellence, but from well-designed coordination under pressure.
            </p>
            <div className="pt-4">
              <p className="text-sm" style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", color: "var(--accent)" }}>
                Vanderbilt University
              </p>
              <p className="text-sm" style={{ color: "var(--fg-muted)" }}>
                Human-Centered Technology Design + Cognitive Studies
                <br />
                Minor in Scientific Computing
              </p>
            </div>
          </div>

          {/* Sidebar — 2 cols */}
          <div className="lg:col-span-2 space-y-10">
            {/* Highlights */}
            <div>
              <h3
                className="text-sm uppercase tracking-widest mb-4"
                style={{ color: "var(--fg-muted)" }}
              >
                Highlights
              </h3>
              <ul className="space-y-2.5">
                {highlights.map((h) => (
                  <li key={h} className="flex items-start gap-2 text-sm">
                    <span style={{ color: "var(--accent)", marginTop: "2px" }}>—</span>
                    {h}
                  </li>
                ))}
              </ul>
            </div>

            {/* Skills */}
            <div>
              <h3
                className="text-sm uppercase tracking-widest mb-4"
                style={{ color: "var(--fg-muted)" }}
              >
                Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {skills.map((s) => (
                  <span
                    key={s}
                    className="text-xs px-3 py-1.5 rounded-full"
                    style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Languages */}
            <div>
              <h3
                className="text-sm uppercase tracking-widest mb-4"
                style={{ color: "var(--fg-muted)" }}
              >
                Languages
              </h3>
              <div className="space-y-2">
                {languages.map((l) => (
                  <div key={l.name} className="flex justify-between text-sm">
                    <span>{l.name}</span>
                    <span style={{ color: "var(--fg-muted)" }}>{l.level}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
