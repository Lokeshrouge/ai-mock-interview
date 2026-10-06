# Frontend Architecture

## Document Information
**Project:** AI-Powered Mock Interview System  
**Document Version:** 1.0  
**Last Updated:** 2024  
**Author:** B.Sc. Final Year Project Team

---

## 1. Introduction

This document defines the frontend architecture for the AI-Powered Mock Interview System, built with Next.js 14 App Router, TypeScript, and Tailwind CSS. The architecture emphasizes type safety, performance, and developer experience through modern React patterns and tooling.

The frontend serves as the primary user interface for candidates conducting mock interviews, viewing performance reports, and managing their profiles. It communicates with the NestJS backend via REST API and handles complex state management for real-time interview sessions.

---

## 2. Technology Stack

### 2.1 Core Framework

**Next.js 14 (App Router)**
- Server Components by default for optimal performance
- Client Components for interactivity (marked with 'use client')
- Built-in routing with file-system based structure
- Server Actions for form submissions (future enhancement)
- Streaming and Suspense for progressive loading

**React 18**
- Concurrent rendering features
- Automatic batching for state updates
- useTransition for non-blocking updates
- Suspense boundaries for loading states

### 2.2 Language and Type Safety

**TypeScript 5.x (Strict Mode)**
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

**Generated Types from OpenAPI**
- Use `openapi-typescript` to generate types from backend API spec
- Automatic synchronization with backend schema
- Type-safe API client functions

### 2.3 Styling

**Tailwind CSS 3.x**
- Utility-first CSS framework
- Custom design system tokens in `tailwind.config.js`
- Component variants with `class-variance-authority` (CVA)
- Dark mode support (class-based strategy)

**Shadcn/ui Components**
- Pre-built, accessible components based on Radix UI
- Customizable with Tailwind
- Copy-paste component library (not npm package)

### 2.4 State Management

**React Context**
- Auth state (user, tokens, login/logout functions)
- Theme state (light/dark mode)

**Zustand**
- Interview session state (ephemeral, complex state)
- Answer drafts and buffer management
- Timer state

**TanStack Query (React Query)**
- Server state management
- Automatic caching and revalidation
- Optimistic updates
- Background refetching

### 2.5 Form Handling

**React Hook Form**
- Performant form state management
- Uncontrolled inputs by default
- Built-in validation support

**Zod**
- Runtime type validation
- Schema-based form validation
- Integration with React Hook Form via `@hookform/resolvers/zod`

### 2.6 Data Fetching

**Native Fetch API**
- Wrapped in typed API client functions
- Automatic auth header injection
- Error handling and token refresh logic

**TanStack Query Integration**
```typescript
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

const { data, isLoading } = useQuery({
  queryKey: ['interviews'],
  queryFn: () => apiClient.interviews.list(),
});
```

---

## 3. Next.js App Router Structure

### 3.1 Directory Layout

