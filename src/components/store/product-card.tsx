"use client";

import Image from "next/image";
import Link from "next/link";
import { Product } from "@prisma/client";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCart } from "@/store/useCart";
import { useStoreSettings } from "@/store/useStoreSettings";
import { stripHtml } from "@/lib/strip-html";

import { useEffect, useState } from "react";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: { product: any }) {
  const [mounted, setMounted] = useState(false);
  const addItem = useCart((state) => state.addItem);
  const { formatPrice } = useStoreSettings();

  const currentMarket = product.markets?.[0];
  const price = currentMarket?.price || 0;
  const countryCode = currentMarket?.country || "US";

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      marketId: currentMarket.id,
      title: product.title,
      price: price,
      quantity: 1,
      imageUrl: product.imageUrl || undefined,
      countryCode: countryCode,
    });
  };

  return (
    <Card className="overflow-hidden flex flex-col hover:shadow-lg transition-shadow border-slate-200">
      <Link href={`/store/product/${product.slug}`} className="flex-1">
        <div className="relative aspect-square bg-slate-100 flex items-center justify-center p-6">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.title}
              fill
              className="object-contain mix-blend-multiply"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="text-slate-400 text-4xl">📦</div>
          )}
          
          {/* Country Badge */}
          <div className="absolute top-2 right-2 flex gap-1">
            <span className="bg-white/90 backdrop-blur-sm text-[10px] font-bold px-1.5 py-0.5 rounded border border-slate-200 shadow-sm text-slate-700">
              {countryCode}
            </span>
          </div>
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg line-clamp-1">{product.title}</h3>
          <p className="text-sm text-slate-500 mt-1 line-clamp-2">
            {stripHtml(product.description) || "No description available."}
          </p>
          <div className="mt-3 text-xl font-bold text-slate-900">
            {mounted 
              ? formatPrice(price, countryCode as any)
              : `$${price.toFixed(2)}`
            }
          </div>
        </CardContent>
      </Link>
      <CardFooter className="p-4 pt-0">
        <Button onClick={handleAddToCart} className="w-full" variant="outline">
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
}
