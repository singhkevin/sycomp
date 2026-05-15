import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit } from "lucide-react";
import { DeleteProductButton } from "@/components/admin/delete-product-button";

import { ProductFilters } from "@/components/admin/product-filters";
import { CsvImportButton } from "@/components/admin/csv-import-button";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; market?: string; category?: string }>;
}) {
  const { q, category } = await searchParams;
  const marketParam = (await searchParams).market;
  // If market is not in URL (initial load), default to "IN".
  // If market is empty string (selected "All Markets"), use "".
  const market = marketParam === undefined ? "IN" : marketParam;

  const where: any = {};

  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { slug: { contains: q, mode: "insensitive" } }
    ];
  }

  if (market) {
    where.markets = {
      some: {
        country: market
      }
    };
  }

  if (category) {
    where.categoryId = category;
  }

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { 
        category: true, 
        markets: {
          where: market ? { country: market } : undefined,
          include: { inventory: true }
        }
      },
      orderBy: { createdAt: "desc" }
    }),
    prisma.category.findMany()
  ]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Products Management</h1>
        <div className="flex items-center gap-3">
          <CsvImportButton />
          <Button asChild>
            <Link href="/admin/products/add">
              <Plus className="mr-2 h-4 w-4" /> Add Product
            </Link>
          </Button>
        </div>
      </div>

      <ProductFilters categories={categories} />

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-slate-50">All Products</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-slate-800">
            <table className="w-full text-sm text-left text-slate-300">
              <thead className="text-xs text-slate-200 uppercase bg-slate-800">
                <tr>
                  <th className="px-6 py-3 font-medium">Product</th>
                  <th className="px-6 py-3 font-medium">Category</th>
                  <th className="px-6 py-3 font-medium">Price</th>
                  <th className="px-6 py-3 font-medium">Inventory</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-300">
                      <p className="text-lg font-medium">No products found.</p>
                      <p className="text-sm text-slate-500 mt-1">Add your first product or import via CSV to get started.</p>
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-100 flex items-center gap-3">
                        <div className="h-10 w-10 bg-slate-800 rounded flex items-center justify-center relative overflow-hidden">
                          {product.imageUrl ? (
                            <Image src={product.imageUrl} alt={product.title} fill className="object-contain p-1" />
                          ) : (
                            "📦"
                          )}
                        </div>
                        {product.title}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className="text-blue-300 border-blue-500/30 bg-blue-500/5">
                          {product.category?.name || "Uncategorized"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-slate-100 font-semibold whitespace-nowrap">
                        {product.markets.length > 0 ? (
                          (() => {
                            const formatter = new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: {
                                "AU": "AUD", "CN": "CNY", "IN": "INR", "JP": "JPY", 
                                "PH": "PHP", "ZA": "ZAR", "TW": "TWD", "AE": "AED", 
                                "US": "USD", "CA": "CAD"
                              }[product.markets[0].country] || "USD"
                            });
                            const parts = formatter.formatToParts(product.markets[0].price);
                            return parts.map(part => {
                              if (part.type === 'currency') return `${part.value} `;
                              return part.value;
                            }).join('');
                          })()
                        ) : "N/A"}
                      </td>
                      <td className="px-6 py-4">
                        {product.markets[0]?.inventory?.quantity || 0}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white" asChild>
                            <Link href={`/admin/products/edit/${product.id}`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <DeleteProductButton productId={product.id} />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
