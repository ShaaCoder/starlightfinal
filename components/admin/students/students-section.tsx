'use client';

import { useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
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
import { Card, CardContent } from '@/components/ui/card';
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

/* =========================================================
   CONSTANTS
========================================================= */

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

const CATEGORY_OPTIONS: { value: string; label: string }[] = [
  { value: 'all', label: 'All' },
  ...(Object.entries(CATEGORY_LABELS) as [StudentCategory, string][]).map(
    ([value, label]) => ({
      value,
      label,
    })
  ),
];

const BATCH_OPTIONS: { value: string; label: string }[] = [
  { value: 'all', label: 'All' },
  ...BATCHES.map((b) => ({
    value: b,
    label: b,
  })),
];

/* =========================================================
   HELPERS
========================================================= */

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';

  try {
    const date = new Date(dateStr);

    if (Number.isNaN(date.getTime())) {
      return dateStr;
    }

    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function formatPhone(phone: string | null | undefined): string {
  if (!phone || !phone.trim()) return '—';
  return phone;
}

/**
 * Course display fallback.
 *
 * IMPORTANT:
 * First we use student.course because that is the
 * actual value stored in student_profiles.
 *
 * If course is empty, we construct it from the
 * category-specific fields.
 */
function getCourseDisplay(student: StudentProfile): string {
  if (student.course && student.course.trim()) {
    return student.course;
  }

  const parts: string[] = [];
  const cat = student.category;

  if (cat === 'government_exams') {
    if (student.exam) {
      parts.push(student.exam);
    }
  } else if (cat === 'computer_courses') {
    if (student.computer_course) {
      parts.push(student.computer_course);
    }
  } else {
    if (student.level) {
      parts.push(student.level);
    }

    if (student.stream) {
      parts.push(student.stream);
    }
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

/* =========================================================
   VIEW MODAL HELPERS
========================================================= */

function DetailItem({
  label,
  value,
  fullWidth = false,
}: {
  label: string;
  value?: string | number | null;
  fullWidth?: boolean;
}) {
  const displayValue =
    value !== null &&
    value !== undefined &&
    String(value).trim() !== ''
      ? String(value)
      : '—';

  return (
    <div className={fullWidth ? 'sm:col-span-2' : ''}>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
        {label}
      </p>

      <p className="mt-1.5 break-words whitespace-pre-wrap text-sm font-medium text-gray-900">
        {displayValue}
      </p>
    </div>
  );
}

function SectionHeader({
  title,
  gradient = 'from-blue-600 to-indigo-600',
}: {
  title: string;
  gradient?: string;
}) {
  return (
    <h3 className="flex items-center gap-2 border-b border-gray-100 pb-3 text-base font-semibold text-gray-900">
      <span
        className={`h-5 w-1.5 rounded-full bg-gradient-to-b ${gradient}`}
      />

      {title}
    </h3>
  );
}

/* =========================================================
   TABLE TYPES
========================================================= */

type DynCell = (s: StudentProfile) => ReactNode;

interface DynColumn {
  key: string;
  label: string;
  className?: string;
  cellClassName?: string;
  render: DynCell;
}

/* =========================================================
   TABLE COLUMNS
========================================================= */

const BASE_COLUMNS: DynColumn[] = [
  {
    key: 'student',
    label: 'Student',

    render: (s) => (
      <div className="flex flex-col">
        <span className="font-semibold text-gray-900">
          {s.full_name || '—'}
        </span>

        <span className="mt-0.5 text-xs text-gray-500">
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
        className="border-blue-200 bg-blue-50 font-mono text-xs text-blue-700"
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
        className="border border-green-200 bg-green-100 text-green-700"
      >
        Active
      </Badge>
    ) : (
      <Badge
        variant="outline"
        className="border border-rose-200 bg-rose-100 text-rose-700"
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

      if (list.length === 0) {
        return <span className="text-gray-400">—</span>;
      }

      return (
        <div className="flex max-w-xs flex-wrap gap-1">
          {list.slice(0, 3).map((sub, i) => (
            <span
              key={i}
              className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-800"
            >
              {sub}
            </span>
          ))}

          {list.length > 3 && (
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
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

      if (list.length === 0) {
        return <span className="text-gray-400">—</span>;
      }

      return (
        <div className="flex max-w-xs flex-wrap gap-1">
          {list.slice(0, 3).map((sub, i) => (
            <span
              key={i}
              className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-800"
            >
              {sub}
            </span>
          ))}

          {list.length > 3 && (
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
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
): {
  columns: DynColumn[];
  colSpan: number;
} {
  let middle: DynColumn[] = ALL_MIXED_COLS;

  if (categoryFilter === 'government_exams') {
    middle = GOVT_EXAM_COLS;
  } else if (categoryFilter === 'nios') {
    middle = NIOS_COLS;
  } else if (categoryFilter === 'open_schooling') {
    middle = OPEN_SCHOOL_COLS;
  } else if (categoryFilter === 'computer_courses') {
    middle = COMPUTER_COLS;
  }

  const columns: DynColumn[] = [
    ...BASE_COLUMNS,
    ...middle,
    ENROLLMENT_COL,
    PHONE_COL,
    STATUS_COL,
  ];

  return {
    columns,
    colSpan: columns.length + 1,
  };
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

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

  const [selectedStudent, setSelectedStudent] =
    useState<StudentProfile | null>(null);

  const [addEmail, setAddEmail] = useState('');
  const [editEmail, setEditEmail] = useState('');

  const [submitting, setSubmitting] = useState(false);

  const [toggleDialogOpen, setToggleDialogOpen] = useState(false);
  const [toggleStudentId, setToggleStudentId] =
    useState<string | null>(null);

  const [toggleTargetState, setToggleTargetState] =
    useState<boolean>(false);

  const [toggleLoading, setToggleLoading] = useState(false);

  /* =========================================================
     LOAD STUDENTS
  ========================================================= */

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

      if (statusFilter === 'active') {
        filters.is_active = true;
      } else if (statusFilter === 'inactive') {
        filters.is_active = false;
      }

      if (categoryFilter !== 'all' && categoryFilter) {
        filters.category = categoryFilter as StudentCategory;
      }

      if (batchFilter !== 'all' && batchFilter) {
        filters.batch = batchFilter;
      }

      if (searchQuery) {
        filters.search = searchQuery;
      }

      const data = await fetchStudentProfiles(filters);

      setStudents(data);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Failed to load students';

      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [
    searchQuery,
    categoryFilter,
    batchFilter,
    statusFilter,
  ]);

  /* =========================================================
     LOAD COURSES
  ========================================================= */

  const loadCourses = useCallback(async () => {
    try {
      setCoursesLoading(true);

      const data = await fetchCoursesFromDB();

      setCourses(data);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Failed to load courses';

      toast.error(message);
    } finally {
      setCoursesLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStudents();
    loadCourses();
  }, [loadStudents, loadCourses]);

  /* =========================================================
     FILTER STUDENTS
  ========================================================= */

  const filteredStudents = students.filter((student) => {
    if (!courseFilter) {
      return true;
    }

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

  /* =========================================================
     BUILD FORM DATA
  ========================================================= */

  const buildInitialData = (
    s: StudentProfile | null
  ): Partial<CompleteFormValue> | undefined => {
    if (!s) {
      return undefined;
    }

    return {
      category: s.category || '',

      full_name: s.full_name || '',
      email: s.email || '',
      phone: s.phone || '',

      date_of_birth: s.date_of_birth || '',

      parent_name: s.parent_name || '',
      parent_phone: s.parent_phone || '',
      address: s.address || '',

      /*
       * Course fields
       */
      course: s.course || '',
      exam: s.exam || '',
      level: s.level || '',
      stream: s.stream || '',
      session: s.session || '',

      /*
       * Batch
       */
      batch: s.batch || '',
      batch_timing: s.batch_timing || '',

      /*
       * Other
       */
      duration: s.duration || '',
      computer_course: s.computer_course || '',
      subjects: s.subjects || [],
    };
  };

  /* =========================================================
     COURSE DISPLAY FROM FORM
  ========================================================= */

  const getCourseDisplayFromForm = (
    data: CompleteFormValue
  ): string => {
    const parts: string[] = [];

    const cat = data.category;

    /*
     * Prefer explicit course value if the form has one.
     */
    if (
      'course' in data &&
      typeof data.course === 'string' &&
      data.course.trim()
    ) {
      return data.course.trim();
    }

    if (cat === 'government_exams') {
      if (data.exam) {
        parts.push(data.exam);
      }
    } else if (cat === 'computer_courses') {
      if (data.computer_course) {
        parts.push(data.computer_course);
      }
    } else {
      if (data.level) {
        parts.push(data.level);
      }

      if (data.stream) {
        parts.push(data.stream);
      }
    }

    return parts.join(' - ');
  };

  /* =========================================================
     ADD STUDENT
  ========================================================= */

  const handleOpenAdd = () => {
    setAddEmail('');
    setAddDialogOpen(true);
  };

  const handleAddSubmit = async (
    data: CompleteFormValue
  ) => {
    try {
      setSubmitting(true);

      const emailToUse = data.email;

      if (!emailToUse) {
        toast.error('Email is required');
        return;
      }

      const courseDisplay =
        getCourseDisplayFromForm(data);

      const created =
        await createStudentProfile({
          full_name: data.full_name,
          email: emailToUse,

          phone: data.phone || null,

          course:
            courseDisplay || null,

          category:
            data.category || null,

          exam:
            data.exam || null,

          level:
            data.level || null,

          stream:
            data.stream || null,

          session:
            data.session || null,

          batch:
            data.batch || null,

          batch_timing:
            data.batch_timing || null,

          duration:
            data.duration || null,

          computer_course:
            data.computer_course || null,

          date_of_birth:
            data.date_of_birth || null,

          parent_name:
            data.parent_name || null,

          parent_phone:
            data.parent_phone || null,

          address:
            data.address || null,

          subjects:
            data.subjects || [],

          is_approved: true,
          is_active: true,

          generateEnrollment: true,
        });

      await createAdmission({
        student_name: data.full_name,
        email: emailToUse,

        phone:
          data.phone || '',

        course:
          courseDisplay || '',

        class:
          data.level || null,

        subjects:
          data.subjects || null,

        parent_name:
          data.parent_name || null,

        parent_phone:
          data.parent_phone || null,

        address:
          data.address || null,

        status: 'approved',

        message:
          'Created by admin',

        category:
          data.category || null,

        exam:
          data.exam || null,

        level:
          data.level || null,

        stream:
          data.stream || null,

        session:
          data.session || null,

        batch:
          data.batch || null,

        batch_timing:
          data.batch_timing || null,

        duration:
          data.duration || null,

        computer_course:
          data.computer_course || null,

        date_of_birth:
          data.date_of_birth || null,

        student_profile_id:
          created.id,
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
      const message =
        err instanceof Error
          ? err.message
          : 'Failed to add student';

      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  /* =========================================================
     EDIT STUDENT
  ========================================================= */

  const handleOpenEdit = (
    s: StudentProfile
  ) => {
    setSelectedStudent(s);
    setEditEmail(s.email || '');
    setEditDialogOpen(true);
  };

  const handleEditSubmit = async (
    data: CompleteFormValue
  ) => {
    if (!selectedStudent) {
      return;
    }

    try {
      setSubmitting(true);

      const emailToUse =
        data.email;

      const courseDisplay =
        getCourseDisplayFromForm(data);

      await updateStudentProfile(
        selectedStudent.id,
        {
          full_name:
            data.full_name,

          email:
            emailToUse || null,

          phone:
            data.phone || null,

          course:
            courseDisplay || null,

          category:
            data.category || null,

          exam:
            data.exam || null,

          level:
            data.level || null,

          stream:
            data.stream || null,

          session:
            data.session || null,

          batch:
            data.batch || null,

          batch_timing:
            data.batch_timing || null,

          duration:
            data.duration || null,

          computer_course:
            data.computer_course || null,

          date_of_birth:
            data.date_of_birth || null,

          parent_name:
            data.parent_name || null,

          parent_phone:
            data.parent_phone || null,

          address:
            data.address || null,

          subjects:
            data.subjects || [],
        }
      );

      toast.success(
        'Student updated successfully!'
      );

      setEditDialogOpen(false);
      setSelectedStudent(null);

      await loadStudents();
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Failed to update student';

      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  /* =========================================================
     VIEW STUDENT
  ========================================================= */

  const handleView = (
    s: StudentProfile
  ) => {
    setSelectedStudent(s);
    setViewDialogOpen(true);
  };

  /* =========================================================
     TOGGLE ACTIVE
  ========================================================= */

  const handleToggleClick = (
    s: StudentProfile
  ) => {
    setToggleStudentId(s.id);

    setToggleTargetState(
      !s.is_active
    );

    setToggleDialogOpen(true);
  };

  const handleConfirmToggle = async () => {
    if (!toggleStudentId) {
      return;
    }

    try {
      setToggleLoading(true);

      await toggleStudentActive(
        toggleStudentId,
        toggleTargetState
      );

      toast.success(
        toggleTargetState
          ? 'Student activated successfully!'
          : 'Student deactivated successfully!'
      );

      setToggleDialogOpen(false);
      setToggleStudentId(null);

      await loadStudents();
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Failed to toggle student status';

      toast.error(message);
    } finally {
      setToggleLoading(false);
    }
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="space-y-6">

      {/* =====================================================
          TOP TOOLBAR
      ====================================================== */}

      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">

            <div className="grid flex-1 grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-5">

              {/* Search */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="search-input"
                  className="text-xs font-medium text-gray-600"
                >
                  Search
                </Label>

                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                  <Input
                    id="search-input"
                    placeholder="Name, email, phone, enrollment..."
                    value={searchQuery}
                    onChange={(e) =>
                      setSearchQuery(e.target.value)
                    }
                    className="h-10 pl-9"
                  />
                </div>
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="category-filter"
                  className="text-xs font-medium text-gray-600"
                >
                  Category
                </Label>

                <Select
                  value={categoryFilter}
                  onValueChange={(v) =>
                    setCategoryFilter(v)
                  }
                >
                  <SelectTrigger
                    id="category-filter"
                    className="h-10"
                  >
                    <SelectValue placeholder="All" />
                  </SelectTrigger>

                  <SelectContent>
                    {CATEGORY_OPTIONS.map(
                      (opt) => (
                        <SelectItem
                          key={opt.value}
                          value={opt.value}
                        >
                          {opt.label}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Course */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="course-filter"
                  className="text-xs font-medium text-gray-600"
                >
                  Course / Exam
                </Label>

                <Input
                  id="course-filter"
                  placeholder="Filter course/exam..."
                  value={courseFilter}
                  onChange={(e) =>
                    setCourseFilter(
                      e.target.value
                    )
                  }
                  className="h-10"
                />
              </div>

              {/* Batch */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="batch-filter"
                  className="text-xs font-medium text-gray-600"
                >
                  Batch
                </Label>

                <Select
                  value={batchFilter}
                  onValueChange={(v) =>
                    setBatchFilter(v)
                  }
                >
                  <SelectTrigger
                    id="batch-filter"
                    className="h-10"
                  >
                    <SelectValue placeholder="All" />
                  </SelectTrigger>

                  <SelectContent>
                    {BATCH_OPTIONS.map(
                      (opt) => (
                        <SelectItem
                          key={opt.value}
                          value={opt.value}
                        >
                          {opt.label}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Status */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="status-filter"
                  className="text-xs font-medium text-gray-600"
                >
                  Status
                </Label>

                <Select
                  value={statusFilter}
                  onValueChange={(v) =>
                    setStatusFilter(v)
                  }
                >
                  <SelectTrigger
                    id="status-filter"
                    className="h-10"
                  >
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>

                  <SelectContent>
                    {STATUS_OPTIONS.map(
                      (opt) => (
                        <SelectItem
                          key={opt.value}
                          value={opt.value}
                        >
                          {opt.label}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Add Student */}
            <div className="flex lg:justify-end">
              <Button
                onClick={handleOpenAdd}
                className="h-10 bg-gradient-to-r from-blue-600 to-red-600 px-5 text-white shadow-md shadow-blue-200 transition-all hover:from-blue-700 hover:to-red-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Student
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* =====================================================
          STUDENT TABLE
      ====================================================== */}

      <Card className="overflow-hidden border-0 shadow-sm">
        <div className="overflow-x-auto">
          {(() => {
            const {
              columns,
              colSpan,
            } =
              getDynamicColumns(
                categoryFilter
              );

            return (
              <table className="w-full text-sm">

                <thead className="border-b border-gray-100 bg-gray-50">
                  <tr>
                    {columns.map(
                      (col) => (
                        <th
                          key={col.key}
                          className={`whitespace-nowrap px-6 py-3.5 text-left font-semibold text-gray-700 ${
                            col.className || ''
                          }`}
                        >
                          {col.label}
                        </th>
                      )
                    )}

                    <th className="whitespace-nowrap px-6 py-3.5 text-left font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">

                  {/* Loading */}
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
                    /* Empty */
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
                    /* Students */
                    filteredStudents.map(
                      (student) => (
                        <tr
                          key={student.id}
                          className="transition-colors hover:bg-gray-50/60"
                        >
                          {columns.map(
                            (col) => (
                              <td
                                key={col.key}
                                className={`px-6 py-4 ${
                                  col.cellClassName ||
                                  ''
                                }`}
                              >
                                {col.render(
                                  student
                                )}
                              </td>
                            )
                          )}

                          {/* Actions */}
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap items-center gap-1.5">

                              {/* View */}
                              <Button
                                size="sm"
                                variant="default"
                                className="h-8 bg-blue-600 text-white hover:bg-blue-700"
                                onClick={() =>
                                  handleView(
                                    student
                                  )
                                }
                                title="View student details"
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </Button>

                              {/* Edit */}
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 border-gray-300 text-gray-700 hover:bg-gray-50"
                                onClick={() =>
                                  handleOpenEdit(
                                    student
                                  )
                                }
                                title="Edit student"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>

                              {/* Active / Inactive */}
                              <Button
                                size="sm"
                                variant="outline"
                                className={`h-8 ${
                                  student.is_active
                                    ? 'border-amber-300 text-amber-700 hover:bg-amber-50'
                                    : 'border-green-300 text-green-700 hover:bg-green-50'
                                }`}
                                onClick={() =>
                                  handleToggleClick(
                                    student
                                  )
                                }
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
                      )
                    )
                  )}
                </tbody>
              </table>
            );
          })()}
        </div>
      </Card>

      {/* =====================================================
          ADD STUDENT DIALOG
      ====================================================== */}

      <Dialog
        open={addDialogOpen}
        onOpenChange={(open) =>
          !submitting &&
          setAddDialogOpen(open)
        }
      >
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">

          <DialogHeader>
            <DialogTitle className="text-xl">
              Add New Student
            </DialogTitle>
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
              onClick={() =>
                setAddDialogOpen(false)
              }
              disabled={submitting}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* =====================================================
          EDIT STUDENT DIALOG
      ====================================================== */}

      <Dialog
        open={editDialogOpen}
        onOpenChange={(open) =>
          !submitting &&
          setEditDialogOpen(open)
        }
      >
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">

          <DialogHeader>
            <DialogTitle className="text-xl">
              Edit Student
            </DialogTitle>
          </DialogHeader>

          {selectedStudent && (
            <div className="space-y-5 py-2">

              <DynamicCategoryForm
                mode="admin-edit"
                initialData={buildInitialData(
                  selectedStudent
                )}
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

      {/* =====================================================
          VIEW STUDENT DETAILS DIALOG
          
          IMPORTANT:
          DynamicCategoryForm is NOT used here.
          
          This directly displays student_profiles data.
      ====================================================== */}

      <Dialog
        open={viewDialogOpen}
        onOpenChange={(open) => {
          setViewDialogOpen(open);

          if (!open) {
            setSelectedStudent(null);
          }
        }}
      >
        <DialogContent className="max-h-[92vh] max-w-4xl overflow-y-auto p-0">

          {/* Header */}
          <DialogHeader className="sticky top-0 z-20 border-b bg-white px-6 py-5">

            <DialogTitle className="text-xl font-bold text-gray-900">
              Student Details
            </DialogTitle>

            {selectedStudent && (
              <p className="mt-1 text-sm text-gray-500">
                Complete profile and enrollment information
              </p>
            )}

          </DialogHeader>

          {selectedStudent && (
            <div className="space-y-5 px-6 py-5">

              {/* =================================================
                  PERSONAL INFORMATION
              ================================================== */}

              <Card className="overflow-hidden border border-gray-200 shadow-sm">
                <CardContent className="p-5">

                  <SectionHeader
                    title="Personal Information"
                  />

                  <div className="mt-5 grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">

                    <DetailItem
                      label="Full Name"
                      value={
                        selectedStudent.full_name
                      }
                    />

                    <DetailItem
                      label="Email"
                      value={
                        selectedStudent.email
                      }
                    />

                    <DetailItem
                      label="Phone"
                      value={formatPhone(
                        selectedStudent.phone
                      )}
                    />

                    <DetailItem
                      label="Date of Birth"
                      value={
                        selectedStudent.date_of_birth
                          ? formatDate(
                              selectedStudent.date_of_birth
                            )
                          : null
                      }
                    />

                    <DetailItem
                      label="Father's / Guardian's Name"
                      value={
                        selectedStudent.parent_name
                      }
                    />

                    <DetailItem
                      label="Parent / Guardian Phone"
                      value={formatPhone(
                        selectedStudent.parent_phone
                      )}
                    />

                    <DetailItem
                      label="Address"
                      value={
                        selectedStudent.address
                      }
                      fullWidth
                    />

                  </div>
                </CardContent>
              </Card>

              {/* =================================================
                  COURSE & CATEGORY INFORMATION
              ================================================== */}

              <Card className="overflow-hidden border border-gray-200 shadow-sm">
                <CardContent className="p-5">

                  <SectionHeader
                    title="Course & Category Information"
                    gradient="from-emerald-600 to-green-600"
                  />

                  <div className="mt-5 space-y-5">

                    {/* Course / Category */}
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                      <DetailItem
                        label="Course"
                        value={
                          getCourseDisplay(
                            selectedStudent
                          )
                        }
                      />

                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                          Category
                        </p>

                        <div className="mt-2">
                          <Badge
                            variant="outline"
                            className={`${getCategoryBadgeClass(
                              selectedStudent.category
                            )} border px-3 py-1`}
                          >
                            {selectedStudent.category
                              ? CATEGORY_LABELS[
                                  selectedStudent.category
                                ]
                              : '—'}
                          </Badge>
                        </div>
                      </div>

                    </div>

                    {/* =================================================
                        GOVERNMENT EXAMS
                    ================================================== */}

                    {selectedStudent.category ===
                      'government_exams' && (
                      <div className="rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 p-5">

                        <div className="mb-4">
                          <h4 className="font-semibold text-gray-900">
                            Government Exam Details
                          </h4>

                          <p className="mt-1 text-xs text-gray-500">
                            Exam and batch information
                          </p>
                        </div>

                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                          <DetailItem
                            label="Exam"
                            value={
                              selectedStudent.exam
                            }
                          />

                          <DetailItem
                            label="Batch"
                            value={
                              selectedStudent.batch
                            }
                          />

                          <DetailItem
                            label="Batch Timing"
                            value={
                              selectedStudent.batch_timing
                            }
                          />

                          <DetailItem
                            label="Duration"
                            value={
                              selectedStudent.duration
                            }
                          />

                        </div>
                      </div>
                    )}

                    {/* =================================================
                        COMPUTER COURSES
                    ================================================== */}

                    {selectedStudent.category ===
                      'computer_courses' && (
                      <div className="rounded-xl border border-purple-200 bg-purple-50/60 p-5">

                        <div className="mb-4">
                          <h4 className="font-semibold text-gray-900">
                            Computer Course Details
                          </h4>

                          <p className="mt-1 text-xs text-gray-500">
                            Course, batch and duration
                          </p>
                        </div>

                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                          <DetailItem
                            label="Computer Course"
                            value={
                              selectedStudent.computer_course
                            }
                          />

                          <DetailItem
                            label="Duration"
                            value={
                              selectedStudent.duration
                            }
                          />

                          <DetailItem
                            label="Batch"
                            value={
                              selectedStudent.batch
                            }
                          />

                          <DetailItem
                            label="Batch Timing"
                            value={
                              selectedStudent.batch_timing
                            }
                          />

                        </div>
                      </div>
                    )}

                    {/* =================================================
                        NIOS / OPEN SCHOOLING
                    ================================================== */}

                    {(selectedStudent.category ===
                      'nios' ||
                      selectedStudent.category ===
                        'open_schooling') && (
                      <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-5">

                        <div className="mb-4">
                          <h4 className="font-semibold text-gray-900">
                            Academic Details
                          </h4>

                          <p className="mt-1 text-xs text-gray-500">
                            Academic level, stream,
                            session and subjects
                          </p>
                        </div>

                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                          <DetailItem
                            label="Level / Class"
                            value={
                              selectedStudent.level
                            }
                          />

                          <DetailItem
                            label="Stream"
                            value={
                              selectedStudent.stream
                            }
                          />

                          <DetailItem
                            label="Session"
                            value={
                              selectedStudent.session
                            }
                          />

                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                              Subjects
                            </p>

                            {selectedStudent.subjects &&
                            selectedStudent.subjects.filter(
                              Boolean
                            ).length > 0 ? (
                              <div className="mt-2 flex flex-wrap gap-2">

                                {selectedStudent.subjects
                                  .filter(Boolean)
                                  .map(
                                    (
                                      subject,
                                      index
                                    ) => (
                                      <Badge
                                        key={`${subject}-${index}`}
                                        variant="outline"
                                        className="border-blue-200 bg-blue-50 text-blue-700"
                                      >
                                        {subject}
                                      </Badge>
                                    )
                                  )}

                              </div>
                            ) : (
                              <p className="mt-1.5 text-sm text-gray-900">
                                —
                              </p>
                            )}
                          </div>

                        </div>
                      </div>
                    )}

                    {/* =================================================
                        GENERAL / EMPTY CATEGORY
                    ================================================== */}

                    {!selectedStudent.category && (
                      <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">

                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                          <DetailItem
                            label="Level / Class"
                            value={
                              selectedStudent.level
                            }
                          />

                          <DetailItem
                            label="Stream"
                            value={
                              selectedStudent.stream
                            }
                          />

                          <DetailItem
                            label="Session"
                            value={
                              selectedStudent.session
                            }
                          />

                          <DetailItem
                            label="Duration"
                            value={
                              selectedStudent.duration
                            }
                          />

                        </div>
                      </div>
                    )}

                    {/* =================================================
                        SUBJECTS
                    ================================================== */}

                    {selectedStudent.subjects &&
                      selectedStudent.subjects.filter(
                        Boolean
                      ).length > 0 && (
                        <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">

                          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                            Subjects
                          </p>

                          <div className="mt-3 flex flex-wrap gap-2">

                            {selectedStudent.subjects
                              .filter(Boolean)
                              .map(
                                (
                                  subject,
                                  index
                                ) => (
                                  <Badge
                                    key={`${subject}-${index}`}
                                    variant="outline"
                                    className="border-gray-200 bg-white text-gray-700"
                                  >
                                    {subject}
                                  </Badge>
                                )
                              )}

                          </div>
                        </div>
                      )}

                  </div>
                </CardContent>
              </Card>

              {/* =================================================
                  ENROLLMENT INFORMATION
              ================================================== */}

              <Card className="overflow-hidden border border-gray-200 shadow-sm">
                <CardContent className="p-5">

                  <SectionHeader
                    title="Enrollment Information"
                    gradient="from-blue-600 to-red-600"
                  />

                  <div className="mt-5 grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">

                    <DetailItem
                      label="Enrollment Number"
                      value={
                        selectedStudent.enrollment_number
                      }
                    />

                    <DetailItem
                      label="Application ID"
                      value={
                        selectedStudent.application_id
                      }
                    />

                    <DetailItem
                      label="Registration Date"
                      value={
                        selectedStudent.created_at
                          ? formatDate(
                              selectedStudent.created_at
                            )
                          : null
                      }
                    />

                    <DetailItem
                      label="Last Updated"
                      value={
                        selectedStudent.updated_at
                          ? formatDate(
                              selectedStudent.updated_at
                            )
                          : null
                      }
                    />

                    {/* Approval */}
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                        Approval Status
                      </p>

                      <div className="mt-2">
                        <Badge
                          variant="outline"
                          className={
                            selectedStudent.is_approved
                              ? 'border-green-200 bg-green-100 text-green-700'
                              : 'border-yellow-200 bg-yellow-100 text-yellow-700'
                          }
                        >
                          {selectedStudent.is_approved
                            ? 'Approved'
                            : 'Pending'}
                        </Badge>
                      </div>
                    </div>

                    {/* Active */}
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                        Active Status
                      </p>

                      <div className="mt-2">

                        {selectedStudent.is_active ? (
                          <Badge
                            variant="outline"
                            className="border-green-200 bg-green-100 text-green-700"
                          >
                            Active
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="border-rose-200 bg-rose-100 text-rose-700"
                          >
                            Inactive
                          </Badge>
                        )}

                      </div>
                    </div>

                  </div>
                </CardContent>
              </Card>

              {/* =================================================
                  DATABASE / ADDITIONAL INFORMATION
              ================================================== */}

              <Card className="border border-gray-200 bg-gray-50 shadow-sm">
                <CardContent className="p-5">

                  <SectionHeader
                    title="Additional Information"
                    gradient="from-gray-500 to-gray-700"
                  />

                  <div className="mt-5 grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">

                    <DetailItem
                      label="Profile ID"
                      value={
                        selectedStudent.id
                      }
                    />

                    <DetailItem
                      label="User ID"
                      value={
                        selectedStudent.user_id
                      }
                    />

                    <DetailItem
                      label="Course Stored in Database"
                      value={
                        selectedStudent.course
                      }
                    />

                    <DetailItem
                      label="Category Value"
                      value={
                        selectedStudent.category
                      }
                    />

                    <DetailItem
                      label="Exam Value"
                      value={
                        selectedStudent.exam
                      }
                    />

                    <DetailItem
                      label="Computer Course"
                      value={
                        selectedStudent.computer_course
                      }
                    />

                  </div>
                </CardContent>
              </Card>

            </div>
          )}

          {/* Footer */}
          <DialogFooter className="sticky bottom-0 border-t bg-white px-6 py-4">

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

      {/* =====================================================
          TOGGLE ACTIVE CONFIRMATION
      ====================================================== */}

      <AlertDialog
        open={toggleDialogOpen}
        onOpenChange={(open) =>
          !toggleLoading &&
          setToggleDialogOpen(open)
        }
      >
        <AlertDialogContent>

          <AlertDialogHeader>

            <AlertDialogTitle className="flex items-center gap-2">

              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full ${
                  toggleTargetState
                    ? 'bg-green-100'
                    : 'bg-amber-100'
                }`}
              >
                {toggleTargetState ? (
                  <PlayCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <PauseCircle className="h-5 w-5 text-amber-600" />
                )}
              </div>

              {toggleTargetState
                ? 'Activate Student'
                : 'Deactivate Student'}

            </AlertDialogTitle>

            <AlertDialogDescription>
              {toggleTargetState
                ? 'Are you sure you want to activate this student account? This will restore their access to the portal.'
                : 'Are you sure you want to deactivate this student account? This will suspend their access to the portal.'}
            </AlertDialogDescription>

          </AlertDialogHeader>

          <AlertDialogFooter>

            <AlertDialogCancel
              disabled={toggleLoading}
            >
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
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-amber-600 text-white hover:bg-amber-700'
              }
            >
              {toggleLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />

                  {toggleTargetState
                    ? 'Activating...'
                    : 'Deactivating...'}
                </>
              ) : (
                <>
                  {toggleTargetState
                    ? 'Yes, Activate'
                    : 'Yes, Deactivate'}
                </>
              )}
            </AlertDialogAction>

          </AlertDialogFooter>

        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}