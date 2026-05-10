"use client";

import { useEffect, useState } from "react";
import { SecurityConsole } from "@/components/security/SecurityConsole";
import { AggregationEngine } from "@/lib/security/intelligence/AggregationEngine";
import { AuthorityDelegationEngine } from "@/lib/security/trust/AuthorityDelegationEngine";
import { startRegistration } from "@simplewebauthn/browser";
import { LinksManager } from "@/components/dashboard/LinksManager";
import { BridgeManager } from "@/components/dashboard/BridgeManager";
import { 
  isChainIntactAction,
  emitAccessInviteAction,
  claimAccessInviteAction,
  revokeAccessIdentityAction,
  getAccessTreeAction,
  getAnonymizedCohortStatsAction,
  mintOriginIdentityAction,
  generateWebAuthnOptionsAction,
  verifyWebAuthnRegistrationAction,
  getSecurityEventsAction,
  getSentinelAlertsAction
} from "@/app/security-actions";
import { useI18n } from "@/lib/i18n/context";
import { useTheme } from "next-themes";
import { Sun, Moon, Globe, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Language } from "@/lib/i18n/translations";

// Singleton engine for intelligence (purely in-memory on client for now)
let aggregationEngine: AggregationEngine;

// Proxy object that implements the AuthorityDelegationEngine interface using Server Actions
const authorityEngineProxy: AuthorityDelegationEngine = {
  isChainIntact: isChainIntactAction,
  emitAccessInvite: emitAccessInviteAction as any,
  claimAccessInvite: claimAccessInviteAction,
  revokeAccessIdentity: revokeAccessIdentityAction,
  getAccessTree: getAccessTreeAction,
  getAnonymizedCohortStats: getAnonymizedCohortStatsAction,
  mintOriginIdentity: mintOriginIdentityAction,
};

function getEngines() {
  if (!aggregationEngine) {
    aggregationEngine = new AggregationEngine();
  }
  return { aggregationEngine, authorityEngine: authorityEngineProxy };
}

type DashboardTab = "links" | "security" | "bridge";

export default function DashboardPage() {
  const { t, language, setLanguage } = useI18n();
  const { theme, setTheme } = useTheme();
  
  const [engines, setEngines] = useState<{
    aggregationEngine: AggregationEngine;
    authorityEngine: AuthorityDelegationEngine;
  } | null>(null);

  const [activeTab, setActiveTab] = useState<DashboardTab>("links");

  useEffect(() => {
    const { aggregationEngine, authorityEngine } = getEngines();
    setEngines({ aggregationEngine, authorityEngine });

    const initEngine = async () => {
      try {
        // 1. Self-healing migration
        await authorityEngine.getAnonymizedCohortStats();
        
        // 2. Fetch initial historical security data
        const recentEvents = await getSecurityEventsAction();
        recentEvents.forEach(ev => aggregationEngine.ingestEvent(ev));
      } catch (err: any) {
        console.error("Failed to initialize Dashboard Engine:", err);
      }
    };

    initEngine();

    // 3. Set up a real-time polling interval to fetch NEW traffic from the DB
    const pollInterval = setInterval(async () => {
      try {
        const freshEvents = await getSecurityEventsAction();
        freshEvents.forEach(ev => aggregationEngine.ingestEvent(ev));
      } catch (e) {
        console.error("Polling failed:", e);
      }
    }, 10000); 

    return () => clearInterval(pollInterval);
  }, []);

  if (!engines) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const languages: { code: Language; name: string; flag: string }[] = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top Navigation */}
      <div className="bg-card border-b border-border px-8 h-16 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
              <span className="font-black text-primary-foreground">Z</span>
            </div>
            <span className="font-black text-foreground tracking-widest text-lg uppercase">Zipd</span>
          </div>

          <nav className="flex gap-1">
            {(["links", "security", "bridge"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 font-mono text-[10px] tracking-[0.2em] uppercase transition-all ${
                  activeTab === tab
                    ? "text-primary bg-primary/5 border-b-2 border-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab === "security" ? t.dashboard.security : t.dashboard[tab]}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary h-8 gap-2 px-2 rounded-md">
                  <Globe className="w-3.5 h-3.5" />
                  <span className="uppercase text-[10px] font-bold">{language}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-popover border-border text-foreground rounded-xl min-w-[140px] shadow-2xl">
                {languages.map((lang) => (
                  <DropdownMenuItem 
                    key={lang.code}
                    className="gap-3 cursor-pointer focus:bg-primary/10 focus:text-primary py-2"
                    onClick={() => setLanguage(lang.code)}
                  >
                    <span className="text-base">{lang.flag}</span>
                    <span className="text-xs font-medium">{lang.name}</span>
                    {language === lang.code && <Check className="w-3.5 h-3.5 ml-auto text-primary" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme Switcher */}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="text-muted-foreground hover:text-primary h-8 w-8 p-0"
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </Button>
          </div>

          <div className="flex items-center gap-4 text-muted-foreground font-mono text-[10px] uppercase tracking-widest border-l border-border pl-6 h-8">
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {t.dashboard.status}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto p-8">
        {activeTab === "links" && <LinksManager />}
        
        {activeTab === "security" && (
          <SecurityConsole
            aggregationEngine={engines.aggregationEngine}
            authorityEngine={engines.authorityEngine}
            originHash="SYSTEM"
            onEmitInvite={async () => {
              try {
                await engines.authorityEngine.emitAccessInvite("SYSTEM");
              } catch (e) {
                console.error(e);
              }
            }}
            onRevokeAccessIdentity={async (hash: string) => {
              try {
                await engines.authorityEngine.revokeAccessIdentity(hash, "SYSTEM");
              } catch (e) {
                console.error(e);
              }
            }}
          />
        )}

        {activeTab === "bridge" && <BridgeManager />}
      </div>
    </div>
  );
}
