import { sql } from 'drizzle-orm';
import { db } from './db';

async function migrate() {
  console.log('Starting database migration...');
  
  try {
    // Create tables in the correct order
    
    // 1. Create users table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        full_name VARCHAR(255),
        phone VARCHAR(20),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✓ Users table created');

    // 2. Create sessions table for authentication
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS sessions (
        sid VARCHAR PRIMARY KEY,
        sess JSONB NOT NULL,
        expire TIMESTAMP NOT NULL
      )
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_session_expire ON sessions (expire)
    `);
    console.log('✓ Sessions table created');

    // 3. Create tax_sessions table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS tax_sessions (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        financial_year VARCHAR(10) NOT NULL,
        current_step INTEGER DEFAULT 1,
        status VARCHAR(50) DEFAULT 'in_progress',
        onboarding_data JSONB DEFAULT '{}',
        extracted_data JSONB DEFAULT '{}',
        income_details JSONB DEFAULT '{}',
        deductions_data JSONB DEFAULT '{}',
        tax_calculation JSONB DEFAULT '{}',
        suggestions JSONB DEFAULT '[]',
        itr_json JSONB,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_tax_sessions_user ON tax_sessions (user_id)
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_tax_sessions_year ON tax_sessions (financial_year)
    `);
    console.log('✓ Tax sessions table created');

    // 4. Create form16_uploads table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS form16_uploads (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        tax_session_id UUID NOT NULL REFERENCES tax_sessions(id) ON DELETE CASCADE,
        file_name VARCHAR(255) NOT NULL,
        file_type VARCHAR(50) NOT NULL,
        file_size INTEGER NOT NULL,
        file_path VARCHAR(500),
        processing_status VARCHAR(50) DEFAULT 'pending',
        extracted_data JSONB,
        error_message TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_form16_session ON form16_uploads (tax_session_id)
    `);
    console.log('✓ Form16 uploads table created');

    console.log('\n✅ Database migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrate();