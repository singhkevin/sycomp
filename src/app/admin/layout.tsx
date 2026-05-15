import { verifySession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";

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
    <div className="flex min-h-screen bg-slate-950 text-slate-50 dark">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader user={user} />
        <main className="flex-1 overflow-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
