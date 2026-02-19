import React, { useState } from "react";
import { useNavigate, Link } from "react-router";
import { ArrowLeft, Send, CheckCircle, AlertCircle, Bug, Lightbulb, MessageCircle, Mail, ArrowRight } from "lucide-react";
import { Header } from "../components/Header";
import { Button } from "../components/ui/button";
import { useI18n } from "../utils/i18n";

const API = import.meta.env.DEV ? "http://localhost:8000" : "";

type FeedbackType = "bug" | "feature" | "general";

const TYPE_ICONS: Record<FeedbackType, React.ElementType> = {
  bug: Bug,
  feature: Lightbulb,
  general: MessageCircle,
};

export function Feedback() {
  const navigate = useNavigate();
  const { t } = useI18n();

  React.useEffect(() => { document.title = "Contact – Lonklar | lønklar.dk"; }, []);

  const [type, setType] = useState<FeedbackType>("general");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setStatus("sending");
    try {
      const res = await fetch(`${API}/api/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          message: message.trim(),
          email: email.trim() || null,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      setStatus("success");
      setMessage("");
      setEmail("");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t("btn.backHome")}
        </Button>

        {/* Hero */}
        <div className="mb-10">
          <h1 className="text-3xl font-semibold text-foreground mb-3">{t("feedback.title")}</h1>
          <p className="text-muted-foreground text-lg max-w-xl">
            {t("feedback.subtitle")}
          </p>
        </div>

        {status === "success" ? (
          <div className="bg-card border border-border rounded-[var(--radius-xl)] p-8 text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle className="w-7 h-7 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">{t("feedback.success.title" as any)}</h2>
            <p className="text-muted-foreground mb-6">{t("feedback.success")}</p>
            <div className="flex items-center justify-center gap-3">
              <Button variant="outline" onClick={() => setStatus("idle")}>
                {t("feedback.sendAnother" as any)}
              </Button>
              <Button variant="ghost" onClick={() => navigate("/")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t("btn.backHome")}
              </Button>
            </div>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-[var(--radius-xl)] overflow-hidden">
            <form onSubmit={handleSubmit}>
              {/* Type selector */}
              <div className="p-6 sm:p-8 border-b border-border">
                <label className="block text-sm font-medium text-foreground mb-3">
                  {t("feedback.type.label")}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {(["bug", "feature", "general"] as FeedbackType[]).map((opt) => {
                    const Icon = TYPE_ICONS[opt];
                    const isActive = type === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setType(opt)}
                        className={`flex items-center gap-3 px-4 py-3.5 text-sm rounded-[var(--radius-lg)] border-2 transition-all text-left ${
                          isActive
                            ? "border-[var(--nordic-accent)] bg-[var(--nordic-accent)]/5 shadow-sm"
                            : "border-border bg-background hover:border-muted-foreground/30"
                        }`}
                      >
                        <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-[var(--nordic-accent)]" : "text-muted-foreground"}`} />
                        <span className={isActive ? "font-medium text-foreground" : "text-muted-foreground"}>
                          {t(`feedback.type.${opt}`)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Message */}
              <div className="p-6 sm:p-8 border-b border-border">
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t("feedback.message.label")} <span className="text-destructive">*</span>
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t("feedback.message.placeholder")}
                  required
                  rows={5}
                  className="w-full px-4 py-3 text-sm bg-background border border-border rounded-[var(--radius-md)] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-[var(--nordic-accent)]/30 focus:border-[var(--nordic-accent)] resize-y transition-colors"
                />
              </div>

              {/* Email */}
              <div className="p-6 sm:p-8 border-b border-border">
                <label className="block text-sm font-medium text-foreground mb-2">
                  <span className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    {t("feedback.email.label")}
                  </span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("feedback.email.placeholder")}
                  className="w-full px-4 py-2.5 text-sm bg-background border border-border rounded-[var(--radius-md)] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-[var(--nordic-accent)]/30 focus:border-[var(--nordic-accent)] transition-colors"
                />
              </div>

              {/* Actions */}
              <div className="p-6 sm:p-8 bg-secondary/20 flex items-center justify-between gap-4">
                <div>
                  {status === "error" && (
                    <div className="flex items-center gap-2 text-sm text-destructive">
                      <AlertCircle className="w-4 h-4" />
                      {t("feedback.error")}
                    </div>
                  )}
                </div>
                <Button
                  type="submit"
                  disabled={status === "sending" || !message.trim()}
                  className="min-w-[140px]"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {status === "sending" ? t("btn.calculating" as any).replace("…", "...") : t("feedback.submit")}
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
