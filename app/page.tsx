import { auth } from "@clerk/nextjs/server";
import LandingContent from "./landing-content";

export default async function LandingPage() {
  const { userId } = await auth();

  return <LandingContent userId={userId} />;
}
