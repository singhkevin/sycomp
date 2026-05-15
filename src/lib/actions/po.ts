"use server";

import { prisma } from "@/lib/prisma";
import { POStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/session";

export async function updatePOStatus(poId: string, status: POStatus) {
  try {
    const session = await verifySession();
    if (!session?.userId) {
      return { success: false, error: "Not authenticated" };
    }

    // Always verify role from DB — JWT may be stale
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { role: true },
    });

    if (!user || user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized: Admin access required" };
    }

    if (!poId) {
      return { success: false, error: "Purchase Order ID is required" };
    }

    await prisma.purchaseOrder.update({
      where: { id: poId },
      data: { status },
    });
    
    console.log(`[PO UPDATE] ID: ${poId} | New Status: ${status}`);

    // Revalidate multiple levels to ensure UI consistency
    revalidatePath("/admin/po", "layout");
    revalidatePath("/admin/po/[status]", "page");
    revalidatePath(`/admin/po/details/${poId}`, "page");
    
    return { success: true };
  } catch (error) {
    console.error("Failed to update PO status:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to update status" 
    };
  }
}

export async function createPurchaseOrder(data: {
  country: string;
  total: number;
  items: {
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[];
}) {
  try {
    const session = await verifySession();
    if (!session) {
      return { success: false, error: "Unauthorized" };
    }
    const poCount = await prisma.purchaseOrder.count();
    const poNumber = `PO-${new Date().getFullYear()}-${(poCount + 1).toString().padStart(3, '0')}`;

    const po = await prisma.purchaseOrder.create({
      data: {
        poNumber,
        userId: session.userId,
        country: data.country,
        total: data.total,
        status: "OPEN",
        items: {
          create: data.items
        }
      }
    });

    revalidatePath("/admin/po/open");
    return { success: true, poId: po.id };
  } catch (error) {
    console.error("Failed to create Purchase Order:", error);
    return { success: false, error: "Failed to create PO" };
  }
}
