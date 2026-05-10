import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { checkIsAdmin } from "@/app/actions";
import SettingsContent from "./settings-content";
import { Suspense } from "react";

async function SettingsContainer() {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const isAuthorized = await checkIsAdmin();
  if (!isAuthorized) redirect("/dashboard");

  return <SettingsContent />;
}

export default function SettingsPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center h-full bg-[#0a0a0a]">
        <div className="text-zinc-500 animate-pulse font-mono text-sm tracking-widest uppercase">
          Accessing Configuration...
        </div>
      </div>
    }>
      <SettingsContainer />
    </Suspense>
  );
}
