import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="flex-1 flex items-center justify-center p-8 bg-slate-950">
      <div className="flex items-center space-x-3 text-slate-400">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
        <span className="text-sm font-medium">Loading content...</span>
      </div>
    </div>
  );
}
