import pg from "pg";

const sourceURL = "postgresql://postgres:ubI77cskbAyjLrNT@db.sqotrbsaowvcdnmcqwjf.supabase.co:5432/postgres";
const targetURL = "postgresql://postgres:vrUjP%2F9Kmr8%26gMc@db.jrxuefjnipeknfyjpdkb.supabase.co:5432/postgres";

async function main() {
  console.log("🚀 Starting database data migration...");
  console.log("Source Database:", "db.sqotrbsaowvcdnmcqwjf.supabase.co");
  console.log("Target Database:", "db.jrxuefjnipeknfyjpdkb.supabase.co");

  const sourcePool = new pg.Pool({ connectionString: sourceURL });
  const targetPool = new pg.Pool({ connectionString: targetURL });

  const sourceClient = await sourcePool.connect();
  const targetClient = await targetPool.connect();

  try {
    // 1. Temporarily disable foreign key constraints on target db using session_replication_role = replica
    console.log("\n⚠️ Setting target session_replication_role to replica (bypassing FK constraints)...");
    await targetClient.query("SET session_replication_role = replica;");

    // Tables to migrate
    const tables = [
      "User",
      "Category",
      "Product",
      "ProductMarket",
      "Inventory",
      "Cart",
      "CartItem",
      "Order",
      "OrderItem",
      "PurchaseOrder",
      "PurchaseOrderItem"
    ];

    for (const table of tables) {
      console.log(`\n--------------------------------------------`);
      console.log(`📋 Migrating table: "${table}"`);

      // Get columns and data from source
      const sourceDataRes = await sourceClient.query(`SELECT * FROM "${table}";`);
      const rows = sourceDataRes.rows;
      console.log(`   Found ${rows.length} rows in source.`);

      if (rows.length === 0) {
        console.log(`   No data to migrate for "${table}". Skipping.`);
        continue;
      }

      // Clear existing records in target just in case
      await targetClient.query(`TRUNCATE TABLE "${table}" CASCADE;`);

      // Build batch insert query
      const columns = Object.keys(rows[0]).map(col => `"${col}"`).join(", ");
      const colNames = Object.keys(rows[0]);

      console.log(`   Inserting ${rows.length} rows into target...`);
      
      // We will perform insert one by one or in small batches to be absolutely safe and handle complex objects easily
      for (const row of rows) {
        const values = colNames.map(col => row[col]);
        const placeholders = colNames.map((_, idx) => `$${idx + 1}`).join(", ");
        const insertQuery = `INSERT INTO "${table}" (${columns}) VALUES (${placeholders});`;
        await targetClient.query(insertQuery, values);
      }

      console.log(`   ✅ Successfully migrated "${table}".`);
    }

    // Restore standard constraints checks
    console.log(`\n--------------------------------------------`);
    console.log("🔄 Restoring target session_replication_role to origin...");
    await targetClient.query("SET session_replication_role = origin;");

    console.log("\n🎉 Migration completed successfully!");

  } catch (err: any) {
    console.error("\n❌ Migration failed during execution:", err);
    try {
      console.log("🔄 Safety Cleanup: Restoring session_replication_role to origin...");
      await targetClient.query("SET session_replication_role = origin;");
    } catch (cleanupErr) {
      console.error("Failed to restore session_replication_role:", cleanupErr);
    }
  } finally {
    sourceClient.release();
    targetClient.release();
    await sourcePool.end();
    await targetPool.end();
  }
}

main().catch(console.error);
