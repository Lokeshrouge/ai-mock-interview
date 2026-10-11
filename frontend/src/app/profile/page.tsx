'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import {
  User,
  GraduationCap,
  Briefcase,
  Code,
  CheckCircle2,
  AlertCircle,
  Save,
  X,
  Edit3,
  Loader2,
  Plus,
  Trash2,
} from 'lucide-react';

interface Education {
  college?: string;
  degree?: string;
  department?: string;
  graduationYear?: number;
}

interface ProfileData {
  id?: string;
  userId?: string;
  email?: string;
  firstName: string;
  lastName: string;
  phone?: string;
  targetRole?: string;
  experienceLevel?: string;
  careerInterests?: string[];
  education?: Education;
  technicalSkills?: string[];
  programmingLanguages?: string[];
  toolsTechnologies?: string[];
  bio?: string;
  linkedinUrl?: string;
  githubUrl?: string;
}

interface CompletionInfo {
  percentage: number;
  breakdown: {
    basicInfo: boolean;
    education: boolean;
    careerGoal: boolean;
    skills: boolean;
    resume: boolean;
  };
  missingSections: string[];
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [formData, setFormData] = useState<ProfileData | null>(null);
  const [completion, setCompletion] = useState<CompletionInfo | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // New tag inputs
  const [newSkill, setNewSkill] = useState('');
  const [newLang, setNewLang] = useState('');
  const [newTool, setNewTool] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('/profile');
      const data = res.data.data;
      setProfile(data.profile);
      setFormData(data.profile);
      setCompletion(data.completion);
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.response?.data?.message || 'Failed to load profile. Please make sure you are logged in.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    try {
      setSaving(true);
      setNotification(null);
      const res = await api.put('/profile', formData);
      const updated = res.data.data;
      setProfile(updated.profile);
      setFormData(updated.profile);
      setCompletion(updated.completion);
      setIsEditing(false);
      setNotification({
        type: 'success',
        message: 'Profile updated successfully!',
      });
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.response?.data?.message || 'Failed to update profile.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(profile);
    setIsEditing(false);
    setNotification(null);
  };

  const addTag = (
    field: 'technicalSkills' | 'programmingLanguages' | 'toolsTechnologies',
    value: string,
    setter: (val: string) => void,
  ) => {
    if (!value.trim() || !formData) return;
    const current = formData[field] || [];
    if (!current.includes(value.trim())) {
      setFormData({
        ...formData,
        [field]: [...current, value.trim()],
      });
    }
    setter('');
  };

  const removeTag = (
    field: 'technicalSkills' | 'programmingLanguages' | 'toolsTechnologies',
    index: number,
  ) => {
    if (!formData) return;
    const current = [...(formData[field] || [])];
    current.splice(index, 1);
    setFormData({
      ...formData,
      [field]: current,
    });
  };

  if (loading) {
    return (
      <div className="flex-1 w-full flex items-center justify-center p-8 bg-slate-950">
        <div className="flex items-center space-x-3 text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
          <span>Loading student profile...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full bg-slate-950">
      <main className="max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Alerts */}
        {notification && (
          <div
            className={`p-4 rounded-xl flex items-center justify-between text-sm ${
              notification.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                : 'bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              {notification.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
              )}
              <span>{notification.message}</span>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="p-1 hover:opacity-75"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Profile Header & Completion Score */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-600 text-white flex items-center justify-center font-bold text-2xl shadow-lg shadow-indigo-500/20">
              {profile?.firstName?.[0] || 'S'}
              {profile?.lastName?.[0] || 'P'}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                {profile?.firstName} {profile?.lastName}
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {profile?.email} • {profile?.targetRole || 'Candidate'}
              </p>
            </div>
          </div>

          {/* Profile Completion Meter */}
          {completion && (
            <div className="w-full md:w-80 bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Profile Completion
                </span>
                <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                  {completion.percentage}%
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500"
                  style={{ width: `${completion.percentage}%` }}
                />
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
                <span className={completion.breakdown.basicInfo ? 'text-emerald-600 font-medium' : 'text-slate-400'}>
                  {completion.breakdown.basicInfo ? '✓ Basic' : '○ Basic'}
                </span>
                <span className={completion.breakdown.education ? 'text-emerald-600 font-medium' : 'text-slate-400'}>
                  {completion.breakdown.education ? '✓ Education' : '○ Education'}
                </span>
                <span className={completion.breakdown.careerGoal ? 'text-emerald-600 font-medium' : 'text-slate-400'}>
                  {completion.breakdown.careerGoal ? '✓ Career' : '○ Career'}
                </span>
                <span className={completion.breakdown.skills ? 'text-emerald-600 font-medium' : 'text-slate-400'}>
                  {completion.breakdown.skills ? '✓ Skills' : '○ Skills'}
                </span>
                <span className={completion.breakdown.resume ? 'text-emerald-600 font-medium' : 'text-slate-400'}>
                  {completion.breakdown.resume ? '✓ Resume' : '○ Resume'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Profile Details & Form */}
        <form onSubmit={handleSave} className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Student Information
            </h2>
            <div className="flex items-center space-x-3">
              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition-all shadow-sm"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex items-center space-x-2 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-sm transition-colors"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center space-x-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition-all shadow-sm disabled:opacity-50"
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. Basic Information */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
                <User className="w-5 h-5 text-indigo-500" />
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  Basic Information
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">
                    First Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData?.firstName || ''}
                      onChange={(e) =>
                        setFormData({ ...formData!, firstName: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  ) : (
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {profile?.firstName || '—'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">
                    Last Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData?.lastName || ''}
                      onChange={(e) =>
                        setFormData({ ...formData!, lastName: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  ) : (
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {profile?.lastName || '—'}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Email Address
                </label>
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  {profile?.email || '—'}
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData?.phone || ''}
                    placeholder="+1 555-0199"
                    onChange={(e) =>
                      setFormData({ ...formData!, phone: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                ) : (
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {profile?.phone || 'Not provided'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Bio / Summary
                </label>
                {isEditing ? (
                  <textarea
                    rows={2}
                    value={formData?.bio || ''}
                    onChange={(e) =>
                      setFormData({ ...formData!, bio: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                ) : (
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {profile?.bio || 'No bio provided.'}
                  </p>
                )}
              </div>
            </div>

            {/* 2. Education */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
                <GraduationCap className="w-5 h-5 text-indigo-500" />
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  Education
                </h3>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  College / University
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData?.education?.college || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData!,
                        education: {
                          ...formData?.education,
                          college: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                ) : (
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {profile?.education?.college || 'Not provided'}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">
                    Degree
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      placeholder="e.g. B.Sc."
                      value={formData?.education?.degree || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData!,
                          education: {
                            ...formData?.education,
                            degree: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  ) : (
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {profile?.education?.degree || '—'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">
                    Graduation Year
                  </label>
                  {isEditing ? (
                    <input
                      type="number"
                      placeholder="2025"
                      value={formData?.education?.graduationYear || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData!,
                          education: {
                            ...formData?.education,
                            graduationYear: parseInt(e.target.value) || undefined,
                          },
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  ) : (
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {profile?.education?.graduationYear || '—'}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Department / Major
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    placeholder="e.g. Computer Science"
                    value={formData?.education?.department || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData!,
                        education: {
                          ...formData?.education,
                          department: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                ) : (
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {profile?.education?.department || 'Not provided'}
                  </p>
                )}
              </div>
            </div>

            {/* 3. Career Goals */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
                <Briefcase className="w-5 h-5 text-indigo-500" />
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  Career Goals
                </h3>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Target Job Role
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    placeholder="e.g. Full Stack Developer, Frontend Engineer"
                    value={formData?.targetRole || ''}
                    onChange={(e) =>
                      setFormData({ ...formData!, targetRole: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                ) : (
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {profile?.targetRole || 'Not specified'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Experience Level
                </label>
                {isEditing ? (
                  <select
                    value={formData?.experienceLevel || ''}
                    onChange={(e) =>
                      setFormData({ ...formData!, experienceLevel: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="">Select level...</option>
                    <option value="Student / Fresher">Student / Fresher</option>
                    <option value="Entry Level (0-1 yr)">Entry Level (0-1 yr)</option>
                    <option value="Junior (1-3 yrs)">Junior (1-3 yrs)</option>
                    <option value="Mid Level (3-5 yrs)">Mid Level (3-5 yrs)</option>
                    <option value="Senior (5+ yrs)">Senior (5+ yrs)</option>
                  </select>
                ) : (
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {profile?.experienceLevel || 'Not specified'}
                  </p>
                )}
              </div>
            </div>

            {/* 4. Skills & Technologies */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
                <Code className="w-5 h-5 text-indigo-500" />
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  Skills & Technologies
                </h3>
              </div>

              {/* Technical Skills */}
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Technical Skills
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {(formData?.technicalSkills || []).map((skill, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                    >
                      <span>{skill}</span>
                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => removeTag('technicalSkills', idx)}
                          className="hover:text-rose-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </span>
                  ))}
                </div>
                {isEditing && (
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder="Add technical skill..."
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTag('technicalSkills', newSkill, setNewSkill);
                        }
                      }}
                      className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-xs outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => addTag('technicalSkills', newSkill, setNewSkill)}
                      className="p-1.5 rounded-lg bg-indigo-600 text-white"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Programming Languages */}
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Programming Languages
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {(formData?.programmingLanguages || []).map((lang, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-medium bg-violet-50 text-violet-700 dark:bg-violet-950/70 dark:text-violet-300 border border-violet-200 dark:border-violet-800"
                    >
                      <span>{lang}</span>
                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => removeTag('programmingLanguages', idx)}
                          className="hover:text-rose-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </span>
                  ))}
                </div>
                {isEditing && (
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder="Add language (e.g. TypeScript)..."
                      value={newLang}
                      onChange={(e) => setNewLang(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTag('programmingLanguages', newLang, setNewLang);
                        }
                      }}
                      className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-xs outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => addTag('programmingLanguages', newLang, setNewLang)}
                      className="p-1.5 rounded-lg bg-violet-600 text-white"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
