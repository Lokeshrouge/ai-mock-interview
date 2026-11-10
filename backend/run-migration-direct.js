const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  console.log('\n=== PostgreSQL Migration - Direct .env Reader ===\n');
  
  // Read .env file directly, bypassing dotenv
  const envPath = path.join(__dirname, '.env');
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  // Parse DATABASE_URL manually
  const dbUrlMatch = envContent.match(/^DATABASE_URL=(.+)$/m);
  if (!dbUrlMatch) {
    console.log('❌ FAIL: DATABASE_URL not found in .env');
    process.exit(1);
  }
  
  const dbUrl = dbUrlMatch[1].trim();
  console.log('✓ DATABASE_URL loaded (length:', dbUrl.length, 'chars)');
  
  // Check if it's actually PostgreSQL
  if (!dbUrl.startsWith('postgres')) {
    console.log('❌ FAIL: DATABASE_URL is not PostgreSQL');
    console.log('Value:', dbUrl.substring(0, 50) + '...');
    process.exit(1);
  }
  
  console.log('✓ DATABASE_URL is PostgreSQL (Neon detected)');
  
  // Remove channel_binding parameter (not supported by pg client)
  const cleanUrl = dbUrl.replace(/&channel_binding=require/g, '');
  
  const client = new Client({
    connectionString: cleanUrl,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    console.log('\n1. Connecting to Neon PostgreSQL...');
    await client.connect();
    console.log('✅ PASS: Connected to Neon');
    
    // Check current tables
    console.log('\n2. Checking existing tables...');
    const existingTables = await client.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename
    `);
    
    if (existingTables.rows.length > 0) {
      console.log('⚠️  WARNING: Found existing tables:', existingTables.rows.map(r => r.tablename).join(', '));
      console.log('Migration will NOT run to prevent data loss.');
      console.log('If you want to recreate schema, manually drop tables first.');
      await client.end();
      process.exit(0);
    }
    
    console.log('✓ Database is empty (0 tables)');
    
    // Run migration in correct order
    console.log('\n3. Creating tables in dependency order...');
    
    const migrations = [
      {
        name: 'Enable UUID extension',
        sql: `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`
      },
      {
        name: 'users',
        sql: `CREATE TABLE "users" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
          "email" character varying(255) NOT NULL,
          "password_hash" character varying(255) NOT NULL,
          "role" character varying NOT NULL DEFAULT 'STUDENT',
          "is_active" boolean NOT NULL DEFAULT true,
          "failed_login_attempts" integer NOT NULL DEFAULT '0',
          "locked_until" TIMESTAMP,
          "created_at" TIMESTAMP NOT NULL DEFAULT now(),
          "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
          CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"),
          CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
        );`
      },
      {
        name: 'student_profiles',
        sql: `CREATE TABLE "student_profiles" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
          "user_id" uuid NOT NULL,
          "first_name" character varying(100) NOT NULL,
          "last_name" character varying(100) NOT NULL,
          "phone" character varying(20),
          "target_role" character varying(100),
          "experience_level" character varying(50),
          "career_interests" text,
          "education" text,
          "technical_skills" text,
          "programming_languages" text,
          "tools_technologies" text,
          "bio" text,
          "profile_picture_url" character varying(500),
          "linkedin_url" character varying(255),
          "github_url" character varying(255),
          "created_at" TIMESTAMP NOT NULL DEFAULT now(),
          "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
          CONSTRAINT "UQ_cef016a0d95e26ae7c0f167ec28" UNIQUE ("user_id"),
          CONSTRAINT "REL_cef016a0d95e26ae7c0f167ec2" UNIQUE ("user_id"),
          CONSTRAINT "PK_5ed0a32eeaddfe812fb326177d0" PRIMARY KEY ("id"),
          CONSTRAINT "FK_cef016a0d95e26ae7c0f167ec28" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        );
        CREATE UNIQUE INDEX "idx_student_profiles_user_id" ON "student_profiles" ("user_id");`
      },
      {
        name: 'resumes',
        sql: `CREATE TABLE "resumes" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
          "user_id" uuid NOT NULL,
          "file_name" character varying(255) NOT NULL,
          "stored_file_name" character varying(255) NOT NULL,
          "file_path" character varying(500) NOT NULL,
          "file_url" character varying(500),
          "file_type" character varying(20) NOT NULL,
          "mime_type" character varying(100) NOT NULL,
          "file_size" integer NOT NULL,
          "processing_status" character varying NOT NULL DEFAULT 'UPLOADED',
          "analysis_status" character varying NOT NULL DEFAULT 'PENDING',
          "extracted_text" text,
          "parsed_data" text,
          "error_message" text,
          "is_active" boolean NOT NULL DEFAULT true,
          "uploaded_at" TIMESTAMP NOT NULL DEFAULT now(),
          "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
          CONSTRAINT "PK_9c8677802096d6baece48429d2e" PRIMARY KEY ("id"),
          CONSTRAINT "FK_dce6e1ce26d348e602f56fa6363" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        );
        CREATE INDEX "idx_resumes_user_id" ON "resumes" ("user_id");
        CREATE INDEX "idx_resumes_processing_status" ON "resumes" ("processing_status");
        CREATE INDEX "idx_resumes_analysis_status" ON "resumes" ("analysis_status");
        CREATE INDEX "idx_resumes_is_active" ON "resumes" ("is_active");`
      },
      {
        name: 'job_roles',
        sql: `CREATE TABLE "job_roles" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
          "title" character varying(200) NOT NULL,
          "category" character varying(100) NOT NULL,
          "description" text NOT NULL,
          "required_skills" text,
          "topics" text,
          "is_active" boolean NOT NULL DEFAULT true,
          "created_at" TIMESTAMP NOT NULL DEFAULT now(),
          "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
          CONSTRAINT "UQ_46c78b2d5e2cfbdd990a64ce517" UNIQUE ("title"),
          CONSTRAINT "PK_2010ead772199469bfe54ea513b" PRIMARY KEY ("id")
        );`
      },
      {
        name: 'interviews',
        sql: `CREATE TABLE "interviews" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
          "user_id" uuid NOT NULL,
          "resume_id" uuid,
          "job_role_id" uuid NOT NULL,
          "interview_type" character varying NOT NULL,
          "difficulty" character varying NOT NULL,
          "status" character varying NOT NULL,
          "overall_score" numeric(5,2),
          "total_questions" integer NOT NULL DEFAULT '0',
          "answered_questions" integer NOT NULL DEFAULT '0',
          "target_company" character varying(200),
          "target_role" character varying(200),
          "experience_level" character varying(50),
          "interview_round" character varying(100),
          "job_description" text,
          "started_at" TIMESTAMP,
          "completed_at" TIMESTAMP,
          "created_at" TIMESTAMP NOT NULL DEFAULT now(),
          CONSTRAINT "PK_fd41af1f96d698fa33c2f070f47" PRIMARY KEY ("id"),
          CONSTRAINT "FK_b6fa4e1fab2f948fb14c736cd7a" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
          CONSTRAINT "FK_2094d3d2a8ac3b95772d2b2828e" FOREIGN KEY ("resume_id") REFERENCES "resumes"("id") ON DELETE SET NULL ON UPDATE NO ACTION,
          CONSTRAINT "FK_7004859258e07eb34d27ef7c2d8" FOREIGN KEY ("job_role_id") REFERENCES "job_roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        );`
      },
      {
        name: 'interview_questions',
        sql: `CREATE TABLE "interview_questions" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
          "interview_id" uuid NOT NULL,
          "question_number" integer NOT NULL,
          "question_text" text NOT NULL,
          "question_category" character varying(100),
          "expected_points" text,
          "generated_at" TIMESTAMP NOT NULL DEFAULT now(),
          CONSTRAINT "PK_2ef2c099d8bc521e9b89e986b3c" PRIMARY KEY ("id"),
          CONSTRAINT "FK_3e422e705d4c17a63109805b153" FOREIGN KEY ("interview_id") REFERENCES "interviews"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        );`
      },
      {
        name: 'interview_answers',
        sql: `CREATE TABLE "interview_answers" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
          "interview_id" uuid NOT NULL,
          "question_id" uuid NOT NULL,
          "answer_text" text NOT NULL,
          "time_taken_seconds" integer,
          "submitted_at" TIMESTAMP NOT NULL DEFAULT now(),
          CONSTRAINT "UQ_0d741e704f77dee5309bf554f9d" UNIQUE ("question_id"),
          CONSTRAINT "REL_0d741e704f77dee5309bf554f9" UNIQUE ("question_id"),
          CONSTRAINT "PK_b29d79de5cfb62e8ca9376d96a1" PRIMARY KEY ("id"),
          CONSTRAINT "FK_baccf50dfc485d92412642368c1" FOREIGN KEY ("interview_id") REFERENCES "interviews"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
          CONSTRAINT "FK_0d741e704f77dee5309bf554f9d" FOREIGN KEY ("question_id") REFERENCES "interview_questions"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        );`
      },
      {
        name: 'evaluations',
        sql: `CREATE TABLE "evaluations" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
          "answer_id" uuid NOT NULL,
          "score" numeric(5,2) NOT NULL,
          "feedback" text NOT NULL,
          "strengths" text,
          "weaknesses" text,
          "relevance_score" numeric(3,2),
          "accuracy_score" numeric(3,2),
          "completeness_score" numeric(3,2),
          "clarity_score" numeric(3,2),
          "model_answer" text,
          "why_better" text,
          "answer_framework" character varying(500),
          "key_concepts" text,
          "study_recommendations" text,
          "evaluated_at" TIMESTAMP NOT NULL DEFAULT now(),
          CONSTRAINT "UQ_0d430e53f61fe14dbda0c7703dd" UNIQUE ("answer_id"),
          CONSTRAINT "REL_0d430e53f61fe14dbda0c7703d" UNIQUE ("answer_id"),
          CONSTRAINT "PK_f683b433eba0e6dae7e19b29e29" PRIMARY KEY ("id"),
          CONSTRAINT "FK_0d430e53f61fe14dbda0c7703dd" FOREIGN KEY ("answer_id") REFERENCES "interview_answers"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        );`
      },
      {
        name: 'revised_answers',
        sql: `CREATE TABLE "revised_answers" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
          "original_answer_id" uuid NOT NULL,
          "question_id" uuid NOT NULL,
          "revised_text" text NOT NULL,
          "revision_number" integer NOT NULL DEFAULT '1',
          "score" numeric(5,2) NOT NULL,
          "accuracy_score" numeric(3,2),
          "completeness_score" numeric(3,2),
          "clarity_score" numeric(3,2),
          "relevance_score" numeric(3,2),
          "feedback" text NOT NULL,
          "strengths" text,
          "weaknesses" text,
          "submitted_at" TIMESTAMP NOT NULL DEFAULT now(),
          CONSTRAINT "PK_1802c79419c7ca9a025065b19fb" PRIMARY KEY ("id"),
          CONSTRAINT "FK_9397513e6cf78501bdc853909c5" FOREIGN KEY ("original_answer_id") REFERENCES "interview_answers"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
          CONSTRAINT "FK_50ba50a1f68e3b7effe4865d6cd" FOREIGN KEY ("question_id") REFERENCES "interview_questions"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        );`
      },
      {
        name: 'recommendations',
        sql: `CREATE TABLE "recommendations" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
          "interview_id" uuid NOT NULL,
          "strengths" text,
          "weaknesses" text,
          "topics_to_improve" text,
          "recommended_resources" text,
          "overall_feedback" text NOT NULL,
          "created_at" TIMESTAMP NOT NULL DEFAULT now(),
          CONSTRAINT "PK_23a8d2db26db8cabb6ae9d6cd87" PRIMARY KEY ("id"),
          CONSTRAINT "FK_f906813f4d447eebcbb41c8f831" FOREIGN KEY ("interview_id") REFERENCES "interviews"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        );`
      }
    ];
    
    let createdCount = 0;
    for (const migration of migrations) {
      try {
        console.log(`   Creating: ${migration.name}...`);
        await client.query(migration.sql);
        createdCount++;
        console.log(`   ✓ ${migration.name}`);
      } catch (err) {
        console.log(`   ❌ FAIL: ${migration.name}`);
        console.log(`   Error: ${err.message}`);
        throw err;
      }
    }
    
    console.log(`\n✅ PASS: Created ${createdCount} tables/extensions`);
    
    // Verify final state
    console.log('\n4. Verifying schema...');
    const finalTables = await client.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename
    `);
    
    console.log(`✓ Tables created: ${finalTables.rows.length}`);
    finalTables.rows.forEach(row => {
      console.log(`   - ${row.tablename}`);
    });
    
    // Check foreign keys
    const fkCount = await client.query(`
      SELECT COUNT(*) as count
      FROM information_schema.table_constraints
      WHERE constraint_type = 'FOREIGN KEY'
      AND table_schema = 'public'
    `);
    
    console.log(`✓ Foreign keys: ${fkCount.rows[0].count}`);
    
    console.log('\n✅ PASS: Migration completed successfully');
    console.log('\nExpected: 10 tables, 13 foreign keys');
    console.log(`Actual: ${finalTables.rows.length} tables, ${fkCount.rows[0].count} foreign keys`);
    
    if (finalTables.rows.length === 10 && fkCount.rows[0].count == 13) {
      console.log('\n🎉 Schema verification: PASS');
    } else {
      console.log('\n⚠️  Schema verification: PARTIAL (check counts above)');
    }
    
    await client.end();
    
  } catch (err) {
    console.log('\n❌ FAIL: Migration error');
    console.log('Error:', err.message);
    if (err.code) {
      console.log('SQL State:', err.code);
    }
    if (err.position) {
      console.log('Position:', err.position);
    }
    try {
      await client.end();
    } catch (e) {}
    process.exit(1);
  }
}

runMigration();
