import { pyRound } from './numeric.ts';

export function hoursSamples(maxHours: number, step: number, atpAuto: boolean): number[] {
  if (!Number.isInteger(step) || step < 1) throw new RangeError('step must be positive');
  const values = new Set<number>([maxHours]);
  for (let h = 0; h <= maxHours; h += step) values.add(h);
  if (atpAuto) for (const h of [39, 78, 117]) {
    if (h <= maxHours) { values.add(h - 0.000001); values.add(h); }
  }
  return [...values].sort((a, b) => a - b);
}

/** Same 40 bisections and rounding as the Python reference, including downward
 * crossings at ATP discontinuities. Cache lives only for this one request. */
export function sampleBoundaries<T extends Record<string, any>>(
  input: number[], evaluate: (value: number) => T, metric: string,
  thresholds: Array<[number, string]>,
): Array<[number, T, string | null]> {
  const cache = new Map<number, T>();
  const cached = (x: number): T => {
    if (!cache.has(x)) cache.set(x, evaluate(x));
    return cache.get(x)!;
  };
  const values = [...new Set(input)].sort((a, b) => a - b);
  const boundaries = new Map<number, string>();
  for (let i = 0; i + 1 < values.length; i++) {
    const left = values[i], right = values[i + 1];
    const a = cached(left)[metric], b = cached(right)[metric];
    for (const [threshold, label] of thresholds) {
      if ((a <= threshold && threshold <= b && a < b) || (b < threshold && threshold <= a)) {
        let lo = left, hi = right;
        const increasing = b > a;
        for (let k = 0; k < 40; k++) {
          const mid = (lo + hi) / 2;
          if ((cached(mid)[metric] < threshold) === increasing) lo = mid;
          else hi = mid;
        }
        boundaries.set(pyRound((lo + hi) / 2, 8), label);
      }
    }
  }
  return [...new Set([...values, ...boundaries.keys()])].sort((a, b) => a - b)
    .map(x => [x, cached(x), boundaries.get(x) ?? null]);
}
