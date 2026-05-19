import { verifySession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";
import { Footer } from "@/components/footer";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await verifySession();
  
  if (!session?.userId || session.role !== "ADMIN") {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex flex-col min-h-screen bg-white text-slate-900">
      <div className="flex flex-1 min-h-0">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <AdminHeader user={user} />
          <main className="flex-1 p-4 md:p-8">
            {children}
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
}
