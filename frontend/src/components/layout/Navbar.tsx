'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';

export function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  if (!user) {
    return (
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-xl font-bold text-blue-600">
              AI Mock Interview
            </Link>
            <div className="flex gap-4">
              <Link href="/login">
                <Button variant="ghost" size="sm">Login</Button>
              </Link>
              <Link href="/register">
                <Button variant="primary" size="sm">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="text-xl font-bold text-blue-600">
              AI Mock Interview
            </Link>
            <div className="hidden md:flex gap-4">
              <Link href="/dashboard">
                <span className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/dashboard') ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}>
                  Dashboard
                </span>
              </Link>
              <Link href="/profile">
                <span className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/profile') ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}>
                  Profile
                </span>
              </Link>
              <Link href="/resumes">
                <span className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/resumes') ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}>
                  Resumes
                </span>
              </Link>
              <Link href="/history">
                <span className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/history') ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}>
                  History
                </span>
              </Link>
              {user.role === 'ADMIN' && (
                <Link href="/admin/dashboard">
                  <span className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/admin/dashboard') ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}>
                    Admin
                  </span>
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user.email}</span>
            <Button variant="outline" size="sm" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
