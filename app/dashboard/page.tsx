"use client";

import { useEffect, useState } from "react";
import { ImperialConsole } from "@/components/mrk/ImperialConsole";
import { AggregationEngine } from "@/lib/mrk/intelligence/AggregationEngine";
import { TrustDelegationEngine } from "@/lib/mrk/trust/TrustDelegationEngine";
import { 
  isChainIntactAction,
  emitDelegationInviteAction,
  claimDelegationInviteAction,
  revokeTrustAnchorAction,
  getTrustTreeAction,
  getAnonymizedCohortStatsAction,
  mintOriginAnchorAction 
} from "@/app/mrk-actions";

// Singleton engine for intelligence (purely in-memory on client for now)
let aggregationEngine: AggregationEngine;

// Proxy object that implements the TrustDelegationEngine interface using Server Actions
const trustEngineProxy: TrustDelegationEngine = {
  isChainIntact: isChainIntactAction,
  emitDelegationInvite: emitDelegationInviteAction as any,
  claimDelegationInvite: claimDelegationInviteAction,
  revokeTrustAnchor: revokeTrustAnchorAction,
  getTrustTree: getTrustTreeAction,
  getAnonymizedCohortStats: getAnonymizedCohortStatsAction,
  mintOriginAnchor: mintOriginAnchorAction,
};

function getEngines() {
  if (!aggregationEngine) {
    aggregationEngine = new AggregationEngine();
  }
  return { aggregationEngine, trustEngine: trustEngineProxy };
}

export default function DashboardPage() {
  const [engines, setEngines] = useState<{
    aggregationEngine: AggregationEngine;
    trustEngine: TrustDelegationEngine;
  } | null>(null);

  const [originHash, setOriginHash] = useState<string>("");

  useEffect(() => {
    const { aggregationEngine, trustEngine } = getEngines();
    setEngines({ aggregationEngine, trustEngine });

    const initEngine = async () => {
      try {
        // Seed a demo Origin trust anchor if none exists
        const existingOrigins = await trustEngine.getAnonymizedCohortStats();
        let activeOriginHash = "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2";
        if (existingOrigins.totalOrigins === 0) {
          // In a real app, this would be fetched from the backend after WebAuthn enrollment
          await trustEngine.mintOriginAnchor(activeOriginHash, "demo-credential-id");
        }
        setOriginHash(activeOriginHash);
      } catch (err: any) {
        console.error("Failed to initialize Imperial Console:", err);
        setOriginHash("ERROR: " + err.message);
      }
    };

    initEngine();

    // Simulate incoming handshake events for demo velocity graph
    const interval = setInterval(() => {
      aggregationEngine.ingestEvent({
        eventId: crypto.randomUUID(),
        timestamp: Date.now(),
        identityHash: Array.from({ length: 64 }, () =>
          Math.floor(Math.random() * 16).toString(16)
        ).join(""),
        saltWindowId: Math.floor(Date.now() / (24 * 60 * 60 * 1000)),
        trustDepth: Math.floor(Math.random() * 3),
        linkTier: "classified",
        geoRegion: ["NA", "EU", "AS", "OC", "UNKNOWN"][Math.floor(Math.random() * 5)],
        authMethod: "webauthn",
        outcome: ["resolved", "resolved", "resolved", "locked", "defending"][
          Math.floor(Math.random() * 5)
        ] as any,
        latencyMs: Math.random() * 15 + 3,
        threatFlags: [],
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  if (!engines || !originHash) {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center">
        <p className="font-serif text-sm tracking-[0.3em] text-gold-400 animate-pulse">
          LOADING IMPERIAL CONSOLE
        </p>
      </div>
    );
  }

  if (originHash.startsWith("ERROR:")) {
    return (
      <div className="min-h-screen bg-navy-950 flex flex-col items-center justify-center p-8 text-center">
        <p className="font-serif text-xl tracking-[0.3em] text-red-500 mb-4">
          NEXUS DISCONNECTED
        </p>
        <p className="font-mono text-sm text-red-400/80">
          {originHash}
        </p>
      </div>
    );
  }

  return (
    <ImperialConsole
      aggregationEngine={engines.aggregationEngine}
      trustEngine={engines.trustEngine}
      originHash={originHash}
      onEmitInvite={async () => {
        try {
          const invite = await engines.trustEngine.emitDelegationInvite(originHash);
          console.log("Invite emitted:", invite);
        } catch (e) {
          console.error(e);
        }
      }}
      onRevokeTrustAnchor={async (hash: string) => {
        try {
          await engines.trustEngine.revokeTrustAnchor(hash, originHash);
        } catch (e) {
          console.error(e);
        }
      }}
    />
  );
}
