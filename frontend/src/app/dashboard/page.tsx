'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
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
  Award,
  History,
  Clock,
  TrendingUp,
  Target,
  Plus,
  Briefcase,
  ChevronRight,
} from 'lucide-react';

interface InterviewItem {
  id: string;
  jobRole?: {
    title: string;
  };
  interviewType: string;
  difficulty: string;
  status: 'CREATED' | 'IN_PROGRESS' | 'COMPLETED' | 'EVALUATED';
  overallScore: number | null;
  totalQuestions: number;
  answeredQuestions: number;
  createdAt: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);
  const [interviews, setInterviews] = useState<InterviewItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && !authLoading) {
      loadDashboard();
    }
  }, [user, authLoading]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const [profileRes, interviewsRes] = await Promise.allSettled([
        api.get('/profile'),
        api.get('/interviews?limit=5'),
      ]);

      if (profileRes.status === 'fulfilled') {
        setProfileData(profileRes.value.data.data);
      }
      if (interviewsRes.status === 'fulfilled') {
        setInterviews(interviewsRes.value.data.data?.items || []);
      }
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking authentication
  if (authLoading || !user) {
    return (
      <div className="flex-1 w-full flex items-center justify-center bg-slate-950">
        <div className="flex items-center space-x-3 text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
          <span>Loading dashboard...</span>
        </div>
      </div>
    );
  }

  const completion = profileData?.completion;
  const profile = profileData?.profile;

  // Compute metrics from interviews
  const totalInterviews = interviews.length;
  const completedInterviews = interviews.filter(
    (i) => i.status === 'COMPLETED' || i.status === 'EVALUATED'
  );
  const scoredInterviews = interviews.filter((i) => i.overallScore !== null && i.overallScore !== undefined);
  const averageScore =
    scoredInterviews.length > 0
      ? Math.round(
          scoredInterviews.reduce((acc, curr) => acc + (curr.overallScore || 0), 0) /
            scoredInterviews.length
        )
      : null;

  return (
    <div className="flex-1 w-full bg-slate-950 selection:bg-indigo-500 selection:text-white">
      <div className="max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-blue-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-indigo-600/15 relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute right-1/4 -bottom-20 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-md text-white border border-white/20">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Candidate Intelligence Portal</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                Welcome back, {profile?.firstName || 'Candidate'}!
              </h1>
              <p className="text-indigo-100 text-xs sm:text-sm leading-relaxed">
                {profile?.targetRole ? (
                  <>Preparing for <span className="font-semibold text-white">{profile.targetRole}</span>. </>
                ) : null}
                Practice adaptive interview questions, receive instant multi-rubric evaluation, and elevate your technical readiness.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/interview/setup"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-indigo-700 hover:bg-indigo-50 text-xs sm:text-sm font-bold shadow-md shadow-black/10 transition"
              >
                <PlayCircle className="w-4 h-4 text-indigo-600" />
                <span>Practice Interview</span>
              </Link>
              <Link
                href="/history"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs sm:text-sm font-semibold backdrop-blur-sm transition"
              >
                <History className="w-4 h-4" />
                <span>Past History</span>
              </Link>
            </div>
          </div>
        </div>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Stat 1: Total Interviews */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Sessions</span>
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Target className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {loading ? '...' : totalInterviews}
              </span>
              <span className="text-[11px] text-slate-400 font-medium">sessions initiated</span>
            </div>
          </div>

          {/* Stat 2: Completed */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Completed</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {loading ? '...' : completedInterviews.length}
              </span>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">evaluated</span>
            </div>
          </div>

          {/* Stat 3: Average Score */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Avg Performance</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {loading ? '...' : averageScore !== null ? `${averageScore}%` : 'N/A'}
              </span>
              <span className="text-[11px] text-slate-400 font-medium">across rubrics</span>
            </div>
          </div>

          {/* Stat 4: Profile Readiness */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Profile Readiness</span>
              <div className="w-8 h-8 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {loading ? '...' : `${completion?.percentage || 0}%`}
              </span>
              <span className="text-[11px] text-violet-600 dark:text-violet-400 font-medium">completed</span>
            </div>
          </div>
        </div>

        {/* 3 Core Quick Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Profile Status */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Student Profile
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Education, target role, and technical competencies used to personalize questions.
                </p>
              </div>

              {completion && (
                <div className="pt-2">
                  <div className="flex justify-between text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    <span>Profile Score</span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                      {completion.percentage}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                      style={{ width: `${completion.percentage}%` }}
                    />
                  </div>
                  {completion.missingSections?.length > 0 && (
                    <p className="text-[11px] text-slate-400 mt-1.5">
                      Missing: {completion.missingSections.slice(0, 2).join(', ')}
                    </p>
                  )}
                </div>
              )}
            </div>

            <Link
              href="/profile"
              className="mt-6 inline-flex items-center justify-between text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 pt-3 border-t border-slate-100 dark:border-slate-800"
            >
              <span>Update Profile & Skills</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 2: Resume CV */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Resume Intelligence
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Upload PDF or DOCX. AI extracts experience and projects for scenario questions.
                </p>
              </div>

              <div className="pt-2">
                <span className="text-[11px] text-slate-400 block mb-1">Current Status:</span>
                {profileData?.hasActiveResume ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-lg">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Active Resume Synced</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2.5 py-1 rounded-lg">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>No Resume Uploaded</span>
                  </span>
                )}
              </div>
            </div>

            <Link
              href="/resumes"
              className="mt-6 inline-flex items-center justify-between text-xs font-semibold text-violet-600 hover:text-violet-700 dark:text-violet-400 pt-3 border-t border-slate-100 dark:border-slate-800"
            >
              <span>Manage Resumes & Upload</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 3: Start Practice */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <PlayCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Interactive Interview
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Choose your role, difficulty, and question count for a simulated real interview.
                </p>
              </div>

              <div className="pt-2">
                <span className="text-[11px] text-slate-400 block mb-1">Supported Roles:</span>
                <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                  Fullstack, Frontend, Backend, AI/ML & DevOps
                </span>
              </div>
            </div>

            <Link
              href="/interview/setup"
              className="mt-6 w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 transition"
            >
              <span>Configure Session</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Recent Interviews Table & Activity */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Recent Mock Interviews
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Your latest practice sessions and performance evaluations
              </p>
            </div>
            <Link
              href="/history"
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="p-12 flex items-center justify-center text-slate-400">
              <Loader2 className="w-5 h-5 animate-spin mr-2 text-indigo-600" />
              <span className="text-xs">Loading sessions...</span>
            </div>
          ) : interviews.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center mx-auto">
                <History className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                No mock interviews recorded yet
              </p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Start your first session to receive instant AI scoring, strength analysis, and customized learning recommendations.
              </p>
              <Link
                href="/interview/setup"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold shadow-md shadow-indigo-600/20"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Start First Mock Interview</span>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {interviews.map((item) => {
                const isComplete = item.status === 'COMPLETED' || item.status === 'EVALUATED';
                return (
                  <div
                    key={item.id}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center flex-shrink-0">
                        <Briefcase className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                            {item.jobRole?.title || 'Mock Interview'}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                              isComplete
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                                : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                            }`}
                          >
                            {isComplete ? 'Completed' : 'In Progress'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                          <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                          <span>•</span>
                          <span className="capitalize">{item.difficulty?.toLowerCase()}</span>
                          <span>•</span>
                          <span>
                            {item.answeredQuestions} / {item.totalQuestions} Questions
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      {item.overallScore !== null && (
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 block uppercase font-mono">
                            Score
                          </span>
                          <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400">
                            {Math.round(item.overallScore)}/100
                          </span>
                        </div>
                      )}

                      {isComplete ? (
                        <Link
                          href={`/interview/${item.id}/report`}
                          className="px-3.5 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 text-xs font-semibold flex items-center gap-1 transition"
                        >
                          <span>Report</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      ) : (
                        <Link
                          href={`/interview/${item.id}`}
                          className="px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-semibold flex items-center gap-1 transition"
                        >
                          <span>Resume</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
