"use client"

import { SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { ArrowRight, Link2, Shield, Zap, CheckCircle2, Banknote, X, Check, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import TrialEngine from "./trial-engine";
import { useI18n } from "@/lib/i18n/context";
import { Language } from "@/lib/i18n/translations";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function LandingContent({ userId }: { userId: string | null }) {
  const { t, language, setLanguage } = useI18n();

  const languages: { code: Language; name: string; flag: string }[] = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
  ];

  const currentLang = languages.find(l => l.code === language) || languages[0];

  return (
    <div className="min-h-screen bg-black text-white selection:bg-amber-500/30">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center">
              <Link2 className="w-5 h-5 text-black" />
            </div>
            <span className="font-bold text-xl tracking-wider text-amber-50">MARK PROTOCOL</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
            <Link href="#features" className="hover:text-amber-400 transition-colors">{t.nav.features}</Link>
            <Link href="#vault" className="hover:text-amber-400 transition-colors">{t.nav.security}</Link>
            <Link href="#pricing" className="hover:text-amber-400 transition-colors">{t.nav.pricing}</Link>
          </div>

          <div className="flex items-center gap-4">
            {/* Language Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-amber-400 hover:bg-amber-950/30 gap-2 px-3 rounded-full border border-white/5">
                  <Globe className="w-4 h-4" />
                  <span className="uppercase text-xs font-bold">{language}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-zinc-950 border-white/10 text-zinc-300 rounded-xl min-w-[140px]">
                {languages.map((lang) => (
                  <DropdownMenuItem 
                    key={lang.code}
                    className="gap-3 cursor-pointer focus:bg-amber-500/10 focus:text-amber-400 py-2.5"
                    onClick={() => setLanguage(lang.code)}
                  >
                    <span className="text-lg">{lang.flag}</span>
                    <span className="font-medium">{lang.name}</span>
                    {language === lang.code && <Check className="w-4 h-4 ml-auto text-amber-500" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {!userId && (
              <SignInButton mode="modal">
                <Button variant="ghost" className="text-amber-100 hover:text-amber-400 hover:bg-amber-950/50">
                  {t.nav.signIn}
                </Button>
              </SignInButton>
            )}
            {userId && (
              <div className="flex items-center gap-4">
                <Link href="/dashboard" className="text-sm font-medium text-amber-100 hover:text-amber-400 transition-colors">
                  {t.nav.dashboard}
                </Link>
                <UserButton />
              </div>
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
            {t.hero.badge}
          </div>

          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight mb-8 text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 leading-[1.1]">
            {t.hero.title}<br />
            <span className="bg-gradient-to-r from-amber-300 via-amber-500 to-amber-700 bg-clip-text text-transparent">
              {t.hero.secondaryCta}
            </span>
          </h1>

          <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
            {t.hero.subtitle}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            {!userId && (
              <SignInButton mode="modal">
                <Button size="lg" className="h-14 px-8 text-lg bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white border-0 shadow-[0_0_40px_-10px_rgba(245,158,11,0.5)] transition-all font-bold">
                  {t.hero.cta}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </SignInButton>
            )}
            {userId && (
              <Button size="lg" className="h-14 px-8 text-lg bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white border-0 shadow-[0_0_40px_-10px_rgba(245,158,11,0.5)] transition-all font-bold" asChild>
                <Link href="/dashboard">
                  {t.nav.dashboard}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            )}
            <Button size="lg" variant="outline" className="h-14 px-8 text-lg border-white/20 hover:bg-white/5 font-bold" asChild>
              <a href="https://buy.stripe.com/3cI14maxDe0tfcqgxX1Fe0E" target="_blank" rel="noopener noreferrer">
                {t.pricing.title} - {t.pricing.price}
              </a>
            </Button>
          </div>

          <TrialEngine />

          {/* Product Showcase */}
          <div id="features" className="relative mx-auto max-w-5xl rounded-2xl border border-white/10 bg-black/40 p-2 sm:p-4 backdrop-blur-sm shadow-2xl shadow-amber-900/20 mt-20 mb-8 group">
            <div className="relative aspect-[16/9] overflow-hidden rounded-xl bg-zinc-900">
              <img 
                src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&auto=format&fit=crop" 
                alt="Mark Protocol Dashboard" 
                className="object-cover w-full h-full opacity-80 group-hover:opacity-100 transition-opacity duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            </div>
          </div>
          <p className="text-zinc-500 text-sm mb-20 tracking-wide uppercase font-bold">Imperial Command Center</p>

          {/* Sovereign Vault Section */}
          <div id="vault" className="mx-auto max-w-6xl mb-32">
            <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-12">{t.vault.title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="rounded-3xl border border-amber-500/20 bg-black/50 backdrop-blur-xl p-10 relative overflow-hidden group hover:border-amber-500/40 transition-all duration-500 text-left">
                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-700/20 border border-amber-500/30 flex items-center justify-center mb-8 shadow-[0_0_30px_-5px_rgba(245,158,11,0.3)] group-hover:shadow-[0_0_40px_-5px_rgba(245,158,11,0.5)] transition-all duration-500">
                    <Shield className="w-8 h-8 text-amber-400" />
                  </div>
                  <h3 className="text-3xl font-bold text-white tracking-tight mb-6">{t.vault.securityTitle}</h3>
                  <p className="text-zinc-400 leading-relaxed text-lg">{t.vault.securityText}</p>
                </div>
              </div>
              <div className="rounded-3xl border border-amber-500/20 bg-black/50 backdrop-blur-xl p-10 relative overflow-hidden group hover:border-amber-500/40 transition-all duration-500 text-left">
                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-700/20 border border-amber-500/30 flex items-center justify-center mb-8 shadow-[0_0_30px_-5px_rgba(245,158,11,0.3)] group-hover:shadow-[0_0_40px_-5px_rgba(245,158,11,0.5)] transition-all duration-500">
                    <Banknote className="w-8 h-8 text-amber-400" />
                  </div>
                  <h3 className="text-3xl font-bold text-white tracking-tight mb-6">{t.vault.economicsTitle}</h3>
                  <p className="text-zinc-400 leading-relaxed text-lg">{t.vault.economicsText}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Section */}
          <div id="pricing" className="mx-auto max-w-3xl mb-32 relative">
            <div className="absolute inset-0 bg-amber-500/5 blur-[120px] rounded-full -z-10" />
            <div className="rounded-[40px] border border-amber-500/30 bg-black/60 backdrop-blur-2xl p-12 relative overflow-hidden shadow-[0_0_80px_-20px_rgba(245,158,11,0.3)]">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-400 via-amber-600 to-amber-400" />
              
              <div className="flex justify-between items-start mb-12 text-left">
                <div>
                  <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">{t.pricing.title}</h2>
                  <p className="text-amber-500/60 font-bold uppercase tracking-widest text-sm">{t.pricing.billing}</p>
                </div>
                <div className="text-right">
                  <p className="text-6xl font-black text-white tracking-tighter">{t.pricing.price}</p>
                </div>
              </div>

              <ul className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 text-left">
                {t.pricing.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-zinc-300 font-medium">
                    <CheckCircle2 className="w-6 h-6 text-amber-500 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button size="lg" className="w-full h-16 text-xl bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white border-0 shadow-[0_0_40px_-10px_rgba(245,158,11,0.5)] transition-all font-black uppercase tracking-wider" asChild>
                <a href="https://buy.stripe.com/3cI14maxDe0tfcqgxX1Fe0E" target="_blank" rel="noopener noreferrer">
                  {t.pricing.cta}
                  <ArrowRight className="w-6 h-6 ml-3" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Global Footer */}
      <footer className="border-t border-white/5 bg-black/60 py-16 px-4 sm:px-6 lg:px-8 relative z-10 text-left">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
          <div className="space-y-6 max-w-sm">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center">
                <Link2 className="w-5 h-5 text-black" />
              </div>
              <span className="font-bold text-xl tracking-wider text-amber-50">MARK PROTOCOL</span>
            </div>
            <p className="text-zinc-500 text-sm leading-relaxed">{t.hero.subtitle}</p>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-white font-bold uppercase tracking-widest text-xs">Infrastructure</h4>
            <div className="text-zinc-500 text-sm space-y-1">
              <p className="font-bold text-zinc-300">Mark Protocol™ by Northern Ventures / Moltbot Inc.</p>
              <p>{t.footer.location}</p>
              <p className="pt-2">contact@markprotocol.io</p>
            </div>
          </div>

          <div className="flex gap-10">
            <div className="space-y-4">
              <h4 className="text-white font-bold uppercase tracking-widest text-xs">Legal</h4>
              <ul className="space-y-2 text-sm text-zinc-500">
                <li className="hover:text-amber-400 transition-colors cursor-pointer">Privacy Policy</li>
                <li className="hover:text-amber-400 transition-colors cursor-pointer">Terms of Service</li>
                <li className="hover:text-amber-400 transition-colors cursor-pointer">DPA</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-white/5 flex justify-between items-center text-[10px] uppercase font-bold tracking-widest text-zinc-700">
          <p>{t.footer.text}</p>
          <div className="flex gap-4">
            <span>SOC2 COMPLIANT</span>
            <span>GDPR READY</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
