'use client';

import { useEffect, useState } from 'react';
import {
  Loader2,
  GraduationCap,
  BookOpen,
  Monitor,
  Building2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import {
  StudentCategory,
  GOVERNMENT_EXAMS,
  NIOS_LEVELS,
  OPEN_SCHOOLING_LEVELS,
  STREAMS,
  SESSIONS,
  BATCHES,
  BATCH_TIMINGS,
  COMPUTER_DURATIONS,
  COMPUTER_COURSES,
  Course,
} from '@/lib/types';

/* =========================================================
   TYPES
========================================================= */

export interface CategoryFormValue {
  category: StudentCategory | '';

  exam?: string;
  level?: string;
  stream?: string;
  session?: string;

  batch?: string;
  batch_timing?: string;

  duration?: string;
  computer_course?: string;
}

export interface PersonalFormValue {
  full_name: string;
  email: string;
  phone: string;

  date_of_birth: string;

  parent_name: string;
  parent_phone: string;

  address: string;
}

export interface CompleteFormValue
  extends PersonalFormValue,
    CategoryFormValue {
  course: string;

  /*
   * Enrollment number is only used for NIOS.
   */
  enrollment_number: string;

  subjects?: string[];
}

type CourseWithCategory = Course & {
  category?: StudentCategory | null;
};

interface DynamicCategoryFormProps {
  mode: 'signup' | 'admin-create' | 'admin-edit' | 'view';

  initialData?: Partial<CompleteFormValue>;

  onSubmit?: (data: CompleteFormValue) => void;

  isLoading?: boolean;

  submitLabel?: string;

  courses?: Course[];

  includeSubjectsFor?: boolean;

  compact?: boolean;
}

/* =========================================================
   CATEGORY ICONS
========================================================= */

const CATEGORY_ICONS: Record<
  StudentCategory,
  typeof GraduationCap
> = {
  government_exams: Building2,
  nios: BookOpen,
  open_schooling: GraduationCap,
  computer_courses: Monitor,
};

/* =========================================================
   CATEGORY LABELS
========================================================= */

const CATEGORY_LABELS_LOCAL: Record<StudentCategory, string> = {
  government_exams: 'Government Exams',
  nios: 'NIOS',
  open_schooling: 'Open Schooling',
  computer_courses: 'Computer Courses',
};

/* =========================================================
   DEFAULT FORM
========================================================= */

const DEFAULT_FORM: CompleteFormValue = {
  category: '',

  course: '',

  /*
   * Only used for NIOS
   */
  enrollment_number: '',

  full_name: '',
  email: '',
  phone: '',

  date_of_birth: '',

  parent_name: '',
  parent_phone: '',

  address: '',

  exam: '',
  level: '',
  stream: '',
  session: '',

  batch: '',
  batch_timing: '',

  duration: '',
  computer_course: '',

  subjects: [],
};

/* =========================================================
   COMPONENT
========================================================= */

export default function DynamicCategoryForm({
  mode,
  initialData,
  onSubmit,
  isLoading = false,
  submitLabel,
  courses = [],
  includeSubjectsFor = true,
  compact = false,
}: DynamicCategoryFormProps) {
  const readOnly = mode === 'view';

  const typedCourses = courses as CourseWithCategory[];

  /* =======================================================
     STATE
  ======================================================= */

  const [form, setForm] =
    useState<CompleteFormValue>({
      ...DEFAULT_FORM,
      ...(initialData || {}),
    });

  const [subjectsInput, setSubjectsInput] =
    useState<string>(
      initialData?.subjects?.join(', ') || ''
    );

  /* =======================================================
     HELPER:
     ENROLLMENT REQUIRED ONLY FOR NIOS
  ======================================================= */

  const enrollmentRequired =
    form.category === 'nios';

  /* =======================================================
     LOAD INITIAL DATA
  ======================================================= */

  useEffect(() => {
    if (!initialData) {
      return;
    }

    const initialCategory =
      initialData.category || '';

    /*
     * Only keep enrollment number when
     * category is NIOS.
     */
    const initialEnrollment =
      initialCategory === 'nios'
        ? initialData.enrollment_number || ''
        : '';

    setForm({
      ...DEFAULT_FORM,
      ...initialData,

      category: initialCategory,

      course: initialData.course || '',

      enrollment_number: initialEnrollment,

      full_name:
        initialData.full_name || '',

      email:
        initialData.email || '',

      phone:
        initialData.phone || '',

      date_of_birth:
        initialData.date_of_birth || '',

      parent_name:
        initialData.parent_name || '',

      parent_phone:
        initialData.parent_phone || '',

      address:
        initialData.address || '',

      exam:
        initialData.exam || '',

      level:
        initialData.level || '',

      stream:
        initialData.stream || '',

      session:
        initialData.session || '',

      batch:
        initialData.batch || '',

      batch_timing:
        initialData.batch_timing || '',

      duration:
        initialData.duration || '',

      computer_course:
        initialData.computer_course || '',

      subjects:
        initialData.subjects || [],
    });

    setSubjectsInput(
      (initialData.subjects || []).join(', ')
    );
  }, [initialData]);

  /* =======================================================
     UPDATE FIELD
  ======================================================= */

  const updateField = <
    K extends keyof CompleteFormValue
  >(
    key: K,
    value: CompleteFormValue[K]
  ) => {
    if (readOnly) {
      return;
    }

    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  /* =======================================================
     COURSE CHANGE
  ======================================================= */

  const handleCourseChange = (
    courseTitle: string
  ) => {
    if (readOnly) {
      return;
    }

    const selectedCourse = typedCourses.find(
      (course) => course.title === courseTitle
    );

    const selectedCategory =
      selectedCourse?.category || '';

    /*
     * Enrollment number is ONLY allowed for NIOS.
     */
    const shouldKeepEnrollment =
      selectedCategory === 'nios';

    setForm((prev) => ({
      ...prev,

      course: courseTitle,

      category: selectedCategory,

      /*
       * Keep enrollment only when the new
       * category supports it.
       */
      enrollment_number:
        shouldKeepEnrollment
          ? prev.enrollment_number
          : '',

      exam: '',
      level: '',
      stream: '',
      session: '',

      batch: '',
      batch_timing: '',

      duration:
        selectedCourse?.duration || '',

      computer_course:
        selectedCategory === 'computer_courses'
          ? courseTitle
          : '',

      subjects: [],
    }));

    setSubjectsInput('');
  };

  /* =======================================================
     INFO ROW
  ======================================================= */

  const InfoRow = ({
    label,
    value,
    colSpan,
  }: {
    label: string;
    value:
      | string
      | string[]
      | null
      | undefined;
    colSpan?: string;
  }) => {
    const display = Array.isArray(value)
      ? value.filter(Boolean).join(', ')
      : value;

    return (
      <div className={colSpan}>
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
          {label}
        </p>

        <p className="mt-1 break-words text-sm text-gray-900">
          {display || '—'}
        </p>
      </div>
    );
  };

  /* =======================================================
     BADGE ROW
  ======================================================= */

  const BadgeRow = ({
    label,
    items,
    colSpan,
    badgeClass = 'bg-blue-100 text-blue-800',
  }: {
    label: string;
    items:
      | string[]
      | null
      | undefined;
    colSpan?: string;
    badgeClass?: string;
  }) => {
    const list =
      items?.filter(Boolean) || [];

    return (
      <div className={colSpan}>
        <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-gray-500">
          {label}
        </p>

        {list.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {list.map((subject, index) => (
              <span
                key={`${subject}-${index}`}
                className={`rounded-full px-3 py-1 text-xs font-medium ${badgeClass}`}
              >
                {subject}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">
            —
          </p>
        )}
      </div>
    );
  };

  /* =======================================================
     SUBMIT
  ======================================================= */

  const handleInternalSubmit = (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!onSubmit || readOnly) {
      return;
    }

    if (!form.full_name.trim()) {
      return;
    }

    if (!form.email.trim()) {
      return;
    }

    if (!form.course) {
      return;
    }

    if (!form.category) {
      return;
    }

    /*
     * Enrollment number is mandatory ONLY for NIOS.
     */
    if (
      enrollmentRequired &&
      !form.enrollment_number.trim()
    ) {
      return;
    }

    /*
     * For non-NIOS categories,
     * always send an empty enrollment number.
     */
    const finalEnrollment =
      enrollmentRequired
        ? form.enrollment_number.trim()
        : '';

    const payload: CompleteFormValue = {
      ...form,

      enrollment_number:
        finalEnrollment,

      subjects: subjectsInput
        ? subjectsInput
            .split(',')
            .map((subject) =>
              subject.trim()
            )
            .filter(Boolean)
        : [],
    };

    onSubmit(payload);
  };

  /* =======================================================
     VALUES
  ======================================================= */

  const category:
    | StudentCategory
    | '' = form.category;

  const CategoryIcon =
    category
      ? CATEGORY_ICONS[category]
      : null;

  const fieldGrid = 'md:grid-cols-2';

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <form
      onSubmit={handleInternalSubmit}
      className="space-y-6"
    >
      {/* ===================================================
          PERSONAL INFORMATION
      =================================================== */}

      <div className="space-y-4">
        {!compact && (
          <h3 className="flex items-center gap-2 border-b border-gray-100 pb-2 text-lg font-semibold text-gray-900">
            <span className="h-5 w-1.5 rounded-full bg-gradient-to-b from-blue-600 to-red-600" />

            Personal Information
          </h3>
        )}

        {readOnly ? (
          <div
            className={`grid gap-4 ${fieldGrid}`}
          >
            <InfoRow
              label="Full Name"
              value={form.full_name}
            />

            <InfoRow
              label="Email"
              value={form.email}
            />

            <InfoRow
              label="Phone"
              value={form.phone}
            />

            <InfoRow
              label="Date of Birth"
              value={form.date_of_birth}
            />

            <InfoRow
              label="Father's / Guardian's Name"
              value={form.parent_name}
            />

            <InfoRow
              label="Parent / Guardian Phone"
              value={form.parent_phone}
            />

            {/*
             * IMPORTANT:
             * Enrollment appears here ONLY for
             * NIOS / Open Schooling.
             */}
            {enrollmentRequired && (
              <InfoRow
                label="Enrollment Number"
                value={form.enrollment_number}
              />
            )}

            <InfoRow
              label="Course"
              value={form.course}
            />

            <InfoRow
              label="Address"
              value={form.address}
              colSpan="md:col-span-2"
            />
          </div>
        ) : (
          <>
            <div
              className={`grid gap-4 ${fieldGrid}`}
            >
              {/* FULL NAME */}

              <div className="space-y-1.5">
                <Label htmlFor="full_name">
                  Full Name *
                </Label>

                <Input
                  id="full_name"
                  placeholder="Enter full name"
                  required
                  value={form.full_name}
                  onChange={(e) =>
                    updateField(
                      'full_name',
                      e.target.value
                    )
                  }
                  className="h-11 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              {/* EMAIL */}

              <div className="space-y-1.5">
                <Label htmlFor="email">
                  Email *
                </Label>

                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  required
                  value={form.email}
                  onChange={(e) =>
                    updateField(
                      'email',
                      e.target.value
                    )
                  }
                  className="h-11 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              {/* PHONE */}

              <div className="space-y-1.5">
                <Label htmlFor="phone">
                  Phone *
                </Label>

                <Input
                  id="phone"
                  type="tel"
                  placeholder="Phone number"
                  required
                  value={form.phone}
                  onChange={(e) =>
                    updateField(
                      'phone',
                      e.target.value
                    )
                  }
                  className="h-11 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              {/* DOB */}

              <div className="space-y-1.5">
                <Label htmlFor="date_of_birth">
                  Date of Birth
                </Label>

                <Input
                  id="date_of_birth"
                  type="date"
                  value={
                    form.date_of_birth
                  }
                  onChange={(e) =>
                    updateField(
                      'date_of_birth',
                      e.target.value
                    )
                  }
                  className="h-11 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              {/* PARENT NAME */}

              <div className="space-y-1.5">
                <Label htmlFor="parent_name">
                  Father's / Guardian's Name
                </Label>

                <Input
                  id="parent_name"
                  placeholder="Parent or guardian name"
                  value={
                    form.parent_name
                  }
                  onChange={(e) =>
                    updateField(
                      'parent_name',
                      e.target.value
                    )
                  }
                  className="h-11 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              {/* PARENT PHONE */}

              <div className="space-y-1.5">
                <Label htmlFor="parent_phone">
                  Parent / Guardian Phone
                </Label>

                <Input
                  id="parent_phone"
                  placeholder="Parent phone number"
                  value={
                    form.parent_phone
                  }
                  onChange={(e) =>
                    updateField(
                      'parent_phone',
                      e.target.value
                    )
                  }
                  className="h-11 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* ADDRESS */}

            <div className="space-y-1.5">
              <Label htmlFor="address">
                Address
              </Label>

              <Textarea
                id="address"
                placeholder="Residential address"
                rows={2}
                value={form.address}
                onChange={(e) =>
                  updateField(
                    'address',
                    e.target.value
                  )
                }
                className="rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </>
        )}
      </div>

      {/* ===================================================
          COURSE SELECTION
      =================================================== */}

      <div className="space-y-4">
        {!compact && (
          <h3 className="flex items-center gap-2 border-b border-gray-100 pb-2 text-lg font-semibold text-gray-900">
            <span className="h-5 w-1.5 rounded-full bg-gradient-to-b from-blue-600 to-red-600" />

            Select Course
          </h3>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="course">
            Course *
          </Label>

          {readOnly ? (
            <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-900">
              {form.course || '—'}
            </div>
          ) : (
            <Select
              value={form.course || ''}
              onValueChange={
                handleCourseChange
              }
            >
              <SelectTrigger
                id="course"
                className="h-11 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              >
                <SelectValue placeholder="Select a course" />
              </SelectTrigger>

              <SelectContent>
                {typedCourses.length > 0 ? (
                  typedCourses.map(
                    (course) => (
                      <SelectItem
                        key={course.id}
                        value={course.title}
                        className="cursor-pointer"
                      >
                        {course.title}
                      </SelectItem>
                    )
                  )
                ) : (
                  <SelectItem
                    value="no-courses"
                    disabled
                  >
                    No courses available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* SELECTED CATEGORY DISPLAY */}

        {category && (
          <div className="flex items-center gap-2">
            {CategoryIcon && (
              <CategoryIcon className="h-4 w-4 text-blue-600" />
            )}

            <span className="text-sm text-gray-500">
              Category:
            </span>

            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              {
                CATEGORY_LABELS_LOCAL[
                  category
                ]
              }
            </span>
          </div>
        )}
      </div>

      {/* ===================================================
          GOVERNMENT EXAMS
      =================================================== */}

      {category ===
        'government_exams' && (
        <div className="space-y-4 rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-orange-50 p-5">
          {!compact && (
            <h4 className="flex items-center gap-2 font-semibold text-gray-900">
              <Building2 className="h-5 w-5 text-amber-600" />

              Government Exam Details
            </h4>
          )}

          {readOnly ? (
            <div
              className={`grid gap-4 ${fieldGrid}`}
            >
              <InfoRow
                label="Exam"
                value={form.exam}
              />

              <InfoRow
                label="Batch"
                value={form.batch}
              />

              <InfoRow
                label="Batch Timing"
                value={
                  form.batch_timing
                }
                colSpan="md:col-span-2"
              />
            </div>
          ) : (
            <div
              className={`grid gap-4 ${fieldGrid}`}
            >
              {/* EXAM */}

              <div className="space-y-1.5">
                <Label htmlFor="exam">
                  Exam *
                </Label>

                <Select
                  value={form.exam || ''}
                  onValueChange={(value) =>
                    updateField(
                      'exam',
                      value
                    )
                  }
                >
                  <SelectTrigger
                    id="exam"
                    className="h-11 rounded-xl border-gray-200"
                  >
                    <SelectValue placeholder="Select exam" />
                  </SelectTrigger>

                  <SelectContent>
                    {GOVERNMENT_EXAMS.map(
                      (exam) => (
                        <SelectItem
                          key={exam}
                          value={exam}
                        >
                          {exam}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* BATCH */}

              <div className="space-y-1.5">
                <Label htmlFor="batch_exam">
                  Batch
                </Label>

                <Select
                  value={form.batch || ''}
                  onValueChange={(value) =>
                    updateField(
                      'batch',
                      value
                    )
                  }
                >
                  <SelectTrigger
                    id="batch_exam"
                    className="h-11 rounded-xl border-gray-200"
                  >
                    <SelectValue placeholder="Select batch" />
                  </SelectTrigger>

                  <SelectContent>
                    {BATCHES.map(
                      (batch) => (
                        <SelectItem
                          key={batch}
                          value={batch}
                        >
                          {batch}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* BATCH TIMING */}

              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="batch_timing_exam">
                  Batch Timing
                </Label>

                <Select
                  value={
                    form.batch_timing ||
                    ''
                  }
                  onValueChange={(value) =>
                    updateField(
                      'batch_timing',
                      value
                    )
                  }
                >
                  <SelectTrigger
                    id="batch_timing_exam"
                    className="h-11 rounded-xl border-gray-200"
                  >
                    <SelectValue placeholder="Select batch timing" />
                  </SelectTrigger>

                  <SelectContent>
                    {BATCH_TIMINGS.map(
                      (timing) => (
                        <SelectItem
                          key={timing}
                          value={timing}
                        >
                          {timing}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===================================================
          NIOS
      =================================================== */}

      {category === 'nios' && (
        <div className="space-y-4 rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-5">
          {!compact && (
            <h4 className="flex items-center gap-2 font-semibold text-gray-900">
              <BookOpen className="h-5 w-5 text-blue-600" />

              NIOS Details
            </h4>
          )}

          {readOnly ? (
            <div
              className={`grid gap-4 ${fieldGrid}`}
            >
              {/* ENROLLMENT */}

              <InfoRow
                label="Enrollment Number"
                value={form.enrollment_number}
              />

              {/* LEVEL */}

              <InfoRow
                label="Level"
                value={form.level}
              />

              {/* STREAM */}

              <InfoRow
                label="Stream"
                value={form.stream}
              />

              {includeSubjectsFor && (
                <BadgeRow
                  label="Subjects"
                  items={form.subjects}
                  colSpan="md:col-span-2"
                  badgeClass="bg-blue-100 text-blue-800"
                />
              )}

              {/* SESSION */}

              <InfoRow
                label="Session"
                value={form.session}
                colSpan="md:col-span-2"
              />
            </div>
          ) : (
            <div
              className={`grid gap-4 ${fieldGrid}`}
            >
              {/* ENROLLMENT NUMBER */}

              <div className="space-y-1.5">
                <Label htmlFor="enrollment_number_nios">
                  Enrollment Number *
                </Label>

                <Input
                  id="enrollment_number_nios"
                  placeholder="Enter NIOS enrollment number"
                  required
                  value={
                    form.enrollment_number
                  }
                  onChange={(e) =>
                    updateField(
                      'enrollment_number',
                      e.target.value
                    )
                  }
                  className="h-11 rounded-xl border-gray-200"
                />

                <p className="text-xs text-gray-500">
                  Enter the student's NIOS enrollment number.
                </p>
              </div>

              {/* LEVEL */}

              <div className="space-y-1.5">
                <Label htmlFor="level_nios">
                  Level *
                </Label>

                <Select
                  value={form.level || ''}
                  onValueChange={(value) =>
                    updateField(
                      'level',
                      value
                    )
                  }
                >
                  <SelectTrigger
                    id="level_nios"
                    className="h-11 rounded-xl border-gray-200"
                  >
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>

                  <SelectContent>
                    {NIOS_LEVELS.map(
                      (level) => (
                        <SelectItem
                          key={level}
                          value={level}
                        >
                          {level}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* STREAM */}

              <div className="space-y-1.5">
                <Label htmlFor="stream_nios">
                  Stream
                </Label>

                <Select
                  value={form.stream || ''}
                  onValueChange={(value) =>
                    updateField(
                      'stream',
                      value
                    )
                  }
                >
                  <SelectTrigger
                    id="stream_nios"
                    className="h-11 rounded-xl border-gray-200"
                  >
                    <SelectValue placeholder="Select stream" />
                  </SelectTrigger>

                  <SelectContent>
                    {STREAMS.map(
                      (stream) => (
                        <SelectItem
                          key={stream}
                          value={stream}
                        >
                          {stream}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* SUBJECTS */}

              {includeSubjectsFor && (
                <div className="space-y-1.5 md:col-span-2">
                  <Label htmlFor="subjects_nios">
                    Subjects
                  </Label>

                  <Input
                    id="subjects_nios"
                    placeholder="Physics, Chemistry, Maths"
                    value={
                      subjectsInput
                    }
                    onChange={(e) =>
                      setSubjectsInput(
                        e.target.value
                      )
                    }
                    className="h-11 rounded-xl border-gray-200"
                  />

                  <p className="text-xs text-gray-500">
                    Enter subjects separated
                    by commas.
                  </p>
                </div>
              )}

              {/* SESSION */}

              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="session_nios">
                  Session
                </Label>

                <Select
                  value={form.session || ''}
                  onValueChange={(value) =>
                    updateField(
                      'session',
                      value
                    )
                  }
                >
                  <SelectTrigger
                    id="session_nios"
                    className="h-11 rounded-xl border-gray-200"
                  >
                    <SelectValue placeholder="Select session" />
                  </SelectTrigger>

                  <SelectContent>
                    {SESSIONS.map(
                      (session) => (
                        <SelectItem
                          key={session}
                          value={session}
                        >
                          {session}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===================================================
          OPEN SCHOOLING
      =================================================== */}

      {category ===
        'open_schooling' && (
        <div className="space-y-4 rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-green-50 p-5">
          {!compact && (
            <h4 className="flex items-center gap-2 font-semibold text-gray-900">
              <GraduationCap className="h-5 w-5 text-emerald-600" />

              Open Schooling Details
            </h4>
          )}

          {readOnly ? (
            <div
              className={`grid gap-4 ${fieldGrid}`}
            >
              {/* LEVEL */}

              <InfoRow
                label="Level"
                value={form.level}
              />

              {/* STREAM */}

              <InfoRow
                label="Stream"
                value={form.stream}
              />

              {includeSubjectsFor && (
                <BadgeRow
                  label="Subjects"
                  items={form.subjects}
                  colSpan="md:col-span-2"
                  badgeClass="bg-emerald-100 text-emerald-800"
                />
              )}

              {/* SESSION */}

              <InfoRow
                label="Session"
                value={form.session}
                colSpan="md:col-span-2"
              />
            </div>
          ) : (
            <div
              className={`grid gap-4 ${fieldGrid}`}
            >
              {/* LEVEL */}

              <div className="space-y-1.5">
                <Label htmlFor="level_open">
                  Level *
                </Label>

                <Select
                  value={form.level || ''}
                  onValueChange={(value) =>
                    updateField(
                      'level',
                      value
                    )
                  }
                >
                  <SelectTrigger
                    id="level_open"
                    className="h-11 rounded-xl border-gray-200"
                  >
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>

                  <SelectContent>
                    {OPEN_SCHOOLING_LEVELS.map(
                      (level) => (
                        <SelectItem
                          key={level}
                          value={level}
                        >
                          {level}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* STREAM */}

              <div className="space-y-1.5">
                <Label htmlFor="stream_open">
                  Stream
                </Label>

                <Select
                  value={form.stream || ''}
                  onValueChange={(value) =>
                    updateField(
                      'stream',
                      value
                    )
                  }
                >
                  <SelectTrigger
                    id="stream_open"
                    className="h-11 rounded-xl border-gray-200"
                  >
                    <SelectValue placeholder="Select stream" />
                  </SelectTrigger>

                  <SelectContent>
                    {STREAMS.map(
                      (stream) => (
                        <SelectItem
                          key={stream}
                          value={stream}
                        >
                          {stream}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* SUBJECTS */}

              {includeSubjectsFor && (
                <div className="space-y-1.5 md:col-span-2">
                  <Label htmlFor="subjects_open">
                    Subjects
                  </Label>

                  <Input
                    id="subjects_open"
                    placeholder="English, Hindi, Mathematics"
                    value={
                      subjectsInput
                    }
                    onChange={(e) =>
                      setSubjectsInput(
                        e.target.value
                      )
                    }
                    className="h-11 rounded-xl border-gray-200"
                  />

                  <p className="text-xs text-gray-500">
                    Enter subjects separated
                    by commas.
                  </p>
                </div>
              )}

              {/* SESSION */}

              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="session_open">
                  Session
                </Label>

                <Select
                  value={form.session || ''}
                  onValueChange={(value) =>
                    updateField(
                      'session',
                      value
                    )
                  }
                >
                  <SelectTrigger
                    id="session_open"
                    className="h-11 rounded-xl border-gray-200"
                  >
                    <SelectValue placeholder="Select session" />
                  </SelectTrigger>

                  <SelectContent>
                    {SESSIONS.map(
                      (session) => (
                        <SelectItem
                          key={session}
                          value={session}
                        >
                          {session}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===================================================
          COMPUTER COURSES
      =================================================== */}

      {category ===
        'computer_courses' && (
        <div className="space-y-4 rounded-2xl border border-purple-100 bg-gradient-to-br from-purple-50 to-pink-50 p-5">
          {!compact && (
            <h4 className="flex items-center gap-2 font-semibold text-gray-900">
              <Monitor className="h-5 w-5 text-purple-600" />

              Computer Course Details
            </h4>
          )}

          {readOnly ? (
            <div
              className={`grid gap-4 ${fieldGrid}`}
            >
              <InfoRow
                label="Course"
                value={form.course}
              />

              <InfoRow
                label="Batch"
                value={form.batch}
              />

              <InfoRow
                label="Batch Timing"
                value={
                  form.batch_timing
                }
              />

              <InfoRow
                label="Duration"
                value={form.duration}
              />
            </div>
          ) : (
            <div
              className={`grid gap-4 ${fieldGrid}`}
            >
              {/* COMPUTER COURSE */}

              <div className="space-y-1.5">
                <Label htmlFor="computer_course_select">
                  Computer Course
                </Label>

                <Select
                  value={form.computer_course || ''}
                  onValueChange={(value) =>
                    updateField(
                      'computer_course',
                      value
                    )
                  }
                >
                  <SelectTrigger
                    id="computer_course_select"
                    className="h-11 rounded-xl border-gray-200"
                  >
                    <SelectValue placeholder="Select computer course" />
                  </SelectTrigger>

                  <SelectContent>
                    {COMPUTER_COURSES.map(
                      (course) => (
                        <SelectItem
                          key={course}
                          value={course}
                        >
                          {course}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* BATCH */}

              <div className="space-y-1.5">
                <Label htmlFor="batch_computer">
                  Batch
                </Label>

                <Select
                  value={form.batch || ''}
                  onValueChange={(value) =>
                    updateField(
                      'batch',
                      value
                    )
                  }
                >
                  <SelectTrigger
                    id="batch_computer"
                    className="h-11 rounded-xl border-gray-200"
                  >
                    <SelectValue placeholder="Select batch" />
                  </SelectTrigger>

                  <SelectContent>
                    {BATCHES.map(
                      (batch) => (
                        <SelectItem
                          key={batch}
                          value={batch}
                        >
                          {batch}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* BATCH TIMING */}

              <div className="space-y-1.5">
                <Label htmlFor="batch_timing_computer">
                  Batch Timing
                </Label>

                <Select
                  value={
                    form.batch_timing ||
                    ''
                  }
                  onValueChange={(value) =>
                    updateField(
                      'batch_timing',
                      value
                    )
                  }
                >
                  <SelectTrigger
                    id="batch_timing_computer"
                    className="h-11 rounded-xl border-gray-200"
                  >
                    <SelectValue placeholder="Select timing" />
                  </SelectTrigger>

                  <SelectContent>
                    {BATCH_TIMINGS.map(
                      (timing) => (
                        <SelectItem
                          key={timing}
                          value={timing}
                        >
                          {timing}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* DURATION */}

              <div className="space-y-1.5">
                <Label htmlFor="duration_computer">
                  Duration
                </Label>

                <Select
                  value={
                    form.duration || ''
                  }
                  onValueChange={(value) =>
                    updateField(
                      'duration',
                      value
                    )
                  }
                >
                  <SelectTrigger
                    id="duration_computer"
                    className="h-11 rounded-xl border-gray-200"
                  >
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>

                  <SelectContent>
                    {COMPUTER_DURATIONS.map(
                      (duration) => (
                        <SelectItem
                          key={duration}
                          value={duration}
                        >
                          {duration}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===================================================
          NO CATEGORY WARNING
      =================================================== */}

      {!readOnly &&
        form.course &&
        !form.category && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm font-medium text-amber-800">
              This course does not have a
              category configured yet.
            </p>

            <p className="mt-1 text-xs text-amber-700">
              Please assign a category to this
              course in your Courses section.
            </p>
          </div>
        )}

      {/* ===================================================
          SUBMIT BUTTON
      =================================================== */}

      {!readOnly && onSubmit && (
        <div className="pt-2">
          <Button
            type="submit"
            disabled={
              isLoading ||
              !form.course ||
              !form.category ||
              !form.full_name ||
              !form.email ||
              (enrollmentRequired &&
                !form.enrollment_number.trim())
            }
            className="h-12 w-full rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-200 transition-all hover:from-red-700 hover:to-red-800 disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />

                Please wait...
              </>
            ) : (
              submitLabel || 'Submit'
            )}
          </Button>
        </div>
      )}
    </form>
  );
}