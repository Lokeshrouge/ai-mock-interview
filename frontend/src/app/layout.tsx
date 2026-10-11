import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { Navbar } from '@/components/layout/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AI Mock Interview System',
  description: 'Practice interviews with AI-powered feedback',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-slate-950 text-slate-100 min-h-screen selection:bg-indigo-500 selection:text-white`}>
        <AuthProvider>
          <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
            <Navbar />
            <main className="flex-1 flex flex-col">{children}</main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
