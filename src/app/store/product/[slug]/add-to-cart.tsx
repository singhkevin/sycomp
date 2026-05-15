"use client";

import { useState } from "react";
import { Product } from "@prisma/client";
import { useCart } from "@/store/useCart";
import { Button } from "@/components/ui/button";

export function ProductAddToCart({ product, market }: { product: any, market: any }) {
  const [quantity, setQuantity] = useState(1);
  const addItem = useCart((state) => state.addItem);

  const handleAdd = () => {
    addItem({
      id: product.id,
      marketId: market.id,
      sku: market.sku,
      title: product.title,
      price: market.price,
      quantity,
      imageUrl: product.imageUrl || undefined,
      countryCode: market.country,
    });
  };

  return (
    <div className="flex gap-4 items-center">
      <div className="flex items-center border rounded-md h-10">
        <button 
          onClick={() => setQuantity(q => Math.max(1, q - 1))}
          className="px-3 hover:bg-slate-100 h-full text-slate-500 font-medium"
        >
          -
        </button>
        <div className="px-4 font-medium min-w-12 text-center">{quantity}</div>
        <button 
          onClick={() => setQuantity(q => q + 1)}
          className="px-3 hover:bg-slate-100 h-full text-slate-500 font-medium"
        >
          +
        </button>
      </div>
      <Button onClick={handleAdd} size="lg" className="w-full sm:w-auto px-8">
        Add to Cart
      </Button>
    </div>
  );
}
