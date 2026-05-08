"use client";

import { useEffect, useState } from "react";
import { ImperialConsole } from "@/components/mrk/ImperialConsole";
import { AggregationEngine } from "@/lib/mrk/intelligence/AggregationEngine";
import { TrustDelegationEngine } from "@/lib/mrk/trust/TrustDelegationEngine";
import { startRegistration } from "@simplewebauthn/browser";
import { 
  isChainIntactAction,
  emitDelegationInviteAction,
  claimDelegationInviteAction,
  revokeTrustAnchorAction,
  getTrustTreeAction,
  getAnonymizedCohortStatsAction,
  mintOriginAnchorAction,
  generateWebAuthnOptionsAction,
  verifyWebAuthnRegistrationAction,
  getHandshakeEventsAction
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
  const [isMinting, setIsMinting] = useState(false);

  useEffect(() => {
    const { aggregationEngine, trustEngine } = getEngines();
    setEngines({ aggregationEngine, trustEngine });

    const initEngine = async () => {
      try {
        // 1. Self-healing migration
        await trustEngine.getAnonymizedCohortStats();
        
        // 2. Check for persisted session
        const savedHash = document.cookie.split("; ").find(row => row.startsWith("mrk_origin_hash="))?.split("=")[1];
        if (savedHash) {
          setOriginHash(savedHash);
        }

        // 3. Fetch REAL handshake data from the database to populate the graph
        const recentEvents = await getHandshakeEventsAction();
        recentEvents.forEach(ev => aggregationEngine.ingestEvent(ev));
      } catch (err: any) {
        console.error("Failed to initialize Imperial Console:", err);
        setOriginHash("ERROR: " + err.message);
      }
    };

    initEngine();
  }, []);

  const handleBiometricEnrollment = async () => {
    setIsMinting(true);
    try {
      const options = await generateWebAuthnOptionsAction("mrk-admin");
      const attResp = await startRegistration({ optionsJSON: options });
      const result = await verifyWebAuthnRegistrationAction(attResp);
      
      if (result.verified) {
        setOriginHash(result.originHash);
        // Persist the session for 24 hours
        document.cookie = `mrk_origin_hash=${result.originHash}; path=/; max-age=${60 * 60 * 24}; SameSite=Lax`;
      }
    } catch (err: any) {
      console.error(err);
      alert("Biometric enrollment failed: " + err.message);
    } finally {
      setIsMinting(false);
    }
  };

  if (!engines) {
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
          {originHash.replace("ERROR: ", "")}
        </p>
      </div>
    );
  }

  if (!originHash) {
    return (
      <div className="min-h-screen bg-navy-950 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-24 h-24 rounded-full border border-gold-400/30 flex items-center justify-center mb-8 relative">
          <div className="absolute inset-0 rounded-full border-t border-gold-400 animate-spin opacity-50" />
          <svg className="w-8 h-8 text-gold-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
          </svg>
        </div>
        <p className="font-serif text-xl tracking-[0.3em] text-gold-400 mb-2">
          BIOMETRIC LOCK ENGAGED
        </p>
        <p className="font-mono text-sm text-slate-400 mb-12 max-w-md">
          The Imperial Console requires a Sovereign Trust Anchor to initialize. Please authenticate using your hardware security key or biometric sensor.
        </p>
        <button 
          onClick={handleBiometricEnrollment}
          disabled={isMinting}
          className="px-8 py-3 border border-gold-400/50 text-gold-400 font-serif tracking-[0.2em] text-sm hover:bg-gold-400/10 transition-colors disabled:opacity-50"
        >
          {isMinting ? "VERIFYING SIGNATURE..." : "MINT TRUST ANCHOR"}
        </button>
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
