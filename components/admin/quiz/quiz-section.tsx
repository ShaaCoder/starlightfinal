'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { QuizSubject, Quiz, QuizQuestion } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Loader2,
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  ChevronRight,
  ChevronLeft,
  HelpCircle,
  FileText,
  FolderKanban,
  Save,
  X,
  CheckCircle2,
  XCircle,
  ArrowUp,
  ArrowDown,
  ClipboardList,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';

type Level = 'subjects' | 'quizzes' | 'questions';

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

const inputClass = 'border-blue-100 focus:border-blue-400 focus:ring-blue-400';

export default function QuizSection() {
  const supabase = useRef(createClient()).current;

  const [level, setLevel] = useState<Level>('subjects');
  const [subjects, setSubjects] = useState<QuizSubject[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);

  const [selectedSubject, setSelectedSubject] = useState<QuizSubject | null>(null);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [editingSubject, setEditingSubject] = useState<QuizSubject | null>(null);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null);

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'subject' | 'quiz' | 'question';
    id: string;
  } | null>(null);

  // Forms
  const [subjectForm, setSubjectForm] = useState({ name: '', description: '' });
  const [quizForm, setQuizForm] = useState({
    title: '',
    description: '',
    duration_minutes: 30,
    passing_score: 60,
    is_active: true,
  });
  const [questionForm, setQuestionForm] = useState({
    question_text: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer: 'a' as 'a' | 'b' | 'c' | 'd',
    explanation: '',
    sort_order: 0,
  });

  const loadSubjects = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('quiz_subjects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubjects((data || []) as QuizSubject[]);
    } catch (error) {
      toast.error('Failed to load subjects');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  const loadQuizzes = useCallback(
    async (subjectId: string) => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('quizzes')
          .select(
            `*,
             quiz_questions(count)`
          )
          .eq('subject_id', subjectId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        const mapped: Quiz[] = (data || []).map((row: any) => ({
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
            Array.isArray(row.quiz_questions) && row.quiz_questions[0]
              ? (row.quiz_questions[0] as any).count
              : 0,
        }));
        setQuizzes(mapped);
      } catch (error) {
        toast.error('Failed to load quizzes');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    },
    [supabase]
  );

  const loadQuestions = useCallback(
    async (quizId: string) => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('quiz_questions')
          .select('*')
          .eq('quiz_id', quizId)
          .order('sort_order', { ascending: true })
          .order('created_at', { ascending: true });

        if (error) throw error;
        setQuestions((data || []) as QuizQuestion[]);
      } catch (error) {
        toast.error('Failed to load questions');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    },
    [supabase]
  );

  useEffect(() => {
    loadSubjects();
  }, [loadSubjects]);

  useEffect(() => {
    if (selectedSubject) {
      loadQuizzes(selectedSubject.id);
    }
  }, [selectedSubject, loadQuizzes]);

  useEffect(() => {
    if (selectedQuiz) {
      loadQuestions(selectedQuiz.id);
    }
  }, [selectedQuiz, loadQuestions]);

  // ===== SUBJECT CRUD =====
  const handleSaveSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const slug = generateSlug(subjectForm.name);
      if (editingSubject) {
        const { error } = await (supabase.from('quiz_subjects') as any)
          .update({
            name: subjectForm.name,
            description: subjectForm.description,
            slug,
          })
          .eq('id', editingSubject.id);
        if (error) throw error;
        toast.success('Subject updated');
        setEditingSubject(null);
      } else {
        const { error } = await (supabase.from('quiz_subjects') as any).insert([
          {
            name: subjectForm.name,
            description: subjectForm.description,
            slug,
          },
        ]);
        if (error) throw error;
        toast.success('Subject added');
      }
      setSubjectForm({ name: '', description: '' });
      loadSubjects();
    } catch (error) {
      toast.error(editingSubject ? 'Failed to update subject' : 'Failed to add subject');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ===== QUIZ CRUD =====
  const handleSaveQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubject) return;
    setIsSubmitting(true);
    try {
      const slug = generateSlug(quizForm.title);
      if (editingQuiz) {
        const { error } = await (supabase.from('quizzes') as any)
          .update({
            title: quizForm.title,
            description: quizForm.description,
            duration_minutes: quizForm.duration_minutes,
            passing_score: quizForm.passing_score,
            is_active: quizForm.is_active,
            slug,
          })
          .eq('id', editingQuiz.id);
        if (error) throw error;
        toast.success('Quiz updated');
        setEditingQuiz(null);
      } else {
        const { error } = await (supabase.from('quizzes') as any).insert([
          {
            subject_id: selectedSubject.id,
            title: quizForm.title,
            description: quizForm.description,
            duration_minutes: quizForm.duration_minutes,
            passing_score: quizForm.passing_score,
            is_active: quizForm.is_active,
            slug,
          },
        ]);
        if (error) throw error;
        toast.success('Quiz added to subject: ' + selectedSubject.name);
      }
      setQuizForm({
        title: '',
        description: '',
        duration_minutes: 30,
        passing_score: 60,
        is_active: true,
      });
      loadQuizzes(selectedSubject.id);
    } catch (error) {
      toast.error(editingQuiz ? 'Failed to update quiz' : 'Failed to add quiz');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ===== QUESTION CRUD =====
  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuiz) return;
    setIsSubmitting(true);
    try {
      if (editingQuestion) {
        const { error } = await (supabase.from('quiz_questions') as any)
          .update({
            question_text: questionForm.question_text,
            option_a: questionForm.option_a,
            option_b: questionForm.option_b,
            option_c: questionForm.option_c,
            option_d: questionForm.option_d,
            correct_answer: questionForm.correct_answer,
            explanation: questionForm.explanation,
            sort_order: questionForm.sort_order,
          })
          .eq('id', editingQuestion.id);
        if (error) throw error;
        toast.success('Question updated');
        setEditingQuestion(null);
      } else {
        const { error } = await (supabase.from('quiz_questions') as any).insert([
          {
            quiz_id: selectedQuiz.id,
            question_text: questionForm.question_text,
            option_a: questionForm.option_a,
            option_b: questionForm.option_b,
            option_c: questionForm.option_c,
            option_d: questionForm.option_d,
            correct_answer: questionForm.correct_answer,
            explanation: questionForm.explanation,
            sort_order: questionForm.sort_order,
          },
        ]);
        if (error) throw error;
        toast.success('Question added to quiz');
      }
      setQuestionForm({
        question_text: '',
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        correct_answer: 'a',
        explanation: '',
        sort_order: questions.length + 1,
      });
      loadQuestions(selectedQuiz.id);
    } catch (error) {
      toast.error(
        editingQuestion ? 'Failed to update question' : 'Failed to add question'
      );
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMoveQuestion = async (
    question: QuizQuestion,
    direction: 'up' | 'down'
  ) => {
    if (!selectedQuiz) return;
    const index = questions.findIndex((q) => q.id === question.id);
    if (index < 0) return;
    const neighbor =
      direction === 'up' ? questions[index - 1] : questions[index + 1];
    if (!neighbor) return;

    try {
      const { error: err1 } = await (supabase.from('quiz_questions') as any)
        .update({ sort_order: neighbor.sort_order })
        .eq('id', question.id);
      const { error: err2 } = await (supabase.from('quiz_questions') as any)
        .update({ sort_order: question.sort_order })
        .eq('id', neighbor.id);
      if (err1 || err2) throw err1 || err2;
      toast.success('Reordered');
      loadQuestions(selectedQuiz.id);
    } catch (error) {
      toast.error('Failed to reorder');
    }
  };

  const confirmDelete = (type: 'subject' | 'quiz' | 'question', id: string) => {
    setDeleteTarget({ type, id });
    setShowDeleteDialog(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const { error } = await (supabase.from(
        deleteTarget.type === 'subject'
          ? 'quiz_subjects'
          : deleteTarget.type === 'quiz'
            ? 'quizzes'
            : 'quiz_questions'
      ) as any)
        .delete()
        .eq('id', deleteTarget.id);

      if (error) throw error;
      toast.success('Deleted successfully');
      setShowDeleteDialog(false);
      setDeleteTarget(null);

      if (deleteTarget.type === 'subject') {
        loadSubjects();
        setSelectedSubject(null);
        setLevel('subjects');
      } else if (deleteTarget.type === 'quiz' && selectedSubject) {
        loadQuizzes(selectedSubject.id);
        setSelectedQuiz(null);
        setLevel('quizzes');
      } else if (deleteTarget.type === 'question' && selectedQuiz) {
        loadQuestions(selectedQuiz.id);
      }
    } catch (error) {
      toast.error('Failed to delete');
      console.error(error);
    }
  };

  const openSubject = (subject: QuizSubject) => {
    setSelectedSubject(subject);
    setSelectedQuiz(null);
    setLevel('quizzes');
  };

  const openQuiz = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setLevel('questions');
    setQuestionForm((q) => ({ ...q, sort_order: questions.length + 1 }));
  };

  const goBack = () => {
    if (level === 'quizzes') {
      setLevel('subjects');
      setSelectedSubject(null);
    } else if (level === 'questions') {
      setLevel('quizzes');
      setSelectedQuiz(null);
    }
  };

  const startEditSubject = (subject: QuizSubject) => {
    setEditingSubject(subject);
    setSubjectForm({ name: subject.name, description: subject.description || '' });
  };

  const startEditQuiz = (quiz: Quiz) => {
    setEditingQuiz(quiz);
    setQuizForm({
      title: quiz.title,
      description: quiz.description || '',
      duration_minutes: quiz.duration_minutes,
      passing_score: quiz.passing_score,
      is_active: quiz.is_active,
    });
  };

  const startEditQuestion = (q: QuizQuestion) => {
    setEditingQuestion(q);
    setQuestionForm({
      question_text: q.question_text,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
      correct_answer: q.correct_answer,
      explanation: q.explanation || '',
      sort_order: q.sort_order,
    });
  };

  const cancelEdit = () => {
    setEditingSubject(null);
    setEditingQuiz(null);
    setEditingQuestion(null);
    setSubjectForm({ name: '', description: '' });
    setQuizForm({
      title: '',
      description: '',
      duration_minutes: 30,
      passing_score: 60,
      is_active: true,
    });
    setQuestionForm({
      question_text: '',
      option_a: '',
      option_b: '',
      option_c: '',
      option_d: '',
      correct_answer: 'a',
      explanation: '',
      sort_order: questions.length + 1,
    });
  };

  // ===== RENDER =====
  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setLevel('subjects');
            setSelectedSubject(null);
            setSelectedQuiz(null);
          }}
          className={
            level === 'subjects'
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'text-blue-700 hover:bg-blue-50'
          }
        >
          <FolderKanban className="h-4 w-4 mr-1" /> Subjects
        </Button>
        {level !== 'subjects' && (
          <>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => selectedSubject && openSubject(selectedSubject)}
              className={
                level === 'quizzes'
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'text-blue-700 hover:bg-blue-50'
              }
              disabled={!selectedSubject}
            >
              <FileText className="h-4 w-4 mr-1" />
              {selectedSubject?.name || 'Quizzes'}
            </Button>
          </>
        )}
        {level === 'questions' && (
          <>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <Button variant="ghost" size="sm" className="bg-blue-600 text-white">
              <HelpCircle className="h-4 w-4 mr-1" />
              {selectedQuiz?.title || 'Questions'}
            </Button>
          </>
        )}
        {level !== 'subjects' && (
          <Button
            variant="outline"
            size="sm"
            onClick={goBack}
            className="ml-auto border-blue-200 text-blue-700 hover:bg-blue-50"
          >
            <ChevronLeft className="h-4 w-4" /> Back
          </Button>
        )}
      </div>

      {/* LEVEL 1: SUBJECTS */}
      {level === 'subjects' && (
        <>
          <Card className="border-blue-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-900">
                <Plus className="h-5 w-5" />
                {editingSubject ? 'Edit Subject' : 'Add New Subject'}
              </CardTitle>
              <CardDescription>
                Create subjects to organize your quizzes (e.g. Mathematics, Science, English)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveSubject} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Subject Name *</Label>
                    <Input
                      value={subjectForm.name}
                      onChange={(e) => setSubjectForm((s) => ({ ...s, name: e.target.value }))}
                      required
                      placeholder="e.g. Mathematics, Science, English Grammar"
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Description</Label>
                    <Textarea
                      value={subjectForm.description}
                      onChange={(e) =>
                        setSubjectForm((s) => ({ ...s, description: e.target.value }))
                      }
                      rows={2}
                      placeholder="Short description of this subject"
                      className={inputClass}
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-blue-600 text-white hover:bg-blue-700"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    {editingSubject ? 'Update Subject' : 'Add Subject'}
                  </Button>
                  {editingSubject && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={cancelEdit}
                      className="border-blue-200 text-blue-700 hover:bg-blue-50"
                    >
                      <X className="h-4 w-4 mr-2" /> Cancel
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {isLoading && subjects.length === 0 ? (
              <div className="sm:col-span-2 lg:col-span-3 flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : subjects.length === 0 ? (
              <Card className="sm:col-span-2 lg:col-span-3 border-blue-100">
                <CardContent className="py-12 text-center text-gray-400">
                  No subjects yet. Add your first subject above.
                </CardContent>
              </Card>
            ) : (
              subjects.map((subject) => (
                <Card
                  key={subject.id}
                  className="border-blue-100 transition-all hover:shadow-md hover:shadow-blue-100/50 overflow-hidden group"
                >
                  <div className="h-2 bg-gradient-to-r from-blue-600 to-red-500" />
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle
                        className="text-lg cursor-pointer hover:text-blue-700 transition-colors"
                        onClick={() => openSubject(subject)}
                      >
                        <span className="flex items-center gap-2">
                          <BookOpen className="h-5 w-5 text-blue-600" />
                          {subject.name}
                        </span>
                      </CardTitle>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openSubject(subject)}
                        className="text-blue-600 hover:bg-blue-50 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Open <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                    {subject.description && (
                      <CardDescription className="line-clamp-2">
                        {subject.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50/50">
                        {quizzes.filter((q) => q.subject_id === subject.id).length || 0} Quizzes
                      </Badge>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => startEditSubject(subject)}
                          className="h-8 w-8 p-0 border-yellow-200 text-yellow-700 hover:bg-yellow-50"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => confirmDelete('subject', subject.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </>
      )}

      {/* LEVEL 2: QUIZZES */}
      {level === 'quizzes' && selectedSubject && (
        <>
          <Card className="border-blue-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-900">
                <Plus className="h-5 w-5" />
                {editingQuiz ? 'Edit Quiz' : `Add Quiz to ${selectedSubject.name}`}
              </CardTitle>
              <CardDescription>
                Create a quiz under this subject. Students will be able to attempt these.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveQuiz} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Quiz Title *</Label>
                    <Input
                      value={quizForm.title}
                      onChange={(e) => setQuizForm((q) => ({ ...q, title: e.target.value }))}
                      required
                      placeholder="e.g. Algebra - Chapter 1 Test"
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Description</Label>
                    <Textarea
                      value={quizForm.description}
                      onChange={(e) =>
                        setQuizForm((q) => ({ ...q, description: e.target.value }))
                      }
                      rows={2}
                      placeholder="What topics does this quiz cover?"
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Duration (minutes) *</Label>
                    <Input
                      type="number"
                      min={1}
                      value={quizForm.duration_minutes}
                      onChange={(e) =>
                        setQuizForm((q) => ({
                          ...q,
                          duration_minutes: Math.max(1, parseInt(e.target.value) || 1),
                        }))
                      }
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Passing Score (%) *</Label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={quizForm.passing_score}
                      onChange={(e) =>
                        setQuizForm((q) => ({
                          ...q,
                          passing_score: Math.min(
                            100,
                            Math.max(0, parseInt(e.target.value) || 0)
                          ),
                        }))
                      }
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-2 flex items-center justify-between rounded-lg border border-blue-100 p-3 bg-blue-50/30">
                    <div>
                      <Label className="mb-0 block">Quiz Active</Label>
                      <p className="text-xs text-gray-500">
                        Students can only attempt active quizzes
                      </p>
                    </div>
                    <Switch
                      checked={quizForm.is_active}
                      onCheckedChange={(v) => setQuizForm((q) => ({ ...q, is_active: v }))}
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-blue-600 text-white hover:bg-blue-700"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    {editingQuiz ? 'Update Quiz' : 'Add Quiz'}
                  </Button>
                  {editingQuiz && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={cancelEdit}
                      className="border-blue-200 text-blue-700 hover:bg-blue-50"
                    >
                      <X className="h-4 w-4 mr-2" /> Cancel
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {isLoading && quizzes.length === 0 ? (
              <div className="sm:col-span-2 lg:col-span-3 flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : quizzes.length === 0 ? (
              <Card className="sm:col-span-2 lg:col-span-3 border-blue-100">
                <CardContent className="py-12 text-center text-gray-400">
                  No quizzes in this subject yet. Add your first quiz above.
                </CardContent>
              </Card>
            ) : (
              quizzes.map((quiz) => (
                <Card
                  key={quiz.id}
                  className="border-blue-100 transition-all hover:shadow-md hover:shadow-blue-100/50 overflow-hidden group"
                >
                  <div
                    className={`h-2 ${
                      quiz.is_active
                        ? 'bg-gradient-to-r from-green-500 to-blue-500'
                        : 'bg-gray-300'
                    }`}
                  />
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle
                        className="text-lg cursor-pointer hover:text-blue-700 transition-colors"
                        onClick={() => openQuiz(quiz)}
                      >
                        <span className="flex items-center gap-2">
                          <ClipboardList className="h-5 w-5 text-blue-600" />
                          {quiz.title}
                        </span>
                      </CardTitle>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openQuiz(quiz)}
                        className="text-blue-600 hover:bg-blue-50 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Questions <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                    {quiz.description && (
                      <CardDescription className="line-clamp-2">
                        {quiz.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <Badge
                        variant="outline"
                        className={
                          quiz.is_active
                            ? 'border-green-200 text-green-700 bg-green-50/50'
                            : 'border-gray-200 text-gray-500 bg-gray-50'
                        }
                      >
                        {quiz.is_active ? (
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                        ) : (
                          <XCircle className="h-3 w-3 mr-1" />
                        )}
                        {quiz.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50/50">
                        {quiz.duration_minutes} min
                      </Badge>
                      <Badge variant="outline" className="border-yellow-200 text-yellow-700 bg-yellow-50/50">
                        Pass: {quiz.passing_score}%
                      </Badge>
                      <Badge variant="outline" className="border-purple-200 text-purple-700 bg-purple-50/50">
                        <HelpCircle className="h-3 w-3 mr-1" />
                        {quiz.questions_count ?? 0} Qs
                      </Badge>
                    </div>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => startEditQuiz(quiz)}
                        className="h-8 w-8 p-0 border-yellow-200 text-yellow-700 hover:bg-yellow-50"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => confirmDelete('quiz', quiz.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </>
      )}

      {/* LEVEL 3: QUESTIONS */}
      {level === 'questions' && selectedQuiz && (
        <>
          <Card className="border-blue-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-900">
                <Plus className="h-5 w-5" />
                {editingQuestion ? 'Edit Question' : `Add Question to "${selectedQuiz.title}"`}
              </CardTitle>
              <CardDescription>
                Add multiple-choice questions with 4 options. Select the correct answer and add an optional explanation.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveQuestion} className="space-y-4">
                <div className="space-y-2">
                  <Label>Question Text *</Label>
                  <Textarea
                    value={questionForm.question_text}
                    onChange={(e) =>
                      setQuestionForm((q) => ({ ...q, question_text: e.target.value }))
                    }
                    required
                    rows={2}
                    placeholder="Type the question here"
                    className={inputClass}
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {(['a', 'b', 'c', 'd'] as const).map((opt) => (
                    <div
                      key={opt}
                      className={`rounded-lg border p-3 transition-all ${
                        questionForm.correct_answer === opt
                          ? 'border-green-400 bg-green-50 shadow-sm shadow-green-100'
                          : 'border-blue-100 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Badge
                          className={
                            questionForm.correct_answer === opt
                              ? 'bg-green-600 text-white'
                              : 'bg-blue-100 text-blue-700'
                          }
                        >
                          Option {opt.toUpperCase()}
                        </Badge>
                        {questionForm.correct_answer === opt && (
                          <Badge className="bg-green-600 text-white">
                            <CheckCircle2 className="h-3 w-3 mr-1" /> Correct
                          </Badge>
                        )}
                      </div>
                      <Input
                        value={
                          questionForm[`option_${opt}` as 'option_a' | 'option_b' | 'option_c' | 'option_d']
                        }
                        onChange={(e) =>
                          setQuestionForm((q) => ({
                            ...q,
                            [`option_${opt}`]: e.target.value,
                          } as any))
                        }
                        required
                        placeholder={`Option ${opt.toUpperCase()}`}
                        className={inputClass}
                      />
                    </div>
                  ))}
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Correct Answer *</Label>
                    <Select
                      value={questionForm.correct_answer}
                      onValueChange={(v) =>
                        setQuestionForm((q) => ({
                          ...q,
                          correct_answer: v as 'a' | 'b' | 'c' | 'd',
                        }))
                      }
                    >
                      <SelectTrigger className={inputClass}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="a">Option A</SelectItem>
                        <SelectItem value="b">Option B</SelectItem>
                        <SelectItem value="c">Option C</SelectItem>
                        <SelectItem value="d">Option D</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Sort Order</Label>
                    <Input
                      type="number"
                      min={0}
                      value={questionForm.sort_order}
                      onChange={(e) =>
                        setQuestionForm((q) => ({
                          ...q,
                          sort_order: Math.max(0, parseInt(e.target.value) || 0),
                        }))
                      }
                      className={inputClass}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Explanation (optional)</Label>
                  <Textarea
                    value={questionForm.explanation}
                    onChange={(e) =>
                      setQuestionForm((q) => ({ ...q, explanation: e.target.value }))
                    }
                    rows={2}
                    placeholder="Shown to students after they answer: explain why this is correct"
                    className={inputClass}
                  />
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-blue-600 text-white hover:bg-blue-700"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    {editingQuestion ? 'Update Question' : 'Add Question'}
                  </Button>
                  {editingQuestion && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={cancelEdit}
                      className="border-blue-200 text-blue-700 hover:bg-blue-50"
                    >
                      <X className="h-4 w-4 mr-2" /> Cancel
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-3">
            {isLoading && questions.length === 0 ? (
              <Card className="border-blue-100">
                <CardContent className="py-12 flex justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </CardContent>
              </Card>
            ) : questions.length === 0 ? (
              <Card className="border-blue-100">
                <CardContent className="py-12 text-center text-gray-400">
                  No questions yet. Add your first question above.
                </CardContent>
              </Card>
            ) : (
              questions.map((q, i) => (
                <Card key={q.id} className="border-blue-100 overflow-hidden">
                  <div className="flex flex-wrap items-start justify-between gap-3 p-4 sm:p-6 border-b border-blue-50 bg-gradient-to-r from-blue-50/40 to-white">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <Badge className="bg-blue-600 text-white shrink-0 mt-0.5">
                        Q{i + 1}
                      </Badge>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-gray-900 whitespace-pre-wrap">
                          {q.question_text}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {i > 0 && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleMoveQuestion(q, 'up')}
                          className="h-8 w-8 p-0 text-gray-600 hover:bg-gray-100"
                          title="Move up"
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                      )}
                      {i < questions.length - 1 && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleMoveQuestion(q, 'down')}
                          className="h-8 w-8 p-0 text-gray-600 hover:bg-gray-100"
                          title="Move down"
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => startEditQuestion(q)}
                        className="h-8 w-8 p-0 border-yellow-200 text-yellow-700 hover:bg-yellow-50"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => confirmDelete('question', q.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <div className="grid gap-2 p-4 sm:p-6 sm:grid-cols-2">
                    {(['a', 'b', 'c', 'd'] as const).map((opt) => {
                      const text =
                        q[`option_${opt}` as 'option_a' | 'option_b' | 'option_c' | 'option_d'];
                      const isCorrect = q.correct_answer === opt;
                      return (
                        <div
                          key={opt}
                          className={`flex items-start gap-2 rounded-lg border p-3 ${
                            isCorrect
                              ? 'border-green-300 bg-green-50'
                              : 'border-gray-100 bg-white'
                          }`}
                        >
                          <Badge
                            className={`shrink-0 mt-0.5 ${
                              isCorrect
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {opt.toUpperCase()}
                          </Badge>
                          <p
                            className={`text-sm ${
                              isCorrect ? 'font-semibold text-green-800' : 'text-gray-700'
                            }`}
                          >
                            {text}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                  {q.explanation && (
                    <div className="border-t border-yellow-100 bg-yellow-50/40 p-4 sm:p-6">
                      <p className="text-sm font-semibold text-yellow-800 mb-1 flex items-center gap-1">
                        <BookOpen className="h-4 w-4" /> Explanation
                      </p>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {q.explanation}
                      </p>
                    </div>
                  )}
                </Card>
              ))
            )}
          </div>
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-md border-blue-100">
          <DialogHeader>
            <DialogTitle className="text-blue-900">Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this{' '}
              <span className="font-semibold text-red-600 capitalize">
                {deleteTarget?.type}
              </span>
              ? This action cannot be undone and any{' '}
              {deleteTarget?.type === 'subject' && 'quizzes and questions under it '}
              {deleteTarget?.type === 'quiz' && 'questions under it '}
              will also be removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false);
                setDeleteTarget(null);
              }}
              className="w-full border-blue-200 text-blue-700 hover:bg-blue-50 sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="w-full sm:w-auto"
            >
              <Trash2 className="h-4 w-4 mr-2" /> Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