```
apps/web/
├── app/
│   ├── (auth)/                    # Auth route group
│   │   ├── layout.tsx            # Centered card layout
│   │   ├── login/
│   │   │   └── page.tsx          # Login page
│   │   ├── register/
│   │   │   └── page.tsx          # Registration page
│   │   └── forgot-password/
│   │       └── page.tsx          # Password reset
│   │
│   ├── (dashboard)/              # Dashboard route group
│   │   ├── layout.tsx            # Sidebar + topbar layout
│   │   ├── dashboard/
│   │   │   └── page.tsx          # Dashboard home
│   │   ├── interviews/
│   │   │   ├── page.tsx          # Interview list
│   │   │   ├── new/
│   │   │   │   └── page.tsx      # Create interview
│   │   │   └── [id]/
│   │   │       ├── page.tsx      # Interview details
│   │   │       ├── session/
│   │   │       │   └── page.tsx  # Live interview session
│   │   │       └── report/
│   │   │           └── page.tsx  # Performance report
│   │   ├── profile/
│   │   │   └── page.tsx          # User profile settings
│   │   └── resume/
│   │       └── page.tsx          # Resume upload/management
│   │
│   ├── admin/                    # Admin routes (no group)
│   │   ├── layout.tsx            # Admin layout with nav
│   │   ├── page.tsx              # Admin dashboard
│   │   ├── users/
│   │   │   └── page.tsx          # User management
│   │   ├── interviews/
│   │   │   └── page.tsx          # All interviews
│   │   └── stats/
│   │       └── page.tsx          # Platform statistics
│   │
│   ├── layout.tsx                # Root layout (providers)
│   ├── page.tsx                  # Landing page
│   ├── error.tsx                 # Global error boundary
│   ├── not-found.tsx             # 404 page
│   └── loading.tsx               # Global loading state
│
├── components/
│   ├── ui/                       # Shadcn/ui components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   └── ...
│   ├── auth/
│   │   ├── login-form.tsx
│   │   └── register-form.tsx
│   ├── interview/
│   │   ├── interview-card.tsx
│   │   ├── interview-list.tsx
│   │   ├── question-card.tsx
│   │   ├── answer-textarea.tsx
│   │   ├── session-timer.tsx
│   │   ├── progress-bar.tsx
│   │   └── evaluation-feedback.tsx
│   ├── report/
│   │   ├── report-card.tsx
│   │   ├── skill-radar-chart.tsx
│   │   ├── score-gauge.tsx
│   │   └── feedback-list.tsx
│   ├── layout/
│   │   ├── sidebar.tsx
│   │   ├── topbar.tsx
│   │   └── footer.tsx
│   └── providers/
│       ├── auth-provider.tsx
│       ├── query-provider.tsx
│       ├── theme-provider.tsx
│       └── interview-session-provider.tsx
│
├── lib/
│   ├── api-client.ts             # Typed API client
│   ├── api-types.ts              # Generated from OpenAPI
│   ├── auth.ts                   # Auth utilities
│   ├── utils.ts                  # Utility functions
│   └── validations.ts            # Zod schemas
│
├── hooks/
│   ├── use-auth.ts               # Auth context hook
│   ├── use-interviews.ts         # Interview queries
│   ├── use-session-timer.ts      # Timer hook
│   └── use-debounce.ts           # Utility hooks
│
├── stores/
│   └── interview-session.ts      # Zustand store
│
└── styles/
    └── globals.css               # Global styles + Tailwind
```

### 3.2 Route Groups Explained

**Route groups:** Folders wrapped in parentheses `(group)` that organize routes without affecting URL structure.

**Benefits:**
- Separate layouts for different sections
- Organize related routes logically
- Auth vs. authenticated sections have different layouts

**Example:**
- `/login` uses `(auth)` layout (centered card, no sidebar)
- `/dashboard` uses `(dashboard)` layout (sidebar + topbar)
- Both are at root level in URL structure

---

## 4. Layouts

### 4.1 Root Layout (app/layout.tsx)

**Purpose:** Global providers and HTML structure.

```tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AI Mock Interview System',
  description: 'Practice interviews with AI-powered feedback',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
```

**Providers Component:**
```tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from './auth-provider';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <AuthProvider>
          {children}
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
```

---

### 4.2 Auth Layout (app/(auth)/layout.tsx)

**Purpose:** Centered card layout for login/register pages.

```tsx
import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/auth';

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();
  
  // Redirect if already authenticated
  if (session) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  );
}
```

**Visual Structure:**
```
┌─────────────────────────────────────┐
│                                     │
│                                     │
│       ┌───────────────────┐        │
│       │                   │        │
│       │   Login Card      │        │
│       │   (centered)      │        │
│       │                   │        │
│       └───────────────────┘        │
│                                     │
│                                     │
└─────────────────────────────────────┘
```

---

### 4.3 Dashboard Layout (app/(dashboard)/layout.tsx)

**Purpose:** Sidebar + topbar layout for authenticated pages.

```tsx
import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/auth';
import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();
  
  // Redirect if not authenticated
  if (!session) {
    redirect('/login');
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar user={session.user} />
      
      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <Topbar user={session.user} />
        
        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
```

