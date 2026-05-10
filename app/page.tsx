import { auth } from "@clerk/nextjs/server";
import LandingContent from "./landing-content";
import { Suspense } from "react";

async function LandingContainer() {
  const { userId } = await auth();
  return <LandingContent userId={userId} />;
}

export default function LandingPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Zipd",
    "operatingSystem": "Web",
    "applicationCategory": "BusinessApplication",
    "offers": {
      "@type": "Offer",
      "price": "999.00",
      "priceCurrency": "USD"
    },
    "description": "Sovereign institutional link infrastructure for enterprise. Own your private network with 100% data ownership.",
    "publisher": {
      "@type": "Organization",
      "name": "Northern Ventures"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Suspense fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="w-12 h-12 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      }>
        <LandingContainer />
      </Suspense>
    </>
  );
}
