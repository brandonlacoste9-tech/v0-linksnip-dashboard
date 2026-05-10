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
    title: `${meta.title} | Zipd`,
    description: meta.description,
    openGraph: {
      title: meta.title,
      description: meta.description,
      images: meta.ogImage ? [meta.ogImage] : [],
      type: 'website',
    },
  }
}

async function BridgeContent({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  
  // Log the click for analytics (uses dynamic headers, strictly cached)
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
      "@id": `https://zipd.io/${code}`
    }
  }

  return (
    <div className="relative z-10 flex flex-col items-center gap-8 max-w-md text-center px-6">
      <Script
        id="json-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <div className="w-20 h-20 rounded-3xl bg-card border border-border flex items-center justify-center shadow-2xl relative overflow-hidden group">
         <div className="absolute inset-0 bg-primary/10 animate-pulse" />
         <img 
            src={`https://www.google.com/s2/favicons?domain=${link.original_url}&sz=128`} 
            className="w-12 h-12 rounded-xl object-cover shadow-2xl relative z-10 grayscale group-hover:grayscale-0 transition-all duration-700" 
            alt="Destination"
          />
      </div>

      <div className="space-y-4">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Securely Redirecting
        </h1>
        <p className="text-muted-foreground text-[10px] font-mono uppercase tracking-[0.3em]">
          via Zipd Sovereign Engine
        </p>
      </div>

      <div className="w-64 bg-primary/10 h-1 rounded-full overflow-hidden border border-primary/20">
        <div className="bg-primary h-full w-full origin-left animate-progress-fast shadow-[0_0_15px_rgba(234,88,12,0.5)]" />
      </div>

      <p className="text-muted-foreground text-[10px] uppercase tracking-widest font-bold">
        Established Total Data Ownership
      </p>

      {/* Client-side redirect backup */}
      <script dangerouslySetInnerHTML={{ __html: `
        setTimeout(() => {
          window.location.href = "${link.original_url}";
        }, 800);
      `}} />

      {/* Meta Refresh for high-trust redirect */}
      <meta httpEquiv="refresh" content={`1.0; url=${link.original_url}`} />
    </div>
  )
}

export default function BridgePage(
  { params }: { params: Promise<{ code: string }> }
) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center text-foreground relative overflow-hidden transition-colors duration-500">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

      <Suspense fallback={
        <div className="relative z-10 flex flex-col items-center gap-8 max-w-md text-center px-6">
          <div className="w-20 h-20 rounded-3xl bg-card border border-border flex items-center justify-center animate-pulse" />
          <h1 className="text-2xl font-bold tracking-tight text-muted-foreground/60">Initializing Engine...</h1>
        </div>
      }>
        <BridgeContent params={params} />
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
