/**
 * SQLite to JSON Export Script
 * Exports all data in dependency-safe order
 * READ-ONLY operation - no database modifications
 */

const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'mock_interview.db');
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
const outputFile = path.join(__dirname, `data-export-${timestamp}.json`);

console.log('📦 SQLite Data Export\n');
console.log(`📁 Source: ${dbPath}`);
console.log(`💾 Output: ${outputFile}\n`);

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err.message);
    process.exit(1);
  }
});

// Export order: parents before children (respects foreign keys)
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

const exportData = {
  exportDate: new Date().toISOString(),
  source: 'SQLite',
  database: dbPath,
  recordCount: 0,
  tables: {},
};

let completedTables = 0;

console.log('🔄 Exporting tables in dependency order...\n');

tables.forEach((tableName) => {
  db.all(`SELECT * FROM "${tableName}"`, [], (err, rows) => {
    if (err) {
      console.error(`❌ Error exporting ${tableName}:`, err.message);
      db.close();
      process.exit(1);
    }

    exportData.tables[tableName] = rows;
    exportData.recordCount += rows.length;

    console.log(`✅ ${tableName.padEnd(25)} ${rows.length} records`);

    completedTables++;

    if (completedTables === tables.length) {
      finishExport();
    }
  });
});

function finishExport() {
  console.log('\n─────────────────────────────────────');
  console.log(`📊 Total Records: ${exportData.recordCount}`);
  console.log('─────────────────────────────────────\n');

  // Write to file
  try {
    fs.writeFileSync(outputFile, JSON.stringify(exportData, null, 2));
    const fileSize = fs.statSync(outputFile).size;
    console.log(`✅ Export saved: ${outputFile}`);
    console.log(`📦 File size: ${(fileSize / 1024).toFixed(2)} KB\n`);

    // Validation
    console.log('🔍 Validating export...\n');

    let valid = true;

    // Check record counts
    Object.keys(exportData.tables).forEach((table) => {
      const count = exportData.tables[table].length;
      if (count > 0) {
        // Validate first record has 'id' field
        const firstRecord = exportData.tables[table][0];
        if (!firstRecord.id) {
          console.error(`❌ ${table}: Missing 'id' field`);
          valid = false;
        }
      }
    });

    // Check foreign key references exist in export
    const validateFK = (childTable, fkField, parentTable) => {
      const children = exportData.tables[childTable];
      const parents = exportData.tables[parentTable];
      const parentIds = new Set(parents.map((p) => p.id));

      children.forEach((child) => {
        const fkValue = child[fkField];
        if (fkValue && !parentIds.has(fkValue)) {
          console.error(
            `❌ ${childTable}.${fkField} references non-existent ${parentTable}.id: ${fkValue}`
          );
          valid = false;
        }
      });
    };

    validateFK('student_profiles', 'user_id', 'users');
    validateFK('resumes', 'user_id', 'users');
    validateFK('interviews', 'user_id', 'users');
    validateFK('interviews', 'job_role_id', 'job_roles');
    validateFK('interview_questions', 'interview_id', 'interviews');
    validateFK('interview_answers', 'interview_id', 'interviews');
    validateFK('interview_answers', 'question_id', 'interview_questions');
    validateFK('evaluations', 'answer_id', 'interview_answers');
    validateFK('recommendations', 'interview_id', 'interviews');

    if (valid) {
      console.log('✅ All validations passed!\n');
      console.log('📋 Next Steps:');
      console.log('  1. Review export file for accuracy');
      console.log('  2. Switch DATABASE_URL to Neon PostgreSQL');
      console.log('  3. Run: node import-json-to-postgres.js ' + path.basename(outputFile));
      console.log();
    } else {
      console.error('\n❌ Validation failed! Review errors above.\n');
      process.exit(1);
    }
  } catch (err) {
    console.error('❌ Error writing export file:', err.message);
    process.exit(1);
  }

  db.close((err) => {
    if (err) {
      console.error('❌ Error closing database:', err.message);
    }
  });
}
