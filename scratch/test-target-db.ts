import pg from "pg";

const passwordEncoded = encodeURIComponent("vrUjP/9Kmr8&gMc");

const connectionDirectURL = `postgresql://postgres:${passwordEncoded}@db.jrxuefjnipeknfyjpdkb.supabase.co:5432/postgres`;

async function testConnection(url: string, label: string) {
  console.log(`Testing ${label}...`);
  const pool = new pg.Pool({ connectionString: url, connectionTimeoutMillis: 5000 });
  try {
    const client = await pool.connect();
    const res = await client.query("SELECT version();");
    console.log(`✅ Success for ${label}:`, res.rows[0].version.substring(0, 40));
    client.release();
    await pool.end();
    return true;
  } catch (err: any) {
    console.log(`❌ Failed for ${label}:`, err.message);
    await pool.end();
    return false;
  }
}

async function main() {
  await testConnection(connectionDirectURL, "Direct Host on Port 5432 with standard 'postgres' username");
}

main().catch(console.error);
