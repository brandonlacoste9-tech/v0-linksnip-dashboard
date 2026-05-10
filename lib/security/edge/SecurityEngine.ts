// SecurityEngine.ts
// Core State Machine for the Zipd Security Edge Runtime
// Deterministic, parallel-first, conservative on uncertainty

export type SecurityState = 'dormant' | 'evaluating' | 'locked' | 'blocked' | 'resolved' | 'denied';

export type ThreatLevel = 'clear' | 'suspicious' | 'hostile' | 'unknown';
export type AccessPolicy = 'public' | 'restricted' | 'high_security';

export interface EvaluationContext {
  ip: string;
  userAgent: string;
  deviceFingerprint: string;
  accessLevel: AccessPolicy;
  geoResult?: { valid: boolean; region: string };
  threatIntel?: { level: ThreatLevel; flags: string[] };
  privacySignature?: string;
  authChallengeRequired: boolean;
  authChallengePassed: boolean;
}

interface StateTransition {
  from: SecurityState;
  to: SecurityState;
  condition: string;
  timestamp: number;
}

export class SecurityEngine {
  private currentState: SecurityState = 'dormant';
  private context: EvaluationContext;
  private transitions: StateTransition[] = [];
  private readonly THREAT_INTEL_TIMEOUT_MS = 200;
  private readonly RISK_THRESHOLD = 0.7;

  constructor(context: EvaluationContext) {
    this.context = context;
    this.logTransition('dormant', 'evaluating', 'request_received');
    this.currentState = 'evaluating';
  }

  async evaluate(): Promise<SecurityState> {
    const privacyPromise = this.preComputePrivacySignature();

    const [geoResult, threatResult] = await Promise.all([
      this.checkGeoFence(),
      this.checkThreatIntelWithTimeout(),
    ]);

    this.context.geoResult = geoResult;
    this.context.threatIntel = threatResult;
    this.context.privacySignature = await privacyPromise;

    if (!geoResult.valid || threatResult.level === 'hostile') {
      return this.transitionTo('blocked', 'geo_or_threat_failed');
    }

    if (threatResult.level === 'unknown') {
      return this.transitionTo('blocked', 'threat_intel_timeout');
    }

    if (this.context.accessLevel !== 'public') {
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

  async handleAuthChallenge(passed: boolean): Promise<SecurityState> {
    this.context.authChallengePassed = passed;

    if (passed) {
      return this.transitionTo('resolved', 'auth_challenge_success');
    }

    return this.transitionTo('denied', 'biometric_auth_rejected');
  }

  private async preComputePrivacySignature(): Promise<string> {
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
    return `LS_PRIVACY_SALT_${epoch}`;
  }

  private transitionTo(state: SecurityState, condition: string): SecurityState {
    this.logTransition(this.currentState, state, condition);
    this.currentState = state;
    return state;
  }

  private logTransition(from: SecurityState, to: SecurityState, condition: string): void {
    this.transitions.push({
      from,
      to,
      condition,
      timestamp: Date.now(),
    });
  }

  getState(): SecurityState {
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
    accessLevel: determineAccessPolicy(request.url),
    authChallengeRequired: false,
    authChallengePassed: false,
  };

  const securityEngine = new SecurityEngine(context);
  const result = await securityEngine.evaluate();

  switch (result) {
    case 'resolved':
      return new Response(null, { status: 302, headers: { Location: '/destination' } });
    case 'locked':
      return new Response(JSON.stringify({ state: 'locked', challenge: 'webauthn' }), { status: 401 });
    case 'blocked':
      return new Response(JSON.stringify({ state: 'blocked' }), { status: 403 });
    case 'denied':
      return new Response(JSON.stringify({ state: 'denied' }), { status: 403 });
    default:
      return new Response(JSON.stringify({ state: 'evaluating' }), { status: 200 });
  }
}

function determineAccessPolicy(url: string): AccessPolicy {
  if (url.includes('private') || url.includes('classified')) return 'high_security';
  if (url.includes('restricted')) return 'restricted';
  return 'public';
}
