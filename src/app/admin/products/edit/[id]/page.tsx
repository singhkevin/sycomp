import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductForm } from "@/components/admin/product-form";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id: id }
    }),
    prisma.category.findMany()
  ]);

  if (!product) {
    notFound();
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/admin/products">
          <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Products
          </Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Edit Product</h1>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-slate-50">Modify Product Details</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductForm categories={categories} initialData={product} />
        </CardContent>
      </Card>
    </div>
  );
}
