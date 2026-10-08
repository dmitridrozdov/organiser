import type { Metadata } from "next";
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";
import { Providers } from "./providers";
import { ThemeProvider } from "@/lib/theme-context";
import "./globals.css";

// Runs before React hydrates, so the correct theme class is already on
// <html> by the time the page paints — no flash of the wrong theme.
const THEME_BOOT_SCRIPT = `
  (function () {
    try {
      var stored = window.localStorage.getItem("organiser.theme");
      if (stored === "dark") document.documentElement.classList.add("dark");
    } catch (e) {}
  })();
`;

const serif = Fraunces({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["500", "600"],
  style: ["italic", "normal"],
});

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Almanac",
  description: "A shared task organiser.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
      </head>
      <body className="bg-page font-sans text-ink antialiased">
        <ThemeProvider>
          <Providers>{children}</Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
