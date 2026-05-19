"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createProduct, updateProduct } from "@/lib/actions/product";
import { Category, Product, ProductMarket, Inventory } from "@prisma/client";
import { Globe, DollarSign, Package } from "lucide-react";

type ExtendedProduct = Product & {
  markets: (ProductMarket & { inventory: Inventory | null })[];
};

interface ProductFormProps {
  categories: Category[];
  initialData?: ExtendedProduct;
}

const COUNTRIES = [
  { code: "AU", name: "Australia", currency: "A$" },
  { code: "CN", name: "China", currency: "¥" },
  { code: "IN", name: "India", currency: "₹" },
  { code: "JP", name: "Japan", currency: "¥" },
  { code: "PH", name: "Philippines", currency: "₱" },
  { code: "ZA", name: "South Africa", currency: "R" },
  { code: "TW", name: "Taiwan", currency: "NT$" },
  { code: "AE", name: "UAE", currency: "AED" },
  { code: "US", name: "USA", currency: "$" },
  { code: "CA", name: "Canada", currency: "C$" },
];

export function ProductForm({ categories, initialData }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [marketSettings, setMarketSettings] = useState<Record<string, { price: number; quantity: number; enabled: boolean }>>(() => {
    const initial: Record<string, { price: number; quantity: number; enabled: boolean }> = {};
    COUNTRIES.forEach(c => {
      const existing = initialData?.markets.find(m => m.country === c.code);
      initial[c.code] = {
        price: existing?.price || 0,
        quantity: existing?.inventory?.quantity || 0,
        enabled: !!existing
      };
    });
    return initial;
  });

  const toggleMarket = (code: string) => {
    setMarketSettings(prev => ({
      ...prev,
      [code]: { ...prev[code], enabled: !prev[code].enabled }
    }));
  };

  const updateMarketValue = (code: string, key: "price" | "quantity", value: number) => {
    setMarketSettings(prev => ({
      ...prev,
      [code]: { ...prev[code], [key]: value }
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const marketsToSave = Object.entries(marketSettings)
      .filter(([_, s]) => s.enabled)
      .map(([code, s]) => ({
        country: code,
        price: s.price,
        quantity: s.quantity,
        sku: `${formData.get("slug")}-${code.toLowerCase()}`
      }));

    if (marketsToSave.length === 0) {
      alert("Please select at least one market and provide a price.");
      setLoading(false);
      return;
    }

    const data = {
      title: formData.get("title") as string,
      slug: formData.get("slug") as string,
      description: formData.get("description") as string,
      imageUrl: formData.get("imageUrl") as string,
      categoryId: formData.get("categoryId") as string,
      markets: marketsToSave,
    };

    const res = initialData 
      ? await updateProduct(initialData.id, data)
      : await createProduct(data);

    if (res.success) {
      router.push("/admin/products");
      router.refresh();
    } else {
      alert(res.error);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Global Info */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white border-b border-white/15 pb-2">Global Information</h3>
        
        <div className="space-y-2">
          <Label htmlFor="title" className="text-blue-100 font-medium">Product Title</Label>
          <Input 
            id="title" 
            name="title" 
            defaultValue={initialData?.title} 
            required 
            className="bg-white/10 border-white/20 text-white placeholder:text-blue-200/50 focus-visible:ring-1 focus-visible:ring-white focus-visible:border-white" 
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="slug" className="text-blue-100 font-medium">Base Slug</Label>
            <Input 
              id="slug" 
              name="slug" 
              defaultValue={initialData?.slug} 
              required 
              className="bg-white/10 border-white/20 text-white placeholder:text-blue-200/50 focus-visible:ring-1 focus-visible:ring-white focus-visible:border-white" 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="categoryId" className="text-blue-100 font-medium">Category</Label>
            <select 
              id="categoryId" 
              name="categoryId" 
              defaultValue={initialData?.categoryId || ""}
              required 
              className="w-full h-10 px-3 rounded-lg bg-white/10 border border-white/20 text-white text-sm outline-none focus:border-white focus:bg-white/15 cursor-pointer"
            >
              <option value="" disabled className="text-slate-800">Select a category</option>
              {categories.map(c => (
                <option key={c.id} value={c.id} className="text-slate-800">{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="imageUrl" className="text-blue-100 font-medium">Global Image URL</Label>
          <Input 
            id="imageUrl" 
            name="imageUrl" 
            defaultValue={initialData?.imageUrl || ""} 
            className="bg-white/10 border-white/20 text-white placeholder:text-blue-200/50 focus-visible:ring-1 focus-visible:ring-white focus-visible:border-white" 
            placeholder="https://..." 
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="text-blue-100 font-medium">Description</Label>
          <Textarea 
            id="description" 
            name="description" 
            defaultValue={initialData?.description || ""} 
            rows={4} 
            className="bg-white/10 border-white/20 text-white placeholder:text-blue-200/50 focus-visible:ring-1 focus-visible:ring-white focus-visible:border-white resize-none" 
          />
        </div>
      </div>

      {/* Market Variations */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white border-b border-white/15 pb-2">Regional Pricing & Inventory</h3>
        <p className="text-xs text-blue-200/70 italic">Select markets to enable them and provide local pricing/stock.</p>
        
        <div className="grid gap-4">
          {COUNTRIES.map(c => {
            const settings = marketSettings[c.code];
            return (
              <div 
                key={c.code}
                className={`p-4 rounded-xl border transition-all ${
                  settings.enabled 
                    ? "bg-white/10 border-white/25 shadow-sm" 
                    : "bg-white/5 border-white/10 opacity-60"
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div 
                      onClick={() => toggleMarket(c.code)}
                      className={`w-10 h-6 rounded-full relative cursor-pointer transition-colors ${
                        settings.enabled ? "bg-emerald-500" : "bg-white/20"
                      }`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                        settings.enabled ? "left-5" : "left-1"
                      }`} />
                    </div>
                    <span className="font-semibold text-white flex items-center gap-2">
                      <Globe className="h-4 w-4 text-blue-200" />
                      {c.name} ({c.code})
                    </span>
                  </div>
                  {settings.enabled && (
                    <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">Active</Badge>
                  )}
                </div>

                {settings.enabled && (
                  <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase text-blue-200 font-semibold tracking-wider">Local Price</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-blue-200">
                          {c.currency}
                        </span>
                        <Input 
                          type="number" 
                          step="0.01"
                          value={settings.price}
                          onChange={(e) => updateMarketValue(c.code, "price", parseFloat(e.target.value))}
                          className="pl-12 bg-white/10 border-white/20 text-white h-9 focus-visible:ring-1 focus-visible:ring-white focus-visible:border-white"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase text-blue-200 font-semibold tracking-wider">Inventory Stock</Label>
                      <div className="relative">
                        <Package className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-blue-200" />
                        <Input 
                          type="number" 
                          value={settings.quantity}
                          onChange={(e) => updateMarketValue(c.code, "quantity", parseInt(e.target.value))}
                          className="pl-8 bg-white/10 border-white/20 text-white h-9 focus-visible:ring-1 focus-visible:ring-white focus-visible:border-white"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <Button type="submit" disabled={loading} className="w-full bg-white hover:bg-blue-50 text-[#1f4475] py-6 text-lg font-bold transition-all shadow-md">
        {loading ? "Saving Changes..." : initialData ? "Update Unified Product" : "Create Unified Product"}
      </Button>
    </form>
  );
}

function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${className}`}>
      {children}
    </span>
  );
}
