import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import AnalyticsContent from "./analytics-content";

const getAuthorizedUsers = (): string[] => {
  const envUsers = process.env.AUTHORIZED_USER_IDS || "";
  return envUsers.split(",").map((id) => id.trim()).filter(Boolean);
};

export default async function AnalyticsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const authorizedUsers = getAuthorizedUsers();
  const isAuthorized = authorizedUsers.length === 0 || authorizedUsers.includes(userId);
  if (!isAuthorized) redirect("/dashboard");

  return <AnalyticsContent />;
}
