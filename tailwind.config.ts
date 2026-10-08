import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Each of these is a CSS variable (see app/globals.css), so every
        // one of these tokens automatically repaints when the `dark` class
        // is toggled on <html> — no per-component dark: variants needed.
        page: "rgb(var(--color-page) / <alpha-value>)",
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        "surface-muted": "rgb(var(--color-surface-muted) / <alpha-value>)",
        ink: "rgb(var(--color-ink) / <alpha-value>)",
        muted: "rgb(var(--color-muted) / <alpha-value>)",
        line: "rgb(var(--color-line) / <alpha-value>)",
        "line-strong": "rgb(var(--color-line-strong) / <alpha-value>)",
        charcoal: "rgb(var(--color-charcoal) / <alpha-value>)",
        "charcoal-hover": "rgb(var(--color-charcoal-hover) / <alpha-value>)",
        "on-charcoal": "rgb(var(--color-on-charcoal) / <alpha-value>)",
        "accent-from": "rgb(var(--color-accent-from) / <alpha-value>)",
        "accent-to": "rgb(var(--color-accent-to) / <alpha-value>)",
        priority: {
          high: "rgb(var(--color-priority-high) / <alpha-value>)",
          medium: "rgb(var(--color-priority-medium) / <alpha-value>)",
          low: "rgb(var(--color-priority-low) / <alpha-value>)",
        },
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        soft: "0 1px 2px rgba(31,32,35,0.04), 0 6px 20px rgba(31,32,35,0.06)",
        panel: "-16px 0 40px rgba(31,32,35,0.10)",
        glow: "0 0 0 1px rgba(124,108,255,0.35), 0 8px 30px rgba(124,108,255,0.25)",
      },
      backgroundImage: {
        "accent-gradient": "linear-gradient(135deg, #7C6CFF 0%, #2FE0D0 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
