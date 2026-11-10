require('dotenv').config();
const { DataSource } = require('typeorm');

const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: ['dist/**/*.entity.js'],
  migrations: ['dist/database/migrations/*.js'],
  synchronize: false,
  logging: false,
  ssl: { rejectUnauthorized: false },
});

console.log('🔄 Running migrations...\n');

AppDataSource.initialize()
  .then(async () => {
    console.log('✅ Connected to database');
    const migrations = await AppDataSource.runMigrations();
    console.log(`✅ Executed ${migrations.length} migration(s)\n`);
    
    if (migrations.length > 0) {
      migrations.forEach(m => console.log(`   - ${m.name}`));
    }
    
    // Verify tables created
    const result = await AppDataSource.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name"
    );
    
    console.log(`\n📊 Tables created: ${result.length}`);
    result.forEach(r => console.log(`   - ${r.table_name}`));
    
    await AppDataSource.destroy();
    console.log('\n✅ Migration complete');
  })
  .catch(err => {
    console.error('❌ Migration failed:');
    console.error('Message:', err.message);
    console.error('Stack:', err.stack);
    process.exit(1);
  });
