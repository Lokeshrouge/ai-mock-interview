import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI Mock Interview & Evaluation Platform',
  description: 'AI-Powered Mock Interview Platform with adaptive questioning and real-time performance evaluation.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
