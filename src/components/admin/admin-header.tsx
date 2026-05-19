"use client";

import { User } from "@prisma/client";
import { Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function AdminHeader({ user }: { user: User }) {
  return (
    <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Search POs, products..." 
            className="pl-10 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 w-full max-w-md focus:bg-white transition-all"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="text-slate-500 hover:text-slate-900 hover:bg-slate-100">
          <Bell className="h-5 w-5" />
        </Button>
        <div className="h-8 w-8 rounded-full bg-slate-900 flex items-center justify-center text-sm font-semibold text-white border border-slate-200">
          {user.email[0].toUpperCase()}
        </div>
      </div>
    </header>
  );
}
