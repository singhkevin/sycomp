"use server";

import { prisma } from "@/lib/prisma";
import { POStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/session";

export async function updatePOStatus(poId: string, status: POStatus) {
  try {
    await prisma.purchaseOrder.update({
      where: { id: poId },
      data: { status },
    });
    
    revalidatePath("/admin/po/[status]", "page");
    return { success: true };
  } catch (error) {
    console.error("Failed to update PO status:", error);
    return { success: false, error: "Failed to update status" };
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
