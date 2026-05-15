import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import * as fs from "fs";
import * as path from "path";
import { parse } from "csv-parse/sync";

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const countryMap: Record<string, string> = {
  "australia": "AU",
  "china": "CN",
  "india": "IN",
  "japan": "JP",
  "philippines": "PH",
  "south-africa": "ZA",
  "taiwan": "TW",
  "uae": "AE",
};

async function main() {
  console.log("Starting CSV import into Unified Product model...");
  
  const csvDir = path.join(process.cwd(), "public", "shopify-market-csvs");
  if (!fs.existsSync(csvDir)) {
    console.error(`CSV directory not found: ${csvDir}`);
    return;
  }
  
  const files = fs.readdirSync(csvDir).filter(f => f.endsWith(".csv"));

  for (const file of files) {
    console.log(`Processing file: ${file}`);
    const filePath = path.join(csvDir, file);
    
    const match = file.match(/shopify-(.+)\.csv/);
    if (!match) continue;
    
    const countryName = match[1];
    const countryCode = countryMap[countryName];
    if (!countryCode) continue;

    const fileContent = fs.readFileSync(filePath, "utf-8");
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      relax_column_count: true,
      bom: true,
    }) as Record<string, string>[];

    for (const record of records) {
      if (!record.Handle || !record.Title) continue;

      const categoryName = record["Product Category"] || record["Type"] || "General";
      const categorySlug = categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

      const category = await prisma.category.upsert({
        where: { slug: categorySlug },
        update: {},
        create: { name: categoryName, slug: categorySlug },
      });

      // 1. Upsert Master Product (Global Info)
      const masterProduct = await prisma.product.upsert({
        where: { slug: record.Handle },
        update: {
          title: record.Title,
          description: record["Body (HTML)"] || null,
          imageUrl: record["Image Src"] || null,
          categoryId: category.id,
        },
        create: {
          title: record.Title,
          slug: record.Handle,
          description: record["Body (HTML)"] || null,
          imageUrl: record["Image Src"] || null,
          categoryId: category.id,
        },
      });

      // 2. Upsert ProductMarket Variation
      const price = parseFloat(record["Variant Price"]) || 0;
      const sku = record["Variant SKU"] || `${record.Handle}-${countryCode.toLowerCase()}`;

      const marketVariation = await prisma.productMarket.upsert({
        where: {
          productId_country: {
            productId: masterProduct.id,
            country: countryCode,
          }
        },
        update: {
          price: price,
          sku: sku,
        },
        create: {
          productId: masterProduct.id,
          country: countryCode,
          price: price,
          sku: sku,
        },
      });

      // 3. Upsert Inventory for this specific variation
      const inventoryQty = parseInt(record["Variant Inventory Qty"], 10);
      const finalQty = isNaN(inventoryQty) ? 0 : inventoryQty;

      await prisma.inventory.upsert({
        where: { productMarketId: marketVariation.id },
        update: {
          quantity: finalQty,
        },
        create: {
          productMarketId: marketVariation.id,
          quantity: finalQty,
          lowStockAlert: 5,
        },
      });
    }
    
    console.log(`Completed processing ${file}`);
  }

  console.log("Unified CSV import finished successfully.");
}

main()
  .catch((e) => {
    console.error("Error during CSV import:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
