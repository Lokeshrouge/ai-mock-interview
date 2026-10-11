import React from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Input({ label, error, helperText, className, id, ...props }: InputProps) {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-slate-300 mb-1.5">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          'w-full px-4 py-2.5 bg-slate-950/70 text-white placeholder:text-slate-500 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition outline-none text-sm',
          error ? 'border-rose-500' : 'border-slate-700',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-rose-400">{error}</p>}
      {helperText && !error && <p className="mt-1 text-xs text-slate-400">{helperText}</p>}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  showCount?: boolean;
  maxLength?: number;
}

export function Textarea({ label, error, helperText, showCount, maxLength, className, id, value, ...props }: TextareaProps) {
  const inputId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
  const currentLength = typeof value === 'string' ? value.length : 0;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-slate-300 mb-1.5">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        value={value}
        maxLength={maxLength}
        className={cn(
          'w-full px-4 py-2.5 bg-slate-950/70 text-white placeholder:text-slate-500 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition outline-none text-sm resize-none',
          error ? 'border-rose-500' : 'border-slate-700',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          className
        )}
        {...props}
      />
      <div className="flex justify-between items-center mt-1">
        <div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          {helperText && !error && <p className="text-sm text-gray-500">{helperText}</p>}
        </div>
        {showCount && maxLength && (
          <p className="text-sm text-gray-500">
            {currentLength} / {maxLength}
          </p>
        )}
      </div>
    </div>
  );
}
