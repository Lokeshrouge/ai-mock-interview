import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'default';
  size?: 'sm' | 'md';
  className?: string;
}

export function Badge({ children, variant = 'default', size = 'md', className }: BadgeProps) {
  const variants = {
    success: 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/80',
    warning: 'bg-amber-950/60 text-amber-300 border border-amber-800/80',
    error: 'bg-rose-950/60 text-rose-300 border border-rose-800/80',
    info: 'bg-indigo-950/60 text-indigo-300 border border-indigo-800/80',
    default: 'bg-slate-800 text-slate-300 border border-slate-700',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  };

  return (
    <span className={cn('inline-flex items-center rounded-full font-medium', variants[variant], sizes[size], className)}>
      {children}
    </span>
  );
}
