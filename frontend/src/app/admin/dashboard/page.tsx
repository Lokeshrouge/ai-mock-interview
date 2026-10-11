'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import {
  Users,
  Award,
  FileText,
  CheckCircle2,
  Shield,
  RefreshCw,
  BarChart2,
  AlertTriangle,
  Clock,
  ArrowRight,
  Settings,
  Briefcase,
  ToggleLeft,
  ToggleRight,
  Sliders,
} from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  totalUsers: number;
  totalInterviews: number;
  completedInterviews: number;
  totalResumes: number;
  averageScore: number;
  recentActivity: Array<{
    id: string;
    userEmail: string;
    jobRole: string;
    type: string;
    status: string;
    overallScore: number | null;
    createdAt: string;
  }>;
}

interface UserRecord {
  id: string;
  email: string;
  role: string;
  isActive: boolean;
  firstName: string;
  lastName: string;
  createdAt: string;
}

interface SystemSettings {
  appName: string;
  version: string;
  aiProvider: string;
  aiServiceUrl: string;
  maxResumeSizeBytes: number;
  allowedResumeExtensions: string[];
  minAnswerLengthChars: number;
  questionLimits: { min: number; max: number; default: number };
  rubricWeights: {
    technicalAccuracy: number;
    completeness: number;
    clarity: number;
    relevance: number;
  };
}

interface JobRole {
  id: string;
  title: string;
  category: string;
  description: string;
  requiredSkills: string[];
}

