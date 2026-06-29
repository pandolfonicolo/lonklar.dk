import React from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { Sun, Moon, ChevronDown, Menu, X, Coins } from "lucide-react";
import { useI18n, type Lang } from "../utils/i18n";
import {
  CURRENCIES,
  getStoredCurrency,
  setStoredCurrency,
  type CurrencyCode,
} from "../utils/currency";

/* shared styles — every item uses the same size / shape */
const navBtn =
  "h-8 px-3 text-sm text-muted-foreground hover:text-foreground rounded-[var(--radius-md)] hover:bg-secondary/80 transition-colors flex items-center gap-1.5";
const navBtnMobile =
  "w-full px-4 py-3 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors flex items-center gap-2 rounded-[var(--radius-md)]";
const iconBtn =
  "h-8 w-8 flex items-center justify-center text-muted-foreground hover:text-foreground rounded-[var(--radius-md)] hover:bg-secondary/80 transition-colors";
const divider = "w-px h-4 bg-border";

export function Header() {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const mobileRef = React.useRef<HTMLDivElement>(null);

  const scrollToCalculators = () => {
    const doScroll = () => {
      const el = document.getElementById("calculators");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    };
    if (location.pathname === "/") {
      doScroll();
    } else {
      navigate("/");
      setTimeout(doScroll, 300);
    }
  };

  // Close on outside click
  React.useEffect(() => {
    if (!mobileOpen) return;
    const handler = (e: MouseEvent) => {
      if (mobileRef.current && !mobileRef.current.contains(e.target as Node)) setMobileOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [mobileOpen]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className="w-7 h-7 shrink-0" aria-hidden="true">
              <rect width="32" height="32" rx="6" fill="var(--nordic-accent)" />
              <text x="16" y="23" textAnchor="middle" fontFamily="'SF Mono','Monaco','Menlo','Consolas',monospace" fontSize="20" fontWeight="600" fill="#FFFFFF">l</text>
            </svg>
            <span className="font-mono text-xl leading-tight tracking-tight text-foreground">
              lønklar<span className="text-[var(--nordic-accent)]">.dk</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden sm:flex items-center gap-1 rounded-[var(--radius-lg)] bg-secondary/40 p-1">
            <button onClick={scrollToCalculators} className={`${navBtn} whitespace-nowrap`}>
              {t("nav.calculators")}
            </button>
            <div className={divider} />
            <Link to="/how-it-works" className={`${navBtn} whitespace-nowrap`}>
              {t("nav.methodology")}
            </Link>
            <div className={divider} />
            <Link to="/contact" className={`${navBtn} whitespace-nowrap`}>
              {t("nav.feedback")}
            </Link>
            <div className={divider} />
            <Link to="/about" className={`${navBtn} whitespace-nowrap`}>
              {lang === "da" ? "Om" : "About"}
            </Link>
            <div className={divider} />
            <LangSwitcher />
            <div className={divider} />
            <CurrencySwitcher />
            <div className={divider} />
            <DarkModeToggle />
          </nav>

          {/* Mobile hamburger button */}
          <div ref={mobileRef} className="sm:hidden relative">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={iconBtn}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Mobile dropdown */}
            {mobileOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-[var(--radius-lg)] shadow-lg z-50 p-2 space-y-1">
                <button
                  onClick={() => { setMobileOpen(false); scrollToCalculators(); }}
                  className={navBtnMobile}
                >
                  {t("nav.calculators")}
                </button>
                <Link
                  to="/how-it-works"
                  onClick={() => setMobileOpen(false)}
                  className={navBtnMobile}
                >
                  {t("nav.methodology")}
                </Link>
                <Link
                  to="/contact"
                  onClick={() => setMobileOpen(false)}
                  className={navBtnMobile}
                >
                  {t("nav.feedback")}
                </Link>
                <Link
                  to="/about"
                  onClick={() => setMobileOpen(false)}
                  className={navBtnMobile}
                >
                  {lang === "da" ? "Om" : "About"}
                </Link>
                <div className="border-t border-border my-1" />
                <div className="flex items-center justify-between px-4 py-2">
                  <LangSwitcher />
                  <CurrencySwitcher />
                  <DarkModeToggle />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function CurrencySwitcher() {
  const [currency, setCurrency] = React.useState<CurrencyCode>(() => getStoredCurrency());
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handler = (event: Event) => {
      const next = (event as CustomEvent<CurrencyCode>).detail;
      if (next) setCurrency(next);
    };
    window.addEventListener("lonklar-currency-change", handler);
    return () => window.removeEventListener("lonklar-currency-change", handler);
  }, []);

  React.useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`${iconBtn} gap-1 w-auto px-2`}
        aria-label="Switch display currency"
      >
        <Coins className="w-4 h-4" />
        <span className="text-xs font-medium">{currency}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 py-1 bg-card border border-border rounded-[var(--radius-md)] shadow-lg min-w-[170px] z-50">
          {CURRENCIES.map((item) => (
            <button
              key={item.code}
              onClick={() => {
                setStoredCurrency(item.code);
                setCurrency(item.code);
                setOpen(false);
              }}
              className={`w-full flex items-center justify-between gap-3 px-3 py-1.5 text-sm transition-colors hover:bg-secondary/80 ${
                item.code === currency ? "text-foreground font-medium" : "text-muted-foreground"
              }`}
            >
              <span>{item.code}</span>
              <span className="text-xs">{item.symbol}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Language switcher with flag SVGs (dropdown for 7 langs) ─── */

const flags: Record<Lang, { label: string; flag: React.ReactNode }> = {
  en: {
    label: "English",
    flag: (
      <svg viewBox="0 0 640 480" className="w-5 h-3.5 rounded-[2px] shadow-sm" aria-hidden="true">
        <rect width="640" height="480" fill="#012169" />
        <path d="M75 0l244 181L562 0h78v62L400 241l240 178v61h-80L320 301 81 480H0v-60l239-178L0 64V0z" fill="#fff" />
        <path d="M424 281l216 159v40L369 281zm-184 20l6 35L54 480H0zM640 0v3L391 191l2-44L590 0zM0 0l239 176h-60L0 42z" fill="#C8102E" />
        <path d="M241 0v480h160V0zM0 160v160h640V160z" fill="#fff" />
        <path d="M0 193v96h640v-96zM273 0v480h96V0z" fill="#C8102E" />
      </svg>
    ),
  },
  mi: {
    label: "Te Reo Māori",
    flag: (
      <svg viewBox="0 0 640 480" className="w-5 h-3.5 rounded-[2px] shadow-sm" aria-hidden="true">
        <rect width="640" height="480" fill="#00247D" />
        <path d="M0 0h320v240H0z" fill="#012169" />
        <path d="M0 0l320 240M320 0L0 240" stroke="#fff" strokeWidth="48" />
        <path d="M0 0l320 240M320 0L0 240" stroke="#C8102E" strokeWidth="28" />
        <path d="M160 0v240M0 120h320" stroke="#fff" strokeWidth="80" />
        <path d="M160 0v240M0 120h320" stroke="#C8102E" strokeWidth="48" />
        {[
          [470, 120, 20],
          [540, 210, 16],
          [430, 260, 16],
          [510, 340, 18],
        ].map(([cx, cy, r], i) => (
          <g key={i}>
            <polygon
              points={`${cx},${cy - r} ${cx + r * 0.22},${cy - r * 0.22} ${cx + r},${cy} ${cx + r * 0.22},${cy + r * 0.22} ${cx},${cy + r} ${cx - r * 0.22},${cy + r * 0.22} ${cx - r},${cy} ${cx - r * 0.22},${cy - r * 0.22}`}
              fill="#fff"
            />
            <polygon
              points={`${cx},${cy - r * 0.72} ${cx + r * 0.16},${cy - r * 0.16} ${cx + r * 0.72},${cy} ${cx + r * 0.16},${cy + r * 0.16} ${cx},${cy + r * 0.72} ${cx - r * 0.16},${cy + r * 0.16} ${cx - r * 0.72},${cy} ${cx - r * 0.16},${cy - r * 0.16}`}
              fill="#CC142B"
            />
          </g>
        ))}
      </svg>
    ),
  },
  da: {
    label: "Dansk",
    flag: (
      <svg viewBox="0 0 640 480" className="w-5 h-3.5 rounded-[2px] shadow-sm" aria-hidden="true">
        <rect width="640" height="480" fill="#c8102e" />
        <rect x="175" width="60" height="480" fill="#fff" />
        <rect y="200" width="640" height="80" fill="#fff" />
      </svg>
    ),
  },
  sv: {
    label: "Svenska",
    flag: (
      <svg viewBox="0 0 640 480" className="w-5 h-3.5 rounded-[2px] shadow-sm" aria-hidden="true">
        <rect width="640" height="480" fill="#006AA7" />
        <rect x="176" width="64" height="480" fill="#FECC00" />
        <rect y="208" width="640" height="64" fill="#FECC00" />
      </svg>
    ),
  },
  nb: {
    label: "Norsk",
    flag: (
      <svg viewBox="0 0 640 480" className="w-5 h-3.5 rounded-[2px] shadow-sm" aria-hidden="true">
        <rect width="640" height="480" fill="#BA0C2F" />
        <rect x="160" width="80" height="480" fill="#fff" />
        <rect y="200" width="640" height="80" fill="#fff" />
        <rect x="172" width="56" height="480" fill="#00205B" />
        <rect y="212" width="640" height="56" fill="#00205B" />
      </svg>
    ),
  },
  de: {
    label: "Deutsch",
    flag: (
      <svg viewBox="0 0 640 480" className="w-5 h-3.5 rounded-[2px] shadow-sm" aria-hidden="true">
        <rect width="640" height="160" fill="#000" />
        <rect y="160" width="640" height="160" fill="#D00" />
        <rect y="320" width="640" height="160" fill="#FFCE00" />
      </svg>
    ),
  },
  it: {
    label: "Italiano",
    flag: (
      <svg viewBox="0 0 640 480" className="w-5 h-3.5 rounded-[2px] shadow-sm" aria-hidden="true">
        <rect width="213.3" height="480" fill="#009246" />
        <rect x="213.3" width="213.4" height="480" fill="#fff" />
        <rect x="426.7" width="213.3" height="480" fill="#ce2b37" />
      </svg>
    ),
  },
  es: {
    label: "Español",
    flag: (
      <svg viewBox="0 0 640 480" className="w-5 h-3.5 rounded-[2px] shadow-sm" aria-hidden="true">
        <rect width="640" height="480" fill="#AA151B" />
        <rect y="120" width="640" height="240" fill="#F1BF00" />
      </svg>
    ),
  },
};

const langOrder: Lang[] = ["en", "mi", "da", "sv", "nb", "de", "it", "es"];

function LangSwitcher() {
  const { lang, setLang } = useI18n();
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  // Close on outside click
  React.useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`${iconBtn} gap-0.5 w-auto px-1.5`}
        aria-label="Switch language"
      >
        {flags[lang].flag}
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 py-1 bg-card border border-border rounded-[var(--radius-md)] shadow-lg min-w-[140px] z-50">
          {langOrder.map((l) => (
            <button
              key={l}
              onClick={() => { setLang(l); setOpen(false); }}
              className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-sm transition-colors hover:bg-secondary/80 ${
                l === lang ? "text-foreground font-medium" : "text-muted-foreground"
              }`}
            >
              {flags[l].flag}
              {flags[l].label}
            </button>
          ))}
        </div>
      )}
    </div>
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
    if (saved === "dark") {
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
