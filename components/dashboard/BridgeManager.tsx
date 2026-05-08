"use client";

import { useState, useEffect } from "react";
import { getBridgeTokens, createBridgeToken, revokeBridgeToken } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Key, Plus, Trash2, Copy, Check, ShieldCheck, Clock } from "lucide-react";
import { toast } from "sonner";

export function BridgeManager() {
  const [tokens, setTokens] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newTokenName, setNewTokenName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  useEffect(() => {
    fetchTokens();
  }, []);

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
    <div className="space-y-6">
      {/* Create Token */}
      <Card className="bg-zinc-950 border-zinc-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5">
          <Key className="w-24 h-24 text-amber-500" />
        </div>
        <CardHeader>
          <CardTitle className="text-amber-50 font-serif tracking-wider uppercase text-sm">Generate Sovereign Bridge Token</CardTitle>
          <CardDescription className="text-zinc-500">Create API tokens to integrate Mark Protocol with your automated infrastructure.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="flex gap-4">
            <Input
              placeholder="System / Production / CI-CD"
              value={newTokenName}
              onChange={(e) => setNewTokenName(e.target.value)}
              className="bg-black border-zinc-800 text-amber-50 focus:border-amber-500/50 h-12"
            />
            <Button 
              disabled={isCreating || !newTokenName}
              className="bg-amber-600 hover:bg-amber-700 text-black font-black uppercase tracking-widest h-12 px-8 shrink-0"
            >
              {isCreating ? "Generating..." : "Generate Token"}
              <Plus className="w-4 h-4 ml-2" />
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Tokens Table */}
      <Card className="bg-zinc-950 border-zinc-800 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-amber-50 font-serif tracking-wider uppercase text-sm">Active Bridge Tokens</CardTitle>
          <CardDescription className="text-zinc-500">Authorized automated access keys.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-zinc-800">
            <Table>
              <TableHeader className="bg-zinc-900/50">
                <TableRow className="border-zinc-800 hover:bg-transparent">
                  <TableHead className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest">Token Name</TableHead>
                  <TableHead className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest">Key Fragment</TableHead>
                  <TableHead className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest text-center">Status</TableHead>
                  <TableHead className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest text-right">Actions</TableHead>
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
                      <TableCell>
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
                        <code className="text-zinc-500 text-xs font-mono">
                          {token.token.substring(0, 6)}••••••••••••{token.token.substring(token.token.length - 4)}
                        </code>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-mono text-[10px] tracking-tighter">
                          AUTHORIZED
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToken(token.token, token.id)}
                            className="h-8 w-8 p-0 text-zinc-500 hover:text-amber-400 hover:bg-amber-950/30"
                          >
                            {copiedId === token.id ? <Check className="w-4 h-4 text-amber-500" /> : <Copy className="w-4 h-4" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRevoke(token.id)}
                            className="h-8 w-8 p-0 text-zinc-500 hover:text-red-500 hover:bg-red-950/30"
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
