import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Page() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold text-amber-500 mb-4 capitalize">cookie policy</h1>
      <p className="text-zinc-400 mb-8">This page is currently under construction.</p>
      <Button asChild variant="outline" className="border-white/20 hover:bg-white/5 text-white">
        <Link href="/">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
      </Button>
    </div>
  );
}
