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

// ── TAX GLOSSARY ─────────────────────────────────────────────────────

const GLOSSARY: { term: string; desc: string }[] = [
  {
    term: "AM-bidrag",
    desc: "Arbejdsmarkedsbidrag — 8% labour-market contribution deducted from all earned income before income tax. Funds unemployment benefits and active labour-market programmes.",
  },
  {
    term: "Bundskat",
    desc: "Base state income tax (12.01%) applied to income above the personal allowance (personfradrag). Everyone with taxable income pays it.",
  },
  {
    term: "Kommuneskat",
    desc: "Municipal income tax, set individually by each of Denmark's 98 municipalities. Typically 23–27% and is the largest single tax component.",
  },
  {
    term: "Kirkeskat",
    desc: "Church tax (0.4–1.3%) only paid by members of the Folkekirken (Danish National Church). Opt out by leaving the church.",
  },
  {
    term: "Mellemskat",
    desc: "7.5% bracket tax on income exceeding 641,200 kr/year after AM-bidrag. Part of the progressive bracket system.",
  },
  {
    term: "Topskat",
    desc: "7.5% bracket tax on income exceeding 777,900 kr/year after AM-bidrag. Subject to the skatteloft ceiling.",
  },
  {
    term: "Toptopskat",
    desc: "5% bracket tax on income exceeding 2,592,700 kr/year. Introduced in 2026 for very high earners.",
  },
  {
    term: "Personfradrag",
    desc: "Annual personal tax allowance (54,100 kr in 2026). Income below this amount is effectively tax-free at the municipal level.",
  },
  {
    term: "Beskæftigelsesfradrag",
    desc: "Employment deduction (12.75%, max 63,300 kr) that reduces your municipal tax base.",
  },
  {
    term: "Jobfradrag",
    desc: "Additional employment deduction (4.50%, max 3,100 kr) also reducing your municipal tax base.",
  },
  {
    term: "Skatteloft",
    desc: "Tax ceiling (44.57%). Caps the combined state + municipal marginal tax rate so it never exceeds this limit.",
  },
  {
    term: "Feriepenge",
    desc: "Holiday pay (12.5%) set aside by employers for hourly workers, paid out during vacation periods. Counts as taxable income.",
  },
  {
    term: "Ferietillæg",
    desc: "Holiday supplement (1%) paid to salaried employees on top of regular salary.",
  },
  {
    term: "ATP",
    desc: "Arbejdsmarkedets Tillægspension — mandatory supplementary pension. Employee pays ~95 kr/month, employer pays ~190 kr/month on top.",
  },
  {
    term: "Fribeløb",
    desc: "Annual earnings limit for SU recipients. Three tiers exist: laveste (SU months), mellemste (enrolled but opted out), and højeste (not enrolled). Exceeding it requires repaying SU krone-for-krone on the excess, plus 9.75% interest.",
  },
];

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
    { label: "", value: 0, spacer: true },
    {
      label: "Annual fribeløb",
      value: r.aars_fribeloeb,
      indent: true,
    },
  ];
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

  const API = import.meta.env.DEV ? "http://localhost:8000" : "";

  useEffect(() => {
    fetchMeta().then(setMeta).catch(console.error);
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
        max_gross: Math.max(
          1_200_000,
          (r.gross_annual || r.hourly_rate * r.hours_month * 12) * 2
        ),
        points: 60,
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
  const perLabel = period === "annual" ? (lang === "da" ? "/år" : "/year") : (lang === "da" ? "/md" : "/month");
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
                {period === "annual" ? (lang === "da" ? "/md" : "/month") : (lang === "da" ? "/år" : "/year")}
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
          <Stat label="Kirkeskat" value={pct(r.kirke_pct)} />
          {!isStudent && (
            <Stat
              label={`Pension (total)${perLabel}`}
              value={`${fmtDKK(r.total_pension / (period === "annual" ? 1 : 12))} kr`}
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
            <TabsTrigger
              value="ferie"
              className="data-[state=active]:border-b-2 data-[state=active]:border-[var(--nordic-accent)] rounded-none px-6 py-3"
            >
              <Umbrella className="w-4 h-4 mr-1" /> {t("results.tab.ferie")}
            </TabsTrigger>
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
                      <p
                        className={`w-28 text-right font-mono text-sm ${
                          item.bold ? "font-semibold" : ""
                        }`}
                      >
                        {fmtDKK(item.value)}
                      </p>
                      <p
                        className={`w-28 text-right font-mono text-sm text-muted-foreground ${
                          item.bold ? "font-semibold" : ""
                        }`}
                      >
                        {fmtDKK(item.value / 12)}
                      </p>
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
              {curveData.length > 0 && (
                <div className="bg-card border border-border rounded-[var(--radius-lg)] p-6">
                  <h3 className="text-foreground font-medium mb-1">
                    {t("chart.netVsGross")}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {t("chart.netVsGross.desc")}
                  </p>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={curveData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="var(--border)"
                      />
                      <XAxis
                        dataKey="gross_monthly"
                        tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
                        label={{
                          value: "Gross monthly (DKK)",
                          position: "insideBottom",
                          offset: -5,
                        }}
                        stroke="var(--muted-foreground)"
                        fontSize={12}
                      />
                      <YAxis
                        tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
                        label={{
                          value: "DKK/month",
                          angle: -90,
                          position: "insideLeft",
                        }}
                        stroke="var(--muted-foreground)"
                        fontSize={12}
                      />
                      <RTooltip
                        formatter={(value: number, name: string) => [
                          `${fmtDKK(value)} kr`,
                          name,
                        ]}
                        labelFormatter={(v: number) =>
                          `Gross: ${fmtDKK(v)} kr/month`
                        }
                        contentStyle={{
                          background: "var(--card)",
                          border: "1px solid var(--border)",
                          borderRadius: 8,
                          fontSize: 13,
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="gross_monthly"
                        name="Gross monthly"
                        stroke="var(--muted-foreground)"
                        strokeDasharray="5 5"
                        strokeWidth={1.5}
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="net_monthly"
                        name="Net monthly"
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
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Net vs Hours curve (part-time only) */}
              {serviceId === "parttime" && hoursCurveData.length > 0 && (
                <div className="bg-card border border-border rounded-[var(--radius-lg)] p-6">
                  <h3 className="text-foreground font-medium mb-1">
                    {t("chart.netVsHours")}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    How your net monthly income changes with hours at{" "}
                    {fmtDKK(r.hourly_rate)} DKK/hour
                  </p>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={hoursCurveData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="var(--border)"
                      />
                      <XAxis
                        dataKey="hours_month"
                        label={{
                          value: "Hours / month",
                          position: "insideBottom",
                          offset: -5,
                        }}
                        stroke="var(--muted-foreground)"
                        fontSize={12}
                      />
                      <YAxis
                        tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
                        label={{
                          value: "DKK/month",
                          angle: -90,
                          position: "insideLeft",
                        }}
                        stroke="var(--muted-foreground)"
                        fontSize={12}
                      />
                      <RTooltip
                        formatter={(value: number, name: string) => [
                          `${fmtDKK(value)} kr`,
                          name,
                        ]}
                        labelFormatter={(v: number) => `${v} hours/month`}
                        contentStyle={{
                          background: "var(--card)",
                          border: "1px solid var(--border)",
                          borderRadius: 8,
                          fontSize: 13,
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="gross_monthly"
                        name="Gross monthly"
                        stroke="var(--muted-foreground)"
                        strokeDasharray="5 5"
                        strokeWidth={1.5}
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="net_monthly"
                        name="Net monthly"
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
              )}
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
                  />
                  <PensionStat
                    label={`${t("pension.employer")}${perLabel}`}
                    value={fmtDKK(r.employer_pension / (period === "annual" ? 1 : 12))}
                  />
                  <PensionStat
                    label={`${t("pension.total")}${perLabel}`}
                    value={fmtDKK(r.total_pension / (period === "annual" ? 1 : 12))}
                    highlight
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
                {GLOSSARY.map((g) => (
                  <div key={g.term}>
                    <p className="text-sm font-semibold text-foreground">
                      {g.term}
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {g.desc}
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

        {/* ── Accuracy Report ─────────────────────────────────── */}
        {accuracyStatus === "success" ? (
          <div className="mt-10 flex items-center gap-2 text-sm text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-[var(--radius-lg)] px-5 py-3">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            {t("accuracy.success")}
          </div>
        ) : (
          <div className="mt-10 bg-card border border-border rounded-[var(--radius-lg)] p-6">
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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-card border border-border rounded-[var(--radius-md)] p-4">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-foreground font-mono text-sm">{value}</p>
    </div>
  );
}

function PensionStat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
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
    </div>
  );
}
