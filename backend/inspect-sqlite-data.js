/**
 * SQLite Database Inspector
 * Safely reads and reports on existing SQLite data without modifications
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'mock_interview.db');

console.log('🔍 Inspecting SQLite Database...\n');
console.log(`📁 Database: ${dbPath}\n`);

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err.message);
    process.exit(1);
  }
  console.log('✅ Database opened successfully\n');
});

// Get all tables
db.all(
  "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name",
  [],
  (err, tables) => {
    if (err) {
      console.error('❌ Error fetching tables:', err.message);
      db.close();
      process.exit(1);
    }

    console.log(`📊 Found ${tables.length} tables:\n`);

    let completedTables = 0;
    const results = {};

    tables.forEach((table) => {
      const tableName = table.name;

      // Skip SQLite internal tables
      if (tableName.startsWith('sqlite_')) {
        completedTables++;
        if (completedTables === tables.length) {
          printSummary(results);
        }
        return;
      }

      // Count rows in each table
      db.get(`SELECT COUNT(*) as count FROM "${tableName}"`, [], (err, row) => {
        if (err) {
          console.error(`❌ Error counting ${tableName}:`, err.message);
          results[tableName] = { count: 'ERROR', columns: [] };
        } else {
          results[tableName] = { count: row.count, columns: [] };

          // Get column info
          db.all(`PRAGMA table_info("${tableName}")`, [], (err, columns) => {
            if (!err) {
              results[tableName].columns = columns.map((col) => ({
                name: col.name,
                type: col.type,
                nullable: col.notnull === 0,
                pk: col.pk === 1,
              }));
            }

            completedTables++;
            if (completedTables === tables.length) {
              printSummary(results);
            }
          });
        }
      });
    });

    if (tables.length === 0) {
      console.log('⚠️  No tables found. Database is empty.\n');
      db.close();
    }
  }
);

function printSummary(results) {
  console.log('═══════════════════════════════════════════════════════════\n');
  console.log('📋 TABLE SUMMARY:\n');

  let totalRecords = 0;
  const tableNames = Object.keys(results).sort();

  tableNames.forEach((tableName) => {
    const data = results[tableName];
    console.log(`  ${tableName}:`);
    console.log(`    Rows: ${data.count}`);
    console.log(`    Columns: ${data.columns.length}`);

    if (data.count !== 'ERROR') {
      totalRecords += data.count;
    }

    // Show key columns
    const keyColumns = data.columns
      .filter((col) => col.pk || ['id', 'email', 'name'].includes(col.name))
      .map((col) => col.name)
      .join(', ');

    if (keyColumns) {
      console.log(`    Key columns: ${keyColumns}`);
    }
    console.log();
  });

  console.log('═══════════════════════════════════════════════════════════\n');
  console.log(`📊 TOTAL RECORDS: ${totalRecords}\n`);

  // Check for SQLite-specific data types that need migration attention
  console.log('⚠️  PostgreSQL COMPATIBILITY CHECK:\n');

  let hasDatetimeColumns = false;
  tableNames.forEach((tableName) => {
    const datetimeCols = results[tableName].columns.filter(
      (col) => col.type.toLowerCase() === 'datetime'
    );

    if (datetimeCols.length > 0) {
      hasDatetimeColumns = true;
      console.log(`  ${tableName}:`);
      datetimeCols.forEach((col) => {
        console.log(`    - ${col.name} (datetime) → needs 'timestamp' or 'timestamptz' for PostgreSQL`);
      });
    }
  });

  if (!hasDatetimeColumns) {
    console.log('  ✅ No obvious compatibility issues detected');
  }

  console.log('\n═══════════════════════════════════════════════════════════\n');

  // Data export preparation note
  if (totalRecords > 0) {
    console.log('💾 DATA MIGRATION RECOMMENDATIONS:\n');
    console.log('  1. Create full backup: cp mock_interview.db mock_interview.pre-migration.db');
    console.log('  2. Export data to JSON for safe migration');
    console.log('  3. Run PostgreSQL migrations to create schema');
    console.log('  4. Import data into PostgreSQL');
    console.log('  5. Verify data integrity before switching');
    console.log('\n  ⚠️  DO NOT DELETE SQLite files until PostgreSQL is fully verified!\n');
  } else {
    console.log('✅ Database is empty - safe to switch to PostgreSQL without data migration\n');
  }

  db.close((err) => {
    if (err) {
      console.error('❌ Error closing database:', err.message);
    } else {
      console.log('✅ Database closed\n');
    }
  });
}
