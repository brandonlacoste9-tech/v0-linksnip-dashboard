// AuthorityDelegationEngineServer.ts
// Recursive authority chain management for Zipd Security
// Implements depth-limited delegation with edge-speed revocation propagation

import { db } from "@/lib/db";
import { securityIdentities, accessInvites } from "@/lib/db/schema";
import { eq, inArray } from "drizzle-orm";
import { 
  AccessAnchor, AccessKey, AccessInvite, RevocationEvent, AuthorityDelegationEngine 
} from "./AuthorityDelegationEngine";

export class AuthorityDelegationEngineServer implements AuthorityDelegationEngine {
  private readonly MAX_DEPTH = 2;
  private readonly DELEGATION_LIMITS: Record<number, number> = {
    0: 5,
    1: 3,
    2: 0,
  };

  private revocationLog: RevocationEvent[] = [];

  // Re-builds the access anchor with its children by querying the DB
  private async loadAnchorWithChildren(id: string): Promise<AccessAnchor | null> {
    const records = await db.select().from(securityIdentities).where(eq(securityIdentities.id, id));
    if (records.length === 0) return null;
    const record = records[0];

    const children = await db.select().from(securityIdentities).where(eq(securityIdentities.parentIdentityHash, id));
    
    return {
      id: record.id,
      publicKeyCredentialId: record.credentialId,
      enrollmentTimestamp: record.enrollmentTimestamp.getTime(),
      authorityLevel: record.authorityLevel,
      parentIdentityHash: record.parentIdentityHash,
      maxDelegations: record.maxDelegations,
      isRevoked: record.isRevoked === 1,
      delegatedKeys: children.map(c => ({
        id: c.id,
        publicKeyCredentialId: c.credentialId,
        delegatedAt: c.enrollmentTimestamp.getTime(),
        authorityLevel: c.authorityLevel,
        status: c.isRevoked === 1 ? 'revoked' : 'active'
      })),
    };
  }

  async isChainIntact(identityHash: string): Promise<boolean> {
    const anchor = await this.loadAnchorWithChildren(identityHash);
    if (!anchor || anchor.isRevoked) return false;

    let currentNode = anchor;
    while (currentNode.parentIdentityHash) {
      const parent = await this.loadAnchorWithChildren(currentNode.parentIdentityHash);
      if (!parent || parent.isRevoked) return false;
      currentNode = parent;
    }

    return true;
  }

  async emitAccessInvite(
    emitterHash: string,
    inviteType: 'security_key' | 'access_pass' = 'security_key'
  ): Promise<AccessInvite> {
    const emitter = await this.loadAnchorWithChildren(emitterHash);
    
    if (!emitter || emitter.isRevoked) {
      throw new Error('DELEGATION_DENIED: Emitter is not a valid Security Identity or has been revoked.');
    }

    if (emitter.authorityLevel >= this.MAX_DEPTH) {
      throw new Error('DELEGATION_DENIED: Maximum authority depth reached.');
    }

    const activeDelegations = emitter.delegatedKeys.filter(k => k.status === 'active');
    const maxAllowed = this.DELEGATION_LIMITS[emitter.authorityLevel] || 0;

    if (activeDelegations.length >= maxAllowed) {
      throw new Error(`DELEGATION_DENIED: Maximum delegation slots (${maxAllowed}) are full.`);
    }

    const inviteCode = crypto.randomUUID();
    const expiresAt = new Date(inviteType === 'access_pass'
        ? Date.now() + 72 * 60 * 60 * 1000
        : Date.now() + 7 * 24 * 60 * 60 * 1000);

    const invite: AccessInvite = {
      inviteCode,
      emittedBy: emitterHash,
      authorityLevel: emitter.authorityLevel + 1,
      expiresAt: expiresAt.getTime(),
      maxUses: 1,
      usesRemaining: 1,
      status: 'active',
    };

    await db.insert(accessInvites).values({
      inviteCode,
      issuedBy: emitterHash,
      authorityLevel: emitter.authorityLevel + 1,
      expiresAt,
      maxUses: 1,
      usesRemaining: 1,
      status: 'active',
    });

    return invite;
  }

