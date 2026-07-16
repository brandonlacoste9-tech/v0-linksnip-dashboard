import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./schema";

export type ZipdDb = NeonHttpDatabase<typeof schema>;

/**
 * Resolve Neon connection string.
 * Prefer non-pooling URLs on Edge — pooled HTTP can hang.
 */
export function getDatabaseUrl(): string | undefined {
  return (
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.DATABASE_URL_UNPOOLED ||
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL ||
    undefined
  );
}

let _db: ZipdDb | null = null;

/**
 * Lazy Drizzle client — only connects when first used.
 * Avoids build-time crash when DATABASE_URL is unset during `next build`.
 */
export function getDb(): ZipdDb {
  if (_db) return _db;

  const connectionString = getDatabaseUrl();
  if (!connectionString) {
    throw new Error(
      "No database connection string. Set DATABASE_URL (or POSTGRES_URL / DATABASE_URL_UNPOOLED).",
    );
  }

  const sql: NeonQueryFunction<false, false> = neon(connectionString);
  _db = drizzle(sql, { schema });
  return _db;
}

/**
 * Back-compat proxy so existing `db.select()...` keeps working.
 * Defers neon() until a property is actually accessed.
 */
export const db: ZipdDb = new Proxy({} as ZipdDb, {
  get(_target, prop, receiver) {
    const instance = getDb() as unknown as Record<string | symbol, unknown>;
    const value = Reflect.get(instance, prop, receiver);
    return typeof value === "function" ? value.bind(instance) : value;
  },
});
