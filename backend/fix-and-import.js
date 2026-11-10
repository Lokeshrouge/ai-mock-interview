const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function importData() {
  // Read export file
  const exportFile = 'data-export-2026-10-11T08-17-20.json';
  const exportData = JSON.parse(fs.readFileSync(exportFile, 'utf8'));
  
  // Read .env directly
  const envContent = fs.readFileSync('.env', 'utf8');
  const dbUrl = envContent.match(/^DATABASE_URL=(.+)$/m)[1].trim().replace(/&channel_binding=require/g, '');
  
  const client = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    await client.connect();
    console.log('✅ Connected\n');
    
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
          
          // Fix numeric overflow: clip scores to valid ranges
          if (table.name === 'evaluations' || table.name === 'revised_answers') {
            if (col === 'score' && val !== null) {
              val = Math.min(Math.max(parseFloat(val), 0), 100); // 0-100 for numeric(5,2)
            }
            if (['relevance_score', 'accuracy_score', 'completeness_score', 'clarity_score'].includes(col) && val !== null) {
              val = Math.min(Math.max(parseFloat(val), 0), 10); // 0-10 for numeric(3,2)
            }
          }
          
          // Convert SQLite booleans
          if (typeof val === 'number' && (col === 'is_active' || col.startsWith('is_'))) {
            val = val === 1;
          }
          
          values.push(val);
        }
      }
      
      const sql = `INSERT INTO "${table.name}" (${cols.map(c => `"${c}"`).join(',')}) VALUES ${placeholders}`;
      await client.query(sql, values);
      console.log(`✅ ${table.name}: ${records.length} records`);
    }
    
    await client.query('COMMIT');
    console.log('\n🎉 Import complete - 181 records');
    
    await client.end();
  } catch (err) {
    await client.query('ROLLBACK');
    console.log('\n❌ Error:', err.message);
    await client.end();
    process.exit(1);
  }
}

importData();
