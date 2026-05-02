import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import AnalyticsContent from "./analytics-content";
import { Suspense } from "react";
import { checkIsAdmin } from "@/app/actions";

async function AnalyticsContainer() {
  const { userId } = await auth();
  if (!userId) redirect("/");

  // Use the centralized checkIsAdmin helper
  const isAuthorized = await checkIsAdmin();
  if (!isAuthorized) redirect("/dashboard");

  return <AnalyticsContent />;
}

export default function AnalyticsPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center h-full bg-[#0a0a0a]">
        <div className="text-zinc-500 animate-pulse font-mono text-sm tracking-widest uppercase">
          Synthesizing Intelligence...
        </div>
      </div>
    }>
      <AnalyticsContainer />
    </Suspense>
  );
}
