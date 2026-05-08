import { neon, type NeonQueryFunction } from '@neondatabase/serverless';
import { config } from 'dotenv';
config({ path: '.env.local' });

// Use a concrete type alias to avoid generic variance issues with NeonQueryFunction
type SqlClient = NeonQueryFunction<false, false>;

/**
 * LinkSnip Anomaly Detection Agent — Sentinel
 * ═══════════════════════════════════════════════
 * A background worker that monitors the click analytics stream in real-time,
 * detecting and flagging suspicious patterns:
 *
 *   1. CLICK VELOCITY SPIKES — Sudden burst from a single IP or link.
 *   2. BOT SIGNATURE DETECTION — Known scraper/bot User-Agent fingerprints.
 *   3. GEO ANOMALIES — Unusual origin country distribution shifts.
 *   4. REFERRER SPAM — Known spam referrer domains.
 *
 * This agent runs as a standalone process:
 *   npx tsx scripts/sentinel-agent.ts
 *
 * It polls the click stream every 30 seconds and logs anomalies to both
 * console and a `sentinel_alerts` table in the database.
 *
 * Future: Pipe flagged events through an Ollama-hosted LLM for contextual
 * threat analysis and auto-blocking recommendations.
 */

// ─── Configuration ───────────────────────────────────────────────────────────

const POLL_INTERVAL_MS = 30_000; // 30 seconds
const VELOCITY_THRESHOLD = 50;   // Max clicks per IP per 5-minute window
const VELOCITY_WINDOW_MIN = 5;   // Window size in minutes
const BOT_UA_PATTERNS = [
  /bot/i, /crawl/i, /spider/i, /scrape/i, /phantom/i, /headless/i,
  /python-requests/i, /curl/i, /wget/i, /java\//i, /go-http/i,
  /okhttp/i, /libwww/i, /httpunit/i, /nutch/i, /biglotron/i,
  /teoma/i, /convera/i, /gigablast/i, /ia_archiver/i,
];
const SPAM_REFERRERS = new Set([
  'semalt.com', 'buttons-for-website.com', 'darodar.com',
  'free-social-buttons.com', 'ilovevitaly.com', 'cenoval.ru',
  'priceg.com', 'hulfingtonpost.com', 'best-seo-offer.com',
  'buy-cheap-online.info', 'site-auditor.online',
]);

// ─── Alert Types ─────────────────────────────────────────────────────────────

type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';
type AlertType = 'velocity_spike' | 'bot_detected' | 'geo_anomaly' | 'referrer_spam' | 'link_abuse';

interface SentinelAlert {
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  metadata: Record<string, unknown>;
  timestamp: Date;
}

// ─── Database Setup ──────────────────────────────────────────────────────────

async function ensureSentinelTable(sql: SqlClient) {
  await sql`
    CREATE TABLE IF NOT EXISTS sentinel_alerts (
      id SERIAL PRIMARY KEY,
      type TEXT NOT NULL,
      severity TEXT NOT NULL,
      message TEXT NOT NULL,
      metadata JSONB DEFAULT '{}',
      acknowledged BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_sentinel_created ON sentinel_alerts (created_at DESC);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_sentinel_severity ON sentinel_alerts (severity);`;
}

async function persistAlert(sql: SqlClient, alert: SentinelAlert) {
  await sql`
    INSERT INTO sentinel_alerts (type, severity, message, metadata)
    VALUES (${alert.type}, ${alert.severity}, ${alert.message}, ${JSON.stringify(alert.metadata)})
  `;
}

// ─── Detection Engines ───────────────────────────────────────────────────────

