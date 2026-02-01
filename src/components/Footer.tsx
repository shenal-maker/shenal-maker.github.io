"use client";

export function Footer() {
  return (
    <footer
      id="contact"
      className="px-6 py-20"
      style={{ borderTop: "1px solid var(--border)" }}
    >
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-10">
          <div>
            <h2
              className="text-3xl sm:text-4xl mb-4"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Let&apos;s talk<span style={{ color: "var(--accent)" }}>.</span>
            </h2>
            <p className="text-sm" style={{ color: "var(--fg-muted)" }}>
              Always interested in meeting fellow builders and researchers.
            </p>
          </div>

          <div className="flex flex-col gap-3 text-sm">
            <a
              href="mailto:hello@adeleshen.com"
              className="transition-colors duration-200"
              style={{ color: "var(--fg-muted)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--fg-muted)")}
            >
              Email &rarr;
            </a>
            <a
              href="https://linkedin.com/in/"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors duration-200"
              style={{ color: "var(--fg-muted)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--fg-muted)")}
            >
              LinkedIn &rarr;
            </a>
            <a
              href="https://github.com/shenal-maker"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors duration-200"
              style={{ color: "var(--fg-muted)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--fg-muted)")}
            >
              GitHub &rarr;
            </a>
          </div>
        </div>

        <div
          className="mt-16 pt-6 flex justify-between items-center text-xs"
          style={{ borderTop: "1px solid var(--border)", color: "var(--fg-muted)" }}
        >
          <span>&copy; {new Date().getFullYear()} Adele Shen</span>
          <span className="asterisk-motif text-sm">✳</span>
        </div>
      </div>
    </footer>
  );
}
