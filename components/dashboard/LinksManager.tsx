"use client";

import { useState, useEffect } from "react";
import { Link, getLinks, createLink } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Link2, Plus, ExternalLink, Copy, Check, Search } from "lucide-react";
import { toast } from "sonner";

export function LinksManager() {
  const [links, setLinks] = useState<Link[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newCode, setNewCode] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  useEffect(() => {
    fetchLinks();
  }, []);

  async function fetchLinks() {
    setIsLoading(true);
    try {
      const data = await getLinks();
      setLinks(data);
    } catch (err) {
      toast.error("Failed to fetch links");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newUrl) return;
    
    setIsCreating(true);
    try {
      const code = newCode || Math.random().toString(36).substring(2, 8);
      await createLink(newUrl, code);
      toast.success("Link created successfully");
      setNewUrl("");
      setNewCode("");
      fetchLinks();
    } catch (err: any) {
      toast.error(err.message || "Failed to create link");
    } finally {
      setIsCreating(false);
    }
  }

  const copyLink = (code: string, id: number) => {
    const url = `${window.location.origin}/${code}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredLinks = links.filter(l => 
    l.original_url.toLowerCase().includes(search.toLowerCase()) || 
    l.short_code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-zinc-950 border-zinc-800 shadow-xl">
          <CardHeader className="pb-2">
            <CardDescription className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest">Total Short Links</CardDescription>
            <CardTitle className="text-3xl font-black text-amber-500">{links.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-zinc-950 border-zinc-800 shadow-xl">
          <CardHeader className="pb-2">
            <CardDescription className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest">Total Clicks</CardDescription>
            <CardTitle className="text-3xl font-black text-amber-500">
              {links.reduce((acc, curr) => acc + curr.clicks, 0).toLocaleString()}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-zinc-950 border-zinc-800 shadow-xl">
          <CardHeader className="pb-2">
            <CardDescription className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest">Global Reach</CardDescription>
            <CardTitle className="text-3xl font-black text-amber-500">Live</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Create Link */}
      <Card className="bg-zinc-950 border-zinc-800 shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500/0 via-amber-500 to-amber-500/0 opacity-30" />
        <CardHeader>
          <CardTitle className="text-amber-50 font-serif tracking-wider uppercase text-sm">Create New Link</CardTitle>
          <CardDescription className="text-zinc-500">Shorten and track any URL with LinkSnip.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 space-y-1">
              <Input
                placeholder="https://destination-url.com"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                className="bg-black border-zinc-800 text-amber-50 focus:border-amber-500/50 transition-all h-12"
              />
            </div>
            <div className="w-full md:w-48 space-y-1">
              <Input
                placeholder="custom-alias"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                className="bg-black border-zinc-800 text-amber-50 focus:border-amber-500/50 transition-all h-12 font-mono uppercase text-xs tracking-widest"
              />
            </div>
            <Button 
              disabled={isCreating || !newUrl}
              className="bg-amber-600 hover:bg-amber-700 text-black font-black uppercase tracking-widest h-12 px-8"
            >
              {isCreating ? "Creating..." : "Create Link"}
              <Plus className="w-4 h-4 ml-2" />
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Links Table */}
      <Card className="bg-zinc-950 border-zinc-800 shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-amber-50 font-serif tracking-wider uppercase text-sm">Active Links</CardTitle>
            <CardDescription className="text-zinc-500">Managing your deployed link infrastructure.</CardDescription>
          </div>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input
              placeholder="Search codes or URLs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-black border-zinc-800 pl-10 h-10 text-xs text-amber-50"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-zinc-800">
            <Table>
              <TableHeader className="bg-zinc-900/50">
                  <TableRow className="border-zinc-800 hover:bg-transparent">
                    <TableHead className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest">Short Link</TableHead>
                    <TableHead className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest">Destination</TableHead>
                    <TableHead className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest text-center">Clicks</TableHead>
                    <TableHead className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest text-right">Actions</TableHead>
                  </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-32 text-center">
                      <div className="flex items-center justify-center gap-2 text-zinc-500 animate-pulse font-mono text-[10px] uppercase tracking-widest">
                        Loading Data...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredLinks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-32 text-center text-zinc-500 font-mono text-[10px] uppercase tracking-widest">
                      No Links Found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLinks.map((link) => (
                    <TableRow key={link.id} className="border-zinc-800 hover:bg-zinc-900/30 transition-colors group">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-amber-500/10 flex items-center justify-center text-amber-500">
                            <Link2 className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-amber-50 font-mono text-xs font-bold tracking-widest uppercase">
                              /{link.short_code}
                            </p>
                            <p className="text-zinc-500 text-[9px] uppercase tracking-tighter">
                              Created {new Date(link.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[300px] truncate">
                        <a 
                          href={link.original_url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-zinc-400 hover:text-amber-400 transition-colors text-xs font-mono"
                        >
                          {link.original_url}
                        </a>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="bg-amber-500/5 border-amber-500/20 text-amber-500 font-mono">
                          {link.clicks.toLocaleString()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyLink(link.short_code, link.id)}
                            className="h-8 w-8 p-0 text-zinc-500 hover:text-amber-400 hover:bg-amber-950/30"
                          >
                            {copiedId === link.id ? <Check className="w-4 h-4 text-amber-500" /> : <Copy className="w-4 h-4" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            className="h-8 w-8 p-0 text-zinc-500 hover:text-amber-400 hover:bg-amber-950/30"
                          >
                            <a href={`/${link.short_code}`} target="_blank" rel="noreferrer">
                              <ExternalLink className="w-4 h-4" />
                            </a>
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
