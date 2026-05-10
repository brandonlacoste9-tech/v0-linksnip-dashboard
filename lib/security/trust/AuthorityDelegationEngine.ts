export interface AccessAnchor {
  id: string;
  publicKeyCredentialId: string;
  enrollmentTimestamp: number;
  authorityLevel: number;
  parentIdentityHash: string | null;
  delegatedKeys: AccessKey[];
  maxDelegations: number;
  isRevoked: boolean;
}

export interface AccessKey {
  id: string;
  publicKeyCredentialId: string;
  delegatedAt: number;
  authorityLevel: number;
  status: 'active' | 'revoked' | 'unclaimed';
}

export interface AccessInvite {
  inviteCode: string;
  emittedBy: string;
  authorityLevel: number;
  expiresAt: number;
  maxUses: number;
  usesRemaining: number;
  status: 'active' | 'claimed' | 'expired' | 'revoked';
}

export interface RevocationEvent {
  targetHash: string;
  initiatedBy: string;
  cascadeDepth: number;
  timestamp: number;
  propagatedToEdge: boolean;
}

// The interface that the client will use
export interface AuthorityDelegationEngine {
  isChainIntact(identityHash: string): Promise<boolean>;
  emitAccessInvite(emitterHash: string, inviteType?: 'security_key' | 'access_pass'): Promise<AccessInvite>;
  claimAccessInvite(inviteCode: string, newEnrolleeHash: string, publicKeyCredentialId: string): Promise<AccessAnchor>;
  revokeAccessIdentity(targetHash: string, initiatedBy: string): Promise<RevocationEvent>;
  getAccessTree(originHash: string): Promise<AccessAnchor | null>;
  getAnonymizedCohortStats(): Promise<{
    totalOrigins: number;
    totalAccessKeys: number;
    totalSubKeys: number;
    avgDelegationsPerOrigin: number;
    revokedChains: number;
  }>;
  mintOriginIdentity(originHash: string, publicKeyCredentialId: string): Promise<AccessAnchor>;
}
