import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getLinkByCode, getLinkMetadata, logClick } from "@/app/actions"
import Script from "next/script"
import { Suspense } from "react"

export async function generateMetadata(
  { params }: { params: Promise<{ code: string }> }
): Promise<Metadata> {
  const { code } = await params
  const link = await getLinkByCode(code)
  
  if (!link) return { title: "404 - Not Found" }

  const meta = await getLinkMetadata(link.original_url)

  return {
    title: `${meta.title} | LinkSnip`,
    description: meta.description,
    openGraph: {
      title: meta.title,
      description: meta.description,
      images: meta.ogImage ? [meta.ogImage] : [],
      type: 'website',
    },
  }
}

async function BridgeContent({ code }: { code: string }) {
  // Log the click for analytics (uses dynamic headers)
  const link = await logClick(code)
  if (!link) notFound()

  const meta = await getLinkMetadata(link.original_url)

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": meta.title,
    "description": meta.description,
    "url": link.original_url,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://linksnip.ca/${code}`
    }
  }

  return (
    <div className="relative z-10 flex flex-col items-center gap-8 max-w-md text-center px-6">
      <Script
        id="json-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <div className="w-20 h-20 rounded-3xl bg-neutral-900 border border-neutral-800 flex items-center justify-center shadow-[0_0_50px_-10px_rgba(245,158,11,0.4)] animate-pulse">
         <img 
            src={`https://www.google.com/s2/favicons?domain=${link.original_url}&sz=128`} 
            className="w-12 h-12 rounded-xl object-cover shadow-2xl"
            alt="Destination"
          />
      </div>

      <div className="space-y-4">
        <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
          Securely Redirecting
        </h1>
        <p className="text-zinc-500 text-sm font-medium uppercase tracking-[0.2em]">
          via LinkSnip Sovereign Engine
        </p>
      </div>

      <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
        <div className="bg-amber-500 h-full w-full origin-left animate-progress-fast" />
      </div>

      <p className="text-zinc-400 text-xs italic">
        If you are not redirected automatically, <a href={link.original_url} className="text-amber-500 hover:underline">click here</a>.
      </p>

      {/* Meta Refresh for high-trust redirect */}
      <meta httpEquiv="refresh" content={`1.5; url=${link.original_url}`} />
    </div>
  )
}

export default async function BridgePage(
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center text-white relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-600/10 blur-[120px] rounded-full pointer-events-none" />

      <Suspense fallback={
        <div className="relative z-10 flex flex-col items-center gap-8 max-w-md text-center px-6">
          <div className="w-20 h-20 rounded-3xl bg-neutral-900 border border-neutral-800 flex items-center justify-center animate-pulse" />
          <h1 className="text-2xl font-bold tracking-tight text-white/60">Initializing Engine...</h1>
        </div>
      }>
        <BridgeContent code={code} />
      </Suspense>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes progress-fast {
          0% { transform: scaleX(0); }
          100% { transform: scaleX(1); }
        }
        .animate-progress-fast {
          animation: progress-fast 1.5s ease-in-out forwards;
        }
      `}} />
    </div>
  )
}
