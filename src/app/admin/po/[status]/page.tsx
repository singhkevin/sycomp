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
  params: { status: string };
  searchParams: { country?: string };
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
          <div className="h-10 w-10 bg-slate-800 rounded-lg flex items-center justify-center">
            <Icon className="h-5 w-5 text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{config.title}</h1>
        </div>
        
        <div className="flex items-center gap-2 bg-slate-800 p-1 rounded-lg border border-slate-700">
          <Link href={`/admin/po/${status}`}>
            <Button variant={!country ? "secondary" : "ghost"} size="sm" className="h-8 px-3">
              All
            </Button>
          </Link>
          {countries.map(c => (
            <Link key={c} href={`/admin/po/${status}?country=${c}`}>
              <Button variant={country === c ? "secondary" : "ghost"} size="sm" className="h-8 px-3">
                {c}
              </Button>
            </Link>
          ))}
        </div>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-slate-50 flex items-center justify-between">
            <span>Viewing {purchaseOrders.length} records</span>
            {country && <Badge variant="secondary" className="bg-blue-500/10 text-blue-400 border-blue-500/20">{country}</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-slate-800">
            <table className="w-full text-sm text-left text-slate-300">
              <thead className="text-xs text-slate-400 uppercase bg-slate-800/50">
                <tr>
                  <th className="px-6 py-3 font-medium">PO Number</th>
                  <th className="px-6 py-3 font-medium">Date</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Total Amount</th>
                  <th className="px-6 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {purchaseOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                      No {config.prismaStatus.replace("_", " ")} purchase orders found.
                    </td>
                  </tr>
                ) : (
                  purchaseOrders.map((po) => (
                    <tr key={po.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-100">{po.poNumber}</td>
                      <td className="px-6 py-4">{new Date(po.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className="text-blue-400 border-blue-900 bg-blue-950/50">
                          {po.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-200">
                        ${po.total.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <Link href={`/admin/po/details/${po.id}`}>
                            <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white">
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