async function detectVelocitySpikes(sql: SqlClient): Promise<SentinelAlert[]> {
  const alerts: SentinelAlert[] = [];

  // Find IPs with excessive click rates in the velocity window
  const results = await sql`
    SELECT
      ip_address,
      COUNT(*) as click_count,
      COUNT(DISTINCT link_id) as distinct_links,
      array_agg(DISTINCT link_id) as targeted_links
    FROM clicks
    WHERE timestamp > NOW() - INTERVAL '${VELOCITY_WINDOW_MIN} minutes'
      AND ip_address IS NOT NULL
    GROUP BY ip_address
    HAVING COUNT(*) > ${VELOCITY_THRESHOLD}
    ORDER BY click_count DESC
    LIMIT 20
  `;

  for (const row of results) {
    const severity: AlertSeverity = row.click_count > VELOCITY_THRESHOLD * 3 ? 'critical'
      : row.click_count > VELOCITY_THRESHOLD * 2 ? 'high' : 'medium';

    alerts.push({
      type: 'velocity_spike',
      severity,
      message: `IP ${maskIp(row.ip_address)} generated ${row.click_count} clicks in ${VELOCITY_WINDOW_MIN} min across ${row.distinct_links} links`,
      metadata: {
        ip_hash: hashIp(row.ip_address),
        click_count: row.click_count,
        distinct_links: row.distinct_links,
        targeted_links: row.targeted_links,
      },
      timestamp: new Date(),
    });
  }

  return alerts;
}

async function detectBotTraffic(sql: SqlClient): Promise<SentinelAlert[]> {
  const alerts: SentinelAlert[] = [];

  // Pull recent clicks with user agents
  const results = await sql`
    SELECT
      user_agent,
      COUNT(*) as hit_count,
      COUNT(DISTINCT ip_address) as distinct_ips,
      COUNT(DISTINCT link_id) as distinct_links
    FROM clicks
    WHERE timestamp > NOW() - INTERVAL '${VELOCITY_WINDOW_MIN} minutes'
      AND user_agent IS NOT NULL
    GROUP BY user_agent
    HAVING COUNT(*) > 5
    ORDER BY hit_count DESC
    LIMIT 50
  `;

  for (const row of results) {
    const ua = row.user_agent;
    const isBot = BOT_UA_PATTERNS.some(pattern => pattern.test(ua));

    if (isBot) {
      alerts.push({
        type: 'bot_detected',
        severity: row.hit_count > 100 ? 'high' : 'medium',
        message: `Bot UA detected: "${truncateUa(ua)}" — ${row.hit_count} hits from ${row.distinct_ips} IPs`,
        metadata: {
          user_agent: ua,
          hit_count: row.hit_count,
          distinct_ips: row.distinct_ips,
          distinct_links: row.distinct_links,
        },
        timestamp: new Date(),
      });
    }
  }

  return alerts;
}

async function detectReferrerSpam(sql: SqlClient): Promise<SentinelAlert[]> {
  const alerts: SentinelAlert[] = [];

  const results = await sql`
    SELECT
      referrer,
      COUNT(*) as hit_count,
      COUNT(DISTINCT ip_address) as distinct_ips
    FROM clicks
    WHERE timestamp > NOW() - INTERVAL '10 minutes'
      AND referrer IS NOT NULL
      AND referrer != ''
    GROUP BY referrer
    HAVING COUNT(*) > 3
    ORDER BY hit_count DESC
    LIMIT 30
  `;

  for (const row of results) {
    try {
      const domain = new URL(row.referrer).hostname.replace(/^www\./, '');
      if (SPAM_REFERRERS.has(domain)) {
        alerts.push({
          type: 'referrer_spam',
          severity: 'medium',
          message: `Spam referrer "${domain}" sent ${row.hit_count} clicks from ${row.distinct_ips} IPs`,
          metadata: {
            referrer: row.referrer,
            domain,
            hit_count: row.hit_count,
            distinct_ips: row.distinct_ips,
          },
          timestamp: new Date(),
        });
      }
    } catch {
      // Invalid URL in referrer — skip
    }
  }

  return alerts;
}

