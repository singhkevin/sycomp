"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Category } from "@prisma/client";

const COUNTRIES = [
  { code: "AU", name: "Australia" },
  { code: "CN", name: "China" },
  { code: "IN", name: "India" },
  { code: "JP", name: "Japan" },
  { code: "PH", name: "Philippines" },
  { code: "ZA", name: "South Africa" },
  { code: "TW", name: "Taiwan" },
  { code: "AE", name: "UAE" },
  { code: "US", name: "USA" },
  { code: "CA", name: "Canada" },
];

export function ProductFilters({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/admin/products?${params.toString()}`);
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input 
          placeholder="Search products..." 
          defaultValue={searchParams.get("q") || ""}
          onChange={(e) => {
            // Debounce would be better, but for simplicity:
            const timeoutId = setTimeout(() => updateFilter("q", e.target.value), 500);
            return () => clearTimeout(timeoutId);
          }}
          className="pl-10 bg-slate-800 border-slate-700 text-slate-100"
        />
      </div>

      <select 
        className="px-4 py-2 rounded-lg bg-slate-800 border-slate-700 text-slate-100 text-sm outline-none focus:ring-2 focus:ring-blue-500 min-w-[150px]"
        value={searchParams.get("market") || "IN"}
        onChange={(e) => updateFilter("market", e.target.value)}
      >
        <option value="">All Markets</option>
        {COUNTRIES.map(c => (
          <option key={c.code} value={c.code}>{c.name}</option>
        ))}
      </select>

      <select 
        className="px-4 py-2 rounded-lg bg-slate-800 border-slate-700 text-slate-100 text-sm outline-none focus:ring-2 focus:ring-blue-500 min-w-[150px]"
        value={searchParams.get("category") || ""}
        onChange={(e) => updateFilter("category", e.target.value)}
      >
        <option value="">All Categories</option>
        {categories.map(c => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>
    </div>
  );
}
