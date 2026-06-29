export type CurrencyCode = "DKK" | "EUR" | "NZD" | "SEK" | "NOK";

export type CurrencyConfig = {
  code: CurrencyCode;
  label: string;
  symbol: string;
  rateKey?: string;
};

export const CURRENCIES: CurrencyConfig[] = [
  { code: "DKK", label: "Danish Krone", symbol: "kr" },
  { code: "EUR", label: "Euro", symbol: "€", rateKey: "EUR" },
  { code: "NZD", label: "New Zealand Dollar", symbol: "NZ$", rateKey: "NZD" },
  { code: "SEK", label: "Swedish Krona", symbol: "SEK", rateKey: "SEK" },
  { code: "NOK", label: "Norwegian Krone", symbol: "NOK", rateKey: "NOK" },
];

export const DEFAULT_DKK_RATES: Record<Exclude<CurrencyCode, "DKK">, number> = {
  EUR: 7.47,
  NZD: 3.70,
  SEK: 0.67,
  NOK: 0.66,
};

export const CURRENCY_STORAGE_KEY = "lonklar-display-currency";
export const CURRENCY_CHANGE_EVENT = "lonklar-currency-change";

export function isCurrencyCode(code: string | null): code is CurrencyCode {
  return !!code && CURRENCIES.some((currency) => currency.code === code);
}

export function getStoredCurrency(): CurrencyCode {
  if (typeof window === "undefined") return "DKK";
  const saved = window.localStorage.getItem(CURRENCY_STORAGE_KEY);
  return isCurrencyCode(saved) ? saved : "DKK";
}

export function setStoredCurrency(code: CurrencyCode) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CURRENCY_STORAGE_KEY, code);
  window.dispatchEvent(new CustomEvent(CURRENCY_CHANGE_EVENT, { detail: code }));
}

export function getCurrencyConfig(code: CurrencyCode): CurrencyConfig {
  return CURRENCIES.find((currency) => currency.code === code) ?? CURRENCIES[0];
}

export function getDkkPerCurrency(
  code: CurrencyCode,
  liveRates?: Record<string, number>,
): number {
  if (code === "DKK") return 1;
  return liveRates?.[code] ?? DEFAULT_DKK_RATES[code];
}

export function convertFromDkk(amountDkk: number, dkkPerCurrency: number): number {
  return amountDkk / dkkPerCurrency;
}

export function formatCurrency(
  amountDkk: number,
  code: CurrencyCode,
  dkkPerCurrency: number,
  decimals = 0,
): string {
  if (code === "DKK") {
    return `${new Intl.NumberFormat("da-DK", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(amountDkk)} kr`;
  }

  const config = getCurrencyConfig(code);
  const converted = convertFromDkk(amountDkk, dkkPerCurrency);
  const formatted = new Intl.NumberFormat("da-DK", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(converted);

  return `${config.symbol}${formatted}`;
}

export function formatSignedCurrency(
  amountDkk: number,
  code: CurrencyCode,
  dkkPerCurrency: number,
  decimals = 0,
): string {
  const prefix = amountDkk > 0 ? "+" : amountDkk < 0 ? "-" : "";
  return `${prefix}${formatCurrency(Math.abs(amountDkk), code, dkkPerCurrency, decimals)}`;
}

export function formatCurrencyAxis(
  amountDkk: number,
  code: CurrencyCode,
  dkkPerCurrency: number,
): string {
  const value = code === "DKK" ? amountDkk : convertFromDkk(amountDkk, dkkPerCurrency);
  const abs = Math.abs(value);
  const prefix = code === "DKK" ? "" : getCurrencyConfig(code).symbol;

  if (abs >= 1_000_000) return `${prefix}${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (abs >= 1_000) return `${prefix}${(value / 1_000).toFixed(0)}k`;
  return `${prefix}${Math.round(value)}`;
}
