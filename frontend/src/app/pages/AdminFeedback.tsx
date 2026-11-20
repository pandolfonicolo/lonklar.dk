import React, { useEffect, useState } from "react";
import { Header } from "../components/Header";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

type Kind = "feedback" | "accuracy_reports" | "votes";
type Row = { id?: number; kind: Kind; record: Record<string, unknown>; archived_at?: string | null };
type Page = {
  records?: Row[];
  feedback?: Record<string, unknown>[];
  accuracy_reports?: Record<string, unknown>[];
  votes?: Record<string, unknown>[];
  summary?: { kind: Kind; archived: boolean; count: number }[];
  retention?: string;
  pagination?: { next_before: number | null };
};
const labels: Record<Kind, string> = { feedback: "Feedback", accuracy_reports: "Accuracy reports", votes: "Votes" };

export function AdminFeedback() {
  const [token, setToken] = useState("");
  const [authed, setAuthed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [page, setPage] = useState<Page>({});
  const [kind, setKind] = useState<Kind | "">("");
  const [archived, setArchived] = useState(false);

  // The credential lives in component memory only; remove the legacy tab cache.
  useEffect(() => { sessionStorage.removeItem("admin_token"); }, []);

  async function api(path: string, options: RequestInit = {}) {
    const response = await fetch(path, { ...options, credentials: "omit", cache: "no-store",
      headers: { "X-Admin-Token": token, ...options.headers } });
    if (!response.ok) {
      if (response.status === 401) setAuthed(false);
      throw new Error(response.status === 401 ? "Invalid admin token" : `Request failed (${response.status})`);
    }
    return response;
  }

  async function load(append = false, filter = kind, archive = archived) {
    setBusy(true); setError("");
    try {
      const query = new URLSearchParams({ limit: "50", archived: String(archive) });
      if (filter) query.set("kind", filter);
      if (append && page.pagination?.next_before) query.set("before", String(page.pagination.next_before));
      const result: Page = await (await api(`/api/admin/feedback?${query}`)).json();
      const items = result.records ?? (Object.keys(labels) as Kind[]).flatMap(k =>
        (result[k] || []).map(record => ({ kind: k, record })));
      setRows(previous => append ? [...previous, ...items] : items);
      setPage(result); setAuthed(true);
    } catch (e) { setError((e as Error).message); }
    finally { setBusy(false); }
  }

  async function archiveRow(row: Row) {
    setBusy(true); setError("");
    try {
      await api(`/api/admin/feedback/${row.id}/archive`, { method: "POST",
        headers: { "Content-Type": "application/json" }, body: JSON.stringify({ archived: !archived }) });
      await load();
    } catch (e) { setError((e as Error).message); }
    finally { setBusy(false); }
  }

  async function exportAll() {
    setBusy(true); setError("");
    try {
      const blob = page.retention ? await (await api("/api/admin/feedback/export")).blob()
        : new Blob([rows.map(row => JSON.stringify(row)).join("\n") + "\n"], { type: "application/x-ndjson" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a"); link.href = url; link.download = "lonklar-feedback.jsonl"; link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) { setError((e as Error).message); }
    finally { setBusy(false); }
  }

  function logout() { setToken(""); setAuthed(false); setRows([]); setPage({}); setError(""); }
  const counts = page.summary?.reduce((all, row) => ({ ...all, [row.kind]: (all[row.kind] || 0) + row.count }), {} as Partial<Record<Kind, number>>);

  return <div className="min-h-screen bg-background"><Header />
    <main className={`mx-auto px-4 py-16 ${authed ? "max-w-5xl" : "max-w-md"}`}>
      <h1 className="text-2xl font-semibold mb-4">LønKlar · Feedback</h1>
      {error && <p role="alert" className="text-destructive mb-4">{error}</p>}
      {!authed ? <form className="space-y-4" onSubmit={(event: React.FormEvent) => { event.preventDefault(); void load(); }}>
        <label htmlFor="feedback-admin-token" className="block text-sm">Admin token</label>
        <Input id="feedback-admin-token" type="password" autoComplete="off" value={token}
          onChange={event => setToken(event.target.value)} />
        <p className="text-sm text-muted-foreground">The token stays in memory until you close or reload this page. It is never added to a URL.</p>
        <Button type="submit" disabled={busy || !token}>{busy ? "Checking…" : "Open feedback"}</Button>
      </form> : <>
        <div className="flex flex-wrap gap-2 mb-6">
          <Button variant="outline" disabled={busy} onClick={() => void load()}>Refresh</Button>
          <Button variant="outline" disabled={busy} onClick={() => void exportAll()}>Export all, including archive</Button>
          <Button variant="ghost" onClick={logout}>Log out</Button>
        </div>
        {page.retention && <p className="text-sm text-muted-foreground mb-6">No automatic expiry. Archiving is reversible and keeps records in exports.</p>}
        <div className="grid grid-cols-3 gap-3 mb-6">{(Object.keys(labels) as Kind[]).map(k =>
          <div className="rounded-lg border border-border p-4" key={k}><p className="text-sm text-muted-foreground">{labels[k]}</p>
            <p className="text-xl font-medium">{counts?.[k] ?? page[k]?.length ?? 0}</p></div>)}</div>
        {page.pagination && <div className="flex flex-wrap gap-4 mb-6">
          <label>Type <select className="ml-2 rounded border border-border bg-background p-2" value={kind} disabled={busy}
            onChange={event => { const value = event.target.value as Kind | ""; setKind(value); void load(false, value); }}>
            <option value="">All</option>{(Object.keys(labels) as Kind[]).map(k => <option key={k} value={k}>{labels[k]}</option>)}</select></label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={archived} disabled={busy}
            onChange={event => { setArchived(event.target.checked); void load(false, kind, event.target.checked); }} />Show archive</label>
        </div>}
        <div className="space-y-4">{rows.length === 0 ? <p>No records in this view.</p> : rows.map((row, index) =>
          <article key={row.id ?? index} className="rounded-lg border border-border p-5 bg-card">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3"><h2 className="font-medium">{labels[row.kind]} {row.id ? `#${row.id}` : ""}</h2>
              <span className="text-xs text-muted-foreground">{String(row.record.timestamp ?? "")}</span>
              {row.id && <Button variant="outline" size="sm" disabled={busy} onClick={() => void archiveRow(row)}>{archived ? "Restore" : "Archive"}</Button>}
            </div>
            {row.kind === "feedback" ? <><p className="text-xs uppercase text-muted-foreground mb-2">{String(row.record.type)}</p>
              <p className="whitespace-pre-wrap break-words">{String(row.record.message)}</p></>
              : <pre className="text-xs whitespace-pre-wrap break-words">{JSON.stringify(row.record, null, 2)}</pre>}
          </article>)}</div>
        {page.pagination?.next_before && <Button className="mt-6" variant="outline" disabled={busy} onClick={() => void load(true)}>Load older records</Button>}
      </>}
    </main>
  </div>;
}