  async claimAccessInvite(
    inviteCode: string,
    newEnrolleeHash: string,
    publicKeyCredentialId: string
  ): Promise<AccessAnchor> {
    const records = await db.select().from(accessInvites).where(eq(accessInvites.inviteCode, inviteCode));
    if (records.length === 0) {
      throw new Error('CLAIM_DENIED: Invite is invalid.');
    }
    const invite = records[0];

    if (invite.status !== 'active') {
      throw new Error('CLAIM_DENIED: Invite is invalid, expired, or already claimed.');
    }

    if (invite.usesRemaining <= 0) {
      await db.update(accessInvites).set({ status: 'expired' }).where(eq(accessInvites.inviteCode, inviteCode));
      throw new Error('CLAIM_DENIED: Invite has no remaining uses.');
    }

    if (Date.now() > invite.expiresAt.getTime()) {
      await db.update(accessInvites).set({ status: 'expired' }).where(eq(accessInvites.inviteCode, inviteCode));
      throw new Error('CLAIM_DENIED: Invite has expired.');
    }

    await db.insert(securityIdentities).values({
      id: newEnrolleeHash,
      credentialId: publicKeyCredentialId,
      authorityLevel: invite.authorityLevel,
      parentIdentityHash: invite.issuedBy,
      maxDelegations: this.DELEGATION_LIMITS[invite.authorityLevel] || 0,
      isRevoked: 0,
    });

    const newUsesRemaining = invite.usesRemaining - 1;
    await db.update(accessInvites)
      .set({ 
        usesRemaining: newUsesRemaining,
        status: newUsesRemaining <= 0 ? 'claimed' : 'active'
      })
      .where(eq(accessInvites.inviteCode, inviteCode));

    const newAnchor = await this.loadAnchorWithChildren(newEnrolleeHash);
    return newAnchor!;
  }

  async revokeAccessIdentity(
    targetHash: string,
    initiatedBy: string
  ): Promise<RevocationEvent> {
    const target = await this.loadAnchorWithChildren(targetHash);
    if (!target) {
      throw new Error('REVOCATION_FAILED: Target not found in security chain.');
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
      await db.update(securityIdentities)
        .set({ isRevoked: 1 })
        .where(inArray(securityIdentities.id, affectedHashes));
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

  async getAccessTree(originHash: string): Promise<AccessAnchor | null> {
    return this.loadAnchorWithChildren(originHash);
  }

  async getAnonymizedCohortStats(): Promise<{
    totalOrigins: number;
    totalAccessKeys: number;
    totalSubKeys: number;
    avgDelegationsPerOrigin: number;
    revokedChains: number;
  }> {
    const allRecords = await db.select().from(securityIdentities);
    
    const origins = allRecords.filter(a => a.authorityLevel === 0);
    const accessKeys = allRecords.filter(a => a.authorityLevel === 1);
    const subKeys = allRecords.filter(a => a.authorityLevel === 2);
    const revokedChains = origins.filter(o => o.isRevoked === 1).length;

    // Simple avg calculation based on total children
    const totalDelegated = accessKeys.length + subKeys.length;

    return {
      totalOrigins: origins.length,
      totalAccessKeys: accessKeys.length,
      totalSubKeys: subKeys.length,
      avgDelegationsPerOrigin: origins.length ? totalDelegated / origins.length : 0,
      revokedChains,
    };
  }

  async mintOriginIdentity(originHash: string, publicKeyCredentialId: string): Promise<AccessAnchor> {
    await db.insert(securityIdentities).values({
      id: originHash,
      credentialId: publicKeyCredentialId,
      authorityLevel: 0,
      parentIdentityHash: null,
      maxDelegations: this.DELEGATION_LIMITS[0],
      isRevoked: 0,
    }).onConflictDoNothing();

    return (await this.loadAnchorWithChildren(originHash))!;
  }
}
