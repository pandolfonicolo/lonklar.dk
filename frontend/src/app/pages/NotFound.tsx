import { useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "../components/ui/button";
import { useI18n } from "../utils/i18n";

export function NotFound() {
  const navigate = useNavigate();
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center" style={{
            background: 'var(--glass-bg-elevated)',
            border: '1px solid var(--glass-border)',
            boxShadow: 'var(--shadow-md), var(--surface-inner-highlight)'
          }}>
            <span className="text-5xl text-muted-foreground font-light tracking-tight">404</span>
          </div>
          <h1 className="text-3xl mb-3 text-foreground tracking-tight">{t("notFound.title" as any)}</h1>
          <p className="text-muted-foreground leading-relaxed">
            {t("notFound.desc" as any)}
          </p>
        </div>

        <Button variant="ghost" onClick={() => navigate("/")} size="lg">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t("btn.backHome")}
        </Button>
      </div>
    </div>
  );
}
