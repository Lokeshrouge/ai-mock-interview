'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  Menu,
  X,
  Sparkles,
  User,
  FileText,
  History,
  Shield,
  PlayCircle,
  LayoutDashboard,
  LogOut,
} from 'lucide-react';

export function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => pathname === path || pathname.startsWith(`${path}/`);

  if (!user) {
    return (
      <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-600 flex items-center justify-center text-white font-extrabold text-lg shadow-md shadow-indigo-600/20">
                AI
              </div>
              <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                MockInterview<span className="text-indigo-600">.ai</span>
              </span>
            </Link>

            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-indigo-600 transition"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  const navLinks = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Profile', href: '/profile', icon: User },
    { label: 'Resumes', href: '/resumes', icon: FileText },
    { label: 'History', href: '/history', icon: History },
  ];

  return (
    <nav className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Desktop Nav Links */}
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-600 flex items-center justify-center text-white font-extrabold text-lg shadow-md shadow-indigo-600/20">
                AI
              </div>
              <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                MockInterview<span className="text-indigo-600">.ai</span>
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-1.5">
              {navLinks.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                      active
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}

              {user.role === 'ADMIN' && (
                <Link
                  href="/admin/dashboard"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    isActive('/admin')
                      ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400'
                      : 'text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/40'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Admin</span>
                </Link>
              )}
            </div>
          </div>

          {/* Desktop Right Side CTA & Profile */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/interview/setup"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition"
            >
              <PlayCircle className="w-3.5 h-3.5" />
              <span>Practice Interview</span>
            </Link>

            <div className="h-5 w-px bg-slate-200 dark:bg-slate-800" />

            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate max-w-[150px]">
                {user.email}
              </span>
              <button
                onClick={logout}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-xs flex items-center gap-1"
                title="Log out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Mobile Menu Hamburger Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-3 pb-5 space-y-2">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold transition ${
                  active
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}

          {user.role === 'ADMIN' && (
            <Link
              href="/admin/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold transition ${
                isActive('/admin')
                  ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400'
                  : 'text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/40'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Admin Portal</span>
            </Link>
          )}

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
            <Link
              href="/interview/setup"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold shadow-md shadow-indigo-600/20"
            >
              <PlayCircle className="w-4 h-4" />
              <span>Practice Interview</span>
            </Link>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                logout();
              }}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out ({user.email})</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
