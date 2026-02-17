import { Shield, Lock, FileText } from "lucide-react";

export function TrustBar() {
  return (
    <div className="w-full border-t border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--nordic-accent-light)] text-[var(--nordic-accent)] flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm text-card-foreground mb-0.5">No ads. No selling.</p>
              <p className="text-xs text-muted-foreground">Minimal data collection</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--nordic-accent-light)] text-[var(--nordic-accent)] flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm text-card-foreground mb-0.5">Transparent method</p>
              <p className="text-xs text-muted-foreground">Open calculations</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--nordic-accent-light)] text-[var(--nordic-accent)] flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm text-card-foreground mb-0.5">Built for Denmark</p>
              <p className="text-xs text-muted-foreground">SKAT-aligned calculations</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
