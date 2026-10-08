"use client";

import { CSSProperties, FormEvent, PointerEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function LoginPage() {
  const { login, error } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  function handlePointerMove(e: PointerEvent<HTMLDivElement>) {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    card.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    card.style.setProperty("--my", `${e.clientY - rect.top}px`);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(username, password);
      router.push("/");
    } catch {
      // surfaced via useAuth().error
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-page px-6">
      <ThemeToggle className="absolute right-6 top-6 z-20 bg-page" />

      <div className="aurora" aria-hidden>
        <span />
        <span />
        <span />
      </div>
      <div className="grain" aria-hidden />

      {/* faint drifting grid for depth */}
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(rgb(var(--grid-line) / 0.6) 1px, transparent 1px), linear-gradient(90deg, rgb(var(--grid-line) / 0.6) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(ellipse 60% 50% at 50% 40%, black, transparent)",
        }}
        aria-hidden
      />

      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="font-serif text-6xl italic text-gradient">Almanac</p>
          <p className="mt-3 text-sm text-muted">A private place for two, to keep track of things.</p>
        </div>

        <div
          ref={cardRef}
          onPointerMove={handlePointerMove}
          className="glass relative overflow-hidden rounded-2xl p-8 shadow-glow"
          style={
            {
              "--mx": "50%",
              "--my": "0px",
            } as CSSProperties
          }
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-60 transition-opacity"
            style={{
              background:
                "radial-gradient(220px circle at var(--mx) var(--my), rgba(124,108,255,0.16), transparent 70%)",
            }}
            aria-hidden
          />

          <form onSubmit={handleSubmit} className="relative space-y-5">
            <div>
              <label htmlFor="username" className="block text-xs uppercase tracking-wider text-muted">
                Username
              </label>
              <input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                required
                className="mt-2 w-full rounded-lg border border-line bg-page/50 px-3 py-2.5 text-ink outline-none transition-colors focus-visible:border-accent-from"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs uppercase tracking-wider text-muted">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                className="mt-2 w-full rounded-lg border border-line bg-page/50 px-3 py-2.5 text-ink outline-none transition-colors focus-visible:border-accent-from"
              />
            </div>

            {error && <p className="text-sm text-priority-high">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="group relative w-full overflow-hidden rounded-lg bg-accent-gradient py-2.5 text-sm font-medium text-[#1F2023] transition-transform active:scale-[0.98] disabled:opacity-60"
            >
              <span className="relative z-10">{submitting ? "Signing in…" : "Enter"}</span>
              <span className="absolute inset-0 -translate-x-full bg-white/25 transition-transform duration-500 group-hover:translate-x-0" />
            </button>
          </form>
        </div>

        <p className="mt-6 text-center font-mono text-xs text-muted/80">two accounts · no signups · just the two of you</p>
      </div>
    </div>
  );
}
