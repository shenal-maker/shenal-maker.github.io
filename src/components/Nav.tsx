"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "./ThemeProvider";

const links = [
  { label: "Projects", href: "#projects" },
  { label: "Writing", href: "#writing" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

export function Nav() {
  const { theme, toggle } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md"
      style={{
        background: "color-mix(in srgb, var(--bg) 85%, transparent)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        <a
          href="#"
          className="text-sm tracking-wide"
          style={{ fontFamily: "var(--font-serif)", fontSize: "1.15rem" }}
        >
          A<span style={{ color: "var(--accent)" }}>.</span>S
        </a>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm transition-colors duration-200"
              style={{ color: "var(--fg-muted)" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "var(--accent)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "var(--fg-muted)")
              }
            >
              {l.label}
            </a>
          ))}
          <button
            onClick={toggle}
            className="w-8 h-8 flex items-center justify-center rounded-full transition-colors duration-200"
            style={{ background: "var(--surface)" }}
            aria-label="Toggle theme"
          >
            {theme === "light" ? (
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <path
                  d="M7.5 0C7.78 0 8 .22 8 .5v1a.5.5 0 01-1 0v-1c0-.28.22-.5.5-.5zm0 4a3.5 3.5 0 100 7 3.5 3.5 0 000-7zm-4.79.71a.5.5 0 010-.71l.71-.71a.5.5 0 01.7.71l-.7.7a.5.5 0 01-.71 0zM0 7.5c0-.28.22-.5.5-.5h1a.5.5 0 010 1h-1a.5.5 0 01-.5-.5zm2.42 4.38a.5.5 0 01.71 0l.7-.7a.5.5 0 01-.7-.71l-.71.7a.5.5 0 010 .71zM7.5 13a.5.5 0 01.5.5v1a.5.5 0 01-1 0v-1c0-.28.22-.5.5-.5zm4.38-1.12a.5.5 0 010 .71l-.7.71a.5.5 0 01-.71-.71l.7-.7a.5.5 0 01.71 0zM13 7.5a.5.5 0 01.5-.5h1a.5.5 0 010 1h-1a.5.5 0 01-.5-.5zm-1.12-4.38a.5.5 0 01.71 0l.71.71a.5.5 0 01-.71.7l-.7-.7a.5.5 0 010-.71z"
                  fill="var(--fg-muted)"
                />
              </svg>
            ) : (
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <path
                  d="M2.9 1.78A6.5 6.5 0 0013.22 12.1 7.5 7.5 0 112.89 1.78z"
                  fill="var(--fg-muted)"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile */}
        <div className="flex md:hidden items-center gap-3">
          <button
            onClick={toggle}
            className="w-8 h-8 flex items-center justify-center rounded-full"
            style={{ background: "var(--surface)" }}
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="w-8 h-8 flex items-center justify-center"
          >
            <div className="space-y-1.5">
              <div
                className="w-5 h-px transition-transform"
                style={{
                  background: "var(--fg)",
                  transform: mobileOpen ? "rotate(45deg) translate(2px,2px)" : "",
                }}
              />
              <div
                className="w-5 h-px transition-opacity"
                style={{
                  background: "var(--fg)",
                  opacity: mobileOpen ? 0 : 1,
                }}
              />
              <div
                className="w-5 h-px transition-transform"
                style={{
                  background: "var(--fg)",
                  transform: mobileOpen ? "rotate(-45deg) translate(2px,-2px)" : "",
                }}
              />
            </div>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden"
            style={{ borderTop: "1px solid var(--border)" }}
          >
            <div className="px-6 py-4 flex flex-col gap-4">
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-sm"
                  style={{ color: "var(--fg-muted)" }}
                >
                  {l.label}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
