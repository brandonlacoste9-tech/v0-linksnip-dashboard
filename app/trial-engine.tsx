"use client"

import { useState, useEffect } from "react"
import { Link2, Wand2, ArrowRight, Lock, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { useI18n } from "@/lib/i18n/context"
import { createLink } from "@/app/actions"

export default function TrialEngine({ userId }: { userId: string | null }) {
  const { t } = useI18n();
  const [url, setUrl] = useState("")
  const [code, setCode] = useState("")
  const [trialCount, setTrialCount] = useState(0)
  const [showGate, setShowGate] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<{ url: string; code: string }[]>([])

  useEffect(() => {
    const stored = localStorage.getItem("zipd_trial_count")
    if (stored) setTrialCount(parseInt(stored, 10))
  }, [])

  const generateCode = () => {
    const chars = "abcdefghjkmnpqrstuvwxyz23456789"
    const c = Array.from({ length: 6 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join("")
    setCode(c)
  }

  const handleShorten = async () => {
    if (!url) { toast.error("Enter a URL"); return }

    // Members (signed in) have their own limits enforced on the server (5 links), 
    // so we bypass the strict client-side trial counter.
    if (!userId && trialCount >= 3) {
      setShowGate(true)
      return
    }

    setIsLoading(true)
    try {
      const finalCode = code || Array.from({ length: 6 }, () => "abcdefghjkmnpqrstuvwxyz23456789".charAt(Math.floor(Math.random() * 30))).join("")
      
      // Call the real server action
      const newLink = await createLink(url, finalCode)
      
      if (!userId) {
        const newCount = trialCount + 1
        setTrialCount(newCount)
        localStorage.setItem("zipd_trial_count", newCount.toString())
        toast.success(`Link Zipd! (${newCount}/3)`)
        if (newCount >= 3) {
          setTimeout(() => setShowGate(true), 1500)
        }
      } else {
        toast.success("Link Zipd! (Member Mode)")
      }

      setResults(prev => [{ url: newLink.original_url, code: newLink.short_code }, ...prev])
      setUrl("")
      setCode("")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create link")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Trial Shortener */}
      <div className="mx-auto max-w-2xl mb-8">
        <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Link2 className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-primary">
              {userId ? "Member Infrastructure — Active" : `${t.trial.title} — ${3 - trialCount} links left`}
            </span>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder={t.trial.placeholder}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1 bg-background/50 border-border text-foreground placeholder:text-muted-foreground rounded-xl h-12"
            />
            <div className="flex gap-2">
              <Input
                placeholder="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-28 bg-background/50 border-border text-foreground placeholder:text-muted-foreground rounded-xl h-12 font-mono text-sm"
              />
              <Button type="button" variant="outline" className="h-12 w-12 p-0 border-border bg-background/50 hover:bg-primary/10 hover:text-primary rounded-xl shrink-0" onClick={generateCode}>
                <Wand2 className="w-4 h-4" />
              </Button>
            </div>
            <Button 
              onClick={handleShorten} 
              disabled={isLoading}
              className="h-12 px-6 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-semibold hover:from-amber-400 hover:to-amber-500 rounded-xl shrink-0 shadow-[0_0_20px_-5px_rgba(245,158,11,0.4)] disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                t.trial.button
              )}
            </Button>
          </div>

          {results.length > 0 && (
            <div className="mt-4 space-y-2">
              {results.map((r, i) => (
                <div key={i} className="flex items-center justify-between bg-background/40 border border-border rounded-lg px-4 py-2.5">
                  <span className="text-muted-foreground text-sm truncate max-w-[200px]">{r.url}</span>
                  <a 
                    href={`/${r.code}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-primary text-sm font-mono bg-primary/10 px-3 py-1 rounded border border-primary/20 hover:bg-primary/20 transition-colors"
                  >
                    zipd.link/{r.code}
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Ownership Gate Modal */}
      {showGate && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="relative max-w-lg w-full bg-card border border-primary/30 rounded-3xl p-10 shadow-2xl text-center">
            <button onClick={() => setShowGate(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-5 h-5" />
            </button>
            <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center mb-6 shadow-xl">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">Move Beyond Public Infrastructure.</h2>
            <p className="text-muted-foreground leading-relaxed mb-8">
              You&apos;ve used your 3 free public links. Stop renting shared space on crowded servers. Own your private, isolated engine forever.
            </p>
            <Button size="lg" className="w-full h-14 text-lg bg-primary hover:bg-primary/90 text-primary-foreground border-0 shadow-lg transition-all font-semibold" asChild>
              <a href="https://buy.stripe.com/3cI14maxDe0tfcqgxX1Fe0E" target="_blank" rel="noopener noreferrer">
                Own Your Private Instance — $999
                <ArrowRight className="w-5 h-5 ml-2" />
              </a>
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
