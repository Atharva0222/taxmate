import { sql } from 'drizzle-orm';
import { db } from './db.js';

async function fixMigration() {
  console.log('Fixing database schema...');
  
  try {
    // Drop existing tables in reverse order of dependencies
    console.log('Dropping existing tables...');
    await db.execute(sql`DROP TABLE IF EXISTS form16_uploads CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS tax_sessions CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS users CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS sessions CASCADE`);
    console.log('✓ Existing tables dropped');

    // Create tables with correct schema
    console.log('Creating tables with correct schema...');
    
    // 1. Create users table (matching Drizzle schema exactly)
    await db.execute(sql`
      CREATE TABLE users (
        id VARCHAR DEFAULT gen_random_uuid() PRIMARY KEY,
        username VARCHAR UNIQUE NOT NULL,
        email VARCHAR UNIQUE,
        password VARCHAR NOT NULL,
        first_name VARCHAR,
        last_name VARCHAR,
        profile_image_url VARCHAR,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✓ Users table created');

    // 2. Create sessions table for authentication
    await db.execute(sql`
      CREATE TABLE sessions (
        sid VARCHAR PRIMARY KEY,
        sess JSONB NOT NULL,
        expire TIMESTAMP NOT NULL
      )
    `);
    await db.execute(sql`
      CREATE INDEX idx_session_expire ON sessions (expire)
    `);
    console.log('✓ Sessions table created');

    // 3. Create tax_sessions table
    await db.execute(sql`
      CREATE TABLE tax_sessions (
        id VARCHAR DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        financial_year VARCHAR NOT NULL,
        current_step INTEGER DEFAULT 1,
        is_completed BOOLEAN DEFAULT false,
        onboarding_data JSONB,
        extracted_data JSONB,
        tax_calculations JSONB,
        tax_suggestions JSONB,
        itr_data JSONB,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    await db.execute(sql`
      CREATE INDEX idx_tax_sessions_user ON tax_sessions (user_id)
    `);
    await db.execute(sql`
      CREATE INDEX idx_tax_sessions_year ON tax_sessions (financial_year)
    `);
    console.log('✓ Tax sessions table created');

    // 4. Create form16_uploads table
    await db.execute(sql`
      CREATE TABLE form16_uploads (
        id VARCHAR DEFAULT gen_random_uuid() PRIMARY KEY,
        tax_session_id VARCHAR NOT NULL REFERENCES tax_sessions(id) ON DELETE CASCADE,
        file_name VARCHAR NOT NULL,
        file_url VARCHAR NOT NULL,
        extracted_data JSONB,
        processing_status VARCHAR DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    await db.execute(sql`
      CREATE INDEX idx_form16_session ON form16_uploads (tax_session_id)
    `);
    console.log('✓ Form16 uploads table created');

    console.log('\n✅ Database schema fixed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Schema fix failed:', error);
    process.exit(1);
  }
}

// Run fix
fixMigration();