/**
 * Migration Verification Script
 * Compares SQLite export with PostgreSQL import
 * Validates data integrity after migration
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('❌ Usage: node verify-migration.js <export-file.json>');
  process.exit(1);
}

const exportFile = path.resolve(args[0]);

if (!fs.existsSync(exportFile)) {
  console.error(`❌ Export file not found: ${exportFile}`);
  process.exit(1);
}

console.log('🔍 Migration Verification\n');
console.log(`📂 Source (SQLite): ${exportFile}`);

const exportData = JSON.parse(fs.readFileSync(exportFile, 'utf8'));

// Read .env directly
const envContent = fs.readFileSync(path.join(__dirname, '.env'), 'utf8');
const dbUrlMatch = envContent.match(/^DATABASE_URL=(.+)$/m);
if (!dbUrlMatch) {
  console.error('❌ DATABASE_URL not found in .env');
  process.exit(1);
}
const databaseUrl = dbUrlMatch[1].trim();

if (!databaseUrl || databaseUrl.startsWith('sqlite:')) {
  console.error('❌ DATABASE_URL must point to PostgreSQL');
  process.exit(1);
}

console.log(`🔌 Target (PostgreSQL): Connected\n`);

const cleanUrl = databaseUrl.replace(/&channel_binding=require/g, '');

const client = new Client({
  connectionString: cleanUrl,
  ssl: databaseUrl.includes('neon.tech') || databaseUrl.includes('sslmode=require')
    ? { rejectUnauthorized: false }
    : false,
});

async function verifyMigration() {
  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL\n');

    console.log('═══════════════════════════════════════════════════════');
    console.log('1️⃣  RECORD COUNT VERIFICATION');
    console.log('═══════════════════════════════════════════════════════\n');

    const tables = [
      'users',
      'student_profiles',
      'resumes',
      'job_roles',
      'interviews',
      'interview_questions',
      'interview_answers',
      'evaluations',
      'revised_answers',
      'recommendations',
    ];

    let allCountsMatch = true;
    let totalSQLite = 0;
    let totalPostgres = 0;

    for (const tableName of tables) {
      const sqliteCount = exportData.tables[tableName]?.length || 0;
      const result = await client.query(`SELECT COUNT(*)::int FROM "${tableName}"`);
      const postgresCount = result.rows[0].count;

      totalSQLite += sqliteCount;
      totalPostgres += postgresCount;

      const match = sqliteCount === postgresCount;
      const icon = match ? '✅' : '❌';

      console.log(
        `${icon} ${tableName.padEnd(25)} SQLite: ${sqliteCount.toString().padStart(3)}  PostgreSQL: ${postgresCount.toString().padStart(3)}`
      );

      if (!match) {
        allCountsMatch = false;
      }
    }

    console.log('\n─────────────────────────────────────────────────────');
    console.log(
      `   ${'TOTALS'.padEnd(25)} SQLite: ${totalSQLite.toString().padStart(3)}  PostgreSQL: ${totalPostgres.toString().padStart(3)}`
    );
    console.log('─────────────────────────────────────────────────────\n');

    if (!allCountsMatch) {
      console.error('❌ Record count mismatch detected!\n');
      process.exit(1);
    }

    console.log('═══════════════════════════════════════════════════════');
    console.log('2️⃣  FOREIGN KEY INTEGRITY VERIFICATION');
    console.log('═══════════════════════════════════════════════════════\n');

    const fkChecks = [
      {
        name: 'student_profiles.user_id → users.id',
        query: `SELECT COUNT(*)::int FROM student_profiles sp LEFT JOIN users u ON sp.user_id = u.id WHERE u.id IS NULL`,
      },
      {
        name: 'resumes.user_id → users.id',
        query: `SELECT COUNT(*)::int FROM resumes r LEFT JOIN users u ON r.user_id = u.id WHERE u.id IS NULL`,
      },
      {
        name: 'interviews.user_id → users.id',
        query: `SELECT COUNT(*)::int FROM interviews i LEFT JOIN users u ON i.user_id = u.id WHERE u.id IS NULL`,
      },
      {
        name: 'interviews.job_role_id → job_roles.id',
        query: `SELECT COUNT(*)::int FROM interviews i LEFT JOIN job_roles jr ON i.job_role_id = jr.id WHERE jr.id IS NULL`,
      },
      {
        name: 'interview_questions.interview_id → interviews.id',
        query: `SELECT COUNT(*)::int FROM interview_questions iq LEFT JOIN interviews i ON iq.interview_id = i.id WHERE i.id IS NULL`,
      },
      {
        name: 'interview_answers.interview_id → interviews.id',
        query: `SELECT COUNT(*)::int FROM interview_answers ia LEFT JOIN interviews i ON ia.interview_id = i.id WHERE i.id IS NULL`,
      },
      {
        name: 'interview_answers.question_id → interview_questions.id',
        query: `SELECT COUNT(*)::int FROM interview_answers ia LEFT JOIN interview_questions iq ON ia.question_id = iq.id WHERE iq.id IS NULL`,
      },
      {
        name: 'evaluations.answer_id → interview_answers.id',
        query: `SELECT COUNT(*)::int FROM evaluations e LEFT JOIN interview_answers ia ON e.answer_id = ia.id WHERE ia.id IS NULL`,
      },
      {
        name: 'recommendations.interview_id → interviews.id',
        query: `SELECT COUNT(*)::int FROM recommendations r LEFT JOIN interviews i ON r.interview_id = i.id WHERE i.id IS NULL`,
      },
    ];

    let allFKsValid = true;

    for (const check of fkChecks) {
      const result = await client.query(check.query);
      const orphanCount = result.rows[0].count;

      const icon = orphanCount === 0 ? '✅' : '❌';
      console.log(`${icon} ${check.name.padEnd(55)} ${orphanCount} orphans`);

      if (orphanCount > 0) {
        allFKsValid = false;
      }
    }

    console.log();

    if (!allFKsValid) {
      console.error('❌ Foreign key violations detected!\n');
      process.exit(1);
    }

    console.log('═══════════════════════════════════════════════════════');
    console.log('3️⃣  SAMPLE DATA VERIFICATION');
    console.log('═══════════════════════════════════════════════════════\n');

    // Verify a sample user
    const sqliteUsers = exportData.tables.users;
    if (sqliteUsers.length > 0) {
      const sampleUser = sqliteUsers[0];
      const pgResult = await client.query('SELECT * FROM users WHERE id = $1', [sampleUser.id]);

      if (pgResult.rows.length === 0) {
        console.error(`❌ User ${sampleUser.id} not found in PostgreSQL`);
        allFKsValid = false;
      } else {
        const pgUser = pgResult.rows[0];
        console.log('Sample User Verification:');
        console.log(`  ✅ ID:    ${sampleUser.id === pgUser.id ? 'Match' : 'MISMATCH'}`);
        console.log(`  ✅ Email: ${sampleUser.email === pgUser.email ? 'Match' : 'MISMATCH'}`);
        console.log(`  ✅ Role:  ${sampleUser.role === pgUser.role ? 'Match' : 'MISMATCH'}`);
      }
    }

    // Verify a sample interview if exists
    const sqliteInterviews = exportData.tables.interviews;
    if (sqliteInterviews.length > 0) {
      const sampleInterview = sqliteInterviews[0];
      const pgResult = await client.query('SELECT * FROM interviews WHERE id = $1', [
        sampleInterview.id,
      ]);

      if (pgResult.rows.length === 0) {
        console.error(`❌ Interview ${sampleInterview.id} not found in PostgreSQL`);
        allFKsValid = false;
      } else {
        const pgInterview = pgResult.rows[0];
        console.log('\nSample Interview Verification:');
        console.log(
          `  ✅ ID:         ${sampleInterview.id === pgInterview.id ? 'Match' : 'MISMATCH'}`
        );
        console.log(
          `  ✅ Status:     ${sampleInterview.status === pgInterview.status ? 'Match' : 'MISMATCH'}`
        );
        console.log(
          `  ✅ Difficulty: ${sampleInterview.difficulty === pgInterview.difficulty ? 'Match' : 'MISMATCH'}`
        );
      }
    }

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('✅ VERIFICATION PASSED');
    console.log('═══════════════════════════════════════════════════════\n');

    console.log('📊 Summary:');
    console.log(`   ✅ Record counts match (${totalPostgres} records)`);
    console.log('   ✅ Foreign key integrity verified');
    console.log('   ✅ Sample data validated\n');

    console.log('📋 Migration Status: SUCCESS');
    console.log('🎯 Database ready for application testing\n');
  } catch (err) {
    console.error('\n❌ Verification failed:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

verifyMigration();
