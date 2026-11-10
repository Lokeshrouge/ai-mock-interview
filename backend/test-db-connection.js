/**
 * Database Connection Test Script
 * Tests PostgreSQL connection with the configured DATABASE_URL
 * Run: node test-db-connection.js
 */

require('dotenv').config();
const { Client } = require('pg');

async function testConnection() {
  const databaseUrl = process.env.DATABASE_URL;

  console.log('🔍 Testing Database Connection...\n');

  if (!databaseUrl) {
    console.error('❌ ERROR: DATABASE_URL not set in .env file');
    process.exit(1);
  }

  // Mask password for logging (show only essential info)
  const urlObj = new URL(databaseUrl.replace('postgresql://', 'http://'));
  const dbType = databaseUrl.startsWith('postgresql') ? 'PostgreSQL' : 'SQLite';
  const host = urlObj.hostname;
  const database = urlObj.pathname.slice(1);
  
  console.log(`📡 Connecting to: ${dbType}`);
  console.log(`   Host: ${host}`);
  console.log(`   Database: ${database}\n`);

  const client = new Client({
    connectionString: databaseUrl,
    ssl: databaseUrl.includes('sslmode=require') || databaseUrl.includes('neon.tech')
      ? { rejectUnauthorized: false }
      : false,
  });

  try {
    // Attempt connection
    await client.connect();
    console.log('✅ Database connection successful!\n');

    // Test query
    const result = await client.query('SELECT version(), current_database(), current_user');
    console.log('📊 Database Information:');
    console.log('   Version:', result.rows[0].version.split('\n')[0]);
    console.log('   Database:', result.rows[0].current_database);
    console.log('   User:', result.rows[0].current_user);
    console.log();

    // Check if tables exist
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);

    if (tablesResult.rows.length > 0) {
      console.log('📋 Existing tables:');
      tablesResult.rows.forEach(row => console.log(`   - ${row.table_name}`));
    } else {
      console.log('⚠️  No tables found. Database is empty (this is normal for a new database).');
      console.log('   Run migrations to create tables: npm run migration:run');
    }
    console.log();

    await client.end();
    console.log('✅ All tests passed! Database is ready.\n');
    process.exit(0);

  } catch (error) {
    console.error('❌ Connection failed:\n');
    
    if (error.code === 'ENOTFOUND') {
      console.error('   Error: Host not found');
      console.error('   Check: Verify the database host is correct in DATABASE_URL');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('   Error: Connection refused');
      console.error('   Check: Database server may be down or firewall blocking connection');
    } else if (error.message.includes('password authentication failed')) {
      console.error('   Error: Invalid credentials');
      console.error('   Check: Verify username and password in DATABASE_URL');
    } else if (error.message.includes('no pg_hba.conf entry')) {
      console.error('   Error: SSL/Authentication issue');
      console.error('   Check: Database may require SSL or different auth method');
    } else {
      console.error('   Error:', error.message);
    }
    
    console.error('\n🔧 Troubleshooting:');
    console.error('   1. Verify DATABASE_URL in backend/.env file');
    console.error('   2. Check Neon dashboard for correct connection string');
    console.error('   3. Ensure database is active (Neon free tier auto-suspends)');
    console.error('   4. Test connection string with: psql "<connection-string>"\n');
    
    await client.end();
    process.exit(1);
  }
}

testConnection();
