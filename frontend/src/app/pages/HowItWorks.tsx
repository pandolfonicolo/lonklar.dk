import React from "react";
import { Header } from "../components/Header";
import { ArrowLeft, ExternalLink, MessageSquare } from "lucide-react";
import { Button } from "../components/ui/button";
import { useNavigate, Link } from "react-router";
import { useI18n } from "../utils/i18n";

/* ── pseudo-code formula block (language-independent) ────────── */
const FORMULA = `// Full-time job → net pay (2026 rates)

pension        = gross × employee_pension_%
atp            = 94.65 kr/month × 12             // (varies by hours)
feriepenge     = gross × 1%                      // (12.5% if hourly)

am_basis       = gross + feriepenge − pension − atp
am_bidrag      = am_basis × 8%
income_after_am = am_basis − am_bidrag

// ── deductions ──
beskæft_fradrag = min(income_after_am × 12.75%, 63 300)
job_fradrag     = min(income_after_am ×  4.50%,  3 100)
befordring      = (daily_km − 24) × 1.98 kr/km × 218 days
fagforening     = min(annual_union_fees, 7 000)
lignings_fradrag = befordring + fagforening

// ── state tax ──
bundskat_base   = max(income_after_am − 54 100, 0)
bundskat        = bundskat_base × 12.01%

// ── municipal tax (reduced base) ──
kommune_base    = max(income_after_am − 54 100
                    − beskæft − job − lignings_fradrag, 0)
kommuneskat     = kommune_base × kommune_%

// ── church tax (optional, own base) ──
kirke_base      = max(income_after_am − 54 100
                    − lignings_fradrag, 0)
kirkeskat       = kirke_base × kirke_%

// ── progressive brackets (capped by skatteloft 44.57%) ──
mellemskat      = max(min(income, 777 900) − 641 200, 0) × 7.5%
topskat         = max(min(income, 2 592 700) − 777 900, 0) × 7.5%
toptopskat      = max(income − 2 592 700, 0)               × 5.0%

// ── net ──
total_tax       = am_bidrag + bundskat + kommuneskat
                + kirkeskat + mellemskat + topskat + toptopskat
net_annual      = gross + feriepenge − pension − atp
                − total_tax − aftertax_deductions`;

