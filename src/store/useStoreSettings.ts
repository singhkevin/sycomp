import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CountryCode = "US" | "CA" | "UK" | "IN" | "AU" | "CN" | "JP" | "PH" | "ZA" | "TW" | "AE";

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
  CN: { code: "CN", name: "China", flag: "🇨🇳", currency: "CNY", symbol: "¥", rate: 7.24 },
  JP: { code: "JP", name: "Japan", flag: "🇯🇵", currency: "JPY", symbol: "¥", rate: 156.40 },
  PH: { code: "PH", name: "Philippines", flag: "🇵🇭", currency: "PHP", symbol: "₱", rate: 57.85 },
  ZA: { code: "ZA", name: "South Africa", flag: "🇿🇦", currency: "ZAR", symbol: "R", rate: 18.22 },
  TW: { code: "TW", name: "Taiwan", flag: "🇹🇼", currency: "TWD", symbol: "NT$", rate: 32.35 },
  AE: { code: "AE", name: "UAE", flag: "🇦🇪", currency: "AED", symbol: "د.إ", rate: 3.67 },
};

interface StoreSettings {
  country: CountryCode;
  setCountry: (code: CountryCode) => void;
  formatPrice: (amount: number, countryCodeOverride?: CountryCode) => string;
}

export const useStoreSettings = create<StoreSettings>()(
  persist(
    (set, get) => ({
      country: "US",
      setCountry: (code: CountryCode) => set({ country: code }),
      formatPrice: (amount: number, countryCodeOverride?: CountryCode) => {
        const code = countryCodeOverride || get().country;
        const country = COUNTRIES[code] || COUNTRIES.US;
        
        const formatter = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: country.currency,
        });

        // Ensure there is a space between the currency symbol and the value
        const parts = formatter.formatToParts(amount);
        return parts.map(part => {
          if (part.type === 'currency') return `${part.value} `;
          return part.value;
        }).join('').trim();
      },
    }),
    {
      name: "store-settings",
    }
  )
);
