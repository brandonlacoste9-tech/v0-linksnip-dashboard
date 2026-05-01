"use client"

import { useState } from "react"
import Link from "next/link"
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from "recharts"
import { Activity, Globe, ArrowLeft, TrendingUp, Users, MousePointerClick, BarChart3 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

// --- Simulated Data ---
const hourlyClicks = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i.toString().padStart(2, "0")}:00`,
  clicks: Math.floor(30 + Math.random() * 80 + (i > 8 && i < 20 ? 40 : 0) + (i === 14 ? 60 : 0)),
}))

const dailyClicks = [
  { day: "Mon", clicks: 187 }, { day: "Tue", clicks: 215 },
  { day: "Wed", clicks: 198 }, { day: "Thu", clicks: 247 },
  { day: "Fri", clicks: 312 }, { day: "Sat", clicks: 156 },
  { day: "Sun", clicks: 134 },
]

const referrers = [
  { source: "LinkedIn", clicks: 347, pct: 28.2 },
  { source: "Twitter / X", clicks: 289, pct: 23.5 },
  { source: "Direct", clicks: 234, pct: 19.0 },
  { source: "Google Search", clicks: 178, pct: 14.5 },
  { source: "Newsletter", clicks: 112, pct: 9.1 },
  { source: "Other", clicks: 69, pct: 5.7 },
]

const geoData = [
  { country: "United States", clicks: 412, flag: "🇺🇸" },
  { country: "Canada", clicks: 298, flag: "🇨🇦" },
  { country: "United Kingdom", clicks: 187, flag: "🇬🇧" },
  { country: "Germany", clicks: 134, flag: "🇩🇪" },
  { country: "France", clicks: 98, flag: "🇫🇷" },
  { country: "Australia", clicks: 76, flag: "🇦🇺" },
]

const deviceData = [
  { name: "Desktop", value: 58, color: "#f59e0b" },
  { name: "Mobile", value: 35, color: "#d97706" },
  { name: "Tablet", value: 7, color: "#92400e" },
]

const totalClicks = 1229
const uniqueVisitors = 847
const avgCTR = 4.7

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
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-emerald-400 text-xs font-semibold uppercase tracking-wider">Live</span>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8" style={{ scrollbarWidth: "thin", scrollbarColor: "#333 transparent" }}>
        <div className="max-w-6xl mx-auto space-y-8">

          {/* Top Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <StatCard icon={<MousePointerClick className="w-5 h-5" />} title="Total Clicks" value={totalClicks.toLocaleString()} change="+18.3%" />
            <StatCard icon={<Users className="w-5 h-5" />} title="Unique Visitors" value={uniqueVisitors.toLocaleString()} change="+12.1%" />
            <StatCard icon={<TrendingUp className="w-5 h-5" />} title="Avg CTR" value={`${avgCTR}%`} change="+2.4%" />
          </div>

          {/* Clicks Over 24 Hours */}
          <Card className="border border-neutral-800/60 bg-neutral-900/40 backdrop-blur-xl rounded-2xl overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-amber-500" /> Clicks — Last 24 Hours
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={hourlyClicks}>
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
                  <Area type="monotone" dataKey="clicks" stroke="#f59e0b" strokeWidth={2} fill="url(#amberGlow)" />
                </AreaChart>
              </ResponsiveContainer>
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
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={dailyClicks}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis dataKey="day" stroke="#52525b" tick={{ fill: "#71717a", fontSize: 12 }} tickLine={false} />
                    <YAxis stroke="#52525b" tick={{ fill: "#71717a", fontSize: 11 }} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="clicks" fill="#f59e0b" radius={[6, 6, 0, 0]} opacity={0.85} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Device Breakdown */}
            <Card className="border border-neutral-800/60 bg-neutral-900/40 backdrop-blur-xl rounded-2xl overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-neutral-400 uppercase tracking-wider">Device Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 flex items-center gap-8">
                <ResponsiveContainer width={160} height={160}>
                  <PieChart>
                    <Pie data={deviceData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" strokeWidth={0}>
                      {deviceData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-3">
                  {deviceData.map((d) => (
                    <div key={d.name} className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                      <span className="text-zinc-300 text-sm">{d.name}</span>
                      <span className="text-zinc-500 text-sm ml-auto">{d.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Top Referrers */}
            <Card className="border border-neutral-800/60 bg-neutral-900/40 backdrop-blur-xl rounded-2xl overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-neutral-400 uppercase tracking-wider">Top Referrers</CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="space-y-1">
                  {referrers.map((r) => (
                    <div key={r.source} className="flex items-center justify-between py-3 px-2 rounded-lg hover:bg-neutral-800/30 transition-colors">
                      <span className="text-zinc-200 text-sm font-medium">{r.source}</span>
                      <div className="flex items-center gap-4">
                        <div className="w-24 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-500 rounded-full" style={{ width: `${r.pct}%` }} />
                        </div>
                        <span className="text-zinc-400 text-sm w-16 text-right">{r.clicks}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Geographic Distribution */}
            <Card className="border border-neutral-800/60 bg-neutral-900/40 backdrop-blur-xl rounded-2xl overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
                  <Globe className="w-4 h-4 text-amber-500" /> Geographic Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="space-y-1">
                  {geoData.map((g) => (
                    <div key={g.country} className="flex items-center justify-between py-3 px-2 rounded-lg hover:bg-neutral-800/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{g.flag}</span>
                        <span className="text-zinc-200 text-sm font-medium">{g.country}</span>
                      </div>
                      <span className="text-amber-400 text-sm font-semibold">{g.clicks}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, title, value, change }: { icon: React.ReactNode; title: string; value: string; change: string }) {
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
        <div className="text-3xl font-bold bg-gradient-to-r from-neutral-100 to-neutral-400 bg-clip-text text-transparent">
          {value}
        </div>
      </CardContent>
    </Card>
  )
}
