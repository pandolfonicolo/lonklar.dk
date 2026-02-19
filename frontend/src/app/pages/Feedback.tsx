import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Send, CheckCircle, AlertCircle } from "lucide-react";
import { Header } from "../components/Header";
import { Button } from "../components/ui/button";
import { useI18n } from "../utils/i18n";

const API = import.meta.env.DEV ? "http://localhost:8000" : "";

type FeedbackType = "bug" | "feature" | "general";

export function Feedback() {
  const navigate = useNavigate();
  const { t } = useI18n();

  React.useEffect(() => { document.title = "Feedback — lønklar.dk"; }, []);

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

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t("btn.backHome")}
        </Button>

        <h1 className="text-2xl font-semibold text-foreground mb-2">{t("feedback.title")}</h1>
        <p className="text-muted-foreground mb-8">{t("feedback.subtitle")}</p>

        {status === "success" ? (
          <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-[var(--radius-lg)] p-5">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-800">{t("feedback.success")}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Type selector */}
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                {t("feedback.type.label")}
              </label>
              <div className="flex flex-wrap gap-2">
                {(["bug", "feature", "general"] as FeedbackType[]).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setType(opt)}
                    className={`px-4 py-2 text-sm rounded-[var(--radius-md)] border transition-colors ${
                      type === opt
                        ? "bg-[var(--nordic-accent)] text-white border-[var(--nordic-accent)]"
                        : "bg-card text-card-foreground border-border hover:border-[var(--nordic-accent)]/50"
                    }`}
                  >
                    {t(`feedback.type.${opt}`)}
                  </button>
                ))}
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                {t("feedback.message.label")}
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t("feedback.message.placeholder")}
                required
                rows={5}
                className="w-full px-4 py-3 text-sm bg-[var(--input-background)] border border-border rounded-[var(--radius-md)] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring resize-y"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                {t("feedback.email.label")}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("feedback.email.placeholder")}
                className="w-full px-4 py-2.5 text-sm bg-[var(--input-background)] border border-border rounded-[var(--radius-md)] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* Error */}
            {status === "error" && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="w-4 h-4" />
                {t("feedback.error")}
              </div>
            )}

            {/* Submit */}
            <Button type="submit" disabled={status === "sending" || !message.trim()}>
              <Send className="w-4 h-4 mr-2" />
              {t("feedback.submit")}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
