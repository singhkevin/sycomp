"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "@/store/useCart";
import { useStoreSettings, COUNTRIES, CountryCode } from "@/store/useStoreSettings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createPurchaseOrder } from "@/lib/actions/po";
import { Globe, Package, CheckCircle2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart } = useCart();
  const { formatPrice, country: selectedCountry } = useStoreSettings();
  const [loading, setLoading] = useState(false);
  const [completedPOId, setCompletedPOId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    address: "",
    city: "",
    postalCode: "",
  });

  // Filter items for the selected country
  const currentCountryItems = useMemo(() => {
    return items.filter(item => (item.countryCode || "US") === selectedCountry);
  }, [items, selectedCountry]);

  const countryInfo = COUNTRIES[selectedCountry as CountryCode] || COUNTRIES.US;
  const currentTotal = currentCountryItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const poData = {
      country: selectedCountry,
      total: currentTotal,
      items: currentCountryItems.map(item => ({
        productName: item.title,
        quantity: item.quantity,
        unitPrice: item.price,
        totalPrice: item.price * item.quantity
      }))
    };

    const res = await createPurchaseOrder(poData);

    if (res.success) {
      setCompletedPOId(res.poId || "Success");
      // Only clear items for this country
      const { clearMarket } = useCart.getState();
      clearMarket(selectedCountry);
      
      setTimeout(() => {
        router.push("/store/orders?success=1");
      }, 2000);
    } else {
      alert(res.error || "Failed to raise Purchase Order");
    }
    setLoading(false);
  };

  if (currentCountryItems.length === 0 && !completedPOId) {
    router.push("/store/cart");
    return null;
  }

  if (completedPOId) {
    return (
      <div className="container mx-auto p-4 md:p-8 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 size={48} />
        </div>
        <h1 className="text-3xl font-bold mb-2">PO Raised Successfully!</h1>
        <p className="text-slate-500 max-w-md mb-8">
          We have generated a Purchase Order for the {countryInfo.name} market. 
          Our regional procurement team will review it shortly.
        </p>
        <div className="bg-slate-50 border border-slate-200 px-6 py-4 rounded-lg mb-8">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">PO Number</span>
          <span className="text-xl font-mono font-bold text-slate-900">{completedPOId}</span>
        </div>
        <Button onClick={() => router.push("/store/orders")}>View My Orders</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/store/cart">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Checkout</h1>
        </div>
        <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full border">
          <span className="text-lg">{countryInfo.flag}</span>
          <span className="text-sm font-bold text-slate-700 uppercase">{countryInfo.name} Market</span>
        </div>
      </div>
      
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
            <p className="font-medium mb-1 flex items-center gap-2">
              <Package size={16} />
              Regional Procurement
            </p>
            <p>
              You are raising a formal Purchase Order for the <strong>{countryInfo.name}</strong> market. 
              The regional manager for this market will review and approve the request.
            </p>
          </div>

          <Button type="submit" size="lg" className="w-full text-lg h-14" disabled={loading}>
            {loading ? "Raising PO..." : `Raise PO for ${countryInfo.code}`}
          </Button>
        </form>

        <div className="lg:block">
          <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 sticky top-24 shadow-sm">
            <h3 className="text-xl font-bold mb-6">Order Summary</h3>
            
            <div className="space-y-4 mb-8">
              {currentCountryItems.map(item => (
                <div key={item.marketId} className="flex justify-between items-center bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="relative w-12 h-12 bg-white rounded border flex items-center justify-center p-1">
                      {item.imageUrl ? (
                        <Image src={item.imageUrl} alt={item.title} fill className="object-contain p-1" />
                      ) : (
                        <span className="text-xl">📦</span>
                      )}
                      <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full z-10">
                        {item.quantity}
                      </span>
                    </div>
                    <div>
                      <span className="font-bold text-xs line-clamp-1 text-slate-800">{item.title}</span>
                      <span className="text-[10px] text-slate-500 uppercase tracking-tighter">SKU: {item.marketId.slice(-6).toUpperCase()}</span>
                    </div>
                  </div>
                  <span className="font-bold text-xs whitespace-nowrap text-slate-900">
                    {formatPrice(item.price * item.quantity, selectedCountry)}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-3 pt-6 border-t border-slate-200">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 font-medium">Subtotal ({countryInfo.code})</span>
                <span className="font-bold text-slate-900">{formatPrice(currentTotal, selectedCountry)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 font-medium">Regional Shipping</span>
                <span className="text-green-600 font-bold uppercase text-[10px]">Calculated later</span>
              </div>
              
              <div className="flex justify-between text-lg font-bold pt-4 border-t border-slate-200 mt-2">
                <span>Total</span>
                <span className="text-blue-600">{formatPrice(currentTotal, selectedCountry)}</span>
              </div>
            </div>

            <div className="mt-8 p-3 bg-slate-100 rounded border border-slate-200">
              <p className="text-[10px] text-slate-500 leading-relaxed uppercase tracking-widest font-bold text-center">
                * Raising PO for {countryInfo.name} entity
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
