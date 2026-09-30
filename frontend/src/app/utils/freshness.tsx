import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { fetchMeta } from "./api";

interface Freshness {
  taxYear: number;
  rulesVerifiedOn: string;
  siteUpdatedAt: string | null;
}

const FreshnessContext = createContext<Freshness | null>(null);

export function FreshnessProvider({ children }: { children: ReactNode }) {
  const [freshness, setFreshness] = useState<Freshness | null>(null);

  useEffect(() => {
    let active = true;
    fetchMeta().then((meta) => {
      if (active && meta.data_freshness) {
        setFreshness({
          taxYear: meta.tax_year,
          rulesVerifiedOn: meta.data_freshness.rules_verified_on,
          siteUpdatedAt: meta.data_freshness.site_updated_at,
        });
      }
    }).catch(() => {});
    return () => { active = false; };
  }, []);

  return <FreshnessContext.Provider value={freshness}>{children}</FreshnessContext.Provider>;
}

export function useFreshness() {
  return useContext(FreshnessContext);
}
