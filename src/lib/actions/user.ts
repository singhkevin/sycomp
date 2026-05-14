"use server";

import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/session";
import { revalidatePath } from "next/cache";

export async function updateUserCountry(country: string) {
  const session = await verifySession();
  
  if (!session?.userId) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await prisma.user.update({
      where: { id: session.userId },
      data: { country },
    });

    revalidatePath("/store");
    return { success: true };
  } catch (error) {
    console.error("Failed to update country:", error);
    return { success: false, error: "Failed to update country" };
  }
}
