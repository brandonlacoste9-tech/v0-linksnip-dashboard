import { SignInButton, UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { ArrowRight, Link2, Shield, Zap, CheckCircle2, Banknote, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import TrialEngine from "./trial-engine";

export default async function LandingPage() {
  const { userId } = await auth();

  return (
    <div className="min-h-screen bg-black text-white selection:bg-amber-500/30">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center">
              <Link2 className="w-5 h-5 text-black" />
            </div>
            <span className="font-bold text-xl tracking-wider text-amber-50">LINKSNIP</span>
          </div>
          <div className="flex items-center gap-4">
            {!userId && (
              <SignInButton mode="modal">
                <Button variant="ghost" className="text-amber-100 hover:text-amber-400 hover:bg-amber-950/50">
                  Sign In
                </Button>
              </SignInButton>
            )}
            {userId && (
              <UserButton afterSignOutUrl="/" />
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-40 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background Glows */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-600/20 rounded-full blur-[128px] -z-10" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-900/20 rounded-full blur-[128px] -z-10" />
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-950/50 border border-amber-500/20 text-amber-400 text-sm font-medium mb-8">
            <Shield className="w-4 h-4" />
            Enterprise-Grade URL Management
          </div>

          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight mb-8 text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60">
            Control Your Links.<br />
            <span className="bg-gradient-to-r from-amber-300 via-amber-500 to-amber-700 bg-clip-text text-transparent">
              Command Your Audience.
            </span>
          </h1>

          <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
            The premium URL shortening infrastructure built for compliance, 
            performance, and unparalleled analytics. Self-hosted power, turnkey elegance.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            {!userId && (
              <SignInButton mode="modal">
                <Button size="lg" className="h-14 px-8 text-lg bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white border-0 shadow-[0_0_40px_-10px_rgba(245,158,11,0.5)] transition-all">
                  Access Dashboard
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </SignInButton>
            )}
            {userId && (
              <Button size="lg" className="h-14 px-8 text-lg bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white border-0 shadow-[0_0_40px_-10px_rgba(245,158,11,0.5)] transition-all" asChild>
                <Link href="/dashboard">
                  Access Dashboard
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            )}
            <Button size="lg" variant="outline" className="h-14 px-8 text-lg border-white/20 hover:bg-white/5" asChild>
              <a href="https://buy.stripe.com/3cI14maxDe0tfcqgxX1Fe0E" target="_blank" rel="noopener noreferrer">
                Own Your Instance - $999
              </a>
            </Button>
          </div>

          {/* ===== 1. TRY BEFORE YOU BUY ENGINE ===== */}
          <TrialEngine />

          {/* ===== 2. PRODUCT SHOWCASE ===== */}
          <div className="relative mx-auto max-w-5xl rounded-2xl border border-white/10 bg-black/40 p-2 sm:p-4 backdrop-blur-sm shadow-2xl shadow-amber-900/20 mb-8 group">
            <div className="relative aspect-[16/9] overflow-hidden rounded-xl bg-zinc-900">
              <img 
                src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&auto=format&fit=crop" 
                alt="LinkSnip Dashboard — Private Command Center" 
                className="object-cover w-full h-full opacity-80 group-hover:opacity-100 transition-opacity duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            </div>
          </div>
          <p className="text-zinc-500 text-sm mb-20 tracking-wide">Your Private Command Center. Clean. Private. Powerful.</p>

          {/* Trusted By */}
          <div className="mb-24">
            <p className="text-center text-zinc-500 text-sm font-medium uppercase tracking-widest mb-10">
              Trusted by innovative enterprises
            </p>
            <div className="flex flex-wrap justify-center items-center gap-10 sm:gap-16 opacity-60">
              <div className="flex items-center gap-2 text-2xl font-bold text-zinc-300 hover:text-white transition-colors duration-300">
                <Zap className="w-8 h-8 text-amber-500" /> Quantum
              </div>
              <div className="flex items-center gap-2 text-2xl font-bold text-zinc-300 hover:text-white transition-colors duration-300">
                <Shield className="w-8 h-8 text-amber-500" /> GuardianTech
              </div>
              <div className="flex items-center gap-2 text-2xl font-bold text-zinc-300 hover:text-white transition-colors duration-300">
                <svg className="w-8 h-8 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
                Starlight
              </div>
              <div className="flex items-center gap-2 text-2xl font-bold text-zinc-300 hover:text-white transition-colors duration-300">
                <svg className="w-8 h-8 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                Apex
              </div>
            </div>
          </div>

          {/* ===== 3. THE SOVEREIGN VAULT ===== */}
          <div className="mx-auto max-w-6xl mb-24">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left — Security */}
              <div className="rounded-3xl border border-amber-500/20 bg-black/50 backdrop-blur-xl p-10 relative overflow-hidden group hover:border-amber-500/40 transition-all duration-500 text-left">
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
                <div className="absolute -top-20 -right-20 w-56 h-56 bg-amber-500/10 rounded-full blur-[80px] group-hover:bg-amber-500/20 transition-all duration-700" />
                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-700/20 border border-amber-500/30 flex items-center justify-center mb-8 shadow-[0_0_30px_-5px_rgba(245,158,11,0.3)] group-hover:shadow-[0_0_40px_-5px_rgba(245,158,11,0.5)] transition-all duration-500">
                    <Shield className="w-8 h-8 text-amber-400" />
                  </div>
                  <h2 className="text-3xl font-bold text-white tracking-tight mb-6">The Sovereign Vault</h2>
                  <p className="text-zinc-400 leading-relaxed text-lg">
                    Your instance runs on an isolated Neon PostgreSQL database protected by Clerk&apos;s edge-middleware. Enterprise-grade security, built for SOC2 and GDPR compliance.
                  </p>
                </div>
              </div>
              {/* Right — Economics */}
              <div className="rounded-3xl border border-amber-500/20 bg-black/50 backdrop-blur-xl p-10 relative overflow-hidden group hover:border-amber-500/40 transition-all duration-500 text-left">
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
                <div className="absolute -bottom-20 -left-20 w-56 h-56 bg-amber-500/10 rounded-full blur-[80px] group-hover:bg-amber-500/20 transition-all duration-700" />
                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-700/20 border border-amber-500/30 flex items-center justify-center mb-8 shadow-[0_0_30px_-5px_rgba(245,158,11,0.3)] group-hover:shadow-[0_0_40px_-5px_rgba(245,158,11,0.5)] transition-all duration-500">
                    <Banknote className="w-8 h-8 text-amber-400" />
                  </div>
                  <h2 className="text-3xl font-bold text-white tracking-tight mb-6">Instant ROI. Zero Leases.</h2>
                  <p className="text-zinc-400 leading-relaxed text-lg">
                    Own your infrastructure for a flat $999. It pays for itself in under 90 days. You own the asset, forever.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ===== 4. RENT VS OWN COMPARISON TABLE ===== */}
          <div className="mx-auto max-w-5xl mb-24">
            <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">The Math is Undeniable.</h2>
            <p className="text-zinc-500 text-lg mb-12">See where your money actually goes.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* The Renters */}
              <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-zinc-700" />
                <h3 className="text-xl font-bold text-zinc-400 mb-2 uppercase tracking-wider">The Renters</h3>
                <p className="text-zinc-600 text-sm mb-8">Bitly / Rebrandly / Short.io</p>
                <ul className="space-y-5">
                  {[
                    "Pay $300–$500/mo for enterprise",
                    "Shared multi-tenant servers",
                    "They harvest your click data",
                    "$10,000+ burned over 2 years",
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <X className="w-5 h-5 text-red-500/70 shrink-0 mt-0.5" />
                      <span className="text-zinc-500">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* The Owners */}
              <div className="rounded-3xl border border-amber-500/30 bg-black/60 backdrop-blur-xl p-8 relative overflow-hidden shadow-[0_0_50px_-15px_rgba(245,158,11,0.2)]">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 via-amber-600 to-amber-400" />
                <h3 className="text-xl font-bold text-amber-400 mb-2 uppercase tracking-wider">The Owners</h3>
                <p className="text-amber-500/60 text-sm mb-8">LinkSnip Private Instance</p>
                <ul className="space-y-5">
                  {[
                    "One-Time $999 — own it forever",
                    "Isolated Private Vault (your DB only)",
                    "100% Data Sovereignty",
                    "Infinite Custom Domains",
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                      <span className="text-zinc-200">{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8 pt-6 border-t border-amber-500/20">
                  <Button size="lg" className="w-full h-14 text-lg bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white border-0 shadow-[0_0_30px_-5px_rgba(245,158,11,0.4)] transition-all font-semibold" asChild>
                    <a href="https://buy.stripe.com/3cI14maxDe0tfcqgxX1Fe0E" target="_blank" rel="noopener noreferrer">
                      Secure Your Instance
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* ===== 5. GLOBAL FOOTER ===== */}
      <footer className="border-t border-white/5 bg-black/60 pt-16 pb-8 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center">
                <Link2 className="w-5 h-5 text-black" />
              </div>
              <span className="font-bold text-xl tracking-wider text-amber-50">LINKSNIP</span>
            </div>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Sovereign URL management infrastructure. Built for performance, security, and total data ownership.
            </p>
            <div className="text-zinc-500 text-sm space-y-1">
              <p className="font-semibold text-zinc-300">LinkSnip™ by Northern Ventures / Moltbot Inc.</p>
              <p>Pointe-Claire, QC, Canada</p>
              <p className="pt-2 hover:text-amber-400 transition-colors"><a href="mailto:contact@linksnip.com">contact@linksnip.com</a></p>
            </div>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-6">Platform</h3>
            <ul className="space-y-3 text-sm text-zinc-400">
              <li><Link href="/features" className="hover:text-amber-400 transition-colors">Features</Link></li>
              <li><Link href="/analytics" className="hover:text-amber-400 transition-colors">Analytics</Link></li>
              <li><Link href="/domains" className="hover:text-amber-400 transition-colors">Custom Domains</Link></li>
              <li><Link href="/security" className="hover:text-amber-400 transition-colors">Security (SOC2/GDPR)</Link></li>
              <li><Link href="/pricing" className="hover:text-amber-400 transition-colors">Pricing</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-6">Company</h3>
            <ul className="space-y-3 text-sm text-zinc-400">
              <li><Link href="/about" className="hover:text-amber-400 transition-colors">About Us</Link></li>
              <li><Link href="/customers" className="hover:text-amber-400 transition-colors">Customers</Link></li>
              <li><Link href="/careers" className="hover:text-amber-400 transition-colors">Careers</Link></li>
              <li><Link href="/blog" className="hover:text-amber-400 transition-colors">Blog</Link></li>
              <li><Link href="/contact" className="hover:text-amber-400 transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-6">Legal</h3>
            <ul className="space-y-3 text-sm text-zinc-400">
              <li><Link href="/privacy" className="hover:text-amber-400 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-amber-400 transition-colors">Terms of Service</Link></li>
              <li><Link href="/dpa" className="hover:text-amber-400 transition-colors">Data Processing Agreement</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-zinc-600">
          <p>&copy; {new Date().getFullYear()} LinkSnip™ by Northern Ventures / Moltbot Inc. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="https://twitter.com/linksnip" target="_blank" rel="noreferrer" className="hover:text-amber-500 transition-colors">Twitter</Link>
            <Link href="https://linkedin.com/company/linksnip" target="_blank" rel="noreferrer" className="hover:text-amber-500 transition-colors">LinkedIn</Link>
            <Link href="https://github.com/linksnip" target="_blank" rel="noreferrer" className="hover:text-amber-500 transition-colors">GitHub</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
