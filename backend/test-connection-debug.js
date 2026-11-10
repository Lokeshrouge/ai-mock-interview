require('dotenv').config();
const { Client } = require('pg');

console.log('DATABASE_URL from env:', process.env.DATABASE_URL ? 'EXISTS' : 'MISSING');
console.log('Length:', process.env.DATABASE_URL ? process.env.DATABASE_URL.length : 0);

if (process.env.DATABASE_URL) {
  const url = process.env.DATABASE_URL;
  console.log('Starts with postgres:', url.startsWith('postgres'));
  console.log('Contains neon:', url.includes('neon'));
  
  // Try connection
  const client = new Client({
    connectionString: url.replace(/&channel_binding=require/g, ''),
    ssl: { rejectUnauthorized: false }
  });
  
  client.connect()
    .then(() => {
      console.log('✅ PASS: Connected');
      return client.end();
    })
    .catch(err => {
      console.log('❌ FAIL:', err.message);
      process.exit(1);
    });
}