**Visual Structure:**
```
┌────────────────────────────────────────────────┐
│ ┌──────┐                                       │
│ │      │  Topbar (user menu, notifications)    │
│ │      ├───────────────────────────────────────┤
│ │      │                                       │
│ │ Side │                                       │
│ │ bar  │   Main Content Area                   │
│ │      │   (page-specific content)             │
│ │      │                                       │
│ │      │                                       │
└─┴──────┴───────────────────────────────────────┘
```

---

## 5. State Management

### 5.1 Auth State (React Context)

**Purpose:** Global auth state accessible throughout app.

```tsx
'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import type { User } from '@/lib/api-types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user on mount
  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    try {
      const userData = await apiClient.users.me();
      setUser(userData);
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }

  async function login(email: string, password: string) {
    const response = await apiClient.auth.login({ email, password });
    setUser(response.user);
    // Access token stored in memory, refresh token in httpOnly cookie
  }

  async function logout() {
    await apiClient.auth.logout();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, refreshUser: loadUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

---

### 5.2 Interview Session State (Zustand)

**Purpose:** Manage complex interview session state (current question, answers buffer, timer).

```tsx
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { Question, Answer } from '@/lib/api-types';

interface InterviewSessionState {
  // State
  interviewId: string | null;
  questions: Question[];
  currentQuestionIndex: number;
  answers: Map<string, string>; // questionId -> answer text (draft)
  submittedAnswers: Answer[];
  timerSeconds: number;
  isTimerRunning: boolean;
  
  // Actions
  initializeSession: (interviewId: string, questions: Question[]) => void;
  setCurrentQuestionIndex: (index: number) => void;
  updateAnswerDraft: (questionId: string, text: string) => void;
  addSubmittedAnswer: (answer: Answer) => void;
  startTimer: () => void;
  pauseTimer: () => void;
  incrementTimer: () => void;
  resetSession: () => void;
}

export const useInterviewSession = create<InterviewSessionState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        interviewId: null,
        questions: [],
        currentQuestionIndex: 0,
        answers: new Map(),
        submittedAnswers: [],
        timerSeconds: 0,
        isTimerRunning: false,

        // Actions
        initializeSession: (interviewId, questions) => {
          set({
            interviewId,
            questions,
            currentQuestionIndex: 0,
            answers: new Map(),
            submittedAnswers: [],
            timerSeconds: 0,
            isTimerRunning: false,
          });
        },

        setCurrentQuestionIndex: (index) => {
          set({ currentQuestionIndex: index });
        },

        updateAnswerDraft: (questionId, text) => {
          const answers = new Map(get().answers);
          answers.set(questionId, text);
          set({ answers });
        },

        addSubmittedAnswer: (answer) => {
          const submittedAnswers = [...get().submittedAnswers, answer];
          set({ submittedAnswers });
          
          // Clear draft for this question
          const answers = new Map(get().answers);
          answers.delete(answer.questionId);
          set({ answers });
        },

        startTimer: () => {
          set({ isTimerRunning: true });
        },

        pauseTimer: () => {
          set({ isTimerRunning: false });
        },

        incrementTimer: () => {
          if (get().isTimerRunning) {
            set({ timerSeconds: get().timerSeconds + 1 });
          }
        },

        resetSession: () => {
          set({
            interviewId: null,
            questions: [],
            currentQuestionIndex: 0,
            answers: new Map(),
            submittedAnswers: [],
            timerSeconds: 0,
            isTimerRunning: false,
          });
        },
      }),
      {
        name: 'interview-session-storage',
        // Persist to localStorage (auto-recover on refresh)
        partialize: (state) => ({
          interviewId: state.interviewId,
          currentQuestionIndex: state.currentQuestionIndex,
          answers: Array.from(state.answers.entries()),
          timerSeconds: state.timerSeconds,
        }),
      }
    )
  )
);
```

**Usage in Components:**
```tsx
'use client';

import { useInterviewSession } from '@/stores/interview-session';

