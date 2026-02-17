import React from "react";
import { motion } from "motion/react";
import { useI18n } from "../utils/i18n";

/**
 * Animated salary preview widget that shows a simulated gross→net calculation.
 * Replaces the generic HeroIllustration with something meaningful.
 */
export function SalaryPreview() {
  const { t, lang } = useI18n();
  const fmt = (n: number) =>
    n.toLocaleString(lang === "da" ? "da-DK" : "en-DK", { maximumFractionDigits: 0 });

  const rows = [
    { label: lang === "da" ? "Bruttoløn" : "Gross salary", value: 42000, type: "gross" as const },
    { label: "AM-bidrag (8%) ", value: -3360, type: "deduction" as const },
    { label: lang === "da" ? "A-skat" : "Income tax", value: -9814, type: "deduction" as const },
    { label: lang === "da" ? "ATP" : "ATP", value: -94, type: "deduction" as const },
    { label: lang === "da" ? "Nettoløn" : "Net salary", value: 28732, type: "net" as const },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="relative w-full max-w-xs mx-auto lg:mx-0"
    >
      {/* Card — visually marked as example */}
      <div className="bg-card border-2 border-dashed border-border/60 rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] overflow-hidden relative">
        {/* "Example" ribbon — top-right corner */}
        <div className="absolute top-3 -right-8 z-10 bg-muted-foreground/70 text-white text-[9px] font-bold uppercase tracking-widest px-8 py-0.5 rotate-45 shadow-sm pointer-events-none select-none">
          {lang === "da" ? "Eksempel" : "Example"}
        </div>

        {/* Header strip */}
        <div className="bg-[var(--nordic-accent)] px-5 py-3">
          <span className="text-white/90 text-xs font-medium tracking-wide uppercase">
            {lang === "da" ? "Månedsoversigt" : "Monthly overview"}
          </span>
        </div>

        {/* Rows */}
        <div className="px-5 py-4 space-y-0">
          {rows.map((row, i) => (
            <motion.div
              key={row.label}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.4 + i * 0.1 }}
              className={`flex items-center justify-between gap-6 py-2 ${
                row.type === "net" ? "border-t border-border mt-1 pt-3" : ""
              }`}
            >
              <span
                className={`text-sm ${
                  row.type === "net"
                    ? "font-semibold text-card-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {row.label}
              </span>
              <span
                className={`font-mono text-sm tabular-nums ${
                  row.type === "gross"
                    ? "text-card-foreground font-medium"
                    : row.type === "net"
                    ? "text-[var(--nordic-accent)] font-semibold"
                    : "text-muted-foreground"
                }`}
              >
                {row.type === "deduction" ? "−" : ""}
                {fmt(Math.abs(row.value))} kr
              </span>
            </motion.div>
          ))}
        </div>

        {/* Effective rate */}
        <div className="px-5 pb-4">
          <div className="flex items-center justify-between bg-[var(--nordic-accent-light)] rounded-[var(--radius-md)] px-3 py-2">
            <span className="text-xs text-[var(--nordic-accent-dark)]">
              {lang === "da" ? "Effektiv skattesats" : "Effective tax rate"}
            </span>
            <span className="text-xs font-mono font-semibold text-[var(--nordic-accent-dark)]">
              31,6%
            </span>
          </div>
        </div>
      </div>

      {/* Caption */}
      <p className="text-center text-[11px] text-muted-foreground/60 mt-2 italic">
        {lang === "da" ? "Illustrativt. Din beregning kan afvige." : "Illustrative only. Your result may differ."}
      </p>

      {/* Decorative blur */}
      <div className="absolute -z-10 inset-0 blur-3xl opacity-20 bg-[var(--nordic-accent)]" />
    </motion.div>
  );
}
