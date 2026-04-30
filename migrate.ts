import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
config({ path: '.env.local' });

async function migrate() {
  const sql = neon(process.env.DATABASE_URL!);
  
  console.log('Dropping old links table if exists...');
  await sql`DROP TABLE IF EXISTS links CASCADE;`;
  
  console.log('Creating new links table...');
  await sql`
    CREATE TABLE links (
      id SERIAL PRIMARY KEY,
      original_url TEXT NOT NULL,
      short_code TEXT NOT NULL UNIQUE,
      clicks INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `;
  
  console.log('Migration completed successfully!');
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
