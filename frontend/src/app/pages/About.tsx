import React from "react";
import { useNavigate, Link } from "react-router";
import { ArrowLeft, Shield, FileText, Lock, Mail, ExternalLink, ArrowRight, MessageSquare } from "lucide-react";
import { Header } from "../components/Header";
import { Button } from "../components/ui/button";
import { useI18n } from "../utils/i18n";
import { usePageMeta } from "../utils/usePageMeta";

export function About() {
  const navigate = useNavigate();
  const { t } = useI18n();

  usePageMeta({
    title: "About Lonklar – Free Danish Salary Calculator | lønklar.dk",
    description: "Learn about Lonklar — a free, open, privacy-friendly Danish salary calculator. No ads, no tracking, aligned with official SKAT 2026 tax rates.",
    path: "/about",
  });

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t("btn.backHome")}
        </Button>

        <article className="space-y-10">
          {/* Hero */}
          <div className="mb-10">
            <h1 className="text-3xl sm:text-3xl font-bold text-foreground mb-3 tracking-tight">
              {t("about.title")}
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">
              {t("about.subtitle")}
            </p>
          </div>

          {/* What is Lonklar? */}
          <section className="bg-card border border-border rounded-[var(--radius-lg)] p-6 sm:p-8 space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              {t("about.what.title")}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {t("about.what.p1")}
            </p>
            <p className="text-muted-foreground leading-relaxed">
              {t("about.what.p2")}
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t("about.privacy.analytics")}{" "}
              <a
                href="https://umami.is/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--nordic-accent)] hover:underline inline-flex items-center gap-1"
              >
                umami.is <ExternalLink className="w-3 h-3" />
              </a>
            </p>
          </section>

          {/* Who is it for? */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              {t("about.who.title")}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {([
                { titleKey: "about.who.newcomers" as const, descKey: "about.who.newcomers.desc" as const },
                { titleKey: "about.who.students" as const, descKey: "about.who.students.desc" as const },
                { titleKey: "about.who.switchers" as const, descKey: "about.who.switchers.desc" as const },
                { titleKey: "about.who.curious" as const, descKey: "about.who.curious.desc" as const },
              ]).map((item) => (
                <div key={item.titleKey} className="bg-secondary/30 border border-border rounded-[var(--radius-md)] p-4">
                  <h3 className="text-sm font-semibold text-foreground mb-1">{t(item.titleKey)}</h3>
                  <p className="text-sm text-muted-foreground">{t(item.descKey)}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Privacy & trust */}
          <section className="bg-card border border-border rounded-[var(--radius-lg)] p-6 sm:p-8 space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              {t("about.privacy.title")}
            </h2>
            <div className="space-y-3">
              {([
                { icon: <Shield className="w-5 h-5 text-[var(--nordic-accent)]" />, textKey: "about.privacy.noads" as const },
                { icon: <Lock className="w-5 h-5 text-[var(--nordic-accent)]" />, textKey: "about.privacy.nodata" as const },
                { icon: <FileText className="w-5 h-5 text-[var(--nordic-accent)]" />, textKey: "about.privacy.open" as const },
              ]).map((item) => (
                <div key={item.textKey} className="flex items-start gap-3">
                  <div className="mt-0.5">{item.icon}</div>
                  <p className="text-muted-foreground">{t(item.textKey)}</p>
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground pt-2 border-t border-border">
              {t("about.faq.accuracy.a")}{" "}
              <a
                href="https://skat.dk/hjaelp/satser"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--nordic-accent)] hover:underline inline-flex items-center gap-1"
              >
                skat.dk <ExternalLink className="w-3 h-3" />
              </a>
            </p>
          </section>

          {/* Open source */}
          <section className="bg-card border border-border rounded-[var(--radius-lg)] p-6 sm:p-8 space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              {t("about.opensource.title")}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {t("about.opensource.desc")}
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="https://github.com/pandolfonicolo/lonklar.dk"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="sm" className="gap-2">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                  GitHub
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </a>
            </div>
          </section>

          {/* FAQ */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              {t("about.faq.title")}
            </h2>
            <div className="space-y-4">
              {([
                { qKey: "about.faq.free.q" as const, aKey: "about.faq.free.a" as const },
                { qKey: "about.faq.accuracy.q" as const, aKey: "about.faq.accuracy.a" as const },
                { qKey: "about.faq.data.q" as const, aKey: "about.faq.data.a" as const },
                { qKey: "about.faq.who.q" as const, aKey: "about.faq.who.a" as const },
                { qKey: "about.faq.contribute.q" as const, aKey: "about.faq.contribute.a" as const },
              ]).map(({ qKey, aKey }) => (
                <div key={qKey} className="bg-secondary/20 border border-border rounded-[var(--radius-md)] p-4">
                  <h3 className="text-sm font-semibold text-foreground mb-1">{t(qKey)}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{t(aKey)}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Contact */}
          <section className="bg-card border border-border rounded-[var(--radius-lg)] p-6 sm:p-8 space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              {t("about.contact.title")}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {t("about.contact.desc")}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/contact">
                <Button variant="outline" size="sm" className="gap-2">
                  <Mail className="w-4 h-4" />
                  {t("about.contact.page")}
                  <ArrowRight className="w-3 h-3" />
                </Button>
              </Link>
            </div>
          </section>

          {/* CTA */}
          <div className="text-center py-6">
            <p className="text-muted-foreground mb-4">
              {t("about.cta")}
            </p>
            <Button size="lg" onClick={() => {
              navigate("/");
              setTimeout(() => {
                const el = document.getElementById("calculators");
                if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
              }, 100);
            }}>
              {t("about.cta.btn")}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
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

      {/* ── Footer ───────────────────────────────────────── */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 bg-secondary/20">
        <div className="max-w-5xl mx-auto text-center text-sm text-muted-foreground space-y-3">
          <p>{t("home.footer")}</p>
          <div className="flex items-center justify-center gap-4">
            <a
              href="https://github.com/pandolfonicolo/lonklar.dk"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
              GitHub
            </a>
            <span className="text-border">·</span>
            <a
              href="https://www.linkedin.com/in/nicolopandolfo/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              LinkedIn
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
