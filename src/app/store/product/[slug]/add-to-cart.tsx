"use client";

import { useState } from "react";
import { Product } from "@prisma/client";
import { useCart } from "@/store/useCart";
import { Button } from "@/components/ui/button";

export function ProductAddToCart({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const addItem = useCart((state) => state.addItem);

  const handleAdd = () => {
    addItem({
      id: product.id,
      title: product.title,
      price: product.price,
      quantity,
      imageUrl: product.imageUrl || undefined,
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
