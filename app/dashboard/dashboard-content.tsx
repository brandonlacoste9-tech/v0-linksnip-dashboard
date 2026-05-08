import { 
  Plus, Copy, MoreVertical, Search, Wand2, 
  ExternalLink, TrendingUp, Download, BarChart3, Settings, Activity, Terminal, Globe, 
  Shield, Key, Link as LinkIcon, Trash2, Zap, Lock, Database, Cpu
} from "lucide-react"
import { toast } from "sonner"
import NextLink from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createLink, getLinks, getLatestClicks, getBridgeTokens, createBridgeToken, revokeBridgeToken } from "@/app/actions"
import type { Link } from "@/app/actions"

// MRK Module Imports
import { SentinelShield } from "@/components/mrk/SentinelShield"
import { TrustTreeHUD } from "@/components/mrk/TrustTreeHUD"

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("protocols")
  const [searchQuery, setSearchQuery] = useState("")
  const [links, setLinks] = useState<Link[]>([])
  const [liveClicks, setLiveClicks] = useState<any[]>([])
  const [bridgeTokens, setBridgeTokens] = useState<any[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isBridgeModalOpen, setIsBridgeModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({ url: "", slug: "" })
  const [bridgeName, setBridgeName] = useState("")

  useEffect(() => {
    async function loadInitialData() {
      try {
        setLoading(true)
        const [linksData, tokensData] = await Promise.all([
          getLinks(),
          getBridgeTokens()
        ])
        setLinks(linksData)
        setBridgeTokens(tokensData)
      } catch (error) {
        console.error('Error loading data:', error)
        toast.error("Failed to synchronize with MRK Nexus")
      } finally {
        setLoading(false)
      }
    }
    loadInitialData()

    // Live Pulse Polling (Every 10 seconds)
    const pollClicks = async () => {
      const data = await getLatestClicks(5)
      setLiveClicks(data)
    }
    pollClicks()
    const interval = setInterval(pollClicks, 10000)
    return () => clearInterval(interval)
  }, [])

  const filteredLinks = useMemo(() => {
    return links.filter(link => 
      link.original_url.toLowerCase().includes(searchQuery.toLowerCase()) ||
      link.short_code.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [searchQuery, links])

  const generateMagicCode = () => {
    const chars = "abcdefghjkmnpqrstuvwxyz23456789"
    const code = Array.from({ length: 6 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join("")
    setFormData(prev => ({ ...prev, slug: code }))
    toast.success("Cryptographic slug generated")
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.url) return toast.error("Authority URL required")
    if (!formData.slug) return toast.error("Protocol slug required")

    setIsSubmitting(true)
    try {
      const newLink = await createLink(formData.url, formData.slug)
      setLinks([newLink, ...links])
      setIsModalOpen(false)
      setFormData({ url: "", slug: "" })
      toast.success("MRK Protocol Sequence Established")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Handshake Failed")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCreateBridge = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!bridgeName) return toast.error("Gateway identity required")
    
    setIsSubmitting(true)
    try {
      const token = await createBridgeToken(bridgeName)
      setBridgeTokens([token, ...bridgeTokens])
      setIsBridgeModalOpen(false)
      setBridgeName("")
      toast.success("Sovereign Key Matrix Generated")
    } catch (error) {
      toast.error("Bridge Provisioning Failure")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRevokeBridge = async (id: number) => {
    try {
      await revokeBridgeToken(id)
      setBridgeTokens(bridgeTokens.filter(t => t.id !== id))
      toast.success("Identity Severed from Matrix")
    } catch (error) {
      toast.error("Revocation Ceremony Interrupted")
    }
  }

  const copyToClipboard = (text: string, label: string = "Protocol URL") => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied to neural buffer`)
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0a0e1a] text-zinc-300 overflow-hidden relative">
      {/* MRK Architectural Background */}
      <div className="absolute top-[-20%] right-[-10%] w-[70%] h-[70%] rounded-full bg-[#c9a84c]/5 blur-[160px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#c9a84c]/3 blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />

      {/* Header */}
      <header className="h-20 border-b border-white/5 bg-[#0d1221]/80 backdrop-blur-xl flex items-center justify-between px-8 shrink-0 z-20 shadow-imperial">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-[#c9a84c] to-[#a68a3d] rounded-xl flex items-center justify-center shadow-glow-gold relative overflow-hidden group">
            <Cpu className="w-7 h-7 text-[#0a0e1a] relative z-10 group-hover:scale-110 transition-transform" />
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gradient-gold tracking-tighter leading-none">MRK PROTOCOL</h1>
            <p className="text-[10px] text-zinc-500 uppercase tracking-[0.4em] font-bold mt-1.5 ml-0.5">Sovereign Trust Layer</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="bg-white/5 p-1 rounded-xl border border-white/5">
            <TabsList className="bg-transparent border-none h-9">
              <TabsTrigger value="protocols" className="data-[state=active]:bg-[#c9a84c] data-[state=active]:text-[#0a0e1a] rounded-lg transition-all text-[10px] font-black uppercase tracking-widest px-6">Protocols</TabsTrigger>
              <TabsTrigger value="matrix" className="data-[state=active]:bg-[#c9a84c] data-[state=active]:text-[#0a0e1a] rounded-lg transition-all text-[10px] font-black uppercase tracking-widest px-6">Delegation</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="h-8 w-px bg-white/10" />

          <Button 
            className="bg-gradient-to-r from-[#c9a84c] to-[#a68a3d] text-[#0a0e1a] hover:from-[#d4b44e] hover:to-[#c9a84c] shadow-imperial font-black rounded-xl h-11 px-6 group transition-all"
            onClick={() => activeTab === 'protocols' ? setIsModalOpen(true) : setIsBridgeModalOpen(true)}
          >
            {activeTab === 'protocols' ? (
              <><Zap className="w-4 h-4 mr-2 group-hover:scale-125 transition-transform" /> Establish Protocol</>
            ) : (
              <><Shield className="w-4 h-4 mr-2 group-hover:scale-125 transition-transform" /> Provision Matrix</>
            )}
          </Button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden flex">
        
        {/* Left Sidebar: Sentinel Pulse */}
        <aside className="w-80 border-r border-white/5 bg-[#0d1221]/40 flex flex-col shrink-0">
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-2">
              <Activity className="w-3 h-3 text-[#c9a84c] animate-pulse" /> Sentinel Pulse
            </h3>
            <Badge variant="outline" className="text-[9px] bg-[#c9a84c]/5 text-[#c9a84c] border-[#c9a84c]/20 font-black tracking-tighter">LIVE_Nexus</Badge>
          </div>
          
          <div className="p-8 flex justify-center">
            <SentinelShield state={liveClicks.length > 0 ? 'RESOLVED' : 'EVALUATING'} threatLevel={0.12} />
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar border-t border-white/5">
            {liveClicks.length > 0 ? liveClicks.map((click) => (
              <div key={click.id} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-[#c9a84c]/20 transition-all group shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono text-[#c9a84c] tracking-tighter">PROTO://{click.shortCode}</span>
                  <span className="text-[10px] text-zinc-600 font-bold">{new Date(click.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5 text-zinc-500 group-hover:text-[#c9a84c] transition-colors" />
                  <span className="text-[11px] font-black text-zinc-300 truncate uppercase tracking-widest">{click.country} Node Resolve</span>
                </div>
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center h-40 text-zinc-700 opacity-50 space-y-3">
                <div className="w-10 h-10 rounded-full border border-current animate-ping opacity-20" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em]">Listening for traffic...</p>
              </div>
            )}
          </div>
          
          <div className="p-6 border-t border-white/5">
            <Button variant="ghost" className="w-full justify-start text-zinc-500 hover:text-[#c9a84c] hover:bg-white/5 rounded-xl transition-all h-11" asChild>
              <NextLink href="/dashboard/analytics">
                <BarChart3 className="w-4 h-4 mr-3" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Telemetry Vault</span>
              </NextLink>
            </Button>
          </div>
        </aside>

        {/* Primary Content Grid */}
        <main className="flex-1 overflow-y-auto p-8 bg-[#0a0e1a]/50 relative custom-scrollbar">
          
          <TabsContent value="protocols" className="m-0 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatMiniCard label="Protocol Resolves" value={links.reduce((acc, l) => acc + (l.clicks || 0), 0).toLocaleString()} icon={<Activity className="text-[#c9a84c]" />} />
              <StatMiniCard label="Active Sequences" value={links.length.toString()} icon={<LinkIcon className="text-[#c9a84c]" />} />
              <StatMiniCard label="Compliance Standard" value="GHOST_VAULT" icon={<Shield className="text-[#c9a84c]" />} />
            </div>

            {/* Protocols Table */}
            <Card className="glass-navy border-white/5 shadow-imperial rounded-3xl overflow-hidden">
              <CardHeader className="p-8 border-b border-white/5 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-black text-gradient-gold tracking-tighter">Protocol Inventory</CardTitle>
                  <CardDescription className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-2">Active Handoff sequences across the global edge POPs.</CardDescription>
                </div>
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-[#c9a84c] transition-colors" />
                  <Input 
                    placeholder="Filter protocols..." 
                    className="pl-10 bg-black/40 border-white/5 focus-visible:ring-[#c9a84c]/50 rounded-xl h-11 w-72 text-[11px] font-bold tracking-widest uppercase"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-white/[0.02]">
                    <TableRow className="border-white/5 hover:bg-transparent h-14">
                      <TableHead className="text-[10px] uppercase tracking-[0.3em] font-black text-zinc-500 pl-8">Protocol Slug</TableHead>
                      <TableHead className="text-[10px] uppercase tracking-[0.3em] font-black text-zinc-500">Authority Destination</TableHead>
                      <TableHead className="text-[10px] uppercase tracking-[0.3em] font-black text-zinc-500 text-center">Velocity</TableHead>
                      <TableHead className="text-[10px] uppercase tracking-[0.3em] font-black text-zinc-500">Established</TableHead>
                      <TableHead className="text-right pr-8"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i} className="border-white/5 h-20">
                          <TableCell className="pl-8"><Skeleton className="h-4 w-24 bg-white/5 rounded-full" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-48 bg-white/5 rounded-full" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-12 mx-auto bg-white/5 rounded-full" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-20 bg-white/5 rounded-full" /></TableCell>
                          <TableCell className="pr-8"><Skeleton className="h-10 w-10 ml-auto bg-white/5 rounded-xl" /></TableCell>
                        </TableRow>
                      ))
                    ) : filteredLinks.length > 0 ? filteredLinks.map((link) => (
                      <TableRow key={link.id} className="border-white/5 group hover:bg-white/[0.02] transition-colors h-20">
                        <TableCell className="pl-8 font-black text-zinc-200 text-sm tracking-tighter">
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#c9a84c] shadow-[0_0_8px_#c9a84c]" />
                            <span className="text-zinc-600">PROTO://</span>{link.short_code}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate text-[11px] font-bold text-zinc-500 group-hover:text-zinc-400 transition-colors uppercase tracking-tight">
                            {link.original_url}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className="bg-[#c9a84c]/5 text-[#c9a84c] border-[#c9a84c]/20 font-mono text-[11px] px-3 font-black">
                            {link.clicks || 0}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">
                          {new Date(link.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </TableCell>
                        <TableCell className="text-right pr-8">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="h-10 w-10 hover:text-[#c9a84c] hover:bg-[#c9a84c]/10 rounded-xl" onClick={() => copyToClipboard(`https://${window.location.host}/${link.short_code}`)}>
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-10 w-10 hover:text-[#c9a84c] hover:bg-[#c9a84c]/10 rounded-xl" asChild>
                              <a href={link.original_url} target="_blank" rel="noopener noreferrer"><ExternalLink className="w-4 h-4" /></a>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={5} className="h-60 text-center">
                          <div className="flex flex-col items-center justify-center space-y-6 opacity-30 grayscale hover:grayscale-0 transition-all duration-1000">
                            <Database className="w-16 h-16 text-zinc-600" />
                            <div className="space-y-2">
                              <p className="text-lg font-black text-zinc-500 tracking-tighter uppercase">Nexus Inventory Empty</p>
                              <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-600 font-bold">Initialize your first trust handoff above.</p>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="matrix" className="m-0 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Trust Tree Integration */}
            <TrustTreeHUD 
              nodes={bridgeTokens.map(t => ({ 
                id: t.token, 
                name: t.name, 
                status: t.expiresAt && new Date(t.expiresAt) < new Date() ? 'REVOKED' : 'ACTIVE',
                depth: 1 
              }))} 
              onRevoke={(id) => {
                const token = bridgeTokens.find(t => t.token === id);
                if (token) handleRevokeBridge(token.id);
              }}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Token List Expanded */}
              <div className="lg:col-span-2 space-y-8">
                <Card className="glass-navy border-white/5 rounded-3xl shadow-imperial">
                  <CardHeader className="p-8 border-b border-white/5">
                    <CardTitle className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em]">Sovereign Key Provisioning</CardTitle>
                  </CardHeader>
                  <CardContent className="p-8">
                    <div className="space-y-4">
                      {bridgeTokens.length > 0 ? bridgeTokens.map(token => (
                        <div key={token.id} className="flex items-center justify-between p-6 rounded-2xl bg-white/[0.02] border border-white/5 group hover:border-[#c9a84c]/30 hover:bg-white/[0.04] transition-all">
                          <div className="flex items-center gap-6">
                            <div className="w-14 h-14 rounded-2xl bg-black/40 flex items-center justify-center border border-white/5 group-hover:border-[#c9a84c]/20 transition-all shadow-inner">
                              <Key className="w-6 h-6 text-zinc-600 group-hover:text-[#c9a84c] transition-colors" />
                            </div>
                            <div>
                              <p className="text-sm font-black text-zinc-200 tracking-tight">{token.name}</p>
                              <div className="flex items-center gap-2 mt-1.5">
                                <span className="text-[10px] font-mono text-zinc-600 bg-black/40 px-2 py-0.5 rounded border border-white/5">{token.token.substring(0, 16)}••••</span>
                                <Badge className="text-[8px] font-black bg-[#c9a84c]/10 text-[#c9a84c] border-[#c9a84c]/20 uppercase">Layer_1</Badge>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" className="h-10 w-10 text-zinc-600 hover:text-[#c9a84c] hover:bg-white/5 rounded-xl transition-all" onClick={() => copyToClipboard(token.token, "Key")}>
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-10 w-10 text-zinc-600 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all" onClick={() => handleRevokeBridge(token.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      )) : (
                        <div className="py-20 text-center space-y-6 opacity-30 grayscale">
                          <Lock className="w-12 h-12 text-zinc-700 mx-auto" />
                          <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em]">No active gateway sequences</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Protocol Logs */}
              <Card className="glass-navy border-white/5 rounded-3xl shadow-imperial h-fit">
                <CardHeader className="p-8 border-b border-white/5">
                  <CardTitle className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em]">Protocol Handoff Audit</CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="space-y-6">
                    <LogEntry time="02:22:15" action="SENTINEL_RESOLVE" target="PROTO://vault-sync" status="SUCCESS" />
                    <LogEntry time="02:18:42" action="TRUST_VERIFY" target="KEY://matrix-alpha" status="VERIFIED" />
                    <LogEntry time="01:54:10" action="GHOST_HASH_GEN" target="IP://anonymous" status="DECOUPLED" />
                    <LogEntry time="01:12:05" action="HANDSHAKE_INIT" target="USER://admin-1" status="PENDING" />
                    <div className="flex items-center justify-center pt-4">
                      <Button variant="link" className="text-[9px] font-black text-[#c9a84c] uppercase tracking-[0.4em] hover:no-underline group">
                        Enter Audit Enclave <ExternalLink className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

        </main>
      </div>

      {/* MODALS */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="glass-navy border-white/10 bg-[#0d1221]/95 text-zinc-200 rounded-3xl shadow-2xl p-8 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-3xl font-black text-gradient-gold tracking-tighter">Establish MRK Sequence</DialogTitle>
            <p className="text-[10px] text-zinc-500 uppercase tracking-[0.3em] font-bold mt-3 leading-relaxed">Map an external destination authority to a sovereign MRK protocol slug.</p>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-8 py-6">
            <div className="space-y-4">
              <Label className="text-[10px] text-zinc-500 uppercase tracking-[0.4em] font-black">Destination Authority</Label>
              <div className="relative group">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-700 group-focus-within:text-[#c9a84c] transition-colors" />
                <Input 
                  placeholder="https://nexus.authority.com/payload" 
                  className="pl-12 bg-black/60 border-white/5 focus-visible:ring-[#c9a84c]/30 rounded-2xl h-14 text-sm font-bold placeholder:text-zinc-800"
                  value={formData.url}
                  onChange={(e) => setFormData({...formData, url: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-4">
              <Label className="text-[10px] text-zinc-500 uppercase tracking-[0.4em] font-black">Protocol Slug</Label>
              <div className="flex gap-3">
                <div className="relative flex-1 group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700 font-black group-focus-within:text-[#c9a84c] transition-colors tracking-tighter">PROTO://</div>
                  <Input 
                    placeholder="custom-sequence" 
                    className="pl-20 bg-black/60 border-white/5 focus-visible:ring-[#c9a84c]/30 rounded-2xl h-14 text-sm font-black tracking-tight"
                    value={formData.slug}
                    onChange={(e) => setFormData({...formData, slug: e.target.value})}
                  />
                </div>
                <Button type="button" onClick={generateMagicCode} className="h-14 w-14 bg-white/5 border border-white/10 hover:bg-white/10 rounded-2xl transition-all shadow-inner group" title="Cryptographic Generator">
                  <Wand2 className="w-6 h-6 text-[#c9a84c] group-hover:rotate-45 transition-transform" />
                </Button>
              </div>
            </div>
            <DialogFooter className="pt-4">
              <Button type="submit" disabled={isSubmitting} className="w-full bg-gradient-to-r from-[#c9a84c] to-[#a68a3d] text-[#0a0e1a] hover:from-[#d4b44e] hover:to-[#c9a84c] shadow-imperial font-black rounded-2xl h-14 uppercase tracking-[0.2em]">
                {isSubmitting ? <Activity className="w-6 h-6 animate-spin" /> : "Commit to Nexus"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isBridgeModalOpen} onOpenChange={setIsBridgeModalOpen}>
        <DialogContent className="glass-navy border-white/10 bg-[#0d1221]/95 text-zinc-200 rounded-3xl shadow-2xl p-8 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-3xl font-black text-gradient-gold tracking-tighter">Provision Sovereign Key</DialogTitle>
            <p className="text-[10px] text-zinc-500 uppercase tracking-[0.3em] font-bold mt-3 leading-relaxed">Generate a cryptographic identity for Matrix-level API orchestration.</p>
          </DialogHeader>
          <form onSubmit={handleCreateBridge} className="space-y-8 py-6">
            <div className="space-y-4">
              <Label className="text-[10px] text-zinc-500 uppercase tracking-[0.4em] font-black">Key Identity Alias</Label>
              <div className="relative group">
                <Terminal className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-700 group-focus-within:text-[#c9a84c] transition-colors" />
                <Input 
                  placeholder="e.g. Nexus-Core-Sync" 
                  className="pl-12 bg-black/60 border-white/5 focus-visible:ring-[#c9a84c]/30 rounded-2xl h-14 text-sm font-bold uppercase tracking-widest placeholder:text-zinc-800"
                  value={bridgeName}
                  onChange={(e) => setBridgeName(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter className="pt-4">
              <Button type="submit" disabled={isSubmitting} className="w-full bg-gradient-to-r from-[#c9a84c] to-[#a68a3d] text-[#0a0e1a] hover:from-[#d4b44e] hover:to-[#c9a84c] shadow-imperial font-black rounded-2xl h-14 uppercase tracking-[0.2em]">
                {isSubmitting ? <Activity className="w-6 h-6 animate-spin" /> : "Authorize Matrix Entry"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <style dangerouslySetInnerHTML={{ __html: `
        .shadow-glow-gold { box-shadow: 0 0 20px rgba(201, 168, 76, 0.4); }
        .animate-spin-slow { animation: spin 12s linear infinite; }
        .animate-breathe { animation: breathe 4s ease-in-out infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes breathe { 0%, 100% { opacity: 0.5; transform: scale(1); } 50% { opacity: 0.8; transform: scale(1.05); } }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.03); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(201,168,76,0.15); }
      `}} />
    </div>
  )
}

function StatMiniCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <Card className="glass-navy border-white/5 rounded-3xl p-8 hover:border-[#c9a84c]/20 transition-all group relative overflow-hidden shadow-imperial">
      <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-1000">
        <Cpu className="w-24 h-24 text-[#c9a84c] rotate-12" />
      </div>
      <div className="flex items-center justify-between mb-4 relative z-10">
        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">{label}</span>
        <div className="p-3 bg-white/5 rounded-xl group-hover:bg-[#c9a84c]/10 transition-colors shadow-inner">{icon}</div>
      </div>
      <p className="text-3xl font-black text-zinc-100 tracking-tighter relative z-10">{value}</p>
    </Card>
  )
}

function LogEntry({ time, action, target, status }: { time: string; action: string; target: string; status: string }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.01] border border-white/5 hover:border-white/10 transition-all group">
      <div className="flex items-center gap-4">
        <span className="text-[9px] font-mono text-zinc-600 font-bold">[{time}]</span>
        <div>
          <p className="text-[10px] font-black text-zinc-400 group-hover:text-zinc-200 transition-colors uppercase tracking-[0.2em]">{action}</p>
          <p className="text-[9px] text-zinc-600 font-bold truncate max-w-[140px] uppercase tracking-tighter">{target}</p>
        </div>
      </div>
      <Badge variant="outline" className={`text-[8px] font-black px-2.5 py-0.5 h-5 border-none shadow-sm ${status === 'SUCCESS' || status === 'VERIFIED' ? 'text-emerald-400 bg-emerald-400/5' : status === 'DECOUPLED' ? 'text-[#c9a84c] bg-[#c9a84c]/5' : 'text-zinc-500 bg-white/5'}`}>
        {status}
      </Badge>
    </div>
  )
}

      `}} />
    </div>
  )
}

function StatMiniCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <Card className="glass-navy border-white/5 rounded-2xl p-6 hover:border-[#c9a84c]/20 transition-all group">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">{label}</span>
        <div className="p-2 bg-white/5 rounded-lg group-hover:bg-[#c9a84c]/10 transition-colors">{icon}</div>
      </div>
      <p className="text-2xl font-black text-zinc-100 tracking-tight">{value}</p>
    </Card>
  )
}

function LogEntry({ time, action, target, status }: { time: string; action: string; target: string; status: string }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.01] border border-white/5 hover:border-white/10 transition-all group">
      <div className="flex items-center gap-3">
        <span className="text-[9px] font-mono text-zinc-600">{time}</span>
        <div>
          <p className="text-[10px] font-black text-zinc-400 group-hover:text-zinc-200 transition-colors uppercase tracking-widest">{action}</p>
          <p className="text-[9px] text-zinc-600 truncate max-w-[120px]">{target}</p>
        </div>
      </div>
      <Badge variant="outline" className={`text-[8px] font-black px-2 py-0 h-4 border-none ${status === 'SUCCESS' ? 'text-emerald-400 bg-emerald-400/5' : status === 'VERIFIED' ? 'text-[#c9a84c] bg-[#c9a84c]/5' : 'text-zinc-500 bg-white/5'}`}>
        {status}
      </Badge>
    </div>
  )
}
