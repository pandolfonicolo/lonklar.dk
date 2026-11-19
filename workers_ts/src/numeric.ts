/** Python-compatible ties-to-even decimal rounding of the original binary64.
 * Multiplying by 10**digits first is NOT equivalent (e.g. round(2.675, 2)).
 * Decode the exact binary rational, round with BigInt, then parse a decimal.
 * Supported digits cover every current API use; extremes follow Python's
 * finite binary64 behavior without allocating unbounded powers.
 */
export function pyRound(value: number, digits = 0): number {
  if (!Number.isFinite(value)) return value;
  if (!Number.isInteger(digits)) throw new TypeError('digits must be an integer');
  if (digits > 323) return value;
  if (digits < -308) return value < 0 ? -0 : 0;
  if (value === 0) return value;
  const view = new DataView(new ArrayBuffer(8));
  view.setFloat64(0, Math.abs(value), false);
  const bits = view.getBigUint64(0, false);
  const exponent = Number((bits >> 52n) & 0x7ffn);
  const fraction = bits & ((1n << 52n) - 1n);
  let numerator = exponent === 0 ? fraction : fraction | (1n << 52n);
  let denominator = 1n;
  const binaryPower = exponent === 0 ? -1074 : exponent - 1023 - 52;
  if (binaryPower >= 0) numerator <<= BigInt(binaryPower);
  else denominator <<= BigInt(-binaryPower);
  if (digits >= 0) numerator *= 10n ** BigInt(digits);
  else denominator *= 10n ** BigInt(-digits);
  let integer = numerator / denominator;
  const remainder = numerator % denominator;
  if (remainder * 2n > denominator || (remainder * 2n === denominator && integer % 2n !== 0n)) integer++;
  const rounded = Number(`${integer}e${-digits}`);
  return value < 0 ? -rounded : rounded;
}

/** Compensated sum for projection totals (CPython 3.12+ float sum).
 * Core arithmetic intentionally remains binary64, not an unrelated Decimal model.
 */
export function preciseSum(values: Iterable<number>): number {
  let hi = 0, lo = 0;
  for (const x of values) {
    const t = hi + x;
    lo += Math.abs(hi) >= Math.abs(x) ? (hi - t) + x : (x - t) + hi;
    hi = t;
  }
  return lo && Number.isFinite(lo) ? hi + lo : hi;
}
