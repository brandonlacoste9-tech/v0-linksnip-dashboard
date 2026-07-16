import { Suspense } from "react";
import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { Link2 } from "lucide-react";

function SignInForm() {
  return (
    <SignIn
      appearance={{
        elements: {
          rootBox: "mx-auto",
          card: "bg-card border border-border shadow-2xl",
        },
      }}
      routing="path"
      path="/sign-in"
      signUpUrl="/sign-up"
      forceRedirectUrl="/dashboard"
      fallbackRedirectUrl="/dashboard"
    />
  );
}

export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <Link href="/" className="mb-8 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-amber-600">
          <Link2 className="h-5 w-5 text-black" />
        </div>
        <span className="text-xl font-bold tracking-wider text-amber-50">ZIPD</span>
      </Link>
      <Suspense fallback={<div className="text-muted-foreground text-sm">Loading sign-in…</div>}>
        <SignInForm />
      </Suspense>
    </div>
  );
}
