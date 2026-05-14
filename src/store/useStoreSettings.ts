import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CountryCode = "US" | "CA" | "UK" | "IN" | "AU";

interface CountryInfo {
  code: CountryCode;
  name: string;
  flag: string;
  currency: string;
  symbol: string;
  rate: number; // rate against USD
}

export const COUNTRIES: Record<CountryCode, CountryInfo> = {
  US: { code: "US", name: "United States", flag: "🇺🇸", currency: "USD", symbol: "$", rate: 1 },
  CA: { code: "CA", name: "Canada", flag: "🇨🇦", currency: "CAD", symbol: "CA$", rate: 1.35 },
  UK: { code: "UK", name: "United Kingdom", flag: "🇬🇧", currency: "GBP", symbol: "£", rate: 0.79 },
  IN: { code: "IN", name: "India", flag: "🇮🇳", currency: "INR", symbol: "₹", rate: 83.35 },
  AU: { code: "AU", name: "Australia", flag: "🇦🇺", currency: "AUD", symbol: "A$", rate: 1.52 },
};

interface StoreSettings {
  country: CountryCode;
  setCountry: (code: CountryCode) => void;
  formatPrice: (usdAmount: number) => string;
}

export const useStoreSettings = create<StoreSettings>()(
  persist(
    (set, get) => ({
      country: "US",
      setCountry: (code: CountryCode) => set({ country: code }),
      formatPrice: (usdAmount: number) => {
        const country = COUNTRIES[get().country];
        const converted = usdAmount * country.rate;
        return new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: country.currency,
        }).format(converted);
      },
    }),
    {
      name: "store-settings",
    }
  )
);
