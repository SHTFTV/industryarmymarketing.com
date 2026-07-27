import { useEffect, useState, useCallback } from "react";
import { DEFAULT_PPP_CODE, PPP_COUNTRIES, getPppFactor, pppAdjust } from "@/data/pppFactors";

const STORAGE_KEY = "iam.ppp.country";

export function usePpp() {
  const [country, setCountryState] = useState<string>(DEFAULT_PPP_CODE);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored && PPP_COUNTRIES.some((c) => c.code === stored)) {
        setCountryState(stored);
        return;
      }
      // Best-effort auto-detect via browser locale (region subtag).
      const region =
        (Intl.DateTimeFormat().resolvedOptions() as { locale?: string }).locale?.split("-")[1] ??
        navigator.language?.split("-")[1];
      if (region) {
        const upper = region.toUpperCase();
        if (PPP_COUNTRIES.some((c) => c.code === upper)) setCountryState(upper);
      }
    } catch {
      /* no-op */
    }
  }, []);

  const setCountry = useCallback((code: string) => {
    setCountryState(code);
    try {
      window.localStorage.setItem(STORAGE_KEY, code);
    } catch {
      /* no-op */
    }
  }, []);

  const factor = getPppFactor(country);
  const adjust = useCallback((usd: number) => pppAdjust(usd, country), [country]);

  return { country, setCountry, factor, adjust };
}