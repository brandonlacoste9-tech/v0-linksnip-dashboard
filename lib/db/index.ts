import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// On Vercel Edge, pooled HTTP connections can hang indefinitely.
// We strictly prioritize the unpooled / non-pooling connection strings.
const connectionString = 
  process.env.POSTGRES_URL_NON_POOLING || 
  process.env.DATABASE_URL_UNPOOLED || 
  process.env.POSTGRES_URL || 
  process.env.DATABASE_URL!;
const sql = neon(connectionString);
export const db = drizzle(sql, { schema });
