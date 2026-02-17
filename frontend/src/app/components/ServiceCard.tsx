import React from "react";
import { Lock } from "lucide-react";

interface ServiceCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  description: string;
  onClick: () => void;
  comingSoon?: boolean;
  comingSoonLabel?: string;
}

export function ServiceCard({ icon, title, subtitle, description, onClick, comingSoon, comingSoonLabel }: ServiceCardProps) {
  if (comingSoon) {
    return (
      <div
        className="relative w-full h-full text-left bg-card/60 border border-border rounded-[var(--radius-xl)] flex flex-col overflow-hidden opacity-60 select-none"
      >
        {/* Faded accent bar */}
        <div className="h-1 w-full bg-gradient-to-r from-muted-foreground/20 to-muted-foreground/10" />

        <div className="p-6 pt-5 flex flex-col flex-1">
          <div className="flex-shrink-0 w-11 h-11 mb-5 rounded-xl bg-muted/60 text-muted-foreground/50 flex items-center justify-center">
            {icon}
          </div>
          <h3 className="text-lg font-semibold text-muted-foreground mb-0.5">{title}</h3>
          {subtitle && (
            <span className="text-xs text-muted-foreground/40 italic mb-3 block">{subtitle}</span>
          )}
          <p className="text-sm text-muted-foreground/50 leading-relaxed flex-1">{description}</p>

          {/* Coming soon badge */}
          <div className="mt-4 flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted text-xs font-medium text-muted-foreground">
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
      className="group relative w-full h-full text-left bg-card border border-border rounded-[var(--radius-xl)] transition-all duration-300 hover:shadow-lg hover:border-[var(--nordic-accent)]/50 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 flex flex-col overflow-hidden"
    >
      {/* Accent gradient bar */}
      <div className="h-1 w-full bg-gradient-to-r from-[var(--nordic-accent)] to-[var(--nordic-accent-light)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="p-6 pt-5 flex flex-col flex-1">
        <div className="flex-shrink-0 w-11 h-11 mb-5 rounded-xl bg-[var(--nordic-accent)]/10 text-[var(--nordic-accent)] flex items-center justify-center transition-all duration-300 group-hover:bg-[var(--nordic-accent)] group-hover:text-white group-hover:shadow-md group-hover:shadow-[var(--nordic-accent)]/20 group-hover:scale-110">
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-card-foreground mb-0.5 group-hover:text-[var(--nordic-accent)] transition-colors duration-200">{title}</h3>
        {subtitle && (
          <span className="text-xs text-muted-foreground/60 italic mb-3 block">{subtitle}</span>
        )}
        <p className="text-sm text-muted-foreground leading-relaxed flex-1">{description}</p>

        {/* Arrow hint */}
        <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-[var(--nordic-accent)] opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-0 group-hover:translate-x-1">
          <span>Get started</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
        </div>
      </div>
    </button>
  );
}
