'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RotateCcw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled app error:', error);
  }, [error]);

  return (
    <div className="flex-1 flex items-center justify-center p-4 py-16 bg-slate-950 text-white selection:bg-indigo-500 selection:text-white">
      <div className="text-center max-w-md space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-rose-950/60 text-rose-400 flex items-center justify-center mx-auto border border-rose-800/80">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight">Something went wrong</h2>
        <p className="text-sm text-slate-400">
          An unexpected error occurred while rendering this view.
        </p>
        <div className="pt-2 flex items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition shadow-lg shadow-indigo-600/25"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 font-medium text-sm transition"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
