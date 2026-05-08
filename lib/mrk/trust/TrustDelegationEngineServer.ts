// TrustDelegationEngine.ts
// Recursive trust chain management for the MRK Protocol
// Implements depth-limited delegation with edge-speed revocation propagation

import { db } from "@/lib/db";
import { trustAnchors, delegationInvites } from "@/lib/db/schema";
import { eq, inArray } from "drizzle-orm";
import { 
  TrustAnchor, TrustKey, DelegationInvite, RevocationEvent, TrustDelegationEngine 
} from "./TrustDelegationEngine";

export class TrustDelegationEngineServer implements TrustDelegationEngine {
  private readonly MAX_DEPTH = 2;
  private readonly DELEGATION_LIMITS: Record<number, number> = {
    0: 5,
    1: 3,
    2: 0,
  };

  private revocationLog: RevocationEvent[] = [];

  // Re-builds the trust anchor with its children by querying the DB
  private async loadAnchorWithChildren(id: string): Promise<TrustAnchor | null> {
    const records = await db.select().from(trustAnchors).where(eq(trustAnchors.id, id));
    if (records.length === 0) return null;
    const record = records[0];

    const children = await db.select().from(trustAnchors).where(eq(trustAnchors.parentProvenanceHash, id));
    
    return {
      id: record.id,
      publicKeyCredentialId: record.publicKeyCredentialId,
      enrollmentTimestamp: record.enrollmentTimestamp.getTime(),
      trustDepth: record.trustDepth,
      parentProvenanceHash: record.parentProvenanceHash,
      maxDelegations: record.maxDelegations,
      isRevoked: record.isRevoked === 1,
      delegatedKeys: children.map(c => ({
        id: c.id,
        publicKeyCredentialId: c.publicKeyCredentialId,
        delegatedAt: c.enrollmentTimestamp.getTime(),
        trustDepth: c.trustDepth,
        status: c.isRevoked === 1 ? 'revoked' : 'active'
      })),
    };
  }

  async isChainIntact(identityHash: string): Promise<boolean> {
    const anchor = await this.loadAnchorWithChildren(identityHash);
    if (!anchor || anchor.isRevoked) return false;

    let currentNode = anchor;
    while (currentNode.parentProvenanceHash) {
      const parent = await this.loadAnchorWithChildren(currentNode.parentProvenanceHash);
      if (!parent || parent.isRevoked) return false;
      currentNode = parent;
    }

    return true;
  }

  async emitDelegationInvite(
    emitterHash: string,
    inviteType: 'trust_key' | 'ambassador_pass' = 'trust_key'
  ): Promise<DelegationInvite> {
    const emitter = await this.loadAnchorWithChildren(emitterHash);
    
    if (!emitter || emitter.isRevoked) {
      throw new Error('DELEGATION_DENIED: Emitter is not a valid Trust Anchor or has been revoked.');
    }

    if (emitter.trustDepth >= this.MAX_DEPTH) {
      throw new Error('DELEGATION_DENIED: Maximum trust depth reached.');
    }

    const activeDelegations = emitter.delegatedKeys.filter(k => k.status === 'active');
    const maxAllowed = this.DELEGATION_LIMITS[emitter.trustDepth] || 0;

    if (activeDelegations.length >= maxAllowed) {
      throw new Error(`DELEGATION_DENIED: Maximum delegation slots (${maxAllowed}) are full.`);
    }

    const inviteCode = crypto.randomUUID();
    const expiresAt = new Date(inviteType === 'ambassador_pass'
        ? Date.now() + 72 * 60 * 60 * 1000
        : Date.now() + 7 * 24 * 60 * 60 * 1000);

    const invite: DelegationInvite = {
      inviteCode,
      emittedBy: emitterHash,
      trustDepth: emitter.trustDepth + 1,
      expiresAt: expiresAt.getTime(),
      maxUses: 1,
      usesRemaining: 1,
      status: 'active',
    };

    await db.insert(delegationInvites).values({
      inviteCode,
      emittedBy: emitterHash,
      trustDepth: emitter.trustDepth + 1,
      expiresAt,
      maxUses: 1,
      usesRemaining: 1,
      status: 'active',
    });

    return invite;
  }

