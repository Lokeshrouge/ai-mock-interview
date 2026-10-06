import React from 'react';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col justify-between p-6 md:p-16 max-w-7xl mx-auto">
      {/* Navigation header */}
      <header className="flex items-center justify-between py-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-500/20">
            AI
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">
            MockInterview<span className="text-indigo-500">.ai</span>
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            ● Phase 2 Active
          </span>
        </div>
      </header>

      {/* Hero section */}
      <section className="py-16 md:py-24 text-center space-y-6">
        <div className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/80 mb-2">
          🚀 B.Sc. Computer Science Final Year Project
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-tight">
          Master Your Tech Interviews with <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-violet-600">Adaptive AI Intelligence</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-normal">
          Personalized questions based on your resume, automated real-time evaluation, and comprehensive actionable feedback to elevate your career.
        </p>
        
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#architecture"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-lg shadow-indigo-600/30 transition-all text-center"
          >
            Explore System Architecture
          </a>
          <a
            href="#services"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold border border-slate-300 dark:border-slate-700 transition-all text-center"
          >
            Service Endpoints
          </a>
        </div>
      </section>

      {/* 3-Tier Architecture Feature Grid */}
      <section id="services" className="grid grid-cols-1 md:grid-cols-3 gap-6 my-12">
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold text-lg mb-4">
            01
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Next.js Frontend</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            Next.js 14 App Router client interface with candidate dashboard, interactive interview rooms, and analytics.
          </p>
          <div className="text-xs font-mono text-indigo-500 dark:text-indigo-400">
            Port: 3000
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-lg bg-violet-500/10 text-violet-500 flex items-center justify-center font-bold text-lg mb-4">
            02
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">NestJS Backend</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            Robust orchestrator with TypeORM, PostgreSQL, JWT auth, state-machine interview lifecycle, and API controllers.
          </p>
          <div className="text-xs font-mono text-violet-500 dark:text-violet-400">
            Port: 3001
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-lg mb-4">
            03
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">FastAPI AI Engine</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            Stateless microservice parsing resumes, invoking LLMs for dynamic question generation and comprehensive answer scoring.
          </p>
          <div className="text-xs font-mono text-emerald-500 dark:text-emerald-400">
            Port: 8000
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-200 dark:border-slate-800 text-center text-sm text-slate-500 dark:text-slate-400">
        AI-Powered Mock Interview & Evaluation System • Phase 2 Implementation Underway
      </footer>
    </main>
  );
}
