import React from "react";
import { Link } from "react-router";
import { Sun, Moon } from "lucide-react";
import { useI18n } from "../utils/i18n";

/* shared styles — every item uses the same size / shape */
const navBtn =
  "h-8 px-3 text-sm text-muted-foreground hover:text-foreground rounded-[var(--radius-md)] hover:bg-secondary/80 transition-colors flex items-center gap-1.5";
const iconBtn =
  "h-8 w-8 flex items-center justify-center text-muted-foreground hover:text-foreground rounded-[var(--radius-md)] hover:bg-secondary/80 transition-colors";
const divider = "w-px h-4 bg-border";

export function Header() {
  const { t } = useI18n();
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className="w-7 h-7 shrink-0" aria-hidden="true">
              <rect width="32" height="32" rx="6" fill="var(--nordic-accent)" />
              <text x="16" y="24" textAnchor="middle" fontFamily="'SF Mono','Monaco','Menlo','Consolas',monospace" fontSize="20" fontWeight="600" fill="#FFFFFF">u</text>
            </svg>
            <span className="font-mono text-[17px] leading-none tracking-tight text-foreground">
              udbetalt<span className="text-[var(--nordic-accent)]">.dk</span>
            </span>
          </Link>

          {/* Unified nav bar */}
          <nav className="flex items-center gap-1 rounded-[var(--radius-lg)] bg-secondary/40 p-1">
            <Link to="/methodology" className={navBtn}>
              {t("nav.methodology")}
            </Link>
            <div className={divider} />
            <Link to="/feedback" className={navBtn}>
              {t("nav.feedback")}
            </Link>
            <div className={divider} />
            <LangSwitcher />
            <div className={divider} />
            <DarkModeToggle />
          </nav>
        </div>
      </div>
    </header>
  );
}

/* ── Language switcher with flag SVGs ──────────────────────────── */
function LangSwitcher() {
  const { lang, setLang } = useI18n();
  const targetLang = lang === "en" ? "da" : "en";

  return (
    <button
      onClick={() => setLang(targetLang)}
      className={iconBtn}
      aria-label={targetLang === "da" ? "Skift til dansk" : "Switch to English"}
      title={targetLang === "da" ? "Skift til dansk" : "Switch to English"}
    >
      {/* Show current language flag */}
      {lang === "da" ? (
        /* Danish flag 🇩🇰 — currently viewing in Danish */
        <svg viewBox="0 0 640 480" className="w-5 h-3.5 rounded-[2px] shadow-sm" aria-hidden="true">
          <rect width="640" height="480" fill="#c8102e" />
          <rect x="175" width="60" height="480" fill="#fff" />
          <rect y="200" width="640" height="80" fill="#fff" />
        </svg>
      ) : (
        /* UK flag 🇬🇧 — currently viewing in English */
        <svg viewBox="0 0 640 480" className="w-5 h-3.5 rounded-[2px] shadow-sm" aria-hidden="true">
          <rect width="640" height="480" fill="#012169" />
          <path d="M75 0l244 181L562 0h78v62L400 241l240 178v61h-80L320 301 81 480H0v-60l239-178L0 64V0z" fill="#fff" />
          <path d="M424 281l216 159v40L369 281zm-184 20l6 35L54 480H0zM640 0v3L391 191l2-44L590 0zM0 0l239 176h-60L0 42z" fill="#C8102E" />
          <path d="M241 0v480h160V0zM0 160v160h640V160z" fill="#fff" />
          <path d="M0 193v96h640v-96zM273 0v480h96V0z" fill="#C8102E" />
        </svg>
      )}
    </button>
  );
}

/* ── Dark-mode toggle ─────────────────────────────────────────── */
function DarkModeToggle() {
  const [dark, setDark] = React.useState(() =>
    document.documentElement.classList.contains("dark")
  );

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  React.useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      document.documentElement.classList.add("dark");
      setDark(true);
    }
  }, []);

  return (
    <button onClick={toggle} className={iconBtn} aria-label="Toggle dark mode">
      {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
}