export default function AdminDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [jobRoles, setJobRoles] = useState<JobRole[]>([]);
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [totalUsers, setTotalUsers] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'roles' | 'settings'>('overview');

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
      } else if (user.role !== 'ADMIN') {
        setError('Access restricted. Admin authorization is required to view this portal.');
      } else {
        loadData();
      }
    }
  }, [user, authLoading, page]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsRes, usersRes, rolesRes, settingsRes] = await Promise.all([
        api.get('/admin/dashboard/stats'),
        api.get(`/admin/users?page=${page}&limit=10`),
        api.get('/job-roles'),
        api.get('/admin/settings'),
      ]);

      setStats(statsRes.data?.data || statsRes.data);
      const userData = usersRes.data?.data || usersRes.data;
      setUsers(userData?.users || []);
      setTotalUsers(userData?.total || 0);
      setJobRoles(rolesRes.data?.data || rolesRes.data || []);
      setSettings(settingsRes.data?.data || settingsRes.data || null);
    } catch (err: any) {
      console.error('Failed to load admin telemetry', err);
      setError(err?.response?.data?.message || 'Failed to retrieve admin system metrics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleToggleUserStatus = async (userId: string) => {
    try {
      setTogglingId(userId);
      await api.patch(`/admin/users/${userId}/toggle-status`);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, isActive: !u.isActive } : u)),
      );
    } catch (err: any) {
      console.error('Failed to toggle user status', err);
      alert(err?.response?.data?.message || 'Failed to toggle account status');
    } finally {
      setTogglingId(null);
    }
  };

  if (authLoading || (loading && !stats)) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-950">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
          <p className="font-medium text-sm">Loading administrative dashboard...</p>
        </div>
      </div>
    );
  }

  if (error && user?.role !== 'ADMIN') {
    return (
      <div className="flex-1 flex items-center justify-center p-4 bg-slate-950">
        <div className="max-w-xl w-full p-8 bg-slate-900 border border-rose-900/60 rounded-3xl shadow-xl text-center space-y-4">
          <div className="w-14 h-14 bg-rose-950/60 text-rose-400 border border-rose-800 rounded-2xl flex items-center justify-center mx-auto">
            <Shield className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-white">Access Denied</h2>
          <p className="text-slate-400 text-sm leading-relaxed">{error}</p>
          <Link
            href="/dashboard"
            className="inline-flex items-center px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium text-sm transition shadow-lg shadow-indigo-600/25"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full bg-slate-950 selection:bg-indigo-500 selection:text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-950/60 text-purple-400 border border-purple-800/80 uppercase tracking-wide">
                Admin Portal
              </span>
              <span className="text-xs text-slate-500">• Operations & Telemetry</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Administrative Telemetry & Control
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Real-time analytics, candidate management, job-role catalog, and system settings.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-4 py-2 border border-slate-700 rounded-xl text-sm font-medium text-slate-200 bg-slate-900 hover:bg-slate-800 transition shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-indigo-400' : ''}`} />
              <span>Refresh Data</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              activeTab === 'overview'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            Telemetry & Activity
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              activeTab === 'users'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            Candidates ({totalUsers})
          </button>
          <button
            onClick={() => setActiveTab('roles')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              activeTab === 'roles'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            Job Roles ({jobRoles.length})
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              activeTab === 'settings'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            System Settings
          </button>
        </div>

        {/* Tab 1: Overview & Metrics */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Metrics Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
              <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Total Users</span>
                  <div className="w-9 h-9 rounded-xl bg-indigo-950/60 text-indigo-400 border border-indigo-800/40 flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{stats?.totalUsers ?? 0}</div>
                  <div className="text-xs text-slate-400 mt-1">Registered accounts</div>
                </div>
              </div>

              <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Interviews</span>
                  <div className="w-9 h-9 rounded-xl bg-indigo-950/60 text-indigo-400 border border-indigo-800/40 flex items-center justify-center">
                    <BarChart2 className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{stats?.totalInterviews ?? 0}</div>
                  <div className="text-xs text-slate-400 mt-1">Total sessions</div>
                </div>
              </div>

              <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Completed</span>
                  <div className="w-9 h-9 rounded-xl bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{stats?.completedInterviews ?? 0}</div>
                  <div className="text-xs text-slate-400 mt-1">Evaluated sessions</div>
                </div>
              </div>

              <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Resumes</span>
                  <div className="w-9 h-9 rounded-xl bg-amber-950/60 text-amber-400 border border-amber-800/40 flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{stats?.totalResumes ?? 0}</div>
                  <div className="text-xs text-slate-400 mt-1">Uploaded & analyzed</div>
                </div>
              </div>

              <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Average Score</span>
                  <div className="w-9 h-9 rounded-xl bg-purple-950/60 text-purple-400 border border-purple-800/40 flex items-center justify-center">
                    <Award className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">
                    {stats?.averageScore ? `${stats.averageScore}%` : 'N/A'}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">Overall candidate mean</div>
                </div>
              </div>
            </div>

            {/* Recent Activity List */}
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-400" />
                Recent Candidate Interview Activity
              </h2>

              <div className="divide-y divide-slate-800">
                {stats?.recentActivity && stats.recentActivity.length > 0 ? (
                  stats.recentActivity.map((activity) => (
                    <div key={activity.id} className="py-3 flex items-center justify-between text-sm">
                      <div>
                        <div className="font-semibold text-white">{activity.userEmail}</div>
                        <div className="text-xs text-slate-400">
                          {activity.jobRole} • {activity.type}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
                            activity.status === 'EVALUATED' || activity.status === 'COMPLETED'
                              ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                              : activity.status === 'IN_PROGRESS'
                              ? 'bg-indigo-950/60 text-indigo-300 border-indigo-800'
                              : 'bg-amber-950/60 text-amber-300 border-amber-800'
                          }`}
                        >
                          {activity.status}
                        </span>
                        <span className="font-bold text-sm text-slate-200 min-w-[50px] text-right">
                          {activity.overallScore !== null ? `${activity.overallScore}%` : '—'}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500 py-4 text-center">No recent activity recorded.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: User Directory & Status Management */}
        {activeTab === 'users' && (
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-400" />
                Candidate Directory & Access Control
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950/70 text-xs font-semibold text-slate-400 uppercase">
                  <tr>
                    <th className="px-4 py-3 rounded-l-lg">User / Email</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Registered</th>
                    <th className="px-4 py-3 rounded-r-lg text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-800/50 transition">
                      <td className="px-4 py-3.5">
                        <div className="font-medium text-white">
                          {u.firstName || u.lastName ? `${u.firstName} ${u.lastName}`.trim() : 'Candidate'}
                        </div>
                        <div className="text-xs text-slate-400">{u.email}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-semibold border ${
                            u.role === 'ADMIN'
                              ? 'bg-purple-950/60 text-purple-300 border-purple-800'
                              : 'bg-slate-800 text-slate-300 border-slate-700'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                            u.isActive ? 'text-emerald-400' : 'text-slate-500'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${u.isActive ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                          {u.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-slate-400">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        {u.role !== 'ADMIN' && (
                          <button
                            onClick={() => handleToggleUserStatus(u.id)}
                            disabled={togglingId === u.id}
                            className={`px-3 py-1 text-xs font-medium rounded-lg border transition ${
                              u.isActive
                                ? 'border-rose-800/80 text-rose-400 hover:bg-rose-950/50'
                                : 'border-emerald-800/80 text-emerald-400 hover:bg-emerald-950/50'
                            } disabled:opacity-50`}
                          >
                            {togglingId === u.id ? 'Updating...' : u.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalUsers > 10 && (
              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 border border-slate-700 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800 disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="text-xs text-slate-400">
                  Page {page} of {Math.ceil(totalUsers / 10)}
                </span>
                <button
                  onClick={() => setPage((p) => (p * 10 < totalUsers ? p + 1 : p))}
                  disabled={page * 10 >= totalUsers}
                  className="px-3 py-1.5 border border-slate-700 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Job Roles Catalog */}
        {activeTab === 'roles' && (
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-indigo-400" />
                Configured Job Roles Catalog ({jobRoles.length})
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {jobRoles.map((role) => (
                <div key={role.id} className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-white text-sm">{role.title}</h3>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-950/60 text-indigo-300 border border-indigo-800 font-medium">
                      {role.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2">{role.description}</p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {role.requiredSkills?.map((skill, idx) => (
                      <span key={idx} className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/60">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: System Settings */}
        {activeTab === 'settings' && settings && (
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Settings className="w-4 h-4 text-indigo-400" />
                System Architecture & Configuration
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Service Parameters</h3>
                <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2.5 text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Application Name:</span>
                    <span className="font-semibold text-white">{settings.appName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Build Version:</span>
                    <span className="font-semibold text-white">{settings.version}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">AI Provider:</span>
                    <span className="font-semibold uppercase text-indigo-400">{settings.aiProvider}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">AI Microservice URL:</span>
                    <span className="font-mono text-[11px] text-slate-200">{settings.aiServiceUrl}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Scoring Rubric Weights</h3>
                <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2.5 text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Technical Accuracy:</span>
                    <span className="font-bold text-indigo-400">{settings.rubricWeights.technicalAccuracy * 100}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Completeness:</span>
                    <span className="font-bold text-indigo-400">{settings.rubricWeights.completeness * 100}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Clarity:</span>
                    <span className="font-bold text-indigo-400">{settings.rubricWeights.clarity * 100}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Relevance:</span>
                    <span className="font-bold text-indigo-400">{settings.rubricWeights.relevance * 100}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
