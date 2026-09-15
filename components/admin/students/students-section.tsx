'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import {
  Search,
  Loader2,
  Plus,
  Eye,
  Pencil,
  PlayCircle,
  PauseCircle,
  GraduationCap,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import DynamicCategoryForm, {
  CompleteFormValue,
} from '@/components/ui/dynamic-category-form';

import {
  StudentProfile,
  CATEGORY_LABELS,
  BATCHES,
  StudentCategory,
  Course,
} from '@/lib/types';

import {
  fetchStudentProfiles,
  createStudentProfile,
  updateStudentProfile,
  toggleStudentActive,
  createAdmission,
  fetchCoursesFromDB,
} from '@/lib/data/queries';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

const CATEGORY_OPTIONS: { value: string; label: string }[] = [
  { value: 'all', label: 'All' },
  ...(Object.entries(CATEGORY_LABELS) as [StudentCategory, string][]).map(
    ([value, label]) => ({ value, label })
  ),
];

const BATCH_OPTIONS: { value: string; label: string }[] = [
  { value: 'all', label: 'All' },
  ...BATCHES.map((b) => ({ value: b, label: b })),
];

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function formatPhone(phone: string | null): string {
  if (!phone) return '—';
  return phone;
}

function getCourseDisplay(student: StudentProfile): string {
  const parts: string[] = [];
  const cat = student.category;

  if (cat === 'government_exams') {
    if (student.exam) parts.push(student.exam);
  } else if (cat === 'computer_courses') {
    if (student.computer_course) parts.push(student.computer_course);
  } else {
    if (student.level) parts.push(student.level);
    if (student.stream) parts.push(student.stream);
  }

  return parts.length > 0 ? parts.join(' - ') : '—';
}

