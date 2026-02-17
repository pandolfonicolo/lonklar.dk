import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router";
import {
  ArrowLeft,
  TrendingDown,
  BarChart3,
  Euro,
  Calendar,
  HelpCircle,
  Wallet,
  ChevronDown,
  Umbrella,
  CheckCircle,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
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
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Header } from "../components/Header";
import { Button } from "../components/ui/button";
import { Switch } from "../components/ui/switch";
import { Label } from "../components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../components/ui/collapsible";
import {
  fetchMeta,
  fetchCurve,
  fetchHoursCurve,
  type Meta,
  type TaxResult,
  type StudentResult,
  type CurvePoint,
  type HoursCurvePoint,
} from "../utils/api";
import { useI18n } from "../utils/i18n";

// ── Helpers ──────────────────────────────────────────────────────────

function fmtDKK(n: number, decimals = 0): string {
  return new Intl.NumberFormat("da-DK", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n);
}

function fmtEUR(n: number, rate: number): string {
  return `€${(n / rate).toLocaleString("da-DK", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

/** Smart axis label: use M for millions, k for thousands */
function fmtAxisDKK(v: number): string {
  const abs = Math.abs(v);
  if (abs >= 1_000_000) return `${(v / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (abs >= 1_000) return `${(v / 1_000).toFixed(0)}k`;
  return String(v);
}

function pct(n: number): string {
  return `${n.toFixed(2)} %`;
}

type Row = {
  label: string;
  value: number;
  prefix?: string;
  bold?: boolean;
  color?: string;
  indent?: boolean;
  spacer?: boolean;
};

// ── TAX GLOSSARY (i18n keys) ─────────────────────────────────────────

const GLOSSARY_KEYS = [
  "am", "bundskat", "kommuneskat", "kirkeskat", "mellemskat",
  "topskat", "toptopskat", "personfradrag", "beskfradrag", "jobfradrag",
  "befordring", "fagforening", "ligningsfradrag", "skatteloft",
  "feriepenge", "ferietillaeg", "atp", "fribeloeb",
] as const;

// ── Build breakdown rows ─────────────────────────────────────────────

function employeeBreakdown(r: TaxResult): Row[] {
  const ferieLabel =
    r.feriepenge > r.gross_annual * 0.02
      ? "Feriepenge (12.5%)"
      : "Ferietillæg (1%)";
  const rows: Row[] = [
    { label: "Gross salary", value: r.gross_annual, color: "var(--chart-1)" },
    { label: `+ ${ferieLabel}`, value: r.feriepenge, color: "var(--chart-1)" },
  ];
  if (r.other_pay > 0)
    rows.push({ label: "+ Other pay", value: r.other_pay });
  if (r.pretax_deductions > 0)
    rows.push({
      label: "- Pre-tax deductions",
      value: -r.pretax_deductions,
    });
  if (r.taxable_benefits > 0)
    rows.push({
      label: "+ Taxable benefits (non-cash)",
      value: r.taxable_benefits,
    });
  rows.push({
    label: "= Total gross (taxable)",
    value: r.total_gross,
    bold: true,
    color: "var(--chart-1)",
  });
  rows.push({ label: "", value: 0, spacer: true });
  rows.push({
    label: "- Your pension",
    value: -r.employee_pension,
    color: "var(--chart-2)",
  });
  rows.push({
    label: "- AM-bidrag (8%)",
    value: -r.am_bidrag,
    color: "var(--chart-3)",
  });
  if (r.atp_annual > 0)
    rows.push({ label: "- ATP", value: -r.atp_annual });
  rows.push({
    label: "= Income after AM",
    value: r.income_after_am,
    bold: true,
    color: "var(--chart-1)",
  });
  rows.push({ label: "", value: 0, spacer: true });
  rows.push({
    label: "Beskæftigelsesfradrag",
    value: r.beskaeft_fradrag,
    indent: true,
  });
  rows.push({
    label: "Jobfradrag",
    value: r.job_fradrag,
    indent: true,
  });
  if (r.befordring > 0)
    rows.push({
      label: "Befordringsfradrag",
      value: r.befordring,
      indent: true,
    });
  if (r.union_deduction > 0)
    rows.push({
      label: "Fagforening / A-kasse",
      value: r.union_deduction,
      indent: true,
    });
  rows.push({ label: "", value: 0, spacer: true });
  rows.push({
    label: "- Bundskat (12.01%)",
    value: -r.bundskat,
    color: "var(--chart-3)",
  });
  rows.push({
    label: "- Kommuneskat",
    value: -r.kommuneskat,
    color: "var(--chart-4)",
  });
  if (r.kirkeskat > 0)
    rows.push({
      label: "- Kirkeskat",
      value: -r.kirkeskat,
      color: "var(--chart-5)",
    });
  if (r.mellemskat > 0)
    rows.push({
      label: "- Mellemskat (7.5%)",
      value: -r.mellemskat,
      color: "var(--chart-3)",
    });
  if (r.topskat > 0)
    rows.push({
      label: "- Topskat (7.5%)",
      value: -r.topskat,
      color: "var(--chart-3)",
    });
  if (r.toptopskat > 0)
    rows.push({
      label: "- Toptopskat (5%)",
      value: -r.toptopskat,
      color: "var(--chart-3)",
    });
  rows.push({ label: "", value: 0, spacer: true });
  rows.push({
    label: "Total income tax",
    value: -r.total_income_tax,
    bold: true,
    color: "var(--chart-3)",
  });
  rows.push({
    label: "TOTAL DEDUCTIONS",
    value: -r.total_deductions,
    bold: true,
    color: "var(--chart-3)",
  });
  if (r.aftertax_deductions > 0)
    rows.push({
      label: "- After-tax deductions",
      value: -r.aftertax_deductions,
    });
  rows.push({ label: "", value: 0, spacer: true });
  rows.push({
    label: "NET INCOME",
    value: r.net_annual,
    bold: true,
    color: "var(--chart-1)",
  });
  return rows;
}

function studentBreakdown(r: StudentResult): Row[] {
  const rows: Row[] = [
    {
      label: "SU annual (gross)",
      value: r.su_annual_gross,
      color: "var(--chart-1)",
    },
  ];
  if (r.work_gross_annual > 0) {
    rows.push(
      {
        label: "Work annual (gross)",
        value: r.work_gross_annual,
        color: "var(--chart-1)",
      },
      {
        label: "+ Work feriepenge (12.5%)",
        value: r.work_feriepenge,
        color: "var(--chart-1)",
      },
      {
        label: "- Work pension",
        value: -r.work_pension,
        color: "var(--chart-2)",
      },
      {
        label: "- AM-bidrag (work, 8%)",
        value: -r.work_am_bidrag,
        color: "var(--chart-3)",
      },
    );
  }
  rows.push({ label: "", value: 0, spacer: true });
  rows.push({
    label: "Annual fribeløb",
    value: r.aars_fribeloeb,
    indent: true,
  });
  if (r.over_fribeloeb) {
    rows.push({
      label: "Fribeløb excess",
      value: r.fribeloeb_excess,
      color: "var(--destructive)",
    });
    rows.push({
      label: "- SU repayment",
      value: -r.su_repayment,
      color: "var(--destructive)",
    });
    rows.push({
      label: "- Repayment interest (9.75%)",
      value: -r.su_repayment_interest,
      color: "var(--destructive)",
    });
  }
  rows.push({ label: "", value: 0, spacer: true });
  rows.push({
    label: "- Bundskat",
    value: -r.bundskat,
    color: "var(--chart-3)",
  });
  rows.push({
    label: "- Kommuneskat",
    value: -r.kommuneskat,
    color: "var(--chart-4)",
  });
  if (r.kirkeskat > 0)
    rows.push({
      label: "- Kirkeskat",
      value: -r.kirkeskat,
      color: "var(--chart-5)",
    });
  if (r.mellemskat > 0)
    rows.push({ label: "- Mellemskat", value: -r.mellemskat });
  rows.push({
    label: "Total income tax",
    value: -r.total_income_tax,
    bold: true,
    color: "var(--chart-3)",
  });
  rows.push({ label: "", value: 0, spacer: true });
  rows.push({
    label: "NET INCOME",
    value: r.net_annual,
    bold: true,
    color: "var(--chart-1)",
  });
  return rows;
}

// ── Salary breakdown pie chart ───────────────────────────────────────

const PIE_COLORS = [
  "var(--nordic-accent)",   // net pay — primary accent
  "var(--chart-3)",         // income tax — matches bundskat/tax rows
  "var(--chart-4)",         // AM-bidrag — warm tone
  "var(--chart-2)",         // pension — matches pension row
  "var(--chart-5)",         // ATP — steel/teal
  "var(--chart-1)",         // church tax — primary blue/sage
  "var(--muted-foreground)",// after-tax deductions — neutral
];

function SalaryBreakdownPie({ r, isStudent, period, showEur, eurRate }: { r: TaxResult | StudentResult; isStudent: boolean; period: "monthly" | "annual"; showEur: boolean; eurRate: number }) {
  const { t } = useI18n();

  if (isStudent) return null;

  const tr = r as TaxResult;
  const div = period === "annual" ? 1 : 12;
  const grossVal = Math.round((tr.gross_annual + tr.feriepenge) / div);
  const netVal = Math.round(tr.net_annual / div);
  const incomeTax = Math.round(tr.total_income_tax / div);
  const am = Math.round(tr.am_bidrag / div);
  const pension = Math.round(tr.employee_pension / div);
  const atp = Math.round(tr.atp_annual / div);
  const kirkeskat = Math.round(tr.kirkeskat / div);
  const afterTax = Math.round((tr.aftertax_deductions || 0) / div);

  type Slice = { key: string; value: number };
  const data: Slice[] = [
    { key: "chart.pie.net", value: netVal },
    { key: "chart.pie.incomeTax", value: incomeTax },
    { key: "chart.pie.am", value: am },
  ];
  if (pension > 0) data.push({ key: "chart.pie.pension", value: pension });
  if (atp > 0) data.push({ key: "chart.pie.atp", value: atp });
  if (kirkeskat > 0) data.push({ key: "chart.pie.kirkeskat", value: kirkeskat });
  if (afterTax > 0) data.push({ key: "chart.pie.afterTax", value: afterTax });

  return (
    <div className="bg-card border border-border rounded-[var(--radius-lg)] p-6">
      <h3 className="text-foreground font-medium mb-1">{t("chart.pie.title" as any)}</h3>
      <p className="text-sm text-muted-foreground mb-6">{fmtDKK(grossVal)} kr/{period === "annual" ? t("chart.dkkYear" as any) : t("chart.dkkMonth" as any)}{showEur ? ` (${fmtEUR(grossVal, eurRate)})` : ''}</p>

      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Donut */}
        <div className="w-52 h-52 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={90}
                paddingAngle={2}
                stroke="none"
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <RTooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0]?.payload as Slice | undefined;
                  if (!d) return null;
                  const pctVal = ((d.value / grossVal) * 100).toFixed(1);
                  return (
                    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13, padding: '8px 12px', lineHeight: 1.6 }}>
                      <p style={{ fontWeight: 600 }}>{t(d.key as any)}</p>
                      <p>{fmtDKK(d.value)} kr{showEur ? ` (${fmtEUR(d.value, eurRate)})` : ''} <span style={{ opacity: 0.6 }}>({pctVal}%)</span></p>
                    </div>
                  );
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-2.5 text-sm flex-1">
          {data.map((d, i) => {
            const pctVal = ((d.value / grossVal) * 100).toFixed(1);
            return (
              <div key={d.key} className="flex items-center gap-2.5">
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                />
                <span className="text-muted-foreground">{t(d.key as any)}</span>
                <span className="text-muted-foreground/60 text-xs ml-1">({pctVal}%)</span>
                <span className="font-medium text-foreground ml-auto tabular-nums">
                  {fmtDKK(d.value)} kr
                  {showEur && <span className="text-muted-foreground/60 text-xs ml-1">{fmtEUR(d.value, eurRate)}</span>}
                </span>
              </div>
            );
          })}
          <div className="border-t border-border pt-2 mt-1 flex items-center gap-2.5">
            <span className="w-3 h-3 flex-shrink-0" />
            <span className="text-muted-foreground font-medium">Total</span>
            <span className="font-semibold text-foreground ml-auto tabular-nums">
              {fmtDKK(grossVal)} kr
              {showEur && <span className="text-muted-foreground/60 text-xs ml-1">{fmtEUR(grossVal, eurRate)}</span>}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────

