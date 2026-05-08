// AggregationEngine.ts
// Ghost Vault intelligence layer: transforms edge events into anonymized cohort analytics
// Zero raw PII storage. All intelligence derived from ephemeral hashes.

export interface HandshakeEvent {
  eventId: string;
  timestamp: number;
  identityHash: string;
  saltWindowId: number;
  trustDepth: number;
  linkTier: 'public' | 'restricted' | 'classified';
  geoRegion: string;
  authMethod: 'webauthn' | 'none';
  outcome: 'resolved' | 'locked' | 'denied' | 'defending';
  latencyMs: number;
  threatFlags: string[];
}

export interface VelocityMetric {
  window: '1m' | '5m' | '15m' | '1h' | '24h';
  totalHandshakes: number;
  resolvedRate: number;
  deniedRate: number;
  defendingRate: number;
  avgLatencyMs: number;
  uniqueIdentityCount: number;
}

export interface CohortInsight {
  trustDepth: number;
  totalMembers: number;
  activeMembers: number;
  avgDelegationsUsed: number;
  revocationRate: number;
  topGeoRegions: { region: string; count: number }[];
}

export interface ThreatSurfaceReport {
  period: '1h' | '24h' | '7d';
  totalThreatEvents: number;
  topThreatFlags: { flag: string; count: number }[];
  defendingTriggerRate: number;
  geoAnomalies: { region: string; anomalyScore: number }[];
  velocitySpikes: { timestamp: number; multiplier: number }[];
}

export interface RetentionPolicy {
  rawEventTTLHours: number;
  saltRotationWindowHours: number;
  aggregatedDataRetentionDays: number;
  nextPurgeTimestamp: number;
}

export class AggregationEngine {
  private eventBuffer: HandshakeEvent[] = [];
  private velocityCache: Map<string, VelocityMetric> = new Map();
  private cohortCache: Map<number, CohortInsight> = new Map();
  private readonly BUFFER_FLUSH_INTERVAL_MS = 5000;
  private readonly RETENTION_POLICY: RetentionPolicy = {
    rawEventTTLHours: 24,
    saltRotationWindowHours: 24,
    aggregatedDataRetentionDays: 90,
    nextPurgeTimestamp: Date.now() + 24 * 60 * 60 * 1000,
  };
  private totalProcessed = 0;

  constructor() {
    setInterval(() => this.flushBuffer(), this.BUFFER_FLUSH_INTERVAL_MS);
    setInterval(() => this.enforceRetentionPolicy(), 60 * 60 * 1000);
  }

  async ingestEvent(event: HandshakeEvent): Promise<void> {
    this.validateAnonymization(event);
    this.eventBuffer.push(event);
  }

  private validateAnonymization(event: HandshakeEvent): void {
    if (!/^[a-f0-9]{64}$/.test(event.identityHash)) {
      throw new Error('ANONYMIZATION_VIOLATION: Invalid identity hash format.');
    }
    const validRegions = ['NA', 'SA', 'EU', 'AF', 'AS', 'OC', 'UNKNOWN'];
    if (!validRegions.includes(event.geoRegion)) {
      throw new Error('ANONYMIZATION_VIOLATION: Geo region too granular.');
    }
  }

  private async flushBuffer(): Promise<void> {
    if (this.eventBuffer.length === 0) return;

    const batch = [...this.eventBuffer];
    this.eventBuffer = [];
    this.totalProcessed += batch.length;

    this.computeVelocityMetrics(batch);
    this.computeCohortInsights(batch);
  }

  private computeVelocityMetrics(events: HandshakeEvent[]): void {
    const now = Date.now();
    const windows: Array<{ key: string; durationMs: number }> = [
      { key: '1m', durationMs: 60 * 1000 },
      { key: '5m', durationMs: 5 * 60 * 1000 },
      { key: '15m', durationMs: 15 * 60 * 1000 },
      { key: '1h', durationMs: 60 * 60 * 1000 },
      { key: '24h', durationMs: 24 * 60 * 60 * 1000 },
    ];

    for (const window of windows) {
      const windowStart = now - window.durationMs;
      const windowEvents = events.filter(e => e.timestamp >= windowStart);
      
      if (windowEvents.length === 0) continue;

      const resolved = windowEvents.filter(e => e.outcome === 'resolved').length;
      const denied = windowEvents.filter(e => e.outcome === 'denied').length;
      const defending = windowEvents.filter(e => e.outcome === 'defending').length;
      const uniqueHashes = new Set(windowEvents.map(e => e.identityHash)).size;

      const metric: VelocityMetric = {
        window: window.key as VelocityMetric['window'],
        totalHandshakes: windowEvents.length,
        resolvedRate: resolved / windowEvents.length,
        deniedRate: denied / windowEvents.length,
        defendingRate: defending / windowEvents.length,
        avgLatencyMs: windowEvents.reduce((sum, e) => sum + e.latencyMs, 0) / windowEvents.length,
        uniqueIdentityCount: uniqueHashes,
      };

      this.velocityCache.set(window.key, metric);
    }
  }

  private computeCohortInsights(events: HandshakeEvent[]): void {
    const trustDepths = [0, 1, 2];
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

    for (const depth of trustDepths) {
      const cohortEvents = events.filter(e => e.trustDepth === depth);
      if (cohortEvents.length === 0) continue;

      const uniqueIdentities = new Set(cohortEvents.map(e => e.identityHash)).size;
      const activeIdentities = new Set(
        cohortEvents.filter(e => e.timestamp >= sevenDaysAgo).map(e => e.identityHash)
      ).size;

      const geoCounts = new Map<string, number>();
      cohortEvents.forEach(e => {
        geoCounts.set(e.geoRegion, (geoCounts.get(e.geoRegion) || 0) + 1);
      });

      const topGeoRegions = Array.from(geoCounts.entries())
        .map(([region, count]) => ({ region, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      const insight: CohortInsight = {
        trustDepth: depth,
        totalMembers: uniqueIdentities,
        activeMembers: activeIdentities,
        avgDelegationsUsed: 0,
        revocationRate: 0,
        topGeoRegions,
      };

      this.cohortCache.set(depth, insight);
    }
  }

  async generateThreatSurfaceReport(period: '1h' | '24h' | '7d'): Promise<ThreatSurfaceReport> {
    const report: ThreatSurfaceReport = {
      period,
      totalThreatEvents: 0,
      topThreatFlags: [],
      defendingTriggerRate: 0,
      geoAnomalies: [],
      velocitySpikes: [],
    };

    return report;
  }

  private async enforceRetentionPolicy(): Promise<void> {
    const now = Date.now();
    const rawEventCutoff = now - this.RETENTION_POLICY.rawEventTTLHours * 60 * 60 * 1000;
    
    this.eventBuffer = this.eventBuffer.filter(e => e.timestamp >= rawEventCutoff);
    this.RETENTION_POLICY.nextPurgeTimestamp = now + 24 * 60 * 60 * 1000;
  }

  getCurrentVelocity(window: '1m' | '5m' | '15m' | '1h' | '24h'): VelocityMetric | null {
    return this.velocityCache.get(window) || null;
  }

  getCohortInsights(trustDepth: number): CohortInsight | null {
    return this.cohortCache.get(trustDepth) || null;
  }

  getAllCohortInsights(): CohortInsight[] {
    return Array.from(this.cohortCache.values());
  }

  getRetentionStatus(): RetentionPolicy {
    return { ...this.RETENTION_POLICY };
  }

  getTotalProcessed(): number {
    return this.totalProcessed;
  }
}
