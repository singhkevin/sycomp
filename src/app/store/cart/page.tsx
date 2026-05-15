"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/store/useCart";
import { Button } from "@/components/ui/button";
import { useStoreSettings, COUNTRIES, CountryCode } from "@/store/useStoreSettings";
import { Globe, ShoppingBag, ArrowRight } from "lucide-react";

import { useEffect, useState, useMemo } from "react";

export default function CartPage() {
  const [mounted, setMounted] = useState(false);
  const { items, removeItem, updateQuantity } = useCart();
  const { formatPrice, country: selectedCountry } = useStoreSettings();

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentCountryItems = useMemo(() => {
    return items.filter(item => (item.countryCode || "US") === selectedCountry);
  }, [items, selectedCountry]);

  const otherMarkets = useMemo(() => {
    const otherItems = items.filter(item => (item.countryCode || "US") !== selectedCountry);
    const groups: Record<string, { code: string; count: number; total: number; country: any }> = {};
    
    otherItems.forEach(item => {
      const code = item.countryCode || "US";
      if (!groups[code]) {
        groups[code] = { 
          code,
          count: 0, 
          total: 0, 
          country: COUNTRIES[code as CountryCode] || COUNTRIES.US 
        };
      }
      groups[code].count += item.quantity;
      groups[code].total += item.price * item.quantity;
    });
    
    return Object.values(groups);
  }, [items, selectedCountry]);

  const otherMarketsCount = items.length - currentCountryItems.length;
  
  const currentTotal = useMemo(() => {
    return currentCountryItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, [currentCountryItems]);

  const countryInfo = COUNTRIES[selectedCountry as CountryCode] || COUNTRIES.US;

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <div className="container mx-auto p-4 md:p-8 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="text-6xl mb-4 text-slate-300">
          <ShoppingBag size={80} />
        </div>
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Shopping Cart</h1>
          <p className="text-slate-500 text-sm mt-1">
            Viewing items for <span className="font-bold text-slate-900">{countryInfo.name}</span> market
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="text-sm font-medium text-slate-500 flex items-center gap-2">
            <Globe size={16} />
            {countryInfo.flag} {countryInfo.code} Market
          </div>
          {otherMarketsCount > 0 && (
            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
              +{otherMarketsCount} items in other markets
            </span>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {currentCountryItems.length > 0 ? (
            <div className="space-y-4">
              {currentCountryItems.map((item, index) => (
                <div key={item.marketId || `${item.id}-${index}`} className="flex gap-4 bg-white p-4 rounded-lg border border-slate-200 shadow-sm transition-shadow hover:shadow-md">
                  <div className="w-24 h-24 bg-slate-50 rounded-md relative flex-shrink-0 flex items-center justify-center">
                    {item.imageUrl ? (
                      <Image src={item.imageUrl} alt={item.title} fill className="object-contain p-2 mix-blend-multiply" />
                    ) : (
                      <span className="text-2xl">📦</span>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-slate-900 line-clamp-1">{item.title}</h3>
                        <p className="text-xs text-slate-500 mt-1 uppercase tracking-tight">
                          SKU: {item.sku || (item.marketId ? item.marketId.slice(-6).toUpperCase() : "N/A")}
                        </p>
                      </div>
                      <div className="font-bold whitespace-nowrap ml-4 text-slate-900">
                        {formatPrice(item.price * item.quantity, selectedCountry)}
                      </div>
                    </div>
                    <div className="flex justify-between items-end mt-4">
                      <div className="flex items-center border rounded-md h-8 bg-slate-50">
                        <button onClick={() => updateQuantity(item.marketId, item.quantity - 1)} className="px-3 hover:bg-slate-200 h-full text-slate-600 font-bold transition-colors">-</button>
                        <div className="px-3 text-sm font-bold min-w-8 text-center">{item.quantity}</div>
                        <button onClick={() => updateQuantity(item.marketId, item.quantity + 1)} className="px-3 hover:bg-slate-200 h-full text-slate-600 font-bold transition-colors">+</button>
                      </div>
                      <button onClick={() => removeItem(item.marketId)} className="text-xs text-red-500 font-bold hover:text-red-700 transition-colors uppercase tracking-wider">
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-12 text-center">
              <div className="text-4xl mb-4">🌍</div>
              <h3 className="text-lg font-bold text-slate-900">No items for this market</h3>
              <p className="text-slate-500 max-w-xs mx-auto mt-2">
                You haven&apos;t added any products for the {countryInfo.name} market yet. 
                {otherMarketsCount > 0 && " Items for other markets are currently hidden."}
              </p>
              <Button variant="outline" className="mt-6" asChild>
                <Link href="/store">Continue Shopping</Link>
              </Button>
            </div>
          )}

          {otherMarkets.length > 0 && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-200 bg-slate-100/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe size={16} className="text-slate-400" />
                  <span className="text-sm font-bold text-slate-700">Items in Other Regional Carts</span>
                </div>
                <span className="text-[10px] bg-white text-slate-500 border border-slate-200 px-2 py-0.5 rounded-full font-bold">
                  {otherMarketsCount} TOTAL ITEMS
                </span>
              </div>
              <div className="divide-y divide-slate-200">
                {otherMarkets.map((market) => (
                  <div key={market.code} className="p-4 flex items-center justify-between hover:bg-slate-100/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="text-2xl w-10 h-10 bg-white rounded-lg border border-slate-200 flex items-center justify-center shadow-sm">
                        {market.country.flag}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900">{market.country.name} Market</div>
                        <div className="text-xs text-slate-500 font-medium">
                          {market.count} {market.count === 1 ? 'item' : 'items'} ready for checkout
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-slate-900">
                        {formatPrice(market.total, market.code as CountryCode)}
                      </div>
                      <button 
                        onClick={() => useStoreSettings.getState().setCountry(market.code as CountryCode)}
                        className="text-[10px] text-blue-600 font-bold uppercase tracking-wider hover:underline mt-1"
                      >
                        Switch to Market
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 bg-white/50 text-center">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  Items are segmented by market for procurement compliance
                </p>
              </div>
            </div>
          )}
        </div>
        
        <div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm sticky top-24">
            <h3 className="text-lg font-bold mb-4">Order Summary</h3>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <span>{countryInfo.flag}</span>
                  <span className="text-slate-600">{countryInfo.code} Market Subtotal</span>
                </div>
                <span className="font-bold text-slate-900">{formatPrice(currentTotal, selectedCountry)}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-4">
              <Button 
                className="w-full font-bold h-12" 
                size="lg" 
                disabled={currentCountryItems.length === 0}
                asChild
              >
                <Link href="/store/checkout">
                  Raise Purchase Order <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </div>
            
            <p className="text-[10px] text-slate-400 mt-6 text-center uppercase tracking-widest font-semibold">
              Procurement PO for {countryInfo.name}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
