import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/session";
import { ProductCard } from "@/components/store/product-card";

export default async function StoreDashboard() {
  const session = await verifySession();
  
  if (!session?.userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { country: true }
  });

  const selectedCountry = user?.country || "US";

  // Fetch products for the user's selected country
  const availableProducts = await prisma.product.findMany({
    where: {
      countryRestrictions: {
        has: selectedCountry
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Product Catalogue</h1>
        <p className="text-slate-500 mt-2">Discover our enterprise procurement solutions.</p>
      </div>

      {availableProducts.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-lg border border-dashed">
          <h2 className="text-xl font-semibold text-slate-700">No products available</h2>
          <p className="text-slate-500 mt-2">Check back later or try changing your delivery region.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {availableProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
