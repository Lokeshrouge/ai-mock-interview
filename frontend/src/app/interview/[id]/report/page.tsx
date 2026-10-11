'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
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
  const [expandedCoachingIndex, setExpandedCoachingIndex] = useState<number | null>(null);
  const [revisionMode, setRevisionMode] = useState<{[key: number]: boolean}>({});
  const [revisionText, setRevisionText] = useState<{[key: number]: string}>({});
  const [submittingRevision, setSubmittingRevision] = useState<{[key: number]: boolean}>({});
  const [revisions, setRevisions] = useState<{[key: number]: any[]}>({});

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

  const submitRevision = async (answerId: string, questionIdx: number) => {
    const revisedAnswer = revisionText[questionIdx]?.trim();
    
    if (!revisedAnswer || revisedAnswer.length < 10) {
      alert('Please provide a meaningful revised answer (at least 10 characters)');
      return;
    }

    setSubmittingRevision({ ...submittingRevision, [questionIdx]: true });

    try {
      const res = await api.post(`/interviews/answers/${answerId}/revisions`, {
        revisedText: revisedAnswer,
      });

      const revision = res.data;

      // Store the revision
      const existingRevisions = revisions[questionIdx] || [];
      setRevisions({
        ...revisions,
        [questionIdx]: [...existingRevisions, revision],
      });

      // Clear revision mode and text
      setRevisionMode({ ...revisionMode, [questionIdx]: false });
      setRevisionText({ ...revisionText, [questionIdx]: '' });

      alert(`Revision submitted! New score: ${revision.score}/100`);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit revision');
    } finally {
      setSubmittingRevision({ ...submittingRevision, [questionIdx]: false });
    }
  };

  if (loading) {
    return (
      <div className="flex-1 w-full flex items-center justify-center p-8 bg-slate-950">
        <div className="flex items-center space-x-3 text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
          <span>Analyzing responses & compiling performance report...</span>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="flex-1 w-full flex items-center justify-center p-8 bg-slate-950">
        <div className="max-w-xl mx-auto flex flex-col items-center justify-center p-8 text-center space-y-4">
          <p className="text-rose-400 font-semibold">{error || 'Report not found'}</p>
          <Link
            href="/dashboard"
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition shadow-lg shadow-indigo-600/25"
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
    <div className="flex-1 w-full bg-slate-950">
      <main className="max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
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
            <div className="space-y-1">
              <p className="text-xs text-slate-500">
                {report.interviewType} Interview • {report.difficulty} Difficulty • {report.totalQuestions} Questions Evaluated
              </p>
              {(report.targetCompany || report.targetRole) && (
                <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                  {report.targetCompany && `Target: ${report.targetCompany}`}
                  {report.targetCompany && report.targetRole && ' • '}
                  {report.targetRole}
                  {report.experienceLevel && ` (${report.experienceLevel})`}
                </p>
              )}
            </div>
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

                          {/* Coaching Section: How You Should Answer */}
                          {(item.evaluation.modelAnswer || item.evaluation.whyBetter || item.evaluation.answerFramework || (item.evaluation.keyConcepts && item.evaluation.keyConcepts.length > 0) || (item.evaluation.studyRecommendations && item.evaluation.studyRecommendations.length > 0)) && (
                            <div className="pt-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setExpandedCoachingIndex(expandedCoachingIndex === idx ? null : idx);
                                }}
                                className="w-full px-4 py-3 rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/60 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors flex items-center justify-between"
                              >
                                <div className="flex items-center space-x-2">
                                  <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                  <span className="font-bold text-sm text-emerald-900 dark:text-emerald-300">
                                    💡 How You Should Answer This
                                  </span>
                                </div>
                                {expandedCoachingIndex === idx ? (
                                  <ChevronUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                ) : (
                                  <ChevronDown className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                )}
                              </button>

                              {expandedCoachingIndex === idx && (
                                <div className="mt-3 p-5 rounded-xl bg-gradient-to-br from-emerald-50/80 via-teal-50/80 to-cyan-50/80 dark:from-emerald-950/30 dark:via-teal-950/30 dark:to-cyan-950/30 border border-emerald-200 dark:border-emerald-900 space-y-4">
                                  {/* Model Answer */}
                                  {item.evaluation.modelAnswer && (
                                    <div>
                                      <h4 className="font-semibold text-xs text-emerald-700 dark:text-emerald-400 mb-1.5 flex items-center space-x-1">
                                        <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center text-[10px] font-bold">1</span>
                                        <span>IDEAL ANSWER</span>
                                      </h4>
                                      <div className="p-3 rounded-lg bg-white/80 dark:bg-slate-900/80 border border-emerald-200/50 dark:border-emerald-800/50">
                                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                                          {item.evaluation.modelAnswer}
                                        </p>
                                      </div>
                                    </div>
                                  )}

                                  {/* Why This is Better */}
                                  {item.evaluation.whyBetter && (
                                    <div>
                                      <h4 className="font-semibold text-xs text-teal-700 dark:text-teal-400 mb-1.5 flex items-center space-x-1">
                                        <span className="w-5 h-5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-400 flex items-center justify-center text-[10px] font-bold">2</span>
                                        <span>WHY THIS IS BETTER</span>
                                      </h4>
                                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pl-6">
                                        {item.evaluation.whyBetter}
                                      </p>
                                    </div>
                                  )}

                                  {/* Answer Structure/Framework */}
                                  {item.evaluation.answerFramework && (
                                    <div>
                                      <h4 className="font-semibold text-xs text-cyan-700 dark:text-cyan-400 mb-1.5 flex items-center space-x-1">
                                        <span className="w-5 h-5 rounded-full bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-400 flex items-center justify-center text-[10px] font-bold">3</span>
                                        <span>ANSWER STRUCTURE</span>
                                      </h4>
                                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pl-6 italic">
                                        {item.evaluation.answerFramework}
                                      </p>
                                    </div>
                                  )}

                                  {/* Key Concepts */}
                                  {item.evaluation.keyConcepts && item.evaluation.keyConcepts.length > 0 && (
                                    <div>
                                      <h4 className="font-semibold text-xs text-indigo-700 dark:text-indigo-400 mb-1.5 flex items-center space-x-1">
                                        <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 flex items-center justify-center text-[10px] font-bold">4</span>
                                        <span>KEY POINTS TO INCLUDE</span>
                                      </h4>
                                      <ul className="space-y-1 pl-6">
                                        {item.evaluation.keyConcepts.map((concept: string, i: number) => (
                                          <li key={i} className="text-xs text-slate-600 dark:text-slate-400 flex items-start space-x-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0 mt-1.5"></span>
                                            <span>{concept}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}

                                  {/* Study Recommendations */}
                                  {item.evaluation.studyRecommendations && item.evaluation.studyRecommendations.length > 0 && (
                                    <div>
                                      <h4 className="font-semibold text-xs text-rose-700 dark:text-rose-400 mb-1.5 flex items-center space-x-1">
                                        <span className="w-5 h-5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400 flex items-center justify-center text-[10px] font-bold">5</span>
                                        <span>WHAT TO STUDY NEXT</span>
                                      </h4>
                                      <ul className="space-y-1 pl-6">
                                        {item.evaluation.studyRecommendations.map((rec: string, i: number) => (
                                          <li key={i} className="text-xs text-slate-600 dark:text-slate-400 flex items-start space-x-2">
                                            <BookOpen className="w-3 h-3 text-rose-500 flex-shrink-0 mt-0.5" />
                                            <span>{rec}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}

                                  {/* Try Again / Revision Feature */}
                                  <div className="pt-2 border-t border-emerald-200/50 dark:border-emerald-800/50">
                                    {!revisionMode[idx] ? (
                                      <button
                                        onClick={() => {
                                          setRevisionMode({ ...revisionMode, [idx]: true });
                                          setRevisionText({ ...revisionText, [idx]: item.studentAnswer });
                                        }}
                                        className="w-full px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors flex items-center justify-center space-x-2"
                                      >
                                        <RotateCcw className="w-3.5 h-3.5" />
                                        <span>🔄 Try Again - Submit Revised Answer</span>
                                      </button>
                                    ) : (
                                      <div className="space-y-3">
                                        <div>
                                          <label className="block text-xs font-semibold text-emerald-900 dark:text-emerald-300 mb-2">
                                            Submit Your Revised Answer:
                                          </label>
                                          <textarea
                                            value={revisionText[idx] || ''}
                                            onChange={(e) => setRevisionText({ ...revisionText, [idx]: e.target.value })}
                                            className="w-full p-3 rounded-lg border-2 border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                                            rows={6}
                                            placeholder="Type your improved answer here..."
                                          />
                                        </div>

                                        <div className="flex space-x-2">
                                          <button
                                            onClick={() => submitRevision(item.answerId, idx)}
                                            disabled={submittingRevision[idx]}
                                            className="flex-1 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold text-xs transition-colors flex items-center justify-center space-x-2"
                                          >
                                            {submittingRevision[idx] ? (
                                              <>
                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                <span>Evaluating...</span>
                                              </>
                                            ) : (
                                              <>
                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                <span>Submit Revision</span>
                                              </>
                                            )}
                                          </button>
                                          <button
                                            onClick={() => {
                                              setRevisionMode({ ...revisionMode, [idx]: false });
                                              setRevisionText({ ...revisionText, [idx]: '' });
                                            }}
                                            className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-xs transition-colors"
                                          >
                                            Cancel
                                          </button>
                                        </div>
                                      </div>
                                    )}

                                    {/* Show revision history */}
                                    {revisions[idx] && revisions[idx].length > 0 && (
                                      <div className="mt-4 space-y-2">
                                        <h5 className="font-semibold text-xs text-slate-700 dark:text-slate-300">
                                          📊 Revision History:
                                        </h5>
                                        {revisions[idx].map((rev: any, revIdx: number) => (
                                          <div key={revIdx} className="p-3 rounded-lg bg-white/60 dark:bg-slate-900/60 border border-emerald-200/50 dark:border-emerald-800/50">
                                            <div className="flex items-center justify-between mb-1">
                                              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                                                Revision #{rev.revisionNumber}
                                              </span>
                                              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                                                {rev.score}/100
                                              </span>
                                            </div>
                                            <div className="grid grid-cols-4 gap-1 mb-2">
                                              <div className="text-center">
                                                <span className="text-[9px] text-slate-400 block">Accuracy</span>
                                                <span className="text-[10px] font-semibold text-slate-700 dark:text-slate-300">{rev.accuracyScore}%</span>
                                              </div>
                                              <div className="text-center">
                                                <span className="text-[9px] text-slate-400 block">Complete</span>
                                                <span className="text-[10px] font-semibold text-slate-700 dark:text-slate-300">{rev.completenessScore}%</span>
                                              </div>
                                              <div className="text-center">
                                                <span className="text-[9px] text-slate-400 block">Clarity</span>
                                                <span className="text-[10px] font-semibold text-slate-700 dark:text-slate-300">{rev.clarityScore}%</span>
                                              </div>
                                              <div className="text-center">
                                                <span className="text-[9px] text-slate-400 block">Relevance</span>
                                                <span className="text-[10px] font-semibold text-slate-700 dark:text-slate-300">{rev.relevanceScore}%</span>
                                              </div>
                                            </div>
                                            <p className="text-[10px] text-slate-600 dark:text-slate-400 italic">
                                              {rev.feedback}
                                            </p>
                                            <details className="mt-2">
                                              <summary className="text-[10px] text-indigo-600 dark:text-indigo-400 cursor-pointer hover:underline">
                                                View revised answer
                                              </summary>
                                              <p className="mt-2 text-[10px] text-slate-700 dark:text-slate-300 pl-3 border-l-2 border-emerald-300 dark:border-emerald-700">
                                                {rev.revisedText}
                                              </p>
                                            </details>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
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
