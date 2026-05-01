# LinkSnip | Global Sovereign Link Infrastructure

![LinkSnip Banner](https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&q=80)

LinkSnip is an enterprise-grade, high-ticket URL management platform designed for the "Sovereign Vault" philosophy. Unlike public link shorteners that pool user data on shared infrastructure, LinkSnip provides an **isolated, private instance** for total data ownership and security.

## 🏛️ Architecture: The Sovereign Vault

LinkSnip is built on a "Hardened Edge" stack to ensure 100% data sovereignty:

- **Database**: Dedicated **Neon PostgreSQL** instances provide physical data isolation.
- **Authentication**: **Clerk** edge-middleware manages access with biometric-ready security.
- **Edge Runtime**: Next.js App Router deployed on Vercel's global edge network for sub-100ms redirects worldwide.
- **Analytics**: Real-time SQL-backed engine tracking granular time-series data without third-party cookies.

## 🛡️ Security & Compliance

LinkSnip is engineered for global enterprise standards:
- **Data Sovereignty**: You own the database; you own the links; you own the data.
- **SOC2 & GDPR Ready**: Isolated tenant architecture simplifies compliance auditing.
- **Secure Headers**: Hardened with CSP, HSTS, and X-Content-Type protections.
- **Private Access**: Dashboard routes are strictly gated by unauthorized Clerk User IDs.

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

LinkSnip is a polyglot platform supporting:
- **English** (Standard)
- **Français** (Québec & EU)
- **Español** (LatAm & Spain)
- **中文** (Mandarin Chinese)

## ⚖️ License & Ownership

LinkSnip™ is a proprietary sovereign infrastructure asset developed by **Northern Ventures / Moltbot Inc.** All rights reserved. Redistribution is strictly prohibited under the Private Instance License.

---
**Pointe-Claire, QC, Canada**
