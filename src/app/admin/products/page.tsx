import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit } from "lucide-react";
import { DeleteProductButton } from "@/components/admin/delete-product-button";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    include: { category: true, inventory: true },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Products Management</h1>
        <Button asChild>
          <Link href="/admin/products/add">
            <Plus className="mr-2 h-4 w-4" /> Add Product
          </Link>
        </Button>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-slate-50">All Products</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-slate-800">
            <table className="w-full text-sm text-left text-slate-300">
              <thead className="text-xs text-slate-400 uppercase bg-slate-800/50">
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
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                      No products found. Add your first product.
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
                        <Badge variant="outline" className="text-slate-300 border-slate-700">
                          {product.category?.name || "Uncategorized"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">${product.price.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        {product.inventory?.quantity || 0}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white">
                            <Edit className="h-4 w-4" />
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
