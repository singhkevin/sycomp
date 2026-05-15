"use client";

import Link from "next/link";
import { User } from "@prisma/client";
import { ShoppingCart, User as UserIcon, LogOut } from "lucide-react";
import { useCart } from "@/store/useCart";
import { Button } from "@/components/ui/button";
import { logout } from "@/lib/actions/auth";

export function StoreNav({ user }: { user: User }) {
  const items = useCart((state) => state.items);
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto flex h-16 items-center px-4">
        <div className="flex gap-2 items-center">
          <div className="h-8 w-8 bg-blue-600 rounded-md"></div>
          <Link href="/store" className="text-xl font-bold text-slate-900 tracking-tight">Sycomp</Link>
        </div>

        <div className="ml-auto flex items-center space-x-4">
          {user.country && (
            <div className="hidden md:flex items-center text-sm font-medium text-slate-600 gap-2 mr-4">
              <span className="text-slate-400">Deliver to:</span>
              <button 
                onClick={() => window.dispatchEvent(new CustomEvent("open-country-selector"))}
                className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-slate-100 transition-colors border border-slate-200"
              >
                <span>{({
                  "IN": "🇮🇳 India",
                  "AU": "🇦🇺 Australia",
                  "CN": "🇨🇳 China",
                  "JP": "🇯🇵 Japan",
                  "PH": "🇵🇭 Philippines",
                  "ZA": "🇿🇦 South Africa",
                  "TW": "🇹🇼 Taiwan",
                  "AE": "🇦🇪 UAE",
                  "US": "🇺🇸 USA",
                  "CA": "🇨🇦 Canada",
                } as Record<string, string>)[user.country] ?? user.country}</span>
                <span className="text-[10px] bg-slate-100 text-slate-500 px-1 rounded border">Change</span>
              </button>
            </div>
          )}
          
          <Button variant="ghost" size="icon" asChild>
            <Link href="/store/cart" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                  {itemCount}
                </span>
              )}
            </Link>
          </Button>

          <Button variant="ghost" size="sm" asChild className="text-slate-600 gap-2">
            <Link href="/store/orders">
              <UserIcon className="h-4 w-4" />
              <span className="hidden sm:inline">My Orders</span>
            </Link>
          </Button>

          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => logout()}
            className="text-slate-500 hover:text-red-600 hover:bg-red-50"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
