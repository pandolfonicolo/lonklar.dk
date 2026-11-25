import { type Meta } from "./api";

export function taxText(text: string, meta: Meta | null, lang: string): string {
  if (!text.includes("{")) return text;
  if (!meta) return "";
  const numbers = new Intl.NumberFormat(lang, { maximumFractionDigits: 2 });
  return text.replace(/\{(\w+)\}/g, (token, key) => {
    if (key === "year") return String(meta.tax_year);
    const value = meta.constants[key as keyof Meta["constants"]];
    return typeof value === "number" ? numbers.format(value) : token;
  });
}
