"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createProduct } from "@/lib/actions/product";
import { Category } from "@prisma/client";

export function AddProductForm({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [restrictions, setRestrictions] = useState<string[]>([]);

  const toggleRestriction = (code: string) => {
    setRestrictions(prev => 
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get("title") as string,
      slug: formData.get("slug") as string,
      price: parseFloat(formData.get("price") as string),
      description: formData.get("description") as string,
      imageUrl: formData.get("imageUrl") as string,
      categoryId: formData.get("categoryId") as string,
      countryRestrictions: restrictions,
    };

    const res = await createProduct(data);
    if (res.success) {
      router.push("/admin/products");
    } else {
      alert(res.error);
    }
    setLoading(false);
  };

  const countries = [
    { code: "US", name: "USA" },
    { code: "IN", name: "India" },
    { code: "CA", name: "Canada" },
    { code: "UK", name: "UK" },
    { code: "AU", name: "Australia" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title" className="text-slate-300">Product Title</Label>
        <Input id="title" name="title" required className="bg-slate-800 border-slate-700 text-slate-100" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug" className="text-slate-300">Slug (URL identifier)</Label>
        <Input id="slug" name="slug" required className="bg-slate-800 border-slate-700 text-slate-100" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price" className="text-slate-300">Base Price (USD)</Label>
          <Input id="price" name="price" type="number" step="0.01" required className="bg-slate-800 border-slate-700 text-slate-100" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="categoryId" className="text-slate-300">Category</Label>
          <select 
            id="categoryId" 
            name="categoryId" 
            required 
            className="w-full h-8 px-3 rounded-lg bg-slate-800 border-slate-700 text-slate-100 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          >
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="imageUrl" className="text-slate-300">Image URL</Label>
        <Input id="imageUrl" name="imageUrl" className="bg-slate-800 border-slate-700 text-slate-100" placeholder="https://..." />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-slate-300">Description</Label>
        <Textarea id="description" name="description" rows={4} className="bg-slate-800 border-slate-700 text-slate-100 resize-none" />
      </div>

      <div className="space-y-3">
        <Label className="text-slate-300">Country Availability (Select all that apply)</Label>
        <div className="flex flex-wrap gap-2">
          {countries.map(c => (
            <div 
              key={c.code}
              onClick={() => toggleRestriction(c.code)}
              className={`px-4 py-2 rounded-lg border cursor-pointer transition-all text-xs font-medium ${
                restrictions.includes(c.code)
                  ? "bg-blue-600 border-blue-500 text-white"
                  : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500"
              }`}
            >
              {c.name}
            </div>
          ))}
        </div>
        <p className="text-[10px] text-slate-500 italic">If none selected, product will not be visible in any country store.</p>
      </div>

      <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
        {loading ? "Creating..." : "Create Product"}
      </Button>
    </form>
  );
}
