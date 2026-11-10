const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function verifySchema() {
  // Read .env file directly
  const envPath = path.join(__dirname, '.env');
  const envContent = fs.readFileSync(envPath, 'utf8');
  const dbUrlMatch = envContent.match(/^DATABASE_URL=(.+)$/m);
  const dbUrl = dbUrlMatch[1].trim().replace(/&channel_binding=require/g, '');
  
  const client = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    await client.connect();
    
    console.log('\n=== PostgreSQL Schema Verification ===\n');
    
    // Get all tables
    const tables = await client.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename
    `);
    
    console.log(`✓ Tables: ${tables.rows.length}`);
    tables.rows.forEach(row => console.log(`   - ${row.tablename}`));
    
    // Get all foreign keys with details
    const fks = await client.query(`
      SELECT
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name,
        tc.constraint_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
      ORDER BY tc.table_name, kcu.column_name
    `);
    
    console.log(`\n✓ Foreign Keys: ${fks.rows.length}`);
    fks.rows.forEach(fk => {
      console.log(`   - ${fk.table_name}.${fk.column_name} → ${fk.foreign_table_name}.${fk.foreign_column_name}`);
    });
    
    // Expected foreign keys
    const expectedFKs = [
      'student_profiles.user_id → users.id',
      'resumes.user_id → users.id',
      'interviews.user_id → users.id',
      'interviews.resume_id → resumes.id',
      'interviews.job_role_id → job_roles.id',
      'interview_questions.interview_id → interviews.id',
      'interview_answers.interview_id → interviews.id',
      'interview_answers.question_id → interview_questions.id',
      'evaluations.answer_id → interview_answers.id',
      'revised_answers.original_answer_id → interview_answers.id',
      'revised_answers.question_id → interview_questions.id',
      'recommendations.interview_id → interviews.id'
    ];
    
    console.log(`\n✓ Expected Foreign Keys: ${expectedFKs.length}`);
    
    const actualFKs = fks.rows.map(fk => 
      `${fk.table_name}.${fk.column_name} → ${fk.foreign_table_name}.${fk.foreign_column_name}`
    );
    
    const missing = expectedFKs.filter(fk => !actualFKs.includes(fk));
    const extra = actualFKs.filter(fk => !expectedFKs.includes(fk));
    
    if (missing.length > 0) {
      console.log('\n⚠️  Missing Foreign Keys:');
      missing.forEach(fk => console.log(`   - ${fk}`));
    }
    
    if (extra.length > 0) {
      console.log('\n⚠️  Extra Foreign Keys:');
      extra.forEach(fk => console.log(`   - ${fk}`));
    }
    
    // Get all indexes
    const indexes = await client.query(`
      SELECT
        tablename,
        indexname,
        indexdef
      FROM pg_indexes
      WHERE schemaname = 'public'
      ORDER BY tablename, indexname
    `);
    
    console.log(`\n✓ Indexes: ${indexes.rows.length}`);
    
    // Check for primary keys
    const pks = await client.query(`
      SELECT COUNT(*) as count
      FROM information_schema.table_constraints
      WHERE constraint_type = 'PRIMARY KEY'
      AND table_schema = 'public'
    `);
    
    console.log(`✓ Primary Keys: ${pks.rows[0].count}`);
    
    // Final verdict
    console.log('\n=== Summary ===');
    console.log(`Tables: ${tables.rows.length}/10 ` + (tables.rows.length === 10 ? '✅' : '❌'));
    console.log(`Foreign Keys: ${fks.rows.length}/12 ` + (fks.rows.length >= 12 ? '✅' : '❌'));
    console.log(`Primary Keys: ${pks.rows[0].count}/10 ` + (pks.rows[0].count == 10 ? '✅' : '❌'));
    
    if (tables.rows.length === 10 && fks.rows.length >= 12 && pks.rows[0].count == 10) {
      console.log('\n🎉 Schema is ready for data import');
    }
    
    await client.end();
    
  } catch (err) {
    console.log('❌ Error:', err.message);
    try { await client.end(); } catch (e) {}
    process.exit(1);
  }
}

verifySchema();
