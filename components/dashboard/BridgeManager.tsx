"use client";

import { useState, useEffect } from "react";
import { getBridgeTokens, createBridgeToken, revokeBridgeToken } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Key, Plus, Trash2, Copy, Check, ShieldCheck, Clock, Zap, Activity, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { getSentinelAlertsAction } from "@/app/security-actions";
import { motion, AnimatePresence } from "framer-motion";

export function BridgeManager() {
  const [tokens, setTokens] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newTokenName, setNewTokenName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    fetchTokens();
    fetchAlerts();

    const interval = setInterval(fetchAlerts, 5000);
    return () => clearInterval(interval);
  }, []);

  async function fetchAlerts() {
    try {
      const data = await getSentinelAlertsAction();
      setAlerts(data as any[]);
    } catch (err) {
      console.error("Failed to fetch alerts");
    }
  }

  async function fetchTokens() {
    setIsLoading(true);
    try {
      const data = await getBridgeTokens();
      setTokens(data);
    } catch (err) {
      toast.error("Failed to fetch bridge tokens");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newTokenName) return;
    
    setIsCreating(true);
    try {
      await createBridgeToken(newTokenName);
      toast.success("Bridge token generated");
      setNewTokenName("");
      fetchTokens();
    } catch (err: any) {
      toast.error("Failed to generate token");
    } finally {
      setIsCreating(false);
    }
  }

  async function handleRevoke(id: number) {
    try {
      await revokeBridgeToken(id);
      toast.success("Token revoked");
      fetchTokens();
    } catch (err) {
      toast.error("Failed to revoke token");
    }
  }

  const copyToken = (token: string, id: number) => {
    navigator.clipboard.writeText(token);
    setCopiedId(id);
    toast.success("Token copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column: Token Management */}
      <div className="lg:col-span-2 space-y-6">
        {/* Create Token */}
        <Card className="bg-zinc-950/50 border-zinc-800 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Key className="w-24 h-24 text-amber-500" />
          </div>
          <CardHeader>
            <CardTitle className="text-amber-50 font-serif tracking-wider uppercase text-sm flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              Generate Security Bridge Token
            </CardTitle>
            <CardDescription className="text-zinc-500 italic">Create API tokens to integrate Zipd Security with your automated infrastructure.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="flex gap-4">
              <Input
                placeholder="System / Production / CI-CD"
                value={newTokenName}
                onChange={(e) => setNewTokenName(e.target.value)}
                className="bg-black/50 border-zinc-800 text-amber-50 focus:border-amber-500/50 h-12 rounded-none font-mono"
              />
              <Button 
                disabled={isCreating || !newTokenName}
                className="bg-amber-600 hover:bg-amber-700 text-black font-black uppercase tracking-widest h-12 px-8 shrink-0 rounded-none shadow-[0_0_20px_rgba(217,119,6,0.3)] transition-all hover:scale-105"
              >
                {isCreating ? "Generating..." : "Generate Token"}
                <Plus className="w-4 h-4 ml-2" />
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Tokens Table */}
        <Card className="bg-zinc-950/50 border-zinc-800 backdrop-blur-xl shadow-2xl overflow-hidden">
          <CardHeader className="border-b border-zinc-900 bg-zinc-900/20">
            <CardTitle className="text-amber-50 font-serif tracking-wider uppercase text-sm">Active Bridge Tokens</CardTitle>
            <CardDescription className="text-zinc-500">Authorized automated access keys.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-black/40">
                <TableRow className="border-zinc-800 hover:bg-transparent">
                  <TableHead className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest px-6 py-4">Token Name</TableHead>
                  <TableHead className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest">Key Fragment</TableHead>
                  <TableHead className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest text-center">Status</TableHead>
                  <TableHead className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest text-right px-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-32 text-center text-zinc-500 font-mono text-[10px] uppercase tracking-widest animate-pulse">
                      Synchronizing Keys...
                    </TableCell>
                  </TableRow>
                ) : tokens.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-32 text-center text-zinc-500 font-mono text-[10px] uppercase tracking-widest">
                      No Active Tokens
                    </TableCell>
                  </TableRow>
                ) : (
                  tokens.map((token) => (
                    <TableRow key={token.id} className="border-zinc-800 hover:bg-zinc-900/30 transition-colors">
                      <TableCell className="px-6">
                        <div className="flex items-center gap-3">
                          <ShieldCheck className="w-4 h-4 text-amber-500/50" />
                          <div>
                            <p className="text-amber-50 font-mono text-xs font-bold uppercase tracking-widest">
                              {token.name}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Clock className="w-3 h-3 text-zinc-600" />
                              <p className="text-zinc-600 text-[8px] uppercase tracking-tighter">
                                Created {new Date(token.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-zinc-500 text-xs font-mono bg-black/30 px-2 py-1">
                          {token.token.substring(0, 6)}••••••••••••{token.token.substring(token.token.length - 4)}
                        </code>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-mono text-[10px] tracking-tighter rounded-none">
                          AUTHORIZED
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right px-6">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToken(token.token, token.id)}
                            className="h-8 w-8 p-0 text-zinc-500 hover:text-amber-400 hover:bg-amber-950/30 rounded-none"
                          >
                            {copiedId === token.id ? <Check className="w-4 h-4 text-amber-500" /> : <Copy className="w-4 h-4" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRevoke(token.id)}
                            className="h-8 w-8 p-0 text-zinc-500 hover:text-red-500 hover:bg-red-950/30 rounded-none"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Right Column: Nexus Intelligence Feed */}
      <div className="space-y-6">
        <Card className="bg-zinc-950/80 border-cyan-900/30 backdrop-blur-2xl shadow-[0_0_50px_rgba(6,182,212,0.1)] h-full overflow-hidden flex flex-col">
          <CardHeader className="border-b border-cyan-950 bg-cyan-950/10 relative overflow-hidden">
            {/* Pulsing Energy Background */}
            <motion.div 
              animate={{ 
                opacity: [0.05, 0.15, 0.05],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.3)_0%,transparent_70%)]"
            />
            
            <CardTitle className="text-cyan-400 font-mono tracking-[0.3em] uppercase text-[10px] flex items-center justify-between relative z-10">
              <span className="flex items-center gap-2">
                <Activity className="w-3 h-3 animate-pulse" />
                Nexus Neural Feed
              </span>
              <span className="text-cyan-900 font-bold">V1.0.4-BETA</span>
            </CardTitle>
          </CardHeader>

          <CardContent className="p-6 flex-1 flex flex-col gap-6 relative z-10">
            {/* Neural Topology Visualizer */}
            <div className="h-32 border border-cyan-900/20 bg-black/40 relative overflow-hidden group">
              <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.05)_1px,transparent_1px)] bg-[size:10px_10px]" />
              
              <svg className="absolute inset-0 w-full h-full">
                <motion.path
                  d="M 0 64 Q 100 20 200 64 T 400 64"
                  fill="none"
                  stroke="rgba(6,182,212,0.2)"
                  strokeWidth="1"
                  animate={{ d: ["M 0 64 Q 100 20 200 64 T 400 64", "M 0 64 Q 100 100 200 64 T 400 64", "M 0 64 Q 100 20 200 64 T 400 64"] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                />
                <motion.path
                  d="M 0 64 Q 150 10 300 64 T 600 64"
                  fill="none"
                  stroke="rgba(6,182,212,0.4)"
                  strokeWidth="2"
                  animate={{ strokeDashoffset: [0, -100] }}
                  strokeDasharray="10 20"
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                />
              </svg>
              
              <div className="absolute bottom-2 left-3 flex items-center gap-4">
                <div className="flex flex-col">
                  <span className="text-cyan-500 font-mono text-[8px] uppercase tracking-widest">Sentinel Link</span>
                  <span className="text-white font-mono text-[10px] font-black uppercase">Established</span>
                </div>
                <div className="flex flex-col border-l border-zinc-800 pl-4">
                  <span className="text-zinc-500 font-mono text-[8px] uppercase tracking-widest">Sync Rate</span>
                  <span className="text-cyan-400 font-mono text-[10px] font-black uppercase">98.4ms</span>
                </div>
              </div>

              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <motion.div
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-12 h-12 rounded-full bg-cyan-500/20 blur-xl"
                />
                <Zap className="w-6 h-6 text-cyan-400 relative z-10" />
              </div>
            </div>

            {/* Live Alerts Stream */}
            <div className="flex-1 flex flex-col gap-3 overflow-hidden">
              <h4 className="text-zinc-500 font-mono text-[8px] uppercase tracking-[0.4em] mb-2 border-b border-zinc-900 pb-2">Intelligence Stream</h4>
              <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                <AnimatePresence initial={false}>
                  {alerts.length === 0 ? (
                    <div className="h-32 flex items-center justify-center border border-zinc-900 bg-zinc-900/10">
                      <p className="text-zinc-700 font-mono text-[10px] uppercase tracking-widest italic">Waiting for signal...</p>
                    </div>
                  ) : (
                    alerts.map((alert, idx) => (
                      <motion.div
                        key={alert.id || idx}
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={`p-3 border-l-2 ${
                          alert.severity === 'critical' ? 'border-red-500 bg-red-500/5' : 
                          alert.severity === 'high' ? 'border-orange-500 bg-orange-500/5' : 
                          'border-cyan-500/30 bg-cyan-500/5'
                        } backdrop-blur-sm relative group`}
                      >
                        <div className="flex items-start justify-between mb-1">
                          <span className={`font-mono text-[8px] font-black uppercase tracking-widest ${
                            alert.severity === 'critical' ? 'text-red-400' : 
                            alert.severity === 'high' ? 'text-orange-400' : 
                            'text-cyan-400'
                          }`}>
                            {alert.type.replace('_', ' ')}
                          </span>
                          <span className="text-zinc-600 font-mono text-[8px]">
                            {new Date(alert.created_at).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-white/80 font-mono text-[10px] leading-relaxed">
                          {alert.message}
                        </p>
                        <div className="absolute right-2 bottom-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="sm" className="h-5 text-[8px] uppercase text-zinc-500 hover:text-cyan-400 p-0 px-1">
                            Acknowledge
                          </Button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </div>

            <Button className="w-full bg-cyan-950/20 hover:bg-cyan-900/30 border border-cyan-900/30 text-cyan-400 font-mono text-[9px] uppercase tracking-[0.2em] h-10 rounded-none group">
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-3 h-3 transition-transform group-hover:rotate-12" />
                Initialize System Audit
              </span>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
