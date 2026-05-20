import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import * as dotenv from "dotenv";

dotenv.config();

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Analyzing current database connection...");

  // Query counts for all major tables
  const userCount = await prisma.user.count();
  const categoryCount = await prisma.category.count();
  const productCount = await prisma.product.count();
  const productMarketCount = await prisma.productMarket.count();
  const inventoryCount = await prisma.inventory.count();
  const cartCount = await prisma.cart.count();
  const cartItemCount = await prisma.cartItem.count();
  const orderCount = await prisma.order.count();
  const orderItemCount = await prisma.orderItem.count();
  const purchaseOrderCount = await prisma.purchaseOrder.count();
  const purchaseOrderItemCount = await prisma.purchaseOrderItem.count();

  console.log("\n--- DATABASE TABLES SUMMARY ---");
  console.log(`User: ${userCount} records`);
  console.log(`Category: ${categoryCount} records`);
  console.log(`Product: ${productCount} records`);
  console.log(`ProductMarket: ${productMarketCount} records`);
  console.log(`Inventory: ${inventoryCount} records`);
  console.log(`Cart: ${cartCount} records`);
  console.log(`CartItem: ${cartItemCount} records`);
  console.log(`Order: ${orderCount} records`);
  console.log(`OrderItem: ${orderItemCount} records`);
  console.log(`PurchaseOrder: ${purchaseOrderCount} records`);
  console.log(`PurchaseOrderItem: ${purchaseOrderItemCount} records`);

  console.log("\n--- SAMPLE DATA SAMPLES ---");
  
  if (userCount > 0) {
    const sampleUsers = await prisma.user.findMany({ take: 3 });
    console.log("\nSample Users:", JSON.stringify(sampleUsers, null, 2));
  }

  if (categoryCount > 0) {
    const sampleCategories = await prisma.category.findMany({ take: 3 });
    console.log("\nSample Categories:", JSON.stringify(sampleCategories, null, 2));
  }

  if (productCount > 0) {
    const sampleProducts = await prisma.product.findMany({ take: 2, include: { category: true } });
    console.log("\nSample Products:", JSON.stringify(sampleProducts, null, 2));
  }

  if (purchaseOrderCount > 0) {
    const samplePOs = await prisma.purchaseOrder.findMany({ take: 2, include: { items: true } });
    console.log("\nSample Purchase Orders:", JSON.stringify(samplePOs, null, 2));
  }
}

main()
  .catch((e) => {
    console.error("Analysis failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
