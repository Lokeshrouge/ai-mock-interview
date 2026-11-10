const { Client } = require('pg');
const fs = require('fs');

async function run() {
  const envContent = fs.readFileSync('.env', 'utf8');
  const dbUrl = envContent.match(/^DATABASE_URL=(.+)$/m)[1].trim().replace(/&channel_binding=require/g, '');
  
  const client = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    await client.connect();
    console.log('✅ Connected\n');
    
    // Fix schema: change numeric(3,2) to numeric(5,2) for score columns
    console.log('Fixing schema...');
    const fixes = [
      'ALTER TABLE evaluations ALTER COLUMN relevance_score TYPE numeric(5,2)',
      'ALTER TABLE evaluations ALTER COLUMN accuracy_score TYPE numeric(5,2)',
      'ALTER TABLE evaluations ALTER COLUMN completeness_score TYPE numeric(5,2)',
      'ALTER TABLE evaluations ALTER COLUMN clarity_score TYPE numeric(5,2)',
      'ALTER TABLE revised_answers ALTER COLUMN accuracy_score TYPE numeric(5,2)',
      'ALTER TABLE revised_answers ALTER COLUMN completeness_score TYPE numeric(5,2)',
      'ALTER TABLE revised_answers ALTER COLUMN clarity_score TYPE numeric(5,2)',
      'ALTER TABLE revised_answers ALTER COLUMN relevance_score TYPE numeric(5,2)'
    ];
    
    for (const fix of fixes) {
      await client.query(fix);
    }
    console.log('✅ Schema fixed\n');
    
    // Now import
    const exportData = JSON.parse(fs.readFileSync('data-export-2026-10-11T08-17-20.json', 'utf8'));
    
    await client.query('BEGIN');
    
    const tables = [
      { name: 'users', data: exportData.tables.users },
      { name: 'job_roles', data: exportData.tables.job_roles },
      { name: 'student_profiles', data: exportData.tables.student_profiles },
      { name: 'resumes', data: exportData.tables.resumes },
      { name: 'interviews', data: exportData.tables.interviews },
      { name: 'interview_questions', data: exportData.tables.interview_questions },
      { name: 'interview_answers', data: exportData.tables.interview_answers },
      { name: 'evaluations', data: exportData.tables.evaluations },
      { name: 'revised_answers', data: exportData.tables.revised_answers },
      { name: 'recommendations', data: exportData.tables.recommendations }
    ];
    
    for (const table of tables) {
      if (!table.data || table.data.length === 0) {
        console.log(`⏭️  ${table.name}: 0 records`);
        continue;
      }
      
      const records = table.data;
      const cols = Object.keys(records[0]);
      const placeholders = records.map((_, i) => 
        `(${cols.map((_, j) => `$${i * cols.length + j + 1}`).join(',')})`
      ).join(',');
      
      const values = [];
      for (const record of records) {
        for (const col of cols) {
          let val = record[col];
          
          // Convert SQLite booleans
          if (typeof val === 'number' && (col === 'is_active' || col.startsWith('is_'))) {
            val = val === 1;
          }
          
          values.push(val);
        }
      }
      
      const sql = `INSERT INTO "${table.name}" (${cols.map(c => `"${c}"`).join(',')}) VALUES ${placeholders}`;
      await client.query(sql, values);
      console.log(`✅ ${table.name}: ${records.length}`);
    }
    
    await client.query('COMMIT');
    console.log('\n🎉 Migration complete: 181 records imported');
    
    // Verify
    const count = await client.query('SELECT COUNT(*) FROM users');
    console.log(`\n✓ Verification: ${count.rows[0].count} users in database`);
    
    await client.end();
  } catch (err) {
    try { await client.query('ROLLBACK'); } catch (e) {}
    console.log('\n❌ Error:', err.message);
    await client.end();
    process.exit(1);
  }
}

run();