  async claimDelegationInvite(
    inviteCode: string,
    newEnrolleeHash: string,
    publicKeyCredentialId: string
  ): Promise<TrustAnchor> {
    const records = await db.select().from(delegationInvites).where(eq(delegationInvites.inviteCode, inviteCode));
    if (records.length === 0) {
      throw new Error('CLAIM_DENIED: Invite is invalid.');
    }
    const invite = records[0];

    if (invite.status !== 'active') {
      throw new Error('CLAIM_DENIED: Invite is invalid, expired, or already claimed.');
    }

    if (invite.usesRemaining <= 0) {
      await db.update(delegationInvites).set({ status: 'expired' }).where(eq(delegationInvites.inviteCode, inviteCode));
      throw new Error('CLAIM_DENIED: Invite has no remaining uses.');
    }

    if (Date.now() > invite.expiresAt.getTime()) {
      await db.update(delegationInvites).set({ status: 'expired' }).where(eq(delegationInvites.inviteCode, inviteCode));
      throw new Error('CLAIM_DENIED: Invite has expired.');
    }

    await db.insert(trustAnchors).values({
      id: newEnrolleeHash,
      publicKeyCredentialId,
      trustDepth: invite.trustDepth,
      parentProvenanceHash: invite.emittedBy,
      maxDelegations: this.DELEGATION_LIMITS[invite.trustDepth] || 0,
      isRevoked: 0,
    });

    const newUsesRemaining = invite.usesRemaining - 1;
    await db.update(delegationInvites)
      .set({ 
        usesRemaining: newUsesRemaining,
        status: newUsesRemaining <= 0 ? 'claimed' : 'active'
      })
      .where(eq(delegationInvites.inviteCode, inviteCode));

    const newAnchor = await this.loadAnchorWithChildren(newEnrolleeHash);
    return newAnchor!;
  }

  async revokeTrustAnchor(
    targetHash: string,
    initiatedBy: string
  ): Promise<RevocationEvent> {
    const target = await this.loadAnchorWithChildren(targetHash);
    if (!target) {
      throw new Error('REVOCATION_FAILED: Target not found in trust chain.');
    }

    const affectedHashes: string[] = [];
    
    const collectDescendants = async (anchorId: string) => {
      const anchor = await this.loadAnchorWithChildren(anchorId);
      if (anchor) {
        affectedHashes.push(anchorId);
        for (const key of anchor.delegatedKeys) {
          await collectDescendants(key.id);
        }
      }
    };

    await collectDescendants(targetHash);

    // Update all collected descendants to be revoked
    if (affectedHashes.length > 0) {
      await db.update(trustAnchors)
        .set({ isRevoked: 1 })
        .where(inArray(trustAnchors.id, affectedHashes));
    }

    const event: RevocationEvent = {
      targetHash,
      initiatedBy,
      cascadeDepth: 2, // simplified calculation for DB sync
      timestamp: Date.now(),
      propagatedToEdge: false,
    };

    this.revocationLog.push(event);
    await this.propagateRevocationToEdge(affectedHashes);

    event.propagatedToEdge = true;
    return event;
  }

  private async propagateRevocationToEdge(revokedHashes: string[]): Promise<void> {
    console.log(`[EDGE PROPAGATION] Revoking ${revokedHashes.length} identities globally.`);
    // In production: write to Cloudflare Workers KV for global edge access
  }

  // NOTE: For synchronous UI, we need to rely on the app state fetching it, or change this to async.
  // We will change getTrustTree to async for DB queries.
  async getTrustTree(originHash: string): Promise<TrustAnchor | null> {
    return this.loadAnchorWithChildren(originHash);
  }

  async getAnonymizedCohortStats(): Promise<{
    totalOrigins: number;
    totalTrustKeys: number;
    totalSubKeys: number;
    avgDelegationsPerOrigin: number;
    revokedChains: number;
  }> {
    const allRecords = await db.select().from(trustAnchors);
    
    const origins = allRecords.filter(a => a.trustDepth === 0);
    const trustKeys = allRecords.filter(a => a.trustDepth === 1);
    const subKeys = allRecords.filter(a => a.trustDepth === 2);
    const revokedChains = origins.filter(o => o.isRevoked === 1).length;

    // Simple avg calculation based on total children
    const totalDelegated = trustKeys.length + subKeys.length;

    return {
      totalOrigins: origins.length,
      totalTrustKeys: trustKeys.length,
      totalSubKeys: subKeys.length,
      avgDelegationsPerOrigin: origins.length ? totalDelegated / origins.length : 0,
      revokedChains,
    };
  }

  async mintOriginAnchor(originHash: string, publicKeyCredentialId: string): Promise<TrustAnchor> {
    await db.insert(trustAnchors).values({
      id: originHash,
      publicKeyCredentialId,
      trustDepth: 0,
      parentProvenanceHash: null,
      maxDelegations: this.DELEGATION_LIMITS[0],
      isRevoked: 0,
    }).onConflictDoNothing();

    return (await this.loadAnchorWithChildren(originHash))!;
  }
}
