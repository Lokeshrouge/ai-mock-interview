'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import api from '@/lib/api';
import {
  Briefcase,
  Layers,
  Gauge,
  HelpCircle,
  Play,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileText,
  Search,
} from 'lucide-react';

interface JobRole {
  id: string;
  title: string;
  category: string;
  description: string;
  requiredSkills: string[];
}

export default function InterviewSetupPage() {
  const router = useRouter();

  // Roles & Resumes State
  const [jobRoles, setJobRoles] = useState<JobRole[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [activeResume, setActiveResume] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Configuration State
  const [interviewType, setInterviewType] = useState<'HR' | 'TECHNICAL' | 'PROJECT'>('TECHNICAL');
  const [difficulty, setDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('MEDIUM');
  const [questionCount, setQuestionCount] = useState<number>(10);

  useEffect(() => {
    fetchPrerequisites();
  }, []);

  const fetchPrerequisites = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch job roles
      const rolesRes = await api.get('/job-roles');
      const roles = rolesRes.data.data || [];
      setJobRoles(roles);
      if (roles.length > 0) {
        setSelectedRole(roles[0].id);
      }

      // Fetch active resume
      const profileRes = await api.get('/profile');
      if (profileRes.data.data?.hasActiveResume) {
        setActiveResume({
          id: profileRes.data.data.activeResumeId,
        });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load interview setup data.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartInterview = async () => {
    if (!selectedRole) {
      setError('Please select a target job role');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      // 1. Create Interview
      const createRes = await api.post('/interviews', {
        jobRoleId: selectedRole,
        resumeId: activeResume?.id || undefined,
        interviewType,
        difficulty,
        questionCount,
      });

      const interviewId = createRes.data.data.id;

      // 2. Start Interview (generates Question #1)
      await api.post(`/interviews/${interviewId}/start`);

      // 3. Navigate to Interview Room
      router.push(`/interview/${interviewId}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to start interview session.');
      setSubmitting(false);
    }
  };

  const filteredRoles = jobRoles.filter((r) =>
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.category.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const selectedRoleObj = jobRoles.find((r) => r.id === selectedRole);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="flex items-center space-x-3 text-slate-500">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
            <span>Loading interview configurations...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Configure Mock Interview
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Customize your interview parameters. The AI adapts questioning based on your resume and selected difficulty.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-sm flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Configuration Controls (Left 2 cols) */}
          <div className="lg:col-span-2 space-y-8">
            {/* 1. Job Role Selection */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center space-x-2.5">
                  <Briefcase className="w-5 h-5 text-indigo-500" />
                  <h2 className="font-semibold text-slate-900 dark:text-white">
                    1. Select Target Job Role
                  </h2>
                </div>
                <div className="relative w-48">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search roles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-1">
                {filteredRoles.map((role) => {
                  const isSelected = selectedRole === role.id;
                  return (
                    <div
                      key={role.id}
                      onClick={() => setSelectedRole(role.id)}
                      className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-900 dark:text-white shadow-sm ring-1 ring-indigo-600'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-transparent text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm">{role.title}</span>
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                        {role.category}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. Interview Type */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
                <Layers className="w-5 h-5 text-indigo-500" />
                <h2 className="font-semibold text-slate-900 dark:text-white">
                  2. Choose Interview Type
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    type: 'TECHNICAL',
                    label: 'Technical',
                    desc: 'Core architecture, data structures, coding paradigms & system design.',
                  },
                  {
                    type: 'HR',
                    label: 'HR / Behavioral',
                    desc: 'Conflict resolution, leadership, situational judgment & team fit.',
                  },
                  {
                    type: 'PROJECT',
                    label: 'Project-Based',
                    desc: 'Deep-dive into your past projects, stack trade-offs & challenges.',
                  },
                ].map((item) => {
                  const isSelected = interviewType === item.type;
                  return (
                    <div
                      key={item.type}
                      onClick={() => setInterviewType(item.type as any)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-900 dark:text-white shadow-sm ring-1 ring-indigo-600'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <span className="font-bold text-sm block mb-1">{item.label}</span>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. Difficulty Level & Question Count */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Difficulty */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <Gauge className="w-5 h-5 text-indigo-500" />
                  <h2 className="font-semibold text-slate-900 dark:text-white">
                    3. Difficulty
                  </h2>
                </div>

                <div className="flex rounded-xl p-1 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                  {(['EASY', 'MEDIUM', 'HARD'] as const).map((diff) => (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => setDifficulty(diff)}
                      className={`flex-1 py-2 text-xs font-semibold rounded-lg capitalize transition-all ${
                        difficulty === diff
                          ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      {diff.toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Number of Questions */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center space-x-2.5">
                    <HelpCircle className="w-5 h-5 text-indigo-500" />
                    <h2 className="font-semibold text-slate-900 dark:text-white">
                      4. Questions Count
                    </h2>
                  </div>
                  <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                    {questionCount} Questions
                  </span>
                </div>

                <input
                  type="range"
                  min={5}
                  max={20}
                  step={1}
                  value={questionCount}
                  onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                  className="w-full accent-indigo-600"
                />
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>5 (Fast)</span>
                  <span>10 (Recommended)</span>
                  <span>20 (Deep)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Configuration Summary & Launch Card (Right col) */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm sticky top-24 space-y-6">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Interview Session Summary
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Target Role</span>
                  <span className="font-semibold text-slate-900 dark:text-white text-right">
                    {selectedRoleObj?.title || 'None Selected'}
                  </span>
                </div>

                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Interview Type</span>
                  <span className="font-semibold capitalize text-slate-900 dark:text-white">
                    {interviewType.toLowerCase()}
                  </span>
                </div>

                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Difficulty</span>
                  <span className="font-semibold capitalize text-slate-900 dark:text-white">
                    {difficulty.toLowerCase()}
                  </span>
                </div>

                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Total Questions</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {questionCount}
                  </span>
                </div>

                <div className="flex justify-between py-2">
                  <span className="text-slate-500">Resume Context</span>
                  <span className="text-xs font-semibold text-emerald-600 flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{activeResume ? 'Active Resume Attached' : 'General Profile'}</span>
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleStartInterview}
                disabled={submitting || !selectedRole}
                className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Play className="w-4 h-4 fill-white" />
                )}
                <span>{submitting ? 'Generating Question 1...' : 'Start Mock Interview'}</span>
              </button>

              <p className="text-[11px] text-slate-400 text-center leading-relaxed">
                By starting, the session enters IN_PROGRESS state and dynamically evaluates answers using AI.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
