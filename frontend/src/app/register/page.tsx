'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function RegisterPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const extractErrorMessage = (err: any): string => {
    // 1. Check custom NestJS HttpExceptionFilter response structure: { error: { message, code, details } }
    if (err?.response?.data?.error?.message) {
      return err.response.data.error.message;
    }
    if (err?.response?.data?.error?.details?.length > 0) {
      return err.response.data.error.details.map((d: any) => d.message).join('. ');
    }

    // 2. Check standard NestJS ValidationPipe response structure: { message: string | string[] }
    if (err?.response?.data?.message) {
      const msg = err.response.data.message;
      return Array.isArray(msg) ? msg.join('. ') : msg;
    }

    // 3. Network or connection errors
    if (err?.code === 'ERR_NETWORK' || err?.message === 'Network Error' || !err?.response) {
      return 'Cannot reach backend server. Please verify backend is running on http://localhost:3001.';
    }

    // 4. Fallback message
    return err?.message || 'Registration failed. Please check your credentials and try again.';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanFirstName = firstName.trim();
    const cleanLastName = lastName.trim();
    const cleanEmail = email.trim();

    if (!cleanFirstName || !cleanLastName) {
      setError('First and last name are required');
      return;
    }

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    // Backend regex check: uppercase, lowercase, and number or special character
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasDigitOrSpecial = /((?=.*\d)|(?=.*\W+))/.test(password);

    if (!hasUpperCase || !hasLowerCase || !hasDigitOrSpecial) {
      setError('Password must contain at least one uppercase letter, one lowercase letter, and one number or special character.');
      return;
    }

    setLoading(true);
    try {
      await register(cleanEmail, password, cleanFirstName, cleanLastName);
      setSuccess(true);
      // AuthContext handles router.push('/dashboard'), but explicit redirect ensures navigation
      setTimeout(() => {
        router.push('/dashboard');
      }, 100);
    } catch (err: any) {
      setError(extractErrorMessage(err));
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 py-12 bg-slate-950 selection:bg-indigo-500 selection:text-white">
      <div className="w-full max-w-md bg-slate-900 rounded-3xl p-8 border border-slate-800 shadow-2xl shadow-indigo-950/40 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-bold text-xl mx-auto shadow-lg shadow-indigo-600/30">
            AI
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Create Candidate Account
          </h1>
          <p className="text-xs text-slate-400">
            Sign up to build your profile and take AI mock interviews
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-950/60 text-rose-300 border border-rose-800/80 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3.5 rounded-xl bg-emerald-950/60 text-emerald-300 border border-emerald-800/80 text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>Account created successfully! Redirecting to dashboard...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                First Name
              </label>
              <input
                type="text"
                required
                disabled={loading || success}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Jane"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950/70 text-white placeholder:text-slate-500 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Last Name
              </label>
              <input
                type="text"
                required
                disabled={loading || success}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Doe"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950/70 text-white placeholder:text-slate-500 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition disabled:opacity-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              disabled={loading || success}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane@example.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950/70 text-white placeholder:text-slate-500 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Password (min. 8 characters)
            </label>
            <input
              type="password"
              required
              disabled={loading || success}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950/70 text-white placeholder:text-slate-500 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition disabled:opacity-50"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Must include uppercase, lowercase, and a number or symbol.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{loading ? 'Creating Account...' : success ? 'Redirecting...' : 'Register'}</span>
          </button>
        </form>

        <p className="text-center text-xs text-slate-400">
          Already have an account?{' '}
          <Link href="/login" className="text-indigo-400 font-semibold hover:text-indigo-300 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
