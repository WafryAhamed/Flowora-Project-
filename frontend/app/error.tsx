'use client';

import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const router = useRouter();
  
  return (
    <div className="min-h-screen bg-app-bg flex items-center justify-center p-6 animate-fade-in">
      <div className="max-w-md w-full rounded-3xl border border-app-border bg-app-surface p-8 text-center shadow-glass flex flex-col items-center">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mb-6">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight">Something went wrong</h2>
        <p className="mt-2 text-sm text-brand-muted">
          We encountered an unexpected error while processing your request. Please try again.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3 w-full">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex-1 rounded-xl border border-app-border bg-app-surface px-4 py-2.5 text-sm font-medium hover:bg-app-bg transition-colors"
          >
            Dashboard
          </button>
          <button
            onClick={() => reset()}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-primary/90 transition-colors"
          >
            <RefreshCcw className="w-4 h-4" />
            Try again
          </button>
        </div>
      </div>
    </div>
  );
}
