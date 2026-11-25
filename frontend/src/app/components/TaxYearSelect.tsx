import { useId } from "react";
import { useSearchParams } from "react-router";
import { type TaxYear } from "../utils/api";
import { useI18n } from "../utils/i18n";

export function taxYearQuery(year: TaxYear) {
  return year === 2026 ? "" : `?tax_year=${year}`;
}

export function useTaxYear() {
  const [params, setParams] = useSearchParams();
  const year: TaxYear = params.get("tax_year") === "2027" ? 2027 : 2026;
  const setYear = (next: TaxYear) => {
    const updated = new URLSearchParams(params);
    if (next === 2026) updated.delete("tax_year");
    else updated.set("tax_year", String(next));
    setParams(updated, { replace: true, preventScrollReset: true });
  };
  return [year, setYear] as const;
}

export function TaxYearSelect({ year, onChange, disabled }: {
  year: TaxYear;
  onChange: (year: TaxYear) => void;
  disabled?: boolean;
}) {
  const { t } = useI18n();
  const id = useId();
  return (
    <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
      <label htmlFor={id}>{t("input.taxYear")}</label>
      <select
        id={id}
        value={year}
        disabled={disabled}
        className="bg-background text-foreground border border-border rounded-md px-3 py-2"
        onChange={(event) => onChange(event.target.value === "2027" ? 2027 : 2026)}
      >
        <option value={2026}>2026</option>
        <option value={2027}>2027</option>
      </select>
    </div>
  );
}
