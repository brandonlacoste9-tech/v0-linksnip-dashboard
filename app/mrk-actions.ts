"use server";

import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { TrustDelegationEngineServer } from "@/lib/mrk/trust/TrustDelegationEngineServer";
import { TrustAnchor, DelegationInvite, RevocationEvent } from "@/lib/mrk/trust/TrustDelegationEngine";

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

export async function mintOriginAnchorAction(
  originHash: string,
  publicKeyCredentialId: string
): Promise<TrustAnchor> {
  return serverEngine.mintOriginAnchor(originHash, publicKeyCredentialId);
}
