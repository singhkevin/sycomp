import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductForm } from "@/components/admin/product-form";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default async function AddProductPage() {
  const categories = await prisma.category.findMany();

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/admin/products">
          <Button variant="ghost" size="sm" className="text-slate-500 hover:text-slate-900 hover:bg-slate-100">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Products
          </Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Add New Product</h1>
      </div>
 
      <Card className="bg-[#1f4475] border-white/15 shadow-lg shadow-blue-950/10">
        <CardHeader>
          <CardTitle className="text-white font-bold">Product Details</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductForm categories={categories} />
        </CardContent>
      </Card>
    </div>
  );
}
