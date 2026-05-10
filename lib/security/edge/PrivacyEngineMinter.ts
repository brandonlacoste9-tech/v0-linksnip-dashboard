// PrivacyEngineMinter.ts
// Mints Privacy Engine identities at the edge
// Zero raw PII storage - all identities are ephemeral hashes

interface PrivacyIdentity {
  hash: string;
  saltWindowId: number;
  createdAt: number;
  expiresAt: number;
  authorityLevel: number;
  authType: 'biometric' | 'master' | 'delegated';
  parentIdentityHash: string | null;
}

interface MintingRequest {
  ip: string;
  userAgent: string;
  deviceFingerprint: string;
  authorityLevel: number;
  authType: PrivacyIdentity['authType'];
  parentIdentityHash: string | null;
}

export class PrivacyEngineMinter {
  private readonly SALT_ROTATION_HOURS = 24;
  private readonly IDENTITY_TTL_HOURS = 24;

  async mintIdentity(request: MintingRequest): Promise<PrivacyIdentity> {
    const saltWindowId = this.getCurrentSaltWindow();
    const salt = await this.getSaltForWindow(saltWindowId);

    const rawIdentity = `${request.ip}|${request.userAgent}|${request.deviceFingerprint}`;
    
    const encoder = new TextEncoder();
    const data = encoder.encode(rawIdentity + salt);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    const now = Date.now();
    const identity: PrivacyIdentity = {
      hash,
      saltWindowId,
      createdAt: now,
      expiresAt: now + this.IDENTITY_TTL_HOURS * 60 * 60 * 1000,
      authorityLevel: request.authorityLevel,
      authType: request.authType,
      parentIdentityHash: request.parentIdentityHash,
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
  ): Promise<PrivacyIdentity | null> {
    const oldIdentity = await this.getIdentity(oldHash);
    if (!oldIdentity) return null;

    return this.mintIdentity({
      ...newRequest,
      authorityLevel: oldIdentity.authorityLevel,
      authType: oldIdentity.authType,
      parentIdentityHash: oldIdentity.parentIdentityHash,
    });
  }

  private getCurrentSaltWindow(): number {
    return Math.floor(Date.now() / (this.SALT_ROTATION_HOURS * 60 * 60 * 1000));
  }

  private async getSaltForWindow(windowId: number): Promise<string> {
    // In production: derive from a master key stored in environment secrets
    // Each window gets a unique salt that can be independently rotated
    const masterKey = (globalThis as any).__VAULT_MASTER_KEY__ || 'zipd-privacy-vault-master';
    
    const encoder = new TextEncoder();
    const data = encoder.encode(`${masterKey}:${windowId}`);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private async storeIdentity(identity: PrivacyIdentity): Promise<void> {
    // In production: write to edge KV with TTL matching expiresAt
    const store = (globalThis as any).__PRIVACY_ENGINE__ || {};
    store[identity.hash] = identity;
    (globalThis as any).__PRIVACY_ENGINE__ = store;
  }

  private async getIdentity(hash: string): Promise<PrivacyIdentity | null> {
    const store = (globalThis as any).__PRIVACY_ENGINE__ || {};
    return store[hash] || null;
  }

  private async purgeIdentity(hash: string): Promise<void> {
    const store = (globalThis as any).__PRIVACY_ENGINE__ || {};
    delete store[hash];
    (globalThis as any).__PRIVACY_ENGINE__ = store;
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
    const store = (globalThis as any).__PRIVACY_ENGINE__ || {};
    const hashes = Object.keys(store);
    const windows = new Set(hashes.map(h => store[h]?.saltWindowId).filter(Boolean));
    
    return {
      totalHashes: hashes.length,
      activeWindows: windows.size,
    };
  }
}
