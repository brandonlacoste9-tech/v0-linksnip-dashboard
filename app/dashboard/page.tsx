import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Lock, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardContent from "./dashboard-content";
import { checkIsAdmin } from "@/app/actions";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  const isAuthorized = await checkIsAdmin();

  if (!isAuthorized) {
    return <PaywallScreen />;
  }

  return <DashboardContent />;
}

function PaywallScreen() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center h-full bg-[#0a0a0a] text-white relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-amber-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-900/10 blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-lg mx-auto text-center px-6 py-16">
        {/* Lock Icon */}
        <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-700/20 border border-amber-500/30 flex items-center justify-center mb-8 shadow-[0_0_40px_-5px_rgba(245,158,11,0.4)]">
          <Lock className="w-10 h-10 text-amber-400" />
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4 bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
          Private Instance Required
        </h1>

        <p className="text-zinc-400 text-lg leading-relaxed mb-8">
          The LinkSnip Dashboard is available exclusively to instance owners.
          Secure your private, sovereign URL management platform with a
          one-time investment.
        </p>

        {/* Feature highlights */}
        <div className="flex flex-col gap-3 text-left mb-10 bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
          {[
            "Isolated Neon PostgreSQL Database",
            "Unlimited Links & Click Tracking",
            "Custom Domain Mapping",
            "Full Data Ownership & CSV Exports",
          ].map((feature, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-amber-500 shrink-0" />
              <span className="text-zinc-300 text-sm">{feature}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            size="lg"
            className="h-14 px-8 text-lg bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white border-0 shadow-[0_0_40px_-10px_rgba(245,158,11,0.5)] transition-all w-full sm:w-auto"
            asChild
          >
            <a
              href="https://buy.stripe.com/3cI14maxDe0tfcqgxX1Fe0E"
              target="_blank"
              rel="noopener noreferrer"
            >
              Own Your Instance — $999
              <ArrowRight className="w-5 h-5 ml-2" />
            </a>
          </Button>
          <Button
            variant="ghost"
            className="text-zinc-400 hover:text-white"
            asChild
          >
            <Link href="/">← Back to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
