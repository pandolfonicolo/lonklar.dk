import React, { useEffect, useState } from "react";
import { Header } from "../components/Header";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { MessageSquare, BarChart3, ThumbsUp, ThumbsDown, AlertTriangle, Bug, Lightbulb, MessageCircle } from "lucide-react";

const API = import.meta.env.DEV ? "http://localhost:8000" : "";

interface FeedbackItem {
  type: string;
  message: string;
  timestamp?: string;
}

interface AccuracyReport {
  service_type: string;
  estimated_net_monthly: number;
  actual_net_monthly: number;
  difference: number;
  difference_pct: number;
  inputs?: Record<string, unknown>;
  timestamp?: string;
}

interface VoteItem {
  vote: string;
  service_type: string;
  estimated_net: number;
  timestamp?: string;
}

function fmtDate(ts?: string): string {
  if (!ts) return "—";
  const d = new Date(ts);
  return d.toLocaleDateString("en-DK", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function fmtDKK(n: number): string {
  return new Intl.NumberFormat("da-DK", { maximumFractionDigits: 0 }).format(n);
}

const typeIcon = (type: string) => {
  switch (type) {
    case "bug": return <Bug className="w-4 h-4 text-red-500" />;
    case "feature": return <Lightbulb className="w-4 h-4 text-amber-500" />;
    default: return <MessageCircle className="w-4 h-4 text-blue-500" />;
  }
};

export function AdminFeedback() {
  const [token, setToken] = useState(() => sessionStorage.getItem("admin_token") || "");
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [reports, setReports] = useState<AccuracyReport[]>([]);
  const [votes, setVotes] = useState<VoteItem[]>([]);

  const fetchData = async (t: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/api/admin/feedback`, {
        headers: { "X-Admin-Token": t },
      });
      if (!res.ok) {
        if (res.status === 401) throw new Error("Invalid token");
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      setFeedback(data.feedback || []);
      setReports(data.accuracy_reports || []);
      setVotes(data.votes || []);
      setAuthed(true);
      sessionStorage.setItem("admin_token", t);
    } catch (e: unknown) {
      setError((e as Error).message);
      setAuthed(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && token !== "changeme") fetchData(token);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData(token);
  };

  // Stats
  const votesUp = votes.filter((v) => v.vote === "up").length;
  const votesDown = votes.filter((v) => v.vote === "down").length;
  const avgDiff = reports.length > 0
    ? reports.reduce((sum, r) => sum + Math.abs(r.difference_pct), 0) / reports.length
    : 0;

  if (!authed) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-md mx-auto px-4 py-24">
          <h1 className="text-2xl font-bold text-foreground mb-6 text-center">Admin — Feedback Viewer</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              type="password"
              placeholder="Admin token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="h-14 text-lg"
              autoFocus
            />
            {error && (
              <p className="text-destructive text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> {error}
              </p>
            )}
            <Button type="submit" className="w-full h-12" disabled={loading || !token}>
              {loading ? "Checking…" : "Login"}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-foreground">Feedback Dashboard</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fetchData(token)}
            disabled={loading}
          >
            {loading ? "Refreshing…" : "Refresh"}
          </Button>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Feedback" value={feedback.length} />
          <StatCard label="Accuracy Reports" value={reports.length} />
          <StatCard
            label="Votes"
            value={`👍 ${votesUp}  👎 ${votesDown}`}
          />
          <StatCard
            label="Avg accuracy diff"
            value={reports.length > 0 ? `${avgDiff.toFixed(1)}%` : "—"}
          />
        </div>

        <Tabs defaultValue="feedback" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="feedback">
              <MessageSquare className="w-4 h-4 mr-1" /> Feedback ({feedback.length})
            </TabsTrigger>
            <TabsTrigger value="accuracy">
              <BarChart3 className="w-4 h-4 mr-1" /> Accuracy ({reports.length})
            </TabsTrigger>
            <TabsTrigger value="votes">
              <ThumbsUp className="w-4 h-4 mr-1" /> Votes ({votes.length})
            </TabsTrigger>
          </TabsList>

          {/* Feedback tab */}
          <TabsContent value="feedback">
            {feedback.length === 0 ? (
              <Empty text="No feedback yet" />
            ) : (
              <div className="space-y-3">
                {feedback.map((item, i) => (
                  <div key={i} className="border border-border rounded-lg p-4 bg-card">
                    <div className="flex items-center gap-2 mb-2">
                      {typeIcon(item.type)}
                      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{item.type}</span>
                      <span className="text-xs text-muted-foreground ml-auto">{fmtDate(item.timestamp)}</span>
                    </div>
                    <p className="text-sm text-foreground whitespace-pre-wrap">{item.message}</p>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Accuracy tab */}
          <TabsContent value="accuracy">
            {reports.length === 0 ? (
              <Empty text="No accuracy reports yet" />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-muted-foreground">
                      <th className="py-2 pr-4">Date</th>
                      <th className="py-2 pr-4">Type</th>
                      <th className="py-2 pr-4 text-right">Estimated</th>
                      <th className="py-2 pr-4 text-right">Actual</th>
                      <th className="py-2 pr-4 text-right">Diff</th>
                      <th className="py-2 pr-4 text-right">Diff %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((r, i) => (
                      <tr key={i} className="border-b border-border/50">
                        <td className="py-2 pr-4 text-xs text-muted-foreground">{fmtDate(r.timestamp)}</td>
                        <td className="py-2 pr-4 capitalize">{r.service_type}</td>
                        <td className="py-2 pr-4 text-right font-mono">{fmtDKK(r.estimated_net_monthly)} kr</td>
                        <td className="py-2 pr-4 text-right font-mono">{fmtDKK(r.actual_net_monthly)} kr</td>
                        <td className={`py-2 pr-4 text-right font-mono ${r.difference > 0 ? "text-green-600" : "text-red-500"}`}>
                          {r.difference > 0 ? "+" : ""}{fmtDKK(r.difference)} kr
                        </td>
                        <td className={`py-2 pr-4 text-right font-mono ${r.difference_pct > 0 ? "text-green-600" : "text-red-500"}`}>
                          {r.difference_pct > 0 ? "+" : ""}{r.difference_pct.toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>

          {/* Votes tab */}
          <TabsContent value="votes">
            {votes.length === 0 ? (
              <Empty text="No votes yet" />
            ) : (
              <div className="space-y-2">
                {votes.map((v, i) => (
                  <div key={i} className="flex items-center gap-3 border border-border rounded-lg p-3 bg-card">
                    {v.vote === "up" ? (
                      <ThumbsUp className="w-5 h-5 text-green-500" />
                    ) : (
                      <ThumbsDown className="w-5 h-5 text-red-500" />
                    )}
                    <span className="text-sm capitalize">{v.service_type}</span>
                    {v.estimated_net > 0 && (
                      <span className="text-xs text-muted-foreground">
                        est. {fmtDKK(v.estimated_net)} kr/mo
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground ml-auto">{fmtDate(v.timestamp)}</span>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border border-border rounded-lg p-4 bg-card">
      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{label}</p>
      <p className="text-xl font-semibold text-foreground">{value}</p>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="text-center py-12 text-muted-foreground">
      <p>{text}</p>
    </div>
  );
}
