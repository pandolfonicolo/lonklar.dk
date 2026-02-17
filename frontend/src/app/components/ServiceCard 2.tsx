import React from "react";

interface ServiceCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  description: string;
  onClick: () => void;
}

export function ServiceCard({ icon, title, subtitle, description, onClick }: ServiceCardProps) {
  return (
    <button
      onClick={onClick}
      className="group relative w-full h-full text-left p-6 bg-card border border-border rounded-[var(--radius-lg)] transition-all duration-200 hover:shadow-[var(--shadow-md)] hover:border-[var(--nordic-accent)] focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 flex flex-col"
    >
      <div className="flex-shrink-0 w-12 h-12 mb-4 rounded-[var(--radius-md)] bg-[var(--nordic-accent-light)] text-[var(--nordic-accent)] flex items-center justify-center transition-colors duration-200 group-hover:bg-[var(--nordic-accent)] group-hover:text-white">
        {icon}
      </div>
      <h3 className="mb-0.5 text-card-foreground">{title}</h3>
      {subtitle && (
        <span className="text-xs text-muted-foreground/70 italic mb-2 block">{subtitle}</span>
      )}
      <p className="text-sm text-muted-foreground leading-relaxed flex-1">{description}</p>
    </button>
  );
}