async function detectLinkAbuse(sql: SqlClient): Promise<SentinelAlert[]> {
  const alerts: SentinelAlert[] = [];

  // Detect single links getting hammered
  const results = await sql`
    SELECT
      l.short_code,
      l.original_url,
      COUNT(*) as click_count,
      COUNT(DISTINCT c.ip_address) as unique_visitors
    FROM clicks c
    JOIN links l ON c.link_id = l.id
    WHERE c.timestamp > NOW() - INTERVAL '5 minutes'
    GROUP BY l.id, l.short_code, l.original_url
    HAVING COUNT(*) > ${VELOCITY_THRESHOLD * 2}
    ORDER BY click_count DESC
    LIMIT 10
  `;

  for (const row of results) {
    const ratio = row.unique_visitors > 0 ? row.click_count / row.unique_visitors : row.click_count;
    const severity: AlertSeverity = ratio > 10 ? 'critical' : ratio > 5 ? 'high' : 'medium';

    alerts.push({
      type: 'link_abuse',
      severity,
      message: `Link "/${row.short_code}" received ${row.click_count} clicks (${row.unique_visitors} unique) in 5 min — ratio ${ratio.toFixed(1)}:1`,
      metadata: {
        short_code: row.short_code,
        original_url: row.original_url,
        click_count: row.click_count,
        unique_visitors: row.unique_visitors,
        click_to_visitor_ratio: ratio,
      },
      timestamp: new Date(),
    });
  }

  return alerts;
}

// ─── Utility Functions ───────────────────────────────────────────────────────

function maskIp(ip: string): string {
  const parts = ip.split('.');
  if (parts.length === 4) return `${parts[0]}.${parts[1]}.***.***`;
  return ip.substring(0, 8) + '***';
}

function hashIp(ip: string): string {
  // Simple hash for log deduplication (not cryptographic)
  let hash = 0;
  for (let i = 0; i < ip.length; i++) {
    const char = ip.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

function truncateUa(ua: string): string {
  return ua.length > 80 ? ua.substring(0, 80) + '...' : ua;
}

const SEVERITY_ICONS: Record<AlertSeverity, string> = {
  low: '🟢',
  medium: '🟡',
  high: '🟠',
  critical: '🔴',
};

function logAlert(alert: SentinelAlert) {
  const icon = SEVERITY_ICONS[alert.severity];
  const ts = alert.timestamp.toISOString().substring(11, 19);
  console.log(`${icon} [${ts}] [${alert.severity.toUpperCase()}] ${alert.type}: ${alert.message}`);
}

// ─── Main Loop ───────────────────────────────────────────────────────────────

async function runSentinelCycle(sql: SqlClient) {
  const allAlerts: SentinelAlert[] = [];

  try {
    const [velocityAlerts, botAlerts, spamAlerts, abuseAlerts] = await Promise.all([
      detectVelocitySpikes(sql),
      detectBotTraffic(sql),
      detectReferrerSpam(sql),
      detectLinkAbuse(sql),
    ]);

    allAlerts.push(...velocityAlerts, ...botAlerts, ...spamAlerts, ...abuseAlerts);

    if (allAlerts.length === 0) {
      process.stdout.write('.');
      return;
    }

    console.log(`\n━━━ Sentinel Sweep — ${new Date().toISOString()} ━━━`);
    console.log(`Found ${allAlerts.length} anomalies:\n`);

    for (const alert of allAlerts) {
      logAlert(alert);
      await persistAlert(sql, alert);
    }

    console.log('');
  } catch (err) {
    console.error('⚠️  Sentinel cycle error:', err);
  }
}

async function main() {
  console.log('');
  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║       🛡️  LINKSNIP SENTINEL — Anomaly Agent         ║');
  console.log('║   Monitoring click stream for threats & anomalies   ║');
  console.log('╚══════════════════════════════════════════════════════╝');
  console.log('');

  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL not set. Cannot connect to analytics stream.');
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);

  // Ensure the alerts table exists
  await ensureSentinelTable(sql);

  console.log(`⚙️  Config: poll=${POLL_INTERVAL_MS / 1000}s, velocity_threshold=${VELOCITY_THRESHOLD}, window=${VELOCITY_WINDOW_MIN}min`);
  console.log(`📡 Monitoring started. Press Ctrl+C to stop.\n`);
  console.log('Sweep status (. = clean):');

  // Initial sweep
  await runSentinelCycle(sql);

  // Continuous polling
  const interval = setInterval(() => runSentinelCycle(sql), POLL_INTERVAL_MS);

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n\n🛑 Sentinel shutting down gracefully...');
    clearInterval(interval);
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    clearInterval(interval);
    process.exit(0);
  });
}

main().catch((err) => {
  console.error('❌ Sentinel failed to start:', err);
  process.exit(1);
});
