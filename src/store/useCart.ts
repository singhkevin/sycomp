import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string; // Master Product ID
  marketId: string; // Specific ProductMarket ID
  sku?: string;
  title: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  countryCode: string;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  clearMarket: (countryCode: string) => void;
  getTotal: (currency?: string) => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const currentItems = get().items;
        const existingItem = currentItems.find((i) => i.marketId === item.marketId);
        
        if (existingItem) {
          set({
            items: currentItems.map((i) =>
              i.marketId === item.marketId ? { ...i, quantity: i.quantity + item.quantity } : i
            ),
          });
        } else {
          set({ items: [...currentItems, item] });
        }
      },
      removeItem: (marketId) => {
        set({ items: get().items.filter((i) => i.marketId !== marketId) });
      },
      updateQuantity: (marketId, quantity) => {
        set({
          items: get().items.map((i) =>
            i.marketId === marketId ? { ...i, quantity: Math.max(1, quantity) } : i
          ),
        });
      },
      clearCart: () => set({ items: [] }),
      clearMarket: (countryCode) => {
        set({ items: get().items.filter((i) => (i.countryCode || "US") !== countryCode) });
      },
      getTotal: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },
    }),
    {
      name: "sycomp-cart",
    }
  )
);
