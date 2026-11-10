require('dotenv').config();
const { Client } = require('pg');

// Remove channel_binding if present (pg library doesn't support it yet)
const dbUrl = process.env.DATABASE_URL.replace(/&channel_binding=require/g, '');

const client = new Client({
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false }
});

console.log('🔄 Creating PostgreSQL schema...\n');

const createSchema = async () => {
  try {
    await client.connect();
    console.log('✅ Connected to Neon');

    // Read migration file
    const fs = require('fs');
    const migContent = fs.readFileSync('src/database/migrations/1791706620342-InitialSchema.ts', 'utf8');
    
    // Extract SQL queries
    const queries = [];
    const regex = /queryRunner\.query\(`([^`]+)`\)/g;
    let match;
    while ((match = regex.exec(migContent)) !== null) {
      queries.push(match[1]);
    }

    console.log(`📝 Executing ${queries.length} SQL statements...\n`);

    for (const query of queries) {
      await client.query(query);
    }

    console.log('✅ Schema created\n');

    // Verify
    const result = await client.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name"
    );

    console.log(`📊 Tables: ${result.rows.length}`);
    result.rows.forEach(r => console.log(`   ✅ ${r.table_name}`));

    await client.end();
    console.log('\n✅ Complete');
  } catch (err) {
    console.error('❌ Error:', err.message);
    await client.end();
    process.exit(1);
  }
};

createSchema();
