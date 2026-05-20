import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, FileText, Calendar, DollarSign, Package, Globe } from "lucide-react";
import Link from "next/link";
import { POStatusActions } from "@/components/admin/po-status-actions";

export default async function PODetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
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
            <Button variant="ghost" size="sm" className="text-slate-500 hover:text-slate-900 hover:bg-slate-100">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          </Link>
          <div className="h-10 w-10 bg-slate-100 border border-slate-200 rounded-lg flex items-center justify-center shadow-sm">
            <FileText className="h-5 w-5 text-slate-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{po.poNumber}</h1>
            <p className="text-sm text-slate-500">Purchase Order Details</p>
          </div>
        </div>
        <POStatusActions poId={po.id} currentStatus={po.status} />
      </div>
 
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-[#1f4475] border-white/15 shadow-lg shadow-blue-950/10 md:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-blue-100 uppercase tracking-wider">Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-blue-200 text-sm">
                <Globe className="h-4 w-4 mr-2" />
                Country
              </div>
              <Badge variant="secondary" className="bg-white/10 text-white border-white/20 flex items-center gap-1.5">
                <img 
                  src={`https://flagcdn.com/w40/${po.country.toLowerCase()}.png`}
                  alt={`${po.country} flag`}
                  className="h-3 w-4.5 object-cover rounded-sm border border-white/15 shadow-sm"
                />
                {po.country}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center text-blue-200 text-sm">
                <Calendar className="h-4 w-4 mr-2" />
                Date
              </div>
              <span className="text-white font-medium">{new Date(po.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center text-blue-200 text-sm">
                <Package className="h-4 w-4 mr-2" />
                Status
              </div>
              <Badge variant="outline" className="text-white border-white/20 bg-white/10 whitespace-nowrap">
                {po.status}
              </Badge>
            </div>
            <div className="flex items-center justify-between border-t border-white/10 pt-4">
              <div className="flex items-center text-blue-200 text-sm">
                <DollarSign className="h-4 w-4 mr-2" />
                Total Amount
              </div>
              <span className="text-xl font-bold text-white">${po.total.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>
 
        <Card className="bg-[#1f4475] border-white/15 shadow-lg shadow-blue-950/10 md:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-blue-100 uppercase tracking-wider">Line Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-white/10 overflow-hidden">
              <table className="w-full text-sm text-left text-blue-100">
                <thead className="text-xs text-blue-100/80 uppercase bg-white/5">
                  <tr>
                    <th className="px-6 py-3 font-semibold">Product Name</th>
                    <th className="px-6 py-3 font-semibold text-center">Quantity</th>
                    <th className="px-6 py-3 font-semibold text-right">Unit Price</th>
                    <th className="px-6 py-3 font-semibold text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {po.items.map((item) => (
                    <tr key={item.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-semibold text-white">{item.productName}</td>
                      <td className="px-6 py-4 text-center text-blue-100">{item.quantity}</td>
                      <td className="px-6 py-4 text-right text-blue-100">${item.unitPrice.toFixed(2)}</td>
                      <td className="px-6 py-4 text-right font-semibold text-white">
                        ${item.totalPrice.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                  {po.items.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-blue-200/60">
                        No items found for this purchase order.
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot className="bg-white/5">
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-right font-medium text-blue-200">Total</td>
                    <td className="px-6 py-4 text-right font-bold text-white text-lg">
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
