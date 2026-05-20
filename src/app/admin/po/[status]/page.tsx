import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Clock, CheckCircle, XCircle, ShoppingCart } from "lucide-react";
import { POStatus } from "@prisma/client";
import { POStatusActions } from "@/components/admin/po-status-actions";


const statusConfig = {
  "open": { icon: ShoppingCart, title: "Open Purchase Orders", prismaStatus: "OPEN" as POStatus },
  "in-process": { icon: Clock, title: "In-Process Purchase Orders", prismaStatus: "IN_PROCESS" as POStatus },
  "closed": { icon: CheckCircle, title: "Closed Purchase Orders", prismaStatus: "CLOSED" as POStatus },
  "cancelled": { icon: XCircle, title: "Cancelled Purchase Orders", prismaStatus: "CANCELLED" as POStatus },
};

export default async function AdminPOPage({
  params,
  searchParams,
}: {
  params: Promise<{ status: string }>;
  searchParams: Promise<{ country?: string }>;
}) {
  const { status } = await params;
  const { country } = await searchParams;
  const config = statusConfig[status as keyof typeof statusConfig];

  if (!config) {
    return <div>Invalid Status</div>;
  }

  const Icon = config.icon;

  const purchaseOrders = await prisma.purchaseOrder.findMany({
    where: { 
      status: config.prismaStatus,
      ...(country ? { country } : {})
    },
    orderBy: { createdAt: "desc" }
  });

  const countries = ["US", "IN", "CA", "UK", "AU"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-slate-100 border border-slate-200 rounded-lg flex items-center justify-center shadow-sm">
            <Icon className="h-5 w-5 text-slate-700" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{config.title}</h1>
        </div>
        
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg border border-slate-200 shadow-sm">
          <Link href={`/admin/po/${status}`}>
            <Button variant={!country ? "secondary" : "ghost"} size="sm" className="h-8 px-3 text-xs font-semibold">
              All
            </Button>
          </Link>
          {countries.map(c => (
            <Link key={c} href={`/admin/po/${status}?country=${c}`}>
              <Button variant={country === c ? "secondary" : "ghost"} size="sm" className="h-8 px-3 text-xs font-semibold">
                {c}
              </Button>
            </Link>
          ))}
        </div>
      </div>

      <Card className="bg-[#1f4475] border-white/15 shadow-lg shadow-blue-950/10">
        <CardHeader>
          <CardTitle className="text-white font-bold flex items-center justify-between">
            <span>Viewing {purchaseOrders.length} records</span>
            {country && (
              <Badge variant="secondary" className="bg-white/10 text-white border-white/20 flex items-center gap-1.5">
                <img 
                  src={`https://flagcdn.com/w40/${country.toLowerCase()}.png`}
                  alt={`${country} flag`}
                  className="h-3 w-4.5 object-cover rounded-sm border border-white/15 shadow-sm"
                />
                {country}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-white/10 overflow-hidden">
            <table className="w-full text-sm text-left text-blue-100">
              <thead className="text-xs text-blue-100/80 uppercase bg-white/5">
                <tr>
                  <th className="px-6 py-3 font-semibold">PO Number</th>
                  <th className="px-6 py-3 font-semibold">Date</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                  <th className="px-6 py-3 font-semibold">Total Amount</th>
                  <th className="px-6 py-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {purchaseOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-blue-200/60">
                      No {config.prismaStatus.replace("_", " ")} purchase orders found.
                    </td>
                  </tr>
                ) : (
                  purchaseOrders.map((po) => (
                    <tr key={po.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-semibold text-white">{po.poNumber}</td>
                      <td className="px-6 py-4 text-blue-100">{new Date(po.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className="text-white border-white/20 bg-white/10 whitespace-nowrap">
                          {po.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 font-semibold text-white">
                        ${po.total.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <Link href={`/admin/po/details/${po.id}`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-200 hover:text-white hover:bg-white/10">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <POStatusActions poId={po.id} currentStatus={po.status} />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
