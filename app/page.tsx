import { auth } from "@clerk/nextjs/server";
import LandingContent from "./landing-content";
import { Suspense } from "react";

async function LandingContainer() {
  const { userId } = await auth();
  return <LandingContent userId={userId} />;
}

export default function LandingPage() {
  // Wrap the landing page logic in Suspense to resolve Next.js 16.2 prerender blocking
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
      </div>
    }>
      <LandingContainer />
    </Suspense>
  );
}
