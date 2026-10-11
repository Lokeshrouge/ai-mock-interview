import React from 'react';
import Link from 'next/link';
import { ArrowLeft, HelpCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex-1 flex items-center justify-center p-4 py-16 bg-slate-950 text-white selection:bg-indigo-500 selection:text-white">
      <div className="text-center max-w-md space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center mx-auto border border-indigo-500/30">
          <HelpCircle className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight">Page Not Found</h2>
        <p className="text-sm text-slate-400">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition shadow-lg shadow-indigo-600/20"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Homepage</span>
        </Link>
      </div>
    </div>
  );
}
