"use server";

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
  return serverEngine.getAnonymizedCohortStats();
}

export async function mintOriginAnchorAction(
  originHash: string,
  publicKeyCredentialId: string
): Promise<TrustAnchor> {
  return serverEngine.mintOriginAnchor(originHash, publicKeyCredentialId);
}
