"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "@/store/useCart";
import { useStoreSettings } from "@/store/useStoreSettings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createPurchaseOrder } from "@/lib/actions/po";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotal, clearCart } = useCart();
  const formatPrice = useStoreSettings(state => state.formatPrice);
  const country = useStoreSettings(state => state.country);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    address: "",
    city: "",
    postalCode: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const poData = {
      country: country || "US",
      total: getTotal(),
      items: items.map(item => ({
        productName: item.title,
        quantity: item.quantity,
        unitPrice: item.price,
        totalPrice: item.price * item.quantity
      }))
    };

    const res = await createPurchaseOrder(poData);
    
    if (res.success) {
      clearCart();
      router.push("/store/orders?success=1");
    } else {
      alert(res.error || "Failed to raise Purchase Order");
    }
    setLoading(false);
  };

  if (items.length === 0) {
    router.push("/store/cart");
    return null;
  }

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-6xl">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Raise Purchase Order</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <form onSubmit={handleCheckout} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Procurement Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="email">Work Email</Label>
                  <Input id="email" name="email" type="email" required onChange={handleInputChange} />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input id="fullName" name="fullName" required onChange={handleInputChange} />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="address">Shipping Address</Label>
                  <Input id="address" name="address" required onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" name="city" required onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input id="postalCode" name="postalCode" required onChange={handleInputChange} />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg text-sm text-blue-800">
            <p className="font-medium mb-1">Procurement Mode</p>
            <p>You are raising a formal Purchase Order. Our procurement team will review your request and contact you for payment processing.</p>
          </div>

          <Button type="submit" size="lg" className="w-full text-lg" disabled={loading}>
            {loading ? "Processing..." : `Raise PO (${formatPrice(getTotal())})`}
          </Button>
        </form>

        <div className="hidden lg:block">
          <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 sticky top-24">
            <h3 className="text-xl font-bold mb-6">Order Summary</h3>
            <div className="space-y-4 mb-6">
              {items.map(item => (
                <div key={item.id} className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16 bg-white rounded border flex items-center justify-center p-1">
                      {item.imageUrl ? (
                        <Image src={item.imageUrl} alt={item.title} fill className="object-contain p-1" />
                      ) : (
                        <span className="text-xl">📦</span>
                      )}
                      <span className="absolute -top-2 -right-2 bg-slate-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full z-10">
                        {item.quantity}
                      </span>
                    </div>
                    <span className="font-medium text-sm line-clamp-2 pr-4">{item.title}</span>
                  </div>
                  <span className="font-bold text-sm whitespace-nowrap">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
            
            <div className="space-y-2 pt-6 border-t border-slate-200 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>{formatPrice(getTotal())}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Shipping</span>
                <span>Free</span>
              </div>
            </div>
            
            <div className="flex justify-between font-bold text-xl mt-6 pt-6 border-t border-slate-200">
              <span>Total</span>
              <span>{formatPrice(getTotal())}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
