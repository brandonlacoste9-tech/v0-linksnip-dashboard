import postgres from 'postgres';
import { config } from 'dotenv';
config({ path: '.env.local' });

/**
 * Sovereign Vault — Row-Level Security Migration
 * ─────────────────────────────────────────────────
 * Enforces strict RLS policies at the PostgreSQL level.
 * This version uses the 'postgres' TCP driver to bypass Neon Control Plane issues.
 */

async function applyRLS() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL not set in .env.local');
    process.exit(1);
  }

  // Use a direct TCP connection with postgres.js
  const sql = postgres(process.env.DATABASE_URL, {
    ssl: 'require',
    max: 1, 
    idle_timeout: 20,
    connect_timeout: 30,
  });

  try {
    console.log('🔒 Starting Row-Level Security migration (TCP Mode)...\n');

    // ─── Step 1: Enable RLS on links table ─────────────────────────────────
    console.log('[1/5] Enabling RLS on "links" table...');
    await sql`ALTER TABLE links ENABLE ROW LEVEL SECURITY;`;

    await sql`DROP POLICY IF EXISTS links_tenant_isolation ON links;`;
    await sql`DROP POLICY IF EXISTS links_insert_policy ON links;`;

    await sql`
      CREATE POLICY links_tenant_isolation ON links
        FOR SELECT
        USING (
          user_id = current_setting('app.current_user_id', true)
          OR current_setting('app.current_user_id', true) IS NULL
        );
    `;

    await sql`
      CREATE POLICY links_insert_policy ON links
        FOR INSERT
        WITH CHECK (
          user_id = current_setting('app.current_user_id', true)
          OR user_id IS NULL
        );
    `;

    console.log('   ✓ RLS policies created for "links"');

    // ─── Step 2: Enable RLS on clicks table ────────────────────────────────
    console.log('[2/5] Enabling RLS on "clicks" table...');
    await sql`ALTER TABLE clicks ENABLE ROW LEVEL SECURITY;`;

    await sql`DROP POLICY IF EXISTS clicks_read_via_link_owner ON clicks;`;
    await sql`DROP POLICY IF EXISTS clicks_insert_open ON clicks;`;

    await sql`
      CREATE POLICY clicks_read_via_link_owner ON clicks
        FOR SELECT
        USING (
          link_id IN (
            SELECT id FROM links
            WHERE user_id = current_setting('app.current_user_id', true)
          )
        );
    `;

    await sql`
      CREATE POLICY clicks_insert_open ON clicks
        FOR INSERT
        WITH CHECK (true);
    `;

    console.log('   ✓ RLS policies created for "clicks"');

    // ─── Step 3: Enable RLS on authorized_users ────────────────────────────
    console.log('[3/5] Enabling RLS on "authorized_users" table...');
    await sql`ALTER TABLE authorized_users ENABLE ROW LEVEL SECURITY;`;

    await sql`DROP POLICY IF EXISTS auth_users_self_read ON authorized_users;`;

    await sql`
      CREATE POLICY auth_users_self_read ON authorized_users
        FOR SELECT
        USING (
          clerk_id = current_setting('app.current_user_id', true)
        );
    `;

    console.log('   ✓ RLS policies created for "authorized_users"');

    // ─── Step 4: Create anonymized analytics view ──────────────────────────
    console.log('[4/5] Creating anonymized "click_analytics" view...');
    await sql`
      CREATE OR REPLACE VIEW click_analytics AS
      SELECT
        c.id,
        c.link_id,
        c.timestamp,
        c.country,
        CASE
          WHEN c.ip_address IS NOT NULL
          THEN encode(sha256(c.ip_address::bytea), 'hex')
          ELSE NULL
        END AS visitor_hash,
        CASE
          WHEN c.user_agent ILIKE '%Chrome%' THEN 'Chrome'
          WHEN c.user_agent ILIKE '%Firefox%' THEN 'Firefox'
          WHEN c.user_agent ILIKE '%Safari%' AND c.user_agent NOT ILIKE '%Chrome%' THEN 'Safari'
          WHEN c.user_agent ILIKE '%Edge%' THEN 'Edge'
          WHEN c.user_agent ILIKE '%bot%' OR c.user_agent ILIKE '%crawl%' THEN 'Bot'
          ELSE 'Other'
        END AS browser_family,
        CASE
          WHEN c.referrer IS NOT NULL AND c.referrer != ''
          THEN split_part(split_part(c.referrer, '://', 2), '/', 1)
          ELSE 'Direct'
        END AS referrer_domain
      FROM clicks c;
    `;

    console.log('   ✓ Anonymized analytics view created');

    // ─── Step 5: Create index for RLS performance ──────────────────────────
    console.log('[5/5] Creating supporting indexes for RLS performance...');
    await sql`CREATE INDEX IF NOT EXISTS idx_links_user_id_rls ON links (user_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_clicks_link_id_rls ON clicks (link_id);`;

    console.log('   ✓ Indexes created\n');
    console.log('═══════════════════════════════════════════════════════');
    console.log('🏛️  Sovereign Vault RLS migration completed successfully!');
    console.log('═══════════════════════════════════════════════════════');

  } catch (err) {
    console.error('❌ RLS migration failed:', err);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

applyRLS();
