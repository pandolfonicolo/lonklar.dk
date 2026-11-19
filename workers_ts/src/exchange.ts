import { pyRound } from './numeric.ts';

export const SUPPORTED_CURRENCIES: Record<string, string> = { EUR: '€', NZD: 'NZ$', USD: '$', GBP: '£', SEK: 'kr', NOK: 'kr', PLN: 'zł', CHF: 'Fr', JPY: '¥', CAD: 'C$', AUD: 'A$', INR: '₹', BRL: 'R$', TRY: '₺' };
export const FALLBACK_RATES: Record<string, number> = { EUR: 7.47, NZD: 3.70, USD: 6.54, GBP: 8.67, SEK: .67, NOK: .66, PLN: 1.74, CHF: 8.10, JPY: .040, CAD: 4.61, AUD: 4.51, INR: .069, BRL: 1.26, TRY: .14 };

/** Cache is per isolate, as Python's cache is per process. A shared cache is a
 * later operational improvement, not a promise of one external fetch per hour. */
export function createExchangeHandler(fetcher: typeof fetch = fetch, now = () => Date.now() / 1000) {
  let cache: { rates: Record<string, number>; timestamp: number; date: string | null; source: string } = { rates: {}, timestamp: 0, date: null, source: 'fallback' };
  let pending: Promise<Record<string, number>> | null = null;
  async function rates(): Promise<Record<string, number>> {
    const timestamp = now();
    if (Object.keys(cache.rates).length && timestamp - cache.timestamp < 3600) return cache.rates;
    try {
      const codes = Object.keys(SUPPORTED_CURRENCIES).join(',');
      const response = await fetcher(`https://api.frankfurter.app/latest?from=DKK&to=${codes}`, { signal: AbortSignal.timeout(10_000), redirect: 'follow' });
      if (!response.ok) throw new Error('Exchange upstream failure');
      const data = await response.json() as { rates?: Record<string, number>; date?: string };
      const result: Record<string, number> = {};
      for (const [code, rate] of Object.entries(data.rates ?? {})) {
        if (typeof rate === 'number' && Number.isFinite(rate) && rate > 0) result[code] = pyRound(1 / rate, 6);
      }
      cache = { rates: result, timestamp, date: data.date ?? null, source: 'frankfurter.app' };
      return result;
    } catch {
      if (Object.keys(cache.rates).length) return cache.rates;
      cache.timestamp = timestamp;
      cache.date = '2026-06-29';
      cache.source = 'fallback';
      return FALLBACK_RATES;
    }
  }
  return async (_request: Request, _env: unknown = {}): Promise<Response> => {
    if (!pending) pending = rates().finally(() => { pending = null; });
    const result = await pending;
    return Response.json({ base: 'DKK', rates: result, currencies: SUPPORTED_CURRENCIES, source: cache.source, date: cache.date, cached_until: Math.trunc(cache.timestamp + 3600) });
  };
}
export const handleExchange = createExchangeHandler();
