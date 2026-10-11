'use client';

import React, { useState, useEffect, useRef } from 'react';
import api from '@/lib/api';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  RotateCw,
  Trash2,
  Download,
  Eye,
  Sparkles,
  ArrowRight,
  Loader2,
  X,
  FileCheck,
} from 'lucide-react';

interface ResumeItem {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  processingStatus: 'UPLOADED' | 'PROCESSING' | 'PROCESSED' | 'FAILED';
  analysisStatus: 'PENDING' | 'ANALYZING' | 'COMPLETED' | 'FAILED';
  extractedText?: string;
  parsedData?: {
    skills?: string[];
    programming_languages?: string[];
    tools_technologies?: string[];
    experience_level?: string;
    target_role?: string;
    education?: any[];
    projects?: any[];
  };
  errorMessage?: string;
  uploadedAt: string;
  isActive: boolean;
}

export default function ResumesPage() {
  const [resumes, setResumes] = useState<ResumeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedResumeText, setSelectedResumeText] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      setLoading(true);
      const res = await api.get('/resumes');
      setResumes(res.data.data || []);
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.response?.data?.message || 'Failed to load resumes. Ensure you are logged in.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setNotification({
        type: 'error',
        message: 'File size exceeds the 5MB limit. Please upload a smaller file.',
      });
      return;
    }

    // Validate type
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['pdf', 'docx'].includes(ext || '')) {
      setNotification({
        type: 'error',
        message: 'Unsupported format. Only PDF and DOCX files are allowed.',
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploading(true);
      setNotification(null);
      await api.post('/resumes', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setNotification({
        type: 'success',
        message: 'Resume uploaded successfully! Processing and text extraction underway.',
      });
      fetchResumes();
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.response?.data?.message || 'Resume upload failed.',
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRetry = async (id: string) => {
    try {
      setActionLoading(id);
      await api.post(`/resumes/${id}/process`);
      setNotification({
        type: 'success',
        message: 'Reprocessing triggered.',
      });
      fetchResumes();
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.response?.data?.message || 'Retry failed.',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this resume?')) return;
    try {
      setActionLoading(id);
      await api.delete(`/resumes/${id}`);
      setNotification({
        type: 'success',
        message: 'Resume deleted successfully.',
      });
      fetchResumes();
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.response?.data?.message || 'Failed to delete resume.',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleApplyToProfile = async (id: string) => {
    try {
      setActionLoading(id);
      await api.post(`/resumes/${id}/apply-profile`);
      setNotification({
        type: 'success',
        message: 'Extracted skills and technologies merged into your Student Profile!',
      });
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.response?.data?.message || 'Could not apply resume data to profile.',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDownload = async (id: string, fileName: string) => {
    try {
      const res = await api.get(`/resumes/${id}/download`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: 'Failed to download resume file.',
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getStatusBadge = (status: ResumeItem['processingStatus']) => {
    switch (status) {
      case 'PROCESSED':
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>PROCESSED</span>
          </span>
        );
      case 'PROCESSING':
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-200 dark:border-amber-800 animate-pulse">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>PROCESSING</span>
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>FAILED</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            <Clock className="w-3.5 h-3.5" />
            <span>UPLOADED</span>
          </span>
        );
    }
  };

  const activeResume = resumes.find((r) => r.isActive) || resumes[0];

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

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Resume Management
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Upload your CV (PDF or DOCX) to power AI-driven question generation and evaluation.
            </p>
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <UploadCloud className="w-4 h-4" />
            )}
            <span>{uploading ? 'Uploading...' : 'Upload New Resume'}</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="hidden"
          />
        </div>

        {/* Upload Dropzone */}
        {resumes.length === 0 && !loading && (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 rounded-3xl p-12 text-center bg-white dark:bg-slate-900 cursor-pointer transition-colors"
          >
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center mx-auto mb-4">
              <UploadCloud className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              Upload your resume to begin
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">
              Supported formats: PDF or DOCX up to 5MB. Text extraction and skill identification happen automatically.
            </p>
            <span className="inline-block px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium text-xs">
              Select Resume File
            </span>
          </div>
        )}

        {/* Active Resume Card */}
        {activeResume && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      {activeResume.fileName}
                    </h2>
                    <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 uppercase font-mono">
                      {activeResume.fileType}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {formatFileSize(activeResume.fileSize)} • Uploaded on{' '}
                    {new Date(activeResume.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {getStatusBadge(activeResume.processingStatus)}

                <button
                  onClick={() =>
                    handleDownload(activeResume.id, activeResume.fileName)
                  }
                  title="Download File"
                  className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                >
                  <Download className="w-4 h-4" />
                </button>

                {activeResume.processingStatus === 'FAILED' && (
                  <button
                    onClick={() => handleRetry(activeResume.id)}
                    disabled={actionLoading === activeResume.id}
                    title="Retry Processing"
                    className="p-2 rounded-lg bg-amber-500 text-white hover:bg-amber-600"
                  >
                    <RotateCw className="w-4 h-4" />
                  </button>
                )}

                <button
                  onClick={() => handleDelete(activeResume.id)}
                  title="Delete Resume"
                  className="p-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Error banner if failed */}
            {activeResume.errorMessage && (
              <div className="p-4 rounded-xl bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-900 text-sm">
                <span className="font-semibold">Extraction Notice: </span>
                {activeResume.errorMessage}
              </div>
            )}

            {/* AI Extracted Information Preview */}
            {activeResume.parsedData && (
              <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-5 border border-slate-200 dark:border-slate-700 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-indigo-500" />
                    <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
                      AI Extracted Resume Insights
                    </h3>
                  </div>
                  <button
                    onClick={() => handleApplyToProfile(activeResume.id)}
                    disabled={actionLoading === activeResume.id}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium transition-all shadow-sm disabled:opacity-50"
                  >
                    <FileCheck className="w-3.5 h-3.5" />
                    <span>Apply Skills to Profile</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Skills */}
                  <div>
                    <span className="text-slate-500 block mb-1">
                      Identified Skills:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {(activeResume.parsedData.skills || []).map((s, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300"
                        >
                          {s}
                        </span>
                      ))}
                      {(activeResume.parsedData.skills || []).length === 0 && (
                        <span className="text-slate-400">None detected</span>
                      )}
                    </div>
                  </div>

                  {/* Programming Languages */}
                  <div>
                    <span className="text-slate-500 block mb-1">
                      Programming Languages:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {(activeResume.parsedData.programming_languages || []).map((l, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300"
                        >
                          {l}
                        </span>
                      ))}
                      {(activeResume.parsedData.programming_languages || []).length === 0 && (
                        <span className="text-slate-400">None detected</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Extracted Text Accordion Toggle */}
            {activeResume.extractedText && (
              <div>
                <button
                  type="button"
                  onClick={() =>
                    setSelectedResumeText(
                      selectedResumeText ? null : activeResume.extractedText || null,
                    )
                  }
                  className="flex items-center space-x-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>
                    {selectedResumeText ? 'Hide Extracted Text' : 'View Extracted Text'}
                  </span>
                </button>

                {selectedResumeText && (
                  <pre className="mt-3 p-4 rounded-xl bg-slate-900 text-slate-200 text-xs font-mono max-h-60 overflow-y-auto whitespace-pre-wrap leading-relaxed border border-slate-800">
                    {selectedResumeText}
                  </pre>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
