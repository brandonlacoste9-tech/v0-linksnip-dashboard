/**
 * Zipd Security — Security Runtime State Machine
 * ──────────────────────────────────────────────────
 * Executes at the Network Edge to evaluate link security in real-time.
 * Follows a Zero-Trust "Locked-by-Default" architecture.
 */

export type SecurityState = 'EVALUATING' | 'LOCKED' | 'BLOCKED' | 'RESOLVED' | 'DENIED';

export interface SecurityContext {
  id: string;
  timestamp: number;
  threatLevel: number;
  geoAllowed: boolean;
  authorityLevel: number;
}

export class SecurityEngine {
  private state: SecurityState = 'EVALUATING';
  private context: SecurityContext;

  constructor(context: SecurityContext) {
    this.context = context;
  }

  /**
   * Evaluates the current context and transitions state.
   * This is designed to be called within a Promise.race to enforce timeouts.
   */
  public async evaluate(): Promise<SecurityState> {
    try {
      // 1. Parallel Sprint: Evaluate core pillars
      const evaluations = await Promise.all([
        this.checkThreatIntelligence(),
        this.checkGeoFence(),
        this.checkAccessPolicy()
      ]);

      const [threats, geo, policy] = evaluations;

      // 2. Logic Gates
      if (threats > 0.8) return this.transition('BLOCKED');
      if (!geo) return this.transition('DENIED');
      if (policy === 'REVOKED') return this.transition('LOCKED');

      return this.transition('RESOLVED');
    } catch (error) {
      // Conservative Lock: Any failure defaults to LOCKED
      console.error('[SecurityEngine] Evaluation Failure:', error);
      return this.transition('LOCKED');
    }
  }

  private transition(next: SecurityState): SecurityState {
    console.log(`[SecurityEngine] State Transition: ${this.state} -> ${next}`);
    this.state = next;
    return this.state;
  }

  private async checkThreatIntelligence(): Promise<number> {
    // Simulated: Integrated with IPReputation / BotDetection
    return this.context.threatLevel;
  }

  private async checkGeoFence(): Promise<boolean> {
    return this.context.geoAllowed;
  }

  private async checkAccessPolicy(): Promise<'ACTIVE' | 'REVOKED'> {
    // Check if the link exists in the Privacy Engine and is active
    return this.context.authorityLevel > 0 ? 'ACTIVE' : 'REVOKED';
  }

  public getState(): SecurityState {
    return this.state;
  }
}
