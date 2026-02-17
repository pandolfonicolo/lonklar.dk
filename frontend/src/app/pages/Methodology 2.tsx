import { Header } from "../components/Header";
import { ArrowLeft } from "lucide-react";
import { Button } from "../components/ui/button";
import { useNavigate } from "react-router";

export function Methodology() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <article className="prose prose-slate max-w-none">
          <div className="mb-8">
            <h1 className="text-4xl mb-4 text-foreground">Methodology</h1>
            <p className="text-lg text-muted-foreground">
              Transparency in our calculations and assumptions
            </p>
          </div>

          <div className="bg-card border border-border rounded-[var(--radius-lg)] p-8 mb-8">
            <h2 className="text-2xl mb-4 text-foreground">About this tool</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              DK Income Calculator is a free tool that helps people working in
              Denmark understand their salary, tax, and total compensation. We
              use the official 2026 rates from SKAT.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              All calculations are indicative and may vary depending on your
              specific situation. Always verify with SKAT or a tax advisor.
            </p>
          </div>

          <section className="mb-8">
            <h2 className="text-2xl mb-4 text-foreground">Calculation methods</h2>
            <div className="space-y-6">
              <div className="bg-secondary/30 rounded-[var(--radius-lg)] p-6">
                <h3 className="text-xl mb-3 text-foreground">Full-time salary</h3>
                <div className="text-sm text-muted-foreground space-y-2 leading-relaxed">
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>AM-bidrag: 8.0 % of gross income minus employee pension</li>
                    <li>Ferietillæg: 1 % of gross salary</li>
                    <li>Bundskat: 12.01 % (income after AM minus personfradrag)</li>
                    <li>Kommuneskat: actual kommun rate applied to reduced base</li>
                    <li>Progressive brackets: mellemskat 7.5 %, topskat 7.5 %, toptopskat 5 %</li>
                    <li>Skatteloft: combined state + municipal rate capped at 44.57 %</li>
                    <li>Beskæftigelsesfradrag: 12.75 % (max 63,300 kr/yr)</li>
                    <li>Jobfradrag: 4.50 % (max 3,100 kr/yr)</li>
                    <li>ATP: deducted from pay</li>
                  </ul>
                </div>
              </div>

              <div className="bg-secondary/30 rounded-[var(--radius-lg)] p-6">
                <h3 className="text-xl mb-3 text-foreground">Part-time / hourly</h3>
                <div className="text-sm text-muted-foreground space-y-2 leading-relaxed">
                  <p>Same tax engine as full-time, with these differences:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Feriepenge: 12.5 % of gross (instead of 1 % ferietillæg)</li>
                    <li>ATP may not apply if under 9 h/week</li>
                  </ul>
                </div>
              </div>

              <div className="bg-secondary/30 rounded-[var(--radius-lg)] p-6">
                <h3 className="text-xl mb-3 text-foreground">Student (SU + work)</h3>
                <div className="text-sm text-muted-foreground space-y-2 leading-relaxed">
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>SU is not subject to AM-bidrag</li>
                    <li>Work income is subject to AM-bidrag</li>
                    <li>Fribeløb (earned income limit): checked against annual threshold</li>
                    <li>Excess above fribeløb triggers krone-for-krone SU repayment</li>
                    <li>Repayment interest: 9.75 % p.a.</li>
                    <li>Personfradrag covers combined SU + work income</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl mb-4 text-foreground">Data sources</h2>
            <div className="bg-card border border-border rounded-[var(--radius-lg)] p-6">
              <ul className="list-disc list-inside space-y-1 ml-2 text-sm text-muted-foreground">
                <li>skat.dk/hjaelp/satser — official tax rates</li>
                <li>skm.dk — municipal tax rates for all 98 kommuner</li>
                <li>su.dk/satser — SU grant amounts and fribeløb limits</li>
                <li>lifeindenmark.borger.dk — SU repayment interest rate</li>
              </ul>
              <p className="mt-4 text-xs text-muted-foreground">
                Last updated: February 2026
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl mb-4 text-foreground">Disclaimer</h2>
            <div className="bg-destructive/10 border border-destructive/20 rounded-[var(--radius-lg)] p-6">
              <div className="text-sm text-muted-foreground space-y-3 leading-relaxed">
                <p className="text-destructive">
                  <strong>Important:</strong> All calculations are indicative and without guarantee.
                </p>
                <p>
                  Tax calculations can be complex and depend on many individual
                  factors. This tool is designed as an estimate and should not
                  replace professional advice.
                </p>
              </div>
            </div>
          </section>
        </article>
      </div>

      <footer className="mt-16 py-8 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-4xl mx-auto text-center text-sm text-muted-foreground">
          <p>© 2026 DK Income Calculator. Open source project.</p>
        </div>
      </footer>
    </div>
  );
}
