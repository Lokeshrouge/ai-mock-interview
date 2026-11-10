/**
 * JSON to PostgreSQL Import Script
 * Imports exported SQLite data into Neon PostgreSQL
 * Uses transactions for safety - rolls back on any error
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('❌ Usage: node import-json-to-postgres.js <export-file.json>');
  process.exit(1);
}

const exportFile = path.resolve(args[0]);

if (!fs.existsSync(exportFile)) {
  console.error(`❌ Export file not found: ${exportFile}`);
  process.exit(1);
}

console.log('📥 PostgreSQL Data Import\n');
console.log(`📂 Import file: ${exportFile}`);

// Read and validate export file
let exportData;
try {
  exportData = JSON.parse(fs.readFileSync(exportFile, 'utf8'));
  console.log(`✅ Export file loaded: ${exportData.recordCount} records\n`);
} catch (err) {
  console.error('❌ Error reading export file:', err.message);
  process.exit(1);
}

// Read .env file directly
const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const dbUrlMatch = envContent.match(/^DATABASE_URL=(.+)$/m);

if (!dbUrlMatch) {
  console.error('❌ DATABASE_URL not found in .env');
  process.exit(1);
}

const databaseUrl = dbUrlMatch[1].trim();

if (!databaseUrl || databaseUrl.startsWith('sqlite:')) {
  console.error('❌ DATABASE_URL must point to PostgreSQL');
  console.error('   Current value:', databaseUrl.substring(0, 30) + '...');
  console.error('\n   Update backend/.env with your Neon connection string');
  process.exit(1);
}

console.log('🔌 Connecting to PostgreSQL...');

const cleanUrl = databaseUrl.replace(/&channel_binding=require/g, '');

const client = new Client({
  connectionString: cleanUrl,
  ssl: databaseUrl.includes('neon.tech') || databaseUrl.includes('sslmode=require')
    ? { rejectUnauthorized: false }
    : false,
});

async function importData() {
  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL\n');

    // Start transaction
    console.log('🔐 Starting transaction...\n');
    await client.query('BEGIN');

    // Import tables in dependency order
    const tables = [
      'users',
      'job_roles',
      'student_profiles',
      'resumes',
      'interviews',
      'interview_questions',
      'interview_answers',
      'evaluations',
      'revised_answers',
      'recommendations',
    ];

    let totalImported = 0;

    for (const tableName of tables) {
      const records = exportData.tables[tableName];

      if (!records || records.length === 0) {
        console.log(`⏭️  ${tableName.padEnd(25)} (empty, skipping)`);
        continue;
      }

      console.log(`⏳ Importing ${tableName}...`);

      // Get column names from first record
      const columns = Object.keys(records[0]);

      // Build INSERT statement with placeholders
      const placeholders = records
        .map((_, recordIdx) => {
          const valuePlaceholders = columns
            .map((_, colIdx) => `$${recordIdx * columns.length + colIdx + 1}`)
            .join(', ');
          return `(${valuePlaceholders})`;
        })
        .join(', ');

      const insertQuery = `
        INSERT INTO "${tableName}" (${columns.map((c) => `"${c}"`).join(', ')})
        VALUES ${placeholders}
      `;

      // Flatten values array
      const values = records.flatMap((record) => columns.map((col) => record[col]));

      try {
        await client.query(insertQuery, values);
        console.log(`✅ ${tableName.padEnd(25)} ${records.length} records imported`);
        totalImported += records.length;
      } catch (err) {
        console.error(`\n❌ Error importing ${tableName}:`, err.message);
        throw err;
      }
    }

    console.log('\n─────────────────────────────────────');
    console.log(`📊 Total Imported: ${totalImported} records`);
    console.log('─────────────────────────────────────\n');

    // Validate foreign keys
    console.log('🔍 Validating foreign keys...\n');

    const fkChecks = [
      {
        name: 'student_profiles → users',
        query: `SELECT COUNT(*) FROM student_profiles sp LEFT JOIN users u ON sp.user_id = u.id WHERE u.id IS NULL`,
      },
      {
        name: 'resumes → users',
        query: `SELECT COUNT(*) FROM resumes r LEFT JOIN users u ON r.user_id = u.id WHERE u.id IS NULL`,
      },
      {
        name: 'interviews → users',
        query: `SELECT COUNT(*) FROM interviews i LEFT JOIN users u ON i.user_id = u.id WHERE u.id IS NULL`,
      },
      {
        name: 'interviews → job_roles',
        query: `SELECT COUNT(*) FROM interviews i LEFT JOIN job_roles jr ON i.job_role_id = jr.id WHERE jr.id IS NULL`,
      },
      {
        name: 'interview_questions → interviews',
        query: `SELECT COUNT(*) FROM interview_questions iq LEFT JOIN interviews i ON iq.interview_id = i.id WHERE i.id IS NULL`,
      },
      {
        name: 'interview_answers → interviews',
        query: `SELECT COUNT(*) FROM interview_answers ia LEFT JOIN interviews i ON ia.interview_id = i.id WHERE i.id IS NULL`,
      },
      {
        name: 'interview_answers → questions',
        query: `SELECT COUNT(*) FROM interview_answers ia LEFT JOIN interview_questions iq ON ia.question_id = iq.id WHERE iq.id IS NULL`,
      },
      {
        name: 'evaluations → answers',
        query: `SELECT COUNT(*) FROM evaluations e LEFT JOIN interview_answers ia ON e.answer_id = ia.id WHERE ia.id IS NULL`,
      },
    ];

    let allValid = true;
    for (const check of fkChecks) {
      const result = await client.query(check.query);
      const orphanCount = parseInt(result.rows[0].count);

      if (orphanCount > 0) {
        console.error(`❌ ${check.name}: ${orphanCount} orphaned records`);
        allValid = false;
      } else {
        console.log(`✅ ${check.name.padEnd(35)} valid`);
      }
    }

    if (!allValid) {
      throw new Error('Foreign key validation failed');
    }

    console.log('\n✅ All foreign keys valid!\n');

    // Commit transaction
    console.log('💾 Committing transaction...');
    await client.query('COMMIT');
    console.log('✅ Transaction committed!\n');

    // Final verification
    console.log('📊 Final Record Counts:\n');
    for (const tableName of tables) {
      const result = await client.query(`SELECT COUNT(*) FROM "${tableName}"`);
      const count = parseInt(result.rows[0].count);
      const expected = exportData.tables[tableName]?.length || 0;
      const status = count === expected ? '✅' : '❌';
      console.log(`   ${status} ${tableName.padEnd(25)} ${count} / ${expected}`);
    }

    console.log('\n════════════════════════════════════════');
    console.log('✅ IMPORT COMPLETED SUCCESSFULLY!');
    console.log('════════════════════════════════════════\n');

    console.log('📋 Next Steps:');
    console.log('  1. Test backend connection: npm run start:dev');
    console.log('  2. Verify health endpoint: curl http://localhost:3001/api/v1/health');
    console.log('  3. Test login with existing user credentials');
    console.log('  4. Run comprehensive application tests\n');
  } catch (err) {
    console.error('\n════════════════════════════════════════');
    console.error('❌ IMPORT FAILED');
    console.error('════════════════════════════════════════\n');
    console.error('Error:', err.message);

    console.log('\n🔄 Rolling back transaction...');
    try {
      await client.query('ROLLBACK');
      console.log('✅ Transaction rolled back');
      console.log('📊 PostgreSQL database unchanged\n');
    } catch (rollbackErr) {
      console.error('❌ Rollback error:', rollbackErr.message);
    }

    console.log('💡 Troubleshooting:');
    console.log('  1. Review error message above');
    console.log('  2. Check export file integrity');
    console.log('  3. Verify PostgreSQL schema matches entities');
    console.log('  4. Ensure no data in PostgreSQL before import');
    console.log('  5. Check Neon dashboard for connection issues\n');

    process.exit(1);
  } finally {
    await client.end();
  }
}

importData();
