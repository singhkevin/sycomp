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
    <div className="flex flex-col md:flex-row items-center gap-3 bg-slate-50/60 border border-slate-200/60 p-2.5 rounded-xl mb-6 shadow-sm">
      <div className="relative flex-1 w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input 
          placeholder="Search products..." 
          defaultValue={searchParams.get("q") || ""}
          onChange={(e) => {
            const timeoutId = setTimeout(() => updateFilter("q", e.target.value), 500);
            return () => clearTimeout(timeoutId);
          }}
          className="pl-10 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-slate-400 focus-visible:border-slate-300 shadow-sm"
        />
      </div>

      <div className="flex w-full md:w-auto items-center gap-2">
        <select 
          className="w-full md:w-auto px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-slate-900 text-sm outline-none focus:border-slate-300 focus:ring-1 focus:ring-slate-400 min-w-[160px] shadow-sm transition-all cursor-pointer"
          value={searchParams.get("market") || "IN"}
          onChange={(e) => updateFilter("market", e.target.value)}
        >
          <option value="">All Markets</option>
          {COUNTRIES.map(c => (
            <option key={c.code} value={c.code}>{c.name}</option>
          ))}
        </select>

        <select 
          className="w-full md:w-auto px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-slate-900 text-sm outline-none focus:border-slate-300 focus:ring-1 focus:ring-slate-400 min-w-[160px] shadow-sm transition-all cursor-pointer"
          value={searchParams.get("category") || ""}
          onChange={(e) => updateFilter("category", e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
