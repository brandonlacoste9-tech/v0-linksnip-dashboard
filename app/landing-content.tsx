"use client"

import { SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { ArrowRight, Link2, Shield, Zap, CheckCircle2, Banknote, X, Check, Globe, Coins, Lock, ChevronRight, Loader2, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
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
  const { theme, setTheme } = useTheme();

  const languages: { code: Language; name: string; flag: string }[] = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center">
              <Link2 className="w-5 h-5 text-black" />
            </div>
            <span className="font-bold text-xl tracking-wider text-amber-50">ZIPD</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <Link href="#features" className="hover:text-primary transition-colors">{t.nav.features}</Link>
            <Link href="#vault" className="hover:text-primary transition-colors">{t.nav.security}</Link>
            <Link href="#pricing" className="hover:text-primary transition-colors">{t.nav.pricing}</Link>
          </div>

          <div className="flex items-center gap-4">
            {/* Language Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary hover:bg-primary/10 gap-2 px-3 rounded-full border border-border/50">
                  <Globe className="w-4 h-4" />
                  <span className="uppercase text-xs font-bold">{language}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-popover border-border text-foreground rounded-xl min-w-[140px] shadow-2xl">
                {languages.map((lang) => (
                  <DropdownMenuItem 
                    key={lang.code}
                    className="gap-3 cursor-pointer focus:bg-primary/10 focus:text-primary py-2.5"
                    onClick={() => setLanguage(lang.code)}
                  >
                    <span className="text-lg">{lang.flag}</span>
                    <span className="font-medium">{lang.name}</span>
                    {language === lang.code && <Check className="w-4 h-4 ml-auto text-primary" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme Switcher */}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full border border-border/50 h-9 w-9 p-0"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>

            {!userId && (
              <>
                <SignInButton mode="modal" forceRedirectUrl="/dashboard">
                  <Button variant="ghost" className="text-amber-100 hover:text-amber-400 hover:bg-amber-950/50">
                    {t.nav.signIn}
                  </Button>
                </SignInButton>
                <Button variant="outline" className="hidden border-amber-700/50 text-amber-100 sm:inline-flex" asChild>
                  <Link href="/sign-up">Sign up</Link>
                </Button>
              </>
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
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#9a3412]/20 rounded-full blur-[128px] -z-10" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#431407]/20 rounded-full blur-[128px] -z-10" />
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8">
            <Shield className="w-4 h-4" />
            {t.hero.badge}
          </div>

          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight mb-8 text-transparent bg-clip-text bg-gradient-to-b from-foreground to-foreground/70 leading-[1.1]">
            {t.hero.title}<br />
            <span className="bg-gradient-to-r from-[#fb923c] via-[#ea580c] to-[#9a3412] bg-clip-text text-transparent">
              {t.hero.secondaryCta}
            </span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed font-light">
            {t.hero.subtitle}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            {!userId && (
              <SignInButton mode="modal" forceRedirectUrl="/dashboard">
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

          <TrialEngine userId={userId} />

          {/* Infrastructure Pillars */}
          <div className="mt-20 mb-20 border-y border-white/5 py-12">
            <p className="text-center text-zinc-500 font-mono text-[10px] uppercase tracking-[0.3em] mb-12">Infrastructure Pillars</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {[
                { name: "Global Edge", icon: <Globe className="w-5 h-5 text-amber-500" />, desc: "Sub-millisecond resolution" },
                { name: "Quantum Resistance", icon: <Shield className="w-5 h-5 text-amber-500" />, desc: "Post-quantum encryption" },
                { name: "Sovereign Nodes", icon: <Lock className="w-5 h-5 text-amber-500" />, desc: "Isolated compute units" },
                { name: "Real-time Matrix", icon: <Zap className="w-5 h-5 text-amber-500" />, desc: "Instant security telemetry" }
              ].map((pillar, i) => (
                <div key={i} className="text-center space-y-2">
                  <div className="flex justify-center mb-4">{pillar.icon}</div>
                  <h4 className="font-serif text-xs tracking-widest uppercase text-white">{pillar.name}</h4>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider">{pillar.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Product Showcase */}
          <div id="features" className="relative mx-auto max-w-5xl rounded-2xl border border-white/10 bg-black/40 p-2 sm:p-4 backdrop-blur-sm shadow-2xl shadow-amber-900/20 mt-20 mb-8 group">
            <div className="relative aspect-[16/9] overflow-hidden rounded-xl bg-zinc-900">
              <img 
                src="/zipd-hero.png" 
                alt="Zipd Infrastructure" 
                className="object-cover w-full h-full opacity-90 group-hover:opacity-100 transition-opacity duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            </div>
          </div>
          <p className="text-zinc-500 text-sm mb-20 tracking-wide uppercase font-bold">Link Management Infrastructure</p>

          {/* Sovereign Vault Section */}
          <div id="vault" className="mx-auto max-w-6xl mb-32">
            <h2 className="text-4xl sm:text-5xl font-extrabold text-foreground tracking-tight mb-12">{t.vault.title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="rounded-3xl border border-primary/20 bg-card/50 backdrop-blur-xl p-10 relative overflow-hidden group hover:border-primary/40 transition-all duration-500 text-left">
                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/20 border border-primary/30 flex items-center justify-center mb-8 shadow-xl group-hover:shadow-2xl transition-all duration-500">
                    <Shield className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-3xl font-bold text-foreground tracking-tight mb-6">{t.vault.securityTitle}</h3>
                  <p className="text-muted-foreground leading-relaxed text-lg">{t.vault.securityText}</p>
                </div>
              </div>
              <div className="rounded-3xl border border-primary/20 bg-card/50 backdrop-blur-xl p-10 relative overflow-hidden group hover:border-primary/40 transition-all duration-500 text-left">
                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/20 border border-primary/30 flex items-center justify-center mb-8 shadow-xl group-hover:shadow-2xl transition-all duration-500">
                    <Banknote className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-3xl font-bold text-foreground tracking-tight mb-6">{t.vault.economicsTitle}</h3>
                  <p className="text-muted-foreground leading-relaxed text-lg">{t.vault.economicsText}</p>
                </div>
              </div>
              <div className="rounded-3xl border border-primary/20 bg-card/50 backdrop-blur-xl p-10 relative overflow-hidden group hover:border-primary/40 transition-all duration-500 text-left">
                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/20 border border-primary/30 flex items-center justify-center mb-8 shadow-xl group-hover:shadow-2xl transition-all duration-500">
                    <Globe className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-3xl font-bold text-foreground tracking-tight mb-6">{(t.vault as any).isolationTitle}</h3>
                  <p className="text-muted-foreground leading-relaxed text-lg">{(t.vault as any).isolationText}</p>
                </div>
              </div>
              <div className="rounded-3xl border border-primary/20 bg-card/50 backdrop-blur-xl p-10 relative overflow-hidden group hover:border-primary/40 transition-all duration-500 text-left">
                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/20 border border-primary/30 flex items-center justify-center mb-8 shadow-xl group-hover:shadow-2xl transition-all duration-500">
                    <Zap className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-3xl font-bold text-foreground tracking-tight mb-6">{(t.vault as any).governanceTitle}</h3>
                  <p className="text-muted-foreground leading-relaxed text-lg">{(t.vault as any).governanceText}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Grid */}
        <section id="architecture" className="py-24 px-6 border-t border-border bg-muted/50">
          <div className="max-w-6xl mx-auto text-center">
            <div className="mb-16 flex flex-col items-center">
              <h2 className="text-3xl font-bold mb-4">Enterprise Architecture</h2>
              <div className="w-12 h-1 bg-primary rounded-full" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  title: "A Digital Asset",
                  description: "You are not buying a disposable tool. You are acquiring permanent digital infrastructure. Your Zipd instance is an isolated, enterprise-grade network that you own forever.",
                  icon: <Shield className="w-6 h-6" />
                },
                {
                  title: "Infrastructure Buyout",
                  description: "Enterprise platforms charge thousands per year for basic isolation. Zipd provides the same grade of infrastructure for a single, one-time investment.",
                  icon: <Coins className="w-6 h-6" />
                },
                {
                  title: "Security Governance",
                  description: "Delegate authority with precision. Manage your inner circle of administrators with cryptographic certainty and detailed telemetry.",
                  icon: <Lock className="w-6 h-6" />
                }
              ].map((feature, i) => (
                <div key={i} className="group p-8 rounded-3xl bg-zinc-900/50 border border-white/5 hover:border-amber-500/30 transition-all text-left">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 mb-6 group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                  <p className="text-zinc-500 leading-relaxed text-sm">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing / CTA */}
        <section className="py-24 px-6 border-t border-border overflow-hidden relative" id="pricing">
          <div className="absolute inset-0 bg-primary/5 blur-[120px] rounded-full translate-y-1/2" />
          <div className="max-w-4xl mx-auto relative z-10">
            <div className="p-12 rounded-[40px] bg-card/80 border border-border backdrop-blur-xl text-center">
              <h2 className="text-4xl font-bold mb-6 text-foreground">{t.pricing.title}</h2>
              <div className="flex items-baseline justify-center gap-2 mb-8">
                <span className="text-7xl font-bold tracking-tight text-foreground">{t.pricing.price}</span>
                <span className="text-muted-foreground font-medium">{t.pricing.billing}</span>
              </div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left max-w-xl mx-auto mb-12">
                {t.pricing.features.map((item: string, i: number) => (
                  <li key={i} className="flex items-center gap-3 text-muted-foreground">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                      <ChevronRight className="w-3 h-3 text-primary" />
                    </div>
                    {item}
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
        </section>
      </main>

      {/* Global Footer */}
      <footer className="border-t border-border bg-card/60 py-16 px-4 sm:px-6 lg:px-8 relative z-10 text-left">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
          <div className="space-y-6 max-w-sm">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
                <Link2 className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl tracking-wider text-foreground">ZIPD</span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">{t.hero.subtitle}</p>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-foreground font-bold uppercase tracking-widest text-xs">Infrastructure</h4>
            <div className="text-muted-foreground text-sm space-y-1">
              <p className="font-bold text-foreground/80">Zipd™ by Northern Ventures</p>
              <p className="pt-2">contact@zipd.io</p>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-foreground font-bold uppercase tracking-widest text-xs">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="hover:text-primary transition-colors cursor-pointer">
                <Link href="/privacy">Privacy Policy</Link>
              </li>
              <li className="hover:text-primary transition-colors cursor-pointer">
                <Link href="/terms">Terms of Service</Link>
              </li>
              <li className="hover:text-primary transition-colors cursor-pointer">DPA</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-border flex justify-between items-center text-[10px] uppercase font-bold tracking-widest text-muted-foreground/60">
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
