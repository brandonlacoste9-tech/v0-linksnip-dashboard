"use client"

import * as React from "react"
import { useState, useMemo, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Plus, Copy, MoreVertical, BarChart3, Settings, 
  LayoutDashboard, Link2, Search, Menu, Wand2, 
  ExternalLink, Trash2, TrendingUp, User, Globe
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

export interface Link {
  id: string
  original_url: string
  short_code: string
  clicks: number
  created_at: string
}

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
    toast.info("Magic code generated!")
  }

  // 3. Form Submission Handler - Now integrated with database
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
      toast.success("Link created successfully!")
    } catch (error) {
      setIsSubmitting(false)
      const errorMessage = error instanceof Error ? error.message : "Failed to create link"
      toast.error(errorMessage)
    }
  }

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(`linksnip.io/${code}`)
    toast.success("Copied to clipboard!")
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-zinc-900">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex w-64 border-r bg-white flex-col">
        <div className="p-6 flex items-center gap-2">
          <div className="bg-blue-600 p-1.5 rounded-lg text-white"><Link2 className="w-6 h-6" /></div>
          <span className="font-bold text-xl tracking-tight">LinkSnip</span>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          <Button variant="ghost" className="w-full justify-start gap-3 bg-blue-50 text-blue-700 font-medium">
            <LayoutDashboard className="w-4 h-4" /> Dashboard
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 text-zinc-500"><BarChart3 className="w-4 h-4" /> Analytics</Button>
          <Button variant="ghost" className="w-full justify-start gap-3 text-zinc-500"><Settings className="w-4 h-4" /> Settings</Button>
        </nav>
        <div className="p-4 border-t"><div className="flex items-center gap-3 p-3 border rounded-xl bg-white shadow-sm"><div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center"><User className="w-4 h-4" /></div><span className="text-sm font-medium">B. Lacoste</span></div></div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b bg-white flex items-center justify-between px-8">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <Input 
              placeholder="Search your links..." 
              className="pl-10 bg-slate-50 border-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700"><Plus className="w-4 h-4 mr-2" /> Create Link</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create a Short Link</DialogTitle></DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Destination URL</Label>
                  <Input 
                    type="url" placeholder="https://..." required 
                    value={formData.url} onChange={(e) => setFormData({...formData, url: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Custom Slug (Optional)</Label>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="summer-promo" 
                      value={formData.slug} onChange={(e) => setFormData({...formData, slug: e.target.value})}
                    />
                    <Button type="button" variant="outline" size="icon" onClick={generateMagicCode}><Wand2 className="w-4 h-4 text-blue-600" /></Button>
                  </div>
                </div>
                <DialogFooter><Button type="submit" className="w-full bg-blue-600" disabled={isSubmitting}>{isSubmitting ? "Creating..." : "Create Link"}</Button></DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </header>

        {/* Dashboard Area */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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

          <Card className="border-none shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-white">
                <TableRow>
                  <TableHead className="w-[45%]">Destination</TableHead>
                  <TableHead>Short Link</TableHead>
                  <TableHead>Clicks</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="bg-white">
                <AnimatePresence mode="popLayout">
                  {loading ? (
                    Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)
                  ) : filteredLinks.length > 0 ? (
                    filteredLinks.map((link) => (
                      <motion.tr 
                        key={link.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="group border-b last:border-0"
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <img 
                              src={`https://www.google.com/s2/favicons?domain=${link.original_url}&sz=64`} 
                              className="w-5 h-5 rounded-sm"
                              alt="icon"
                              onError={(e) => (e.currentTarget.src = "https://linksnip.io/globe-fallback.png")}
                            />
                            <span className="truncate max-w-[250px]">{link.original_url}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <code className="text-xs bg-slate-100 text-blue-600 px-2 py-1 rounded">{link.short_code}</code>
                            <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => copyToClipboard(link.short_code)}>
                              <Copy className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell><Badge variant="secondary" className="font-medium">{link.clicks}</Badge></TableCell>
                        <TableCell><Badge className="bg-emerald-500">Active</Badge></TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button></DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem className="gap-2"><ExternalLink className="w-4 h-4" /> Visit</DropdownMenuItem>
                              <DropdownMenuItem className="gap-2 text-red-600"><Trash2 className="w-4 h-4" /> Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </motion.tr>
                    ))
                  ) : (
                    <TableRow><TableCell colSpan={5} className="h-64 text-center text-zinc-500">No links found matching your search.</TableCell></TableRow>
                  )}
                </AnimatePresence>
              </TableBody>
            </Table>
          </Card>
        </div>
      </main>
    </div>
  )
}

// --- Helper Components ---
function StatCard({ title, value, trend }: { title: string, value: string, trend: string }) {
  return (
    <Card className="border-none shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xs font-semibold text-zinc-500 uppercase">{title}</CardTitle>
        <div className="text-[10px] bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-bold flex items-center gap-1"><TrendingUp className="w-3 h-3" />{trend}</div>
      </CardHeader>
      <CardContent><div className="text-3xl font-bold">{value}</div></CardContent>
    </Card>
  )
}

function SkeletonRow() {
  return (
    <TableRow>
      <TableCell><Skeleton className="h-5 w-[200px]" /></TableCell>
      <TableCell><Skeleton className="h-5 w-[80px]" /></TableCell>
      <TableCell><Skeleton className="h-5 w-[40px]" /></TableCell>
      <TableCell><Skeleton className="h-5 w-[60px]" /></TableCell>
      <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto rounded-full" /></TableCell>
    </TableRow>
  )
}
