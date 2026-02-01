"use client";

import { motion } from "framer-motion";

const projects = [
  {
    title: "CranberryTech",
    tag: "Startup — Current",
    description:
      "The first AI-native title insurance company. We're not building better gloves for TSA officers — we're reimagining the entire conveyor belt.",
    detail: "AI insurer capturing the full value chain of a $17.1B industry",
    link: "#",
  },
  {
    title: "Drone Swarm Research",
    tag: "Research — Current",
    description:
      "Agent-based modeling for autonomous wildfire suppression under Dr. Gilligan at Vanderbilt. Finding the sweet spot between exploration and exploitation.",
    detail:
      "NetLogo + Python | Parameter sweeps, non-linear failure mode analysis",
    link: "#",
  },
  {
    title: "Remote Chess",
    tag: "Startup — Past",
    description:
      "VC-backed chess platform. $70K pre-seed. Taught me everything about cofounder dynamics and when to pivot.",
    detail: "Selected for PAIR UK (24 of 4,000+ applicants)",
    link: "#",
  },
  {
    title: "AWS Disaster Response",
    tag: "Hackathon",
    description:
      "Grand Prize winner ($10K). Built an AI-powered disaster response tool using AWS IoT Core and computer vision.",
    detail: "YOLO, AWS S3, Greengrass, IoT Core",
    link: "#",
  },
  {
    title: "TEDx Talk",
    tag: "Speaking",
    description:
      "Inquiry-based leadership: translating research on human decision-making into public narratives.",
    detail:
      "Only undergraduate speaker | Psychology-driven behavior change",
    link: "#",
  },
];

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

export function Projects() {
  return (
    <section id="projects" className="px-6 py-28">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-14">
          <span className="asterisk-motif text-xl">✳</span>
          <h2
            className="text-4xl sm:text-5xl"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Projects
          </h2>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid gap-4"
        >
          {projects.map((p) => (
            <motion.a
              key={p.title}
              variants={item}
              href={p.link}
              className="group block p-6 sm:p-8 rounded-lg transition-all duration-300"
              style={{
                border: "1px solid var(--border)",
                background: "var(--bg)",
              }}
              whileHover={{
                y: -2,
                boxShadow: "0 8px 30px rgba(0,0,0,0.06)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--accent)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
              }}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                <h3
                  className="text-xl sm:text-2xl"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  {p.title}
                  <span
                    className="inline-block ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: "var(--accent)" }}
                  >
                    &rarr;
                  </span>
                </h3>
                <span
                  className="text-xs uppercase tracking-widest whitespace-nowrap mt-1"
                  style={{ color: "var(--accent)" }}
                >
                  {p.tag}
                </span>
              </div>
              <p
                className="mb-2 leading-relaxed"
                style={{ color: "var(--fg-muted)" }}
              >
                {p.description}
              </p>
              <p className="text-xs" style={{ color: "var(--fg-muted)", opacity: 0.7 }}>
                {p.detail}
              </p>
            </motion.a>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
