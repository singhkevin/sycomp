"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Package, 
  Tags, 
  ShoppingCart,
  FileText,
  AlertCircle,
  Settings,
  LogOut
} from "lucide-react";
import { logout } from "@/lib/actions/auth";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/po/open", label: "Open POs", icon: ShoppingCart },
  { href: "/admin/po/in-process", label: "In-Process POs", icon: FileText },
  { href: "/admin/po/closed", label: "Closed POs", icon: Settings },
  { href: "/admin/po/cancelled", label: "Cancelled POs", icon: AlertCircle },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 hidden md:flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-slate-800">
        <div className="flex gap-2 items-center">
          <div className="h-8 w-8 bg-blue-600 rounded-md"></div>
          <span className="text-xl font-bold text-white tracking-tight">Sycomp Admin</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-3">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                  isActive 
                    ? "bg-blue-600 text-white" 
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium text-sm">{item.label}</span>
              </Link>
            );
          })}
          
          <button
            onClick={() => logout()}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-slate-400 hover:bg-red-950/30 hover:text-red-400 mt-4"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium text-sm">Logout</span>
          </button>
        </nav>
      </div>
    </aside>
  );
}
