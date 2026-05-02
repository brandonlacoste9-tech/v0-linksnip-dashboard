import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
config({ path: '.env.local' });

async function migrate() {
  const sql = neon(process.env.DATABASE_URL!);
  
  console.log('🚀 Starting migration...');
  
  // 1. Add userId to links if it doesn't exist
  console.log('Checking for userId column in links table...');
  await sql`
    ALTER TABLE links 
    ADD COLUMN IF NOT EXISTS user_id TEXT;
  `;
  
  // 2. Add index for userId
  console.log('Ensuring index for user_id exists...');
  await sql`
    CREATE INDEX IF NOT EXISTS user_id_idx ON links (user_id);
  `;

  // 3. Create clicks table if it doesn't exist (it should, but good for safety)
  console.log('Ensuring clicks table exists...');
  await sql`
    CREATE TABLE IF NOT EXISTS clicks (
      id SERIAL PRIMARY KEY,
      link_id INTEGER NOT NULL REFERENCES links(id) ON DELETE CASCADE,
      timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
      ip_address TEXT,
      country TEXT,
      user_agent TEXT,
      referrer TEXT
    );
  `;
  await sql`CREATE INDEX IF NOT EXISTS link_id_idx ON clicks (link_id);`;
  await sql`CREATE INDEX IF NOT EXISTS timestamp_idx ON clicks (timestamp);`;

  // 4. Create authorized_users table
  console.log('Ensuring authorized_users table exists...');
  await sql`
    CREATE TABLE IF NOT EXISTS authorized_users (
      id SERIAL PRIMARY KEY,
      clerk_id TEXT NOT NULL UNIQUE,
      email TEXT,
      role TEXT NOT NULL DEFAULT 'admin',
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `;
  await sql`CREATE INDEX IF NOT EXISTS clerk_id_idx ON authorized_users (clerk_id);`;
  
  console.log('✅ Migration completed successfully!');
}

migrate().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
