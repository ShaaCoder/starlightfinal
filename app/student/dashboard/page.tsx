'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';

import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/hooks/use-toast';

import {
  Loader as Loader2,
  GraduationCap,
  LogOut,
  BookOpen,
  Bell,
  FileText,
  Award,
  User,
  Phone,
  Mail,
  MapPin,
  Hash,
  Calendar,
  BookMarked,
  ClipboardCheck,
  HelpCircle,
  ChevronRight,
  Clock,
  Target,
  ShieldCheck,
  Lock,
  AlertCircle,
} from 'lucide-react';

import {
  Notice,
  Course,
  Quiz,
  QuizSubject,
  CATEGORY_LABELS,
  StudentCategory,
} from '@/lib/types';

import DynamicCategoryForm, {
  CompleteFormValue,
} from '@/components/ui/dynamic-category-form';

interface QuizAttempt {
  id: string;
  quiz_id: string;
  score: number;
  total_questions: number;
  percentage: number;
  passed: boolean;
  time_taken_seconds: number | null;
  started_at: string;
  completed_at: string;
  quizzes: {
    title: string;
    description: string;
  } | null;
}

export default function StudentDashboard() {
  const router = useRouter();

  const {
    user,
    role,
    profile,
    isLoading: authLoading,
    signOut,
    refreshRoleAndProfile,
  } = useAuth();

  const supabase = useRef(createClient()).current;

  const { toast } = useToast();

  const [notices, setNotices] = useState<Notice[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);
  const [quizSubjects, setQuizSubjects] = useState<QuizSubject[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [profileSubmitting, setProfileSubmitting] = useState(false);
  const [showProfileForm, setShowProfileForm] = useState(false);

  /*
   * IMPORTANT:
   *
   * A student is approved ONLY when:
   *
   * profile exists AND profile.is_approved === true
   *
   * This prevents a missing profile from accidentally
   * being treated as an approved student.
   */
  const isApproved = profile?.is_approved === true;

 useEffect(() => {
  if (authLoading) return;

  if (!user) {
    router.replace('/auth/login');
    return;
  }

  if (role && role !== 'student') {
    router.replace('/admin');
    return;
  }

  if (role !== 'student') {
    return;
  }

  /*
   * Wait until student profile is available.
   * We need profile.is_approved to determine quiz access.
   */
  if (!profile) {
    setIsLoading(false);
    return;
  }

  const loadData = async () => {
    setIsLoading(true);

    try {
      /*
       * These two queries are available to every student.
       */
      const noticesPromise = supabase
        .from('notices')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      const coursesPromise = supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });

      /*
       * Load notices and courses first.
       */
      const [noticesRes, coursesRes] = await Promise.all([
        noticesPromise,
        coursesPromise,
      ]);

      if (noticesRes.error) {
        console.error(
          'Error loading notices:',
          noticesRes.error
        );
      }

      if (coursesRes.error) {
        console.error(
          'Error loading courses:',
          coursesRes.error
        );
      }

      setNotices(noticesRes.data || []);
      setCourses(coursesRes.data || []);

      /*
       * IMPORTANT:
       *
       * Pending students do NOT request any quiz data.
       */
      if (!profile.is_approved) {
        setQuizAttempts([]);
        setQuizSubjects([]);
        setQuizzes([]);
        return;
      }

      /*
       * Approved students can load quiz data.
       */
      const attemptsPromise = supabase
        .from('quiz_attempts')
        .select(
          'id, quiz_id, score, total_questions, percentage, passed, time_taken_seconds, started_at, completed_at, quizzes:quizzes(title, description)'
        )
        .eq('student_email', user.email ?? '')
        .order('completed_at', { ascending: false });

      const subjectsPromise = supabase
        .from('quiz_subjects')
        .select('*')
        .order('created_at', { ascending: false });

      const quizzesPromise = supabase
        .from('quizzes')
        .select(`*, quiz_questions(count)`)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      const [
        attemptsRes,
        subjectsRes,
        quizzesRes,
      ] = await Promise.all([
        attemptsPromise,
        subjectsPromise,
        quizzesPromise,
      ]);

      if (attemptsRes.error) {
        console.error(
          'Error loading quiz attempts:',
          attemptsRes.error
        );
      }

      if (subjectsRes.error) {
        console.error(
          'Error loading quiz subjects:',
          subjectsRes.error
        );
      }

      if (quizzesRes.error) {
        console.error(
          'Error loading quizzes:',
          quizzesRes.error
        );
      }

      /*
       * Quiz attempts
       */
      setQuizAttempts(
        ((attemptsRes.data as unknown as QuizAttempt[]) || [])
      );

      /*
       * Quiz subjects
       */
      setQuizSubjects(
        ((subjectsRes.data || []) as QuizSubject[])
      );

      /*
       * Convert quiz rows into the Quiz type.
       */
      const quizzesWithCount: Quiz[] = (
        (quizzesRes.data || []) as any[]
      ).map((row) => ({
        id: row.id,
        subject_id: row.subject_id,
        title: row.title,
        description: row.description || '',
        duration_minutes: row.duration_minutes,
        passing_score: row.passing_score,
        is_active: row.is_active,
        slug: row.slug,
        created_at: row.created_at,
        questions_count:
          Array.isArray(row.quiz_questions) &&
          row.quiz_questions[0]
            ? Number(row.quiz_questions[0].count || 0)
            : 0,
      }));

      setQuizzes(quizzesWithCount);
    } catch (error) {
      console.error(
        'Student dashboard error:',
        error
      );

      toast({
        title: 'Error',
        description:
          'Failed to load dashboard data.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  loadData();
}, [
  authLoading,
  user,
  role,
  profile,
  router,
  supabase,
  toast,
]);

  const handleLogout = async () => {
    try {
      await signOut();

      router.replace('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);

      toast({
        title: 'Error',
        description: 'Failed to logout.',
        variant: 'destructive',
      });
    }
  };

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';

      case 'medium':
        return 'bg-yellow-100 text-yellow-800';

      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const handleProfileSubmit = async (data: CompleteFormValue) => {
    if (!profile || !user) return;

    setProfileSubmitting(true);

    try {
      const db = supabase as any;

      const courseDisplay = (() => {
        const parts: string[] = [];
        if (data.category === 'government_exams') {
          if (data.exam) parts.push(data.exam);
        } else if (data.category === 'computer_courses') {
          if (data.computer_course) parts.push(data.computer_course);
        } else {
          if (data.level) parts.push(data.level);
          if (data.stream) parts.push(data.stream);
        }
        return parts.join(' - ');
      })();

      const { error: updateError } = await db
        .from('student_profiles')
        .update({
          category: data.category || null,
          exam: data.exam || null,
          level: data.level || null,
          stream: data.stream || null,
          session: data.session || null,
          batch: data.batch || null,
          batch_timing: data.batch_timing || null,
          duration: data.duration || null,
          computer_course: data.computer_course || null,
          course: courseDisplay || null,
          subjects: data.subjects || [],
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id);

      if (updateError) {
        throw new Error(updateError.message);
      }

      const { error: admError } = await db.from('admissions').insert([{
        student_name: profile.full_name || data.full_name,
        email: user.email,
        phone: profile.phone || data.phone || null,
        parent_name: profile.parent_name || data.parent_name || null,
        parent_phone: profile.parent_phone || data.parent_phone || null,
        address: profile.address || data.address || null,
        date_of_birth: profile.date_of_birth || data.date_of_birth || null,
        course: courseDisplay || null,
        category: data.category || null,
        exam: data.exam || null,
        level: data.level || null,
        stream: data.stream || null,
        session: data.session || null,
        batch: data.batch || null,
        batch_timing: data.batch_timing || null,
        duration: data.duration || null,
        computer_course: data.computer_course || null,
        subjects: data.subjects || null,
        status: 'pending',
        student_profile_id: profile.id,
      } as never]);

      if (admError) {
        console.error('Admission insert error:', admError);
      }

      toast({
        title: 'Profile Updated',
        description:
          'Your course selection has been submitted. An admin will review your application.',
      });

      setShowProfileForm(false);
      await refreshRoleAndProfile();
    } catch (error) {
      console.error('Profile update error:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setProfileSubmitting(false);
    }
  };

  /*
   * Loading state
   */
  if (authLoading || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-b from-yellow-50 to-blue-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />

          <p className="text-sm text-gray-500">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  /*
   * No authenticated student
   */
  if (!user || role !== 'student') {
    return null;
  }

  /*
   * Profile could not be loaded.
   *
   * We don't show quiz access in this situation.
   */
  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-yellow-50 via-white to-blue-50 px-4">
        <Card className="w-full max-w-md border-red-100 shadow-lg">
          <CardContent className="flex flex-col items-center p-8 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
              <AlertCircle className="h-7 w-7 text-red-600" />
            </div>

            <h2 className="mt-4 text-xl font-bold text-gray-900">
              Profile Not Found
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              We could not load your student profile. Please
              contact the administrator.
            </p>

            <Button
              onClick={handleLogout}
              variant="outline"
              className="mt-6 border-blue-200 text-blue-700"
            >
              Logout
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const passedAttempts = quizAttempts.filter(
    (attempt) => attempt.passed
  ).length;

  const avgPercentage =
    quizAttempts.length > 0
      ? Math.round(
          quizAttempts.reduce(
            (sum, attempt) => sum + attempt.percentage,
            0
          ) / quizAttempts.length
        )
      : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 via-white to-blue-50">
      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="sticky top-0 z-40 border-b border-blue-100 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-3 py-3 sm:px-4 sm:py-4 lg:px-8">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 sm:h-10 sm:w-10">
                <GraduationCap className="h-5 w-5 text-white sm:h-6 sm:w-6" />
              </div>

              <div className="min-w-0">
                <h1 className="truncate text-lg font-bold text-gray-900 sm:text-xl lg:text-2xl">
                  Student Dashboard
                </h1>

                <p className="truncate text-xs text-gray-500">
                  Starlight Academy
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <span className="hidden max-w-[120px] truncate text-xs text-gray-500 sm:inline sm:text-sm sm:max-w-none">
                {profile.full_name || user.email}
              </span>

              {/* Approval Status */}
              <Badge
                variant="outline"
                className={
                  isApproved
                    ? 'hidden border-green-200 bg-green-50 text-green-700 sm:flex'
                    : 'hidden border-yellow-200 bg-yellow-50 text-yellow-700 sm:flex'
                }
              >
                {isApproved ? (
                  <>
                    <ShieldCheck className="mr-1 h-3.5 w-3.5" />
                    Approved
                  </>
                ) : (
                  <>
                    <Clock className="mr-1 h-3.5 w-3.5" />
                    Pending
                  </>
                )}
              </Badge>

              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="gap-1 border-blue-200 text-blue-700 hover:bg-blue-50 sm:gap-2"
              >
                <LogOut className="h-4 w-4" />

                <span className="hidden sm:inline">
                  Logout
                </span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl min-w-0 space-y-6 px-3 py-6 sm:px-4 sm:py-8 lg:px-8">

        {/* =====================================================
            PROFILE COMPLETION (Course Selection)
        ====================================================== */}

        {profile && !profile.category && !showProfileForm && (
          <Card className="overflow-hidden border-blue-200 bg-gradient-to-r from-blue-50 via-white to-yellow-50 shadow-sm">
            <div className="h-1.5 bg-gradient-to-r from-blue-500 via-yellow-400 to-red-500" />
            <CardContent className="p-5 sm:p-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-100">
                  <BookOpen className="h-7 w-7 text-blue-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-bold text-gray-900 sm:text-xl">
                      Complete Your Profile
                    </h2>
                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                      Action Required
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm leading-6 text-gray-600">
                    Please select your course and category to complete your
                    registration. This will submit your application for admin
                    approval.
                  </p>
                </div>
                <Button
                  onClick={() => setShowProfileForm(true)}
                  className="shrink-0 bg-blue-600 text-white hover:bg-blue-700"
                >
                  Select Course
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {profile && !profile.category && showProfileForm && (
          <Card className="border-blue-100 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-900">
                <BookOpen className="h-5 w-5" />
                Select Your Course
              </CardTitle>
              <CardDescription>
                Choose your course category and fill in the details to submit your application.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DynamicCategoryForm
                mode="admin-create"
                initialData={{
                  full_name: profile.full_name || '',
                  email: profile.email || user?.email || '',
                  phone: profile.phone || '',
                  date_of_birth: profile.date_of_birth || '',
                  parent_name: profile.parent_name || '',
                  parent_phone: profile.parent_phone || '',
                  address: profile.address || '',
                }}
                onSubmit={handleProfileSubmit}
                isLoading={profileSubmitting}
                submitLabel="Submit Application"
                courses={courses}
                includeSubjectsFor
                compact
              />
              <div className="mt-4 flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowProfileForm(false)}
                  disabled={profileSubmitting}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* =====================================================
            APPROVAL STATUS
        ====================================================== */}

        {!isApproved && (
          <Card className="overflow-hidden border-yellow-200 bg-gradient-to-r from-yellow-50 via-white to-blue-50 shadow-sm">
            <div className="h-1.5 bg-gradient-to-r from-yellow-400 via-orange-400 to-blue-500" />

            <CardContent className="p-5 sm:p-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-yellow-100">
                  <Clock className="h-7 w-7 text-yellow-600" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-bold text-gray-900 sm:text-xl">
                      Your Account is Pending Approval
                    </h2>

                    <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                      Pending
                    </Badge>
                  </div>

                  <p className="mt-1 text-sm leading-6 text-gray-600">
                    Your student account has been created
                    successfully. An administrator needs to
                    approve your account before you can access
                    mock tests and online quizzes.
                  </p>

                  <p className="mt-2 text-xs text-gray-500">
                    You can still view your profile, notices,
                    and available courses while your account is
                    waiting for approval.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {isApproved && (
          <Card className="overflow-hidden border-green-200 bg-gradient-to-r from-green-50 via-white to-blue-50">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100">
                  <ShieldCheck className="h-5 w-5 text-green-600" />
                </div>

                <div>
                  <p className="font-semibold text-green-900">
                    Account Approved
                  </p>

                  <p className="text-xs text-green-700 sm:text-sm">
                    You now have access to mock tests and
                    online quizzes.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* =====================================================
            STATS
        ====================================================== */}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Tests Taken */}
          <Card className="border-blue-100 bg-gradient-to-br from-white to-blue-50">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Tests Taken
                  </p>

                  <p className="mt-1 text-3xl font-bold text-blue-900">
                    {isApproved ? quizAttempts.length : '—'}
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
                  <ClipboardCheck className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tests Passed */}
          <Card className="border-yellow-100 bg-gradient-to-br from-white to-yellow-50">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Tests Passed
                  </p>

                  <p className="mt-1 text-3xl font-bold text-yellow-900">
                    {isApproved ? passedAttempts : '—'}
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-100">
                  <Award className="h-5 w-5 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Average Score */}
          <Card className="border-green-100 bg-gradient-to-br from-white to-green-50">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Avg Score
                  </p>

                  <p className="mt-1 text-3xl font-bold text-green-900">
                    {isApproved ? `${avgPercentage}%` : '—'}
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100">
                  <FileText className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notices */}
          <Card className="border-red-100 bg-gradient-to-br from-white to-red-50">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Notices
                  </p>

                  <p className="mt-1 text-3xl font-bold text-red-900">
                    {notices.length}
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100">
                  <Bell className="h-5 w-5 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* =====================================================
            PROFILE
        ====================================================== */}

        <div className="space-y-5">
          {/* === PERSONAL INFORMATION === */}
          <Card className="border-blue-100">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-blue-900">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
              <CardDescription>Your personal details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {/* Full Name */}
                <div className="flex items-center gap-3 rounded-lg border border-blue-50 bg-blue-50/40 p-3">
                  <User className="h-5 w-5 shrink-0 text-blue-600" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Full Name</p>
                    <p className="truncate font-semibold text-gray-900">
                      {profile.full_name || '—'}
                    </p>
                  </div>
                </div>
                {/* Email */}
                <div className="flex items-center gap-3 rounded-lg border border-blue-50 bg-blue-50/40 p-3">
                  <Mail className="h-5 w-5 shrink-0 text-blue-600" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="truncate font-semibold text-gray-900">
                      {user.email || profile.email || '—'}
                    </p>
                  </div>
                </div>
                {/* Phone */}
                <div className="flex items-center gap-3 rounded-lg border border-blue-50 bg-blue-50/40 p-3">
                  <Phone className="h-5 w-5 shrink-0 text-blue-600" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="truncate font-semibold text-gray-900">
                      {profile.phone || '—'}
                    </p>
                  </div>
                </div>
                {/* DOB */}
                {profile.date_of_birth && (
                  <div className="flex items-center gap-3 rounded-lg border border-blue-50 bg-blue-50/40 p-3">
                    <Calendar className="h-5 w-5 shrink-0 text-blue-600" />
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">Date of Birth</p>
                      <p className="truncate font-semibold text-gray-900">
                        {formatDate(profile.date_of_birth)}
                      </p>
                    </div>
                  </div>
                )}
                {/* Parent Name */}
                {profile.parent_name && (
                  <div className="flex items-center gap-3 rounded-lg border border-blue-50 bg-blue-50/40 p-3">
                    <ShieldCheck className="h-5 w-5 shrink-0 text-blue-600" />
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">
                        Father's / Guardian's Name
                      </p>
                      <p className="truncate font-semibold text-gray-900">
                        {profile.parent_name}
                      </p>
                    </div>
                  </div>
                )}
                {/* Parent Phone */}
                {profile.parent_phone && (
                  <div className="flex items-center gap-3 rounded-lg border border-blue-50 bg-blue-50/40 p-3">
                    <Phone className="h-5 w-5 shrink-0 text-blue-600" />
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">Parent Phone</p>
                      <p className="truncate font-semibold text-gray-900">
                        {profile.parent_phone}
                      </p>
                    </div>
                  </div>
                )}
                {/* Address */}
                {profile.address && (
                  <div className="flex items-start gap-3 rounded-lg border border-blue-50 bg-blue-50/40 p-3 sm:col-span-2 lg:col-span-2">
                    <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">Address</p>
                      <p className="font-semibold text-gray-900">
                        {profile.address}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* === ENROLLMENT INFORMATION === */}
          <Card className="border-green-100 bg-gradient-to-br from-white to-green-50/30">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-green-900">
                <GraduationCap className="h-5 w-5" />
                Enrollment Information
              </CardTitle>
              <CardDescription>
                Your official academy enrollment details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {/* Enrollment No */}
                <div className="flex items-center gap-3 rounded-lg border border-green-100 bg-white p-3">
                  <Hash className="h-5 w-5 shrink-0 text-green-600" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Enrollment No.</p>
                    <p className="truncate font-mono font-bold text-green-800 text-lg">
                      {profile.enrollment_number || '—'}
                    </p>
                  </div>
                </div>
                {/* Category */}
                {profile.category && (
                  <div className="flex items-center gap-3 rounded-lg border border-green-100 bg-white p-3">
                    <BookMarked className="h-5 w-5 shrink-0 text-green-600" />
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">Category</p>
                      <p className="truncate font-semibold text-gray-900">
                        {CATEGORY_LABELS[profile.category as StudentCategory] ||
                          profile.category}
                      </p>
                    </div>
                  </div>
                )}
                {/* Approval Status */}
                <div
                  className={`flex items-center gap-3 rounded-lg border p-3 bg-white ${
                    isApproved
                      ? 'border-green-200'
                      : 'border-yellow-200'
                  }`}
                >
                  {isApproved ? (
                    <ShieldCheck className="h-5 w-5 shrink-0 text-green-600" />
                  ) : (
                    <Clock className="h-5 w-5 shrink-0 text-yellow-600" />
                  )}
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Account Status</p>
                    <p
                      className={`font-semibold ${
                        isApproved ? 'text-green-700' : 'text-yellow-700'
                      }`}
                    >
                      {isApproved
                        ? profile.is_active === false
                          ? 'Approved (Inactive)'
                          : 'Active'
                        : 'Pending Approval'}
                    </p>
                  </div>
                </div>
                {/* Enrolled Date */}
                {profile.created_at && (
                  <div className="flex items-center gap-3 rounded-lg border border-green-100 bg-white p-3">
                    <Calendar className="h-5 w-5 shrink-0 text-green-600" />
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">Enrolled On</p>
                      <p className="truncate font-semibold text-gray-900">
                        {formatDate(profile.created_at)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* === CATEGORY-SPECIFIC INFORMATION === */}
          {profile.category && (
            <Card className="border-purple-100 bg-gradient-to-br from-white to-purple-50/20">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-purple-900">
                  <BookOpen className="h-5 w-5" />
                  {CATEGORY_LABELS[profile.category as StudentCategory]} -
                  Course Details
                </CardTitle>
                <CardDescription>
                  Information specific to your chosen program
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Government Exams */}
                {profile.category === 'government_exams' && (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {profile.exam && (
                      <div className="flex items-center gap-3 rounded-lg border border-purple-100 bg-white p-3">
                        <Target className="h-5 w-5 shrink-0 text-purple-600" />
                        <div className="min-w-0">
                          <p className="text-xs text-gray-500">Exam</p>
                          <p className="truncate font-semibold text-gray-900">
                            {profile.exam}
                          </p>
                        </div>
                      </div>
                    )}
                    {profile.batch && (
                      <div className="flex items-center gap-3 rounded-lg border border-purple-100 bg-white p-3">
                        <Clock className="h-5 w-5 shrink-0 text-purple-600" />
                        <div className="min-w-0">
                          <p className="text-xs text-gray-500">Batch</p>
                          <p className="truncate font-semibold text-gray-900">
                            {profile.batch}
                          </p>
                        </div>
                      </div>
                    )}
                    {profile.batch_timing && (
                      <div className="flex items-center gap-3 rounded-lg border border-purple-100 bg-white p-3">
                        <Clock className="h-5 w-5 shrink-0 text-purple-600" />
                        <div className="min-w-0">
                          <p className="text-xs text-gray-500">Batch Timing</p>
                          <p className="truncate font-semibold text-gray-900">
                            {profile.batch_timing}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* NIOS */}
                {profile.category === 'nios' && (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {profile.level && (
                      <div className="flex items-center gap-3 rounded-lg border border-purple-100 bg-white p-3">
                        <GraduationCap className="h-5 w-5 shrink-0 text-purple-600" />
                        <div className="min-w-0">
                          <p className="text-xs text-gray-500">Level</p>
                          <p className="truncate font-semibold text-gray-900">
                            {profile.level === '10th'
                              ? 'Secondary (10th)'
                              : profile.level === '12th'
                              ? 'Senior Secondary (12th)'
                              : profile.level}
                          </p>
                        </div>
                      </div>
                    )}
                    {profile.stream && (
                      <div className="flex items-center gap-3 rounded-lg border border-purple-100 bg-white p-3">
                        <BookMarked className="h-5 w-5 shrink-0 text-purple-600" />
                        <div className="min-w-0">
                          <p className="text-xs text-gray-500">Stream</p>
                          <p className="truncate font-semibold text-gray-900">
                            {profile.stream}
                          </p>
                        </div>
                      </div>
                    )}
                    {profile.subjects && profile.subjects.length > 0 && (
                      <div className="flex items-start gap-3 rounded-lg border border-purple-100 bg-white p-3 sm:col-span-1 lg:col-span-1">
                        <BookOpen className="mt-0.5 h-5 w-5 shrink-0 text-purple-600" />
                        <div className="min-w-0">
                          <p className="text-xs text-gray-500">Subjects</p>
                          <p className="font-semibold text-gray-900">
                            {Array.isArray(profile.subjects)
                              ? profile.subjects.join(', ')
                              : profile.subjects}
                          </p>
                        </div>
                      </div>
                    )}
                    {profile.session && (
                      <div className="flex items-center gap-3 rounded-lg border border-purple-100 bg-white p-3">
                        <Calendar className="h-5 w-5 shrink-0 text-purple-600" />
                        <div className="min-w-0">
                          <p className="text-xs text-gray-500">Session</p>
                          <p className="truncate font-semibold text-gray-900">
                            {profile.session}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Open Schooling */}
                {profile.category === 'open_schooling' && (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {profile.level && (
                      <div className="flex items-center gap-3 rounded-lg border border-purple-100 bg-white p-3">
                        <GraduationCap className="h-5 w-5 shrink-0 text-purple-600" />
                        <div className="min-w-0">
                          <p className="text-xs text-gray-500">Level</p>
                          <p className="truncate font-semibold text-gray-900">
                            {profile.level}
                          </p>
                        </div>
                      </div>
                    )}
                    {profile.stream && (
                      <div className="flex items-center gap-3 rounded-lg border border-purple-100 bg-white p-3">
                        <BookMarked className="h-5 w-5 shrink-0 text-purple-600" />
                        <div className="min-w-0">
                          <p className="text-xs text-gray-500">Stream</p>
                          <p className="truncate font-semibold text-gray-900">
                            {profile.stream}
                          </p>
                        </div>
                      </div>
                    )}
                    {profile.subjects && profile.subjects.length > 0 && (
                      <div className="flex items-start gap-3 rounded-lg border border-purple-100 bg-white p-3 sm:col-span-1 lg:col-span-1">
                        <BookOpen className="mt-0.5 h-5 w-5 shrink-0 text-purple-600" />
                        <div className="min-w-0">
                          <p className="text-xs text-gray-500">Subjects</p>
                          <p className="font-semibold text-gray-900">
                            {Array.isArray(profile.subjects)
                              ? profile.subjects.join(', ')
                              : profile.subjects}
                          </p>
                        </div>
                      </div>
                    )}
                    {profile.session && (
                      <div className="flex items-center gap-3 rounded-lg border border-purple-100 bg-white p-3">
                        <Calendar className="h-5 w-5 shrink-0 text-purple-600" />
                        <div className="min-w-0">
                          <p className="text-xs text-gray-500">Session</p>
                          <p className="truncate font-semibold text-gray-900">
                            {profile.session}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Computer Courses */}
                {profile.category === 'computer_courses' && (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {profile.computer_course && (
                      <div className="flex items-center gap-3 rounded-lg border border-purple-100 bg-white p-3">
                        <BookMarked className="h-5 w-5 shrink-0 text-purple-600" />
                        <div className="min-w-0">
                          <p className="text-xs text-gray-500">Course</p>
                          <p className="truncate font-semibold text-gray-900">
                            {profile.computer_course}
                          </p>
                        </div>
                      </div>
                    )}
                    {profile.batch && (
                      <div className="flex items-center gap-3 rounded-lg border border-purple-100 bg-white p-3">
                        <Clock className="h-5 w-5 shrink-0 text-purple-600" />
                        <div className="min-w-0">
                          <p className="text-xs text-gray-500">Batch</p>
                          <p className="truncate font-semibold text-gray-900">
                            {profile.batch}
                          </p>
                        </div>
                      </div>
                    )}
                    {profile.batch_timing && (
                      <div className="flex items-center gap-3 rounded-lg border border-purple-100 bg-white p-3">
                        <Clock className="h-5 w-5 shrink-0 text-purple-600" />
                        <div className="min-w-0">
                          <p className="text-xs text-gray-500">Batch Timing</p>
                          <p className="truncate font-semibold text-gray-900">
                            {profile.batch_timing}
                          </p>
                        </div>
                      </div>
                    )}
                    {profile.duration && (
                      <div className="flex items-center gap-3 rounded-lg border border-purple-100 bg-white p-3">
                        <Calendar className="h-5 w-5 shrink-0 text-purple-600" />
                        <div className="min-w-0">
                          <p className="text-xs text-gray-500">Duration</p>
                          <p className="truncate font-semibold text-gray-900">
                            {profile.duration}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* =====================================================
            TABS
        ====================================================== */}

        <Tabs defaultValue="notices" className="w-full">

          <TabsList className="mb-4 flex h-auto w-full justify-start gap-1.5 overflow-x-auto rounded-xl bg-blue-50 p-1.5 sm:mb-6">

            {/* Notices */}
            <TabsTrigger
              value="notices"
              className="shrink-0 gap-1.5 whitespace-nowrap px-2 py-1.5 text-xs data-[state=active]:bg-blue-600 data-[state=active]:text-white sm:px-3 sm:text-sm"
            >
              <Bell className="h-3.5 w-3.5 sm:h-4 sm:w-4" />

              Notices

              {notices.length > 0 && (
                <span className="ml-1 rounded-full bg-white/20 px-1.5 text-[10px] sm:text-xs">
                  {notices.length}
                </span>
              )}
            </TabsTrigger>

            {/* Courses */}
            <TabsTrigger
              value="courses"
              className="shrink-0 gap-1.5 whitespace-nowrap px-2 py-1.5 text-xs data-[state=active]:bg-blue-600 data-[state=active]:text-white sm:px-3 sm:text-sm"
            >
              <BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4" />

              Courses

              {courses.length > 0 && (
                <span className="ml-1 rounded-full bg-white/20 px-1.5 text-[10px] sm:text-xs">
                  {courses.length}
                </span>
              )}
            </TabsTrigger>

            {/* Mock Tests */}
            <TabsTrigger
              value="mocks"
              disabled={!isApproved}
              className="shrink-0 gap-1.5 whitespace-nowrap px-2 py-1.5 text-xs data-[state=active]:bg-blue-600 data-[state=active]:text-white disabled:cursor-not-allowed disabled:opacity-50 sm:px-3 sm:text-sm"
            >
              {isApproved ? (
                <HelpCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              ) : (
                <Lock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              )}

              Mock Tests

              {isApproved && quizzes.length > 0 && (
                <span className="ml-1 rounded-full bg-white/20 px-1.5 text-[10px] sm:text-xs">
                  {quizzes.length}
                </span>
              )}
            </TabsTrigger>

            {/* Results */}
            <TabsTrigger
              value="results"
              disabled={!isApproved}
              className="shrink-0 gap-1.5 whitespace-nowrap px-2 py-1.5 text-xs data-[state=active]:bg-blue-600 data-[state=active]:text-white disabled:cursor-not-allowed disabled:opacity-50 sm:px-3 sm:text-sm"
            >
              {isApproved ? (
                <Award className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              ) : (
                <Lock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              )}

              My Results

              {isApproved && quizAttempts.length > 0 && (
                <span className="ml-1 rounded-full bg-white/20 px-1.5 text-[10px] sm:text-xs">
                  {quizAttempts.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* =====================================================
              NOTICES
          ====================================================== */}

          <TabsContent value="notices" className="space-y-4">
            {notices.length === 0 ? (
              <Card className="border-blue-100">
                <CardContent className="py-12 text-center text-gray-400">
                  No active notices at the moment.
                </CardContent>
              </Card>
            ) : (
              notices.map((notice) => (
                <Card
                  key={notice.id}
                  className="border-blue-100 transition-all hover:shadow-md hover:shadow-blue-100/50"
                >
                  <CardHeader>
                    <div className="flex flex-col items-start justify-between gap-4 sm:flex-row">
                      <div className="min-w-0">
                        <CardTitle className="truncate">
                          {notice.title}
                        </CardTitle>

                        <CardDescription className="flex flex-wrap items-center gap-2">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${getPriorityClass(
                              notice.priority
                            )}`}
                          >
                            {notice.priority} Priority
                          </span>

                          <span className="flex items-center gap-1 text-xs">
                            <Calendar className="h-3 w-3" />
                            {formatDate(notice.created_at)}
                          </span>
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <p className="whitespace-pre-line text-gray-600">
                      {notice.content}
                    </p>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* =====================================================
              COURSES
          ====================================================== */}

          <TabsContent
            value="courses"
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {courses.length === 0 ? (
              <Card className="border-blue-100 sm:col-span-2 lg:col-span-3">
                <CardContent className="py-12 text-center text-gray-400">
                  No courses available yet.
                </CardContent>
              </Card>
            ) : (
              courses.map((course) => (
                <Card
                  key={course.id}
                  className="overflow-hidden border-blue-100 transition-all hover:shadow-md hover:shadow-blue-100/50"
                >
                  {course.image_url ? (
                    <div className="relative h-40 w-full bg-gray-100">
                      <img
                        src={course.image_url}
                        alt={course.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-24 items-center justify-center bg-gradient-to-br from-yellow-50 to-blue-50">
                      <span className="text-4xl font-bold text-blue-200">
                        {course.title.charAt(0)}
                      </span>
                    </div>
                  )}

                  <CardHeader>
                    <CardTitle className="line-clamp-2 text-lg">
                      {course.title}
                    </CardTitle>

                    <CardDescription className="line-clamp-3">
                      {course.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-1 text-sm">
                    {course.duration && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">
                          Duration:
                        </span>

                        <span className="font-medium">
                          {course.duration}
                        </span>
                      </div>
                    )}

                    {course.fee && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">
                          Fee:
                        </span>

                        <span className="font-medium">
                          {course.fee}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* =====================================================
              MOCK TESTS
          ====================================================== */}

          <TabsContent value="mocks" className="space-y-8">

            {!isApproved ? (
              <Card className="border-yellow-200 bg-gradient-to-br from-yellow-50 via-white to-blue-50">
                <CardContent className="flex flex-col items-center px-5 py-14 text-center sm:px-8">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-yellow-100">
                    <Lock className="h-9 w-9 text-yellow-600" />
                  </div>

                  <h2 className="mt-6 text-2xl font-bold text-gray-900">
                    Mock Tests are Locked
                  </h2>

                  <p className="mt-2 max-w-lg text-sm leading-6 text-gray-600">
                    Your account is currently waiting for
                    administrator approval. Once your account
                    is approved, you will be able to access
                    mock tests and online quizzes.
                  </p>

                  <div className="mt-6 flex items-center gap-2 rounded-full border border-yellow-200 bg-white px-4 py-2 text-sm font-medium text-yellow-700">
                    <Clock className="h-4 w-4" />
                    Waiting for Admin Approval
                  </div>
                </CardContent>
              </Card>
            ) : quizzes.length === 0 ? (
              <Card className="border-blue-100">
                <CardContent className="py-12 text-center text-gray-400">
                  No mock tests available yet. Please check
                  back later!
                </CardContent>
              </Card>
            ) : (
              quizSubjects.map((subject) => {
                const subjectQuizzes = quizzes.filter(
                  (quiz) =>
                    quiz.subject_id === subject.id &&
                    (quiz.questions_count ?? 0) > 0
                );

                if (subjectQuizzes.length === 0) {
                  return null;
                }

                return (
                  <div
                    key={subject.id}
                    className="space-y-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-red-500 text-white shadow-md">
                        <BookOpen className="h-5 w-5" />
                      </div>

                      <div>
                        <h3 className="text-lg font-bold text-gray-900 sm:text-xl">
                          {subject.name}
                        </h3>

                        {subject.description && (
                          <p className="text-xs text-gray-500 sm:text-sm">
                            {subject.description}
                          </p>
                        )}
                      </div>

                      <Badge
                        variant="outline"
                        className="ml-auto border-blue-200 bg-blue-50 text-xs text-blue-700 sm:text-sm"
                      >
                        {subjectQuizzes.length}{' '}
                        Test
                        {subjectQuizzes.length !== 1
                          ? 's'
                          : ''}
                      </Badge>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {subjectQuizzes.map((quiz) => {
                        const attempt =
                          quizAttempts.find(
                            (item) =>
                              item.quiz_id === quiz.id
                          );

                        return (
                          <Card
                            key={quiz.id}
                            className="overflow-hidden border-blue-100 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-100/60"
                          >
                            <div className="h-1.5 bg-gradient-to-r from-green-500 via-blue-500 to-red-500" />

                            <CardHeader className="pb-3">
                              <CardTitle className="line-clamp-2 min-h-[1.75em] text-base sm:text-lg">
                                {quiz.title}
                              </CardTitle>

                              {quiz.description && (
                                <CardDescription className="line-clamp-2 min-h-[2.5em]">
                                  {quiz.description}
                                </CardDescription>
                              )}
                            </CardHeader>

                            <CardContent className="space-y-4">
                              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                <Badge
                                  variant="outline"
                                  className="border-blue-200 bg-blue-50/60 text-[11px] text-blue-700 sm:text-xs"
                                >
                                  <Clock className="mr-1 h-3 w-3" />
                                  {quiz.duration_minutes} min
                                </Badge>

                                <Badge
                                  variant="outline"
                                  className="border-yellow-200 bg-yellow-50/60 text-[11px] text-yellow-700 sm:text-xs"
                                >
                                  <Target className="mr-1 h-3 w-3" />
                                  Pass: {quiz.passing_score}%
                                </Badge>

                                <Badge
                                  variant="outline"
                                  className="border-purple-200 bg-purple-50/60 text-[11px] text-purple-700 sm:text-xs"
                                >
                                  <HelpCircle className="mr-1 h-3 w-3" />
                                  {quiz.questions_count ?? 0}{' '}
                                  Qs
                                </Badge>
                              </div>

                              {attempt && (
                                <div
                                  className={`rounded-lg border p-2.5 sm:p-3 ${
                                    attempt.passed
                                      ? 'border-green-200 bg-green-50'
                                      : 'border-red-200 bg-red-50'
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <span
                                      className={`text-xs font-semibold sm:text-sm ${
                                        attempt.passed
                                          ? 'text-green-700'
                                          : 'text-red-700'
                                      }`}
                                    >
                                      {attempt.passed
                                        ? '✓ Previously Passed'
                                        : '× Previous Attempt'}
                                    </span>

                                    <span
                                      className={`text-xs font-bold sm:text-sm ${
                                        attempt.percentage >=
                                        quiz.passing_score
                                          ? 'text-green-700'
                                          : 'text-red-700'
                                      }`}
                                    >
                                      {attempt.percentage}%
                                    </span>
                                  </div>

                                  <p className="mt-0.5 text-[10px] text-gray-500 sm:text-xs">
                                    Taken{' '}
                                    {formatDate(
                                      attempt.completed_at
                                    )}
                                  </p>
                                </div>
                              )}

                              <Button
                                onClick={() =>
                                  router.push(
                                    `/student/quiz/${quiz.id}`
                                  )
                                }
                                className="w-full gap-1.5 bg-gradient-to-r from-blue-600 to-blue-700 text-sm text-white hover:from-blue-700 hover:to-blue-800"
                              >
                                {attempt
                                  ? 'Retake Test'
                                  : 'Start Test'}

                                <ChevronRight className="h-4 w-4" />
                              </Button>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </TabsContent>

          {/* =====================================================
              RESULTS
          ====================================================== */}

          <TabsContent value="results" className="space-y-4">

            {!isApproved ? (
              <Card className="border-yellow-200 bg-gradient-to-br from-yellow-50 via-white to-blue-50">
                <CardContent className="flex flex-col items-center px-5 py-14 text-center sm:px-8">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-yellow-100">
                    <Lock className="h-9 w-9 text-yellow-600" />
                  </div>

                  <h2 className="mt-6 text-2xl font-bold text-gray-900">
                    Results are Locked
                  </h2>

                  <p className="mt-2 max-w-lg text-sm leading-6 text-gray-600">
                    Your account needs to be approved by an
                    administrator before you can access quiz
                    results.
                  </p>

                  <div className="mt-6 flex items-center gap-2 rounded-full border border-yellow-200 bg-white px-4 py-2 text-sm font-medium text-yellow-700">
                    <Clock className="h-4 w-4" />
                    Waiting for Admin Approval
                  </div>
                </CardContent>
              </Card>
            ) : quizAttempts.length === 0 ? (
              <Card className="border-blue-100">
                <CardContent className="py-12 text-center text-gray-400">
                  You haven&apos;t taken any tests yet.
                </CardContent>
              </Card>
            ) : (
              <Card className="overflow-hidden border-blue-100">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px] border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-blue-100 bg-blue-50">
                        <th className="px-4 py-3 text-left font-semibold text-blue-900">
                          Quiz
                        </th>

                        <th className="px-4 py-3 text-left font-semibold text-blue-900">
                          Score
                        </th>

                        <th className="px-4 py-3 text-left font-semibold text-blue-900">
                          Percentage
                        </th>

                        <th className="px-4 py-3 text-left font-semibold text-blue-900">
                          Status
                        </th>

                        <th className="px-4 py-3 text-left font-semibold text-blue-900">
                          Date
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {quizAttempts.map((attempt) => (
                        <tr
                          key={attempt.id}
                          className="border-b border-blue-50 hover:bg-yellow-50/30"
                        >
                          <td className="px-4 py-3 font-medium">
                            {attempt.quizzes?.title ||
                              'Quiz'}
                          </td>

                          <td className="px-4 py-3 text-gray-600">
                            {attempt.score}/
                            {attempt.total_questions}
                          </td>

                          <td className="px-4 py-3">
                            <span
                              className={`font-semibold ${
                                attempt.percentage >= 60
                                  ? 'text-green-600'
                                  : 'text-red-600'
                              }`}
                            >
                              {attempt.percentage}%
                            </span>
                          </td>

                          <td className="px-4 py-3">
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                attempt.passed
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {attempt.passed
                                ? 'Passed'
                                : 'Failed'}
                            </span>
                          </td>

                          <td className="px-4 py-3 text-gray-500">
                            {formatDate(
                              attempt.completed_at
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}