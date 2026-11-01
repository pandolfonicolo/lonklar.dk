/** Durable storage boundary. Never silently falls back to isolate memory. */
export interface Statement {
  bind(...values: unknown[]): Statement;
  run(): Promise<any>;
  all(): Promise<{ results: any[] }>;
  first(): Promise<any>;
}
export interface Database { prepare(sql: string): Statement; batch(statements: Statement[]): Promise<any[]> }
export type RecordKind = 'feedback' | 'accuracy_reports' | 'votes';
export class ReportConflict extends Error {}

// Python dict equality ignores key order, including nested input objects.
export function canonicalJson(value: any): string {
  if (Array.isArray(value)) return '[' + value.map(canonicalJson).join(',') + ']';
  if (value !== null && typeof value === 'object') return '{' + Object.keys(value).sort().map(k => JSON.stringify(k) + ':' + canonicalJson(value[k])).join(',') + '}';
  return JSON.stringify(value);
}

export class FeedbackStore {
  db: Database;
  constructor(db: Database) { this.db = db; }
  async append(kind: RecordKind, data: Record<string, any>, now = new Date()): Promise<boolean> {
    const reportId = kind === 'accuracy_reports' ? data.report_id ?? null : null;
    const payload = canonicalJson(data);
    const timestamp = now.toISOString();
    // A single unique INSERT serializes competing writers; a subsequent read
    // observes the committed winner. No read-then-write deduplication race.
    const result = await this.db.prepare('INSERT INTO feedback_records(kind, report_id, payload, timestamp) VALUES (?, ?, ?, ?) ON CONFLICT(report_id) DO NOTHING RETURNING id').bind(kind, reportId, payload, timestamp).all();
    if (result.results.length) return true;
    const existing = await this.db.prepare('SELECT payload FROM feedback_records WHERE report_id = ?').bind(reportId).first();
    if (!existing || existing.payload !== payload) throw new ReportConflict('Report ID already used for different data');
    return false;
  }
  async records(kind: RecordKind): Promise<Record<string, any>[]> {
    const result = await this.db.prepare('SELECT payload, timestamp FROM feedback_records WHERE kind = ? ORDER BY id DESC').bind(kind).all();
    return result.results.map(row => ({ ...JSON.parse(row.payload), timestamp: row.timestamp }));
  }
  async stats() {
    const result = await this.db.prepare("SELECT json_extract(payload, '$.vote') AS vote, count(*) AS n FROM feedback_records WHERE kind = 'votes' GROUP BY vote").all();
    const count = (vote: string) => Number(result.results.find(row => row.vote === vote)?.n ?? 0);
    const up = count('up'), down = count('down');
    return { up, down, total: up + down };
  }
  async allow(key: string, limit: number, now = Math.floor(Date.now() / 1000)) {
    // First-hit fixed window, matching the existing limiter's strategy. Atomic
    // UPSERT prevents concurrent isolates all admitting the same last slot.
    const results = await this.db.batch([
      this.db.prepare('DELETE FROM feedback_limits WHERE expires <= ?').bind(now),
      this.db.prepare('INSERT INTO feedback_limits(key, hits, expires) VALUES (?, 1, ?) ON CONFLICT(key) DO UPDATE SET hits = hits + 1 RETURNING hits, expires').bind(key, now + 60),
    ]);
    const row = results[1].results?.[0];
    if (!row) throw new Error('Rate limit storage did not return a counter');
    return { allowed: Number(row.hits) <= limit, retryAfter: Math.max(1, Number(row.expires) - now) };
  }
}
