export interface TrustAnchor {
  id: string;
  publicKeyCredentialId: string;
  enrollmentTimestamp: number;
  trustDepth: number;
  parentProvenanceHash: string | null;
  delegatedKeys: TrustKey[];
  maxDelegations: number;
  isRevoked: boolean;
}

export interface TrustKey {
  id: string;
  publicKeyCredentialId: string;
  delegatedAt: number;
  trustDepth: number;
  status: 'active' | 'revoked' | 'unclaimed';
}

export interface DelegationInvite {
  inviteCode: string;
  emittedBy: string;
  trustDepth: number;
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
export interface TrustDelegationEngine {
  isChainIntact(identityHash: string): Promise<boolean>;
  emitDelegationInvite(emitterHash: string, inviteType?: 'trust_key' | 'ambassador_pass'): Promise<DelegationInvite>;
  claimDelegationInvite(inviteCode: string, newEnrolleeHash: string, publicKeyCredentialId: string): Promise<TrustAnchor>;
  revokeTrustAnchor(targetHash: string, initiatedBy: string): Promise<RevocationEvent>;
  getTrustTree(originHash: string): Promise<TrustAnchor | null>;
  getAnonymizedCohortStats(): Promise<{
    totalOrigins: number;
    totalTrustKeys: number;
    totalSubKeys: number;
    avgDelegationsPerOrigin: number;
    revokedChains: number;
  }>;
  mintOriginAnchor(originHash: string, publicKeyCredentialId: string): Promise<TrustAnchor>;
}
