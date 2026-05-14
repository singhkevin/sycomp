"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { updateUserCountry } from "@/lib/actions/user";
import { useStoreSettings, CountryCode } from "@/store/useStoreSettings";

const COUNTRIES = [
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "UK", name: "United Kingdom", flag: "🇬🇧" },
  { code: "IN", name: "India", flag: "🇮🇳" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
];

export function CountryEnforcer({ currentCountry }: { currentCountry: string | null }) {
  const [open, setOpen] = useState(!currentCountry);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<string | null>(currentCountry);
  const setStoreCountry = useStoreSettings(state => state.setCountry);

  useEffect(() => {
    // Sync store with DB value on load
    if (currentCountry) {
      setStoreCountry(currentCountry as CountryCode);
    }

    const handleOpen = () => setOpen(true);
    window.addEventListener("open-country-selector", handleOpen);
    return () => window.removeEventListener("open-country-selector", handleOpen);
  }, [currentCountry, setStoreCountry]);

  const handleSave = async () => {
    if (!selected) return;
    setLoading(true);
    const res = await updateUserCountry(selected);
    if (res.success) {
      setStoreCountry(selected as CountryCode);
      setOpen(false);
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select Your Country</DialogTitle>
          <DialogDescription>
            Please select your country so we can show you the correct products, pricing, and availability.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-4 py-4">
          {COUNTRIES.map((c) => (
            <div
              key={c.code}
              onClick={() => setSelected(c.code)}
              className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                selected === c.code ? "border-blue-600 bg-blue-50" : "hover:bg-slate-50"
              }`}
            >
              <span className="text-2xl">{c.flag}</span>
              <span className="font-medium">{c.name}</span>
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button onClick={handleSave} disabled={!selected || loading} className="w-full">
            {loading ? "Saving..." : "Confirm Selection"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
