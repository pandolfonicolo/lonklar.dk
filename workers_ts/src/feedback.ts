import { FeedbackStore, ReportConflict } from './storage.ts';
import type { Database } from './storage.ts';
import { pyRound } from './numeric.ts';

export interface VoteStatsLimiter {
  limit(options: { key: string }): Promise<{ success: boolean }>;
}
export interface FeedbackEnv {
  FEEDBACK_DB?: Database;
  ADMIN_TOKEN?: string;
  VOTE_STATS_LIMITER?: VoteStatsLimiter;
}
const json = (body: any, status = 200, headers = {}) => Response.json(body, { status, headers });
const limits: Record<string, number> = { '/api/feedback': 10, '/api/accuracy-report': 10, '/api/vote': 30, '/api/vote/stats': 60 };

export async function handleFeedback(request: Request, path: string, body: any, env: FeedbackEnv): Promise<Response | null> {
  const admin = path === '/api/admin/feedback';
  if (!(path in limits) && !admin) return null;
  if (admin && (!env.ADMIN_TOKEN || request.headers.get('x-admin-token') !== env.ADMIN_TOKEN)) return json({ detail: 'Unauthorized' }, 401);
  const method = admin || path === '/api/vote/stats' ? 'GET' : 'POST';
  if (request.method !== method) return json({ detail: 'Method Not Allowed' }, 405, { Allow: method });
  if (!env.FEEDBACK_DB) return json({ detail: 'Feedback storage unavailable' }, 503);
  try {
    const store = new FeedbackStore(env.FEEDBACK_DB);
    if (!admin) {
      // CF supplies this header on ingress; never trust caller-supplied XFF.
      // Requests outside Cloudflare without an address share a conservative bucket.
      const identity = request.headers.get('CF-Connecting-IP') || 'unknown';
      const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(path + '\0' + identity));
      const key = Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('');
      if (path === '/api/vote/stats') {
        // Read admission must not amplify reads into D1 writes. Cloudflare's
        // native limiter is approximate and per location, not a global quota.
        // Fail closed rather than silently replacing it with isolate memory.
        if (!env.VOTE_STATS_LIMITER) return json({ detail: 'Vote statistics rate limiter unavailable' }, 503);
        let result: { success: boolean };
        try {
          result = await env.VOTE_STATS_LIMITER.limit({ key });
          if (!result || typeof result.success !== 'boolean') throw new Error('Invalid limiter result');
        } catch {
          return json({ detail: 'Vote statistics rate limiter unavailable' }, 503);
        }
        if (!result.success) return json({ error: 'Rate limit exceeded: 60 per 1 minute' }, 429, { 'Retry-After': '60' });
      } else {
        // Mutations retain the strict, durable D1-backed quota.
        const rate = await store.allow(key, limits[path]);
        if (!rate.allowed) return json({ error: `Rate limit exceeded: ${limits[path]} per 1 minute` }, 429, { 'Retry-After': String(rate.retryAfter) });
      }
    }
    if (admin) return json({ feedback: await store.records('feedback'), accuracy_reports: await store.records('accuracy_reports'), votes: await store.records('votes') });
    if (path === '/api/vote/stats') return json(await store.stats());
    if (path === '/api/accuracy-report') {
      const difference = body.actual_net_monthly - body.estimated_net_monthly;
      const data = { ...body, difference: pyRound(difference, 2), difference_pct: body.estimated_net_monthly ? pyRound(difference / body.estimated_net_monthly * 100, 2) : 0 };
      const saved = await store.append('accuracy_reports', data);
      return json({ status: 'ok', report_id: body.report_id ?? null, duplicate: !saved });
    }
    await store.append(path === '/api/vote' ? 'votes' : 'feedback', body);
    return json({ status: 'ok' });
  } catch (error) {
    if (error instanceof ReportConflict) return json({ detail: error.message }, 409);
    // No error detail or payload leakage; failed durability is never success.
    return json({ detail: 'Feedback storage failure' }, 500);
  }
}
