"use client"

import * as React from "react"
import { useState, useMemo, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Plus, Copy, MoreVertical, Search, Wand2, 
  ExternalLink, TrendingUp, Download
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
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { createLink, getLinks } from "@/app/actions"
import type { Link } from "@/app/actions"

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [links, setLinks] = useState<Link[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({ url: "", slug: "" })

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
    toast.success("Magic code generated!")
  }

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
      setIsModalOpen(false)
      setFormData({ url: "", slug: "" })
      toast.success("Link created successfully!")
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create link"
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(`linksnip.io/${code}`)
    toast.success("Copied to clipboard!")
  }

  const handleExportCSV = () => {
    if (links.length === 0) {
      toast.error("No links to export")
      return
    }
    const headers = ["Destination URL", "Short Code", "Clicks", "Date Created"]
    const csvContent = [
      headers.join(","),
      ...links.map(link => `"${link.original_url}","${link.short_code}",${link.clicks},"${new Date(link.created_at).toISOString()}"`)
    ].join("\n")
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.setAttribute("href", url)
    anchor.setAttribute("download", "linksnip-links.csv")
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
    toast.success("CSV Exported successfully!")
  }

  const totalLinks = links.length
  const totalClicks = links.reduce((sum, link) => sum + link.clicks, 0)
  const avgClicks = totalLinks > 0 ? (totalClicks / totalLinks).toFixed(1) : "0"
  const activeLinks = links.length

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0a0a0a] text-neutral-200 overflow-hidden relative">
      {/* Background Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-amber-600/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/5 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="h-20 border-b border-neutral-800/60 bg-neutral-950/50 backdrop-blur-md flex items-center justify-between px-8 shrink-0 z-10">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-neutral-100 to-neutral-400 bg-clip-text text-transparent">
            Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleExportCSV} className="border-neutral-800 bg-neutral-900/50 hover:bg-neutral-800 text-neutral-300 hover:text-neutral-100 rounded-xl transition-all">
            <Download className="w-4 h-4 mr-2" /> Download CSV
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
                  Create New Link
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
                  <Label className="text-neutral-400">Short Code</Label>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="e.g. summer-promo" 
                      className="bg-neutral-900 border-neutral-800 focus-visible:ring-amber-500/50 rounded-xl"
                      value={formData.slug} onChange={(e) => setFormData({...formData, slug: e.target.value})}
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="w-10 h-10 p-0 shrink-0 border-neutral-800 bg-neutral-900 hover:bg-neutral-800 hover:text-amber-400 rounded-xl group transition-all" 
                      onClick={generateMagicCode}
                      title="Magic Generator"
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
                    {isSubmitting ? "Creating..." : "Create Link"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Total Links" value={loading ? "..." : totalLinks.toString()} />
            <StatCard title="Total Clicks" value={loading ? "..." : totalClicks.toString()} />
            <StatCard title="Avg Clicks / Link" value={loading ? "..." : avgClicks} />
            <StatCard title="Active Links" value={loading ? "..." : activeLinks.toString()} />
          </div>

          {/* Search & Data Table */}
          <Card className="border border-neutral-800/60 bg-neutral-900/40 backdrop-blur-xl shadow-2xl rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-neutral-800/60 bg-neutral-950/30">
              <div className="relative w-full max-w-sm group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 group-focus-within:text-amber-500 transition-colors" />
                <Input 
                  placeholder="Search destination or short code..." 
                  className="pl-10 bg-neutral-900 border-neutral-800 text-neutral-200 focus-visible:ring-1 focus-visible:ring-amber-500/50 placeholder:text-neutral-600 h-10 rounded-xl transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <Table>
              <TableHeader className="bg-neutral-950/50 border-b border-neutral-800">
                <TableRow className="hover:bg-transparent border-none">
                  <TableHead className="w-[45%] text-neutral-400 font-medium h-12">Destination URL</TableHead>
                  <TableHead className="text-neutral-400 font-medium">Short Code</TableHead>
                  <TableHead className="text-neutral-400 font-medium">Clicks</TableHead>
                  <TableHead className="text-neutral-400 font-medium">Date Created</TableHead>
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
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center p-1 border border-neutral-700/50 shrink-0">
                              <img 
                                src={`https://www.google.com/s2/favicons?domain=${link.original_url}&sz=64`} 
                                className="w-full h-full rounded-full object-cover"
                                alt="icon"
                                onError={(e) => (e.currentTarget.src = "https://linksnip.io/globe-fallback.png")}
                              />
                            </div>
                            <span className="truncate max-w-[280px] text-neutral-200" title={link.original_url}>
                              {link.original_url}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <code className="text-xs bg-amber-500/10 text-amber-400 px-2.5 py-1 rounded-md border border-amber-500/20 font-mono">
                              {link.short_code}
                            </code>
                            <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-all text-neutral-400 hover:text-amber-400 hover:bg-amber-500/10" onClick={() => copyToClipboard(link.short_code)} title="Copy Short Link">
                              <Copy className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-medium bg-neutral-800/50 text-neutral-300 border-neutral-700">
                            {link.clicks}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-neutral-400 text-sm">
                          {new Date(link.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 rounded-lg">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-neutral-900 border-neutral-800 text-neutral-200 rounded-xl shadow-2xl">
                              <DropdownMenuItem className="gap-2 focus:bg-neutral-800 focus:text-neutral-100 cursor-pointer rounded-lg" asChild>
                                <a href={link.original_url} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="w-4 h-4 text-neutral-400" /> Visit Original
                                </a>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </motion.tr>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-48 text-center">
                        <div className="flex flex-col items-center justify-center text-neutral-500 gap-2">
                          <Search className="w-8 h-8 opacity-20" />
                          <p>No links found.</p>
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

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #444; }
      `}} />
    </div>
  )
}

function StatCard({ title, value }: { title: string, value: string }) {
  return (
    <Card className="border border-neutral-800/60 bg-neutral-900/40 backdrop-blur-xl shadow-lg rounded-2xl relative overflow-hidden group hover:border-amber-500/30 transition-all duration-300">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <TrendingUp className="w-12 h-12 text-amber-500" />
      </div>
      <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
        <CardTitle className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">{title}</CardTitle>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="text-3xl font-bold bg-gradient-to-r from-neutral-100 to-neutral-400 bg-clip-text text-transparent">
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
        <div className="flex items-center gap-3">
          <Skeleton className="w-8 h-8 rounded-full bg-neutral-800 shrink-0" />
          <Skeleton className="h-5 w-[200px] bg-neutral-800 rounded-md" />
        </div>
      </TableCell>
      <TableCell><Skeleton className="h-6 w-[100px] bg-neutral-800 rounded-md" /></TableCell>
      <TableCell><Skeleton className="h-6 w-[40px] bg-neutral-800 rounded-md" /></TableCell>
      <TableCell><Skeleton className="h-6 w-[80px] bg-neutral-800 rounded-md" /></TableCell>
      <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto rounded-lg bg-neutral-800" /></TableCell>
    </TableRow>
  )
}
