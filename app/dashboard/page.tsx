"use client"

import * as React from "react"
import { useState, useMemo, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Plus, Copy, MoreVertical, BarChart3, Settings, 
  LayoutDashboard, Link2, Search, Menu, Wand2, 
  ExternalLink, Trash2, TrendingUp, User, Globe, Download,
  Crown
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { createLink, getLinks } from "@/app/actions"
import type { Link } from "@/app/actions"

export default function LinkSnipDashboard() {
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [links, setLinks] = useState<Link[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Form State
  const [formData, setFormData] = useState({ url: "", slug: "" })

  // Fetch links from database on mount
  useEffect(() => {
    async function loadLinks() {
      try {
        setLoading(true)
        const data = await getLinks()
        setLinks(data)
      } catch (error) {
        console.error('Error loading links:', error)
        toast.error("Failed to load links")
      } finally {
        setLoading(false)
      }
    }
    loadLinks()
  }, [])

  // 1. Search Filtering
  const filteredLinks = useMemo(() => {
    return links.filter(link => 
      link.original_url.toLowerCase().includes(searchQuery.toLowerCase()) ||
      link.short_code.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [searchQuery, links])

  // 2. Magic Code Generator
  const generateMagicCode = () => {
    const chars = "abcdefghjkmnpqrstuvwxyz23456789"
    const code = Array.from({ length: 6 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join("")
    setFormData(prev => ({ ...prev, slug: code }))
    toast.info("Magic code generated!", {
      style: { background: '#333', color: '#fff', border: '1px solid #444' }
    })
  }

  // 3. Form Submission Handler
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.url) {
      toast.error("Please enter a URL")
      return
    }

    if (!formData.slug) {
      toast.error("Please generate or enter a short code")
      return
    }

    setIsSubmitting(true)
    
    try {
      const newLink = await createLink(formData.url, formData.slug)
      setLinks([newLink, ...links])
      setIsSubmitting(false)
      setIsModalOpen(false)
      setFormData({ url: "", slug: "" })
      toast.success("Link created successfully!", {
        style: { background: '#10B981', color: '#fff', border: 'none' }
      })
    } catch (error) {
      setIsSubmitting(false)
      const errorMessage = error instanceof Error ? error.message : "Failed to create link"
      toast.error(errorMessage, {
        style: { background: '#EF4444', color: '#fff', border: 'none' }
      })
    }
  }

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(`linksnip.io/${code}`)
    toast.success("Copied to clipboard!", {
      style: { background: '#333', color: '#fff', border: '1px solid #444' }
    })
  }

  const handleExportCSV = () => {
    if (links.length === 0) {
      toast.error("No links to export")
      return
    }
    
    const headers = ["ID", "Original URL", "Short Code", "Clicks", "Created At"]
    const csvContent = [
      headers.join(","),
      ...links.map(link => 
        `${link.id},"${link.original_url}","${link.short_code}",${link.clicks},"${new Date(link.created_at).toISOString()}"`
      )
    ].join("\n")
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.setAttribute("href", url)
    anchor.setAttribute("download", "linksnip-analytics.csv")
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
    toast.success("CSV Exported successfully!", {
      style: { background: '#10B981', color: '#fff', border: 'none' }
    })
  }

  return (
    <div className="flex h-screen bg-[#0a0a0a] overflow-hidden font-sans text-neutral-200 selection:bg-amber-500/30">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-amber-600/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[120px]" />
      </div>

      {/* Sidebar Desktop */}
      <aside className="hidden md:flex w-64 border-r border-neutral-800/60 bg-neutral-950/50 backdrop-blur-xl flex-col relative z-10">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-gradient-to-br from-amber-400 to-amber-600 p-2 rounded-xl text-neutral-950 shadow-[0_0_20px_rgba(251,191,36,0.3)]">
            <Crown className="w-5 h-5" />
          </div>
          <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-amber-200 to-amber-500 bg-clip-text text-transparent">
            LinkSnip
          </span>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <Button variant="ghost" className="w-full justify-start gap-3 bg-amber-500/10 text-amber-500 font-medium hover:bg-amber-500/20 hover:text-amber-400 transition-all">
            <LayoutDashboard className="w-4 h-4" /> Dashboard
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50 transition-all">
            <BarChart3 className="w-4 h-4" /> Analytics
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50 transition-all">
            <Settings className="w-4 h-4" /> Settings
          </Button>
        </nav>
        <div className="p-4 border-t border-neutral-800/60">
          <div className="flex items-center gap-3 p-3 border border-neutral-800/50 rounded-xl bg-neutral-900/50 shadow-sm transition-colors hover:bg-neutral-900">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-neutral-950 shadow-inner">
              <User className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-neutral-200">B. Lacoste</span>
              <span className="text-[10px] text-amber-500 font-medium uppercase tracking-wider">Imperial Pro</span>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative z-10">
        {/* Header */}
        <header className="h-20 border-b border-neutral-800/60 bg-neutral-950/30 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-20">
          <div className="relative w-full max-w-md group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 group-focus-within:text-amber-500 transition-colors" />
            <Input 
              placeholder="Search your links..." 
              className="pl-10 bg-neutral-900/50 border-neutral-800 text-neutral-200 focus-visible:ring-1 focus-visible:ring-amber-500/50 placeholder:text-neutral-600 h-10 rounded-xl transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={handleExportCSV} className="border-neutral-800 bg-neutral-900/50 hover:bg-neutral-800 text-neutral-300 hover:text-neutral-100 rounded-xl">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-amber-500 to-amber-600 text-neutral-950 hover:from-amber-400 hover:to-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:shadow-[0_0_25px_rgba(245,158,11,0.5)] border-none font-semibold rounded-xl transition-all">
                <Plus className="w-4 h-4 mr-2" /> Create Link
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-neutral-950 border-neutral-800 text-neutral-200 sm:rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold bg-gradient-to-r from-neutral-100 to-neutral-400 bg-clip-text text-transparent">
                  Forge New Link
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-5 pt-4">
                <div className="space-y-2">
                  <Label className="text-neutral-400">Destination URL</Label>
                  <Input 
                    type="url" placeholder="https://your-long-url.com" required 
                    className="bg-neutral-900 border-neutral-800 focus-visible:ring-amber-500/50 rounded-xl"
                    value={formData.url} onChange={(e) => setFormData({...formData, url: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-neutral-400">Custom Code (Optional)</Label>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="e.g. summer-promo" 
                      className="bg-neutral-900 border-neutral-800 focus-visible:ring-amber-500/50 rounded-xl"
                      value={formData.slug} onChange={(e) => setFormData({...formData, slug: e.target.value})}
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="w-10 h-10 p-0 shrink-0 border-neutral-800 bg-neutral-900 hover:bg-neutral-800 hover:text-amber-400 rounded-xl group" 
                      onClick={generateMagicCode}
                    >
                      <Wand2 className="w-4 h-4 text-neutral-400 group-hover:text-amber-400 transition-colors" />
                    </Button>
                  </div>
                </div>
                <DialogFooter className="pt-2">
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-neutral-950 hover:from-amber-400 hover:to-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)] font-semibold rounded-xl" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Forging..." : "Create Link"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
            </Dialog>
          </div>
        </header>

        {/* Dashboard Area */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard 
                title="Total Links" 
                value={loading ? "..." : links.length.toString()} 
                trend="+12%" 
              />
              <StatCard 
                title="Total Clicks" 
                value={loading ? "..." : links.reduce((sum, link) => sum + link.clicks, 0).toString()} 
                trend="+8.4%" 
              />
              <StatCard 
                title="Average Clicks" 
                value={loading ? "..." : links.length > 0 ? (links.reduce((sum, link) => sum + link.clicks, 0) / links.length).toFixed(0) : "0"} 
                trend="+2%" 
              />
            </div>

            <Card className="border border-neutral-800/60 bg-neutral-900/40 backdrop-blur-xl shadow-2xl rounded-2xl overflow-hidden">
              <Table>
                <TableHeader className="bg-neutral-950/50 border-b border-neutral-800">
                  <TableRow className="hover:bg-transparent border-none">
                    <TableHead className="w-[45%] text-neutral-400 font-medium h-12">Destination</TableHead>
                    <TableHead className="text-neutral-400 font-medium">Short Link</TableHead>
                    <TableHead className="text-neutral-400 font-medium">Clicks</TableHead>
                    <TableHead className="text-neutral-400 font-medium">Status</TableHead>
                    <TableHead className="text-right text-neutral-400 font-medium">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence mode="popLayout">
                    {loading ? (
                      Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
                    ) : filteredLinks.length > 0 ? (
                      filteredLinks.map((link) => (
                        <motion.tr 
                          key={link.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="group border-b border-neutral-800/50 last:border-0 hover:bg-neutral-800/30 transition-colors"
                        >
                          <TableCell className="font-medium py-4">
                            <div className="flex items-center gap-4">
                              <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center p-1 border border-neutral-700/50">
                                <img 
                                  src={`https://www.google.com/s2/favicons?domain=${link.original_url}&sz=64`} 
                                  className="w-full h-full rounded-full object-cover"
                                  alt="icon"
                                  onError={(e) => (e.currentTarget.src = "https://linksnip.io/globe-fallback.png")}
                                />
                              </div>
                              <span className="truncate max-w-[280px] text-neutral-200">{link.original_url}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <code className="text-xs bg-amber-500/10 text-amber-400 px-2.5 py-1 rounded-md border border-amber-500/20 font-mono">
                                {link.short_code}
                              </code>
                              <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-all text-neutral-400 hover:text-amber-400 hover:bg-amber-500/10" onClick={() => copyToClipboard(link.short_code)}>
                                <Copy className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-medium bg-neutral-800/50 text-neutral-300 border-neutral-700">
                              {link.clicks}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20">
                              Active
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 rounded-lg">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-neutral-900 border-neutral-800 text-neutral-200 rounded-xl shadow-2xl">
                                <DropdownMenuItem className="gap-2 focus:bg-neutral-800 focus:text-neutral-100 cursor-pointer rounded-lg">
                                  <ExternalLink className="w-4 h-4 text-neutral-400" /> Visit URL
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-neutral-800" />
                                <DropdownMenuItem className="gap-2 focus:bg-red-500/10 focus:text-red-500 text-red-400 cursor-pointer rounded-lg">
                                  <Trash2 className="w-4 h-4" /> Delete Link
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </motion.tr>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="h-64 text-center">
                          <div className="flex flex-col items-center justify-center text-neutral-500 gap-2">
                            <Search className="w-8 h-8 opacity-20" />
                            <p>No links found matching your search.</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </Card>
          </div>
        </div>
      </main>

      {/* Custom Scrollbar Styles embedded */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #333;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #444;
        }
      `}} />
    </div>
  )
}

// --- Helper Components ---
function StatCard({ title, value, trend }: { title: string, value: string, trend: string }) {
  return (
    <Card className="border border-neutral-800/60 bg-neutral-900/40 backdrop-blur-xl shadow-lg rounded-2xl relative overflow-hidden group hover:border-amber-500/30 transition-all duration-300">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <TrendingUp className="w-16 h-16 text-amber-500" />
      </div>
      <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
        <CardTitle className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">{title}</CardTitle>
        <div className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-bold flex items-center gap-1 border border-emerald-500/20">
          <TrendingUp className="w-3 h-3" />{trend}
        </div>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="text-4xl font-bold bg-gradient-to-r from-neutral-100 to-neutral-400 bg-clip-text text-transparent">
          {value}
        </div>
      </CardContent>
    </Card>
  )
}

function SkeletonRow() {
  return (
    <TableRow className="border-b border-neutral-800/50">
      <TableCell className="py-4">
        <div className="flex items-center gap-4">
          <Skeleton className="w-8 h-8 rounded-full bg-neutral-800" />
          <Skeleton className="h-5 w-[200px] bg-neutral-800 rounded-md" />
        </div>
      </TableCell>
      <TableCell><Skeleton className="h-6 w-[100px] bg-neutral-800 rounded-md" /></TableCell>
      <TableCell><Skeleton className="h-6 w-[40px] bg-neutral-800 rounded-md" /></TableCell>
      <TableCell><Skeleton className="h-6 w-[60px] bg-neutral-800 rounded-md" /></TableCell>
      <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto rounded-lg bg-neutral-800" /></TableCell>
    </TableRow>
  )
}
