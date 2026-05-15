import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/session";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, FileText, Download, Building2, Package, Clock, CheckCircle2, XCircle } from "lucide-react";
import { format } from "date-fns";
import { COUNTRIES } from "@/store/useStoreSettings";
import { Button } from "@/components/ui/button";

const STATUS_CONFIG = {
  OPEN: { color: "text-blue-600 bg-blue-50 border-blue-100", icon: Clock, label: "Open", desc: "Your PO has been submitted and is awaiting review." },
  IN_PROCESS: { color: "text-amber-600 bg-amber-50 border-amber-100", icon: Clock, label: "In Process", desc: "Our team is currently processing your procurement request." },
  CLOSED: { color: "text-emerald-600 bg-emerald-50 border-emerald-100", icon: CheckCircle2, label: "Closed", desc: "This procurement process has been successfully completed." },
  CANCELLED: { color: "text-rose-600 bg-rose-50 border-rose-100", icon: XCircle, label: "Cancelled", desc: "This order has been cancelled." },
};

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await verifySession();
  const { id } = await params;

  if (!session?.userId) {
    redirect("/login");
  }

  const order = await prisma.purchaseOrder.findUnique({
    where: { id, userId: session.userId },
    include: {
      items: true,
      user: true,
    }
  });

  if (!order) {
    notFound();
  }

  const status = STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG];
  const country = COUNTRIES[order.country as keyof typeof COUNTRIES] || COUNTRIES.US;
  const StatusIcon = status.icon;

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-4xl">
      <div className="mb-8 flex items-center justify-between">
        <Link href="/store/orders" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors">
          <ChevronLeft className="h-4 w-4" />
          <span>Back to Orders</span>
        </Link>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" />
          Download PDF
        </Button>
      </div>

      <div className="grid gap-8">
        {/* Header Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${status.color.split(' ')[1]}`}>
                  <FileText className={`h-5 w-5 ${status.color.split(' ')[0]}`} />
                </div>
                <h1 className="text-2xl font-bold text-slate-900">{order.poNumber}</h1>
              </div>
              <p className="text-slate-500">Raised on {format(order.createdAt, "MMMM d, yyyy 'at' h:mm a")}</p>
            </div>
            
            <div className="text-left md:text-right">
              <div className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full border text-sm font-bold uppercase tracking-wider mb-2 ${status.color}`}>
                <StatusIcon className="h-4 w-4" />
                {status.label}
              </div>
              <p className="text-xs text-slate-400 italic max-w-[200px] md:ml-auto">{status.desc}</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Details Column */}
          <div className="md:col-span-2 space-y-8">
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                <h2 className="font-bold text-slate-900 flex items-center gap-2">
                  <Package className="h-4 w-4 text-slate-400" />
                  Order Items
                </h2>
              </div>
              <div className="divide-y divide-slate-100">
                {order.items.map((item) => (
                  <div key={item.id} className="p-6 flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-slate-900">{item.productName}</p>
                      <p className="text-sm text-slate-500">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900">
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: country.currency
                        }).format(item.totalPrice)}
                      </p>
                      <p className="text-xs text-slate-400">
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: country.currency
                        }).format(item.unitPrice)} per unit
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-6 bg-slate-50 border-t border-slate-100">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span className="text-slate-600">Total Amount</span>
                  <span className="text-slate-900 text-2xl">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: country.currency
                    }).format(order.total)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Building2 className="h-4 w-4 text-slate-400" />
                Shipping Region
              </h3>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-2xl">{country.flag}</span>
                <div>
                  <p className="font-bold text-slate-900">{country.name}</p>
                  <p className="text-xs text-slate-500">Market Segment: Enterprise</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
                Requester Info
              </h3>
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-900">{order.user?.email}</p>
                <p className="text-xs text-slate-500 italic">PO generated automatically upon submission.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
