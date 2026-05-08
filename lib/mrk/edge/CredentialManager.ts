// CredentialManager.ts
// Edge-side Credential Management for MRK VIP Enrollment
// Handles WebAuthn challenge-response cycle

import { generateRegistrationOptions, verifyRegistrationResponse } from '@simplewebauthn/server';

interface EnrollmentUser {
  id: string;
  username: string;
}

interface EnrollmentOptions {
  challenge: string;
  rp: {
    name: string;
    id: string;
  };
  user: {
    id: string;
    name: string;
    displayName: string;
  };
  pubKeyCredParams: Array<{
    type: string;
    alg: number;
  }>;
  timeout: number;
  attestation: string;
  authenticatorSelection: {
    residentKey: string;
    userVerification: string;
  };
}

interface EnrollmentResult {
  id: string;
  publicKey: string;
  verified: boolean;
}

export class CredentialManager {
  private readonly RP_ID = 'mrk.protocol';
  private readonly ORIGIN = `https://${this.RP_ID}`;

  async prepareEnrollment(user: EnrollmentUser): Promise<EnrollmentOptions> {
    const options = await generateRegistrationOptions({
      rpName: 'MRK Protocol Sovereign Vault',
      rpID: this.RP_ID,
      userID: new TextEncoder().encode(user.id),
      userName: user.username,
      attestationType: 'none',
      authenticatorSelection: {
        residentKey: 'required',
        userVerification: 'required',
      },
    });

    await this.storeChallenge(user.id, options.challenge);

    return options as any;
  }

  async verifyEnrollment(
    userId: string,
    response: any
  ): Promise<EnrollmentResult> {
    const expectedChallenge = await this.getStoredChallenge(userId);
    
    if (!expectedChallenge) {
      throw new Error('HANDSHAKE_FAILED: No active challenge found.');
    }

    const verification = await verifyRegistrationResponse({
      response,
      expectedChallenge,
      expectedOrigin: this.ORIGIN,
      expectedRPID: this.RP_ID,
    });

    if (verification.verified && verification.registrationInfo) {
      const { credentialID, credentialPublicKey } = verification.registrationInfo;
      
      await this.clearChallenge(userId);

      return {
        id: Buffer.from(credentialID).toString('base64url'),
        publicKey: Buffer.from(credentialPublicKey).toString('base64url'),
        verified: true,
      };
    }

    throw new Error('HANDSHAKE_FAILED: Sovereign identity could not be verified.');
  }

  async prepareAuthentication(userId: string): Promise<{
    challenge: string;
    rpId: string;
    allowCredentials: Array<{ id: string; type: string }>;
  }> {
    const credentials = await this.getUserCredentials(userId);
    
    if (credentials.length === 0) {
      throw new Error('AUTH_FAILED: No registered credentials found.');
    }

    const challenge = crypto.randomUUID();
    await this.storeChallenge(userId, challenge);

    return {
      challenge,
      rpId: this.RP_ID,
      allowCredentials: credentials.map(cred => ({
        id: cred.id,
        type: 'public-key',
      })),
    };
  }

  private async storeChallenge(userId: string, challenge: string): Promise<void> {
    // In production: write to edge KV store (Cloudflare Workers KV, Upstash Redis, etc.)
    const store = (globalThis as any).__CHALLENGE_STORE__ || {};
    store[userId] = challenge;
    (globalThis as any).__CHALLENGE_STORE__ = store;
  }

  private async getStoredChallenge(userId: string): Promise<string | null> {
    const store = (globalThis as any).__CHALLENGE_STORE__ || {};
    return store[userId] || null;
  }

  private async clearChallenge(userId: string): Promise<void> {
    const store = (globalThis as any).__CHALLENGE_STORE__ || {};
    delete store[userId];
    (globalThis as any).__CHALLENGE_STORE__ = store;
  }

  private async getUserCredentials(userId: string): Promise<Array<{ id: string }>> {
    // In production: query Control Plane database for user's registered credentials
    return [];
  }
}
