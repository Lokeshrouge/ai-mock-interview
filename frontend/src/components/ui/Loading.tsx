import React from 'react';

interface LoadingProps {
  text?: string;
  fullScreen?: boolean;
}

export function Loading({ text = 'Loading...', fullScreen = false }: LoadingProps) {
  const content = (
    <div className="flex flex-col items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      {text && <p className="mt-4 text-slate-400 text-sm font-medium">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm z-50 flex items-center justify-center">
        {content}
      </div>
    );
  }

  return <div className="py-12">{content}</div>;
}

export function Spinner({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className={`animate-spin rounded-full border-b-2 border-indigo-500 ${sizes[size]} ${className}`}></div>
  );
}
