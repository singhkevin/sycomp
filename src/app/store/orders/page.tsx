import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FileText, ChevronRight, Clock, CheckCircle2, AlertCircle, XCircle } from "lucide-react";
import { format } from "date-fns";
import { COUNTRIES } from "@/store/useStoreSettings";

const STATUS_CONFIG = {
  OPEN: { color: "text-blue-600 bg-blue-50 border-blue-100", icon: Clock, label: "Open" },
  IN_PROCESS: { color: "text-amber-600 bg-amber-50 border-amber-100", icon: Clock, label: "In Process" },
  CLOSED: { color: "text-emerald-600 bg-emerald-50 border-emerald-100", icon: CheckCircle2, label: "Closed" },
  CANCELLED: { color: "text-rose-600 bg-rose-50 border-rose-100", icon: XCircle, label: "Cancelled" },
};

export default async function OrdersPage() {
  const session = await verifySession();
  
  if (!session?.userId) {
    redirect("/login");
  }

  const orders = await prisma.purchaseOrder.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { items: true }
      }
    }
  });

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Purchase Orders</h1>
        <p className="text-slate-500 mt-2">Track your procurement history and PO status.</p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
          <div className="text-4xl mb-4">📜</div>
          <h2 className="text-xl font-semibold text-slate-700">No orders found</h2>
          <p className="text-slate-500 mt-2">You haven&apos;t raised any Purchase Orders yet.</p>
          <Link href="/store" className="inline-block mt-6 text-blue-600 font-medium hover:underline">
            Go to Catalogue
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const status = STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG];
            const country = COUNTRIES[order.country as keyof typeof COUNTRIES] || COUNTRIES.US;
            const StatusIcon = status.icon;

            return (
              <Link 
                key={order.id} 
                href={`/store/orders/${order.id}`}
                className="block bg-white p-6 rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-md hover:border-blue-200 group"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${status.color.split(' ')[1]}`}>
                      <FileText className={`h-6 w-6 ${status.color.split(' ')[0]}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{order.poNumber}</span>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-sm text-slate-500">{format(order.createdAt, "MMM d, yyyy")}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-lg">{country.flag}</span>
                        <span className="text-sm text-slate-600 font-medium">{order._count.items} Items</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-6">
                    <div className="text-right">
                      <div className="text-lg font-bold text-slate-900">
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: country.currency
                        }).format(order.total)}
                      </div>
                    </div>
                    
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold uppercase tracking-wider ${status.color}`}>
                      <StatusIcon className="h-3.5 w-3.5" />
                      {status.label}
                    </div>

                    <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-blue-500 transition-colors hidden md:block" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
