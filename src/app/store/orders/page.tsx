import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: { success?: string };
}) {
  const session = await verifySession();
  
  if (!session?.userId) return null;

  const orders = await prisma.order.findMany({
    where: { userId: session.userId },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: "desc" }
  });

  const isSuccess = searchParams.success === "1";

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-5xl">
      {isSuccess && (
        <div className="mb-8 p-6 bg-green-50 border border-green-200 rounded-lg text-center">
          <div className="text-4xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-green-800">Order Placed Successfully!</h2>
          <p className="text-green-700 mt-2">Thank you for your purchase. Your order is being processed.</p>
        </div>
      )}

      <h1 className="text-3xl font-bold tracking-tight mb-8">Order History</h1>
      
      {orders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-lg border border-dashed">
          <div className="text-4xl mb-4">📝</div>
          <h2 className="text-xl font-semibold text-slate-700">No orders yet</h2>
          <p className="text-slate-500 mt-2">When you place an order, it will appear here.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map(order => (
            <Card key={order.id}>
              <CardHeader className="bg-slate-50 border-b pb-4">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-sm font-medium text-slate-500">Order Placed</CardTitle>
                    <div className="text-slate-900 mt-1">{new Date(order.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <CardTitle className="text-sm font-medium text-slate-500">Total</CardTitle>
                    <div className="text-slate-900 mt-1 font-bold">${order.total.toFixed(2)}</div>
                  </div>
                  <div>
                    <Badge variant={order.status === "DELIVERED" ? "default" : "secondary"}>
                      {order.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ul className="divide-y">
                  {order.items.map(item => (
                    <li key={item.id} className="p-4 flex items-center gap-4">
                      <div className="w-16 h-16 bg-slate-50 rounded border relative flex items-center justify-center p-1 overflow-hidden">
                        {item.product.imageUrl ? (
                          <Image src={item.product.imageUrl} alt={item.product.title} fill className="object-contain p-1 mix-blend-multiply" />
                        ) : (
                          <span className="text-xl">📦</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900 line-clamp-1">{item.product.title}</h4>
                        <div className="text-sm text-slate-500 mt-1">
                          Qty: {item.quantity} • ${item.price.toFixed(2)} each
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
