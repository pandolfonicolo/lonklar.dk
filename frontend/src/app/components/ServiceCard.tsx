import React from "react";
import { Lock, ArrowRight } from "lucide-react";

interface ServiceCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  description: string;
  onClick: () => void;
  comingSoon?: boolean;
  comingSoonLabel?: string;
  /** Accent hue override — e.g. "var(--nordic-accent)" or a hex color */
  accentColor?: string;
  ctaLabel?: string;
}

export function ServiceCard({
  icon,
  title,
  subtitle,
  description,
  onClick,
  comingSoon,
  comingSoonLabel,
  accentColor = "var(--nordic-accent)",
  ctaLabel = "Get started",
}: ServiceCardProps) {
  if (comingSoon) {
    return (
      <div className="relative w-full h-full text-left bg-card/50 border border-border/60 rounded-[var(--radius-xl)] flex flex-col overflow-hidden select-none">
        {/* Faded accent bar */}
        <div className="h-1 w-full bg-gradient-to-r from-muted-foreground/15 to-transparent" />

        <div className="p-6 pt-5 flex flex-col flex-1">
          <div className="flex-shrink-0 w-12 h-12 mb-5 rounded-xl bg-muted/50 text-muted-foreground/40 flex items-center justify-center">
            {icon}
          </div>
          <h3 className="text-lg font-semibold text-muted-foreground/70 mb-0.5">{title}</h3>
          {subtitle && (
            <span className="text-xs text-muted-foreground/30 italic mb-3 block">{subtitle}</span>
          )}
          <p className="text-sm text-muted-foreground/40 leading-relaxed flex-1">{description}</p>

          {/* Coming soon badge */}
          <div className="mt-5 flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/80 text-xs font-medium text-muted-foreground/70 border border-border/40">
              <Lock className="w-3 h-3" />
              {comingSoonLabel || "Coming soon"}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={onClick}
      className="group relative w-full h-full text-left bg-card border border-border rounded-[var(--radius-xl)] shadow-[var(--shadow-sm)] transition-all duration-300 hover:shadow-xl hover:border-[var(--nordic-accent)]/40 hover:-translate-y-1.5 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 flex flex-col overflow-hidden"
    >
      {/* Accent gradient bar — always visible */}
      <div
        className="h-1 w-full transition-opacity duration-300"
        style={{
          background: `linear-gradient(to right, ${accentColor}, ${accentColor}40)`,
          opacity: 0.5,
        }}
      />
      {/* Full-opacity overlay on hover */}
      <div
        className="absolute top-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `linear-gradient(to right, ${accentColor}, ${accentColor}80)`,
        }}
      />

      <div className="p-6 pt-5 flex flex-col flex-1">
        {/* Icon — larger, tinted with card accent, fills on hover */}
        <div className="relative flex-shrink-0 w-12 h-12 mb-5 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-md overflow-hidden">
          {/* Tinted bg (resting) */}
          <div
            className="absolute inset-0 transition-opacity duration-300 group-hover:opacity-0 rounded-xl"
            style={{ backgroundColor: `${accentColor}15` }}
          />
          {/* Solid bg (hover) */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"
            style={{ backgroundColor: accentColor, boxShadow: `0 4px 12px ${accentColor}30` }}
          />
          <div className="relative z-10 transition-colors duration-300" style={{ color: accentColor }}>
            <div className="group-hover:text-white transition-colors duration-300">
              {icon}
            </div>
          </div>
        </div>

        <h3 className="text-lg font-semibold text-card-foreground mb-0.5 group-hover:text-[var(--nordic-accent)] transition-colors duration-200">
          {title}
        </h3>
        {subtitle && (
          <span className="text-xs text-muted-foreground/60 italic mb-3 block">{subtitle}</span>
        )}
        <p className="text-sm text-muted-foreground leading-relaxed flex-1">{description}</p>

        {/* CTA — pill-style, animates on hover */}
        <div className="mt-5 flex items-center">
          <span
            className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-all duration-300 group-hover:gap-3"
            style={{
              color: accentColor,
              borderColor: `${accentColor}30`,
              backgroundColor: `${accentColor}08`,
            }}
          >
            {ctaLabel}
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </button>
  );
}
