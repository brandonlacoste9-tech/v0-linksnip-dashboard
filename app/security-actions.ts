"use server";

import { db } from "@/lib/db";
import { sql, desc } from "drizzle-orm";
import { AuthorityDelegationEngineServer } from "@/lib/security/trust/AuthorityDelegationEngineServer";
import { AccessAnchor, AccessInvite, RevocationEvent } from "@/lib/security/trust/AuthorityDelegationEngine";
import { clicks } from "@/lib/db/schema";

const serverEngine = new AuthorityDelegationEngineServer();

export async function isChainIntactAction(identityHash: string): Promise<boolean> {
  return serverEngine.isChainIntact(identityHash);
}

export async function emitAccessInviteAction(
  emitterHash: string,
  inviteType?: 'security_key' | 'access_pass'
): Promise<AccessInvite> {
  return serverEngine.emitAccessInvite(emitterHash, inviteType);
}

export async function claimAccessInviteAction(
  inviteCode: string,
  newEnrolleeHash: string,
  publicKeyCredentialId: string
): Promise<AccessAnchor> {
  return serverEngine.claimAccessInvite(inviteCode, newEnrolleeHash, publicKeyCredentialId);
}

export async function revokeAccessIdentityAction(
  targetHash: string,
  initiatedBy: string
): Promise<RevocationEvent> {
  return serverEngine.revokeAccessIdentity(targetHash, initiatedBy);
}

export async function getAccessTreeAction(originHash: string): Promise<AccessAnchor | null> {
  return serverEngine.getAccessTree(originHash);
}

import crypto from "crypto";
import { cookies } from "next/headers";
import { generateRegistrationOptions, verifyRegistrationResponse } from '@simplewebauthn/server';

