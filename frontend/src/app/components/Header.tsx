import React from "react";
import { Link } from "react-router";
import { Globe, Sun, Moon } from "lucide-react";
import { useI18n } from "../utils/i18n";

export function Header() {
  const { t } = useI18n();
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-3.5 transition-opacity hover:opacity-80">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className="w-7 h-7 shrink-0" aria-hidden="true">
              <rect width="32" height="32" rx="6" fill="var(--nordic-accent)"/>
              <text x="16" y="24" textAnchor="middle" fontFamily="'SF Mono','Monaco','Menlo','Consolas',monospace" fontSize="20" fontWeight="600" fill="#FFFFFF">u</text>
            </svg>
            <span className="font-mono text-[17px] leading-none tracking-tight text-foreground">udbetalt<span className="text-[var(--nordic-accent)]">.dk</span></span>
          </Link>
          
          <nav className="flex items-center gap-4">
            <Link 
              to="/methodology" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {t("nav.methodology")}
            </Link>
            <LangSwitcher />
            <DarkModeToggle />
          </nav>
        </div>
      </div>
    </header>
  );
}

function LangSwitcher() {
  const { lang, setLang, t } = useI18n();
  return (
    <button
      onClick={() => setLang(lang === "en" ? "da" : "en")}
      className="flex items-center gap-1 px-3 py-1.5 text-xs bg-secondary text-secondary-foreground rounded-[var(--radius-md)] hover:bg-accent transition-colors"
      aria-label="Switch language"
    >
      <Globe className="w-3.5 h-3.5" />
      {t("nav.language")}
    </button>
  );
}

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

  // Restore on mount
  React.useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      document.documentElement.classList.add("dark");
      setDark(true);
    }
  }, []);

  return (
    <button
      onClick={toggle}
      className="p-2 rounded-[var(--radius-md)] bg-secondary text-secondary-foreground hover:bg-accent transition-colors"
      aria-label="Toggle dark mode"
    >
      {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
}