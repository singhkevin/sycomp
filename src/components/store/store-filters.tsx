"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Category } from "@prisma/client";
import { useState, useEffect } from "react";

interface StoreFiltersProps {
  categories: Category[];
}

export function StoreFilters({ categories }: StoreFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") || "");

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page"); // Reset page on filter change
    router.push(`/store?${params.toString()}`);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (search !== (searchParams.get("q") || "")) {
        updateFilter("q", search);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const activeCategory = searchParams.get("category");
  const activeSort = searchParams.get("sort") || "newest";

  return (
    <div className="bg-slate-50/60 border border-slate-200/60 p-4 rounded-xl mb-8 shadow-sm space-y-4">
      {/* Search & Sort Panel */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Search products..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-slate-400 focus-visible:border-slate-300 shadow-sm"
          />
          {search && (
            <button 
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select 
            className="w-full md:w-auto px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-slate-900 text-sm outline-none focus:border-slate-300 focus:ring-1 focus:ring-slate-400 h-10 shadow-sm transition-all cursor-pointer"
            value={activeSort}
            onChange={(e) => updateFilter("sort", e.target.value)}
          >
            <option value="newest">Newest First</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="name">Name: A-Z</option>
          </select>
        </div>
      </div>

      {/* Categories Row */}
      <div className="flex flex-wrap gap-2 items-center border-t border-slate-200/60 pt-3">
        <div className="flex items-center gap-2 mr-2 text-sm font-semibold text-slate-700">
          <SlidersHorizontal className="h-4 w-4 text-slate-400" />
          Categories:
        </div>
        <button
          onClick={() => updateFilter("category", "")}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all shadow-xs ${
            !activeCategory 
              ? "bg-[#1f4475] text-white shadow-sm" 
              : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300"
          }`}
        >
          All
        </button>
        {categories.map(c => (
          <button
            key={c.id}
            onClick={() => updateFilter("category", c.slug)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all shadow-xs ${
              activeCategory === c.slug
                ? "bg-[#1f4475] text-white shadow-sm" 
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300"
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>
    </div>
  );
}
