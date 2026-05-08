// SentinelStateMachine.ts
// Core State Machine for the MRK Protocol Edge Runtime
// Deterministic, parallel-first, conservative on uncertainty

export type SentinelState = 'dormant' | 'evaluating' | 'locked' | 'defending' | 'resolved' | 'denied';

export type ThreatLevel = 'clear' | 'suspicious' | 'hostile' | 'unknown';
export type VaultPolicy = 'public' | 'restricted' | 'classified';

export interface EvaluationContext {
  ip: string;
  userAgent: string;
  deviceFingerprint: string;
  destinationTier: VaultPolicy;
  geoResult?: { valid: boolean; region: string };
  threatIntel?: { level: ThreatLevel; flags: string[] };
  ghostSignature?: string;
  authChallengeRequired: boolean;
  authChallengePassed: boolean;
}

interface StateTransition {
  from: SentinelState;
  to: SentinelState;
  condition: string;
  timestamp: number;
}

export class SentinelStateMachine {
  private currentState: SentinelState = 'dormant';
  private context: EvaluationContext;
  private transitions: StateTransition[] = [];
  private readonly THREAT_INTEL_TIMEOUT_MS = 200;
  private readonly RISK_THRESHOLD = 0.7;

  constructor(context: EvaluationContext) {
    this.context = context;
    this.logTransition('dormant', 'evaluating', 'request_received');
    this.currentState = 'evaluating';
  }

  async evaluate(): Promise<SentinelState> {
    const ghostPromise = this.preComputeGhostSignature();

    const [geoResult, threatResult] = await Promise.all([
      this.checkGeoFence(),
      this.checkThreatIntelWithTimeout(),
    ]);

    this.context.geoResult = geoResult;
    this.context.threatIntel = threatResult;
    this.context.ghostSignature = await ghostPromise;

    if (!geoResult.valid || threatResult.level === 'hostile') {
      return this.transitionTo('defending', 'geo_or_threat_failed');
    }

    if (threatResult.level === 'unknown') {
      return this.transitionTo('defending', 'threat_intel_timeout');
    }

    if (this.context.destinationTier !== 'public') {
      this.context.authChallengeRequired = true;
      return this.transitionTo('locked', 'restricted_destination');
    }

    const riskScore = this.calculateRiskScore();
    if (riskScore > this.RISK_THRESHOLD) {
      this.context.authChallengeRequired = true;
      return this.transitionTo('locked', 'dynamic_risk_threshold_exceeded');
    }

    return this.transitionTo('resolved', 'all_checks_passed');
  }

  async handleAuthChallenge(passed: boolean): Promise<SentinelState> {
    this.context.authChallengePassed = passed;

    if (passed) {
      return this.transitionTo('resolved', 'auth_challenge_success');
    }

    return this.transitionTo('denied', 'bio_handshake_rejected');
  }

  private async preComputeGhostSignature(): Promise<string> {
    const salt = await this.getCurrentSaltWindow();
    const rawIdentity = `${this.context.ip}|${this.context.userAgent}|${this.context.deviceFingerprint}`;
    
    const encoder = new TextEncoder();
    const data = encoder.encode(rawIdentity + salt);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private async checkThreatIntelWithTimeout(): Promise<{ level: ThreatLevel; flags: string[] }> {
    try {
      const result = await Promise.race([
        this.queryThreatIntel(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('THREAT_INTEL_TIMEOUT')), this.THREAT_INTEL_TIMEOUT_MS)
        ),
      ]);
      return result;
    } catch {
      return { level: 'unknown', flags: ['TIMEOUT_EXCEEDED'] };
    }
  }

  private calculateRiskScore(): number {
    let score = 0;
    const flags = this.context.threatIntel?.flags || [];

    if (flags.includes('NEW_DEVICE_FINGERPRINT')) score += 0.3;
    if (flags.includes('IP_ROTATION_DETECTED')) score += 0.4;
    if (flags.includes('VELOCITY_SPIKE')) score += 0.35;
    if (flags.includes('TOR_EXIT_NODE')) score += 0.5;
    if (this.context.geoResult && !this.context.geoResult.valid) score += 0.6;

    return Math.min(score, 1.0);
  }

  private async checkGeoFence(): Promise<{ valid: boolean; region: string }> {
    return { valid: true, region: 'QUEBEC' };
  }

  private async queryThreatIntel(): Promise<{ level: ThreatLevel; flags: string[] }> {
    return { level: 'clear', flags: [] };
  }

  private async getCurrentSaltWindow(): Promise<string> {
    const epoch = Math.floor(Date.now() / (24 * 60 * 60 * 1000));
    return `MRK_GHOST_SALT_${epoch}`;
  }

  private transitionTo(state: SentinelState, condition: string): SentinelState {
    this.logTransition(this.currentState, state, condition);
    this.currentState = state;
    return state;
  }

  private logTransition(from: SentinelState, to: SentinelState, condition: string): void {
    this.transitions.push({
      from,
      to,
      condition,
      timestamp: Date.now(),
    });
  }

  getState(): SentinelState {
    return this.currentState;
  }

  getTransitionLog(): StateTransition[] {
    return [...this.transitions];
  }
}

export async function handleEdgeRequest(request: Request): Promise<Response> {
  const context: EvaluationContext = {
    ip: request.headers.get('cf-connecting-ip') || 'unknown',
    userAgent: request.headers.get('user-agent') || 'unknown',
    deviceFingerprint: request.headers.get('x-device-fingerprint') || 'unknown',
    destinationTier: determineVaultPolicy(request.url),
    authChallengeRequired: false,
    authChallengePassed: false,
  };

  const stateMachine = new SentinelStateMachine(context);
  const result = await stateMachine.evaluate();

  switch (result) {
    case 'resolved':
      return new Response(null, { status: 302, headers: { Location: '/destination' } });
    case 'locked':
      return new Response(JSON.stringify({ state: 'locked', challenge: 'webauthn' }), { status: 401 });
    case 'defending':
      return new Response(JSON.stringify({ state: 'defending' }), { status: 403 });
    case 'denied':
      return new Response(JSON.stringify({ state: 'denied' }), { status: 403 });
    default:
      return new Response(JSON.stringify({ state: 'evaluating' }), { status: 200 });
  }
}

function determineVaultPolicy(url: string): VaultPolicy {
  if (url.includes('private') || url.includes('classified')) return 'classified';
  if (url.includes('restricted')) return 'restricted';
  return 'public';
}
