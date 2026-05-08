"use server";

import { db } from "@/lib/db";
import { sql, desc } from "drizzle-orm";
import { TrustDelegationEngineServer } from "@/lib/mrk/trust/TrustDelegationEngineServer";
import { TrustAnchor, DelegationInvite, RevocationEvent } from "@/lib/mrk/trust/TrustDelegationEngine";
import { clicks } from "@/lib/db/schema";

const serverEngine = new TrustDelegationEngineServer();

export async function isChainIntactAction(identityHash: string): Promise<boolean> {
  return serverEngine.isChainIntact(identityHash);
}

export async function emitDelegationInviteAction(
  emitterHash: string,
  inviteType?: 'trust_key' | 'ambassador_pass'
): Promise<DelegationInvite> {
  return serverEngine.emitDelegationInvite(emitterHash, inviteType);
}

export async function claimDelegationInviteAction(
  inviteCode: string,
  newEnrolleeHash: string,
  publicKeyCredentialId: string
): Promise<TrustAnchor> {
  return serverEngine.claimDelegationInvite(inviteCode, newEnrolleeHash, publicKeyCredentialId);
}

export async function revokeTrustAnchorAction(
  targetHash: string,
  initiatedBy: string
): Promise<RevocationEvent> {
  return serverEngine.revokeTrustAnchor(targetHash, initiatedBy);
}

export async function getTrustTreeAction(originHash: string): Promise<TrustAnchor | null> {
  return serverEngine.getTrustTree(originHash);
}

import crypto from "crypto";
import { cookies } from "next/headers";
import { generateRegistrationOptions, verifyRegistrationResponse } from '@simplewebauthn/server';

export async function getAnonymizedCohortStatsAction() {
  // Self-healing database mechanism for production Vercel environments
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "trust_anchors" (
          "id" text PRIMARY KEY NOT NULL,
          "public_key_credential_id" text NOT NULL,
          "enrollment_timestamp" timestamp DEFAULT now() NOT NULL,
          "trust_depth" integer NOT NULL,
          "parent_provenance_hash" text,
          "max_delegations" integer NOT NULL,
          "is_revoked" integer DEFAULT 0 NOT NULL
      );
    `);
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "delegation_invites" (
          "invite_code" text PRIMARY KEY NOT NULL,
          "emitted_by" text NOT NULL,
          "trust_depth" integer NOT NULL,
          "expires_at" timestamp NOT NULL,
          "max_uses" integer NOT NULL,
          "uses_remaining" integer NOT NULL,
          "status" text NOT NULL
      );
    `);
    await db.execute(sql`
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
    `);
  } catch (err) {
    console.error("Auto-migration failed:", err);
  }

  return serverEngine.getAnonymizedCohortStats();
}

export async function generateWebAuthnOptionsAction(username: string) {
  // Using a deterministic ID for demo purposes; normally this is the Clerk user ID
  const userId = "user_" + Buffer.from(username).toString("hex").substring(0, 16);
  
  const options = await generateRegistrationOptions({
    rpName: 'Mark Protocol Sovereign Vault',
    rpID: process.env.NODE_ENV === 'development' ? 'localhost' : 'v0-linksnip-dashboard.vercel.app',
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
    expectedOrigin: process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://v0-linksnip-dashboard.vercel.app',
    expectedRPID: process.env.NODE_ENV === 'development' ? 'localhost' : 'v0-linksnip-dashboard.vercel.app',
  });

  if (verification.verified && verification.registrationInfo) {
    const { credential } = verification.registrationInfo;
    const credentialIdStr = Buffer.from(credential.id).toString('base64url');
    
    // Clear challenge
    cookieStore.delete("webauthn_challenge");

    // Mint the Trust Anchor using the verified credential
    // Create a 64-char origin hash based on the credential ID
    const originHash = crypto.createHash('sha256').update(credentialIdStr).digest('hex');
    await serverEngine.mintOriginAnchor(originHash, credentialIdStr);

    return { verified: true, originHash };
  }

  throw new Error("Biometric signature failed verification.");
}

export async function getHandshakeEventsAction() {
  const recentClicks = await db.select().from(clicks).orderBy(desc(clicks.timestamp)).limit(100);
  
  return recentClicks.map(click => ({
    eventId: String(click.id),
    timestamp: click.timestamp.getTime(),
    // Ensure identityHash is a valid 64-char hex string
    identityHash: click.visitorHash && /^[a-f0-9]{64}$/.test(click.visitorHash) 
      ? click.visitorHash 
      : "0000000000000000000000000000000000000000000000000000000000000000",
    saltWindowId: Math.floor(click.timestamp.getTime() / (24 * 60 * 60 * 1000)),
    trustDepth: 0,
    linkTier: "public" as const,
    geoRegion: "UNKNOWN" as const,
    authMethod: "none" as const,
    outcome: "resolved" as const,
    latencyMs: 12.4,
    threatFlags: [],
  }));
}

export async function mintOriginAnchorAction(
  originHash: string,
  publicKeyCredentialId: string
): Promise<TrustAnchor> {
  return serverEngine.mintOriginAnchor(originHash, publicKeyCredentialId);
}