function getCategoryBadgeClass(category: StudentCategory | null) {
  switch (category) {
    case 'government_exams':
      return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'nios':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'open_schooling':
      return 'bg-green-100 text-green-700 border-green-200';
    case 'computer_courses':
      return 'bg-purple-100 text-purple-700 border-purple-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
}

type DynCell = (s: StudentProfile) => React.ReactNode;

interface DynColumn {
  key: string;
  label: string;
  className?: string;
  cellClassName?: string;
  render: DynCell;
}

const BASE_COLUMNS: DynColumn[] = [
  {
    key: 'student',
    label: 'Student',
    render: (s) => (
      <div className="flex flex-col">
        <span className="font-semibold text-gray-900">
          {s.full_name || '—'}
        </span>
        <span className="text-xs text-gray-500 mt-0.5">
          {s.email || '—'}
        </span>
      </div>
    ),
  },
  {
    key: 'category',
    label: 'Category',
    render: (s) => (
      <Badge
        variant="outline"
        className={`${getCategoryBadgeClass(s.category)} border`}
      >
        {s.category ? CATEGORY_LABELS[s.category] : '—'}
      </Badge>
    ),
  },
];

const ENROLLMENT_COL: DynColumn = {
  key: 'enrollment',
  label: 'Enrollment',
  cellClassName: 'whitespace-nowrap',
  render: (s) =>
    s.enrollment_number ? (
      <Badge
        variant="outline"
        className="bg-blue-50 text-blue-700 border-blue-200 font-mono text-xs"
      >
        {s.enrollment_number}
      </Badge>
    ) : (
      <span className="text-gray-400">—</span>
    ),
};

const PHONE_COL: DynColumn = {
  key: 'phone',
  label: 'Phone',
  cellClassName: 'whitespace-nowrap text-gray-700',
  render: (s) => formatPhone(s.phone),
};

const STATUS_COL: DynColumn = {
  key: 'status',
  label: 'Status',
  render: (s) =>
    s.is_active ? (
      <Badge
        variant="outline"
        className="bg-green-100 text-green-700 border-green-200 border"
      >
        Active
      </Badge>
    ) : (
      <Badge
        variant="outline"
        className="bg-rose-100 text-rose-700 border-rose-200 border"
      >
        Inactive
      </Badge>
    ),
};

const GOVT_EXAM_COLS: DynColumn[] = [
  {
    key: 'exam',
    label: 'Exam',
    cellClassName: 'whitespace-nowrap text-gray-700',
    render: (s) => s.exam || '—',
  },
  {
    key: 'batch',
    label: 'Batch',
    cellClassName: 'whitespace-nowrap text-gray-700',
    render: (s) => s.batch || '—',
  },
  {
    key: 'batch_timing',
    label: 'Timing',
    cellClassName: 'whitespace-nowrap text-gray-700',
    render: (s) => s.batch_timing || '—',
  },
];

const NIOS_COLS: DynColumn[] = [
  {
    key: 'level',
    label: 'Level',
    cellClassName: 'whitespace-nowrap text-gray-700',
    render: (s) => s.level || '—',
  },
  {
    key: 'stream',
    label: 'Stream',
    cellClassName: 'whitespace-nowrap text-gray-700',
    render: (s) => s.stream || '—',
  },
  {
    key: 'session',
    label: 'Session',
    cellClassName: 'whitespace-nowrap text-gray-700',
    render: (s) => s.session || '—',
  },
  {
    key: 'subjects',
    label: 'Subjects',
    render: (s) => {
      const list = s.subjects?.filter(Boolean) || [];
      if (list.length === 0) return <span className="text-gray-400">—</span>;
      return (
        <div className="flex flex-wrap gap-1 max-w-xs">
          {list.slice(0, 3).map((sub, i) => (
            <span
              key={i}
              className="rounded-full bg-blue-100 text-blue-800 px-2 py-0.5 text-xs"
            >
              {sub}
            </span>
          ))}
          {list.length > 3 && (
            <span className="rounded-full bg-gray-100 text-gray-600 px-2 py-0.5 text-xs">
              +{list.length - 3}
            </span>
          )}
        </div>
      );
    },
  },
];

const OPEN_SCHOOL_COLS: DynColumn[] = [
  {
    key: 'level',
    label: 'Level',
    cellClassName: 'whitespace-nowrap text-gray-700',
    render: (s) => s.level || '—',
  },
  {
    key: 'stream',
    label: 'Stream',
    cellClassName: 'whitespace-nowrap text-gray-700',
    render: (s) => s.stream || '—',
  },
  {
    key: 'session',
    label: 'Session',
    cellClassName: 'whitespace-nowrap text-gray-700',
    render: (s) => s.session || '—',
  },
  {
    key: 'subjects',
    label: 'Subjects',
    render: (s) => {
      const list = s.subjects?.filter(Boolean) || [];
      if (list.length === 0) return <span className="text-gray-400">—</span>;
      return (
        <div className="flex flex-wrap gap-1 max-w-xs">
          {list.slice(0, 3).map((sub, i) => (
            <span
              key={i}
              className="rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-xs"
            >
              {sub}
            </span>
          ))}
          {list.length > 3 && (
            <span className="rounded-full bg-gray-100 text-gray-600 px-2 py-0.5 text-xs">
              +{list.length - 3}
            </span>
          )}
        </div>
      );
    },
  },
];

const COMPUTER_COLS: DynColumn[] = [
  {
    key: 'computer_course',
    label: 'Course',
    cellClassName: 'whitespace-nowrap text-gray-700',
    render: (s) => s.computer_course || '—',
  },
  {
    key: 'batch',
    label: 'Batch',
    cellClassName: 'whitespace-nowrap text-gray-700',
    render: (s) => s.batch || '—',
  },
  {
    key: 'batch_timing',
    label: 'Timing',
    cellClassName: 'whitespace-nowrap text-gray-700',
    render: (s) => s.batch_timing || '—',
  },
  {
    key: 'duration',
    label: 'Duration',
    cellClassName: 'whitespace-nowrap text-gray-700',
    render: (s) => s.duration || '—',
  },
];

const ALL_MIXED_COLS: DynColumn[] = [
  {
    key: 'course',
    label: 'Course / Exam',
    cellClassName: 'whitespace-nowrap text-gray-700',
    render: (s) => getCourseDisplay(s),
  },
  {
    key: 'batch',
    label: 'Batch',
    cellClassName: 'whitespace-nowrap text-gray-700',
    render: (s) => s.batch || '—',
  },
];

function getDynamicColumns(
  categoryFilter: string
): { columns: DynColumn[]; colSpan: number } {
  let middle: DynColumn[] = ALL_MIXED_COLS;
  if (categoryFilter === 'government_exams') middle = GOVT_EXAM_COLS;
  else if (categoryFilter === 'nios') middle = NIOS_COLS;
  else if (categoryFilter === 'open_schooling') middle = OPEN_SCHOOL_COLS;
  else if (categoryFilter === 'computer_courses') middle = COMPUTER_COLS;

  const columns: DynColumn[] = [
    ...BASE_COLUMNS,
    ...middle,
    ENROLLMENT_COL,
    PHONE_COL,
    STATUS_COL,
  ];
  return { columns, colSpan: columns.length + 1 };
}

export default function StudentsSection() {
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [coursesLoading, setCoursesLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [courseFilter, setCourseFilter] = useState('');
  const [batchFilter, setBatchFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null);
  const [addEmail, setAddEmail] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [toggleDialogOpen, setToggleDialogOpen] = useState(false);
  const [toggleStudentId, setToggleStudentId] = useState<string | null>(null);
  const [toggleTargetState, setToggleTargetState] = useState<boolean>(false);
  const [toggleLoading, setToggleLoading] = useState(false);

  const loadStudents = useCallback(async () => {
    try {
      setLoading(true);
      const filters: {
        is_approved?: boolean;
        is_active?: boolean;
        category?: StudentCategory;
        batch?: string;
        search?: string;
      } = {};

      if (statusFilter === 'active') filters.is_active = true;
      else if (statusFilter === 'inactive') filters.is_active = false;

      if (categoryFilter !== 'all' && categoryFilter) {
        filters.category = categoryFilter as StudentCategory;
      }
      if (batchFilter !== 'all' && batchFilter) {
        filters.batch = batchFilter;
      }
      if (searchQuery) filters.search = searchQuery;

      const data = await fetchStudentProfiles(filters);
      setStudents(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load students';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, categoryFilter, batchFilter, statusFilter]);

  const loadCourses = useCallback(async () => {
    try {
      setCoursesLoading(true);
      const data = await fetchCoursesFromDB();
      setCourses(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load courses';
      toast.error(message);
    } finally {
      setCoursesLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStudents();
    loadCourses();
  }, [loadStudents, loadCourses]);

  const filteredStudents = students.filter((student) => {
    if (!courseFilter) return true;
    const cf = courseFilter.toLowerCase();
    return (
      student.exam?.toLowerCase().includes(cf) ||
      student.computer_course?.toLowerCase().includes(cf) ||
      student.level?.toLowerCase().includes(cf) ||
      student.stream?.toLowerCase().includes(cf) ||
      student.course?.toLowerCase().includes(cf) ||
      false
    );
  });

  const buildInitialData = (s: StudentProfile | null): Partial<CompleteFormValue> | undefined => {
    if (!s) return undefined;
    return {
      category: s.category || '',
      full_name: s.full_name || '',
      email: s.email || '',
      phone: s.phone || '',
      date_of_birth: s.date_of_birth || '',
      parent_name: s.parent_name || '',
      parent_phone: s.parent_phone || '',
      address: s.address || '',
      exam: s.exam || '',
      level: s.level || '',
      stream: s.stream || '',
      session: s.session || '',
      batch: s.batch || '',
      batch_timing: s.batch_timing || '',
      duration: s.duration || '',
      computer_course: s.computer_course || '',
      subjects: s.subjects || [],
    };
  };

  const handleOpenAdd = () => {
    setAddEmail('');
    setAddDialogOpen(true);
  };

  const handleAddSubmit = async (data: CompleteFormValue) => {
    try {
      setSubmitting(true);

      const emailToUse = data.email;
      if (!emailToUse) {
        toast.error('Email is required');
        return;
      }

      const courseDisplay = getCourseDisplayFromForm(data);

      const created = await createStudentProfile({
        full_name: data.full_name,
        email: emailToUse,
        phone: data.phone || null,
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
        date_of_birth: data.date_of_birth || null,
        parent_name: data.parent_name || null,
        parent_phone: data.parent_phone || null,
        address: data.address || null,
        subjects: data.subjects || [],
        is_approved: true,
        is_active: true,
        generateEnrollment: true,
      });

      await createAdmission({
        student_name: data.full_name,
        email: emailToUse,
        phone: data.phone || '',
        course: courseDisplay || '',
        class: data.level || null,
        subjects: data.subjects || null,
        parent_name: data.parent_name || null,
        parent_phone: data.parent_phone || null,
        address: data.address || null,
        status: 'approved',
        message: 'Created by admin',
        category: data.category || null,
        exam: data.exam || null,
        level: data.level || null,
        stream: data.stream || null,
        session: data.session || null,
        batch: data.batch || null,
        batch_timing: data.batch_timing || null,
        duration: data.duration || null,
        computer_course: data.computer_course || null,
        date_of_birth: data.date_of_birth || null,
        student_profile_id: created.id,
      });

      toast.success(
        created.enrollment_number
          ? `Student added! Enrollment: ${created.enrollment_number}`
          : 'Student added successfully!'
      );
      setAddDialogOpen(false);
      setAddEmail('');
      await loadStudents();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add student';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEdit = (s: StudentProfile) => {
    setSelectedStudent(s);
    setEditEmail(s.email || '');
    setEditDialogOpen(true);
  };

  const handleEditSubmit = async (data: CompleteFormValue) => {
    if (!selectedStudent) return;
    try {
      setSubmitting(true);
      const emailToUse = data.email;
      const courseDisplay = getCourseDisplayFromForm(data);

      await updateStudentProfile(selectedStudent.id, {
        full_name: data.full_name,
        email: emailToUse || null,
        phone: data.phone || null,
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
        date_of_birth: data.date_of_birth || null,
        parent_name: data.parent_name || null,
        parent_phone: data.parent_phone || null,
        address: data.address || null,
        subjects: data.subjects || [],
      });

      toast.success('Student updated successfully!');
      setEditDialogOpen(false);
      setSelectedStudent(null);
      await loadStudents();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update student';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleView = (s: StudentProfile) => {
    setSelectedStudent(s);
    setViewDialogOpen(true);
  };

  const handleToggleClick = (s: StudentProfile) => {
    setToggleStudentId(s.id);
    setToggleTargetState(!s.is_active);
    setToggleDialogOpen(true);
  };

  const handleConfirmToggle = async () => {
    if (!toggleStudentId) return;
    try {
      setToggleLoading(true);
      await toggleStudentActive(toggleStudentId, toggleTargetState);
      toast.success(
        toggleTargetState ? 'Student activated successfully!' : 'Student deactivated successfully!'
      );
      setToggleDialogOpen(false);
      setToggleStudentId(null);
      await loadStudents();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to toggle student status';
      toast.error(message);
    } finally {
      setToggleLoading(false);
    }
  };

  const getCourseDisplayFromForm = (data: CompleteFormValue): string => {
    const parts: string[] = [];
    const cat = data.category;

    if (cat === 'government_exams') {
      if (data.exam) parts.push(data.exam);
    } else if (cat === 'computer_courses') {
      if (data.computer_course) parts.push(data.computer_course);
    } else {
      if (data.level) parts.push(data.level);
      if (data.stream) parts.push(data.stream);
    }

    return parts.join(' - ');
  };

  return (
    <div className="space-y-6">
      {/* TOP TOOLBAR */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-5 flex-1">
              <div className="space-y-1.5">
                <Label htmlFor="search-input" className="text-xs font-medium text-gray-600">
                  Search
                </Label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="search-input"
                    placeholder="Name, email, phone, enrollment..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-10 pl-9"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="category-filter" className="text-xs font-medium text-gray-600">
                  Category
                </Label>
                <Select
                  value={categoryFilter}
                  onValueChange={(v) => setCategoryFilter(v)}
                >
                  <SelectTrigger id="category-filter" className="h-10">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORY_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="course-filter" className="text-xs font-medium text-gray-600">
                  Course / Exam
                </Label>
                <Input
                  id="course-filter"
                  placeholder="Filter course/exam..."
                  value={courseFilter}
                  onChange={(e) => setCourseFilter(e.target.value)}
                  className="h-10"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="batch-filter" className="text-xs font-medium text-gray-600">
                  Batch
                </Label>
                <Select
                  value={batchFilter}
                  onValueChange={(v) => setBatchFilter(v)}
                >
                  <SelectTrigger id="batch-filter" className="h-10">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    {BATCH_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="status-filter" className="text-xs font-medium text-gray-600">
                  Status
                </Label>
                <Select
                  value={statusFilter}
                  onValueChange={(v) => setStatusFilter(v)}
                >
                  <SelectTrigger id="status-filter" className="h-10">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex lg:justify-end">
              <Button
                onClick={handleOpenAdd}
                className="h-10 px-5 bg-gradient-to-r from-blue-600 to-red-600 hover:from-blue-700 hover:to-red-700 text-white shadow-md shadow-blue-200 transition-all"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Student
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* TABLE */}
      <Card className="border-0 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {(() => {
            const { columns, colSpan } = getDynamicColumns(categoryFilter);
            return (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {columns.map((col) => (
                      <th
                        key={col.key}
                        className={`text-left px-6 py-3.5 font-semibold text-gray-700 whitespace-nowrap ${
                          col.className || ''
                        }`}
                      >
                        {col.label}
                      </th>
                    ))}
                    <th className="text-left px-6 py-3.5 font-semibold text-gray-700 whitespace-nowrap">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td
                        colSpan={colSpan}
                        className="px-6 py-16 text-center"
                      >
                        <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />
                        <p className="mt-3 text-sm text-gray-500">
                          Loading students...
                        </p>
                      </td>
                    </tr>
                  ) : filteredStudents.length === 0 ? (
                    <tr>
                      <td
                        colSpan={colSpan}
                        className="px-6 py-16 text-center"
                      >
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                          <GraduationCap className="h-5 w-5 text-gray-400" />
                        </div>
                        <p className="mt-3 text-sm font-medium text-gray-700">
                          No students yet
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          Add your first student using the Add Student button
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((student) => (
                      <tr
                        key={student.id}
                        className="hover:bg-gray-50/60 transition-colors"
                      >
                        {columns.map((col) => (
                          <td
                            key={col.key}
                            className={`px-6 py-4 ${
                              col.cellClassName || ''
                            }`}
                          >
                            {col.render(student)}
                          </td>
                        ))}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <Button
                              size="sm"
                              variant="default"
                              className="h-8 bg-blue-600 hover:bg-blue-700 text-white"
                              onClick={() => handleView(student)}
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 border-gray-300 text-gray-700 hover:bg-gray-50"
                              onClick={() => handleOpenEdit(student)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className={`h-8 ${
                                student.is_active
                                  ? 'border-amber-300 text-amber-700 hover:bg-amber-50'
                                  : 'border-green-300 text-green-700 hover:bg-green-50'
                              }`}
                              onClick={() => handleToggleClick(student)}
                              title={
                                student.is_active
                                  ? 'Deactivate'
                                  : 'Activate'
                              }
                            >
                              {student.is_active ? (
                                <PauseCircle className="h-3.5 w-3.5" />
                              ) : (
                                <PlayCircle className="h-3.5 w-3.5" />
                              )}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            );
          })()}
        </div>
      </Card>

      {/* ADD STUDENT DIALOG */}
      <Dialog open={addDialogOpen} onOpenChange={(o) => !submitting && setAddDialogOpen(o)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Add New Student</DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-2">
            <DynamicCategoryForm
              mode="admin-create"
              onSubmit={handleAddSubmit}
              isLoading={submitting}
              submitLabel="Add Student"
              courses={courses}
              includeSubjectsFor
              compact
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAddDialogOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* EDIT STUDENT DIALOG */}
      <Dialog open={editDialogOpen} onOpenChange={(o) => !submitting && setEditDialogOpen(o)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Edit Student</DialogTitle>
          </DialogHeader>

          {selectedStudent && (
            <div className="space-y-5 py-2">
              <DynamicCategoryForm
                mode="admin-edit"
                initialData={buildInitialData(selectedStudent)}
                onSubmit={handleEditSubmit}
                isLoading={submitting}
                submitLabel="Update Student"
                courses={courses}
                includeSubjectsFor
                compact
              />
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditDialogOpen(false);
                setSelectedStudent(null);
              }}
              disabled={submitting}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* VIEW STUDENT DIALOG */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Student Details</DialogTitle>
          </DialogHeader>

          {selectedStudent && (
            <div className="space-y-6 py-2">
              {/* Personal Info Card */}
              <Card className="border border-gray-100 shadow-sm">
                <CardContent className="p-5">
                  <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2 pb-3 mb-4 border-b border-gray-100">
                    <span className="w-1.5 h-5 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full" />
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Full Name
                      </p>
                      <p className="mt-1 text-sm text-gray-900 font-medium">
                        {selectedStudent.full_name || '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Email
                      </p>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedStudent.email || '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Phone
                      </p>
                      <p className="mt-1 text-sm text-gray-900">
                        {formatPhone(selectedStudent.phone)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Date of Birth
                      </p>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedStudent.date_of_birth
                          ? formatDate(selectedStudent.date_of_birth)
                          : '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Parent / Guardian Name
                      </p>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedStudent.parent_name || '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Parent / Guardian Phone
                      </p>
                      <p className="mt-1 text-sm text-gray-900">
                        {formatPhone(selectedStudent.parent_phone)}
                      </p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Address
                      </p>
                      <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                        {selectedStudent.address || '—'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Category Info Section */}
              <Card className="border border-gray-100 shadow-sm">
                <CardContent className="p-5">
                  <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2 pb-3 mb-4 border-b border-gray-100">
                    <span className="w-1.5 h-5 bg-gradient-to-b from-emerald-600 to-green-600 rounded-full" />
                    Course & Category Information
                  </h3>
                  <DynamicCategoryForm
                    mode="view"
                    initialData={buildInitialData(selectedStudent)}
                    compact
                  />
                </CardContent>
              </Card>

              {/* Enrollment Info Card */}
              <Card className="border border-gray-100 shadow-sm">
                <CardContent className="p-5">
                  <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2 pb-3 mb-4 border-b border-gray-100">
                    <span className="w-1.5 h-5 bg-gradient-to-b from-blue-600 to-red-600 rounded-full" />
                    Enrollment Information
                  </h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Enrollment Number
                      </p>
                      <p className="mt-1 text-sm font-mono font-semibold text-blue-700">
                        {selectedStudent.enrollment_number || '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Activation Date
                      </p>
                      <p className="mt-1 text-sm text-gray-900">
                        {formatDate(selectedStudent.created_at)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Approval Status
                      </p>
                      <p className="mt-1">
                        <Badge
                          variant="outline"
                          className={
                            selectedStudent.is_approved
                              ? 'bg-green-100 text-green-700 border-green-200 border'
                              : 'bg-yellow-100 text-yellow-700 border-yellow-200 border'
                          }
                        >
                          {selectedStudent.is_approved ? 'Approved' : 'Pending'}
                        </Badge>
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Active Status
                      </p>
                      <p className="mt-1">
                        {selectedStudent.is_active ? (
                          <Badge
                            variant="outline"
                            className="bg-green-100 text-green-700 border-green-200 border"
                          >
                            Active
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-rose-100 text-rose-700 border-rose-200 border"
                          >
                            Inactive
                          </Badge>
                        )}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setViewDialogOpen(false);
                setSelectedStudent(null);
              }}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* TOGGLE ACTIVE CONFIRMATION */}
      <AlertDialog
        open={toggleDialogOpen}
        onOpenChange={(o) => !toggleLoading && setToggleDialogOpen(o)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <div className={`flex h-9 w-9 items-center justify-center rounded-full ${toggleTargetState ? 'bg-green-100' : 'bg-amber-100'}`}>
                {toggleTargetState ? (
                  <PlayCircle className={`h-5 w-5 ${toggleTargetState ? 'text-green-600' : 'text-amber-600'}`} />
                ) : (
                  <PauseCircle className="h-5 w-5 text-amber-600" />
                )}
              </div>
              {toggleTargetState ? 'Activate Student' : 'Deactivate Student'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {toggleTargetState
                ? 'Are you sure you want to activate this student account? This will restore their access to the portal.'
                : 'Are you sure you want to deactivate this student account? This will suspend their access to the portal.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={toggleLoading}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={toggleLoading}
              onClick={(e) => {
                e.preventDefault();
                handleConfirmToggle();
              }}
              className={
                toggleTargetState
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-amber-600 hover:bg-amber-700 text-white'
              }
            >
              {toggleLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {toggleTargetState ? 'Activating...' : 'Deactivating...'}
                </>
              ) : (
                <>
                  {toggleTargetState ? 'Yes, Activate' : 'Yes, Deactivate'}
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
