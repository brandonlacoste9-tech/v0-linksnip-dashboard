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
import { useI18n } from "@/lib/i18n/context";

export function LinksManager() {
  const { t } = useI18n();
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
        <Card className="bg-card border-border shadow-xl">
          <CardHeader className="pb-2">
            <CardDescription className="text-muted-foreground font-mono text-[10px] uppercase tracking-widest">{t.linksManager.totalLinks}</CardDescription>
            <CardTitle className="text-3xl font-black text-primary">{links.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-card border-border shadow-xl">
          <CardHeader className="pb-2">
            <CardDescription className="text-muted-foreground font-mono text-[10px] uppercase tracking-widest">{t.linksManager.totalClicks}</CardDescription>
            <CardTitle className="text-3xl font-black text-primary">
              {links.reduce((acc, curr) => acc + curr.clicks, 0).toLocaleString()}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-card border-border shadow-xl">
          <CardHeader className="pb-2">
            <CardDescription className="text-muted-foreground font-mono text-[10px] uppercase tracking-widest">{t.linksManager.globalReach}</CardDescription>
            <CardTitle className="text-3xl font-black text-primary">Live</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Create Link */}
      <Card className="bg-card border-border shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/0 via-primary to-primary/0 opacity-30" />
        <CardHeader>
          <CardTitle className="text-foreground font-serif tracking-wider uppercase text-sm">{t.linksManager.createTitle}</CardTitle>
          <CardDescription className="text-muted-foreground">{t.linksManager.createDesc}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 space-y-1">
              <Input
                placeholder="https://destination-url.com"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                className="bg-background border-border text-foreground focus:border-primary/50 transition-all h-12"
              />
            </div>
            <div className="w-full md:w-48 space-y-1">
              <Input
                placeholder="custom-alias"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                className="bg-background border-border text-foreground focus:border-primary/50 transition-all h-12 font-mono uppercase text-xs tracking-widest"
              />
            </div>
            <Button 
              disabled={isCreating || !newUrl}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest h-12 px-8"
            >
              {isCreating ? "Creating..." : "Zipd Link"}
              <Plus className="w-4 h-4 ml-2" />
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Links Table */}
      <Card className="bg-card border-border shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-foreground font-serif tracking-wider uppercase text-sm">{t.linksManager.activeLinks}</CardTitle>
            <CardDescription className="text-muted-foreground">{t.linksManager.activeLinksDesc}</CardDescription>
          </div>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search codes or URLs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-background border-border pl-10 h-10 text-xs text-foreground"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border">
            <Table>
              <TableHeader className="bg-muted/50">
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground font-mono text-[10px] uppercase tracking-widest">Zipd Link</TableHead>
                    <TableHead className="text-muted-foreground font-mono text-[10px] uppercase tracking-widest">Destination</TableHead>
                    <TableHead className="text-muted-foreground font-mono text-[10px] uppercase tracking-widest text-center">Clicks</TableHead>
                    <TableHead className="text-muted-foreground font-mono text-[10px] uppercase tracking-widest text-right">Actions</TableHead>
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
                    <TableRow key={link.id} className="border-border hover:bg-muted/30 transition-colors group">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary">
                            <Link2 className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-foreground font-mono text-xs font-bold tracking-widest uppercase">
                              /{link.short_code}
                            </p>
                            <p className="text-muted-foreground text-[9px] uppercase tracking-tighter">
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
                          className="text-muted-foreground hover:text-primary transition-colors text-xs font-mono"
                        >
                          {link.original_url}
                        </a>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary font-mono">
                          {link.clicks.toLocaleString()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyLink(link.short_code, link.id)}
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-primary hover:bg-primary/10"
                          >
                            {copiedId === link.id ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-primary hover:bg-primary/10"
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
