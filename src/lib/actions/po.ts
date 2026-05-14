"use server";

import { prisma } from "@/lib/prisma";
import { POStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

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
