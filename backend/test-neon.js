require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

client.connect()
  .then(() => {
    console.log('✅ PASS: Neon connection successful');
    return client.query('SELECT version(), current_database()');
  })
  .then(result => {
    console.log('Database:', result.rows[0].current_database);
    return client.query("SELECT COUNT(*)::int FROM information_schema.tables WHERE table_schema='public'");
  })
  .then(result => {
    console.log('Tables:', result.rows[0].count);
    return client.end();
  })
  .catch(err => {
    console.log('❌ FAIL:', err.message);
    process.exit(1);
  });
