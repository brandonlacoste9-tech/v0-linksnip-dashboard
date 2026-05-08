"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from "recharts"
import { Activity, Globe, ArrowLeft, TrendingUp, Users, MousePointerClick, BarChart3, Database, Beaker, Download, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getAnalyticsData, getClicksExportData } from "@/app/actions"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"

// --- Mock Data (for Demo Mode) ---
const mockHourly = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i.toString().padStart(2, "0")}:00`,
  count: Math.floor(30 + Math.random() * 80 + (i > 8 && i < 20 ? 40 : 0) + (i === 14 ? 60 : 0)),
}))

const mockWeekly = [
  { day: "Mon", count: 187 }, { day: "Tue", count: 215 },
  { day: "Wed", count: 198 }, { day: "Thu", count: 247 },
  { day: "Fri", count: 312 }, { day: "Sat", count: 156 },
  { day: "Sun", count: 134 },
]

const mockReferrers = [
  { source: "LinkedIn", count: 347 },
  { source: "Twitter / X", count: 289 },
  { source: "Direct", count: 234 },
  { source: "Google Search", count: 178 },
  { source: "Newsletter", count: 112 },
  { source: "Other", count: 69 },
]

const mockGeo = [
  { country: "United States", count: 412, flag: "🇺🇸" },
  { country: "Canada", count: 298, flag: "🇨🇦" },
  { country: "United Kingdom", count: 187, flag: "🇬🇧" },
  { country: "Germany", count: 134, flag: "🇩🇪" },
  { country: "France", count: 98, flag: "🇫🇷" },
  { country: "Australia", count: 76, flag: "🇦🇺" },
]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-900 border border-amber-500/30 rounded-xl px-4 py-3 shadow-xl">
        <p className="text-zinc-400 text-xs mb-1">{label}</p>
        <p className="text-amber-400 font-bold text-lg">{payload[0].value} clicks</p>
      </div>
    )
  }
  return null
}

export default function AnalyticsContent() {
  const [isDemoMode, setIsDemoMode] = useState(false)
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const result = await getAnalyticsData()
        setData(result)
      } catch (error) {
        console.error("Failed to load analytics:", error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const handleExportClicks = async () => {
    try {
      setExporting(true)
      const clicks = await getClicksExportData()
      if (clicks.length === 0) {
        toast.error("No click data to export")
        return
      }

      const headers = ["Timestamp", "Short Code", "Destination URL", "IP Address", "Country", "Referrer", "User Agent"]
      const csvContent = [
        headers.join(","),
        ...clicks.map(c => `"${c.timestamp.toISOString()}","${c.shortCode}","${c.originalUrl}","${c.ipAddress || ''}","${c.country || ''}","${c.referrer || ''}","${c.userAgent?.replace(/"/g, '""') || ''}"`)
      ].join("\n")

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement("a")
      anchor.setAttribute("href", url)
      anchor.setAttribute("download", `linksnip-analytics-${new Date().toISOString().split('T')[0]}.csv`)
      document.body.appendChild(anchor)
      anchor.click()
      document.body.removeChild(anchor)
      toast.success("Detailed analytics exported!")
    } catch (error) {
      toast.error("Failed to export data")
    } finally {
      setExporting(false)
    }
  }

  const displayData = isDemoMode ? {
    hourly: mockHourly,
    weekly: mockWeekly,
    referrers: mockReferrers,
    geo: mockGeo,
    totals: { totalClicks: 1229, uniqueVisitors: 847, avgCTR: 4.7 }
  } : {
    hourly: data?.hourlyData || [],
    weekly: data?.weeklyData || [],
    referrers: data?.referrersData || [],
    geo: data?.geoData || [],
    totals: { 
      totalClicks: data?.totals?.totalClicks || 0, 
      uniqueVisitors: data?.totals?.uniqueVisitors || 0,
      avgCTR: 0 
    }
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0a0e1a] text-zinc-300 overflow-hidden relative">
      {/* Background Decorative Glows */}
      <div className="absolute top-[-15%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#c9a84c]/5 blur-[120px] pointer-events-none animate-breathe" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#c9a84c]/3 blur-[100px] pointer-events-none" />

      {/* Header */}
      <header className="h-20 border-b border-white/5 bg-[#0d1221]/80 backdrop-blur-xl flex items-center justify-between px-8 shrink-0 z-20 shadow-imperial">
        <div className="flex items-center gap-6">
          <Button variant="ghost" size="icon" className="text-zinc-500 hover:text-[#c9a84c] hover:bg-[#c9a84c]/10 rounded-xl transition-all" asChild>
            <Link href="/dashboard"><ArrowLeft className="w-5 h-5" /></Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gradient-gold tracking-tight">
              Sovereign Analytics
            </h1>
            <p className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-medium mt-0.5">Real-time Click Intelligence</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={handleExportClicks}
            disabled={exporting || isDemoMode}
            className="border-white/5 bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-[#c9a84c] rounded-xl transition-all h-11 px-6 shadow-imperial-hover border-gold-500/20"
          >
            {exporting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Download className="w-4 h-4 mr-2" />}
            Export Intelligence
          </Button>
          
          <div className="flex items-center space-x-3 bg-white/5 px-4 py-2 rounded-xl border border-white/5 h-11">
            <Beaker className={`w-4 h-4 ${isDemoMode ? 'text-[#c9a84c] glow-gold' : 'text-zinc-500'}`} />
            <Label htmlFor="demo-mode" className="text-xs font-semibold text-zinc-400 cursor-pointer">Simulation</Label>
            <Switch 
              id="demo-mode" 
              checked={isDemoMode} 
              onCheckedChange={setIsDemoMode}
              className="data-[state=checked]:bg-[#c9a84c]"
            />
          </div>

          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${isDemoMode ? 'bg-[#c9a84c]/10 border-[#c9a84c]/20' : 'bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]'}`}>
            <div className={`w-2 h-2 rounded-full ${isDemoMode ? 'bg-[#c9a84c] shadow-[0_0_8px_#c9a84c]' : 'bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]'}`} />
            <span className={`${isDemoMode ? 'text-[#c9a84c]' : 'text-emerald-400'} text-[10px] font-bold uppercase tracking-widest`}>
              {isDemoMode ? 'Simulated' : 'Live Stream'}
            </span>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8 scrollbar-imperial" style={{ scrollbarWidth: "thin" }}>
        <div className="max-w-7xl mx-auto space-y-8 animate-float">

          {/* Top Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <StatCard icon={<MousePointerClick className="w-5 h-5" />} title="Aggregate Clicks" value={displayData.totals.totalClicks.toLocaleString()} change="+18.3%" loading={loading && !isDemoMode} />
            <StatCard icon={<Users className="w-5 h-5" />} title="Unique Identities" value={displayData.totals.uniqueVisitors.toLocaleString()} change="+12.1%" loading={loading && !isDemoMode} />
            <StatCard icon={<TrendingUp className="w-5 h-5" />} title="Conversion Yield" value={isDemoMode ? "4.7%" : "—"} change="+2.4%" loading={loading && !isDemoMode} />
          </div>

          {/* Clicks Over 24 Hours */}
          <Card className="glass-navy border-white/5 rounded-2xl overflow-hidden shadow-imperial">
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-white/5 mb-6">
              <CardTitle className="text-xs font-bold text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#c9a84c] animate-pulse" /> Temporal Distribution — 24h Window
              </CardTitle>
              <div className="text-[10px] text-zinc-500 font-mono italic">Resolution: 60min/tick</div>
            </CardHeader>
            <CardContent className="pt-2">
              {loading && !isDemoMode ? (
                <Skeleton className="w-full h-[320px] bg-white/5 rounded-2xl" />
              ) : displayData.hourly.length > 0 ? (
                <ResponsiveContainer width="100%" height={320}>
                  <AreaChart data={displayData.hourly}>
                    <defs>
                      <linearGradient id="goldGlow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#c9a84c" stopOpacity={0.2} />
                        <stop offset="100%" stopColor="#c9a84c" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                    <XAxis dataKey="hour" stroke="#3f3f46" tick={{ fill: "#71717a", fontSize: 10, fontWeight: 500 }} tickLine={false} axisLine={false} dy={10} />
                    <YAxis stroke="#3f3f46" tick={{ fill: "#71717a", fontSize: 10, fontWeight: 500 }} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0d1221', border: '1px solid rgba(201,168,76,0.3)', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                      itemStyle={{ color: '#c9a84c', fontWeight: 'bold' }}
                      labelStyle={{ color: '#71717a', fontSize: '10px', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                    />
                    <Area type="monotone" dataKey="count" stroke="#c9a84c" strokeWidth={3} fill="url(#goldGlow)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[320px] flex flex-col items-center justify-center text-zinc-600 gap-6">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/5 shadow-inner">
                    <Database className="w-8 h-8 opacity-20" />
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-sm font-medium">Awaiting click telemetry...</p>
                    <p className="text-xs text-zinc-600 max-w-[280px]">Connect your domain or activate simulation mode to visualize flow.</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Weekly Bar Chart */}
            <Card className="lg:col-span-3 glass-navy border-white/5 rounded-2xl overflow-hidden shadow-imperial">
              <CardHeader className="pb-2 border-b border-white/5 mb-6">
                <CardTitle className="text-xs font-bold text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-[#c9a84c]" /> Weekly Velocity
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                {loading && !isDemoMode ? (
                  <Skeleton className="w-full h-[240px] bg-white/5 rounded-2xl" />
                ) : displayData.weekly.length > 0 ? (
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={displayData.weekly}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                      <XAxis dataKey="day" stroke="#3f3f46" tick={{ fill: "#71717a", fontSize: 11, fontWeight: 500 }} tickLine={false} axisLine={false} dy={10} />
                      <YAxis stroke="#3f3f46" tick={{ fill: "#71717a", fontSize: 10, fontWeight: 500 }} tickLine={false} axisLine={false} />
                      <Tooltip 
                        cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                        contentStyle={{ backgroundColor: '#0d1221', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '12px' }}
                      />
                      <Bar dataKey="count" fill="#c9a84c" radius={[4, 4, 0, 0]} opacity={0.8} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[240px] flex items-center justify-center text-zinc-600 text-sm font-medium italic">
                    Historical sequence pending...
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Top Referrers */}
            <Card className="lg:col-span-2 glass-navy border-white/5 rounded-2xl overflow-hidden shadow-imperial">
              <CardHeader className="pb-2 border-b border-white/5 mb-4">
                <CardTitle className="text-xs font-bold text-zinc-500 uppercase tracking-[0.2em]">Origin Sources</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 px-4">
                <div className="space-y-1">
                  {displayData.referrers.length > 0 ? displayData.referrers.map((r: any) => (
                    <div key={r.source} className="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-white/5 transition-all group">
                      <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#c9a84c]/40 group-hover:bg-[#c9a84c] transition-all" />
                        <span className="text-zinc-200 text-sm font-medium tracking-tight">{r.source}</span>
                      </div>
                      <span className="text-gradient-gold text-sm font-bold w-16 text-right">{r.count.toLocaleString()}</span>
                    </div>
                  )) : (
                    <div className="py-20 text-center text-zinc-600 text-xs italic">
                      Referral graph empty.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Geographic Distribution */}
          <Card className="glass-navy border-white/5 rounded-2xl overflow-hidden shadow-imperial">
            <CardHeader className="pb-2 border-b border-white/5 mb-6">
              <CardTitle className="text-xs font-bold text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#c9a84c] animate-float" /> Global Footprint
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayData.geo.length > 0 ? displayData.geo.map((g: any) => (
                  <div key={g.country} className="flex items-center justify-between py-4 px-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-[#c9a84c]/30 hover:bg-white/[0.04] transition-all group shadow-sm">
                    <div className="flex items-center gap-4">
                      <span className="text-2xl filter drop-shadow-[0_0_8px_rgba(255,255,255,0.2)] group-hover:scale-110 transition-transform">{g.flag || '🌐'}</span>
                      <span className="text-zinc-300 text-sm font-bold tracking-tight">{g.country}</span>
                    </div>
                    <span className="text-gradient-gold text-lg font-black">{g.count}</span>
                  </div>
                )) : (
                  <div className="col-span-full py-16 text-center text-zinc-600 text-sm font-medium italic">
                    Waiting for international signals...
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, title, value, change, loading }: { icon: React.ReactNode; title: string; value: string; change: string; loading?: boolean }) {
  return (
    <Card className="glass-navy border-white/5 shadow-imperial rounded-2xl relative overflow-hidden group hover:border-[#c9a84c]/40 transition-all duration-500 hover:shadow-imperial-hover">
      {/* Decorative corner accent */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#c9a84c]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-2 transition-colors group-hover:text-zinc-400">
          <span className="text-[#c9a84c] group-hover:scale-110 transition-transform duration-500">{icon}</span>{title}
        </CardTitle>
        <div className="text-[10px] bg-[#34d399]/10 text-[#34d399] px-2.5 py-1 rounded-full font-black border border-[#34d399]/20 shadow-[0_0_10px_rgba(52,211,153,0.1)]">
          {change}
        </div>
      </CardHeader>
      <CardContent className="pb-6">
        {loading ? (
          <Skeleton className="h-10 w-24 bg-white/5 rounded-lg" />
        ) : (
          <div className="text-4xl font-black text-gradient-gold tracking-tight">
            {value}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

