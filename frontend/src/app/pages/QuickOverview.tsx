import React, { useEffect, useState, useMemo } from "react";
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
  ReferenceDot,
  ReferenceLine,
  ReferenceArea,
} from "recharts";
import { Header } from "../components/Header";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
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
  max_gross: 1_680_000,   // 140k monthly × 12
  step_monthly: 500,       // 500 DKK granularity
} as const;

export function QuickOverview() {
  const navigate = useNavigate();
  const { t, lang } = useI18n();
  const [curveData, setCurveData] = useState<CurvePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [grossInput, setGrossInput] = useState("42000");

  useEffect(() => {
    fetchCurve(STANDARD)
      .then(setCurveData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Find the closest curve point for the typed gross
  const liveResult = useMemo(() => {
    const gross = Number(grossInput) || 0;
    if (!curveData.length || gross <= 0) return null;
    // Find closest
    let best = curveData[0];
    let bestDist = Math.abs(best.gross_monthly - gross);
    for (const p of curveData) {
      const d = Math.abs(p.gross_monthly - gross);
      if (d < bestDist) { best = p; bestDist = d; }
    }
    return best;
  }, [grossInput, curveData]);

  const grossNum = Number(grossInput) || 0;
  const netNum = liveResult?.net_monthly ?? 0;
  const taxNum = grossNum - netNum;
  const effRate = liveResult?.effective_rate ?? 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t("btn.backHome")}
        </Button>

        <h1 className="text-3xl font-semibold text-foreground mb-2">
          {t("overview.title")}
        </h1>
        <p className="text-muted-foreground mb-8 max-w-2xl">
          {t("overview.subtitle")}
        </p>

        {/* ── Live gross → net calculator ──────────────────── */}
        <div className="bg-card border border-border rounded-[var(--radius-xl)] p-6 sm:p-8 mb-8 shadow-[var(--shadow-md)]">
          <p className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wide">
            {lang === "da" ? "Hurtig beregning" : "Quick calculation"}
          </p>
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 sm:gap-6">
            <div className="w-full sm:w-48">
              <label className="text-sm text-muted-foreground mb-1.5 block">
                {lang === "da" ? "Bruttoløn / md" : "Gross / month"}
              </label>
              <div className="relative">
                <Input
                  type="number"
                  min="0"
                  step="1000"
                  value={grossInput}
                  onChange={(e) => setGrossInput(e.target.value)}
                  className="h-14 text-xl font-mono pr-10"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">kr</span>
              </div>
            </div>
            <div className="flex-1 grid grid-cols-2 gap-4 w-full">
              <div className="bg-secondary/60 rounded-[var(--radius-md)] p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">
                  {lang === "da" ? "Netto / md" : "Net / month"}
                </p>
                <p className="text-2xl font-mono font-semibold text-[var(--nordic-accent)]">
                  {fmtDKK(netNum)}
                </p>
                <p className="text-xs text-muted-foreground">kr</p>
              </div>
              <div className="bg-secondary/60 rounded-[var(--radius-md)] p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">
                  {lang === "da" ? "Effektiv skat" : "Effective tax"}
                </p>
                <p className="text-2xl font-mono font-semibold text-foreground">
                  {effRate.toFixed(1)}%
                </p>
                {grossNum > 0 && (() => {
                  const mellem = Math.round(641200 / 12);
                  const top = Math.round(777900 / 12);
                  const b = grossNum >= top
                    ? { label: 'Topskat', color: '#ef4444' }
                    : grossNum >= mellem
                      ? { label: 'Mellemskat', color: '#f59e0b' }
                      : { label: 'Bundskat', color: '#22c55e' };
                  return (
                    <p className="text-xs mt-1.5 font-medium flex items-center justify-center gap-1" style={{ color: b.color }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: b.color, display: 'inline-block' }} />
                      {b.label}
                    </p>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>

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
              <LineChart data={curveData} margin={{ top: 5, right: 20, bottom: 20, left: 10 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border)"
                />
                <XAxis
                  dataKey="gross_monthly"
                  type="number"
                  domain={[0, 140000]}
                  ticks={Array.from({ length: 15 }, (_, i) => i * 10000)}
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
                  type="number"
                  tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
                  domain={[0, 140000]}
                  ticks={Array.from({ length: 15 }, (_, i) => i * 10000)}
                  label={{
                    value: "DKK/" + (lang === "da" ? "md" : "month"),
                    angle: -90,
                    position: "insideLeft",
                  }}
                  stroke="var(--muted-foreground)"
                  fontSize={12}
                />
                <RTooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0]?.payload as CurvePoint | undefined;
                    if (!d) return null;
                    const tax = d.gross_monthly - d.net_monthly;
                    const mellemThreshold = Math.round(641200 / 12);
                    const topThreshold = Math.round(777900 / 12);
                    const bracket = d.gross_monthly >= topThreshold
                      ? { label: 'Topskat', color: '#ef4444' }
                      : d.gross_monthly >= mellemThreshold
                        ? { label: 'Mellemskat', color: '#f59e0b' }
                        : { label: 'Bundskat', color: '#22c55e' };
                    return (
                      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13, padding: '10px 14px', lineHeight: 1.6 }}>
                        <p style={{ fontSize: 11, color: bracket.color, fontWeight: 600, marginBottom: 2, display: 'flex', alignItems: 'center', gap: 5 }}>
                          <span style={{ width: 8, height: 8, borderRadius: '50%', background: bracket.color, display: 'inline-block' }} />
                          {bracket.label}
                        </p>
                        <p style={{ fontWeight: 500 }}>{lang === 'da' ? 'Brutto' : 'Gross'}: {fmtDKK(d.gross_monthly)} kr</p>
                        <p style={{ color: 'var(--nordic-accent)', fontWeight: 500 }}>{lang === 'da' ? 'Netto' : 'Net'}: {fmtDKK(d.net_monthly)} kr</p>
                        <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>{lang === 'da' ? 'Effektiv skat' : 'Effective tax'}: {d.effective_rate.toFixed(1)}%</p>
                      </div>
                    );
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
                  tooltipType="none"
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
                {/* User's typed gross position */}
                {grossNum > 0 && liveResult && (
                  <ReferenceDot
                    x={liveResult.gross_monthly}
                    y={liveResult.net_monthly}
                    r={6}
                    fill="var(--destructive)"
                    stroke="white"
                    strokeWidth={2}
                  />
                )}
                {/* Tax bracket zones */}
                <ReferenceArea x1={0} x2={Math.round(641200 / 12)} fill="#22c55e" fillOpacity={0.04} />
                <ReferenceArea x1={Math.round(641200 / 12)} x2={Math.round(777900 / 12)} fill="#f59e0b" fillOpacity={0.06} />
                <ReferenceArea x1={Math.round(777900 / 12)} x2={140000} fill="#ef4444" fillOpacity={0.06} />
                <ReferenceLine
                  x={Math.round(641200 / 12)}
                  stroke="#f59e0b"
                  strokeDasharray="6 4"
                  strokeWidth={1}
                  strokeOpacity={0.6}
                />
                <ReferenceLine
                  x={Math.round(777900 / 12)}
                  stroke="#ef4444"
                  strokeDasharray="6 4"
                  strokeWidth={1}
                  strokeOpacity={0.6}
                />
              </LineChart>
            </ResponsiveContainer>
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
