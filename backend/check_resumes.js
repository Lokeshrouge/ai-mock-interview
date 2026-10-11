// Quick script to check existing resume records
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'mock_interview.db');
const db = new sqlite3.Database(dbPath);

db.all(`
  SELECT 
    id, 
    file_name, 
    file_type, 
    processing_status, 
    LENGTH(extracted_text) as textLength,
    SUBSTR(extracted_text, 1, 100) as textPreview
  FROM resumes 
  ORDER BY uploaded_at DESC 
  LIMIT 5
`, [], (err, rows) => {
  if (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
  
  console.log('Recent resumes:');
  console.log('---');
  rows.forEach((row, i) => {
    console.log(`${i + 1}. ID: ${row.id}`);
    console.log(`   File: ${row.file_name} (${row.file_type})`);
    console.log(`   Status: ${row.processing_status}`);
    console.log(`   Text length: ${row.textLength} chars`);
    console.log(`   Preview: ${row.textPreview}`);
    console.log('---');
  });
  
  db.close();
});
