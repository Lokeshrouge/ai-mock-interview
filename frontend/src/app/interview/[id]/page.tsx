'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import api from '@/lib/api';
import {
  Clock,
  Sparkles,
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  LogOut,
  HelpCircle,
  Award,
} from 'lucide-react';

interface QuestionData {
  id: string;
  questionNumber: number;
  questionText: string;
  questionCategory?: string;
  expectedPoints?: string[];
}

export default function InterviewRoomPage() {
  const params = useParams();
  const router = useRouter();
  const interviewId = params.id as string;

  const [interview, setInterview] = useState<any>(null);
  const [activeQuestion, setActiveQuestion] = useState<QuestionData | null>(null);
  const [answerText, setAnswerText] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [isFinished, setIsFinished] = useState(false);

  // Question timer
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadInterviewRoom();
  }, [interviewId]);

  useEffect(() => {
    // Reset timer per question
    setElapsedSeconds(0);
    if (timerRef.current) clearInterval(timerRef.current);

    if (!isFinished && activeQuestion) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeQuestion?.id, isFinished]);

  const loadInterviewRoom = async () => {
    try {
      setLoading(true);
      setError(null);

      // Start / recover interview session
      const res = await api.post(`/interviews/${interviewId}/start`);
      const data = res.data.data;

      setInterview(data.interview);
      if (data.currentQuestion) {
        setActiveQuestion(data.currentQuestion);
      } else if (data.interview.status === 'COMPLETED') {
        setIsFinished(true);
      }
    } catch (err: any) {
      // If start failed, try plain findOne
      try {
        const fallbackRes = await api.get(`/interviews/${interviewId}`);
        const fallbackData = fallbackRes.data.data;
        setInterview(fallbackData);
        if (fallbackData.activeQuestion) {
          setActiveQuestion(fallbackData.activeQuestion);
        } else if (fallbackData.status === 'COMPLETED') {
          setIsFinished(true);
        }
      } catch (fErr: any) {
        setError(fErr.response?.data?.message || 'Failed to load interview session.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeQuestion) return;

    if (answerText.trim().length < 50) {
      setError('Please provide a more comprehensive response (minimum 50 characters).');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const res = await api.post(`/interviews/${interviewId}/answers`, {
        questionId: activeQuestion.id,
        answerText: answerText.trim(),
        timeTakenSeconds: elapsedSeconds,
      });

      const data = res.data.data;
      setAnswerText('');

      if (data.isFinished) {
        setIsFinished(true);
        setActiveQuestion(null);
        setNotification('Mock interview complete! Your answers have been recorded for evaluation.');
      } else if (data.nextQuestion) {
        setActiveQuestion(data.nextQuestion);
        setInterview((prev: any) => ({
          ...prev,
          answeredQuestions: (prev?.answeredQuestions || 0) + 1,
        }));
        setNotification(`Moving to Question ${data.nextQuestion.questionNumber}`);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit answer. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="flex items-center space-x-3 text-slate-500">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
            <span>Connecting to AI interview room...</span>
          </div>
        </div>
      </div>
    );
  }

  const answeredCount = interview?.answeredQuestions || 0;
  const totalCount = interview?.totalQuestions || 10;
  const progressPercent = Math.min(100, Math.round((answeredCount / totalCount) * 100));

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Top Header & Session Bar */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg text-slate-900 dark:text-white">
                {interview?.jobRole?.title || interview?.jobRole || 'Technical Interview'}
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-semibold uppercase">
                {interview?.interviewType}
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-semibold uppercase">
                {interview?.difficulty}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Interactive Mock Session • Dynamic AI Question Progression
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-mono text-slate-700 dark:text-slate-300">
              <Clock className="w-3.5 h-3.5 text-indigo-500" />
              <span>{formatTimer(elapsedSeconds)}</span>
            </div>
            <Link
              href="/dashboard"
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center space-x-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Exit</span>
            </Link>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
            <span>
              Question {activeQuestion ? activeQuestion.questionNumber : totalCount} of {totalCount}
            </span>
            <span className="text-indigo-600 dark:text-indigo-400 font-bold">
              {progressPercent}% Completed
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-violet-600 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-sm flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {notification && (
          <div className="p-4 rounded-xl bg-indigo-50 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-sm flex items-center space-x-2">
            <Sparkles className="w-5 h-5 flex-shrink-0 text-indigo-600" />
            <span>{notification}</span>
          </div>
        )}

        {/* Interview Completed View */}
        {isFinished ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 border border-slate-200 dark:border-slate-800 text-center space-y-6 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mx-auto shadow-md shadow-emerald-500/10">
              <Award className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                Mock Interview Finished! 🎉
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto">
                You have successfully completed all {totalCount} questions. Your answers have been evaluated with our multi-dimensional rubric and your comprehensive performance report is ready!
              </p>
            </div>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href={`/interview/${interviewId}/report`}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-600/25 flex items-center justify-center space-x-2"
              >
                <span>View Performance Report</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/dashboard"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-sm transition-colors"
              >
                Return to Dashboard
              </Link>
            </div>
          </div>
        ) : (
          /* Active Question & Answer Form */
          <div className="space-y-6">
            {/* Question Card */}
            {activeQuestion && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                    {activeQuestion.questionCategory || 'Technical Core'}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    Question #{activeQuestion.questionNumber}
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-relaxed">
                  {activeQuestion.questionText}
                </h2>

                {activeQuestion.expectedPoints && activeQuestion.expectedPoints.length > 0 && (
                  <div className="pt-2">
                    <span className="text-xs text-slate-400 block mb-1">
                      Key discussion topics to address in your response:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {activeQuestion.expectedPoints.map((pt, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                        >
                          • {pt}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Answer Input Box */}
            <form onSubmit={handleSubmitAnswer} className="space-y-4">
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Your Response
                  </label>
                  <span
                    className={
                      answerText.length >= 50
                        ? 'text-emerald-600 font-medium'
                        : 'text-amber-600'
                    }
                  >
                    {answerText.length} characters (min. 50 required)
                  </span>
                </div>

                <textarea
                  rows={8}
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                  placeholder="Type your detailed, structured answer here. Elaborate on your technical approach, trade-offs, and practical experiences..."
                  className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-900 leading-relaxed"
                />

                <div className="flex items-center justify-between pt-2">
                  <p className="text-xs text-slate-400">
                    Press Submit to save your answer and dynamically generate the next question.
                  </p>

                  <button
                    type="submit"
                    disabled={submitting || answerText.trim().length < 50}
                    className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-600/20 transition-all flex items-center space-x-2 disabled:opacity-50"
                  >
                    {submitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    <span>{submitting ? 'Evaluating & Advancing...' : 'Submit Answer'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
