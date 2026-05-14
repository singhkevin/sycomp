"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/store/useCart";
import { Button } from "@/components/ui/button";
import { useStoreSettings } from "@/store/useStoreSettings";

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotal } = useCart();
  const formatPrice = useStoreSettings(state => state.formatPrice);

  if (items.length === 0) {
    return (
      <div className="container mx-auto p-4 md:p-8 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="text-6xl mb-4">🛒</div>
        <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
        <p className="text-slate-500 mb-6">Looks like you haven&apos;t added anything yet.</p>
        <Button asChild>
          <Link href="/store">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-5xl">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Shopping Cart</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex gap-4 bg-white p-4 rounded-lg border border-slate-200">
              <div className="w-24 h-24 bg-slate-50 rounded-md relative flex-shrink-0 flex items-center justify-center">
                {item.imageUrl ? (
                  <Image src={item.imageUrl} alt={item.title} fill className="object-contain p-2 mix-blend-multiply" />
                ) : (
                  <span className="text-2xl">📦</span>
                )}
              </div>
              <div className="flex-1 flex flex-col justify-between py-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-slate-900 line-clamp-1">{item.title}</h3>
                  <div className="font-bold whitespace-nowrap ml-4">{formatPrice(item.price * item.quantity)}</div>
                </div>
                <div className="flex justify-between items-end mt-4">
                  <div className="flex items-center border rounded-md h-8">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-2 hover:bg-slate-100 h-full text-slate-500 font-medium">-</button>
                    <div className="px-3 text-sm font-medium min-w-8 text-center">{item.quantity}</div>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-2 hover:bg-slate-100 h-full text-slate-500 font-medium">+</button>
                  </div>
                  <button onClick={() => removeItem(item.id)} className="text-sm text-red-500 font-medium hover:underline">
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div>
          <div className="bg-white p-6 rounded-lg border border-slate-200 sticky top-24">
            <h3 className="text-lg font-bold mb-4">Order Summary</h3>
            <div className="space-y-2 mb-4 pb-4 border-b">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>{formatPrice(getTotal())}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>
            </div>
            <div className="flex justify-between font-bold text-lg mb-6">
              <span>Total</span>
              <span>{formatPrice(getTotal())}</span>
            </div>
            <Button className="w-full" size="lg" asChild>
              <Link href="/store/checkout">Proceed to Checkout</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
