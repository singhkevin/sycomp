import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, FileText, Calendar, DollarSign, Package } from "lucide-react";
import Link from "next/link";
import { POStatusActions } from "@/components/admin/po-status-actions";

export default async function PODetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;
  
  const po = await prisma.purchaseOrder.findUnique({
    where: { id },
    include: {
      items: true
    }
  });

  if (!po) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/admin/po/${po.status.toLowerCase().replace("_", "-")}`}>
            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          </Link>
          <div className="h-10 w-10 bg-slate-800 rounded-lg flex items-center justify-center">
            <FileText className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-50">{po.poNumber}</h1>
            <p className="text-sm text-slate-500">Purchase Order Details</p>
          </div>
        </div>
        <POStatusActions poId={po.id} currentStatus={po.status} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-slate-900 border-slate-800 md:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-400 uppercase tracking-wider">Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-slate-400 text-sm">
                <Calendar className="h-4 w-4 mr-2" />
                Date
              </div>
              <span className="text-slate-100 font-medium">{new Date(po.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center text-slate-400 text-sm">
                <Package className="h-4 w-4 mr-2" />
                Status
              </div>
              <Badge variant="outline" className="text-blue-400 border-blue-900 bg-blue-950/50">
                {po.status}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center text-slate-400 text-sm">
                <DollarSign className="h-4 w-4 mr-2" />
                Total Amount
              </div>
              <span className="text-xl font-bold text-slate-50">${po.total.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800 md:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-400 uppercase tracking-wider">Line Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-slate-800 overflow-hidden">
              <table className="w-full text-sm text-left text-slate-300">
                <thead className="text-xs text-slate-400 uppercase bg-slate-800/50">
                  <tr>
                    <th className="px-6 py-3 font-medium">Product Name</th>
                    <th className="px-6 py-3 font-medium text-center">Quantity</th>
                    <th className="px-6 py-3 font-medium text-right">Unit Price</th>
                    <th className="px-6 py-3 font-medium text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {po.items.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-100">{item.productName}</td>
                      <td className="px-6 py-4 text-center">{item.quantity}</td>
                      <td className="px-6 py-4 text-right">${item.unitPrice.toFixed(2)}</td>
                      <td className="px-6 py-4 text-right font-bold text-slate-200">
                        ${item.totalPrice.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                  {po.items.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                        No items found for this purchase order.
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot className="bg-slate-800/30">
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-right font-medium text-slate-400">Total</td>
                    <td className="px-6 py-4 text-right font-bold text-blue-400 text-lg">
                      ${po.total.toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
