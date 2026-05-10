/**
 * Zipd Security — Privacy Engine
 * ──────────────────────────────────────────────────
 * Stateless privacy engine for anonymized telemetry.
 * Implements 24-hour rotating salt hashing to prevent long-term identity tracking.
 */

export class AggregationEngine {
  /**
   * Generates an ephemeral, irreversible hash for a visitor.
   * Anonymizes raw PII at the edge.
   */
  public static async generatePrivacyHash(ip: string, userAgent: string): Promise<string> {
    const salt = this.getCurrentRotatingSalt();
    const data = `${ip}|${userAgent}|${salt}`;
    
    // Web Crypto API (Edge Compatible)
    const msgUint8 = new TextEncoder().encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Returns a deterministic salt based on the current 24-hour window.
   */
  private static getCurrentRotatingSalt(): string {
    const dayTimestamp = Math.floor(Date.now() / (24 * 60 * 60 * 1000));
    // In production, this should include a project-level secret
    const secret = process.env.SECURITY_VAULT_SECRET || 'zipd-default-secret';
    return `${dayTimestamp}-${secret}`;
  }

  /**
   * Generates security insights (Velocity, Authority Level)
   */
  public static computeSecurityMetrics(events: any[]) {
    return {
      velocity: events.length,
      authorityLevel: events.reduce((acc, e) => acc + (e.authorityLevel || 0), 0) / events.length,
      uniqueness: new Set(events.map(e => e.privacyHash)).size,
    };
  }
}
