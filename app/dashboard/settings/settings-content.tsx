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
    <div className="flex-1 flex flex-col h-full bg-[#0a0a0a] text-neutral-200 overflow-hidden relative">
      {/* Background Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-amber-600/5 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="h-20 border-b border-neutral-800/60 bg-neutral-950/50 backdrop-blur-md flex items-center justify-between px-8 shrink-0 z-10">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-white" asChild>
            <Link href="/dashboard"><ArrowLeft className="w-5 h-5" /></Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-neutral-100 to-neutral-400 bg-clip-text text-transparent">
              Access Control
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Info Card */}
          <Card className="border border-amber-500/20 bg-amber-500/5 rounded-2xl overflow-hidden">
            <CardContent className="p-6 flex gap-4 items-start">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0 border border-amber-500/20">
                <Shield className="w-5 h-5 text-amber-500" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-amber-50">Sovereign Governance</h3>
                <p className="text-sm text-neutral-400 leading-relaxed">
                  Managing access to your LinkSnip instance. Authorized users can access the dashboard and analytics. 
                  Users defined in your <code className="text-amber-500/80">AUTHORIZED_USER_IDS</code> environment variable act as master admins and cannot be removed here.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Add User Form */}
            <Card className="lg:col-span-1 border border-neutral-800/60 bg-neutral-900/40 backdrop-blur-xl rounded-2xl shadow-xl h-fit">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-neutral-100">Authorize User</CardTitle>
                <CardDescription className="text-neutral-500 text-xs">Grant dashboard access to a new member.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddUser} className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-neutral-400 uppercase tracking-widest font-bold">Clerk User ID</Label>
                    <div className="relative group">
                      <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 group-focus-within:text-amber-500 transition-colors" />
                      <Input 
                        placeholder="user_2p..." 
                        required 
                        className="pl-10 bg-black/50 border-neutral-800 focus-visible:ring-amber-500/50 rounded-xl h-11"
                        value={formData.clerkId}
                        onChange={(e) => setFormData({...formData, clerkId: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-neutral-400 uppercase tracking-widest font-bold">Email (Optional)</Label>
                    <div className="relative group">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 group-focus-within:text-amber-500 transition-colors" />
                      <Input 
                        type="email"
                        placeholder="admin@example.com" 
                        className="pl-10 bg-black/50 border-neutral-800 focus-visible:ring-amber-500/50 rounded-xl h-11"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                      />
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-neutral-950 hover:from-amber-400 hover:to-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)] font-bold rounded-xl h-11 transition-all"
                  >
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><UserPlus className="w-4 h-4 mr-2" /> Authorize</>}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Users List */}
            <Card className="lg:col-span-2 border border-neutral-800/60 bg-neutral-900/40 backdrop-blur-xl rounded-2xl shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold text-neutral-100">Access List</CardTitle>
                  <CardDescription className="text-neutral-500 text-xs">Users with database-level authorization.</CardDescription>
                </div>
                <Badge variant="outline" className="bg-neutral-800/50 text-neutral-400 border-neutral-700">
                  {users.length} Active
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="h-16 rounded-xl bg-neutral-800/50 animate-pulse border border-neutral-800" />
                    ))
                  ) : users.length > 0 ? (
                    users.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-4 rounded-xl bg-neutral-950/40 border border-neutral-800/60 group hover:border-amber-500/30 transition-all">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center shadow-inner">
                            <ShieldCheck className="w-5 h-5 text-neutral-600 group-hover:text-amber-500 transition-colors" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-neutral-200">{user.email || 'System User'}</span>
                              <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-[10px] py-0 px-2 h-4">{user.role}</Badge>
                            </div>
                            <p className="text-[10px] text-neutral-600 font-mono mt-0.5">{user.clerkId}</p>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-neutral-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                          onClick={() => handleRemoveUser(user.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="py-12 text-center space-y-3 border-2 border-dashed border-neutral-800 rounded-2xl">
                      <AlertTriangle className="w-8 h-8 text-neutral-700 mx-auto" />
                      <p className="text-sm text-neutral-500">No database-level users authorized yet.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
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
