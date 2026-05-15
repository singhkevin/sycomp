import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductAddToCart } from "./add-to-cart";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  const product = await prisma.product.findUnique({
    where: { slug }
  });

  if (!product) {
    notFound();
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mb-6">
        <Link href="/store" className="text-sm text-slate-500 hover:text-blue-600">
          &larr; Back to Catalogue
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-white p-8 rounded-xl shadow-sm border border-slate-100">
        <div className="relative aspect-square bg-slate-50 rounded-lg flex items-center justify-center p-8">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.title}
              fill
              className="object-contain mix-blend-multiply"
              priority
            />
          ) : (
            <div className="text-slate-300 text-6xl">📦</div>
          )}
        </div>

        <div className="flex flex-col">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">{product.title}</h1>
          <div className="mt-4 text-3xl font-medium text-slate-900">
            ${product.price.toFixed(2)}
          </div>
          
          <div className="mt-8 prose prose-slate">
            <h3 className="text-lg font-semibold border-b pb-2 mb-4">Product Details</h3>
            <p className="text-slate-600 whitespace-pre-wrap">
              {product.description || "No description provided."}
            </p>
          </div>

          <div className="mt-auto pt-8">
            <ProductAddToCart product={product} />
          </div>
        </div>
      </div>
    </div>
  );
}
