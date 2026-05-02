import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { checkIsAdmin } from "@/app/actions";
import SettingsContent from "./settings-content";

export default async function SettingsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const isAuthorized = await checkIsAdmin();
  if (!isAuthorized) redirect("/dashboard");

  return <SettingsContent />;
}
