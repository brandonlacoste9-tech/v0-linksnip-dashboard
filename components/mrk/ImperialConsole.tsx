// ImperialConsole.tsx
// The full Mission Control HUD combining all components

import { useState, useEffect } from "react";
import { VelocityGraph } from "./VelocityGraph";
import { TrustTreeHUD } from "./TrustTreeHUD";
import { SentinelShield } from "./SentinelShield";
import { AggregationEngine } from "@/lib/mrk/intelligence/AggregationEngine";
import { TrustDelegationEngine } from "@/lib/mrk/trust/TrustDelegationEngine";

interface ImperialConsoleProps {
  aggregationEngine: AggregationEngine;
  trustEngine: TrustDelegationEngine;
  originHash: string;
  onEmitInvite: () => Promise<void>;
  onRevokeTrustAnchor: (hash: string) => Promise<void>;
}

export const ImperialConsole = ({
  aggregationEngine,
  trustEngine,
  originHash,
  onEmitInvite,
  onRevokeTrustAnchor,
}: ImperialConsoleProps) => {
  const [activeView, setActiveView] = useState<'overview' | 'trust-tree' | 'threat-intel'>('overview');
  const [cohortStats, setCohortStats] = useState({ totalOrigins: 0, totalTrustKeys: 0, totalSubKeys: 0, avgDelegationsPerOrigin: 0, revokedChains: 0 });

  useEffect(() => {
    trustEngine.getAnonymizedCohortStats().then(setCohortStats);
  }, [trustEngine]);

  return (
    <div className="min-h-screen bg-navy-950 p-8">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <SentinelShield state="dormant" />
          <div>
            <h1 className="font-serif text-2xl tracking-[0.2em] text-gold-400">
              SECURITY DASHBOARD
            </h1>
            <p className="font-mono text-[10px] tracking-wider text-gold-500/30">
              NETWORK SECURITY & AUTHENTICATION
            </p>
          </div>
        </div>
        <div className="flex gap-1">
          {(['overview', 'trust-tree', 'threat-intel'] as const).map(view => (
            <button
              key={view}
              onClick={() => setActiveView(view)}
              className={`px-4 py-2 font-mono text-[10px] tracking-wider uppercase transition-all ${
                activeView === view
                  ? 'text-gold-400 border-b border-gold-500/50 bg-gold-500/5'
                  : 'text-gold-500/30 hover:text-gold-500/60'
              }`}
            >
              {view.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12">
          <VelocityGraph engine={aggregationEngine} />
        </div>

        {activeView === 'trust-tree' && (
          <div className="col-span-12">
            <TrustTreeHUD
              engine={trustEngine}
              originHash={originHash}
              onRevoke={onRevokeTrustAnchor}
              onEmitInvite={onEmitInvite}
            />
          </div>
        )}

        {activeView === 'threat-intel' && (
          <div className="col-span-12">
            <ThreatIntelligencePanel engine={aggregationEngine} />
          </div>
        )}
      </div>

    <div className="fixed bottom-0 left-0 right-0 bg-navy-900/95 backdrop-blur-xl border-t border-gold-500/10 px-8 py-2 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <StatusItem label="STATUS" value="OPERATIONAL" />
          <StatusItem label="KEYS" value={`${cohortStats.totalOrigins} ACTIVE`} />
          <StatusItem label="TOTAL CLICKS" value={aggregationEngine.getTotalProcessed().toLocaleString()} />
        </div>
        <div className="flex items-center gap-4">
          <StatusItem label="ENFORCEMENT" value="HARDWARE-BACKED" />
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        </div>
      </div>
    </div>
  );
};

const StatusItem = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center gap-2">
    <span className="font-mono text-[8px] tracking-wider text-gold-500/30">{label}</span>
    <span className="font-mono text-[10px] tracking-wider text-gold-400">{value}</span>
  </div>
);

const ThreatIntelligencePanel = ({ engine }: { engine: AggregationEngine }) => {
  return (
    <div className="bg-navy-950/80 backdrop-blur-xl border border-gold-500/10 rounded-2xl p-8">
      <h3 className="font-serif text-sm tracking-[0.3em] text-gold-400 uppercase mb-6">
        Traffic Intelligence
      </h3>
      <p className="font-mono text-xs text-gold-500/40">
        Global threat feed integration pending. Aggregating handshake velocity and anomaly patterns.
      </p>
    </div>
  );
};
