import postgres from 'postgres';
import { config } from 'dotenv';
config({ path: '.env.local' });

async function fix() {
  const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require' });
  
  console.log('🚀 Pushing missing tables to Neon using postgresjs...');
  
  await sql`
    CREATE TABLE IF NOT EXISTS "bridge_tokens" (
        "id" serial PRIMARY KEY NOT NULL,
        "name" text NOT NULL,
        "token" text NOT NULL,
        "user_id" text,
        "last_used_at" timestamp,
        "expires_at" timestamp,
        "created_at" timestamp DEFAULT now() NOT NULL,
        CONSTRAINT "bridge_tokens_token_unique" UNIQUE("token")
    );
  `;
  console.log('Created bridge_tokens');
  
  await sql`
    CREATE TABLE IF NOT EXISTS "delegation_invites" (
        "invite_code" text PRIMARY KEY NOT NULL,
        "emitted_by" text NOT NULL,
        "trust_depth" integer NOT NULL,
        "expires_at" timestamp NOT NULL,
        "max_uses" integer NOT NULL,
        "uses_remaining" integer NOT NULL,
        "status" text NOT NULL
    );
  `;
  console.log('Created delegation_invites');
  
  await sql`
    CREATE TABLE IF NOT EXISTS "trust_anchors" (
        "id" text PRIMARY KEY NOT NULL,
        "public_key_credential_id" text NOT NULL,
        "enrollment_timestamp" timestamp DEFAULT now() NOT NULL,
        "trust_depth" integer NOT NULL,
        "parent_provenance_hash" text,
        "max_delegations" integer NOT NULL,
        "is_revoked" integer DEFAULT 0 NOT NULL
    );
  `;
  console.log('Created trust_anchors');
  
  console.log('✅ Missing tables created successfully!');
  process.exit(0);
}

fix().catch(err => {
    console.error('❌ Failed:', err);
    process.exit(1);
});