export function Results() {
  const { serviceId } = useParams<{ serviceId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state as TaxResult | StudentResult | null;
  const { t, lang } = useI18n();

  // Toggle state
  const [period, setPeriod] = useState<"monthly" | "annual">("monthly");
  const [showEur, setShowEur] = useState(false);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [glossaryOpen, setGlossaryOpen] = useState(false);

  // Chart data
  const [curveData, setCurveData] = useState<CurvePoint[]>([]);
  const [hoursCurveData, setHoursCurveData] = useState<HoursCurvePoint[]>([]);

  // Accuracy report
  const [actualNet, setActualNet] = useState("");
  const [accuracyConsent, setAccuracyConsent] = useState(false);
  const [accuracyStatus, setAccuracyStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  // Thumbs feedback
  const [thumbsVote, setThumbsVote] = useState<"up" | "down" | null>(null);
  const [thumbsSending, setThumbsSending] = useState(false);
  const [voteStats, setVoteStats] = useState<{ up: number; down: number; total: number } | null>(null);

  const API = import.meta.env.DEV ? "http://localhost:8000" : "";

  useEffect(() => {
    fetchMeta().then(setMeta).catch(console.error);
    // Fetch vote stats
    fetch(`${import.meta.env.DEV ? "http://localhost:8000" : ""}/api/vote/stats`)
      .then(r => r.json())
      .then(setVoteStats)
      .catch(console.error);
  }, []);

  // Fetch curve data for charts
  useEffect(() => {
    if (!result || !serviceId) return;
    const r = result as any;
    if (serviceId === "fulltime" || serviceId === "parttime") {
      fetchCurve({
        kommune: r.kommune,
        pension_pct: 0, // simplified: just use raw to show the curve shape
        employer_pension_pct: 0,
        is_church: true,
        is_hourly: serviceId === "parttime",
        atp_monthly: 0,
        max_gross: 1_680_000,   // 140k monthly × 12
        step_monthly: 500,      // 500 DKK granularity
      })
        .then(setCurveData)
        .catch(console.error);
    }
    if (serviceId === "parttime" && r.hourly_rate) {
      fetchHoursCurve({
        hourly_rate: r.hourly_rate,
        kommune: r.kommune,
        pension_pct: 0,
        employer_pension_pct: 0,
        is_church: true,
        atp_monthly: 0,
        max_hours: 300,
      })
        .then(setHoursCurveData)
        .catch(console.error);
    }
  }, [result, serviceId]);

  if (!result) {
    navigate("/");
    return null;
  }

  const isStudent = serviceId === "student";
  const r = result as any;

  const netMonthly = r.net_monthly as number;
  const netAnnual = r.net_annual as number;
  const effectiveRate = isStudent
    ? ((r.total_deductions /
        (r.su_annual_gross + r.work_gross_annual + r.work_feriepenge)) *
        100) || 0
    : r.effective_tax_rate;

  const mul = period === "annual" ? 12 : 1;
  const perLabel = period === "annual" ? t("perLabel.year" as any) : t("perLabel.month" as any);
  const eurRate = meta?.dkk_per_eur ?? 7.45;

  const displayAmount = netMonthly * mul;
  const displayGross = isStudent
    ? (r.su_annual_gross + r.work_gross_annual) / (period === "annual" ? 1 : 12)
    : (r.gross_annual || 0) / (period === "annual" ? 1 : 12);

  const breakdown: Row[] = isStudent
    ? studentBreakdown(result as StudentResult)
    : employeeBreakdown(result as TaxResult);

  const serviceTitle =
    serviceId === "fulltime"
      ? t("wizard.fulltime.title")
      : serviceId === "parttime"
      ? t("wizard.parttime.title")
      : t("wizard.student.title");

  const formatVal = (v: number): string => {
    const display = period === "annual" ? v : v / 12;
    const dkk = fmtDKK(display);
    if (showEur) return `${dkk} kr (${fmtEUR(display, eurRate)})`;
    return `${dkk} kr`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t("btn.backHome")}
        </Button>

        {/* ── Primary Result Card ──────────────────────────────── */}
        <div className="bg-gradient-to-br from-[var(--nordic-accent)] to-[var(--nordic-accent-dark)] text-white rounded-[var(--radius-xl)] p-8 mb-6 shadow-[var(--shadow-xl)]">
          <p className="text-xs uppercase tracking-widest opacity-75 mb-1">
            {serviceTitle}
          </p>
          <div className="flex items-end justify-between flex-wrap gap-4">
            <div>
              <p className="text-sm opacity-90 mb-2">
                {period === "annual" ? t("results.netAnnual") : t("results.netMonthly")}
              </p>
              <h1 className="text-5xl font-mono">
                {fmtDKK(displayAmount)} kr
              </h1>
              {showEur && (
                <p className="text-lg opacity-90 mt-1 font-mono">
                  {fmtEUR(displayAmount, eurRate)}
                </p>
              )}
              <p className="text-sm opacity-75 mt-1">
                {fmtDKK(period === "annual" ? netMonthly : netAnnual)} kr{" "}
                {period === "annual" ? t("perLabel.month" as any) : t("perLabel.year" as any)}
              </p>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-[var(--radius-md)]">
              <TrendingDown className="w-4 h-4" />
              <span className="text-sm">
                {t("results.effRate")} {pct(effectiveRate)}
              </span>
            </div>
          </div>

          {/* Student fribeloeb warning */}
          {isStudent && (r as StudentResult).over_fribeloeb && (
            <div className="mt-4 p-3 bg-white/15 rounded-[var(--radius-md)] text-sm">
              ⚠ You exceed the annual fribeløb by{" "}
              {fmtDKK((r as StudentResult).fribeloeb_excess)} kr — SU
              repayment of {fmtDKK((r as StudentResult).su_repayment)} kr +
              interest applies.
            </div>
          )}
        </div>

        {/* ── Toggle controls ──────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-6 mb-6 px-2">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <Label
              htmlFor="period"
              className="text-sm text-muted-foreground cursor-pointer"
            >
              {t("results.monthly")}
            </Label>
            <Switch
              id="period"
              checked={period === "annual"}
              onCheckedChange={(v) => setPeriod(v ? "annual" : "monthly")}
            />
            <Label className="text-sm text-muted-foreground cursor-pointer">
              {t("results.annual")}
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Euro className="w-4 h-4 text-muted-foreground" />
            <Label
              htmlFor="eur"
              className="text-sm text-muted-foreground cursor-pointer"
            >
              {t("results.showEur")}
            </Label>
            <Switch
              id="eur"
              checked={showEur}
              onCheckedChange={setShowEur}
            />
            {showEur && (
              <span className="text-xs text-muted-foreground">
                (1 EUR ≈ {eurRate} DKK)
              </span>
            )}
          </div>
        </div>

        {/* ── Quick stats ──────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Stat label="Kommune" value={r.kommune} />
          <Stat label="Kommuneskat" value={pct(r.kommune_pct)} />
          <Stat label="Kirkeskat" value={r.kirkeskat > 0 ? pct(r.kirke_pct) : "0 %"} />
          {!isStudent && (
            <Stat
              label={`Pension (total)${perLabel}`}
              value={`${fmtDKK(r.total_pension / (period === "annual" ? 1 : 12))} kr`}
              eurSub={showEur ? fmtEUR(r.total_pension / (period === "annual" ? 1 : 12), eurRate) : undefined}
            />
          )}
          {isStudent && (
            <Stat
              label="SU kept"
              value={`${fmtDKK(
                (r as StudentResult).su_annual /
                  (period === "annual" ? 1 : 12)
              )} kr${perLabel}`}
            />
          )}
        </div>

        {/* ── Tabs ─────────────────────────────────────────────── */}
        <Tabs defaultValue="breakdown" className="w-full">
          <TabsList className="w-full justify-start border-b border-border rounded-none bg-transparent p-0 h-auto flex-wrap">
            <TabsTrigger
              value="breakdown"
              className="data-[state=active]:border-b-2 data-[state=active]:border-[var(--nordic-accent)] rounded-none px-6 py-3"
            >
              {t("results.tab.breakdown")}
            </TabsTrigger>
            {(serviceId === "fulltime" || serviceId === "parttime") && (
              <TabsTrigger
                value="chart"
                className="data-[state=active]:border-b-2 data-[state=active]:border-[var(--nordic-accent)] rounded-none px-6 py-3"
              >
                <BarChart3 className="w-4 h-4 mr-1" /> {t("results.tab.charts")}
              </TabsTrigger>
            )}
            {!isStudent && r.total_pension > 0 && (
              <TabsTrigger
                value="pension"
                className="data-[state=active]:border-b-2 data-[state=active]:border-[var(--nordic-accent)] rounded-none px-6 py-3"
              >
                <Wallet className="w-4 h-4 mr-1" /> {t("results.tab.pension")}
              </TabsTrigger>
            )}
            {!(isStudent && (r as StudentResult).work_gross_annual === 0) && (
            <TabsTrigger
              value="ferie"
              className="data-[state=active]:border-b-2 data-[state=active]:border-[var(--nordic-accent)] rounded-none px-6 py-3"
            >
              <Umbrella className="w-4 h-4 mr-1" /> {t("results.tab.ferie")}
            </TabsTrigger>
            )}
            <TabsTrigger
              value="glossary"
              className="data-[state=active]:border-b-2 data-[state=active]:border-[var(--nordic-accent)] rounded-none px-6 py-3"
            >
              <HelpCircle className="w-4 h-4 mr-1" /> {t("results.tab.glossary")}
            </TabsTrigger>
          </TabsList>

          {/* ── Breakdown tab ──────────────────────────────────── */}
          <TabsContent value="breakdown" className="mt-6">
            <div className="bg-card border border-border rounded-[var(--radius-lg)] divide-y divide-border">
              {/* Header row */}
              <div className="p-4 flex items-center justify-between text-xs text-muted-foreground font-medium uppercase tracking-wide">
                <span>{t("results.item")}</span>
                <div className="flex gap-8">
                  <span className="w-28 text-right">{t("results.annualDKK")}</span>
                  <span className="w-28 text-right">{t("results.monthlyDKK")}</span>
                </div>
              </div>
              {breakdown.map((item, i) =>
                item.spacer ? (
                  <div key={i} className="h-px" />
                ) : (
                  <div
                    key={i}
                    className={`p-4 flex items-center justify-between ${
                      item.indent ? "pl-10" : ""
                    } ${item.bold ? "bg-secondary/30" : ""}`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {item.color && (
                        <div
                          className="w-1 h-6 rounded-full shrink-0"
                          style={{ backgroundColor: item.color }}
                        />
                      )}
                      <p
                        className={`text-sm truncate ${
                          item.bold
                            ? "font-semibold text-foreground"
                            : "text-foreground"
                        }`}
                      >
                        {item.label}
                      </p>
                    </div>
                    <div className="flex gap-8 shrink-0">
                      <div className={`w-28 text-right font-mono text-sm ${item.bold ? "font-semibold" : ""}`}>
                        <p>{fmtDKK(item.value)}</p>
                        {showEur && <p className="text-xs text-muted-foreground/70">{fmtEUR(item.value, eurRate)}</p>}
                      </div>
                      <div className={`w-28 text-right font-mono text-sm text-muted-foreground ${item.bold ? "font-semibold" : ""}`}>
                        <p>{fmtDKK(item.value / 12)}</p>
                        {showEur && <p className="text-xs text-muted-foreground/70">{fmtEUR(item.value / 12, eurRate)}</p>}
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>

            {showEur && (
              <div className="mt-4 p-4 bg-secondary/30 rounded-[var(--radius-md)]">
                <p className="text-sm text-muted-foreground">
                  Net in EUR: {fmtEUR(netAnnual, eurRate)}/year ·{" "}
                  {fmtEUR(netMonthly, eurRate)}/month (at 1 EUR = {eurRate}{" "}
                  DKK)
                </p>
              </div>
            )}

            <div className="mt-4 p-4 bg-secondary/30 border border-border rounded-[var(--radius-md)]">
              <p className="text-sm text-muted-foreground">
                {t("disclaimer")} ({r.kommune})
              </p>
            </div>
          </TabsContent>

          {/* ── Chart tab ──────────────────────────────────────── */}
          {(serviceId === "fulltime" || serviceId === "parttime") && (
            <TabsContent value="chart" className="mt-6 space-y-8">

              {/* Net vs Gross curve */}
              {curveData.length > 0 && (() => {
                const cMul = period === "annual" ? 12 : 1;
                const ticks = Array.from({ length: 15 }, (_, i) => i * 10000);
                return (
                <div className="bg-card border border-border rounded-[var(--radius-lg)] p-6">
                  <h3 className="text-foreground font-medium mb-1">
                    {t("chart.netVsGross")}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {period === "annual" ? t("chart.netVsGross.desc.annual" as any) : t("chart.netVsGross.desc")}
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
                        ticks={ticks}
                        tickFormatter={(v: number) => fmtAxisDKK(v * cMul)}
                        label={{
                          value: period === "annual" ? t('chart.grossAnnual' as any) : t('chart.grossMonth'),
                          position: "insideBottom",
                          offset: -5,
                        }}
                        stroke="var(--muted-foreground)"
                        fontSize={12}
                      />
                      <YAxis
                        type="number"
                        tickFormatter={(v: number) => fmtAxisDKK(v * cMul)}
                        domain={[0, 140000]}
                        ticks={ticks}
                        label={{
                          value: "DKK/" + (period === "annual" ? t('chart.dkkYear' as any) : t('chart.dkkMonth')),
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
                          const gVal = d.gross_monthly * cMul;
                          const nVal = d.net_monthly * cMul;
                          const netEur = fmtEUR(nVal, eurRate);
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
                              <p style={{ fontWeight: 500 }}>{t('chart.gross')}: {fmtDKK(gVal)} kr</p>
                              <p style={{ color: 'var(--nordic-accent)', fontWeight: 500 }}>{t('chart.net')}: {fmtDKK(nVal)} kr <span style={{ opacity: 0.7 }}>({netEur})</span></p>
                              <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>{t('chart.effectiveTax')}: {d.effective_rate.toFixed(1)}%</p>
                            </div>
                          );
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="gross_monthly"
                        name="Gross"
                        stroke="var(--muted-foreground)"
                        strokeDasharray="5 5"
                        strokeWidth={1.5}
                        dot={false}
                        tooltipType="none"
                      />
                      <Line
                        type="monotone"
                        dataKey="net_monthly"
                        name="Net"
                        stroke="var(--nordic-accent)"
                        strokeWidth={2.5}
                        dot={false}
                      />
                      {/* Current position marker */}
                      <ReferenceDot
                        x={Math.round(
                          (r.gross_annual ||
                            r.hourly_rate * r.hours_month * 12) /
                            12
                        )}
                        y={netMonthly}
                        r={6}
                        fill="var(--destructive)"
                        stroke="white"
                        strokeWidth={2}
                      />
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
                );
              })()}

              {/* Net vs Hours curve (part-time only) */}
              {serviceId === "parttime" && hoursCurveData.length > 0 && (() => {
                const hMul = period === "annual" ? 12 : 1;
                return (
                <div className="bg-card border border-border rounded-[var(--radius-lg)] p-6">
                  <h3 className="text-foreground font-medium mb-1">
                    {t("chart.netVsHours")}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    How your net {period === "annual" ? "annual" : "monthly"} income changes with hours at{" "}
                    {fmtDKK(r.hourly_rate)} DKK/hour
                  </p>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={hoursCurveData} margin={{ top: 5, right: 20, bottom: 20, left: 10 }}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="var(--border)"
                      />
                      <XAxis
                        dataKey="hours_month"
                        label={{
                          value: t('chart.hoursPerMonth'),
                          position: "insideBottom",
                          offset: -5,
                        }}
                        stroke="var(--muted-foreground)"
                        fontSize={12}
                      />
                      <YAxis
                        tickFormatter={(v: number) => fmtAxisDKK(v * hMul)}
                        label={{
                          value: "DKK/" + (period === "annual" ? t('chart.dkkYear' as any) : t('chart.dkkMonth')),
                          angle: -90,
                          position: "insideLeft",
                        }}
                        stroke="var(--muted-foreground)"
                        fontSize={12}
                      />
                      <RTooltip
                        content={({ active, payload }) => {
                          if (!active || !payload?.length) return null;
                          const d = payload[0]?.payload as HoursCurvePoint | undefined;
                          if (!d) return null;
                          const gVal = d.gross_monthly * hMul;
                          const nVal = d.net_monthly * hMul;
                          const tax = gVal - nVal;
                          return (
                            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13, padding: '10px 14px', lineHeight: 1.6 }}>
                              <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>{d.hours_month} {t('chart.hoursMonth')}</p>
                              <p style={{ fontWeight: 500 }}>{t('chart.gross')}: {fmtDKK(gVal)} kr</p>
                              <p style={{ color: 'var(--nordic-accent)', fontWeight: 500 }}>{t('chart.net')}: {fmtDKK(nVal)} kr</p>
                              <p style={{ color: 'var(--destructive)' }}>{t('chart.taxDed')}: {fmtDKK(tax)} kr</p>
                              <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>{t('chart.effectiveTax')}: {d.effective_rate.toFixed(1)}%</p>
                            </div>
                          );
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="gross_monthly"
                        name="Gross"
                        stroke="var(--muted-foreground)"
                        strokeDasharray="5 5"
                        strokeWidth={1.5}
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="net_monthly"
                        name="Net"
                        stroke="var(--nordic-accent)"
                        strokeWidth={2.5}
                        dot={false}
                      />
                      <ReferenceDot
                        x={r.hours_month}
                        y={netMonthly}
                        r={6}
                        fill="var(--destructive)"
                        stroke="white"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                );
              })()}

              {/* ── Salary breakdown pie ── */}
              <SalaryBreakdownPie r={r} isStudent={isStudent} period={period} showEur={showEur} eurRate={eurRate} />
            </TabsContent>
          )}

          {/* ── Pension tab ────────────────────────────────────── */}
          {!isStudent && r.total_pension > 0 && (
            <TabsContent value="pension" className="mt-6">
              <div className="bg-card border border-border rounded-[var(--radius-lg)] p-6 space-y-6">
                <h3 className="text-foreground font-medium">
                  {t("pension.accrual")}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <PensionStat
                    label={`${t("pension.yours")}${perLabel}`}
                    value={fmtDKK(r.employee_pension / (period === "annual" ? 1 : 12))}
                    eurSub={showEur ? fmtEUR(r.employee_pension / (period === "annual" ? 1 : 12), eurRate) : undefined}
                  />
                  <PensionStat
                    label={`${t("pension.employer")}${perLabel}`}
                    value={fmtDKK(r.employer_pension / (period === "annual" ? 1 : 12))}
                    eurSub={showEur ? fmtEUR(r.employer_pension / (period === "annual" ? 1 : 12), eurRate) : undefined}
                  />
                  <PensionStat
                    label={`${t("pension.total")}${perLabel}`}
                    value={fmtDKK(r.total_pension / (period === "annual" ? 1 : 12))}
                    highlight
                    eurSub={showEur ? fmtEUR(r.total_pension / (period === "annual" ? 1 : 12), eurRate) : undefined}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Monthly: {fmtDKK(r.employee_pension / 12)} (you) +{" "}
                  {fmtDKK(r.employer_pension / 12)} (employer) ={" "}
                  <strong>{fmtDKK(r.total_pension / 12)} DKK/month</strong>{" "}
                  to pension
                </p>
                {showEur && (
                  <p className="text-xs text-muted-foreground">
                    ≈ {fmtEUR(r.total_pension, eurRate)}/year pension
                    accrual
                  </p>
                )}
              </div>
            </TabsContent>
          )}

          {/* ── Ferie tab ──────────────────────────────────────── */}
          <TabsContent value="ferie" className="mt-6">
            {(() => {
              const isSalaried = serviceId === "fulltime";
              const isHourly = serviceId === "parttime";
              const ferieAmount = isStudent
                ? (r as StudentResult).work_feriepenge
                : (r as TaxResult).feriepenge;
              const grossAnnual = isStudent
                ? (r as StudentResult).work_gross_annual
                : (r as TaxResult).gross_annual;
              const dailyRate = isSalaried
                ? Math.round(grossAnnual / 260)
                : Math.round(ferieAmount / 25);

              return (
                <div className="bg-card border border-border rounded-[var(--radius-lg)] p-6 space-y-6">
                  <h3 className="text-foreground font-medium">
                    {t("ferie.title")}
                  </h3>

                  {/* Stat cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-secondary/50 border border-border rounded-[var(--radius-md)] p-4">
                      <p className="text-xs text-muted-foreground mb-1">
                        {t("ferie.daysPerYear")}
                      </p>
                      <p className="text-2xl font-mono text-foreground">25</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        2.08 {t("ferie.daysPerMonth")}
                      </p>
                    </div>
                    <div className="bg-secondary/50 border border-border rounded-[var(--radius-md)] p-4">
                      <p className="text-xs text-muted-foreground mb-1">
                        {isSalaried
                          ? t("ferie.ferietillaeg")
                          : t("ferie.feriepenge")}
                      </p>
                      <p className="text-2xl font-mono text-foreground">
                        {fmtDKK(ferieAmount)} kr
                      </p>
                      {showEur && (
                        <p className="text-xs text-muted-foreground mt-1 font-mono">
                          {fmtEUR(ferieAmount, eurRate)}
                        </p>
                      )}
                    </div>
                    <div className="bg-[var(--nordic-accent-light)] border border-[var(--nordic-accent)] rounded-[var(--radius-md)] p-4">
                      <p className="text-xs text-muted-foreground mb-1">
                        {t("ferie.dailyRate")}
                      </p>
                      <p className="text-2xl font-mono text-foreground">
                        {fmtDKK(dailyRate)} kr
                      </p>
                      {showEur && (
                        <p className="text-xs text-muted-foreground mt-1 font-mono">
                          {fmtEUR(dailyRate, eurRate)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Monthly accrual progress */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">
                        {t("ferie.daysPerYear")}
                      </span>
                      <span className="font-mono text-foreground">
                        25 / 25
                      </span>
                    </div>
                    <div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[var(--nordic-accent)] transition-all"
                        style={{ width: "100%" }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-2">
                      {Array.from({ length: 12 }, (_, i) => (
                        <span key={i} className="font-mono">
                          {((i + 1) * 2.08).toFixed(1)}
                        </span>
                      ))}
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-0.5">
                      {Array.from({ length: 12 }, (_, i) => {
                        const months = lang === "da"
                          ? ["Jan","Feb","Mar","Apr","Maj","Jun","Jul","Aug","Sep","Okt","Nov","Dec"]
                          : ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
                        return <span key={i}>{months[i]}</span>;
                      })}
                    </div>
                  </div>

                  {/* Explanation */}
                  <div className="p-4 bg-secondary/30 border border-border rounded-[var(--radius-md)] space-y-2">
                    <p className="text-sm text-muted-foreground">
                      {isStudent
                        ? t("ferie.studentNote")
                        : isSalaried
                        ? t("ferie.salaryNote")
                        : t("ferie.hourlyNote")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t("ferie.rule")}
                    </p>
                  </div>
                </div>
              );
            })()}
          </TabsContent>

          {/* ── Glossary tab ───────────────────────────────────── */}
          <TabsContent value="glossary" className="mt-6">
            <div className="bg-card border border-border rounded-[var(--radius-lg)] p-6">
              <h3 className="text-foreground font-medium mb-4">
                {t("glossary.title")}
              </h3>
              <div className="space-y-4">
                {GLOSSARY_KEYS.map((key) => (
                  <div key={key}>
                    <p className="text-sm font-semibold text-foreground">
                      {t(`glossary.${key}.term` as any)}
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {t(`glossary.${key}.desc` as any)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* ── Student fribeloeb indicator ───────────────────────── */}
        {isStudent && (
          <div className="mt-8 bg-card border border-border rounded-[var(--radius-lg)] p-6">
            <h3 className="text-foreground font-medium mb-3">
              {t("fribeloeb.title")}
            </h3>
            {(() => {
              const sr = r as StudentResult;
              const usedPct = Math.min(
                100,
                ((sr.work_after_am_monthly * 12) / sr.aars_fribeloeb) * 100
              );
              return (
                <>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">
                      {t("fribeloeb.egenindkomst")}
                    </span>
                    <span className="font-mono">
                      {fmtDKK(sr.work_after_am_monthly * 12)} /{" "}
                      {fmtDKK(sr.aars_fribeloeb)} kr
                    </span>
                  </div>
                  <div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        sr.over_fribeloeb
                          ? "bg-red-500"
                          : usedPct > 80
                          ? "bg-amber-500"
                          : "bg-green-500"
                      }`}
                      style={{ width: `${Math.min(100, usedPct)}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {sr.over_fribeloeb
                      ? `Over by ${fmtDKK(sr.fribeloeb_excess)} kr — SU repayment: ${fmtDKK(sr.su_repayment)} kr + ${fmtDKK(sr.su_repayment_interest)} kr interest`
                      : `${usedPct.toFixed(0)}% used — ${fmtDKK(sr.aars_fribeloeb - sr.work_after_am_monthly * 12)} kr remaining`}
                  </p>
                </>
              );
            })()}
          </div>
        )}

        {/* ── Feedback & Accuracy Report ───────────────────────── */}
        <div className="mt-10 bg-card border border-border rounded-[var(--radius-lg)] p-6 space-y-6">
          {/* Thumbs feedback */}
          <div>
            <h3 className="text-sm font-semibold text-card-foreground mb-1">
              {lang === "da" ? "Er estimatet rigtigt?" : "Does this estimate look right?"}
            </h3>
            <p className="text-xs text-muted-foreground mb-3">
              {lang === "da" ? "Din feedback hjælper os med at forbedre." : "Your feedback helps us improve."}
            </p>
            {thumbsVote ? (
              <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
                <CheckCircle className="w-4 h-4" />
                {lang === "da" ? "Tak for din feedback!" : "Thanks for your feedback!"}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  disabled={thumbsSending}
                  onClick={async () => {
                    setThumbsSending(true);
                    try {
                      await fetch(`${API}/api/vote`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ vote: "up", service_type: serviceId, estimated_net: netMonthly }),
                      });
                    } catch { /* noop */ }
                    setThumbsVote("up");
                    setVoteStats(prev => prev ? { ...prev, up: prev.up + 1, total: prev.total + 1 } : prev);
                    setThumbsSending(false);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-[var(--radius-md)] border border-border text-sm hover:bg-green-50 dark:hover:bg-green-950/30 hover:border-green-400 transition-colors"
                >
                  <ThumbsUp className="w-4 h-4" />
                  {lang === "da" ? "Korrekt" : "Accurate"}
                </button>
                <button
                  disabled={thumbsSending}
                  onClick={async () => {
                    setThumbsSending(true);
                    try {
                      await fetch(`${API}/api/vote`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ vote: "down", service_type: serviceId, estimated_net: netMonthly }),
                      });
                    } catch { /* noop */ }
                    setThumbsVote("down");
                    setVoteStats(prev => prev ? { ...prev, down: prev.down + 1, total: prev.total + 1 } : prev);
                    setThumbsSending(false);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-[var(--radius-md)] border border-border text-sm hover:bg-red-50 dark:hover:bg-red-950/30 hover:border-red-400 transition-colors"
                >
                  <ThumbsDown className="w-4 h-4" />
                  {lang === "da" ? "Forkert" : "Not accurate"}
                </button>
              </div>
            )}
            {/* Vote counter */}
            {voteStats && voteStats.total > 0 && (
              <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <ThumbsUp className="w-3 h-3 text-green-500" />
                  {voteStats.up}
                </span>
                <span className="flex items-center gap-1">
                  <ThumbsDown className="w-3 h-3 text-red-400" />
                  {voteStats.down}
                </span>
                <span>
                  {voteStats.total} {lang === "da" ? "stemmer i alt" : "votes total"}
                  {voteStats.total > 0 && (
                    <> · {Math.round(voteStats.up / voteStats.total * 100)}% {lang === "da" ? "positive" : "positive"}</>  
                  )}
                </span>
              </div>
            )}
          </div>

          <hr className="border-border" />

          {/* Accuracy report */}
          {accuracyStatus === "success" ? (
            <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-[var(--radius-md)] px-5 py-3">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              {t("accuracy.success")}
            </div>
          ) : (
            <div>
              <h3 className="text-sm font-semibold text-card-foreground mb-1">{t("accuracy.title")}</h3>
              <p className="text-xs text-muted-foreground mb-4">{t("accuracy.desc")}</p>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <label className="text-xs text-muted-foreground whitespace-nowrap">{t("accuracy.actual.label")}</label>
                  <div className="flex items-center gap-2 flex-1 max-w-[280px]">
                    <input
                      type="number"
                      value={actualNet}
                      onChange={(e) => setActualNet(e.target.value)}
                      placeholder={t("accuracy.actual.placeholder")}
                      className="w-full px-3 py-2 text-sm bg-[var(--input-background)] border border-border rounded-[var(--radius-md)] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{t("accuracy.per_month")}</span>
                  </div>
                </div>
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={accuracyConsent}
                    onChange={(e) => setAccuracyConsent(e.target.checked)}
                    className="mt-0.5 rounded border-border"
                  />
                  <span className="text-xs text-muted-foreground leading-relaxed">{t("accuracy.consent")}</span>
                </label>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!actualNet || !accuracyConsent || accuracyStatus === "sending"}
                  onClick={async () => {
                    setAccuracyStatus("sending");
                    try {
                      const res = await fetch(`${API}/api/accuracy-report`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          service_type: serviceId,
                          estimated_net_monthly: netMonthly,
                          actual_net_monthly: parseFloat(actualNet),
                          inputs: result,
                        }),
                      });
                      if (!res.ok) throw new Error("Failed");
                    } catch {
                      // Still show success to the user even if API is down
                    }
                    setAccuracyStatus("success");
                  }}
                >
                  {t("accuracy.submit")}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* ── Actions ──────────────────────────────────────────── */}
        <div className="mt-8 flex gap-3 justify-center">
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate(`/wizard/${serviceId}`)}
          >
            {t("btn.adjust")}
          </Button>
          <Button variant="outline" size="lg" onClick={() => navigate("/")}>
            {t("btn.new")}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Small components ─────────────────────────────────────────────────

function Stat({ label, value, eurSub }: { label: string; value: string; eurSub?: string }) {
  return (
    <div className="bg-card border border-border rounded-[var(--radius-md)] p-4">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-foreground font-mono text-sm">{value}</p>
      {eurSub && <p className="text-xs text-muted-foreground font-mono mt-0.5">{eurSub}</p>}
    </div>
  );
}

function PensionStat({
  label,
  value,
  highlight,
  eurSub,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  eurSub?: string;
}) {
  return (
    <div
      className={`rounded-[var(--radius-md)] p-4 ${
        highlight
          ? "bg-[var(--nordic-accent-light)] border border-[var(--nordic-accent)]"
          : "bg-secondary/50 border border-border"
      }`}
    >
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-lg font-mono text-foreground">{value} kr</p>
      {eurSub && <p className="text-xs text-muted-foreground font-mono mt-0.5">{eurSub}</p>}
    </div>
  );
}
