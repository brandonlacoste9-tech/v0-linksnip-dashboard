"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { 
  ArrowLeft, Shield, UserPlus, Trash2, Mail, 
  Key, ShieldCheck, AlertTriangle, Loader2 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { 
  getAuthorizedUsersList, 
  addAuthorizedUser, 
  removeAuthorizedUser 
} from "@/app/actions"
import type { AuthorizedUser } from "@/app/actions"

export default function SettingsContent() {
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [users, setUsers] = useState<AuthorizedUser[]>([])
  const [formData, setFormData] = useState({ clerkId: "", email: "" })

  useEffect(() => {
    loadUsers()
  }, [])

  async function loadUsers() {
    try {
      setLoading(true)
      const data = await getAuthorizedUsersList()
      setUsers(data)
    } catch (error) {
      console.error("Failed to load users:", error)
      toast.error("Failed to load authorized users")
    } finally {
      setLoading(false)
    }
  }

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.clerkId) {
      toast.error("Clerk User ID is required")
      return
    }

    setIsSubmitting(true)
    try {
      const newUser = await addAuthorizedUser(formData.clerkId, formData.email)
      setUsers([newUser, ...users])
      setFormData({ clerkId: "", email: "" })
      toast.success("User authorized successfully")
    } catch (error) {
      toast.error("Failed to authorize user. They might already be added.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRemoveUser = async (id: number) => {
    if (!confirm("Are you sure you want to revoke access for this user?")) return

    try {
      await removeAuthorizedUser(id)
      setUsers(users.filter(u => u.id !== id))
      toast.success("Access revoked")
    } catch (error) {
      toast.error("Failed to remove user")
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
              Access Governance
            </h1>
            <p className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-medium mt-0.5">Sovereign Identity Management</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-8 scrollbar-imperial custom-scrollbar">
        <div className="max-w-5xl mx-auto space-y-10 animate-float">
          
          {/* Info Card */}
          <Card className="glass-navy border-[#c9a84c]/20 bg-[#c9a84c]/5 rounded-2xl overflow-hidden shadow-imperial relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-[#c9a84c]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <CardContent className="p-8 flex gap-6 items-start relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-[#c9a84c]/10 flex items-center justify-center shrink-0 border border-[#c9a84c]/20 shadow-glow-gold">
                <Shield className="w-6 h-6 text-[#c9a84c]" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-[#e5c76b] tracking-tight">Sovereign Protocol Enforcement</h3>
                <p className="text-sm text-zinc-400 leading-relaxed max-w-2xl">
                  Define the inner circle of your LinkSnip instance. Authorized identities gain full administrative rights over redirection sequences and click telemetry. 
                  Master identities defined via <code className="text-[#c9a84c] bg-[#c9a84c]/10 px-1.5 py-0.5 rounded font-mono text-[11px]">AUTHORIZED_USER_IDS</code> inherit permanent sovereignty.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
            {/* Add User Form */}
            <Card className="lg:col-span-2 glass-navy border-white/5 rounded-2xl shadow-imperial h-fit sticky top-0 group hover:border-[#c9a84c]/30 transition-all duration-500">
              <CardHeader className="border-b border-white/5 mb-6">
                <CardTitle className="text-sm font-bold text-zinc-400 uppercase tracking-[0.2em]">Authorize Identity</CardTitle>
                <CardDescription className="text-zinc-500 text-xs mt-2">Grant cryptographic access to a new administrator.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddUser} className="space-y-6">
                  <div className="space-y-3">
                    <Label className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-black">Clerk Identity ID</Label>
                    <div className="relative group/input">
                      <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within/input:text-[#c9a84c] transition-colors" />
                      <Input 
                        placeholder="user_2p..." 
                        required 
                        className="pl-12 bg-black/40 border-white/5 focus-visible:ring-[#c9a84c]/50 focus-visible:border-[#c9a84c]/50 rounded-xl h-12 text-sm transition-all"
                        value={formData.clerkId}
                        onChange={(e) => setFormData({...formData, clerkId: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-black">Communication Channel</Label>
                    <div className="relative group/input">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within/input:text-[#c9a84c] transition-colors" />
                      <Input 
                        type="email"
                        placeholder="admin@sovereign.link" 
                        className="pl-12 bg-black/40 border-white/5 focus-visible:ring-[#c9a84c]/50 focus-visible:border-[#c9a84c]/50 rounded-xl h-12 text-sm transition-all"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                      />
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-[#c9a84c] to-[#a68a3d] text-[#0a0e1a] hover:from-[#d4b44e] hover:to-[#c9a84c] shadow-imperial font-black rounded-xl h-12 transition-all active:scale-[0.98] group"
                  >
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><UserPlus className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" /> Commit Authorization</>}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Users List */}
            <Card className="lg:col-span-3 glass-navy border-white/5 rounded-2xl shadow-imperial">
              <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 mb-6">
                <div>
                  <CardTitle className="text-sm font-bold text-zinc-400 uppercase tracking-[0.2em]">Authorized Circle</CardTitle>
                  <CardDescription className="text-zinc-500 text-xs mt-2">Identities with verified database sovereignty.</CardDescription>
                </div>
                <Badge variant="outline" className="bg-white/5 text-[#c9a84c] border-[#c9a84c]/30 font-black text-[10px] px-3 py-1 rounded-lg">
                  {users.length} Verified
                </Badge>
              </CardHeader>
              <CardContent className="px-6">
                <div className="space-y-4">
                  {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="h-20 rounded-2xl bg-white/[0.02] animate-pulse border border-white/5" />
                    ))
                  ) : users.length > 0 ? (
                    users.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-5 rounded-2xl bg-white/[0.02] border border-white/5 group hover:border-[#c9a84c]/30 hover:bg-white/[0.04] transition-all shadow-sm">
                        <div className="flex items-center gap-5">
                          <div className="w-12 h-12 rounded-2xl bg-[#0d1221] border border-white/5 flex items-center justify-center shadow-inner group-hover:border-[#c9a84c]/20 transition-all">
                            <ShieldCheck className="w-6 h-6 text-zinc-600 group-hover:text-[#c9a84c] transition-all duration-500" />
                          </div>
                          <div>
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-black text-zinc-200 tracking-tight">{user.email || 'System Identity'}</span>
                              <Badge className="bg-[#c9a84c]/10 text-[#c9a84c] border-[#c9a84c]/20 text-[9px] font-black uppercase tracking-widest py-0.5 px-2 rounded-md">{user.role}</Badge>
                            </div>
                            <p className="text-[10px] text-zinc-600 font-mono mt-1 opacity-70 tracking-tight">{user.clerkId}</p>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-zinc-700 hover:text-red-400 hover:bg-red-400/10 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300"
                          onClick={() => handleRemoveUser(user.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="py-20 text-center space-y-6 border-2 border-dashed border-white/5 rounded-3xl group hover:border-[#c9a84c]/20 transition-all duration-700">
                      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto border border-white/5 shadow-inner group-hover:scale-110 transition-transform duration-700">
                        <AlertTriangle className="w-8 h-8 text-zinc-800" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-bold text-zinc-500">Universal Vacuum Detected</p>
                        <p className="text-xs text-zinc-600 max-w-[200px] mx-auto">No external identities have been granted sovereignty over this instance yet.</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(201,168,76,0.2); }
      `}} />
    </div>
  )
}
