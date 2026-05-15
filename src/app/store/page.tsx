import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/session";
import { ProductCard } from "@/components/store/product-card";
import { StoreFilters } from "@/components/store/store-filters";

export default async function StoreDashboard({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; sort?: string }>;
}) {
  const session = await verifySession();
  const { q, category, sort } = await searchParams;
  
  if (!session?.userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { country: true }
  });

  const selectedCountry = user?.country || "US";

  // Fetch categories for the filter bar
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" }
  });

  // Build the where clause
  const where: any = {
    markets: {
      some: {
        country: selectedCountry
      }
    }
  };

  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } }
    ];
  }

  if (category) {
    where.category = { slug: category };
  }

  // Build sorting
  let orderBy: any = { createdAt: "desc" };
  if (sort === "price-low") orderBy = { markets: { _count: "asc" } }; // Simplified, real price sort is complex with Prisma
  if (sort === "price-high") orderBy = { markets: { _count: "desc" } };
  if (sort === "name") orderBy = { title: "asc" };

  const availableProducts = await prisma.product.findMany({
    where,
    include: {
      category: true,
      markets: {
        where: {
          country: selectedCountry
        }
      }
    },
    orderBy: sort === "price-low" || sort === "price-high" ? undefined : orderBy
  });

  // Manual sorting for price since Prisma relational sort on filtered M-M is tricky
  let finalProducts = availableProducts;
  if (sort === "price-low") {
    finalProducts = [...availableProducts].sort((a, b) => (a.markets[0]?.price || 0) - (b.markets[0]?.price || 0));
  } else if (sort === "price-high") {
    finalProducts = [...availableProducts].sort((a, b) => (b.markets[0]?.price || 0) - (a.markets[0]?.price || 0));
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Product Catalogue</h1>
        <p className="text-slate-500 mt-2">Discover our enterprise procurement solutions.</p>
      </div>

      <StoreFilters categories={categories} />

      {finalProducts.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
          <div className="text-4xl mb-4">🔍</div>
          <h2 className="text-xl font-semibold text-slate-700">No products found</h2>
          <p className="text-slate-500 mt-2">Try adjusting your filters or search terms.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {finalProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
