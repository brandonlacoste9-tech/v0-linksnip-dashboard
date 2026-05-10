# Zipd | Global Sovereign Link Infrastructure

![Zipd Banner](https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&q=80)

Zipd is an enterprise-grade, high-ticket URL management platform designed for the "Sovereign Vault" philosophy. Unlike public link shorteners that pool user data on shared infrastructure, Zipd provides an **isolated, private instance** for total data ownership and security.

### Core Philosophy
Zipd is built on a "Hardened Edge" stack to ensure 100% data sovereignty:
- **Private Persistence**: Every instance uses its own dedicated Neon PostgreSQL database.
- **Edge Security**: Link resolution happens at the Vercel Edge, protected by biometric AuthN.
- **Privacy First**: Stateless identity decoupling ensures you own your analytics.

### Enterprise Features
Zipd is engineered for global enterprise standards:
- **Sub-Millisecond Resolution**: Links resolve instantly across 20+ global regions.
- **Biometric Vaulting**: Protect your dashboard with hardware-backed security (WebAuthn).
- **Deep Analytics**: Track engagement with privacy-preserving telemetry.
- **Unlimited Custom Domains**: Bring your own brand to the edge.

### Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Database**: Neon (Serverless Postgres)
- **ORM**: Drizzle
- **Auth**: Clerk + WebAuthn
- **Styling**: Tailwind CSS / Vanilla CSS
- **Deployment**: Vercel Edge

### License
Zipd™ is a proprietary sovereign infrastructure asset developed by **Northern Ventures / Moltbot Inc.** All rights reserved. Redistribution is strictly prohibited under the Private Instance License.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- pnpm / npm / yarn
- A Neon PostgreSQL account
- A Clerk Authentication account

### Installation
1. Clone your private instance repository.
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Configure your Environment Variables in `.env.local`:
   ```env
   DATABASE_URL=postgres://...
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
   CLERK_SECRET_KEY=sk_...
   AUTHORIZED_USER_IDS=user_...
   ```
4. Push the database schema:
   ```bash
   pnpm exec drizzle-kit push
   ```
5. Run the development server:
   ```bash
   pnpm dev
   ```

## 🌍 Global Strategy

Zipd is a polyglot platform supporting:
- **English** (Standard)
- **Français** (Québec & EU)
- **Español** (LatAm & Spain)
- **中文** (Mandarin Chinese)

## ⚖️ License & Ownership

Zipd™ is a proprietary sovereign infrastructure asset developed by **Northern Ventures / Moltbot Inc.** All rights reserved. Redistribution is strictly prohibited under the Private Instance License.

---
**Pointe-Claire, QC, Canada**
