import { useNavigate } from "react-router";
import { Home as HomeIcon } from "lucide-react";
import { Button } from "../components/ui/button";

export function NotFound() {
  const navigate = useNavigate();

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
          <h1 className="text-3xl mb-3 text-foreground tracking-tight">Side ikke fundet</h1>
          <p className="text-muted-foreground leading-relaxed">
            Siden du leder efter eksisterer ikke eller er blevet flyttet.
          </p>
        </div>

        <Button onClick={() => navigate("/")} size="lg">
          <HomeIcon className="w-4 h-4 mr-2" />
          Gå til forsiden
        </Button>
      </div>
    </div>
  );
}
