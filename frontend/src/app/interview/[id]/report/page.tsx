'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import api from '@/lib/api';
import {
  Award,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  ArrowRight,
  RotateCcw,
  LayoutDashboard,
  Loader2,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react';

export default function InterviewReportPage() {
  const params = useParams();
  const interviewId = params.id as string;

  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  useEffect(() => {
    fetchReport();
  }, [interviewId]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/interviews/${interviewId}/report`);
      setReport(res.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load performance report.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="flex items-center space-x-3 text-slate-500">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
            <span>Analyzing responses & compiling performance report...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
        <Navbar />
        <div className="flex-1 max-w-xl mx-auto flex flex-col items-center justify-center p-8 text-center space-y-4">
          <p className="text-rose-600 font-semibold">{error || 'Report not found'}</p>
          <Link
            href="/dashboard"
            className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-medium text-sm"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const overallScore = Math.round(report.overallScore || 70);
  const recommendations = report.recommendations;
  const qaBreakdown = report.qaBreakdown || [];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Top Header Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Interview Evaluated</span>
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {report.jobRole} Performance Report
            </h1>
            <p className="text-xs text-slate-500">
              {report.interviewType} Interview • {report.difficulty} Difficulty • {report.totalQuestions} Questions Evaluated
            </p>
          </div>

          {/* Overall Score Badge */}
          <div className="flex flex-col items-center justify-center w-36 h-36 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-xl shadow-indigo-600/25">
            <span className="text-4xl font-extrabold tracking-tight">{overallScore}</span>
            <span className="text-xs text-indigo-100 uppercase tracking-widest font-semibold mt-1">
              Score / 100
            </span>
          </div>
        </div>

        {/* AI Executive Summary Feedback */}
        {recommendations?.overallFeedback && (
          <div className="bg-gradient-to-r from-indigo-50/80 to-violet-50/80 dark:from-indigo-950/30 dark:to-violet-950/30 rounded-2xl p-6 border border-indigo-200 dark:border-indigo-900/60 flex items-start space-x-4">
            <Sparkles className="w-6 h-6 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                AI Interviewer Verdict
              </h3>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {recommendations.overallFeedback}
              </p>
            </div>
          </div>
        )}

        {/* Strengths & Weaknesses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Strengths */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400">
              <Award className="w-5 h-5" />
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Key Strengths
              </h3>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
              {(recommendations?.strengths || []).map((str: string, idx: number) => (
                <li key={idx} className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>{str}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Weaknesses / Improvement Areas */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Areas for Improvement
              </h3>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
              {(recommendations?.weaknesses || []).map((w: string, idx: number) => (
                <li key={idx} className="flex items-start space-x-2">
                  <span className="w-4 h-4 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-600 flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">
                    !
                  </span>
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Recommended Topics & Study Resources */}
        {recommendations?.topicsToImprove && recommendations.topicsToImprove.length > 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-indigo-500" />
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Targeted Improvement Plan & Resources
              </h3>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {recommendations.topicsToImprove.map((topic: string, idx: number) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold"
                >
                  {topic}
                </span>
              ))}
            </div>

            {recommendations.recommendedResources && recommendations.recommendedResources.length > 0 && (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                {recommendations.recommendedResources.map((res: any, idx: number) => (
                  <a
                    key={idx}
                    href={res.url || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-xs transition-colors block"
                  >
                    <span className="font-semibold text-slate-900 dark:text-white block mb-0.5">
                      {res.title}
                    </span>
                    <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono">
                      {res.type || 'Resource'}
                    </span>
                  </a>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Question-by-Question Breakdown */}
        <div className="space-y-4">
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">
            Question-by-Question Breakdown
          </h3>

          <div className="space-y-3">
            {qaBreakdown.map((item: any, idx: number) => {
              const isExpanded = expandedIndex === idx;
              const evalScore = item.evaluation?.score || 70;

              return (
                <div
                  key={idx}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm"
                >
                  <div
                    onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                    className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="flex items-center space-x-3 pr-4">
                      <span className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center justify-center flex-shrink-0">
                        Q{item.questionNumber}
                      </span>
                      <p className="font-semibold text-sm text-slate-900 dark:text-white line-clamp-1">
                        {item.questionText}
                      </p>
                    </div>

                    <div className="flex items-center space-x-4 flex-shrink-0">
                      <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-bold text-xs">
                        {evalScore}/100
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-4 text-xs">
                      <div>
                        <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] block mb-1">
                          Full Question
                        </span>
                        <p className="text-slate-900 dark:text-slate-200 text-sm font-medium">
                          {item.questionText}
                        </p>
                      </div>

                      <div>
                        <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] block mb-1">
                          Your Submitted Answer
                        </span>
                        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                          {item.studentAnswer}
                        </div>
                      </div>

                      {item.evaluation && (
                        <div className="space-y-3 pt-2">
                          {/* Rubric scores */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                              <span className="text-[10px] text-slate-400 block">Accuracy</span>
                              <span className="font-bold text-sm text-slate-900 dark:text-white">
                                {item.evaluation.accuracyScore}%
                              </span>
                            </div>
                            <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                              <span className="text-[10px] text-slate-400 block">Completeness</span>
                              <span className="font-bold text-sm text-slate-900 dark:text-white">
                                {item.evaluation.completenessScore}%
                              </span>
                            </div>
                            <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                              <span className="text-[10px] text-slate-400 block">Clarity</span>
                              <span className="font-bold text-sm text-slate-900 dark:text-white">
                                {item.evaluation.clarityScore}%
                              </span>
                            </div>
                            <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                              <span className="text-[10px] text-slate-400 block">Relevance</span>
                              <span className="font-bold text-sm text-slate-900 dark:text-white">
                                {item.evaluation.relevanceScore}%
                              </span>
                            </div>
                          </div>

                          <div className="p-3.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 space-y-1">
                            <span className="font-semibold text-indigo-900 dark:text-indigo-300 block">
                              Feedback:
                            </span>
                            <p className="text-slate-700 dark:text-slate-300">
                              {item.evaluation.feedback}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-200 dark:border-slate-800">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-sm flex items-center justify-center space-x-2 transition-colors"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </Link>

          <Link
            href="/interview/setup"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm flex items-center justify-center space-x-2 transition-all shadow-md shadow-indigo-600/20"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retake or Practice Another Role</span>
          </Link>
        </div>
      </main>
    </div>
  );
}
