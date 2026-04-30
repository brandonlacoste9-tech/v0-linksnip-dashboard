'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Zap, Lock, BarChart3, Link2, Check, Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return <div className="w-9 h-9" />
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle dark mode"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="text-muted-foreground hover:text-foreground"
    >
      {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </Button>
  )
}

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Link2 className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-foreground">LinkSnip</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition">Features</a>
            <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition">Pricing</a>
            <a href="#faq" className="text-sm font-medium text-muted-foreground hover:text-foreground transition">FAQ</a>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/dashboard">
              <Button variant="outline" size="sm">Sign In</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className="space-y-6 text-center"
          >
            {/* Badge */}
            <motion.div variants={fadeInUp} className="inline-block">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium">
                <Zap className="w-4 h-4" />
                Introducing LinkSnip v1.0
              </span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              variants={fadeInUp}
              className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-foreground leading-tight text-balance"
            >
              Shorten Links,
              <span className="block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Track Performance
              </span>
            </motion.h1>

            {/* Subheading */}
            <motion.p
              variants={fadeInUp}
              className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            >
              Create, manage, and track short links in seconds. Get real-time analytics, custom domains, and powerful API access.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/dashboard">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  Start for Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Button size="lg" variant="outline">
                Watch Demo
              </Button>
            </motion.div>

            {/* Social Proof */}
            <motion.div variants={fadeInUp} className="pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground mb-3">Trusted by leading teams</p>
              <div className="flex items-center justify-center gap-6 flex-wrap">
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">50K+</p>
                  <p className="text-xs text-muted-foreground">Links Created</p>
                </div>
                <div className="w-px h-8 bg-border"></div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">2M+</p>
                  <p className="text-xs text-muted-foreground">Clicks Tracked</p>
                </div>
                <div className="w-px h-8 bg-border"></div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">98%</p>
                  <p className="text-xs text-muted-foreground">Uptime SLA</p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Hero Image/Mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-16"
          >
            <div className="relative rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 p-8 shadow-2xl">
                <div className="aspect-video bg-card rounded-lg shadow-inner flex items-center justify-center">

                <div className="text-center space-y-4 w-full px-8">
                  <div className="h-4 bg-muted rounded w-3/4 mx-auto"></div>
                  <div className="h-4 bg-muted rounded w-1/2 mx-auto"></div>
                  <div className="h-12 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg mt-6"></div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-card">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance"
            >
              Everything you need to shorten links
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl text-muted-foreground max-w-2xl mx-auto"
            >
              Powerful features to help you manage links and track their performance
            </motion.p>
          </div>

          {/* Features Grid */}
          <motion.div
            initial="initial"
            whileInView="animate"
            variants={staggerContainer}
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8"
          >
            {[
              {
                icon: Zap,
                title: 'Lightning Fast',
                description: 'Create short links instantly. No delays, no complications.'
              },
              {
                icon: BarChart3,
                title: 'Real-Time Analytics',
                description: 'Track every click with detailed analytics and insights.'
              },
              {
                icon: Lock,
                title: 'Secure & Reliable',
                description: 'Enterprise-grade security with 99.9% uptime guarantee.'
              },
              {
                icon: Link2,
                title: 'Custom Domains',
                description: 'Use your own domain for branded short links.'
              },
              {
                icon: Zap,
                title: 'API Access',
                description: 'Integrate with your tools using our powerful REST API.'
              },
              {
                icon: BarChart3,
                title: 'Team Collaboration',
                description: 'Invite team members and manage links together.'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="p-8 rounded-xl bg-muted/40 border border-border hover:border-primary/30 hover:bg-primary/5 transition-all"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-bold text-foreground text-center mb-16 text-balance"
          >
            How it works
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Enter URL', desc: 'Paste any long URL into LinkSnip' },
              { step: '2', title: 'Get Short Code', desc: 'Generate a custom short code instantly' },
              { step: '3', title: 'Track & Share', desc: 'Share your link and track every click' }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="relative"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.desc}</p>
                </div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-8 right-0 transform translate-x-1/2 w-12 h-1 bg-gradient-to-r from-primary to-transparent"></div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-card">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance">
              Simple, transparent pricing
            </h2>
            <p className="text-xl text-muted-foreground">
              Start free. Scale as you grow.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="grid md:grid-cols-2 gap-8"
          >
            {[
              {
                name: 'Starter',
                price: 'Free',
                desc: 'Perfect for getting started',
                features: ['100 links/month', 'Basic analytics', 'Community support']
              },
              {
                name: 'Pro',
                price: '$29',
                desc: 'For growing teams',
                features: ['Unlimited links', 'Advanced analytics', 'Custom domains', 'API access', 'Priority support'],
                highlighted: true
              }
            ].map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`p-8 rounded-xl border transition-all ${
                  plan.highlighted
                    ? 'border-primary bg-primary/5 shadow-lg'
                    : 'border-border bg-muted/40'
                }`}
              >
                <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
                <p className="text-muted-foreground mb-4">{plan.desc}</p>
                <p className="text-4xl font-bold text-foreground mb-6">
                  {plan.price}
                  {plan.price !== 'Free' && <span className="text-lg text-muted-foreground">/mo</span>}
                </p>
                <Button className="w-full mb-8" variant={plan.highlighted ? 'default' : 'outline'}>
                  Get Started
                </Button>
                <div className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-primary" />
                      <span className="text-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-bold text-foreground mb-6 text-balance"
          >
            Ready to get started?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
          >
            Join thousands of teams shortening links and tracking performance.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Link href="/dashboard">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Link2 className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-foreground">LinkSnip</span>
              </div>
              <p className="text-sm text-muted-foreground">
                The fastest way to shorten links and track performance.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-foreground mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Features</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Pricing</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">API Docs</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-foreground mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-muted-foreground hover:text-foreground">About</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Blog</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-foreground mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Privacy</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Terms</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Status</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between text-sm text-muted-foreground">
            <p>&copy; 2024 LinkSnip. All rights reserved.</p>
            <div className="flex items-center gap-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-foreground">Twitter</a>
              <a href="#" className="hover:text-foreground">GitHub</a>
              <a href="#" className="hover:text-foreground">LinkedIn</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