export function InterviewSession() {
  const currentQuestionIndex = useInterviewSession((s) => s.currentQuestionIndex);
  const questions = useInterviewSession((s) => s.questions);
  const updateAnswerDraft = useInterviewSession((s) => s.updateAnswerDraft);

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div>
      <h2>{currentQuestion.text}</h2>
      <textarea
        onChange={(e) => updateAnswerDraft(currentQuestion.id, e.target.value)}
      />
    </div>
  );
}
```

---

### 5.3 Server State (TanStack Query)

**Purpose:** Fetch, cache, and synchronize server data.

**API Client with React Query:**
```tsx
// hooks/use-interviews.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { Interview, CreateInterviewDto } from '@/lib/api-types';

export function useInterviews() {
  return useQuery({
    queryKey: ['interviews'],
    queryFn: () => apiClient.interviews.list(),
  });
}

export function useInterview(id: string) {
  return useQuery({
    queryKey: ['interviews', id],
    queryFn: () => apiClient.interviews.get(id),
    enabled: !!id, // Only run if id exists
  });
}

export function useCreateInterview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateInterviewDto) => apiClient.interviews.create(data),
    onSuccess: () => {
      // Invalidate and refetch interviews list
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
    },
  });
}

export function useSubmitAnswer(interviewId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ questionId, answerText }: { questionId: string; answerText: string }) =>
      apiClient.answers.submit(interviewId, { questionId, answerText }),
    onMutate: async (variables) => {
      // Optimistic update: show answer as submitted immediately
      await queryClient.cancelQueries({ queryKey: ['interviews', interviewId] });
      
      const previousInterview = queryClient.getQueryData(['interviews', interviewId]);
      
      // Optimistically update answeredCount
      queryClient.setQueryData(['interviews', interviewId], (old: Interview) => ({
        ...old,
        answeredCount: old.answeredCount + 1,
      }));

      return { previousInterview };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousInterview) {
        queryClient.setQueryData(['interviews', interviewId], context.previousInterview);
      }
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['interviews', interviewId] });
    },
  });
}
```

**Usage in Component:**
```tsx
'use client';

import { useInterviews, useCreateInterview } from '@/hooks/use-interviews';
import { Button } from '@/components/ui/button';

export function InterviewList() {
  const { data: interviews, isLoading, error } = useInterviews();
  const createInterview = useCreateInterview();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {interviews?.data.map((interview) => (
        <div key={interview.id}>{interview.jobTitle}</div>
      ))}
      
      <Button
        onClick={() => {
          createInterview.mutate({
            type: 'TECHNICAL',
            jobTitle: 'Frontend Developer',
            difficulty: 'INTERMEDIATE',
            skills: ['React', 'TypeScript'],
            questionCount: 5,
          });
        }}
        disabled={createInterview.isPending}
      >
        Create Interview
      </Button>
    </div>
  );
}
```

---

## 6. Key Components

### 6.1 InterviewSessionProvider

**Purpose:** Initialize and manage interview session lifecycle.

```tsx
'use client';

import { useEffect } from 'react';
import { useInterviewSession } from '@/stores/interview-session';
import { useInterview } from '@/hooks/use-interviews';
import { useRouter } from 'next/navigation';

interface Props {
  interviewId: string;
  children: React.ReactNode;
}

