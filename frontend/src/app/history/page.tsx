'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import api from '@/lib/api';
import {
  History,
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  Loader2,
  Plus,
} from 'lucide-react';

interface InterviewHistoryItem {
  id: string;
  jobRole: {
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

export default function HistoryPage() {
  const [interviews, setInterviews] = useState<InterviewHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await api.get('/interviews');
      setInterviews(res.data.data?.items || []);
    } catch (err) {
      console.error('Failed to load interview history', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: InterviewHistoryItem['status']) => {
    switch (status) {
      case 'EVALUATED':
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3 h-3" />
            <span>Completed</span>
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <Clock className="w-3 h-3" />
            <span>In Progress</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            <span>Created</span>
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Interview History
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Review your past mock interview evaluations, scores, and ongoing practice sessions.
            </p>
          </div>

          <Link
            href="/interview/setup"
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-all shadow-md shadow-indigo-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>New Mock Interview</span>
          </Link>
        </div>

        {loading ? (
          <div className="p-16 flex items-center justify-center text-slate-500">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-600 mr-3" />
            <span>Loading past sessions...</span>
          </div>
        ) : interviews.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center mx-auto">
              <History className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">
              No interviews taken yet
            </h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              Launch your first mock interview to get tailored adaptive questions and actionable AI feedback.
            </p>
            <Link
              href="/interview/setup"
              className="inline-block px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-xs"
            >
              Start First Interview
            </Link>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {interviews.map((item) => (
                <div
                  key={item.id}
                  className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <div className="flex items-start sm:items-center space-x-4">
                    <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center flex-shrink-0">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                          {item.jobRole?.title || 'Mock Interview'}
                        </h3>
                        {getStatusBadge(item.status)}
                      </div>
                      <div className="flex items-center space-x-3 text-xs text-slate-400 mt-1">
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                        </span>
                        <span>•</span>
                        <span className="capitalize">{item.interviewType?.toLowerCase()}</span>
                        <span>•</span>
                        <span className="capitalize">{item.difficulty?.toLowerCase()}</span>
                        <span>•</span>
                        <span>
                          {item.answeredQuestions} of {item.totalQuestions} Questions
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 self-end sm:self-center">
                    {item.overallScore !== null && (
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block uppercase font-mono">
                          Score
                        </span>
                        <span className="text-base font-extrabold text-indigo-600 dark:text-indigo-400">
                          {Math.round(item.overallScore)}/100
                        </span>
                      </div>
                    )}

                    {item.status === 'EVALUATED' || item.status === 'COMPLETED' ? (
                      <Link
                        href={`/interview/${item.id}/report`}
                        className="px-4 py-2 rounded-xl bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-semibold text-xs flex items-center space-x-1.5 hover:bg-indigo-100 transition-colors"
                      >
                        <span>View Report</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    ) : (
                      <Link
                        href={`/interview/${item.id}`}
                        className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold text-xs flex items-center space-x-1.5 hover:bg-indigo-700 transition-colors"
                      >
                        <span>Resume Session</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
