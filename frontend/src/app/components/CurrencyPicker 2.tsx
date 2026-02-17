import React, { useEffect, useRef, useState } from "react";
import { ChevronDown, X } from "lucide-react";
import { fetchExchangeRates, type ExchangeRates } from "../utils/api";
import { useI18n } from "../utils/i18n";

interface CurrencyPickerProps {
  /** null = DKK only (no conversion) */
  selected: string | null;
  onSelect: (code: string | null, symbol: string) => void;
  /** Pass the resolved rate back to parent */
  onRateChange?: (rate: number) => void;
}

/**
 * Compact currency selector.
 * Shows "DKK" by default; click to open dropdown of live-rate currencies.
 * Selecting one shows amounts in that currency alongside DKK.
 * Selecting the same one again (or pressing ✕) reverts to DKK-only.
 */
export function CurrencyPicker({ selected, onSelect, onRateChange }: CurrencyPickerProps) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<ExchangeRates | null>(null);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Fetch rates when dropdown opens
  useEffect(() => {
    if (!open || data) return;
    setLoading(true);
    fetchExchangeRates()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [open, data]);

  // Propagate rate when selection or data changes
  useEffect(() => {
    if (selected && data?.rates[selected]) {
      onRateChange?.(data.rates[selected]);
    }
  }, [selected, data]);

  // Periodically refresh rates (every 5 min in background)
  useEffect(() => {
    if (!selected) return;
    const interval = setInterval(() => {
      fetchExchangeRates().then((d) => {
        setData(d);
        if (selected && d.rates[selected]) {
          onRateChange?.(d.rates[selected]);
        }
      }).catch(console.error);
    }, 300_000);
    return () => clearInterval(interval);
  }, [selected]);

  const symbol = selected && data?.currencies[selected] ? data.currencies[selected] : null;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-[var(--radius-md)] border border-border bg-card hover:bg-[var(--nordic-accent-light)] transition-colors cursor-pointer"
      >
        {selected ? (
          <>
            <span className="font-medium">{selected}</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(null, "");
                setOpen(false);
              }}
              className="ml-0.5 p-0.5 rounded hover:bg-muted transition-colors"
              title={t("currency.clear")}
            >
              <X className="w-3 h-3" />
            </button>
          </>
        ) : (
          <>
            <span className="text-muted-foreground">DKK</span>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
          </>
        )}
      </button>

      {open && (
        <div className="absolute top-full mt-1 right-0 z-50 w-56 max-h-72 overflow-y-auto bg-card border border-border rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] py-1">
          {loading ? (
            <div className="px-4 py-3 text-xs text-muted-foreground text-center">{t("currency.loading")}</div>
          ) : data ? (
            <>
              <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                {t("currency.convert_to")}
              </div>
              {Object.entries(data.currencies).map(([code, sym]) => {
                const rate = data.rates[code];
                const isActive = selected === code;
                return (
                  <button
                    key={code}
                    type="button"
                    onClick={() => {
                      onSelect(isActive ? null : code, sym);
                      setOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-[var(--nordic-accent-light)] transition-colors cursor-pointer ${
                      isActive ? "bg-[var(--nordic-accent-light)] font-medium" : ""
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-5 text-center text-muted-foreground">{sym}</span>
                      <span>{code}</span>
                    </span>
                    {rate && (
                      <span className="text-xs text-muted-foreground tabular-nums">
                        1 {code} = {rate > 10 ? rate.toFixed(2) : rate > 1 ? rate.toFixed(3) : rate.toFixed(4)} DKK
                      </span>
                    )}
                  </button>
                );
              })}
              <div className="border-t border-border mt-1 px-3 py-2">
                <p className="text-[10px] text-muted-foreground text-center">
                  {t("currency.source")}
                </p>
              </div>
            </>
          ) : (
            <div className="px-4 py-3 text-xs text-muted-foreground text-center">{t("currency.error")}</div>
          )}
        </div>
      )}
    </div>
  );
}
