import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Create Categories
  const hardware = await prisma.category.upsert({
    where: { slug: "hardware" },
    update: {},
    create: { name: "Hardware", slug: "hardware" },
  });

  await prisma.category.upsert({
    where: { slug: "software" },
    update: {},
    create: { name: "Software", slug: "software" },
  });

  // Create Products
  const macbook = await prisma.product.upsert({
    where: { slug: "apple-macbook-air-m2" },
    update: {},
    create: {
      title: "Apple MacBook Air 13.3 inch, M2",
      slug: "apple-macbook-air-m2",
      description: "8-Core CPU, 8-Core GPU, 8GB RAM, 256GB SSD, Midnight",
      price: 999.0,
      imageUrl: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/macbook-air-midnight-select-20220606?wid=904&hei=840&fmt=jpeg&qlt=90&.v=1653084303665",
      categoryId: hardware.id,
      countryRestrictions: [], // Available everywhere
    },
  });

  const surface = await prisma.product.upsert({
    where: { slug: "microsoft-surface-pro-9" },
    update: {},
    create: {
      title: "Microsoft Surface Pro 9",
      slug: "microsoft-surface-pro-9",
      description: "13\" Touch-Screen, Intel Evo Core i5, 8GB RAM, 256GB SSD, Platinum",
      price: 1099.99,
      categoryId: hardware.id,
      countryRestrictions: ["US", "CA"], // Restricted to North America
    },
  });

  await prisma.product.upsert({
    where: { slug: "pixel-8-pro" },
    update: {},
    create: {
      title: "Google Pixel 8 Pro",
      slug: "pixel-8-pro",
      description: "Experience the best of Google AI. Exclusive to India region.",
      price: 999.00,
      imageUrl: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-1inch-naturaltitanium?wid=5120&hei=2880&fmt=p-jpg&qlt=80&.v=1692846542527",
      categoryId: hardware.id,
      countryRestrictions: ["IN"],
    },
  });

  await prisma.product.upsert({
    where: { slug: "apple-vision-pro" },
    update: {},
    create: {
      title: "Apple Vision Pro",
      slug: "apple-vision-pro",
      description: "Welcome to the era of spatial computing. Exclusive to US region.",
      price: 3499.00,
      imageUrl: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/vision-pro-select-202401?wid=940&hei=1112&fmt=png-alpha&qlt=90&.v=1704300305047",
      categoryId: hardware.id,
      countryRestrictions: ["US"],
    },
  });


  // Setup initial inventory
  await prisma.inventory.upsert({
    where: { productId: macbook.id },
    update: {},
    create: {
      productId: macbook.id,
      quantity: 50,
      lowStockAlert: 10,
    },
  });

  await prisma.inventory.upsert({
    where: { productId: surface.id },
    update: {},
    create: {
      productId: surface.id,
      quantity: 20,
      lowStockAlert: 5,
    },
  });

  // Create Sample Purchase Orders
  console.log("Creating sample Purchase Orders...");
  await prisma.purchaseOrder.upsert({
    where: { poNumber: "PO-2026-001" },
    update: {},
    create: {
      poNumber: "PO-2026-001",
      status: "OPEN",
      total: 4500.00,
    },
  });

  await prisma.purchaseOrder.upsert({
    where: { poNumber: "PO-2026-002" },
    update: {},
    create: {
      poNumber: "PO-2026-002",
      status: "IN_PROCESS",
      total: 12500.50,
    },
  });

  await prisma.purchaseOrder.upsert({
    where: { poNumber: "PO-2026-003" },
    update: {},
    create: {
      poNumber: "PO-2026-003",
      status: "CLOSED",
      total: 890.00,
    },
  });


  console.log("Seeding completed successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
