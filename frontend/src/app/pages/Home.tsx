import { useNavigate, Link } from "react-router";
import { Briefcase, Clock, GraduationCap, ArrowRight, Shield, FileText, Lock, MessageSquare } from "lucide-react";
import { motion } from "motion/react";
import { Header } from "../components/Header";
import { ServiceCard } from "../components/ServiceCard";
import { SalaryPreview } from "../components/SalaryPreview";
import { useI18n } from "../utils/i18n";

export function Home() {
  const navigate = useNavigate();
  const { t, lang } = useI18n();

  const services = [
    {
      id: "fulltime",
      icon: <Briefcase className="w-6 h-6" />,
      titleKey: "home.fulltime.title" as const,
      subtitleKey: "home.fulltime.subtitle" as const,
      descKey: "home.fulltime.desc" as const,
      comingSoon: false,
    },
    {
      id: "parttime",
      icon: <Clock className="w-6 h-6" />,
      titleKey: "home.parttime.title" as const,
      subtitleKey: "home.parttime.subtitle" as const,
      descKey: "home.parttime.desc" as const,
      comingSoon: true,
    },
    {
      id: "student",
      icon: <GraduationCap className="w-6 h-6" />,
      titleKey: "home.student.title" as const,
      subtitleKey: "home.student.subtitle" as const,
      descKey: "home.student.desc" as const,
      comingSoon: false,
    },
  ];

  const trustItems = [
    { icon: <Shield className="w-3.5 h-3.5" />, labelKey: "home.trust.noads" as const },
    { icon: <FileText className="w-3.5 h-3.5" />, labelKey: "home.trust.transparent" as const },
    { icon: <Lock className="w-3.5 h-3.5" />, labelKey: "home.trust.skat" as const },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Subtle background accent */}
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--nordic-accent-light)]/40 to-transparent pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-10">
          <div className="flex flex-col lg:flex-row items-stretch gap-10 lg:gap-16">
            {/* Left — copy */}
            <div className="flex-1 text-center lg:text-left flex flex-col justify-center">
              <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold tracking-tight leading-[1.2] mb-5 relative">
                {(() => {
                  const [line1, line2] = t("home.hero.title").split("\n");
                  return (
                    <>
                      <span className="relative z-10 text-foreground">{line1}</span>
                      {line2 && (
                        <span className="block overflow-hidden">
                          <motion.span
                            initial={{ opacity: 0, y: "-100%" }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
                            className="block relative"
                          >
                            <span className="relative z-0 text-[var(--nordic-accent)] dark:text-[var(--nordic-accent-dark)]">
                              {line2}.
                            </span>
                          </motion.span>
                        </span>
                      )}
                    </>
                  );
                })()}
              </h1>
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="text-base text-muted-foreground leading-relaxed mb-4 max-w-lg mx-auto lg:mx-0 whitespace-pre-line"
              >
                {t("home.hero.subtitle")}
              </motion.p>

              {/* Disclaimer reference — scrolls to the feedback band */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.18 }}
                className="mb-5"
              >
                <button
                  onClick={() => {
                    const el = document.getElementById("disclaimer-band");
                    if (el) {
                      el.scrollIntoView({ behavior: "smooth", block: "center" });
                      el.classList.add("ring-2", "ring-white/50");
                      setTimeout(() => el.classList.remove("ring-2", "ring-white/50"), 2000);
                    }
                  }}
                  className="text-xs text-[var(--nordic-accent)]/80 cursor-pointer drop-shadow-[0_0_6px_var(--nordic-accent)]"
                >
                  {t("home.hero.disclaimer_ref")}
                </button>
              </motion.p>

              {/* Inline trust signals */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.25 }}
                className="flex flex-wrap justify-center lg:justify-start gap-4 text-xs text-muted-foreground"
              >
                {trustItems.map((item) => (
                  <span key={item.labelKey} className="flex items-center gap-1.5">
                    <span className="text-[var(--nordic-accent)]">{item.icon}</span>
                    {t(item.labelKey)}
                  </span>
                ))}
              </motion.div>
            </div>

            {/* Right — live salary preview */}
            <div className="flex-shrink-0 w-full max-w-xs lg:w-auto flex flex-col">
              <SalaryPreview />
            </div>
          </div>
        </div>
      </section>

      {/* ── Service Cards ────────────────────────────────── */}
      <section className="relative px-4 sm:px-6 lg:px-8 py-14 -mt-2">
        {/* Accent background band */}
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--nordic-accent)]/[0.07] via-[var(--nordic-accent)]/[0.05] to-transparent border-y border-[var(--nordic-accent)]/15 pointer-events-none" />

        <div className="relative max-w-5xl mx-auto">
          <h2 className="text-center text-sm font-medium text-muted-foreground uppercase tracking-widest mb-6">
            {t("home.cards.heading")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
            {services.map((s) => (
              <ServiceCard
                key={s.id}
                icon={s.icon}
                title={t(s.titleKey)}
                subtitle={t(s.subtitleKey)}
                description={t(s.descKey)}
                onClick={() => navigate(`/wizard/${s.id}`)}
                comingSoon={s.comingSoon}
                comingSoonLabel={t("home.comingSoon")}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-secondary/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-center mb-10 text-foreground">{t("home.how.title")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {(["step1", "step2", "step3"] as const).map((step, idx) => (
              <div key={step} className="relative text-center">
                <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-[var(--nordic-accent)] text-white flex items-center justify-center text-sm font-semibold">
                  {idx + 1}
                </div>
                <h3 className="mb-1.5 text-card-foreground text-sm font-semibold">
                  {t(`home.how.${step}.title`)}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t(`home.how.${step}.desc`)}
                </p>
                {/* Connector arrow (desktop only, between steps) */}
                {idx < 2 && (
                  <div className="hidden md:flex absolute top-4 -right-6 items-center">
                    <div className="w-4 h-0.5 bg-[var(--nordic-accent)]" />
                    <ArrowRight className="w-5 h-5 -ml-1 text-[var(--nordic-accent)]" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Disclaimer + Feedback Band ──────────────────── */}
      <section id="disclaimer-band" className="relative overflow-hidden transition-all duration-500">
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--nordic-accent)] to-[var(--nordic-accent-dark)] pointer-events-none" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center gap-4 sm:gap-8">
          <div className="flex-1 text-center sm:text-left">
            <p className="text-sm leading-relaxed text-white/85">
              {t("home.disclaimer")}
            </p>
          </div>
          <Link
            to="/feedback"
            className="flex-shrink-0 inline-flex items-center gap-2 px-5 py-2.5 bg-white/95 text-[var(--nordic-accent-dark)] text-sm font-semibold rounded-[var(--radius-md)] hover:bg-white transition-colors shadow-sm"
          >
            <MessageSquare className="w-4 h-4" />
            {t("home.disclaimer.cta")}
          </Link>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 bg-secondary/20">
        <div className="max-w-5xl mx-auto text-center text-sm text-muted-foreground">
          <p>{t("home.footer")}</p>
        </div>
      </footer>
    </div>
  );
}