export function InterviewSessionProvider({ interviewId, children }: Props) {
  const router = useRouter();
  const { data: interview, isLoading } = useInterview(interviewId);
  const { initializeSession, startTimer, pauseTimer, resetSession } = useInterviewSession();

  // Initialize session when interview data loads
  useEffect(() => {
    if (interview && interview.status === 'IN_PROGRESS') {
      initializeSession(interview.id, interview.questions);
      startTimer();
    }
  }, [interview, initializeSession, startTimer]);

  // Timer tick (every second)
  useEffect(() => {
    const interval = setInterval(() => {
      useInterviewSession.getState().incrementTimer();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      pauseTimer();
    };
  }, [pauseTimer]);

  // Redirect if interview not in correct state
  useEffect(() => {
    if (interview) {
      if (interview.status === 'COMPLETED') {
        router.push(`/interviews/${interviewId}/report`);
      } else if (interview.status !== 'IN_PROGRESS') {
        router.push(`/interviews/${interviewId}`);
      }
    }
  }, [interview, interviewId, router]);

  if (isLoading) return <div>Loading interview...</div>;
  if (!interview) return <div>Interview not found</div>;

  return <>{children}</>;
}
```

---

### 6.2 QuestionCard Component

```tsx
'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Question } from '@/lib/api-types';

interface Props {
  question: Question;
  index: number;
  total: number;
  isAnswered: boolean;
}

export function QuestionCard({ question, index, total, isAnswered }: Props) {
  return (
    <Card className={isAnswered ? 'border-green-500' : ''}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm text-muted-foreground">
            Question {index + 1} of {total}
          </CardTitle>
          <div className="flex gap-2">
            <Badge variant={isAnswered ? 'default' : 'outline'}>
              {isAnswered ? 'Answered' : 'Unanswered'}
            </Badge>
            <Badge variant="secondary">{question.difficulty}</Badge>
            <Badge variant="outline">{question.topic}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-lg font-medium">{question.text}</p>
      </CardContent>
    </Card>
  );
}
```

---

### 6.3 AnswerTextarea Component

```tsx
'use client';

import { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useInterviewSession } from '@/stores/interview-session';
import { useSubmitAnswer } from '@/hooks/use-interviews';
import { Loader2 } from 'lucide-react';

interface Props {
  interviewId: string;
  questionId: string;
}

export function AnswerTextarea({ interviewId, questionId }: Props) {
  const answerDraft = useInterviewSession((s) => s.answers.get(questionId) || '');
  const updateAnswerDraft = useInterviewSession((s) => s.updateAnswerDraft);
  const addSubmittedAnswer = useInterviewSession((s) => s.addSubmittedAnswer);
  
  const submitAnswer = useSubmitAnswer(interviewId);

  const [localValue, setLocalValue] = useState(answerDraft);
  const wordCount = localValue.trim().split(/\s+/).filter(Boolean).length;

  // Sync local value with store (debounced)
  useEffect(() => {
    const timeout = setTimeout(() => {
      updateAnswerDraft(questionId, localValue);
    }, 500);

    return () => clearTimeout(timeout);
  }, [localValue, questionId, updateAnswerDraft]);

  async function handleSubmit() {
    if (localValue.trim().length < 10) {
      alert('Answer must be at least 10 characters');
      return;
    }

    try {
      const result = await submitAnswer.mutateAsync({
        questionId,
        answerText: localValue,
      });
      
      addSubmittedAnswer(result);
      setLocalValue(''); // Clear textarea
    } catch (error) {
      console.error('Failed to submit answer:', error);
    }
  }

  return (
    <div className="space-y-4">
      <Textarea
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder="Type your answer here..."
        rows={10}
        className="resize-none"
      />
      
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {wordCount} words
        </span>
        
        <Button
          onClick={handleSubmit}
          disabled={submitAnswer.isPending || wordCount < 5}
        >
          {submitAnswer.isPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Submit Answer
        </Button>
      </div>

      {submitAnswer.isError && (
        <p className="text-sm text-red-600">
          Failed to submit answer. Please try again.
        </p>
      )}
    </div>
  );
}
```

---

### 6.4 SessionTimer Component

```tsx
'use client';

import { useInterviewSession } from '@/stores/interview-session';
import { Clock } from 'lucide-react';

export function SessionTimer() {
  const timerSeconds = useInterviewSession((s) => s.timerSeconds);
  const isRunning = useInterviewSession((s) => s.isTimerRunning);

  const hours = Math.floor(timerSeconds / 3600);
  const minutes = Math.floor((timerSeconds % 3600) / 60);
  const seconds = timerSeconds % 60;

  const formatted = [
    hours.toString().padStart(2, '0'),
    minutes.toString().padStart(2, '0'),
    seconds.toString().padStart(2, '0'),
  ].join(':');

  return (
    <div className="flex items-center gap-2 text-sm font-mono">
      <Clock className={`h-4 w-4 ${isRunning ? 'animate-pulse text-green-600' : 'text-gray-400'}`} />
      <span>{formatted}</span>
    </div>
  );
}
```

---

### 6.5 ProgressBar Component

```tsx
'use client';

import { Progress } from '@/components/ui/progress';

interface Props {
  current: number;
  total: number;
}

export function ProgressBar({ current, total }: Props) {
  const percentage = (current / total) * 100;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">
          {current} of {total} questions answered
        </span>
        <span className="font-medium">{Math.round(percentage)}%</span>
      </div>
      <Progress value={percentage} className="h-2" />
    </div>
  );
}
```

---

### 6.6 SkillRadarChart Component

```tsx
'use client';

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';
import type { SkillScore } from '@/lib/api-types';

interface Props {
  skillScores: SkillScore[];
}

export function SkillRadarChart({ skillScores }: Props) {
  const data = skillScores.map((skill) => ({
    skill: skill.skill,
    score: skill.score,
    fullMark: 100,
  }));

  return (
    <ResponsiveContainer width="100%" height={400}>
      <RadarChart data={data}>
        <PolarGrid />
        <PolarAngleAxis dataKey="skill" />
        <PolarRadiusAxis angle={90} domain={[0, 100]} />
        <Radar
          name="Your Score"
          dataKey="score"
          stroke="#8884d8"
          fill="#8884d8"
          fillOpacity={0.6}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
```

---

## 7. Form Handling Example

### 7.1 Login Form with React Hook Form + Zod

```tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginFormData) {
    try {
      await login(data.email, data.password);
      router.push('/dashboard');
    } catch (error: any) {
      setError('root', {
        message: error.message || 'Invalid credentials',
      });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          {...register('email')}
          aria-invalid={!!errors.email}
        />
        {errors.email && (
          <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          {...register('password')}
          aria-invalid={!!errors.password}
        />
        {errors.password && (
          <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>
        )}
      </div>

      {errors.root && (
        <p className="text-sm text-red-600">{errors.root.message}</p>
      )}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Logging in...' : 'Log In'}
      </Button>
    </form>
  );
}
```

---

## 8. Resume Upload Component

```tsx
'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api-client';

export function ResumeUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
  });

  async function handleUpload() {
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const result = await apiClient.users.uploadResume(formData);
      setUploadedUrl(result.resumeUrl);
      setFile(null);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-4">
      {!file && (
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
            transition-colors
            ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          `}
        >
          <input {...getInputProps()} />
          <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          {isDragActive ? (
            <p>Drop your resume here...</p>
          ) : (
            <div>
              <p className="font-medium">Drag & drop your resume here</p>
              <p className="text-sm text-muted-foreground mt-1">
                or click to browse (PDF or DOCX, max 5MB)
              </p>
            </div>
          )}
        </div>
      )}

      {file && (
        <div className="border rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-blue-600" />
            <div>
              <p className="font-medium">{file.name}</p>
              <p className="text-sm text-muted-foreground">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setFile(null)}
            disabled={uploading}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {file && (
        <Button onClick={handleUpload} disabled={uploading} className="w-full">
          {uploading ? 'Uploading...' : 'Upload Resume'}
        </Button>
      )}

      {uploadedUrl && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800">✓ Resume uploaded successfully!</p>
        </div>
      )}
    </div>
  );
}
```

---

## 9. TypeScript Type Safety

### 9.1 Generated API Types

**Generate types from OpenAPI spec:**
```bash
npx openapi-typescript http://localhost:3000/api/docs-json -o lib/api-types.ts
```

**Usage:**
```typescript
import type { paths, components } from '@/lib/api-types';

// Extract specific types
export type Interview = components['schemas']['Interview'];
export type CreateInterviewDto = components['schemas']['CreateInterviewDto'];
export type ApiError = components['schemas']['ErrorResponse'];

// Type-safe API client
type GetInterviewsResponse = paths['/api/v1/interviews']['get']['responses']['200']['content']['application/json'];
```

### 9.2 Strict Null Checks

**Enable in tsconfig.json:**
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true
  }
}
```

**Safe array access:**
```typescript
// ❌ Unsafe (may be undefined)
const firstInterview = interviews[0];

// ✅ Safe
const firstInterview = interviews[0];
if (firstInterview) {
  console.log(firstInterview.jobTitle);
}

// ✅ Safe with optional chaining
const jobTitle = interviews[0]?.jobTitle;
```

---

## 10. Page/Component Tree (ASCII)

```
App Root
│
├─ Providers (Query, Auth, Theme)
│
├─ Landing Page (/)
│
├─ Auth Routes (route group)
│  ├─ Auth Layout (centered card)
│  ├─ Login Page (/login)
│  │  └─ LoginForm
│  │     ├─ Input (email)
│  │     ├─ Input (password)
│  │     └─ Button (submit)
│  └─ Register Page (/register)
│     └─ RegisterForm
│
├─ Dashboard Routes (route group)
│  ├─ Dashboard Layout (sidebar + topbar)
│  │  ├─ Sidebar
│  │  │  ├─ NavLinks
│  │  │  └─ UserMenu
│  │  └─ Topbar
│  │     ├─ ThemeToggle
│  │     └─ NotificationBell
│  │
│  ├─ Dashboard Home (/dashboard)
│  │  ├─ StatsCards
│  │  ├─ RecentInterviews
│  │  └─ QuickActions
│  │
│  ├─ Interview List (/interviews)
│  │  ├─ InterviewList
│  │  │  └─ InterviewCard (for each)
│  │  │     ├─ StatusBadge
│  │  │     └─ ActionButtons
│  │  └─ CreateInterviewButton
│  │
│  ├─ Create Interview (/interviews/new)
│  │  └─ CreateInterviewForm
│  │     ├─ Select (type)
│  │     ├─ Input (job title)
│  │     ├─ MultiSelect (skills)
│  │     ├─ Select (difficulty)
│  │     └─ Button (create)
│  │
│  ├─ Interview Session (/interviews/[id]/session)
│  │  └─ InterviewSessionProvider
│  │     ├─ SessionTimer
│  │     ├─ ProgressBar
│  │     ├─ QuestionCard
│  │     ├─ AnswerTextarea
│  │     ├─ NavigationButtons
│  │     │  ├─ Button (previous)
│  │     │  ├─ Button (next)
│  │     │  ├─ Button (pause)
│  │     │  └─ Button (end)
│  │     └─ EvaluationFeedback (if answered)
│  │
│  └─ Interview Report (/interviews/[id]/report)
│     └─ ReportCard
│        ├─ ScoreGauge (overall)
│        ├─ SkillRadarChart
│        ├─ FeedbackList
│        │  ├─ StrengthsList
│        │  └─ ImprovementsList
│        └─ DetailedAnswers
│           └─ AnswerCard (for each)
│              ├─ QuestionText
│              ├─ AnswerText
│              ├─ Score
│              └─ Feedback
│
└─ Admin Routes
   ├─ Admin Layout
   ├─ Users Management (/admin/users)
   │  └─ UsersTable
   ├─ Interviews Management (/admin/interviews)
   │  └─ InterviewsTable
   └─ Statistics (/admin/stats)
      ├─ StatsDashboard
      ├─ UserGrowthChart
      └─ InterviewDistributionChart
```

---

## 11. Conclusion

The frontend architecture leverages modern React patterns and Next.js 14 capabilities to deliver a performant, type-safe, and maintainable application. Key architectural decisions include:

- **App Router:** File-system routing with layout composition
- **Server Components:** Default to server rendering for better performance
- **TypeScript Strict Mode:** Catch errors at compile time
- **TanStack Query:** Efficient server state management with caching
- **Zustand:** Lightweight client state for complex ephemeral state
- **Shadcn/ui:** Accessible, customizable component library
- **Form Validation:** Zod schemas with React Hook Form integration

This architecture provides a solid foundation for the MVP while remaining flexible for future enhancements such as real-time features (WebSockets), advanced animations (Framer Motion), and voice/video interviews (WebRTC).

---

**End of Document**
