import { FileQuestion, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-app-bg flex items-center justify-center p-6 animate-fade-in">
      <div className="max-w-md w-full rounded-3xl border border-app-border bg-app-surface p-8 text-center shadow-glass flex flex-col items-center">
        <div className="w-16 h-16 rounded-2xl bg-brand-accent/10 text-brand-accent flex items-center justify-center mb-6">
          <FileQuestion className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight">Page not found</h2>
        <p className="mt-2 text-sm text-brand-muted">
          The page you requested could not be found or you don't have permission to access it.
        </p>
        <div className="mt-8 w-full">
          <Link
            href="/dashboard"
            className="flex items-center justify-center gap-2 w-full rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-primary/90 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
