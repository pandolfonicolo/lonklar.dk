import React from "react";
import { useNavigate, Link } from "react-router";
import { ArrowLeft, Shield, FileText, Lock, Mail, Github, ExternalLink, ArrowRight } from "lucide-react";
import { Header } from "../components/Header";
import { Button } from "../components/ui/button";
import { useI18n } from "../utils/i18n";

export function About() {
  const navigate = useNavigate();
  const { t, lang } = useI18n();

  React.useEffect(() => {
    document.title = "About Lonklar – Free Danish Salary Calculator | lønklar.dk";
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t("btn.backHome")}
        </Button>

        <article className="space-y-10">
          {/* ── Hero ── */}
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3 tracking-tight">
              {lang === "da" ? "Om Lonklar" : "About Lonklar"}
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">
              {lang === "da"
                ? "Lonklar (lønklar.dk) er en gratis dansk nettolønsberegner — bygget til at gøre det nemt at forstå din danske lønseddel."
                : "Lonklar (lønklar.dk) is a free Danish net salary calculator — built to make it easy to understand your Danish payslip."
              }
            </p>
          </div>

          {/* ── What is Lonklar? ── */}
          <section className="bg-card border border-border rounded-[var(--radius-lg)] p-6 sm:p-8 space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              {lang === "da" ? "Hvad er Lonklar?" : "What is Lonklar?"}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {lang === "da"
                ? "Lonklar er en online beregner der estimerer din danske nettoløn efter skat. Uanset om du er fuldtidsansat, deltidsansat eller studerende — Lonklar udregner din indkomstskat, AM-bidrag, pension, feriepenge og meget mere, baseret på de officielle SKAT 2026-satser."
                : "Lonklar is an online calculator that estimates your Danish net pay after tax. Whether you work full-time, part-time, or are a student — Lonklar computes your income tax, AM-bidrag, pension, feriepenge, and more using the official SKAT 2026 rates."
              }
            </p>
            <p className="text-muted-foreground leading-relaxed">
              {lang === "da"
                ? "Tjenesten er 100% gratis, uden reklamer, uden cookies og uden at gemme personlige data. Du taster din bruttoløn ind, og Lonklar viser et klart overblik over hvad der lander på din konto."
                : "The service is 100% free — no ads, no cookies, and no personal data stored. You enter your gross salary and Lonklar shows a clear breakdown of what lands in your bank account."
              }
            </p>
          </section>

          {/* ── Who is it for? ── */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              {lang === "da" ? "Hvem er Lonklar til?" : "Who is Lonklar for?"}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                {
                  title: lang === "da" ? "Nytilkomne i Danmark" : "Newcomers to Denmark",
                  desc: lang === "da"
                    ? "Forstå dit første løntjek og hvordan det danske skattesystem virker."
                    : "Understand your first payslip and how the Danish tax system works.",
                },
                {
                  title: lang === "da" ? "Studerende med SU" : "Students on SU",
                  desc: lang === "da"
                    ? "Find ud af hvor mange timer du kan arbejde uden at overskride dit fribeløb."
                    : "Find out how many hours you can work without exceeding your fribeløb (earnings threshold).",
                },
                {
                  title: lang === "da" ? "Jobskiftere" : "Job switchers",
                  desc: lang === "da"
                    ? "Sammenlign nettolønnen for forskellige bruttolønninger og kommuner."
                    : "Compare net pay across different gross salaries and municipalities.",
                },
                {
                  title: lang === "da" ? "Alle der vil vide mere" : "Anyone curious",
                  desc: lang === "da"
                    ? "Lonklar er for alle der vil forstå, hvor pengene går hen."
                    : "Lonklar is for anyone who wants to understand where the money goes.",
                },
              ].map((item) => (
                <div key={item.title} className="bg-secondary/30 border border-border rounded-[var(--radius-md)] p-4">
                  <h3 className="text-sm font-semibold text-foreground mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ── Privacy & trust ── */}
          <section className="bg-card border border-border rounded-[var(--radius-lg)] p-6 sm:p-8 space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              {lang === "da" ? "Privatliv & tillid" : "Privacy & trust"}
            </h2>
            <div className="space-y-3">
              {[
                { icon: <Shield className="w-5 h-5 text-[var(--nordic-accent)]" />, text: lang === "da" ? "Ingen reklamer, ingen cookies, ingen sporing" : "No ads, no cookies, no tracking" },
                { icon: <Lock className="w-5 h-5 text-[var(--nordic-accent)]" />, text: lang === "da" ? "Ingen persondata gemmes — beregninger sker i realtid og kassereres" : "No personal data stored — calculations happen in real time and are discarded" },
                { icon: <FileText className="w-5 h-5 text-[var(--nordic-accent)]" />, text: lang === "da" ? "Åben metode — se præcis hvordan beregningen virker" : "Open methodology — see exactly how the calculation works" },
              ].map((item) => (
                <div key={item.text} className="flex items-start gap-3">
                  <div className="mt-0.5">{item.icon}</div>
                  <p className="text-muted-foreground">{item.text}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ── FAQ ── */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              {lang === "da" ? "Ofte stillede spørgsmål" : "Frequently Asked Questions"}
            </h2>
            <div className="space-y-4">
              {[
                {
                  q: lang === "da" ? "Er Lonklar gratis?" : "Is Lonklar free?",
                  a: lang === "da"
                    ? "Ja, 100% gratis. Ingen abonnement, ingen skjulte gebyrer."
                    : "Yes, 100% free. No subscription, no hidden fees.",
                },
                {
                  q: lang === "da" ? "Hvor nøjagtigt er estimatet?" : "How accurate is the estimate?",
                  a: lang === "da"
                    ? "Lonklar er baseret på officielle SKAT 2026-satser og er typisk inden for ±1,5% af det faktiske resultat. Det er et estimat, ikke et officielt skattedokument."
                    : "Lonklar uses official SKAT 2026 rates and is typically within ±1.5% of the actual result. It is an estimate, not an official tax document.",
                },
                {
                  q: lang === "da" ? "Gemmer I mine data?" : "Do you store my data?",
                  a: lang === "da"
                    ? "Nej. Dine tal sendes til vores API for beregning og kasseres umiddelbart efter. Vi bruger privacy-venlig analytics (Umami) uden cookies."
                    : "No. Your numbers are sent to our API for computation and immediately discarded. We use privacy-friendly analytics (Umami) with no cookies.",
                },
                {
                  q: lang === "da" ? "Hvem lavede Lonklar?" : "Who made Lonklar?",
                  a: lang === "da"
                    ? "Lonklar er bygget af en uafhængig udvikler i Danmark. Projektet er ikke tilknyttet SKAT eller nogen offentlig myndighed."
                    : "Lonklar is built by an independent developer based in Denmark. The project is not affiliated with SKAT or any government authority.",
                },
                {
                  q: lang === "da" ? "Kan jeg bidrage eller rapportere fejl?" : "Can I contribute or report issues?",
                  a: lang === "da"
                    ? "Selvfølgelig! Brug kontaktsiden til at sende feedback, eller besøg vores GitHub."
                    : "Absolutely! Use the contact page to send feedback, or visit our GitHub.",
                },
              ].map(({ q, a }) => (
                <div key={q} className="bg-secondary/20 border border-border rounded-[var(--radius-md)] p-4">
                  <h3 className="text-sm font-semibold text-foreground mb-1">{q}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{a}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ── Contact ── */}
          <section className="bg-card border border-border rounded-[var(--radius-lg)] p-6 sm:p-8 space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              {lang === "da" ? "Kontakt" : "Contact"}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {lang === "da"
                ? "Har du spørgsmål, feedback eller idéer? Skriv til os via kontaktsiden."
                : "Have questions, feedback, or ideas? Reach out via the contact page."
              }
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/contact">
                <Button variant="outline" size="sm" className="gap-2">
                  <Mail className="w-4 h-4" />
                  {lang === "da" ? "Kontaktside" : "Contact page"}
                  <ArrowRight className="w-3 h-3" />
                </Button>
              </Link>
            </div>
          </section>

          {/* ── CTA ── */}
          <div className="text-center py-6">
            <p className="text-muted-foreground mb-4">
              {lang === "da"
                ? "Klar til at beregne din løn?"
                : "Ready to calculate your salary?"
              }
            </p>
            <Button size="lg" onClick={() => navigate("/")}>
              {lang === "da" ? "Beregn din nettoløn" : "Calculate your net salary"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </article>
      </div>
    </div>
  );
}
