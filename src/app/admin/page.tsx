import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ShoppingCart, Users, DollarSign } from "lucide-react";

export default async function AdminDashboard() {
  const userCount = await prisma.user.count();
  const productCount = await prisma.product.count();
  const openPoCount = await prisma.purchaseOrder.count({ where: { status: "OPEN" } });
  
  // Just calculate some mock revenue from orders
  const orders = await prisma.order.findMany({
    include: { items: { include: { product: { include: { category: true } } } } }
  });
  
  const revenue = orders.reduce((acc, o) => acc + o.total, 0);

  // Calculate spend breakdown by category with null safety
  const categorySpend: Record<string, number> = {};
  orders.forEach(order => {
    order.items?.forEach(item => {
      const catName = item.product?.category?.name || "Uncategorized";
      const itemTotal = (item.price || 0) * (item.quantity || 0);
      categorySpend[catName] = (categorySpend[catName] || 0) + itemTotal;
    });
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-[#1f4475] border-white/15 hover:bg-[#25528d] transition-all duration-300 cursor-pointer shadow-lg shadow-blue-950/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-blue-100/90">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">${revenue.toFixed(2)}</div>
            <p className="text-xs text-blue-200/70 mt-1">+20.1% from last month</p>
          </CardContent>
        </Card>
        
        <Card className="bg-[#1f4475] border-white/15 hover:bg-[#25528d] transition-all duration-300 cursor-pointer shadow-lg shadow-blue-950/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-blue-100/90">Total Users</CardTitle>
            <Users className="h-4 w-4 text-blue-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{userCount}</div>
            <p className="text-xs text-blue-200/70 mt-1">+12 this week</p>
          </CardContent>
        </Card>
        
        <Card className="bg-[#1f4475] border-white/15 hover:bg-[#25528d] transition-all duration-300 cursor-pointer shadow-lg shadow-blue-950/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-blue-100/90">Active Products</CardTitle>
            <Package className="h-4 w-4 text-blue-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{productCount}</div>
            <p className="text-xs text-blue-200/70 mt-1">Available in catalogue</p>
          </CardContent>
        </Card>
        
        <Card className="bg-[#1f4475] border-white/15 hover:bg-[#25528d] transition-all duration-300 cursor-pointer shadow-lg shadow-blue-950/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-blue-100/90">Open POs</CardTitle>
            <ShoppingCart className="h-4 w-4 text-blue-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{openPoCount}</div>
            <p className="text-xs text-blue-200/70 mt-1">Require immediate attention</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <Card className="bg-[#1f4475] border-white/15 hover:bg-[#25528d] transition-all duration-300 shadow-lg shadow-blue-950/10">
          <CardHeader>
            <CardTitle className="text-white">Spend by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(categorySpend).length === 0 ? (
                <div className="text-blue-200/60 text-sm italic">No data available yet</div>
              ) : (
                Object.entries(categorySpend).map(([category, amount]) => (
                  <div key={category} className="flex flex-col gap-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-blue-100/90">{category}</span>
                      <span className="text-white font-medium">${amount.toFixed(2)}</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-1.5">
                      <div 
                        className="bg-white h-1.5 rounded-full" 
                        style={{ width: `${Math.min((amount / revenue) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#1f4475] border-white/15 hover:bg-[#25528d] transition-all duration-300 shadow-lg shadow-blue-950/10 min-h-[300px]">
          <CardHeader>
            <CardTitle className="text-white">Inventory Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-blue-100/90 text-sm flex items-center justify-center h-[200px] border border-dashed border-white/20 rounded">
              Low stock items list goes here
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
