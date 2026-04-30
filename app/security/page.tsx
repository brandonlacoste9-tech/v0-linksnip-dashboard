import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Page() {
  return (
    <div className="min-h-screen bg-black text-white relative">
      {/* Navigation Bar Placeholder */}
      <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold text-xl tracking-wider text-amber-50 flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center">
              <span className="text-black font-extrabold text-xs">LS</span>
            </div>
            LINKSNIP
          </Link>
          <Button asChild variant="ghost" className="text-amber-100 hover:text-amber-400">
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </nav>

      <main className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto relative z-10">
        <div className="mb-12">
          <Button asChild variant="ghost" className="mb-6 -ml-4 text-zinc-400 hover:text-white">
            <Link href="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Link>
          </Button>
          <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60 mb-4">
            Security & Loi 25 Compliance
          </h1>
          <p className="text-xl text-amber-500/80 font-light">
            Bank-grade security for your data.
          </p>
        </div>

        <div className="space-y-12">
          
          <section className="bg-zinc-900/50 border border-white/5 rounded-2xl p-8 backdrop-blur-sm">
            <h2 className="text-2xl font-semibold text-white mb-4">Loi 25 Compliant</h2>
            <p className="text-zinc-400 leading-relaxed whitespace-pre-wrap">Fully compliant with Quebec&apos;s Law 25 regarding the protection of personal information.</p>
          </section>

          <section className="bg-zinc-900/50 border border-white/5 rounded-2xl p-8 backdrop-blur-sm">
            <h2 className="text-2xl font-semibold text-white mb-4">SOC 2 Type II</h2>
            <p className="text-zinc-400 leading-relaxed whitespace-pre-wrap">Our infrastructure is audited regularly to maintain the highest security standards.</p>
          </section>

          <section className="bg-zinc-900/50 border border-white/5 rounded-2xl p-8 backdrop-blur-sm">
            <h2 className="text-2xl font-semibold text-white mb-4">Data Sovereignty</h2>
            <p className="text-zinc-400 leading-relaxed whitespace-pre-wrap">Host your instance on infrastructure that guarantees your data stays in your jurisdiction.</p>
          </section>
        </div>

        <div className="mt-20 pt-8 border-t border-white/10 text-center">
          <Button asChild size="lg" className="bg-amber-600 hover:bg-amber-700 text-white border-0">
            <Link href="https://buy.stripe.com/3cI14maxDe0tfcqgxX1Fe0E" target="_blank">
              Secure Your Instance - $999
            </Link>
          </Button>
        </div>
      </main>
      
      {/* Background gradients */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-amber-600/10 rounded-full blur-[128px] -z-10 pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-purple-900/10 rounded-full blur-[128px] -z-10 pointer-events-none" />
    </div>
  );
}
