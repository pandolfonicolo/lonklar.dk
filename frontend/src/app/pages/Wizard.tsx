import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router";
import {
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  ChevronDown,
  Info,
  BarChart3,
} from "lucide-react";
import { Header } from "../components/Header";
import { Stepper } from "../components/Stepper";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/ui/tooltip";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../components/ui/collapsible";
import {
  fetchMeta,
  computeFullTime,
  computePartTime,
  computeStudent,
  type Meta,
} from "../utils/api";
import { useI18n, type TranslationKey } from "../utils/i18n";

// ── Helpers ──────────────────────────────────────────────────────────

function fmt(n: number): string {
  return new Intl.NumberFormat("da-DK", { maximumFractionDigits: 0 }).format(n);
}

// ── Component ────────────────────────────────────────────────────────

export function Wizard() {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();
  const { t, lang } = useI18n();
  const [step, setStep] = useState(0);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(false);
  const [extrasOpen, setExtrasOpen] = useState(false);

  // Student work input mode: hourly (default) or none (SU-only, no work)
  const [studentWorkMode, setStudentWorkMode] = useState<"hourly" | "none">("hourly");

  // ── Step names (i18n) ──────────────────────────────────────────
  const stepNames: Record<string, TranslationKey[]> = {
    fulltime: ["step.income", "step.location", "step.pension", "step.review"],
    parttime: ["step.work", "step.location", "step.pension", "step.review"],
    student: studentWorkMode === "none"
      ? ["step.education", "step.workLocation", "step.review"]
      : ["step.education", "step.workLocation", "step.pensionOnly", "step.review"],
  };

  const titleKeys: Record<string, TranslationKey> = {
    fulltime: "wizard.fulltime.title",
    parttime: "wizard.parttime.title",
    student: "wizard.student.title",
  };

  // ── Shared state ───────────────────────────────────────────────
  const [kommune, setKommune] = useState("København");
  const [isChurch, setIsChurch] = useState(true);
  const [pensionPct, setPensionPct] = useState("4");
  const [erPensionPct, setErPensionPct] = useState("8");

  // ── Full-time state ────────────────────────────────────────────
  const [salaryMode, setSalaryMode] = useState<"annual" | "monthly">("annual");
  const [grossAnnual, setGrossAnnual] = useState("504000");
  const [grossMonthly, setGrossMonthly] = useState("42000");

  // Keep annual and monthly in sync
  const effectiveGrossAnnual = useMemo(() => {
    if (salaryMode === "monthly") return Number(grossMonthly) * 12;
    return Number(grossAnnual);
  }, [salaryMode, grossAnnual, grossMonthly]);

  // ── Part-time state ────────────────────────────────────────────
  const [hourlyRate, setHourlyRate] = useState("180");
  const [hoursMonth, setHoursMonth] = useState("80");

  // ── Extras (fulltime + parttime) ───────────────────────────────
  const [atpEnabled, setAtpEnabled] = useState(true);
  const [atpCustom, setAtpCustom] = useState<string | null>(null); // null = use default
  const [otherPay, setOtherPay] = useState("0");
  const [taxBenefits, setTaxBenefits] = useState("0");
  const [pretaxDed, setPretaxDed] = useState("0");
  const [aftertaxDed, setAftertaxDed] = useState("0");
  const [transportKm, setTransportKm] = useState("0");
  const [unionFees, setUnionFees] = useState("0");

  // ── Student state ──────────────────────────────────────────────
  const [eduType, setEduType] = useState<"vid" | "ungdom">("vid");
  const [livingSituation, setLivingSituation] = useState<"ude" | "hjemme">("ude");
  const [children, setChildren] = useState("0");
  const [suMonths, setSuMonths] = useState("12");
  const [optedOutMonths, setOptedOutMonths] = useState("0");

  const [studentHourlyRate, setStudentHourlyRate] = useState("140");
  const [studentHoursMonth, setStudentHoursMonth] = useState("40");

  const effectiveWorkMonthly = useMemo(() => {
    if (studentWorkMode === "none") return 0;
    return Number(studentHourlyRate) * Number(studentHoursMonth);
  }, [studentWorkMode, studentHourlyRate, studentHoursMonth]);

  // Student periodisering
  const [studyPeriod, setStudyPeriod] = useState<"full" | "start" | "finish">("full");
  const [studyStartMonth, setStudyStartMonth] = useState(8); // August default
  const [studyEndMonth, setStudyEndMonth] = useState(6);     // June default

  const enrolledMonths = useMemo(() => {
    if (studyPeriod === "full") return 12;
    if (studyPeriod === "start") return 13 - studyStartMonth; // e.g. Aug=8 → 5 months
    return studyEndMonth; // e.g. Jun=6 → 6 months
  }, [studyPeriod, studyStartMonth, studyEndMonth]);

  // Auto-cap suMonths and optedOutMonths to enrolled months
  useEffect(() => {
    const su = Number(suMonths);
    const opted = Number(optedOutMonths);
    if (su > enrolledMonths) setSuMonths(String(enrolledMonths));
    if (su + opted > enrolledMonths) setOptedOutMonths(String(Math.max(0, enrolledMonths - su)));
  }, [enrolledMonths]);

  useEffect(() => {
    fetchMeta().then(setMeta).catch(console.error);
  }, []);

  // Defaults per service
  useEffect(() => {
    if (serviceId === "parttime") {
      setPensionPct("0");
      setErPensionPct("0");
      setAtpEnabled(false);
    } else if (serviceId === "student") {
      setPensionPct("0");
      setErPensionPct("0");
    } else {
      setPensionPct("4");
      setErPensionPct("8");
      setAtpEnabled(true);
    }
    setStep(0);
  }, [serviceId]);

  if (!serviceId || !stepNames[serviceId]) {
    navigate("/");
    return null;
  }

  const stepKeys = stepNames[serviceId];
  const steps = stepKeys.map((k) => t(k));
  const isReview = step === steps.length - 1;
  const kommuneList = meta ? Object.keys(meta.kommuner) : [];
  const c = meta?.constants;

  // ── Computed values ────────────────────────────────────────────

  const weeklyHours = Number(hoursMonth) / 4.33;

  const atpDefault = useMemo(() => {
    if (serviceId === "student") return 0;
    if (serviceId === "parttime") {
      if (weeklyHours < 9) return 0;
      if (weeklyHours < 18) return 0;
      if (weeklyHours < 27) return c?.atp_monthly_parttime?.["18-26"] ?? 31.55;
      if (weeklyHours < 37) return c?.atp_monthly_parttime?.["27-36"] ?? 63.1;
      return c?.atp_monthly_fulltime ?? 94.65;
    }
    return c?.atp_monthly_fulltime ?? 94.65;
  }, [serviceId, weeklyHours, c]);

  const atpMonthly = useMemo(() => {
    if (!atpEnabled) return 0;
    if (atpCustom !== null) return Number(atpCustom);
    return atpDefault;
  }, [atpEnabled, atpCustom, atpDefault]);

  // Student SU + fribeloeb
  const suMonthlyAmount = useMemo(() => {
    if (!c) return 7426;
    return livingSituation === "ude" ? c.su_udeboende_month : c.su_hjemmeboende_max;
  }, [livingSituation, c]);

  const fribeloebLaveste = useMemo(() => {
    if (!c) return 20749;
    return eduType === "vid" ? c.fribeloeb_laveste_vid : c.fribeloeb_laveste_ungdom;
  }, [eduType, c]);

  const aarsFribeloeb = useMemo(() => {
    if (!c) return 12 * 20749;
    const nSu = Number(suMonths);
    const nOpted = Number(optedOutMonths);
    const nHighest = Math.max(0, 12 - nSu - nOpted);
    return (
      nSu * fribeloebLaveste +
      nOpted * c.fribeloeb_mellemste +
      nHighest * c.fribeloeb_hoejeste +
      Number(children) * c.fribeloeb_parent_bonus
    );
  }, [suMonths, optedOutMonths, children, fribeloebLaveste, c]);

  // ── Submit ─────────────────────────────────────────────────────

  const handleSubmit = async () => {
    setLoading(true);
    try {
      let result;
      if (serviceId === "fulltime") {
        result = await computeFullTime({
          gross_annual: effectiveGrossAnnual,
          kommune,
          pension_pct: Number(pensionPct),
          employer_pension_pct: Number(erPensionPct),
          is_church: isChurch,
          atp_monthly: atpMonthly,
          other_pay_monthly: Number(otherPay),
          taxable_benefits_monthly: Number(taxBenefits),
          pretax_deductions_monthly: Number(pretaxDed),
          aftertax_deductions_monthly: Number(aftertaxDed),
          transport_km: Number(transportKm),
          union_fees_annual: Number(unionFees),
        });
      } else if (serviceId === "parttime") {
        result = await computePartTime({
          hourly_rate: Number(hourlyRate),
          hours_month: Number(hoursMonth),
          kommune,
          pension_pct: Number(pensionPct),
          employer_pension_pct: Number(erPensionPct),
          is_church: isChurch,
          atp_monthly: atpMonthly,
          other_pay_monthly: Number(otherPay),
          taxable_benefits_monthly: Number(taxBenefits),
          pretax_deductions_monthly: Number(pretaxDed),
          aftertax_deductions_monthly: Number(aftertaxDed),
          transport_km: Number(transportKm),
          union_fees_annual: Number(unionFees),
        });
      } else {
        result = await computeStudent({
          su_monthly: suMonthlyAmount,
          work_gross_monthly: effectiveWorkMonthly,
          kommune,
          pension_pct: studentWorkMode === "none" ? 0 : Number(pensionPct),
          employer_pension_pct: studentWorkMode === "none" ? 0 : Number(erPensionPct),
          is_church: isChurch,
          aars_fribeloeb: aarsFribeloeb,
        });
      }
      navigate(`/results/${serviceId}`, { state: result });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ── Navigation ─────────────────────────────────────────────────

  const handleNext = () => {
    if (isReview) handleSubmit();
    else setStep(step + 1);
  };
  const handleBack = () => {
    if (step > 0) setStep(step - 1);
    else navigate("/");
  };

  // ── Step renderers ─────────────────────────────────────────────

  const renderStep = () => {
    if (isReview) return renderReview();
    if (serviceId === "fulltime") return renderFullTimeStep(step);
    if (serviceId === "parttime") return renderPartTimeStep(step);
    if (serviceId === "student") return renderStudentStep(step);
    return null;
  };

  // ═══════════════════════════════════════════════════════════════
  //  FULL-TIME STEPS
  // ═══════════════════════════════════════════════════════════════

  const renderFullTimeStep = (s: number) => {
    switch (s) {
      case 0: // Income
        return (
          <div className="space-y-6">
            {/* Annual / Monthly toggle */}
            <div className="flex items-center gap-2 p-1 bg-secondary rounded-[var(--radius-md)] w-fit">
              <button
                onClick={() => setSalaryMode("annual")}
                className={`px-4 py-2 text-sm rounded-[var(--radius-sm)] transition-colors ${
                  salaryMode === "annual"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t("input.mode.annual")}
              </button>
              <button
                onClick={() => setSalaryMode("monthly")}
                className={`px-4 py-2 text-sm rounded-[var(--radius-sm)] transition-colors ${
                  salaryMode === "monthly"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t("input.mode.monthly")}
              </button>
            </div>

            {salaryMode === "annual" ? (
              <Field label={t("input.grossAnnual")} tooltip={t("input.grossAnnual.tip")}>
                <Input
                  type="number"
                  step="5000"
                  value={grossAnnual}
                  onChange={(e) => setGrossAnnual(e.target.value)}
                  placeholder="504000"
                  className="text-lg h-14"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  ≈ {fmt(Number(grossAnnual) / 12)} DKK / {t("results.monthly").toLowerCase()}
                </p>
              </Field>
            ) : (
              <Field label={t("input.grossMonthly")} tooltip={t("input.grossMonthly.tip")}>
                <Input
                  type="number"
                  step="500"
                  value={grossMonthly}
                  onChange={(e) => setGrossMonthly(e.target.value)}
                  placeholder="42000"
                  className="text-lg h-14"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  ≈ {fmt(Number(grossMonthly) * 12)} DKK / {t("results.annual").toLowerCase()}
                </p>
              </Field>
            )}
          </div>
        );
      case 1:
        return renderLocationStep();
      case 2:
        return renderPensionExtrasStep();
      default:
        return null;
    }
  };

  // ═══════════════════════════════════════════════════════════════
  //  PART-TIME STEPS
  // ═══════════════════════════════════════════════════════════════

  const renderPartTimeStep = (s: number) => {
    switch (s) {
      case 0: // Work
        return (
          <div className="space-y-6">
            <Field label={t("input.hourlyRate")} tooltip={t("input.hourlyRate.tip")}>
              <Input
                type="number"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                placeholder="180"
                className="text-lg h-14"
              />
            </Field>
            <Field label={t("input.hoursMonth")} tooltip={t("input.hoursMonth.tip")}>
              <Input
                type="number"
                value={hoursMonth}
                onChange={(e) => setHoursMonth(e.target.value)}
                placeholder="80"
                className="text-lg h-14"
              />
            </Field>
            <div className="rounded-[var(--radius-md)] bg-secondary/50 p-4 space-y-1">
              <p className="text-sm text-muted-foreground">
                ≈ {fmt(Number(hourlyRate) * Number(hoursMonth))} DKK gross /
                {t("results.monthly").toLowerCase()} · {weeklyHours.toFixed(1)} h / week
              </p>
            </div>
            {weeklyHours > 0 && weeklyHours < 9 && (
              <Warning>{t("warn.atp.noHours")}</Warning>
            )}
            {weeklyHours >= 9 && weeklyHours < 15 && (
              <Warning variant="info">{t("warn.atp.lowHours")}</Warning>
            )}
          </div>
        );
      case 1:
        return renderLocationStep();
      case 2:
        return renderPensionExtrasStep();
      default:
        return null;
    }
  };

  // ═══════════════════════════════════════════════════════════════
  //  STUDENT STEPS
  // ═══════════════════════════════════════════════════════════════

  const monthOptions = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: t(`month.${i + 1}` as TranslationKey),
  }));

  const renderStudentStep = (s: number) => {
    switch (s) {
      case 0: // Education & SU
        return (
          <div className="space-y-6">
            <Field label={t("input.eduType")} tooltip={t("input.eduType.tip")}>
              <RadioGroup
                value={eduType}
                onValueChange={(v) => setEduType(v as "vid" | "ungdom")}
                className="grid grid-cols-1 sm:grid-cols-2 gap-3"
              >
                <label
                  className={`flex items-center gap-3 p-4 border rounded-[var(--radius-md)] cursor-pointer transition-colors ${
                    eduType === "vid"
                      ? "border-[var(--nordic-accent)] bg-[var(--nordic-accent-light)]"
                      : "border-border"
                  }`}
                >
                  <RadioGroupItem value="vid" id="vid" />
                  <div>
                    <p className="text-sm font-medium">{t("input.eduType.vid")}</p>
                    <p className="text-xs text-muted-foreground">{t("input.eduType.vid.sub")}</p>
                  </div>
                </label>
                <label
                  className={`flex items-center gap-3 p-4 border rounded-[var(--radius-md)] cursor-pointer transition-colors ${
                    eduType === "ungdom"
                      ? "border-[var(--nordic-accent)] bg-[var(--nordic-accent-light)]"
                      : "border-border"
                  }`}
                >
                  <RadioGroupItem value="ungdom" id="ungdom" />
                  <div>
                    <p className="text-sm font-medium">{t("input.eduType.ungdom")}</p>
                    <p className="text-xs text-muted-foreground">{t("input.eduType.ungdom.sub")}</p>
                  </div>
                </label>
              </RadioGroup>
            </Field>

            <Field label={t("input.living")} tooltip={t("input.living.tip")}>
              <RadioGroup
                value={livingSituation}
                onValueChange={(v) => setLivingSituation(v as "ude" | "hjemme")}
                className="grid grid-cols-1 sm:grid-cols-2 gap-3"
              >
                <label
                  className={`flex items-center gap-3 p-4 border rounded-[var(--radius-md)] cursor-pointer transition-colors ${
                    livingSituation === "ude"
                      ? "border-[var(--nordic-accent)] bg-[var(--nordic-accent-light)]"
                      : "border-border"
                  }`}
                >
                  <RadioGroupItem value="ude" id="ude" />
                  <div>
                    <p className="text-sm font-medium">{t("input.living.ude")}</p>
                    <p className="text-xs text-muted-foreground">{t("input.living.ude.sub")}</p>
                  </div>
                </label>
                <label
                  className={`flex items-center gap-3 p-4 border rounded-[var(--radius-md)] cursor-pointer transition-colors ${
                    livingSituation === "hjemme"
                      ? "border-[var(--nordic-accent)] bg-[var(--nordic-accent-light)]"
                      : "border-border"
                  }`}
                >
                  <RadioGroupItem value="hjemme" id="hjemme" />
                  <div>
                    <p className="text-sm font-medium">{t("input.living.hjemme")}</p>
                    <p className="text-xs text-muted-foreground">{t("input.living.hjemme.sub")}</p>
                  </div>
                </label>
              </RadioGroup>
            </Field>

            {/* Study period (periodisering) */}
            <Field label={t("input.studyPeriod")} tooltip={t("input.studyPeriod.tip")}>
              <Select
                value={studyPeriod}
                onValueChange={(v) => setStudyPeriod(v as "full" | "start" | "finish")}
              >
                <SelectTrigger className={`h-12 border rounded-[var(--radius-md)] transition-colors ${
                  studyPeriod ? "border-[var(--nordic-accent)] bg-[var(--nordic-accent-light)]" : "border-border"
                }`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">{t("input.studyPeriod.full")}</SelectItem>
                  <SelectItem value="start">{t("input.studyPeriod.start")}</SelectItem>
                  <SelectItem value="finish">{t("input.studyPeriod.finish")}</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            {studyPeriod === "start" && (
              <Field label={t("input.studyPeriod.startMonth")}>
                <Select
                  value={String(studyStartMonth)}
                  onValueChange={(v) => setStudyStartMonth(Number(v))}
                >
                  <SelectTrigger className={`h-12 border rounded-[var(--radius-md)] transition-colors ${
                    studyStartMonth ? "border-[var(--nordic-accent)] bg-[var(--nordic-accent-light)]" : "border-border"
                  }`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {monthOptions.map((m) => (
                      <SelectItem key={m.value} value={String(m.value)}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            )}

            {studyPeriod === "finish" && (
              <Field label={t("input.studyPeriod.endMonth")}>
                <Select
                  value={String(studyEndMonth)}
                  onValueChange={(v) => setStudyEndMonth(Number(v))}
                >
                  <SelectTrigger className={`h-12 border rounded-[var(--radius-md)] transition-colors ${
                    studyEndMonth ? "border-[var(--nordic-accent)] bg-[var(--nordic-accent-light)]" : "border-border"
                  }`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {monthOptions.map((m) => (
                      <SelectItem key={m.value} value={String(m.value)}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field label={t("input.children")} tooltip={t("input.children.tip")}>
                <Input
                  type="number"
                  min="0"
                  max="10"
                  value={children}
                  onChange={(e) => setChildren(e.target.value)}
                  className={`h-12 rounded-[var(--radius-md)] transition-colors ${
                    Number(children) > 0 ? "!border-[var(--nordic-accent)] !bg-[var(--nordic-accent-light)]" : "!border-border"
                  }`}
                />
              </Field>
              <Field label={t("input.suMonths")} tooltip={t("input.suMonths.tip")}>
                <Input
                  type="number"
                  min="0"
                  max={String(enrolledMonths)}
                  value={suMonths}
                  onChange={(e) => {
                    const v = Math.min(enrolledMonths, Math.max(0, Number(e.target.value)));
                    setSuMonths(String(v));
                    const remaining = enrolledMonths - v;
                    if (Number(optedOutMonths) > remaining)
                      setOptedOutMonths(String(remaining));
                  }}
                  className={`h-12 rounded-[var(--radius-md)] transition-colors ${
                    Number(suMonths) > 0 ? "!border-[var(--nordic-accent)] !bg-[var(--nordic-accent-light)]" : "!border-border"
                  }`}
                />
              </Field>
              <Field label={t("input.optedOut")} tooltip={t("input.optedOut.tip")}>
                <Input
                  type="number"
                  min="0"
                  max={String(enrolledMonths - Number(suMonths))}
                  value={optedOutMonths}
                  onChange={(e) => {
                    const max = enrolledMonths - Number(suMonths);
                    const v = Math.min(max, Math.max(0, Number(e.target.value)));
                    setOptedOutMonths(String(v));
                  }}
                  className={`h-12 rounded-[var(--radius-md)] transition-colors ${
                    Number(optedOutMonths) > 0 ? "!border-[var(--nordic-accent)] !bg-[var(--nordic-accent-light)]" : "!border-border"
                  }`}
                />
              </Field>
            </div>

            {/* Auto-calculated preview */}
            <div className="rounded-[var(--radius-md)] bg-secondary/50 p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">SU ({lang === "da" ? "før skat" : "before tax"})</span>
                <span className="font-mono">{fmt(suMonthlyAmount)} kr/{lang === "da" ? "md" : "month"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{lang === "da" ? "Årligt fribeløb" : "Annual fribeløb"}</span>
                <span className="font-mono">{fmt(aarsFribeloeb)} kr/{lang === "da" ? "år" : "year"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{lang === "da" ? "Fribeløb pr. SU-md" : "Fribeløb per SU month"}</span>
                <span className="font-mono">{fmt(fribeloebLaveste)} kr</span>
              </div>
              {studyPeriod !== "full" && (
                <p className="text-xs text-muted-foreground">
                  {lang === "da"
                    ? `${enrolledMonths} måneder indskrevet, ${12 - enrolledMonths} måneder ikke indskrevet (højeste sats)`
                    : `${enrolledMonths} months enrolled, ${12 - enrolledMonths} months not enrolled (højeste rate)`}
                </p>
              )}
              {Math.max(0, 12 - Number(suMonths) - Number(optedOutMonths)) > 0 && studyPeriod === "full" && (
                <p className="text-xs text-muted-foreground">
                  {Math.max(0, 12 - Number(suMonths) - Number(optedOutMonths))}{" "}
                  {lang === "da" ? "måneder til højeste sats" : "months at højeste rate"} (
                  {fmt(c?.fribeloeb_hoejeste ?? 45420)} kr/{lang === "da" ? "md" : "month"})
                </p>
              )}
            </div>
          </div>
        );

      case 1: // Work & location
        return (
          <div className="space-y-6">
            {/* Work input mode toggle */}
            <div className="flex items-center gap-2 p-1 bg-secondary rounded-[var(--radius-md)] w-fit">
              <button
                onClick={() => setStudentWorkMode("hourly")}
                className={`px-4 py-2 text-sm rounded-[var(--radius-sm)] transition-colors ${
                  studentWorkMode === "hourly"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {lang === "da" ? "Timeløn" : "Hourly wage"}
              </button>
              <button
                onClick={() => setStudentWorkMode("none")}
                className={`px-4 py-2 text-sm rounded-[var(--radius-sm)] transition-colors ${
                  studentWorkMode === "none"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {lang === "da" ? "Kun SU (intet arbejde)" : "SU only (no work)"}
              </button>
            </div>

            {studentWorkMode === "hourly" ? (
              <div className="space-y-4">
                <Field label={t("input.hourlyRate")} tooltip={t("input.hourlyRate.tip")}>
                  <Input
                    type="number"
                    value={studentHourlyRate}
                    onChange={(e) => setStudentHourlyRate(e.target.value)}
                    placeholder="140"
                    className="text-lg h-14"
                  />
                </Field>
                <Field label={t("input.hoursMonth")} tooltip={t("input.hoursMonth.tip")}>
                  <Input
                    type="number"
                    value={studentHoursMonth}
                    onChange={(e) => setStudentHoursMonth(e.target.value)}
                    placeholder="40"
                    className="text-lg h-14"
                  />
                </Field>
                <div className="rounded-[var(--radius-md)] bg-secondary/50 p-4">
                  <p className="text-sm text-muted-foreground">
                    ≈ {fmt(effectiveWorkMonthly)} DKK gross / {t("results.monthly").toLowerCase()}
                    {Number(studentHoursMonth) > 0 && (
                      <span className="ml-2 text-xs">({(Number(studentHoursMonth) / 4.33).toFixed(1)} h/{lang === "da" ? "uge" : "week"})</span>
                    )}
                  </p>
                </div>
                {Number(studentHoursMonth) > 0 && Number(studentHoursMonth) < 46 && (
                  <div className="flex items-start gap-2 rounded-[var(--radius-md)] border border-amber-500/30 bg-amber-500/10 p-3">
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                      {lang === "da"
                        ? "EU/EØS-borgere skal arbejde mindst 10-12 timer/uge (ca. 43-52 timer/md) for at opnå arbejdstagerstatus efter EU-retten og være berettiget til SU. Ved færre timer risikerer du at miste din SU."
                        : "EU/EEA citizens must work at least 10-12 hours/week (~43-52 hours/month) to qualify as an EU worker and be eligible for SU. Working fewer hours may mean you lose your SU grant."}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-[var(--radius-md)] bg-secondary/50 p-4">
                <p className="text-sm text-muted-foreground">
                  {lang === "da"
                    ? "Du modtager kun SU uden arbejdsindkomst. Danske statsborgere er berettiget til SU under uddannelse."
                    : "You will receive SU only, with no work income. Danish citizens are entitled to SU while studying."}
                </p>
              </div>
            )}

            <hr className="border-border" />
            {renderLocationFields()}
          </div>
        );

      case 2: // Pension
        return (
          <div className="space-y-6">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t("input.student.pension.desc")}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label={t("input.pension.yours")} tooltip={t("input.pension.yours.tip")}>
                <Input
                  type="number"
                  step="0.5"
                  min="0"
                  max="15"
                  value={pensionPct}
                  onChange={(e) => setPensionPct(e.target.value)}
                  className="h-14 text-lg"
                />
              </Field>
              <Field label={t("input.pension.employer")} tooltip={t("input.pension.employer.tip")}>
                <Input
                  type="number"
                  step="0.5"
                  min="0"
                  max="20"
                  value={erPensionPct}
                  onChange={(e) => setErPensionPct(e.target.value)}
                  className="h-14 text-lg"
                />
              </Field>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // ═══════════════════════════════════════════════════════════════
  //  SHARED: Location fields
  // ═══════════════════════════════════════════════════════════════

  const renderLocationFields = () => (
    <>
      <Field label={t("input.kommune")} tooltip={t("input.kommune.tip")}>
        <Select value={kommune} onValueChange={setKommune}>
          <SelectTrigger className="h-14 text-lg">
            <SelectValue placeholder={lang === "da" ? "Vælg kommune" : "Select kommune"} />
          </SelectTrigger>
          <SelectContent>
            {kommuneList.map((k) => (
              <SelectItem key={k} value={k}>
                {k}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {meta && meta.kommuner[kommune] && (
          <p className="text-sm text-muted-foreground mt-2">
            Kommuneskat: {meta.kommuner[kommune].kommuneskat} % · Kirkeskat:{" "}
            {meta.kommuner[kommune].kirkeskat} %
          </p>
        )}
      </Field>

      <div className="flex items-center space-x-3 p-4 border border-border rounded-[var(--radius-md)]">
        <Switch id="church" checked={isChurch} onCheckedChange={setIsChurch} />
        <div>
          <Label htmlFor="church">{t("input.church")}</Label>
          <p className="text-xs text-muted-foreground">{t("input.church.sub")}</p>
        </div>
        <Tip text={t("input.church.tip")} />
      </div>
    </>
  );

  const renderLocationStep = () => (
    <div className="space-y-6">{renderLocationFields()}</div>
  );

  // ═══════════════════════════════════════════════════════════════
  //  SHARED: Pension + Extras step (fulltime / parttime)
  // ═══════════════════════════════════════════════════════════════

  const renderPensionExtrasStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-foreground mb-1">{t("input.pension.title")}</h3>
        <p className="text-sm text-muted-foreground mb-4">{t("input.pension.desc")}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label={t("input.pension.yours")} tooltip={t("input.pension.yours.tip")}>
            <Input
              type="number"
              step="0.5"
              min="0"
              max="15"
              value={pensionPct}
              onChange={(e) => setPensionPct(e.target.value)}
              className="h-14 text-lg"
            />
          </Field>
          <Field label={t("input.pension.employer")} tooltip={t("input.pension.employer.tip")}>
            <Input
              type="number"
              step="0.5"
              min="0"
              max="20"
              value={erPensionPct}
              onChange={(e) => setErPensionPct(e.target.value)}
              className="h-14 text-lg"
            />
          </Field>
        </div>
      </div>

      <hr className="border-border" />

      {/* ATP */}
      <div className="p-4 border border-border rounded-[var(--radius-md)] space-y-3">
        <div className="flex items-center gap-3">
          <Switch id="atp" checked={atpEnabled} onCheckedChange={setAtpEnabled} />
          <div className="flex-1 min-w-0">
            <Label htmlFor="atp">{t("input.atp")}</Label>
            <p className="text-xs text-muted-foreground">{t("input.atp.sub")}</p>
          </div>
          <Tip text={t("input.atp.tip")} />
        </div>
        {atpEnabled && (
          <div className="flex items-center gap-3 pl-[52px]">
            <Label className="text-sm text-muted-foreground whitespace-nowrap">
              {lang === "da" ? "Medarbejderandel" : "Employee share"}
            </Label>
            <div className="relative w-36">
              <Input
                type="number"
                min="0"
                step="1"
                value={atpCustom ?? String(atpDefault)}
                onChange={(e) => setAtpCustom(e.target.value)}
                className="h-10 pr-14 text-sm"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                kr/{lang === "da" ? "md" : "mo"}
              </span>
            </div>
            {atpCustom !== null && (
              <button
                type="button"
                onClick={() => setAtpCustom(null)}
                className="text-xs text-muted-foreground hover:text-foreground underline"
              >
                Reset
              </button>
            )}
          </div>
        )}
      </div>

      {/* Collapsible extras */}
      <Collapsible open={extrasOpen} onOpenChange={setExtrasOpen}>
        <CollapsibleTrigger asChild>
          <button className="flex items-center gap-2 w-full p-4 text-sm font-medium text-foreground border border-border rounded-[var(--radius-md)] hover:bg-secondary/50 transition-colors">
            <ChevronDown
              className={`w-4 h-4 transition-transform ${extrasOpen ? "rotate-180" : ""}`}
            />
            {t("input.extras.title")}
            <span className="text-xs text-muted-foreground ml-auto">{t("input.extras.optional")}</span>
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-4 space-y-4 pl-2 border-l-2 border-border">
          <Field label={t("input.otherPay")} tooltip={t("input.otherPay.tip")}>
            <Input type="number" min="0" step="500" value={otherPay} onChange={(e) => setOtherPay(e.target.value)} className="h-12" />
          </Field>
          <Field label={t("input.taxBenefits")} tooltip={t("input.taxBenefits.tip")}>
            <Input type="number" min="0" step="100" value={taxBenefits} onChange={(e) => setTaxBenefits(e.target.value)} className="h-12" />
          </Field>
          <Field label={t("input.pretaxDed")} tooltip={t("input.pretaxDed.tip")}>
            <Input type="number" min="0" step="100" value={pretaxDed} onChange={(e) => setPretaxDed(e.target.value)} className="h-12" />
          </Field>
          <Field label={t("input.aftertaxDed")} tooltip={t("input.aftertaxDed.tip")}>
            <Input type="number" min="0" step="100" value={aftertaxDed} onChange={(e) => setAftertaxDed(e.target.value)} className="h-12" />
          </Field>

          <hr className="border-border my-2" />
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("input.personalDeductions")}</p>

          <Field label={t("input.transportKm")} tooltip={t("input.transportKm.tip")}>
            <Input type="number" min="0" step="1" value={transportKm} onChange={(e) => setTransportKm(e.target.value)} className="h-12" />
          </Field>
          <Field label={t("input.unionFees")} tooltip={t("input.unionFees.tip")}>
            <Input type="number" min="0" step="500" value={unionFees} onChange={(e) => setUnionFees(e.target.value)} className="h-12" />
          </Field>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════
  //  REVIEW
  // ═══════════════════════════════════════════════════════════════

  const reviewRows = (): { label: string; value: string }[] => {
    const rows: { label: string; value: string }[] = [];
    const yes = lang === "da" ? "Ja" : "Yes";
    const no = lang === "da" ? "Nej" : "No";

    if (serviceId === "fulltime") {
      rows.push({
        label: t("input.grossAnnual"),
        value: `${fmt(effectiveGrossAnnual)} DKK`,
      });
      if (salaryMode === "monthly") {
        rows.push({
          label: `(${t("input.grossMonthly")})`,
          value: `${fmt(Number(grossMonthly))} DKK`,
        });
      }
    } else if (serviceId === "parttime") {
      rows.push({ label: t("input.hourlyRate"), value: `${hourlyRate} DKK` });
      rows.push({ label: t("input.hoursMonth"), value: hoursMonth });
      rows.push({
        label: lang === "da" ? "Brutto månedlig" : "Gross monthly",
        value: `${fmt(Number(hourlyRate) * Number(hoursMonth))} DKK`,
      });
    } else {
      rows.push({
        label: t("input.eduType"),
        value: eduType === "vid" ? t("input.eduType.vid") : t("input.eduType.ungdom"),
      });
      rows.push({
        label: t("input.living"),
        value: livingSituation === "ude" ? t("input.living.ude") : t("input.living.hjemme"),
      });
      if (studyPeriod !== "full") {
        rows.push({
          label: t("input.studyPeriod"),
          value: studyPeriod === "start"
            ? `${t("input.studyPeriod.start")} (${t(`month.${studyStartMonth}` as TranslationKey)})`
            : `${t("input.studyPeriod.finish")} (${t(`month.${studyEndMonth}` as TranslationKey)})`,
        });
      }
      rows.push({
        label: `SU / ${lang === "da" ? "md" : "month"}`,
        value: `${fmt(suMonthlyAmount)} DKK`,
      });
      rows.push({
        label: lang === "da" ? "Årligt fribeløb" : "Annual fribeløb",
        value: `${fmt(aarsFribeloeb)} DKK`,
      });
      if (studentWorkMode === "none") {
        rows.push({
          label: lang === "da" ? "Arbejde" : "Work",
          value: lang === "da" ? "Kun SU (intet arbejde)" : "SU only (no work)",
        });
      } else {
        rows.push({
          label: lang === "da" ? "Arbejdsindkomst / md" : "Work income / month",
          value: `${fmt(effectiveWorkMonthly)} DKK`,
        });
        rows.push({
          label: `  (${t("input.hourlyRate")})`,
          value: `${studentHourlyRate} DKK × ${studentHoursMonth} h`,
        });
      }
      if (Number(children) > 0) {
        rows.push({ label: t("input.children"), value: children });
      }
    }

    rows.push({ label: t("input.kommune"), value: kommune });
    rows.push({ label: t("input.church"), value: isChurch ? yes : no });
    if (!(serviceId === "student" && studentWorkMode === "none")) {
      rows.push({ label: t("input.pension.yours"), value: `${pensionPct} %` });
      rows.push({ label: t("input.pension.employer"), value: `${erPensionPct} %` });
    }

    if (serviceId !== "student") {
      rows.push({ label: `ATP / ${lang === "da" ? "md" : "month"}`, value: `${fmt(atpMonthly)} DKK` });
      if (Number(otherPay) > 0)
        rows.push({ label: t("input.otherPay"), value: `${otherPay} DKK` });
      if (Number(taxBenefits) > 0)
        rows.push({ label: t("input.taxBenefits"), value: `${taxBenefits} DKK` });
      if (Number(pretaxDed) > 0)
        rows.push({ label: t("input.pretaxDed"), value: `${pretaxDed} DKK` });
      if (Number(aftertaxDed) > 0)
        rows.push({ label: t("input.aftertaxDed"), value: `${aftertaxDed} DKK` });
      if (Number(transportKm) > 0)
        rows.push({ label: t("input.transportKm"), value: `${transportKm} km` });
      if (Number(unionFees) > 0)
        rows.push({ label: t("input.unionFees"), value: `${unionFees} DKK` });
    }

    return rows;
  };

  const renderReview = () => (
    <div>
      <h2 className="text-2xl mb-6 text-foreground">{t("review.title")}</h2>
      <div className="space-y-3">
        {reviewRows().map((r, i) => (
          <div
            key={i}
            className="flex items-center justify-between p-4 bg-secondary/50 rounded-[var(--radius-md)]"
          >
            <p className="text-sm text-muted-foreground">{r.label}</p>
            <p className="text-foreground font-mono">{r.value}</p>
          </div>
        ))}
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════
  //  LAYOUT
  // ═══════════════════════════════════════════════════════════════

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <p className="text-sm text-muted-foreground mb-2">
          {t(titleKeys[serviceId])}
        </p>

        <div className="mb-12">
          <Stepper steps={steps} currentStep={step} />
        </div>

        <div className="bg-card border border-border rounded-[var(--radius-xl)] p-8 shadow-[var(--shadow-lg)]">
          <div className="flex flex-col">{renderStep()}</div>

          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
            <Button variant="outline" onClick={handleBack}>
              <ChevronLeft className="w-4 h-4 mr-2" />
              {step === 0 ? t("btn.home") : t("btn.back")}
            </Button>
            <Button onClick={handleNext} disabled={loading}>
              {loading
                ? t("btn.calculating")
                : isReview
                ? t("btn.calculate")
                : t("btn.next")}
              {!loading && <ChevronRight className="w-4 h-4 ml-2" />}
            </Button>
          </div>
        </div>

        {/* Quick overview link — only on fulltime step 0 */}
        {serviceId === "fulltime" && step === 0 && (
          <div className="mt-4 text-center">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => navigate("/quick-overview")}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              {t("overview.link")}
            </Button>
          </div>
        )}

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            {lang === "da" ? `Trin ${step + 1} af ${steps.length}` : `Step ${step + 1} of ${steps.length}`}
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Helper components ────────────────────────────────────────────────

function Field({
  label,
  tooltip,
  children,
}: {
  label: string;
  tooltip?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label>{label}</Label>
        {tooltip && <Tip text={tooltip} />}
      </div>
      {children}
    </div>
  );
}

function Tip({ text }: { text: string }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="inline-flex items-center justify-center w-5 h-5 rounded-full text-muted-foreground/60 hover:text-muted-foreground hover:bg-muted transition-colors"
            aria-label="More info"
          >
            <Info className="w-3.5 h-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p>{text}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function Warning({
  children,
  variant = "warning",
}: {
  children: React.ReactNode;
  variant?: "warning" | "info";
}) {
  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-[var(--radius-md)] text-sm ${
        variant === "warning"
          ? "bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800"
          : "bg-blue-50 dark:bg-blue-950/30 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800"
      }`}
    >
      {variant === "warning" ? (
        <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
      ) : (
        <Info className="w-4 h-4 mt-0.5 shrink-0" />
      )}
      <p>{children}</p>
    </div>
  );
}
