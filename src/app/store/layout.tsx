import { verifySession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { StoreNav } from "@/components/store/store-nav";
import { CountryEnforcer } from "@/components/store/country-enforcer";
import { Footer } from "@/components/footer";

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await verifySession();
  
  if (!session?.userId) {
    redirect("/login");
  }

  // Fetch full user details to check country
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
  });

  if (!user) {
    redirect("/login");
  }
  
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <StoreNav user={user} />
      <CountryEnforcer currentCountry={user.country} />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
