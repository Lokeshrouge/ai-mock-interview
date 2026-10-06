'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import api from '@/lib/api';
import {
  UserCheck,
  FileText,
  PlayCircle,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';

export default function DashboardPage() {
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get('/profile');
      setProfileData(res.data.data);
    } catch (err) {
      console.error('Failed to load profile dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  const completion = profileData?.completion;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-800 rounded-3xl p-8 text-white shadow-xl shadow-indigo-600/15 relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-3">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-md text-white border border-white/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Interview Readiness Portal</span>
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Welcome, {profileData?.profile?.firstName || 'Candidate'}!
            </h1>
            <p className="text-indigo-100 text-sm">
              Complete your profile and upload your resume to unlock hyper-personalized AI mock interview sessions tailored to your target job role.
            </p>
          </div>
        </div>

        {/* Status & Next Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Profile Status */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-lg">
                  Student Profile
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Manage education, technical competencies, and target role.
                </p>
              </div>

              {completion && (
                <div className="pt-2">
                  <div className="flex justify-between text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    <span>Completion</span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                      {completion.percentage}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full"
                      style={{ width: `${completion.percentage}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/profile"
              className="mt-6 inline-flex items-center justify-between text-sm font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
            >
              <span>Update Profile</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Card 2: Resume Status */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-lg">
                  Resume CV
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Automated parsing extracts skills and projects for questioning.
                </p>
              </div>

              <div className="pt-2">
                <span className="text-xs text-slate-500 block mb-1">Status:</span>
                {profileData?.hasActiveResume ? (
                  <span className="inline-flex items-center space-x-1 text-xs font-semibold text-emerald-600">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Active Resume Attached</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center space-x-1 text-xs font-semibold text-amber-600">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>No Resume Uploaded</span>
                  </span>
                )}
              </div>
            </div>

            <Link
              href="/resumes"
              className="mt-6 inline-flex items-center justify-between text-sm font-semibold text-violet-600 hover:text-violet-700 dark:text-violet-400"
            >
              <span>Manage Resumes</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Card 3: Take Interview */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                <PlayCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-lg">
                  Mock Interview
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Start an intelligent mock session with instant AI evaluation.
                </p>
              </div>
            </div>

            <Link
              href="/interview/setup"
              className="mt-6 w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center justify-center space-x-2 transition-all shadow-md shadow-indigo-600/20"
            >
              <span>Start Mock Interview</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
