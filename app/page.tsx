import { SignInButton, UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { ArrowRight, Link2, Shield, Zap, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

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

      {/* Hero Section - Imperial Luxury */}
      <main className="pt-40 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Abstract Background Glows */}
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

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            {/* Clerk Access Button */}
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
            
            {/* Stripe Payment CTA */}
            <Button size="lg" variant="outline" className="h-14 px-8 text-lg border-white/20 hover:bg-white/5" asChild>
              <a href="https://buy.stripe.com/3cI14maxDe0tfcqgxX1Fe0E" target="_blank" rel="noopener noreferrer">
                Own Your Instance - $1,000
              </a>
            </Button>
          </div>

          {/* Hero Image / Unsplash Placeholder */}
          <div className="relative mx-auto max-w-5xl rounded-2xl border border-white/10 bg-black/40 p-2 sm:p-4 backdrop-blur-sm shadow-2xl shadow-amber-900/20 mb-20">
            <div className="relative aspect-[16/9] overflow-hidden rounded-xl bg-zinc-900">
              <img 
                src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&auto=format&fit=crop" 
                alt="LinkSnip Dashboard Premium Analytics" 
                className="object-cover w-full h-full opacity-80 hover:opacity-100 transition-opacity duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            </div>
          </div>

          {/* Pricing / Value Block */}
          <div className="mx-auto max-w-4xl mb-20 text-left">
            <div className="rounded-3xl border border-amber-500/30 bg-black/60 backdrop-blur-xl p-8 sm:p-12 shadow-[0_0_50px_-12px_rgba(245,158,11,0.2)] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 via-amber-600 to-amber-400" />
              
              <div className="flex flex-col md:flex-row gap-12 items-center">
                <div className="flex-1 space-y-6">
                  <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                    Stop Renting Your Infrastructure.
                  </h2>
                  <p className="text-lg text-zinc-400 leading-relaxed">
                    Public shorteners charge you monthly and harvest your data. We build your private instance once, and you own it for life.
                  </p>
                  
                  <ul className="space-y-4 pt-4">
                    {[
                      "Private Neon PostgreSQL Database (Loi 25 Compliant)",
                      "Custom Domain Mapping (links.yourcompany.ca)",
                      "Unlimited Links & Clicks (Zero Monthly Fees)",
                      "Complete Data Ownership & CSV Exports"
                    ].map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <CheckCircle2 className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
                        <span className="text-zinc-200">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="w-full md:w-auto flex-shrink-0 flex flex-col items-center p-8 bg-zinc-950/80 rounded-2xl border border-white/5">
                  <div className="text-amber-500 font-medium mb-2 uppercase tracking-widest text-sm">One-Time Investment</div>
                  <div className="text-5xl font-extrabold text-white mb-6">$1,000</div>
                  <Button size="lg" className="w-full h-14 text-lg bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white border-0 shadow-[0_0_30px_-5px_rgba(245,158,11,0.4)] transition-all" asChild>
                    <a href="https://buy.stripe.com/3cI14maxDe0tfcqgxX1Fe0E" target="_blank" rel="noopener noreferrer">
                      Secure Your Instance
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
