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
    <div className="space-y-6 mb-8">
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Search products..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-white border-slate-200 focus:ring-blue-500"
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
            className="flex-1 md:flex-none px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500 h-10"
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

      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex items-center gap-2 mr-2 text-sm font-medium text-slate-500">
          <SlidersHorizontal className="h-4 w-4" />
          Categories:
        </div>
        <button
          onClick={() => updateFilter("category", "")}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
            !activeCategory 
              ? "bg-blue-600 text-white" 
              : "bg-white border border-slate-200 text-slate-600 hover:border-blue-300"
          }`}
        >
          All
        </button>
        {categories.map(c => (
          <button
            key={c.id}
            onClick={() => updateFilter("category", c.slug)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              activeCategory === c.slug
                ? "bg-blue-600 text-white" 
                : "bg-white border border-slate-200 text-slate-600 hover:border-blue-300"
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>
    </div>
  );
}
