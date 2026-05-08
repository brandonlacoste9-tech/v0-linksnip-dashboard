import postgres from 'postgres';
import { config } from 'dotenv';
config({ path: '.env.local' });

async function test() {
  const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require' });
  try {
    const result = await sql`SELECT 1 as connected`;
    console.log('Result:', result);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await sql.end();
  }
}
test();
