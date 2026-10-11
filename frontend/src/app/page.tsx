import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  Award,
  FileText,
  Cpu,
  CheckCircle2,
  BarChart2,
  Zap,
} from 'lucide-react';

export default function HomePage() {
  const roles = [
    'Fullstack Developer',
    'Frontend Engineer',
    'Backend Engineer',
    'AI / Machine Learning Engineer',
    'DevOps & Cloud Engineer',
    'Data Scientist',
    'Mobile Application Developer',
    'Cybersecurity Analyst',
  ];

  return (
    <div className="flex-1 w-full bg-slate-950 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-blue-700 text-white text-xs py-2 px-4 text-center font-medium shadow-sm">
        <span className="inline-flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>B.Sc. Computer Science Final Year Demonstration — Production-Grade AI Interview Platform</span>
        </span>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-24 md:pt-24 md:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 shadow-sm">
            <Zap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Intelligent Mock Interview & Performance Evaluation</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.15]">
            Ace Your Next Tech Interview with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600">
              Adaptive AI Coaching
            </span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Practice role-specific mock interviews tailored to your resume background. Receive instant, multi-dimensional rubric scoring, actionable weakness analysis, and targeted study roadmaps.
          </p>

          {/* Primary Action Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-xl shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 group"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-sm border border-slate-200 dark:border-slate-800 transition-all shadow-sm flex items-center justify-center"
            >
              <span>Candidate Sign In</span>
            </Link>
          </div>

          {/* Key Value Pill Indicators */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Resume-Grounded Questions</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Standardized 4-Factor Rubric</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>100% Offline Resilient Fallback</span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="py-16 bg-white dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Enterprise-Grade Interview Preparation
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Designed from the ground up for computer science candidates preparing for top tech companies.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 hover:border-indigo-300 dark:hover:border-indigo-700 transition">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Adaptive AI Questioning
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Dynamically progresses through technical rounds, taking into account candidate responses and previous questions to dive deeper into system nuances.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 hover:border-violet-300 dark:hover:border-violet-700 transition">
              <div className="w-12 h-12 rounded-2xl bg-violet-100 dark:bg-violet-950/60 text-violet-600 flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Resume Context Extraction
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Securely parses PDF and DOCX resumes, extracting competencies, frameworks, and project histories with strict prompt-injection protection.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 hover:border-emerald-300 dark:hover:border-emerald-700 transition">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Deterministic Rubric Scoring
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Calculates transparent scores across Technical Accuracy (35%), Completeness (30%), Clarity (20%), and Relevance (15%) in backend application code.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 hover:border-blue-300 dark:hover:border-blue-700 transition">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
                <BarChart2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Actionable Telemetry & Reports
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Provides granular question-by-question feedback, highlights candidate blind spots, and suggests curated documentation and practice guides.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-16">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Workflow Architecture
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            How The Mock Interview System Works
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
          <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <span className="text-2xl font-black text-indigo-600">01</span>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Setup Profile</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Register an account, specify your target engineering role, and upload your resume for automatic skills extraction.
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <span className="text-2xl font-black text-indigo-600">02</span>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Configure Round</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Select difficulty level (Easy, Medium, Hard), interview type (Technical, HR, Project), and question count (5–20).
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <span className="text-2xl font-black text-indigo-600">03</span>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Interactive Session</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Answer tailored questions with live timer tracking, draft auto-preservation, and instantaneous backend advancement.
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <span className="text-2xl font-black text-indigo-600">04</span>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Mastery Report</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Review your overall readiness score, read feedback on every individual answer, and follow structured improvement recommendations.
            </p>
          </div>
        </div>
      </section>

      {/* Supported Roles Banner */}
      <section className="py-12 bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-6 text-center">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Trained for 8+ Modern Engineering Specializations
          </h3>
          <div className="flex flex-wrap items-center justify-center gap-2.5 max-w-4xl mx-auto">
            {roles.map((role, idx) => (
              <span
                key={idx}
                className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-sm"
              >
                {role}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full text-center space-y-6">
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-700 rounded-3xl p-10 md:p-14 text-white shadow-2xl shadow-indigo-600/20 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Start Practicing Your Next Interview Today
          </h2>
          <p className="text-indigo-100 text-sm sm:text-base max-w-xl mx-auto">
            Take unlimited practice rounds, track your progress over time, and build confidence before your real-world hiring loops.
          </p>
          <div className="pt-2">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-white text-indigo-700 font-bold text-sm hover:bg-indigo-50 transition shadow-lg"
            >
              <span>Create Your Free Account</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400 space-y-1">
        <p>AI-Powered Mock Interview & Candidate Performance Evaluation System</p>
        <p>B.Sc. Computer Science Final Year Project • Next.js 14, NestJS 10, FastAPI & SQLite</p>
      </footer>
    </div>
  );
}
