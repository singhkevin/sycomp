"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { deleteProduct } from "@/lib/actions/product";

export function DeleteProductButton({ productId }: { productId: string }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    setLoading(true);
    const res = await deleteProduct(productId);
    if (!res.success) {
      alert(res.error);
    }
    setLoading(false);
  };

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={handleDelete}
      disabled={loading}
      className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-950/50"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
    </Button>
  );
}
