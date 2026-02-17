import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { Header } from "../components/Header";
import { Button } from "../components/ui/button";
import { fetchCurve, type CurvePoint } from "../utils/api";
import { useI18n } from "../utils/i18n";

// ── Helpers ──────────────────────────────────────────────────────────

function fmtDKK(n: number): string {
  return new Intl.NumberFormat("da-DK", {
    maximumFractionDigits: 0,
  }).format(n);
}

// Standard conditions used for the quick overview
const STANDARD = {
  kommune: "København",
  pension_pct: 4,
  employer_pension_pct: 8,
  is_church: true,
  is_hourly: false,
  atp_monthly: 94.65,
  max_gross: 1_800_000,
  points: 60,
} as const;

export function QuickOverview() {
  const navigate = useNavigate();
  const { t, lang } = useI18n();
  const [curveData, setCurveData] = useState<CurvePoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCurve(STANDARD)
      .then(setCurveData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t("btn.back")}
        </Button>

        <h1 className="text-3xl font-semibold text-foreground mb-2">
          {t("overview.title")}
        </h1>
        <p className="text-muted-foreground mb-8 max-w-2xl">
          {t("overview.subtitle")}
        </p>

        {/* ── Warning card ──────────────────────────────────── */}
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-[var(--radius-lg)] p-5 mb-8 flex gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">
              {t("overview.warning")}
            </p>
            <p className="text-sm text-muted-foreground">
              {t("overview.assumptions")}
            </p>
            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1 mt-2">
              <li>{t("overview.factor.kommune")}</li>
              <li>{t("overview.factor.pension")}</li>
              <li>{t("overview.factor.extras")}</li>
              <li>{t("overview.factor.benefits")}</li>
              <li>{t("overview.factor.church")}</li>
              <li>{t("overview.factor.atp")}</li>
              <li>{t("overview.factor.deductions")}</li>
            </ul>
          </div>
        </div>

        {/* ── Standard conditions card ──────────────────────── */}
        <div className="bg-secondary/50 border border-border rounded-[var(--radius-lg)] p-5 mb-8">
          <p className="text-sm font-medium text-foreground mb-2">
            {t("overview.conditions")}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground">Kommune:</span>{" "}
              <span className="font-mono text-foreground">København</span>
            </div>
            <div>
              <span className="text-muted-foreground">Pension:</span>{" "}
              <span className="font-mono text-foreground">4% + 8%</span>
            </div>
            <div>
              <span className="text-muted-foreground">Kirkeskat:</span>{" "}
              <span className="font-mono text-foreground">{lang === "da" ? "Ja" : "Yes"}</span>
            </div>
            <div>
              <span className="text-muted-foreground">ATP:</span>{" "}
              <span className="font-mono text-foreground">94,65 kr/md</span>
            </div>
          </div>
        </div>

        {/* ── Chart ─────────────────────────────────────────── */}
        {loading ? (
          <div className="h-[450px] flex items-center justify-center text-muted-foreground">
            {t("btn.calculating")}…
          </div>
        ) : (
          <div className="bg-card border border-border rounded-[var(--radius-lg)] p-6">
            <h3 className="text-foreground font-medium mb-1">
              {t("overview.chartTitle")}
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              {t("overview.chartDesc")}
            </p>
            <ResponsiveContainer width="100%" height={450}>
              <LineChart data={curveData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border)"
                />
                <XAxis
                  dataKey="gross_monthly"
                  tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
                  label={{
                    value:
                      lang === "da"
                        ? "Bruttoløn pr. måned (DKK)"
                        : "Gross monthly salary (DKK)",
                    position: "insideBottom",
                    offset: -5,
                  }}
                  stroke="var(--muted-foreground)"
                  fontSize={12}
                />
                <YAxis
                  tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
                  label={{
                    value: "DKK/" + (lang === "da" ? "md" : "month"),
                    angle: -90,
                    position: "insideLeft",
                  }}
                  stroke="var(--muted-foreground)"
                  fontSize={12}
                />
                <RTooltip
                  formatter={(value: number, name: string) => {
                    const label =
                      name === "gross_monthly"
                        ? lang === "da"
                          ? "Brutto"
                          : "Gross"
                        : name === "net_monthly"
                        ? lang === "da"
                          ? "Netto"
                          : "Net"
                        : name;
                    return [`${fmtDKK(value)} kr`, label];
                  }}
                  labelFormatter={(v: number) =>
                    `${lang === "da" ? "Brutto" : "Gross"}: ${fmtDKK(v)} kr/${lang === "da" ? "md" : "month"}`
                  }
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 13,
                  }}
                />
                {/* Diagonal = gross (no tax) */}
                <Line
                  type="monotone"
                  dataKey="gross_monthly"
                  name="gross_monthly"
                  stroke="var(--muted-foreground)"
                  strokeDasharray="5 5"
                  strokeWidth={1.5}
                  dot={false}
                />
                {/* Net curve */}
                <Line
                  type="monotone"
                  dataKey="net_monthly"
                  name="net_monthly"
                  stroke="var(--nordic-accent)"
                  strokeWidth={2.5}
                  dot={false}
                />
                {/* reference lines at tax thresholds (monthly) */}
                <ReferenceLine
                  x={Math.round(641200 / 12)}
                  stroke="var(--chart-2)"
                  strokeDasharray="4 4"
                  strokeWidth={1}
                  label={{
                    value: "Mellemskat",
                    position: "top",
                    fontSize: 11,
                    fill: "var(--chart-2)",
                  }}
                />
                <ReferenceLine
                  x={Math.round(777900 / 12)}
                  stroke="var(--chart-3)"
                  strokeDasharray="4 4"
                  strokeWidth={1}
                  label={{
                    value: "Topskat",
                    position: "top",
                    fontSize: 11,
                    fill: "var(--chart-3)",
                  }}
                />
              </LineChart>
            </ResponsiveContainer>

            {/* Effective rate mini table */}
            {curveData.length > 0 && (
              <div className="mt-6 overflow-x-auto">
                <p className="text-sm font-medium text-foreground mb-3">
                  {t("overview.rateTable")}
                </p>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-muted-foreground uppercase tracking-wide border-b border-border">
                      <th className="py-2 text-left font-medium">
                        {lang === "da" ? "Brutto/md" : "Gross/month"}
                      </th>
                      <th className="py-2 text-right font-medium">
                        {lang === "da" ? "Netto/md" : "Net/month"}
                      </th>
                      <th className="py-2 text-right font-medium">
                        {lang === "da" ? "Effektiv skat" : "Effective tax"}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {curveData
                      .filter(
                        (_, i) =>
                          i % Math.max(1, Math.floor(curveData.length / 10)) === 0 ||
                          i === curveData.length - 1
                      )
                      .map((p, i) => (
                        <tr
                          key={i}
                          className="border-b border-border/50"
                        >
                          <td className="py-2 font-mono">
                            {fmtDKK(p.gross_monthly)} kr
                          </td>
                          <td className="py-2 text-right font-mono">
                            {fmtDKK(p.net_monthly)} kr
                          </td>
                          <td className="py-2 text-right font-mono text-muted-foreground">
                            {(p.effective_rate * 100).toFixed(1)}%
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── CTA ───────────────────────────────────────────── */}
        <div className="mt-8 flex gap-3 justify-center">
          <Button
            size="lg"
            onClick={() => navigate("/wizard/fulltime")}
          >
            {t("overview.cta")}
          </Button>
        </div>
      </div>
    </div>
  );
}
