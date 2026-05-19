import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit, Trash2 } from "lucide-react";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Add Category
        </Button>
      </div>

      <Card className="bg-[#1f4475] border-white/15 shadow-lg shadow-blue-950/10">
        <CardHeader>
          <CardTitle className="text-white font-bold">All Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-white/10 overflow-hidden">
            <table className="w-full text-sm text-left text-blue-100">
              <thead className="text-xs text-blue-100/80 uppercase bg-white/5">
                <tr>
                  <th className="px-6 py-3 font-semibold">Name</th>
                  <th className="px-6 py-3 font-semibold">Slug</th>
                  <th className="px-6 py-3 font-semibold">Products Count</th>
                  <th className="px-6 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-blue-200/60">
                      No categories found. Create one.
                    </td>
                  </tr>
                ) : (
                  categories.map((category) => (
                    <tr key={category.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-medium text-white">{category.name}</td>
                      <td className="px-6 py-4 font-mono text-xs text-blue-200/70">{category.slug}</td>
                      <td className="px-6 py-4">
                        <div className="inline-flex items-center justify-center px-2.5 py-1 text-xs font-bold leading-none text-white bg-white/10 rounded-full">
                          {category._count.products}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-200 hover:text-white hover:bg-white/10">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-300 hover:text-red-200 hover:bg-red-950/40">
                            <Trash2 className="h-4 w-4" />
                          </Button>
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
