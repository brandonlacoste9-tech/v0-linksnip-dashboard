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
    <div className="flex-1 flex flex-col h-full bg-[#0a0a0a] text-neutral-200 overflow-hidden relative">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-amber-600/5 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="h-20 border-b border-neutral-800/60 bg-neutral-950/50 backdrop-blur-md flex items-center justify-between px-8 shrink-0 z-10">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-white" asChild>
            <Link href="/dashboard"><ArrowLeft className="w-5 h-5" /></Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-neutral-100 to-neutral-400 bg-clip-text text-transparent">
              Sovereign Analytics
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <Button 
            variant="outline" 
            onClick={handleExportClicks}
            disabled={exporting || isDemoMode}
            className="border-neutral-800 bg-neutral-900/50 hover:bg-neutral-800 text-neutral-300 hover:text-amber-400 rounded-xl transition-all h-10 px-4"
          >
            {exporting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Download className="w-4 h-4 mr-2" />}
            Export Detailed CSV
          </Button>
          
          <div className="flex items-center space-x-2 bg-neutral-900/50 px-4 py-2 rounded-full border border-neutral-800 h-10">
            <Beaker className={`w-4 h-4 ${isDemoMode ? 'text-amber-500' : 'text-neutral-500'}`} />
            <Label htmlFor="demo-mode" className="text-xs font-semibold text-neutral-400 cursor-pointer">Demo Mode</Label>
            <Switch 
              id="demo-mode" 
              checked={isDemoMode} 
              onCheckedChange={setIsDemoMode}
              className="data-[state=checked]:bg-amber-500"
            />
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <div className={`w-2 h-2 rounded-full ${isDemoMode ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'}`} />
            <span className={`${isDemoMode ? 'text-amber-400' : 'text-emerald-400'} text-xs font-semibold uppercase tracking-wider`}>
              {isDemoMode ? 'Simulated' : 'Live'}
            </span>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8" style={{ scrollbarWidth: "thin", scrollbarColor: "#333 transparent" }}>
        <div className="max-w-6xl mx-auto space-y-8">

          {/* Top Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <StatCard icon={<MousePointerClick className="w-5 h-5" />} title="Total Clicks" value={displayData.totals.totalClicks.toLocaleString()} change="+18.3%" loading={loading && !isDemoMode} />
            <StatCard icon={<Users className="w-5 h-5" />} title="Unique Visitors" value={displayData.totals.uniqueVisitors.toLocaleString()} change="+12.1%" loading={loading && !isDemoMode} />
            <StatCard icon={<TrendingUp className="w-5 h-5" />} title="Avg CTR" value={isDemoMode ? "4.7%" : "—"} change="+2.4%" loading={loading && !isDemoMode} />
          </div>

          {/* Clicks Over 24 Hours */}
          <Card className="border border-neutral-800/60 bg-neutral-900/40 backdrop-blur-xl rounded-2xl overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-amber-500" /> {isDemoMode ? 'Simulated' : 'Real'} Clicks — Last 24 Hours
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {loading && !isDemoMode ? (
                <Skeleton className="w-full h-[280px] bg-neutral-900/50 rounded-xl" />
              ) : displayData.hourly.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={displayData.hourly}>
                    <defs>
                      <linearGradient id="amberGlow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis dataKey="hour" stroke="#52525b" tick={{ fill: "#71717a", fontSize: 11 }} tickLine={false} />
                    <YAxis stroke="#52525b" tick={{ fill: "#71717a", fontSize: 11 }} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="count" stroke="#f59e0b" strokeWidth={2} fill="url(#amberGlow)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[280px] flex flex-col items-center justify-center text-neutral-600 gap-4">
                  <Database className="w-12 h-12 opacity-20" />
                  <p className="text-sm">No real-time clicks recorded yet. Toggle Demo Mode to see visualization.</p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Weekly Bar Chart */}
            <Card className="border border-neutral-800/60 bg-neutral-900/40 backdrop-blur-xl rounded-2xl overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-amber-500" /> Weekly Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                {loading && !isDemoMode ? (
                  <Skeleton className="w-full h-[220px] bg-neutral-900/50 rounded-xl" />
                ) : displayData.weekly.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={displayData.weekly}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                      <XAxis dataKey="day" stroke="#52525b" tick={{ fill: "#71717a", fontSize: 12 }} tickLine={false} />
                      <YAxis stroke="#52525b" tick={{ fill: "#71717a", fontSize: 11 }} tickLine={false} axisLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="count" fill="#f59e0b" radius={[6, 6, 0, 0]} opacity={0.85} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[220px] flex items-center justify-center text-neutral-600 text-sm">
                    Awaiting weekly data...
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Top Referrers */}
            <Card className="border border-neutral-800/60 bg-neutral-900/40 backdrop-blur-xl rounded-2xl overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-neutral-400 uppercase tracking-wider">Top Referrers</CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="space-y-1">
                  {displayData.referrers.length > 0 ? displayData.referrers.map((r: any) => (
                    <div key={r.source} className="flex items-center justify-between py-3 px-2 rounded-lg hover:bg-neutral-800/30 transition-colors">
                      <span className="text-zinc-200 text-sm font-medium">{r.source}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-zinc-400 text-sm w-16 text-right">{r.count}</span>
                      </div>
                    </div>
                  )) : (
                    <div className="py-12 text-center text-neutral-600 text-sm italic">
                      No referral data available.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Geographic Distribution */}
          <Card className="border border-neutral-800/60 bg-neutral-900/40 backdrop-blur-xl rounded-2xl overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
                <Globe className="w-4 h-4 text-amber-500" /> Geographic Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {displayData.geo.length > 0 ? displayData.geo.map((g: any) => (
                  <div key={g.country} className="flex items-center justify-between py-3 px-4 rounded-lg bg-neutral-800/20 border border-neutral-800/50 hover:bg-neutral-800/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{g.flag || '🌐'}</span>
                      <span className="text-zinc-200 text-sm font-medium">{g.country}</span>
                    </div>
                    <span className="text-amber-400 text-sm font-semibold">{g.count}</span>
                  </div>
                )) : (
                  <div className="col-span-full py-12 text-center text-neutral-600 text-sm italic">
                    Waiting for international traffic...
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
    <Card className="border border-neutral-800/60 bg-neutral-900/40 backdrop-blur-xl shadow-lg rounded-2xl relative overflow-hidden group hover:border-amber-500/30 transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xs font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
          <span className="text-amber-500">{icon}</span>{title}
        </CardTitle>
        <div className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-bold border border-emerald-500/20">
          {change}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-9 w-24 bg-neutral-800" />
        ) : (
          <div className="text-3xl font-bold bg-gradient-to-r from-neutral-100 to-neutral-400 bg-clip-text text-transparent">
            {value}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
