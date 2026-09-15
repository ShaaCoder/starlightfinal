'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Quiz, QuizQuestion, QuizSubject } from '@/lib/types';
import {
  Loader as Loader2,
  ArrowLeft,
  Clock,
  Target,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Award,
  Send,
  BookOpen,
  TimerReset,
  LogOut,
  GraduationCap,
} from 'lucide-react';

type Phase = 'loading' | 'start' | 'quiz' | 'submitting' | 'results';

interface AnsweredState {
  [questionId: string]: 'a' | 'b' | 'c' | 'd' | undefined;
}

interface QuestionMarkState {
  [questionId: string]: boolean;
}

export default function StudentQuizPage() {
  const router = useRouter();
  const params = useParams<{ quizId: string }>();
  const quizId = params.quizId;

  const { user, role, profile, isLoading: authLoading } = useAuth();
  const supabase = useRef(createClient()).current;
  const { toast } = useToast();

  const [phase, setPhase] = useState<Phase>('loading');
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [subject, setSubject] = useState<QuizSubject | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<AnsweredState>({});
  const [marked, setMarked] = useState<QuestionMarkState>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedAtRef = useRef<string>('');
  const unloadConfirmRef = useRef(false);

  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Results state
  const [resultScore, setResultScore] = useState(0);
  const [resultTotal, setResultTotal] = useState(0);
  const [resultPercentage, setResultPercentage] = useState(0);
  const [resultPassed, setResultPassed] = useState(false);
  const [resultTimeTaken, setResultTimeTaken] = useState(0);
  const [showExplanations, setShowExplanations] = useState(true);

  // ---------------------- Load data ----------------------
  const loadData = useCallback(async () => {
    if (!quizId) return;
    setPhase('loading');
    try {
      const { data: quizData, error: quizErr } = await supabase
        .from('quizzes')
        .select('*')
        .eq('id', quizId)
        .maybeSingle();

      if (quizErr) throw quizErr;
      if (!quizData) {
        toast({ title: 'Error', description: 'Quiz not found', variant: 'destructive' });
        router.push('/student/dashboard');
        return;
      }
      const loadedQuiz = quizData as unknown as Quiz;
      setQuiz(loadedQuiz);

      if (!loadedQuiz.is_active) {
        toast({
          title: 'Quiz Inactive',
          description: 'This test is currently unavailable.',
          variant: 'destructive',
        });
        router.push('/student/dashboard');
        return;
      }

      if (loadedQuiz.subject_id) {
        const { data: subjData } = await supabase
          .from('quiz_subjects')
          .select('*')
          .eq('id', loadedQuiz.subject_id)
          .maybeSingle();
        if (subjData) setSubject(subjData as unknown as QuizSubject);
      }

      const { data: qsData, error: qsErr } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('quiz_id', quizId)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true });

      if (qsErr) throw qsErr;
      const qs = (qsData || []) as unknown as QuizQuestion[];
      if (qs.length === 0) {
        toast({
          title: 'No Questions',
          description: 'This test has no questions yet.',
          variant: 'destructive',
        });
        router.push('/student/dashboard');
        return;
      }
      setQuestions(qs);
      setTimeLeft(loadedQuiz.duration_minutes * 60);
      setPhase('start');
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Failed to load the test',
        variant: 'destructive',
      });
      router.push('/student/dashboard');
    }
  }, [quizId, supabase, toast, router]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/auth/login');
      return;
    }
    if (role && role !== 'student') {
      router.push('/admin');
      return;
    }
    if (role === 'student' && phase === 'loading') {
      loadData();
    }
  }, [authLoading, user, role, router, loadData, phase]);

  // ---------------------- Timer ----------------------
  useEffect(() => {
    if (phase !== 'quiz') return;
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          // auto-submit
          setTimeout(() => handleSubmit(true), 0);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // ---------------------- Warn on leave during quiz ----------------------
  useEffect(() => {
    if (phase !== 'quiz') return;
    unloadConfirmRef.current = true;
    const handler = (e: BeforeUnloadEvent) => {
      if (unloadConfirmRef.current) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => {
      window.removeEventListener('beforeunload', handler);
      unloadConfirmRef.current = false;
    };
  }, [phase]);

  // ---------------------- Start quiz ----------------------
  const startQuiz = () => {
    startedAtRef.current = new Date().toISOString();
    setCurrentIdx(0);
    setAnswers({});
    setMarked({});
    setPhase('quiz');
    setTimeLeft(quiz!.duration_minutes * 60);
  };

  // ---------------------- Navigation helpers ----------------------
  const answeredCount = questions.filter((q) => answers[q.id]).length;
  const markedCount = questions.filter((q) => marked[q.id]).length;

  const selectAnswer = (questionId: string, opt: 'a' | 'b' | 'c' | 'd') => {
    setAnswers((prev) => ({ ...prev, [questionId]: opt }));
  };

  const toggleMark = (questionId: string) => {
    setMarked((prev) => ({ ...prev, [questionId]: !prev[questionId] }));
  };

  const goto = (idx: number) => {
    if (idx >= 0 && idx < questions.length) setCurrentIdx(idx);
  };

  // ---------------------- Submit ----------------------
  const handleSubmit = async (auto: boolean = false) => {
    if (phase === 'submitting' || !quiz) return;
    setShowSubmitDialog(false);
    setPhase('submitting');
    setSubmitError(null);

    try {
      // calculate score
      let score = 0;
      const total = questions.length;
      questions.forEach((q) => {
        if (answers[q.id] === q.correct_answer) score += 1;
      });
      const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
      const passed = percentage >= quiz.passing_score;
      const startedAt = startedAtRef.current || new Date().toISOString();
      const completedAt = new Date().toISOString();
      const totalSeconds = quiz.duration_minutes * 60;
      const timeTaken = Math.max(1, totalSeconds - timeLeft);

      // Insert attempt
      const { data: attemptData, error: attemptErr } = await (supabase.from(
        'quiz_attempts'
      ) as any).insert([
        {
          quiz_id: quiz.id,
          user_id: user?.id ?? null,
          student_name: profile?.full_name || user?.email || 'Student',
          student_email: user?.email ?? null,
          score,
          total_questions: total,
          percentage,
          passed,
          time_taken_seconds: timeTaken,
          started_at: startedAt,
          completed_at: completedAt,
        },
      ]).select();

      if (attemptErr) throw attemptErr;

      // Insert each answer
      const attemptId = attemptData?.[0]?.id;
      if (attemptId && questions.length > 0) {
        const answersRows = questions.map((q) => {
          const sel = answers[q.id];
          return {
            attempt_id: attemptId,
            question_id: q.id,
            selected_answer: sel ?? null,
            is_correct: sel ? sel === q.correct_answer : false,
          };
        });
        const { error: ansErr } = await (supabase.from('quiz_answers') as any).insert(
          answersRows
        );
        if (ansErr) console.warn('Failed to save individual answers:', ansErr);
      }

      unloadConfirmRef.current = false;
      setResultScore(score);
      setResultTotal(total);
      setResultPercentage(percentage);
      setResultPassed(passed);
      setResultTimeTaken(timeTaken);
      setPhase('results');

      toast({
        title: auto ? 'Time up! Test Submitted' : 'Test Submitted',
        description: passed ? `🎉 You passed with ${percentage}%` : `Score: ${percentage}%`,
        variant: passed ? 'default' : 'destructive',
      });
    } catch (error) {
      console.error(error);
      setSubmitError(
        error instanceof Error ? error.message : 'Failed to submit. Please try again.'
      );
      setPhase('quiz');
      toast({
        title: 'Submit Failed',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  // ---------------------- Formatters ----------------------
  const fmtTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const fmtTimeTaken = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const sec = secs % 60;
    return mins > 0 ? `${mins} min ${sec} sec` : `${sec} sec`;
  };

  const questionClass = (q: QuizQuestion, idx: number) => {
    const active = idx === currentIdx;
    const answered = !!answers[q.id];
    const flagged = !!marked[q.id];
    let base = 'h-9 w-9 sm:h-10 sm:w-10 rounded-lg border-2 text-xs sm:text-sm font-semibold flex items-center justify-center transition-all cursor-pointer shrink-0 ';
    if (active) {
      base += 'border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-200 ';
    } else if (answered) {
      base += flagged
        ? 'border-yellow-400 bg-yellow-100 text-yellow-800 '
        : 'border-green-400 bg-green-100 text-green-700 ';
    } else if (flagged) {
      base += 'border-yellow-300 bg-yellow-50 text-yellow-700 ';
    } else {
      base += 'border-gray-200 bg-white text-gray-600 hover:border-blue-300 hover:bg-blue-50 ';
    }
    return base;
  };

  const unanswered = questions.length - answeredCount;
  const timerCritical = timeLeft <= 60;
  const timerWarn = timeLeft <= 300 && !timerCritical;

  const current = questions[currentIdx];

  // ---------------------- RENDER ----------------------
  if (authLoading || phase === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-b from-yellow-50 via-white to-blue-50">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user || !quiz) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 via-white to-blue-50">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-blue-100 bg-white/90 backdrop-blur">
        <div className="mx-auto max-w-7xl px-3 py-3 sm:px-4 sm:py-4 lg:px-8">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 sm:h-10 sm:w-10 shrink-0">
                <GraduationCap className="h-5 w-5 text-white sm:h-6 sm:w-6" />
              </div>
              <div className="min-w-0">
                <h1 className="text-base font-bold text-gray-900 sm:text-xl truncate">
                  {quiz.title}
                </h1>
                <p className="text-[10px] sm:text-xs text-gray-500 truncate">
                  {subject?.name || 'Mock Test'} • Vihaan Education Academy
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
              {phase === 'quiz' && (
                <div
                  className={`flex items-center gap-1.5 sm:gap-2 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 font-bold border-2 shadow-sm ${
                    timerCritical
                      ? 'bg-red-50 border-red-300 text-red-700 animate-pulse'
                      : timerWarn
                        ? 'bg-yellow-50 border-yellow-300 text-yellow-700'
                        : 'bg-blue-50 border-blue-200 text-blue-700'
                  }`}
                >
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="tabular-nums text-sm sm:text-lg">{fmtTime(timeLeft)}</span>
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/student/dashboard')}
                disabled={phase === 'quiz'}
                className="gap-1.5 border-blue-200 text-blue-700 hover:bg-blue-50 hidden sm:inline-flex"
              >
                <ArrowLeft className="h-4 w-4" /> Dashboard
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/student/dashboard')}
                disabled={phase === 'quiz'}
                className="text-blue-700 hover:bg-blue-50 sm:hidden"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-3 py-6 sm:px-4 sm:py-8 lg:px-8">
        {/* ------------------ START PHASE ------------------ */}
        {phase === 'start' && (
          <div className="mx-auto max-w-3xl">
            <Card className="border-blue-100 shadow-xl shadow-blue-100/40 overflow-hidden">
              <div className="h-3 bg-gradient-to-r from-green-500 via-blue-600 to-red-500" />
              <CardHeader className="pb-4 sm:pb-6">
                <CardTitle className="text-xl sm:text-3xl text-blue-900 flex items-start gap-3">
                  <BookOpen className="h-7 w-7 sm:h-9 sm:w-9 shrink-0 mt-1 text-blue-600" />
                  <span>Instructions &amp; Information</span>
                </CardTitle>
                <CardDescription className="pt-2 sm:text-base">
                  Read the following carefully before starting the mock test.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-3 sm:gap-4 sm:grid-cols-3">
                  <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4 text-center">
                    <Clock className="h-6 w-6 mx-auto text-blue-600 mb-2" />
                    <p className="text-xs text-gray-500 mb-0.5">Duration</p>
                    <p className="text-lg font-bold text-blue-900">{quiz.duration_minutes} min</p>
                  </div>
                  <div className="rounded-xl border border-purple-100 bg-purple-50/60 p-4 text-center">
                    <HelpCircle className="h-6 w-6 mx-auto text-purple-600 mb-2" />
                    <p className="text-xs text-gray-500 mb-0.5">Questions</p>
                    <p className="text-lg font-bold text-purple-900">{questions.length}</p>
                  </div>
                  <div className="rounded-xl border border-yellow-100 bg-yellow-50/60 p-4 text-center">
                    <Target className="h-6 w-6 mx-auto text-yellow-600 mb-2" />
                    <p className="text-xs text-gray-500 mb-0.5">Passing Score</p>
                    <p className="text-lg font-bold text-yellow-800">{quiz.passing_score}%</p>
                  </div>
                </div>

                {quiz.description && (
                  <div className="rounded-xl border border-blue-100 bg-white p-4 sm:p-5">
                    <h3 className="text-sm sm:text-base font-semibold text-blue-900 mb-1.5">About this Test</h3>
                    <p className="text-sm sm:text-base text-gray-700 whitespace-pre-line">
                      {quiz.description}
                    </p>
                  </div>
                )}

                <div className="rounded-xl border border-blue-100 bg-gradient-to-br from-yellow-50 to-blue-50 p-4 sm:p-5 space-y-3">
                  <h3 className="text-sm sm:text-base font-semibold text-blue-900 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-blue-600" /> Rules &amp; Instructions
                  </h3>
                  <ul className="space-y-2 text-xs sm:text-sm text-gray-700">
                    <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                      Each question has four options with only <b>one correct answer</b>.
                    </li>
                    <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                      Use the <b>Mark for Review</b> option to flag questions to revisit later.
                    </li>
                    <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                      You can <b>navigate between questions</b> freely using the question grid or arrow buttons.
                    </li>
                    <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                      The timer will auto-submit the test when it expires.
                    </li>
                    <li className="flex items-start gap-2"><XCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                      <b>Do not refresh or close</b> the page while taking the test — you may lose your answers.
                    </li>
                    <li className="flex items-start gap-2"><AlertCircle className="h-4 w-4 text-yellow-600 shrink-0 mt-0.5" />
                      Your results (with explanations) will be shown immediately after you submit.
                    </li>
                  </ul>
                </div>

                <div className="flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => router.push('/student/dashboard')}
                    className="w-full sm:w-auto border-blue-200 text-blue-700 hover:bg-blue-50"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
                  </Button>
                  <Button
                    onClick={startQuiz}
                    className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-md shadow-blue-200 text-base px-8 h-12"
                  >
                    <TimerReset className="h-5 w-5 mr-2" /> Start Mock Test
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ------------------ QUIZ PHASE ------------------ */}
        {phase === 'quiz' && current && (
          <div className="grid gap-4 lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_360px]">
            {/* Question area */}
            <div className="space-y-4 min-w-0">
              <Card className="border-blue-100 shadow-sm sticky top-[69px] sm:top-[77px] z-10">
                <CardContent className="py-3 px-4 sm:px-5">
                  <div className="flex flex-wrap items-center gap-3 justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-blue-600 text-white text-xs sm:text-sm">
                        Q {currentIdx + 1} / {questions.length}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`border-2 ${
                          !!answers[current.id]
                            ? 'border-green-400 bg-green-50 text-green-700'
                            : 'border-gray-200 bg-white text-gray-500'
                        }`}
                      >
                        {!!answers[current.id] ? '✓ Answered' : 'Not Answered'}
                      </Badge>
                      {marked[current.id] && (
                        <Badge
                          variant="outline"
                          className="border-yellow-400 bg-yellow-50 text-yellow-700 border-2"
                        >
                          ⚑ Marked
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleMark(current.id)}
                      className={`text-xs sm:text-sm h-9 ${
                        marked[current.id]
                          ? 'bg-yellow-50 border-yellow-400 text-yellow-700 hover:bg-yellow-100'
                          : 'border-blue-200 text-blue-700 hover:bg-blue-50'
                      }`}
                    >
                      {marked[current.id] ? 'Unmark Review' : '⚑ Mark for Review'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-blue-100 shadow-sm overflow-hidden">
                <CardContent className="p-5 sm:p-8 space-y-6 sm:space-y-8">
                  <div>
                    <h2 className="text-base sm:text-xl lg:text-2xl font-semibold text-gray-900 whitespace-pre-wrap leading-relaxed">
                      <span className="text-blue-600 mr-2">Q{currentIdx + 1}.</span>
                      {current.question_text}
                    </h2>
                  </div>

                  <div className="space-y-2.5 sm:space-y-3">
                    {(['a', 'b', 'c', 'd'] as const).map((opt) => {
                      const selected = answers[current.id] === opt;
                      const letters: Record<string, string> = { a: 'A', b: 'B', c: 'C', d: 'D' };
                      const val = current[`option_${opt}` as 'option_a' | 'option_b' | 'option_c' | 'option_d'];
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => selectAnswer(current.id, opt)}
                          className={`w-full text-left rounded-xl border-2 p-3.5 sm:p-4 transition-all group ${
                            selected
                              ? 'border-blue-600 bg-blue-50 shadow-sm shadow-blue-100 ring-2 ring-blue-200'
                              : 'border-gray-200 bg-white hover:border-blue-400 hover:bg-blue-50/40'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full text-sm sm:text-base font-bold transition-colors ${
                                selected
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-700'
                              }`}
                            >
                              {letters[opt]}
                            </div>
                            <p
                              className={`pt-1 sm:pt-0.5 text-sm sm:text-base leading-relaxed ${
                                selected ? 'text-blue-900 font-medium' : 'text-gray-700'
                              }`}
                            >
                              {val}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <div className="flex items-center justify-between gap-2 pt-1">
                <Button
                  variant="outline"
                  onClick={() => goto(currentIdx - 1)}
                  disabled={currentIdx === 0}
                  className="gap-1.5 border-blue-200 text-blue-700 hover:bg-blue-50"
                >
                  <ChevronLeft className="h-4 w-4" /> Prev
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowSubmitDialog(true)}
                  className="gap-1.5 bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 border-0 shadow-sm shadow-green-200"
                >
                  <Send className="h-4 w-4" /> Submit Test
                </Button>
                <Button
                  variant="outline"
                  onClick={() => goto(currentIdx + 1)}
                  disabled={currentIdx === questions.length - 1}
                  className="gap-1.5 border-blue-200 text-blue-700 hover:bg-blue-50"
                >
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Sidebar */}
            <aside className="space-y-4 lg:sticky lg:top-[77px] lg:self-start">
              <Card className="border-blue-100 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm sm:text-base text-blue-900 flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 sm:h-5 sm:w-5" /> Question Navigator
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Click any question number to jump to it.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-5 sm:grid-cols-6 lg:grid-cols-5 gap-1.5 sm:gap-2">
                    {questions.map((q, i) => (
                      <button key={q.id} onClick={() => goto(i)} className={questionClass(q, i)}>
                        {i + 1}
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs border-t border-blue-100 pt-4">
                    <div className="flex items-center gap-2">
                      <span className="h-4 w-4 rounded-md border border-green-400 bg-green-100" /> Answered
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="h-4 w-4 rounded-md border border-gray-200 bg-white" /> Unanswered
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="h-4 w-4 rounded-md border border-yellow-300 bg-yellow-50" /> Marked
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="h-4 w-4 rounded-md border border-blue-600 bg-blue-600" /> Current
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-blue-100 shadow-sm">
                <CardContent className="p-4 sm:p-5 space-y-3">
                  <h3 className="text-sm font-semibold text-blue-900">Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Answered</span>
                      <span className="font-bold text-green-700">{answeredCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Unanswered</span>
                      <span className="font-bold text-red-600">{unanswered}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Marked for Review</span>
                      <span className="font-bold text-yellow-700">{markedCount}</span>
                    </div>
                  </div>
                  <Button
                    onClick={() => setShowSubmitDialog(true)}
                    className="w-full gap-1.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800"
                  >
                    <Send className="h-4 w-4" /> Submit Test
                  </Button>
                </CardContent>
              </Card>
            </aside>
          </div>
        )}

        {/* ------------------ SUBMITTING ------------------ */}
        {phase === 'submitting' && (
          <div className="mx-auto max-w-md py-12 sm:py-16 text-center space-y-5">
            <div className="flex justify-center">
              <Loader2 className="h-14 w-14 animate-spin text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-blue-900">Submitting your test…</h2>
            <p className="text-gray-500">
              Please wait while we save your answers and calculate the result.
            </p>
            {submitError && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                {submitError}
              </p>
            )}
          </div>
        )}

        {/* ------------------ RESULTS ------------------ */}
        {phase === 'results' && quiz && (
          <div className="mx-auto max-w-4xl space-y-6">
            {/* Result header */}
            <Card
              className={`border-2 overflow-hidden shadow-xl ${
                resultPassed ? 'border-green-300 shadow-green-200/40' : 'border-red-300 shadow-red-200/40'
              }`}
            >
              <div
                className={`h-3 ${
                  resultPassed
                    ? 'bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500'
                    : 'bg-gradient-to-r from-orange-400 via-red-500 to-rose-500'
                }`}
              />
              <CardContent className="p-5 sm:p-8">
                <div className="flex flex-col md:flex-row md:items-center gap-5 sm:gap-8">
                  <div
                    className={`flex h-24 w-24 sm:h-32 sm:w-32 shrink-0 rounded-full items-center justify-center border-4 mx-auto md:mx-0 ${
                      resultPassed
                        ? 'border-green-400 bg-gradient-to-br from-green-50 to-emerald-100 text-green-700'
                        : 'border-red-400 bg-gradient-to-br from-red-50 to-orange-100 text-red-700'
                    }`}
                  >
                    {resultPassed ? (
                      <Award className="h-12 w-12 sm:h-16 sm:w-16" />
                    ) : (
                      <AlertCircle className="h-12 w-12 sm:h-16 sm:w-16" />
                    )}
                  </div>
                  <div className="flex-1 text-center md:text-left space-y-3 min-w-0">
                    <Badge
                      className={`${
                        resultPassed
                          ? 'bg-green-600 hover:bg-green-700 text-white'
                          : 'bg-red-500 hover:bg-red-600 text-white'
                      } px-4 py-1 text-sm`}
                    >
                      {resultPassed ? '🎉 PASSED' : '✗ NEEDS IMPROVEMENT'}
                    </Badge>
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 break-words">
                      {resultPercentage}%
                      <span className="text-base sm:text-lg lg:text-xl font-semibold text-gray-500 ml-2">
                        ({resultScore} / {resultTotal} correct)
                      </span>
                    </h2>
                    <p className="text-sm sm:text-base text-gray-600">
                      Passing score was <b>{quiz.passing_score}%</b>. You{' '}
                      <b>{resultPassed ? 'passed' : 'did not pass'}</b> this mock test.
                    </p>
                    <div className="flex flex-wrap gap-x-5 gap-y-1.5 justify-center md:justify-start text-xs sm:text-sm">
                      <span className="text-gray-500">
                        <b className="text-gray-700">Time taken:</b> {fmtTimeTaken(resultTimeTaken)}
                      </span>
                      <span className="text-gray-500">
                        <b className="text-gray-700">Duration:</b> {quiz.duration_minutes} min
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3 mt-6 pt-6 border-t border-blue-100">
                  <Button
                    onClick={() => startQuiz()}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 gap-1.5"
                  >
                    <TimerReset className="h-4 w-4" /> Retake Test
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push('/student/dashboard')}
                    className="border-blue-200 text-blue-700 hover:bg-blue-50 gap-1.5"
                  >
                    <ArrowLeft className="h-4 w-4" /> Back to Dashboard
                  </Button>
                  <div className="flex items-center gap-2 ml-auto bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
                    <Switch
                      id="show-expl"
                      checked={showExplanations}
                      onCheckedChange={setShowExplanations}
                    />
                    <Label htmlFor="show-expl" className="text-xs sm:text-sm font-medium cursor-pointer select-none">
                      Show Explanations
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Per question review */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 pt-2">Detailed Review</h3>
              {questions.map((q, i) => {
                const selected = answers[q.id];
                const isCorrect = selected === q.correct_answer;
                return (
                  <Card
                    key={q.id}
                    className={`overflow-hidden border-2 ${
                      isCorrect ? 'border-green-200' : 'border-red-200'
                    }`}
                  >
                    <div
                      className={`h-1.5 ${
                        isCorrect ? 'bg-green-500' : 'bg-red-500'
                      }`}
                    />
                    <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-5">
                      <div className="flex items-start gap-3">
                        <Badge
                          className={`shrink-0 mt-0.5 ${
                            isCorrect
                              ? 'bg-green-600 text-white'
                              : 'bg-red-500 text-white'
                          }`}
                        >
                          Q{i + 1}
                        </Badge>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 whitespace-pre-wrap leading-relaxed">
                            {q.question_text}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2 sm:space-y-2.5">
                        {(['a', 'b', 'c', 'd'] as const).map((opt) => {
                          const letters: Record<string, string> = { a: 'A', b: 'B', c: 'C', d: 'D' };
                          const val =
                            q[`option_${opt}` as 'option_a' | 'option_b' | 'option_c' | 'option_d'];
                          const isCorrectOpt = q.correct_answer === opt;
                          const isSelected = selected === opt;
                          let cls = 'rounded-xl border-2 p-3 sm:p-3.5 text-sm sm:text-base ';
                          if (isCorrectOpt) {
                            cls +=
                              'border-green-500 bg-green-50 text-green-900 ';
                          } else if (isSelected && !isCorrectOpt) {
                            cls +=
                              'border-red-400 bg-red-50 text-red-900 ';
                          } else {
                            cls += 'border-gray-200 bg-white text-gray-700 ';
                          }
                          return (
                            <div key={opt} className={cls}>
                              <div className="flex items-start gap-2.5 sm:gap-3">
                                <div
                                  className={`flex h-6 w-6 sm:h-7 sm:w-7 shrink-0 items-center justify-center rounded-full text-xs sm:text-sm font-bold ${
                                    isCorrectOpt
                                      ? 'bg-green-600 text-white'
                                      : isSelected
                                        ? 'bg-red-500 text-white'
                                        : 'bg-gray-100 text-gray-600'
                                  }`}
                                >
                                  {letters[opt]}
                                </div>
                                <div className="flex-1 min-w-0 pt-0.5 sm:pt-1">
                                  <span className={isCorrectOpt ? 'font-semibold' : ''}>{val}</span>
                                  <div className="mt-1 flex flex-wrap gap-1.5">
                                    {isCorrectOpt && (
                                      <Badge className="bg-green-600 text-white text-[10px] sm:text-xs">
                                        <CheckCircle2 className="h-3 w-3 mr-1" /> Correct Answer
                                      </Badge>
                                    )}
                                    {isSelected && !isCorrectOpt && (
                                      <Badge className="bg-red-500 text-white text-[10px] sm:text-xs">
                                        <XCircle className="h-3 w-3 mr-1" /> Your Answer
                                      </Badge>
                                    )}
                                    {!isSelected && !isCorrectOpt && selected === undefined && opt === 'a' && (
                                      <Badge variant="outline" className="border-gray-200 text-gray-500 text-[10px] sm:text-xs">
                                        ⚠ Unanswered
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {showExplanations && q.explanation && (
                        <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-3.5 sm:p-5">
                          <p className="font-semibold text-blue-900 text-xs sm:text-sm flex items-center gap-1.5 mb-1.5">
                            <BookOpen className="h-4 w-4" /> Explanation
                          </p>
                          <p className="text-xs sm:text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                            {q.explanation}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4">
              <Button
                onClick={() => startQuiz()}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 gap-1.5"
              >
                <TimerReset className="h-4 w-4" /> Retake Test
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/student/dashboard')}
                className="border-blue-200 text-blue-700 hover:bg-blue-50 gap-1.5"
              >
                <LogOut className="h-4 w-4" /> Return to Dashboard
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Submit confirmation dialog */}
      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-md border-blue-100">
          <DialogHeader>
            <DialogTitle className="text-blue-900 flex items-center gap-2">
              <Send className="h-5 w-5" /> Submit Mock Test?
            </DialogTitle>
            <DialogDescription>
              Once submitted, you cannot change your answers. Review your progress below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Questions</span>
                <span className="font-bold text-blue-900">{questions.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Answered</span>
                <span className="font-bold text-green-700">{answeredCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Unanswered</span>
                <span className={`font-bold ${unanswered > 0 ? 'text-red-600' : 'text-gray-500'}`}>
                  {unanswered}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Marked for Review</span>
                <span className="font-bold text-yellow-700">{markedCount}</span>
              </div>
              <div className="flex justify-between border-t border-blue-200 pt-2 mt-1">
                <span className="text-gray-600">Time Remaining</span>
                <span className="font-bold text-blue-900 tabular-nums">{fmtTime(timeLeft)}</span>
              </div>
            </div>
            {unanswered > 0 && (
              <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-xs sm:text-sm text-yellow-800 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>
                  You have <b>{unanswered}</b> unanswered question
                  {unanswered > 1 ? 's' : ''}. Are you sure you want to submit?
                </span>
              </div>
            )}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowSubmitDialog(false)}
              className="w-full border-blue-200 text-blue-700 hover:bg-blue-50 sm:w-auto"
            >
              Continue Test
            </Button>
            <Button
              onClick={() => handleSubmit(false)}
              disabled={phase === 'submitting'}
              className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 gap-1.5"
            >
              {phase === 'submitting' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              Submit Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
