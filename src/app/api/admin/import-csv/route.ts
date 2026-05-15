import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { stripHtml } from "@/lib/strip-html";

const COUNTRY_CURRENCY_MAP: Record<string, string> = {
  "AU": "AUD", "CN": "CNY", "IN": "INR", "JP": "JPY",
  "PH": "PHP", "ZA": "ZAR", "TW": "TWD", "AE": "AED",
  "US": "USD", "CA": "CAD"
};

export async function POST(req: NextRequest) {
  const session = await verifySession();
  if (!session?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const country = formData.get("country") as string;

    if (!file || !country) {
      return NextResponse.json({ error: "File and country are required" }, { status: 400 });
    }

    if (!COUNTRY_CURRENCY_MAP[country]) {
      return NextResponse.json({ error: "Invalid country code" }, { status: 400 });
    }

    const text = await file.text();
    // Strip BOM if present
    const content = text.startsWith("\uFEFF") ? text.slice(1) : text;
    
    // Robust parsing that handles newlines inside quotes
    const rows: string[][] = [];
    let currentRow: string[] = [];
    let currentField = "";
    let inQuotes = false;

    for (let i = 0; i < content.length; i++) {
      const char = content[i];
      const nextChar = content[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          currentField += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        currentRow.push(currentField);
        currentField = "";
      } else if ((char === '\n' || (char === '\r' && nextChar === '\n')) && !inQuotes) {
        currentRow.push(currentField);
        rows.push(currentRow);
        currentRow = [];
        currentField = "";
        if (char === '\r') i++; // skip the \n
      } else {
        currentField += char;
      }
    }
    // Add last field/row if content doesn't end in newline
    if (currentRow.length > 0 || currentField) {
      currentRow.push(currentField);
      rows.push(currentRow);
    }

    if (rows.length < 2) {
      return NextResponse.json({ error: "CSV file is empty or has no data rows" }, { status: 400 });
    }

    const headers = rows[0].map(h => h.trim());
    
    // Validate required columns
    const required = ["Handle", "Title", "Variant Price"];
    for (const col of required) {
      if (!headers.includes(col)) {
        return NextResponse.json({ error: `Missing required column: "${col}"` }, { status: 400 });
      }
    }

    // Cache categories to reduce DB hits
    const categoryCache = new Map<string, string>();
    const allCategories = await prisma.category.findMany();
    allCategories.forEach(c => categoryCache.set(c.slug, c.id));

    let created = 0;
    let updated = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (let i = 1; i < rows.length; i++) {
      const values = rows[i];
      if (values.length < 3) continue; // Skip empty rows

      const row: Record<string, string> = {};
      headers.forEach((h, idx) => { row[h] = values[idx] || ""; });

      const handle = row["Handle"]?.trim();
      const title = row["Title"]?.trim();
      const priceStr = row["Variant Price"]?.trim();

      if (!handle || !title) { skipped++; continue; }

      const price = parseFloat(priceStr.replace(/[^0-9.]/g, ""));
      if (isNaN(price)) { 
        errors.push(`Row ${i + 1}: Invalid price "${priceStr}" for "${handle}"`);
        skipped++;
        continue;
      }

      try {
        await prisma.$transaction(async (tx) => {
          // Category handling
          const categoryName = row["Product Category"]?.trim() || row["Type"]?.trim() || "General";
          const categorySlug = categoryName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

          let categoryId = categoryCache.get(categorySlug);
          if (!categoryId) {
            const newCategory = await tx.category.upsert({
              where: { slug: categorySlug },
              update: {},
              create: { name: categoryName, slug: categorySlug }
            });
            categoryId = newCategory.id;
            categoryCache.set(categorySlug, categoryId);
          }

          // Upsert Master Product
          const existingProduct = await tx.product.findUnique({ where: { slug: handle } });
          
          let product;
          if (existingProduct) {
            product = await tx.product.update({
              where: { slug: handle },
              data: {
                title,
                description: stripHtml(row["Body (HTML)"]?.trim()) || existingProduct.description,
                imageUrl: row["Image Src"]?.trim() || existingProduct.imageUrl,
                categoryId,
              }
            });
            updated++;
          } else {
            product = await tx.product.create({
              data: {
                title,
                slug: handle,
                description: stripHtml(row["Body (HTML)"]?.trim()) || null,
                imageUrl: row["Image Src"]?.trim() || null,
                categoryId,
              }
            });
            created++;
          }

          // Upsert ProductMarket Variation
          const sku = row["Variant SKU"]?.trim() || `${handle}-${country.toLowerCase()}`;
          const existingMarket = await tx.productMarket.findUnique({
            where: { productId_country: { productId: product.id, country } }
          });

          let market;
          if (existingMarket) {
            market = await tx.productMarket.update({
              where: { id: existingMarket.id },
              data: { price, sku }
            });
          } else {
            market = await tx.productMarket.create({
              data: { productId: product.id, country, price, sku }
            });
          }

          // Upsert Inventory
          const qty = parseInt(row["Variant Inventory Qty"] || "0", 10);
          const finalQty = isNaN(qty) ? 0 : qty;

          await tx.inventory.upsert({
            where: { productMarketId: market.id },
            update: { quantity: finalQty },
            create: { productMarketId: market.id, quantity: finalQty, lowStockAlert: 5 }
          });
        });

      } catch (err) {
        errors.push(`Row ${i + 1} (${handle}): ${err instanceof Error ? err.message : "Unknown error"}`);
        skipped++;
      }
    }

    revalidatePath("/admin/products");
    revalidatePath("/store");

    return NextResponse.json({
      success: true,
      summary: { created, updated, skipped, errors }
    });

  } catch (err) {
    console.error("CSV import error:", err);
    return NextResponse.json({ error: "Failed to process CSV file" }, { status: 500 });
  }
}
