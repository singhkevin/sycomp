"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createProduct(data: {
  title: string;
  slug: string;
  price: number;
  description: string;
  imageUrl: string;
  categoryId: string;
  countryRestrictions: string[];
}) {
  try {
    const product = await prisma.product.create({
      data: {
        title: data.title,
        slug: data.slug,
        price: data.price,
        description: data.description,
        imageUrl: data.imageUrl,
        categoryId: data.categoryId,
        countryRestrictions: data.countryRestrictions,
        inventory: {
          create: {
            quantity: 0,
            lowStockAlert: 5
          }
        }
      }
    });

    revalidatePath("/admin/products");
    revalidatePath("/store");
    return { success: true, product };
  } catch (error) {
    console.error("Failed to create product:", error);
    return { success: false, error: "Failed to create product" };
  }
}

export async function updateProduct(productId: string, data: {
  title: string;
  slug: string;
  price: number;
  description: string;
  imageUrl: string;
  categoryId: string;
  countryRestrictions: string[];
}) {
  try {
    const product = await prisma.product.update({
      where: { id: productId },
      data: {
        title: data.title,
        slug: data.slug,
        price: data.price,
        description: data.description,
        imageUrl: data.imageUrl,
        categoryId: data.categoryId,
        countryRestrictions: data.countryRestrictions,
      }
    });

    revalidatePath("/admin/products");
    revalidatePath("/store");
    revalidatePath(`/store/product/${data.slug}`);
    return { success: true, product };
  } catch (error) {
    console.error("Failed to update product:", error);
    return { success: false, error: "Failed to update product" };
  }
}

export async function deleteProduct(productId: string) {
  try {
    await prisma.product.delete({
      where: { id: productId }
    });
    revalidatePath("/admin/products");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete product:", error);
    return { success: false, error: "Failed to delete product" };
  }
}
