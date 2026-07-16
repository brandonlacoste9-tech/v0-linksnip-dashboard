# Add Clerk Authentication — Zipd

Clerk is already integrated in code (`ClerkProvider`, `clerkMiddleware`, Sign In buttons, `/dashboard` protection).  
You only need **API keys** from Clerk + optional admin allowlist.

## 1. Create a Clerk application

1. Go to [https://dashboard.clerk.com](https://dashboard.clerk.com)
2. **Create application** → name: `Zipd` (or LinkSnip)
3. Enable **Email** (and Google OAuth if you want)
4. Open **API Keys**

Copy:

| Key | Env var |
|-----|---------|
| Publishable key | `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` |
| Secret key | `CLERK_SECRET_KEY` |

## 2. Local `.env.local`

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# After first sign-in, paste your Clerk user id (Dashboard → Users → user_...)
AUTHORIZED_USER_IDS=user_xxxxxxxx

NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

Neon `DATABASE_URL` should already be set.

## 3. Clerk Dashboard URLs

**Paths** (Configure → Paths):

- Sign-in: `/sign-in`
- Sign-up: `/sign-up`
- After sign-in: `/dashboard`
- After sign-up: `/dashboard`

**Domains** (for local):

- Allow `http://localhost:3000`

For production (`zipd.io` or your host):

- Add production domain in Clerk
- Use `pk_live_` / `sk_live_` keys on Vercel

## 4. Run

```bash
cd C:\Users\north\v0-linksnip-dashboard
npm run dev
```

Open:

- http://localhost:3000 → **Sign in** (modal or `/sign-in`)
- http://localhost:3000/sign-up
- http://localhost:3000/dashboard (requires auth)

## 5. Admin / vault access

`AUTHORIZED_USER_IDS` = bootstrap admins (full link management beyond free trial).

Or insert into Neon:

```sql
INSERT INTO authorized_users (clerk_id, email, role)
VALUES ('user_xxx', 'you@email.com', 'admin');
```

## 6. Vercel / production

Set the same env vars in the host project. Redeploy after.

## Already in the repo

| Piece | Location |
|-------|----------|
| Provider | `app/layout.tsx` |
| Middleware protect `/dashboard` | `middleware.ts` |
| Sign-in page | `app/sign-in/[[...sign-in]]/page.tsx` |
| Sign-up page | `app/sign-up/[[...sign-up]]/page.tsx` |
| Landing CTAs | `app/landing-content.tsx` |
| Server auth helpers | `app/actions.ts` (`auth()`, `checkIsAdmin`) |