export function HowItWorks() {
  const navigate = useNavigate();
  const { t } = useI18n();

  React.useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "How It Works — lønklar.dk";
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t("btn.backHome")}
        </Button>

        <article className="prose prose-slate max-w-none">
          {/* ── Hero ── */}
          <div className="mb-10">
            <h1 className="text-3xl font-semibold text-foreground mb-3">{t("method.title")}</h1>
            <p className="text-muted-foreground text-lg max-w-xl">
              {t("method.subtitle")}
            </p>
          </div>

          {/* ── About ── */}
          <div className="bg-card border border-border rounded-[var(--radius-lg)] p-8 mb-10">
            <h2 className="text-2xl mb-4 text-foreground">{t("method.about.title")}</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              {t("method.about.p1")}
            </p>
            <p className="text-muted-foreground leading-relaxed">
              {t("method.about.p2")}
            </p>
          </div>

          {/* ── Step by step ── */}
          <section className="mb-10">
            <h2 className="text-2xl mb-4 text-foreground">{t("method.calc.title")}</h2>
            <div className="space-y-6">
              <div className="bg-secondary/30 rounded-[var(--radius-lg)] p-6">
                <h3 className="text-xl mb-3 text-foreground">{t("method.calc.fulltime")}</h3>
                <div className="text-sm text-muted-foreground space-y-2 leading-relaxed">
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>{t("method.calc.fulltime.am")}</li>
                    <li>{t("method.calc.fulltime.ferie")}</li>
                    <li>{t("method.calc.fulltime.bundskat")}</li>
                    <li>{t("method.calc.fulltime.kommune")}</li>
                    <li>{t("method.calc.fulltime.progressive")}</li>
                    <li>{t("method.calc.fulltime.skatteloft")}</li>
                    <li>{t("method.calc.fulltime.beskfradrag")}</li>
                    <li>{t("method.calc.fulltime.jobfradrag")}</li>
                    <li>{t("method.calc.fulltime.atp")}</li>
                  </ul>
                </div>
              </div>

              <div className="bg-secondary/30 rounded-[var(--radius-lg)] p-6">
                <h3 className="text-xl mb-3 text-foreground">{t("method.calc.parttime")}</h3>
                <div className="text-sm text-muted-foreground space-y-2 leading-relaxed">
                  <p>{t("method.calc.parttime.same")}</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>{t("method.calc.parttime.feriepenge")}</li>
                    <li>{t("method.calc.parttime.atp")}</li>
                  </ul>
                </div>
              </div>

              <div className="bg-secondary/30 rounded-[var(--radius-lg)] p-6">
                <h3 className="text-xl mb-3 text-foreground">{t("method.calc.student")}</h3>
                <div className="text-sm text-muted-foreground space-y-2 leading-relaxed">
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>{t("method.calc.student.su_no_am")}</li>
                    <li>{t("method.calc.student.work_am")}</li>
                    <li>{t("method.calc.student.fribeloeb")}</li>
                    <li>{t("method.calc.student.excess")}</li>
                    <li>{t("method.calc.student.interest")}</li>
                    <li>{t("method.calc.student.personfradrag")}</li>
                    <li>{t("method.calc.student.multijob")}</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* ── Data sources ── */}
          <section className="mb-10">
            <h2 className="text-2xl mb-4 text-foreground">{t("method.sources.title")}</h2>
            <div className="bg-card border border-border rounded-[var(--radius-lg)] p-6 space-y-4">
              {[
                {
                  label: t("method.sources.skat"),
                  url: "https://skat.dk/hjaelp/satser",
                  desc: t("method.sources.skat.desc"),
                },
                {
                  label: t("method.sources.skm"),
                  url: "https://skm.dk/tal-og-metode/satser/kommuneskatteprocenter",
                  desc: t("method.sources.skm.desc"),
                },
                {
                  label: t("method.sources.su"),
                  url: "https://su.dk/satser",
                  desc: t("method.sources.su.desc"),
                },
                {
                  label: t("method.sources.fribeloeb"),
                  url: "https://su.dk/su/naar-du-faar-su/saa-meget-maa-du-tjene/beregn-fribeloeb",
                  desc: t("method.sources.fribeloeb.desc"),
                },
                {
                  label: t("method.sources.ferielov"),
                  url: "https://www.retsinformation.dk/eli/lta/2018/1025",
                  desc: t("method.sources.ferielov.desc"),
                },
                {
                  label: t("method.sources.atp"),
                  url: "https://www.atp.dk/atp-livslang-pension/satser-og-bidrag",
                  desc: t("method.sources.atp.desc"),
                },
                {
                  label: t("method.sources.exchange"),
                  url: "https://api.frankfurter.app/",
                  desc: t("method.sources.exchange.desc"),
                },
                {
                  label: t("method.sources.life"),
                  url: "https://lifeindenmark.borger.dk",
                  desc: t("method.sources.life.desc"),
                },
              ].map((s, i) => (
                <div key={i} className="flex items-start gap-3">
                  <ExternalLink className="w-4 h-4 mt-0.5 shrink-0 text-[var(--nordic-accent)]" />
                  <div>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-foreground hover:text-[var(--nordic-accent)] transition-colors"
                    >
                      {s.label}
                    </a>
                    <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
                  </div>
                </div>
              ))}
              <p className="mt-4 pt-3 border-t border-border text-xs text-muted-foreground">
                {t("method.sources.updated")}
              </p>
            </div>
          </section>

          {/* ── Disclaimer ── */}
          <section className="mb-10">
            <h2 className="text-2xl mb-4 text-foreground">{t("method.disclaimer.title")}</h2>
            <div className="bg-destructive/10 border border-destructive/20 rounded-[var(--radius-lg)] p-6">
              <div className="text-sm text-muted-foreground space-y-3 leading-relaxed">
                <p className="text-destructive">
                  <strong>{t("method.disclaimer.important")}</strong>
                </p>
                <p>
                  {t("method.disclaimer.body")}
                </p>
              </div>
            </div>
          </section>

          {/* ── Formula (compact) ── */}
          <section>
            <h3 className="text-lg mb-1 text-foreground">{t("method.formula.title")}</h3>
            <p className="text-xs text-muted-foreground mb-3">
              {t("method.formula.subtitle")}
            </p>
            <div className="relative rounded-[var(--radius-md)] border border-border bg-[hsl(var(--secondary)/0.35)] overflow-hidden">
              <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-border bg-secondary/60">
                <span className="w-2 h-2 rounded-full bg-red-400/70" />
                <span className="w-2 h-2 rounded-full bg-yellow-400/70" />
                <span className="w-2 h-2 rounded-full bg-green-400/70" />
                <span className="ml-2 text-[10px] text-muted-foreground font-mono">tax_engine.py</span>
              </div>
              <pre className="p-4 overflow-x-auto text-[11px] leading-[1.6] font-mono text-foreground/80 whitespace-pre">
                {FORMULA}
              </pre>
            </div>
          </section>
        </article>
      </div>

      {/* ── Disclaimer + Contact Band ──────────────────── */}
      <section className="relative overflow-hidden transition-all duration-500">
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--nordic-accent)] to-[var(--nordic-accent-dark)] pointer-events-none" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center gap-4 sm:gap-8">
          <div className="flex-1 text-center sm:text-left">
            <p className="text-sm leading-relaxed text-white/85">
              {t("home.disclaimer")}
            </p>
          </div>
          <Link
            to="/contact"
            className="flex-shrink-0 inline-flex items-center gap-2 px-5 py-2.5 bg-white/95 text-[var(--nordic-accent-dark)] text-sm font-semibold rounded-[var(--radius-md)] hover:bg-white transition-colors shadow-sm"
          >
            <MessageSquare className="w-4 h-4" />
            {t("home.disclaimer.cta")}
          </Link>
        </div>
      </section>

      <footer className="mt-0 py-8 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-4xl mx-auto text-center text-sm text-muted-foreground">
          <p>{t("method.footer")}</p>
        </div>
      </footer>
    </div>
  );
}
