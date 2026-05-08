/**
 * MRK Protocol — Sentinel Runtime State Machine
 * ──────────────────────────────────────────────
 * Executes at the Network Edge to evaluate link trust in real-time.
 * Follows a Zero-Trust "Locked-by-Default" architecture.
 */

export type SentinelState = 'EVALUATING' | 'LOCKED' | 'DEFENDING' | 'RESOLVED' | 'DENIED';

export interface SentinelContext {
  id: string;
  timestamp: number;
  threatLevel: number;
  geoAllowed: boolean;
  trustDepth: number;
}

export class SentinelStateMachine {
  private state: SentinelState = 'EVALUATING';
  private context: SentinelContext;

  constructor(context: SentinelContext) {
    this.context = context;
  }

  /**
   * Evaluates the current context and transitions state.
   * This is designed to be called within a Promise.race to enforce timeouts.
   */
  public async evaluate(): Promise<SentinelState> {
    try {
      // 1. Parallel Sprint: Evaluate core pillars
      const evaluations = await Promise.all([
        this.checkThreatIntelligence(),
        this.checkGeoFence(),
        this.checkVaultPolicy()
      ]);

      const [threats, geo, policy] = evaluations;

      // 2. Logic Gates
      if (threats > 0.8) return this.transition('DEFENDING');
      if (!geo) return this.transition('DENIED');
      if (policy === 'REVOKED') return this.transition('LOCKED');

      return this.transition('RESOLVED');
    } catch (error) {
      // Conservative Lock: Any failure defaults to LOCKED
      console.error('[Sentinel] Evaluation Failure:', error);
      return this.transition('LOCKED');
    }
  }

  private transition(next: SentinelState): SentinelState {
    console.log(`[Sentinel] State Transition: ${this.state} -> ${next}`);
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

  private async checkVaultPolicy(): Promise<'ACTIVE' | 'REVOKED'> {
    // Check if the link exists in the Ghost Vault and is active
    return this.context.trustDepth > 0 ? 'ACTIVE' : 'REVOKED';
  }

  public getState(): SentinelState {
    return this.state;
  }
}
