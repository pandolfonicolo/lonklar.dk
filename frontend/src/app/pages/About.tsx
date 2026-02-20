import React from "react";
import { useNavigate, Link } from "react-router";
import { ArrowLeft, Shield, FileText, Lock, Mail, Github, ExternalLink, ArrowRight, Linkedin } from "lucide-react";
import { Header } from "../components/Header";
import { Button } from "../components/ui/button";
import { useI18n } from "../utils/i18n";

export function About() {
  const navigate = useNavigate();
  const { t } = useI18n();

  React.useEffect(() => {
    document.title = "About Lonklar – Free Danish Salary Calculator | lønklar.dk";
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
                href="https://github.com/pandolfonicolo/udbetalt.dk"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="sm" className="gap-2">
                  <Github className="w-4 h-4" />
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
              <a
                href="https://www.linkedin.com/in/nicolopandolfo/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="sm" className="gap-2">
                  <Linkedin className="w-4 h-4" />
                  LinkedIn
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </a>
              <a
                href="https://github.com/pandolfonicolo/udbetalt.dk"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="sm" className="gap-2">
                  <Github className="w-4 h-4" />
                  GitHub
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </a>
            </div>
          </section>

          {/* CTA */}
          <div className="text-center py-6">
            <p className="text-muted-foreground mb-4">
              {t("about.cta")}
            </p>
            <Button size="lg" onClick={() => navigate("/")}>
              {t("about.cta.btn")}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </article>
      </div>
    </div>
  );
}
