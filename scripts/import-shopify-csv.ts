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
  console.log("Starting CSV import...");
  
  const csvDir = path.join(process.cwd(), "public", "shopify-market-csvs");
  const files = fs.readdirSync(csvDir).filter(f => f.endsWith(".csv"));

  for (const file of files) {
    console.log(`Processing file: ${file}`);
    const filePath = path.join(csvDir, file);
    
    // Extract country name from filename, e.g., "shopify-india.csv" -> "india"
    const match = file.match(/shopify-(.+)\.csv/);
    if (!match) {
      console.warn(`Could not determine country from filename: ${file}, skipping.`);
      continue;
    }
    
    const countryName = match[1];
    const countryCode = countryMap[countryName];
    if (!countryCode) {
      console.warn(`No country code mapping found for: ${countryName}, skipping.`);
      continue;
    }

    const fileContent = fs.readFileSync(filePath, "utf-8");
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      relax_column_count: true,
      bom: true,
    });

    console.log(`Found ${records.length} records in ${file}`);

    for (const record of records) {
      // Handle is required to uniquely identify the product base
      if (!record.Handle || !record.Title) continue;

      // Determine category
      const categoryName = record["Product Category"] || record["Type"] || "General";
      const categorySlug = categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

      // Upsert Category
      const category = await prisma.category.upsert({
        where: { slug: categorySlug },
        update: {},
        create: { name: categoryName, slug: categorySlug },
      });

      // Prepare product fields
      // User requested separate products for each country, so append country code to slug
      const productSlug = `${record.Handle}-${countryCode.toLowerCase()}`;
      const price = parseFloat(record["Variant Price"]) || 0;
      const imageUrl = record["Image Src"] || null;
      const description = record["Body (HTML)"] || null;

      // Upsert Product
      const product = await prisma.product.upsert({
        where: { slug: productSlug },
        update: {
          title: record.Title,
          description: description,
          price: price,
          imageUrl: imageUrl,
          countryRestrictions: [countryCode],
          categoryId: category.id,
        },
        create: {
          title: record.Title,
          slug: productSlug,
          description: description,
          price: price,
          imageUrl: imageUrl,
          countryRestrictions: [countryCode],
          categoryId: category.id,
        },
      });

      // Upsert Inventory
      const inventoryQty = parseInt(record["Variant Inventory Qty"], 10);
      const finalQty = isNaN(inventoryQty) ? 0 : inventoryQty;

      await prisma.inventory.upsert({
        where: { productId: product.id },
        update: {
          quantity: finalQty,
        },
        create: {
          productId: product.id,
          quantity: finalQty,
          lowStockAlert: 5,
        },
      });
    }
    
    console.log(`Completed processing ${file}`);
  }

  console.log("CSV import finished successfully.");
}

main()
  .catch((e) => {
    console.error("Error during CSV import:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
