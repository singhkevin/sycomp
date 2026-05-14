"use client";

import { User } from "@prisma/client";
import { Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function AdminHeader({ user }: { user: User }) {
  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between px-6 sticky top-0 z-10 backdrop-blur">
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input 
            placeholder="Search POs, products..." 
            className="pl-10 bg-slate-800/50 border-slate-700 text-slate-200 placeholder:text-slate-500 w-full max-w-md"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-slate-800">
          <Bell className="h-5 w-5" />
        </Button>
        <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-medium text-white border border-slate-700">
          {user.email[0].toUpperCase()}
        </div>
      </div>
    </header>
  );
}
