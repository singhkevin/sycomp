"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { stripHtml } from "@/lib/strip-html";

export async function createProduct(data: {
  title: string;
  slug: string;
  description: string;
  imageUrl: string;
  categoryId: string;
  markets: { country: string; price: number; sku?: string; quantity: number }[];
}) {
  try {
    const product = await prisma.product.create({
      data: {
        title: data.title,
        slug: data.slug,
        description: stripHtml(data.description),
        imageUrl: data.imageUrl,
        categoryId: data.categoryId,
        markets: {
          create: data.markets.map(m => ({
            country: m.country,
            price: m.price,
            sku: m.sku,
            inventory: {
              create: {
                quantity: m.quantity,
                lowStockAlert: 5
              }
            }
          }))
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
  description: string;
  imageUrl: string;
  categoryId: string;
  markets: { country: string; price: number; sku?: string; quantity: number }[];
}) {
  try {
    // Delete existing markets and recreate for simplicity (or we could upsert)
    await prisma.productMarket.deleteMany({
      where: { productId }
    });

    const product = await prisma.product.update({
      where: { id: productId },
      data: {
        title: data.title,
        slug: data.slug,
        description: stripHtml(data.description),
        imageUrl: data.imageUrl,
        categoryId: data.categoryId,
        markets: {
          create: data.markets.map(m => ({
            country: m.country,
            price: m.price,
            sku: m.sku,
            inventory: {
              create: {
                quantity: m.quantity,
                lowStockAlert: 5
              }
            }
          }))
        }
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
