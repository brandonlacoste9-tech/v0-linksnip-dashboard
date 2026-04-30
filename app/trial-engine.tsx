"use client"

import { useState, useEffect } from "react"
import { Link2, Wand2, ArrowRight, Lock, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

export default function TrialEngine() {
  const [url, setUrl] = useState("")
  const [code, setCode] = useState("")
  const [trialCount, setTrialCount] = useState(0)
  const [showGate, setShowGate] = useState(false)
  const [results, setResults] = useState<{ url: string; code: string }[]>([])

  useEffect(() => {
    const stored = localStorage.getItem("linksnip_trial_count")
    if (stored) setTrialCount(parseInt(stored, 10))
  }, [])

  const generateCode = () => {
    const chars = "abcdefghjkmnpqrstuvwxyz23456789"
    const c = Array.from({ length: 6 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join("")
    setCode(c)
  }

  const handleShorten = () => {
    if (!url) { toast.error("Enter a URL"); return }

    if (trialCount >= 3) {
      setShowGate(true)
      return
    }

    const finalCode = code || Array.from({ length: 6 }, () => "abcdefghjkmnpqrstuvwxyz23456789".charAt(Math.floor(Math.random() * 30))).join("")
    const newCount = trialCount + 1
    setTrialCount(newCount)
    localStorage.setItem("linksnip_trial_count", newCount.toString())
    setResults(prev => [{ url, code: finalCode }, ...prev])
    setUrl("")
    setCode("")
    toast.success(`Link shortened! (${newCount}/3 free trial links used)`)

    if (newCount >= 3) {
      setTimeout(() => setShowGate(true), 1500)
    }
  }

  return (
    <>
      {/* Trial Shortener */}
      <div className="mx-auto max-w-2xl mb-8">
        <div className="rounded-2xl border border-white/10 bg-zinc-900/60 backdrop-blur-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Link2 className="w-5 h-5 text-amber-500" />
            <span className="text-sm font-medium text-amber-400">Try It Free — {3 - trialCount} links remaining</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="https://your-long-url.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1 bg-black/50 border-white/10 text-white placeholder:text-zinc-600 rounded-xl h-12"
            />
            <div className="flex gap-2">
              <Input
                placeholder="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-28 bg-black/50 border-white/10 text-white placeholder:text-zinc-600 rounded-xl h-12 font-mono text-sm"
              />
              <Button type="button" variant="outline" className="h-12 w-12 p-0 border-white/10 bg-black/50 hover:bg-amber-950/50 hover:text-amber-400 rounded-xl shrink-0" onClick={generateCode}>
                <Wand2 className="w-4 h-4" />
              </Button>
            </div>
            <Button onClick={handleShorten} className="h-12 px-6 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-semibold hover:from-amber-400 hover:to-amber-500 rounded-xl shrink-0 shadow-[0_0_20px_-5px_rgba(245,158,11,0.4)]">
              Shorten
            </Button>
          </div>

          {results.length > 0 && (
            <div className="mt-4 space-y-2">
              {results.map((r, i) => (
                <div key={i} className="flex items-center justify-between bg-black/40 border border-white/5 rounded-lg px-4 py-2.5">
                  <span className="text-zinc-400 text-sm truncate max-w-[200px]">{r.url}</span>
                  <code className="text-amber-400 text-sm font-mono bg-amber-500/10 px-3 py-1 rounded border border-amber-500/20">
                    linksnip.io/{r.code}
                  </code>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Ownership Gate Modal */}
      {showGate && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative max-w-lg w-full bg-zinc-950 border border-amber-500/30 rounded-3xl p-10 shadow-[0_0_80px_-20px_rgba(245,158,11,0.3)] text-center">
            <button onClick={() => setShowGate(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
            <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-700/20 border border-amber-500/30 flex items-center justify-center mb-6 shadow-[0_0_30px_-5px_rgba(245,158,11,0.4)]">
              <Lock className="w-8 h-8 text-amber-400" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Move Beyond Public Infrastructure.</h2>
            <p className="text-zinc-400 leading-relaxed mb-8">
              You&apos;ve used your 3 free public links. Stop renting shared space on crowded servers. Own your private, isolated engine forever.
            </p>
            <Button size="lg" className="w-full h-14 text-lg bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white border-0 shadow-[0_0_40px_-10px_rgba(245,158,11,0.5)] transition-all font-semibold" asChild>
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