export async function getAnonymizedCohortStatsAction() {
  // Self-healing database mechanism for production Vercel environments
  try {
    // 1. Core Table Provisioning (Combined into one fast execution to prevent Vercel timeouts)
    try {
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS "authorized_users" (
          "id" serial PRIMARY KEY,
          "clerk_id" text NOT NULL UNIQUE,
          "email" text,
          "role" text DEFAULT 'admin' NOT NULL,
          "created_at" timestamp DEFAULT now() NOT NULL
        );

        CREATE TABLE IF NOT EXISTS "links" (
          "id" serial PRIMARY KEY,
          "user_id" text,
          "visitor_id" text,
          "original_url" text NOT NULL,
          "short_code" text NOT NULL UNIQUE,
          "clicks" integer DEFAULT 0 NOT NULL,
          "created_at" timestamp DEFAULT now() NOT NULL
        );

        CREATE TABLE IF NOT EXISTS "clicks" (
          "id" serial PRIMARY KEY,
          "link_id" integer NOT NULL,
          "timestamp" timestamp DEFAULT now() NOT NULL,
          "ip_address" text,
          "visitor_hash" text,
          "country" text,
          "user_agent" text,
          "referrer" text
        );

        CREATE TABLE IF NOT EXISTS "security_identities" (
            "id" text PRIMARY KEY NOT NULL,
            "credential_id" text NOT NULL,
            "enrollment_timestamp" timestamp DEFAULT now() NOT NULL,
            "authority_level" integer NOT NULL,
            "parent_identity_hash" text,
            "max_delegations" integer NOT NULL,
            "is_revoked" integer DEFAULT 0 NOT NULL
        );

        CREATE TABLE IF NOT EXISTS "access_invites" (
            "invite_code" text PRIMARY KEY NOT NULL,
            "issued_by" text NOT NULL,
            "authority_level" integer NOT NULL,
            "expires_at" timestamp NOT NULL,
            "max_uses" integer NOT NULL,
            "uses_remaining" integer NOT NULL,
            "status" text NOT NULL
        );

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

        CREATE TABLE IF NOT EXISTS "sentinel_alerts" (
          "id" serial PRIMARY KEY,
          "type" text NOT NULL,
          "severity" text NOT NULL,
          "message" text NOT NULL,
          "metadata" jsonb DEFAULT '{}',
          "acknowledged" boolean DEFAULT false,
          "created_at" timestamp DEFAULT now() NOT NULL
        );
      `);
    } catch (e) {
      console.warn("Table provisioning failed:", e);
    }

    // 2. Migrate legacy tables and columns
    try {
      // Migrate legacy tables if they exist
      await db.execute(sql`
        DO $$ 
        BEGIN 
          IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='trust_anchors') 
          AND NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='security_identities') THEN
            ALTER TABLE "trust_anchors" RENAME TO "security_identities";
          END IF;
          IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='delegation_invites') 
          AND NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='access_invites') THEN
            ALTER TABLE "delegation_invites" RENAME TO "access_invites";
          END IF;
        END $$;
      `);

      // Ensure security_identities and access_invites column alignment
      await db.execute(sql`
        DO $$ 
        BEGIN 
          IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='security_identities' AND column_name='public_key_credential_id') THEN
            ALTER TABLE "security_identities" RENAME COLUMN "public_key_credential_id" TO "credential_id";
          END IF;
          IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='access_invites' AND column_name='emitted_by') THEN
            ALTER TABLE "access_invites" RENAME COLUMN "emitted_by" TO "issued_by";
          END IF;
        END $$;
      `);

      // Ensure clicks.timestamp exists (rename if legacy created_at exists)
      await db.execute(sql`
        DO $$ 
        BEGIN 
          IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='clicks' AND column_name='created_at') 
          AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='clicks' AND column_name='timestamp') THEN
            ALTER TABLE "clicks" RENAME COLUMN "created_at" TO "timestamp";
          ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='clicks' AND column_name='timestamp') THEN
            ALTER TABLE "clicks" ADD COLUMN "timestamp" timestamp DEFAULT now() NOT NULL;
          END IF;
        END $$;
      `);

      // Ensure links.visitor_id exists
      // Ensure legacy schema changes are applied quickly
      await db.execute(sql`
        ALTER TABLE "links" ADD COLUMN IF NOT EXISTS "visitor_id" text;
        ALTER TABLE "clicks" ADD COLUMN IF NOT EXISTS "ip_address" text;
        ALTER TABLE "clicks" ADD COLUMN IF NOT EXISTS "visitor_hash" text;
        ALTER TABLE "clicks" ADD COLUMN IF NOT EXISTS "country" text;
        ALTER TABLE "clicks" ADD COLUMN IF NOT EXISTS "user_agent" text;
        ALTER TABLE "clicks" ADD COLUMN IF NOT EXISTS "referrer" text;
      `);
    } catch (e) {
      console.error("Hardened column alignment failed:", e);
    }
  } catch (err) {
    console.error("Auto-migration failed:", err);
  }

  return serverEngine.getAnonymizedCohortStats();
}

export async function generateWebAuthnOptionsAction(username: string) {
  // Using a deterministic ID for demo purposes; normally this is the Clerk user ID
  const userId = "user_" + Buffer.from(username).toString("hex").substring(0, 16);
  
  const options = await generateRegistrationOptions({
    rpName: 'Zipd Security',
    rpID: process.env.NODE_ENV === 'development' ? 'localhost' : 'zipd.io',
    userID: new Uint8Array(new TextEncoder().encode(userId)),
    userName: username,
    attestationType: 'none',
    authenticatorSelection: {
      residentKey: 'required',
      userVerification: 'required',
    },
  });

  // Save challenge securely in HttpOnly cookie to verify later
  const cookieStore = await cookies();
  cookieStore.set("webauthn_challenge", options.challenge, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    sameSite: "lax",
    maxAge: 60 * 5, // 5 minutes
  });

  return options;
}

export async function verifyWebAuthnRegistrationAction(attResp: any) {
  const cookieStore = await cookies();
  const expectedChallenge = cookieStore.get("webauthn_challenge")?.value;

  if (!expectedChallenge) {
    throw new Error("Challenge expired. Please try again.");
  }

  const verification = await verifyRegistrationResponse({
    response: attResp,
    expectedChallenge,
    expectedOrigin: process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://zipd.io',
    expectedRPID: process.env.NODE_ENV === 'development' ? 'localhost' : 'zipd.io',
  });

  if (verification.verified && verification.registrationInfo) {
    const { credential } = verification.registrationInfo;
    const credentialIdStr = Buffer.from(credential.id).toString('base64url');
    
    // Clear challenge
    cookieStore.delete("webauthn_challenge");

    // Mint the Security Identity using the verified credential
    // Create a 64-char origin hash based on the credential ID
    const originHash = crypto.createHash('sha256').update(credentialIdStr).digest('hex');
    await serverEngine.mintOriginIdentity(originHash, credentialIdStr);

    return { verified: true, originHash };
  }

  throw new Error("Biometric signature failed verification.");
}

export async function getSecurityEventsAction() {
  try {
    const recentClicks = await db.select().from(clicks).orderBy(desc(clicks.timestamp)).limit(100);
    
    return (recentClicks || []).map(click => ({
      eventId: String(click.id),
      timestamp: click.timestamp instanceof Date ? click.timestamp.getTime() : new Date(click.timestamp).getTime(),
      // Ensure identityHash is a valid 64-char hex string
      identityHash: click.visitorHash && /^[a-f0-9]{64}$/.test(click.visitorHash) 
        ? click.visitorHash 
        : "0000000000000000000000000000000000000000000000000000000000000000",
      saltWindowId: Math.floor((click.timestamp instanceof Date ? click.timestamp.getTime() : new Date(click.timestamp).getTime()) / (24 * 60 * 60 * 1000)),
      authorityLevel: 0,
      linkTier: "public" as const,
      geoRegion: "UNKNOWN" as const,
      authMethod: "none" as const,
      outcome: "resolved" as const,
      latencyMs: 12.4,
      threatFlags: [],
    }));
  } catch (err) {
    console.error("Failed to fetch security events (possibly pending migration):", err);
    return [];
  }
}

export async function mintOriginIdentityAction(
  originHash: string,
  publicKeyCredentialId: string
): Promise<AccessAnchor> {
  return serverEngine.mintOriginIdentity(originHash, publicKeyCredentialId);
}

export async function getSentinelAlertsAction() {
  try {
    const alerts = await db.execute(sql`
      SELECT * FROM sentinel_alerts 
      ORDER BY created_at DESC 
      LIMIT 50
    `);
    return alerts || [];
  } catch (err) {
    console.error("Failed to fetch sentinel alerts:", err);
    return [];
  }
}
