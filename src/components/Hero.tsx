"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const identities = ["builder", "researcher", "storyteller", "founder"];

export function Hero() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % identities.length);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="min-h-screen flex items-center px-6 pt-14">
      <div className="max-w-5xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Name */}
          <div className="mb-6">
            <h1
              className="text-5xl sm:text-7xl lg:text-8xl leading-none tracking-tight"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Leyi{" "}
              <span
                className="italic"
                style={{ color: "var(--accent)" }}
              >
                (Adele)
              </span>{" "}
              Shen
            </h1>
          </div>

          {/* Rotating identity */}
          <div className="flex items-center gap-3 mb-10">
            <span className="asterisk-motif text-2xl">✳</span>
            <div
              className="h-9 overflow-hidden relative"
              style={{ width: "280px" }}
            >
              {identities.map((word, i) => (
                <motion.span
                  key={word}
                  className="absolute left-0 text-2xl sm:text-3xl"
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontStyle: "italic",
                    color: "var(--fg-muted)",
                  }}
                  initial={false}
                  animate={{
                    y: i === index ? 0 : i === (index - 1 + identities.length) % identities.length ? -40 : 40,
                    opacity: i === index ? 1 : 0,
                  }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
                  {word}
                </motion.span>
              ))}
            </div>
          </div>

          {/* Intro */}
          <p
            className="max-w-xl text-lg leading-relaxed mb-12"
            style={{ color: "var(--fg-muted)" }}
          >
            Builder at the intersection of AI, complex systems, and
            human-centered design. Currently creating the first AI-native title
            insurance company while researching agent-based modeling for disaster
            response.
          </p>

          {/* Currently block */}
          <div
            className="inline-block px-5 py-4 rounded-lg"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
            }}
          >
            <span
              className="text-xs uppercase tracking-widest block mb-2"
              style={{ color: "var(--fg-muted)" }}
            >
              Currently
            </span>
            <div className="space-y-1.5 text-sm">
              <div className="flex items-center gap-2">
                <span
                  className="w-1.5 h-1.5 rounded-full inline-block"
                  style={{ background: "var(--accent)" }}
                />
                Building CranberryTech
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="w-1.5 h-1.5 rounded-full inline-block"
                  style={{ background: "var(--accent)" }}
                />
                Researching drone swarm coordination at Vanderbilt
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="w-1.5 h-1.5 rounded-full inline-block"
                  style={{ background: "var(--accent)" }}
                />
                Applying to fellowships for Summer 2026
              </div>
            </div>
          </div>
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          <svg
            width="20"
            height="30"
            viewBox="0 0 20 30"
            fill="none"
            stroke="var(--fg-muted)"
            strokeWidth="1.5"
          >
            <rect x="1" y="1" width="18" height="28" rx="9" />
            <motion.circle
              cx="10"
              cy="10"
              r="2"
              fill="var(--accent)"
              animate={{ cy: [8, 18, 8] }}
              transition={{
                repeat: Infinity,
                duration: 2,
                ease: "easeInOut",
              }}
            />
          </svg>
        </motion.div>
      </div>
    </section>
  );
}
