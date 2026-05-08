// GhostVaultMinter.ts
// Mints Ghost Vault identities at the edge
// Zero raw PII storage - all identities are ephemeral hashes

interface GhostIdentity {
  hash: string;
  saltWindowId: number;
  createdAt: number;
  expiresAt: number;
  trustDepth: number;
  provenance: 'sovereign_seal' | 'imperial_charter' | 'ambassador_pass';
  parentProvenanceHash: string | null;
}

interface MintingRequest {
  ip: string;
  userAgent: string;
  deviceFingerprint: string;
  trustDepth: number;
  provenance: GhostIdentity['provenance'];
  parentProvenanceHash: string | null;
}

export class GhostVaultMinter {
  private readonly SALT_ROTATION_HOURS = 24;
  private readonly IDENTITY_TTL_HOURS = 24;

  async mintIdentity(request: MintingRequest): Promise<GhostIdentity> {
    const saltWindowId = this.getCurrentSaltWindow();
    const salt = await this.getSaltForWindow(saltWindowId);

    const rawIdentity = `${request.ip}|${request.userAgent}|${request.deviceFingerprint}`;
    
    const encoder = new TextEncoder();
    const data = encoder.encode(rawIdentity + salt);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    const now = Date.now();
    const identity: GhostIdentity = {
      hash,
      saltWindowId,
      createdAt: now,
      expiresAt: now + this.IDENTITY_TTL_HOURS * 60 * 60 * 1000,
      trustDepth: request.trustDepth,
      provenance: request.provenance,
      parentProvenanceHash: request.parentProvenanceHash,
    };

    await this.storeIdentity(identity);
    await this.purgeRawMaterials(request);

    return identity;
  }

  async validateIdentity(hash: string): Promise<boolean> {
    const identity = await this.getIdentity(hash);
    if (!identity) return false;

    if (Date.now() > identity.expiresAt) {
      await this.purgeIdentity(hash);
      return false;
    }

    return true;
  }

  async rehashForNewWindow(
    oldHash: string,
    newRequest: MintingRequest
  ): Promise<GhostIdentity | null> {
    const oldIdentity = await this.getIdentity(oldHash);
    if (!oldIdentity) return null;

    return this.mintIdentity({
      ...newRequest,
      trustDepth: oldIdentity.trustDepth,
      provenance: oldIdentity.provenance,
      parentProvenanceHash: oldIdentity.parentProvenanceHash,
    });
  }

  private getCurrentSaltWindow(): number {
    return Math.floor(Date.now() / (this.SALT_ROTATION_HOURS * 60 * 60 * 1000));
  }

  private async getSaltForWindow(windowId: number): Promise<string> {
    // In production: derive from a master key stored in environment secrets
    // Each window gets a unique salt that can be independently rotated
    const masterKey = (globalThis as any).__VAULT_MASTER_KEY__ || 'mrk-sovereign-vault-master';
    
    const encoder = new TextEncoder();
    const data = encoder.encode(`${masterKey}:${windowId}`);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private async storeIdentity(identity: GhostIdentity): Promise<void> {
    // In production: write to edge KV with TTL matching expiresAt
    const store = (globalThis as any).__GHOST_VAULT__ || {};
    store[identity.hash] = identity;
    (globalThis as any).__GHOST_VAULT__ = store;
  }

  private async getIdentity(hash: string): Promise<GhostIdentity | null> {
    const store = (globalThis as any).__GHOST_VAULT__ || {};
    return store[hash] || null;
  }

  private async purgeIdentity(hash: string): Promise<void> {
    const store = (globalThis as any).__GHOST_VAULT__ || {};
    delete store[hash];
    (globalThis as any).__GHOST_VAULT__ = store;
  }

  private async purgeRawMaterials(request: MintingRequest): Promise<void> {
    // Explicitly nullify raw PII - it must never be stored
    // The raw IP, UserAgent, and fingerprint exist only in this function's scope
    // and are garbage collected when the function returns
    (request as any).ip = null;
    (request as any).userAgent = null;
    (request as any).deviceFingerprint = null;
  }

  getIdentityStats(): { totalHashes: number; activeWindows: number } {
    const store = (globalThis as any).__GHOST_VAULT__ || {};
    const hashes = Object.keys(store);
    const windows = new Set(hashes.map(h => store[h]?.saltWindowId).filter(Boolean));
    
    return {
      totalHashes: hashes.length,
      activeWindows: windows.size,
    };
  }
}
