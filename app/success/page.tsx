import Link from "next/link";
import { CheckCircle2, Link2, Shield, Clock, Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-600/15 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-900/15 rounded-full blur-[128px] pointer-events-none" />

      {/* Nav */}
      <nav className="w-full bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center">
              <Link2 className="w-5 h-5 text-black" />
            </div>
            <span className="font-bold text-xl tracking-wider text-amber-50">LINKSNIP</span>
          </Link>
        </div>
      </nav>

      <main className="flex items-center justify-center px-4 py-20 sm:py-32">
        <div className="max-w-2xl mx-auto text-center relative z-10">
          {/* Success Icon */}
          <div className="mx-auto w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-500/20 to-emerald-700/20 border border-emerald-500/30 flex items-center justify-center mb-10 shadow-[0_0_50px_-10px_rgba(16,185,129,0.4)]">
            <CheckCircle2 className="w-12 h-12 text-emerald-400" />
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
            Your Sovereign Vault is Being Provisioned.
          </h1>

          <p className="text-xl text-zinc-400 leading-relaxed mb-12 max-w-lg mx-auto">
            Thank you for choosing sovereign infrastructure. Your private LinkSnip instance is now being assembled by our engineering team.
          </p>

          {/* Status Timeline */}
          <div className="max-w-md mx-auto mb-12 space-y-0">
            <div className="flex items-start gap-4 p-5 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl rounded-b-none">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-left">
                <p className="text-white font-semibold">Payment Confirmed</p>
                <p className="text-zinc-500 text-sm">Your $999 investment has been secured.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-5 bg-amber-500/5 border border-amber-500/20 border-t-0 rounded-none">
              <Clock className="w-6 h-6 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
              <div className="text-left">
                <p className="text-white font-semibold">Infrastructure Provisioning</p>
                <p className="text-zinc-500 text-sm">Your isolated Neon PostgreSQL database and Clerk auth are being configured.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-5 bg-zinc-900/50 border border-white/5 border-t-0 rounded-2xl rounded-t-none">
              <Mail className="w-6 h-6 text-zinc-600 shrink-0 mt-0.5" />
              <div className="text-left">
                <p className="text-zinc-400 font-semibold">Secure Communication</p>
                <p className="text-zinc-600 text-sm">Expect a secure onboarding email within 2 hours to finalize your custom domain.</p>
              </div>
            </div>
          </div>

          {/* What Happens Next */}
          <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-8 mb-10 text-left max-w-md mx-auto">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-amber-500" />
              <h3 className="font-semibold text-white">What Happens Next</h3>
            </div>
            <ul className="space-y-3 text-sm text-zinc-400">
              <li className="flex items-start gap-2">
                <span className="text-amber-500 font-bold mt-px">1.</span>
                Our team provisions your isolated database and authentication layer.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 font-bold mt-px">2.</span>
                You receive a secure email to confirm your custom domain (e.g., links.yourcompany.com).
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 font-bold mt-px">3.</span>
                Your private command center goes live — fully owned, fully sovereign.
              </li>
            </ul>
          </div>

          <Button variant="ghost" className="text-zinc-400 hover:text-white" asChild>
            <Link href="/">
              ← Return to LinkSnip
            </Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
