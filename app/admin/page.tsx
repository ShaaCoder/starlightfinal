'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createClient } from '@/lib/supabase/client';
import {
  Course,
  Lead,
  Notice,
  Admission,
  StudentProfile,
  CATEGORY_LABELS,
  StudentCategory,
} from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth-context';
import { ImageUpload } from '@/components/image-upload';

import { BlogCMS } from '@/components/admin/blog/blog-cms';
import Image from 'next/image';
import {
  Loader as Loader2,
  Trash2,
  CreditCard as Edit2,
  GraduationCap,
  LogOut,
  Users,
  FileText,
  Bell,
  BookOpen,
  ClipboardList,
  Mail,
  ImageIcon,
  HelpCircle,
  Building2,
  Monitor,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import DynamicCategoryForm, {
  CompleteFormValue,
} from '@/components/ui/dynamic-category-form';
import { GalleryUpload } from '@/components/admin/gallery/gallery-upload';
import { GallerySection } from '@/components/admin/gallery/gallery-section';
import QuizSection from '@/components/admin/quiz/quiz-section';
import UsersSection from '@/components/admin/users/users-section';
import StudentsSection from '@/components/admin/students/students-section';

export default function AdminPage() {
  const router = useRouter();
  const { user, role, isLoading: authLoading, signOut } = useAuth();
  const supabase = useRef(createClient()).current;
  const hasLoadedRef = useRef(false);

  const [courses, setCourses] = useState<Course[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingType, setEditingType] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteType, setDeleteType] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('courses');
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [studentFilterCourse, setStudentFilterCourse] = useState('all');
  const [studentFilterClass, setStudentFilterClass] = useState('all');
  const { toast } = useToast();
const [showStudentDeleteDialog, setShowStudentDeleteDialog] =
  useState(false);

const [studentToDelete, setStudentToDelete] =
  useState<StudentProfile | null>(null);
  const confirmStudentDelete = (student: StudentProfile) => {
  setStudentToDelete(student);
  setShowStudentDeleteDialog(true);
};
  function generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
const [courseForm, setCourseForm] = useState({
  title: '',
  description: '',
  image_url: '',
  duration: 'Flexible',
  fee: '',
  featured: false,
  category: '' as StudentCategory | '',
});
  const [noticeForm, setNoticeForm] = useState({ title: '', content: '', priority: 'medium', is_active: true });
 const [studentForm, setStudentForm] = useState({
  full_name: '',
  email: '',
  enrollment_number: '',
  course: '',
  phone: '',
  class_grade: '',
  address: '',
  subjects: '',
});
// ==================== ADMISSION FORM ====================

const emptyAdmissionForm = {
  student_name: '',
  email: '',
  phone: '',
  date_of_birth: '',
  parent_name: '',
  parent_phone: '',
  address: '',
  office_address: '',
  office_phone_1: '',
  office_phone_2: '',
  class: '',
  previous_qualification: '',
  course: '',
  subjects: ['', '', '', ''],
  school_college: '',
  hobbies: '',
  photo_url: '',
  reference_number: '',
  message: '',
  status: 'pending',
};

const [admissionForm, setAdmissionForm] =
  useState(emptyAdmissionForm);

const [showAdmissionView, setShowAdmissionView] =
  useState(false);

const [viewingAdmission, setViewingAdmission] =
  useState<any | null>(null);
const [studentStatusFilter, setStudentStatusFilter] =
  useState<'all' | 'pending' | 'approved'>('all');
  const [admissionStatusForm, setAdmissionStatusForm] = useState({ id: '', status: 'pending' });

const loadData = useCallback(async () => {
  setIsLoading(true);

  try {
    const [
      coursesRes,
      leadsRes,
      noticesRes,
      studentsRes,
      admissionsRes,
    ] = await Promise.all([
      supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false }),

      supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false }),

      supabase
        .from('notices')
        .select('*')
        .order('created_at', { ascending: false }),

      /*
       * IMPORTANT
       *
       * Registered website students are stored in
       * student_profiles, NOT students.
       */
      (supabase.from('student_profiles') as any)
        .select('*')
        .order('created_at', { ascending: false }),

      supabase
        .from('admissions')
        .select('*')
        .order('created_at', { ascending: false }),
    ]);

    /*
     * Check individual Supabase errors.
     */
    if (coursesRes.error) {
      console.error(
        'Courses error:',
        coursesRes.error
      );
    }

    if (leadsRes.error) {
      console.error(
        'Leads error:',
        leadsRes.error
      );
    }

    if (noticesRes.error) {
      console.error(
        'Notices error:',
        noticesRes.error
      );
    }

    if (studentsRes.error) {
      console.error(
        'Student profiles error:',
        studentsRes.error
      );

      throw studentsRes.error;
    }

    if (admissionsRes.error) {
      console.error(
        'Admissions error:',
        admissionsRes.error
      );
    }

    /*
     * Set normal dashboard data.
     */
    setCourses(coursesRes.data || []);
    setLeads(leadsRes.data || []);
    setNotices(noticesRes.data || []);

    /*
     * IMPORTANT
     *
     * student_profiles contains:
     *
     * id
     * user_id
     * full_name
     * email
     * phone
     * course
     * class_grade
     * enrollment_number
     * subjects
     * address
     * is_approved
     * created_at
     * updated_at
     */
    setStudents(
      (studentsRes.data || []) as StudentProfile[]
    );

    setAdmissions(admissionsRes.data || []);
  } catch (error) {
    console.error(
      'Admin dashboard load error:',
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
}, [supabase, toast]);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push('/auth/login');
      return;
    }

    if (role && role !== 'admin') {
      router.push('/student/dashboard');
      return;
    }

    if (role === 'admin' && !hasLoadedRef.current) {
      hasLoadedRef.current = true;
      loadData();
    }
  }, [authLoading, user, role, router, loadData]);
const handleSubmitCourse = async (
  e: React.FormEvent
) => {
  e.preventDefault();

  if (!courseForm.title.trim()) {
    toast({
      title: 'Course Title Required',
      description: 'Please enter the course title.',
      variant: 'destructive',
    });
    return;
  }

  if (!courseForm.category) {
    toast({
      title: 'Category Required',
      description: 'Please select a course category.',
      variant: 'destructive',
    });
    return;
  }

  setIsSubmitting(true);

  const slug = generateSlug(
    courseForm.title
  );

  try {
    const payload = {
      title: courseForm.title.trim(),

      description:
        courseForm.description.trim(),

      image_url:
        courseForm.image_url || '',

      slug,

      duration:
        courseForm.duration || 'Flexible',

      fee:
        courseForm.fee || '',

      featured:
        courseForm.featured,

      category:
        courseForm.category,
    };

    if (editingId) {
      const { error } = await (
        supabase.from('courses') as any
      )
        .update(payload)
        .eq('id', editingId);

      if (error) {
        throw error;
      }

      toast({
        title: 'Success',
        description: 'Course updated successfully.',
      });
    } else {
      const { error } = await (
        supabase.from('courses') as any
      ).insert([payload]);

      if (error) {
        throw error;
      }

      toast({
        title: 'Success',
        description: 'Course added successfully.',
      });
    }

    setCourseForm({
      title: '',
      description: '',
      image_url: '',
      duration: 'Flexible',
      fee: '',
      featured: false,
      category: '',
    });

    setEditingId(null);
    setEditingType(null);

    await loadData();
  } catch (error) {
    console.error(
      'Course save error:',
      error
    );

    toast({
      title: 'Error',
      description:
        error instanceof Error
          ? error.message
          : 'Failed to save course.',
      variant: 'destructive',
    });
  } finally {
    setIsSubmitting(false);
  }
};

  const handleSubmitNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingId) {
        const { error } = await (supabase.from('notices') as any).update({ title: noticeForm.title, content: noticeForm.content, priority: noticeForm.priority, is_active: noticeForm.is_active }).eq('id', editingId);
        if (error) throw error;
        toast({ title: 'Success', description: 'Notice updated' });
      } else {
        const { error } = await (supabase.from('notices') as any).insert([{ title: noticeForm.title, content: noticeForm.content, priority: noticeForm.priority, is_active: noticeForm.is_active }]);
        if (error) throw error;
        toast({ title: 'Success', description: 'Notice added' });
      }
      setNoticeForm({ title: '', content: '', priority: 'medium', is_active: true });
      setEditingId(null);
      setEditingType(null);
      loadData();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save notice', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };
const handleApproveStudent = async (studentId: string) => {
  setIsSubmitting(true);

  try {
const { error } = await (supabase.from('student_profiles') as any)
  .update({
    is_approved: true,
    updated_at: new Date().toISOString(),
  })
  .eq('id', studentId);

    if (error) throw error;

    toast({
      title: 'Student Approved',
      description: 'The student can now access quizzes and assessments.',
    });

    await loadData();
  } catch (error) {
    console.error(error);

    toast({
      title: 'Error',
      description: 'Failed to approve student.',
      variant: 'destructive',
    });
  } finally {
    setIsSubmitting(false);
  }
};
const handleDeleteStudent = async (
  studentId: string
) => {
  setIsSubmitting(true);

  try {
    /*
     * ---------------------------------------------------------
     * 1. Get current Supabase session
     * ---------------------------------------------------------
     */
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      console.error(
        'Session error:',
        sessionError
      );

      throw new Error(
        'Unable to get your login session. Please login again.'
      );
    }

    /*
     * ---------------------------------------------------------
     * 2. Make sure admin is logged in
     * ---------------------------------------------------------
     */
    if (!session?.access_token) {
      throw new Error(
        'Your session has expired. Please login again.'
      );
    }

    console.log(
      '[DELETE STUDENT] Sending authenticated request'
    );

    /*
     * ---------------------------------------------------------
     * 3. Send access token to API
     *
     * THIS WAS MISSING IN YOUR CURRENT CODE.
     * ---------------------------------------------------------
     */
    const response = await fetch(
      `/api/admin/students/${studentId}`,
      {
        method: 'DELETE',

        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    /*
     * ---------------------------------------------------------
     * 4. Read API response safely
     * ---------------------------------------------------------
     */
    const result = await response.json();

    console.log(
      '[DELETE STUDENT] API response:',
      result
    );

    /*
     * ---------------------------------------------------------
     * 5. Handle API errors
     * ---------------------------------------------------------
     */
    if (!response.ok) {
      throw new Error(
        result?.error ||
          'Failed to delete student.'
      );
    }

    /*
     * ---------------------------------------------------------
     * 6. Success
     * ---------------------------------------------------------
     */
    toast({
      title: 'Student Deleted',
      description:
        'Student profile and login account have been deleted successfully.',
    });

    /*
     * ---------------------------------------------------------
     * 7. Refresh student list
     * ---------------------------------------------------------
     */
    await loadData();

  } catch (error) {
    console.error(
      'Student delete error:',
      error
    );

    toast({
      title: 'Error',
      description:
        error instanceof Error
          ? error.message
          : 'Failed to delete student.',
      variant: 'destructive',
    });

  } finally {
    setIsSubmitting(false);
  }
};
const handleDynamicStudentSubmit = async (
  data: CompleteFormValue
) => {
  if (!editingId) {
    toast({
      title: 'Student Registration',
      description:
        'Students should register from the student signup page.',
      variant: 'destructive',
    });

    return;
  }

  setIsSubmitting(true);

  try {
    const payload = {
      full_name:
        data.full_name.trim(),

      email:
        data.email.trim().toLowerCase(),

      phone:
        data.phone.trim(),

      enrollment_number:
        data.enrollment_number.trim(),

      address:
        data.address.trim(),

      course:
        data.course.trim(),

      /*
       * Keep your existing class_grade
       * column for compatibility.
       *
       * For NIOS/Open Schooling, level
       * is stored here.
       */
      class_grade:
        data.level?.trim() || '',

      subjects:
        data.subjects || [],

      /*
       * Dynamic category
       */
      category:
        data.category,

      /*
       * Dynamic fields
       */
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

      updated_at:
        new Date().toISOString(),
    };

    const { error } = await (
      supabase.from(
        'student_profiles'
      ) as any
    )
      .update(payload)
      .eq('id', editingId);

    if (error) {
      throw error;
    }

    toast({
      title: 'Student Updated',
      description:
        'Student profile has been updated successfully.',
    });

    setStudentForm({
      full_name: '',
      email: '',
      enrollment_number: '',
      course: '',
      phone: '',
      class_grade: '',
      address: '',
      subjects: '',
    });

    setEditingId(null);
    setEditingType(null);

    await loadData();
  } catch (error) {
    console.error(
      'Student update error:',
      error
    );

    toast({
      title: 'Error',
      description:
        error instanceof Error
          ? error.message
          : 'Failed to update student.',
      variant: 'destructive',
    });
  } finally {
    setIsSubmitting(false);
  }
};
// ==================== ADMISSION CREATE / UPDATE ====================

const handleSubmitAdmission = async (
  e: React.FormEvent
) => {
  e.preventDefault();

  if (!admissionForm.student_name.trim()) {
    toast({
      title: 'Student Name Required',
      description: 'Please enter the student name.',
      variant: 'destructive',
    });
    return;
  }

  if (!admissionForm.email.trim()) {
    toast({
      title: 'Email Required',
      description: 'Please enter the student email.',
      variant: 'destructive',
    });
    return;
  }

  setIsSubmitting(true);

  try {
    const payload = {
      student_name:
        admissionForm.student_name.trim(),

      email:
        admissionForm.email.trim().toLowerCase(),

      phone:
        admissionForm.phone.trim(),

      date_of_birth:
        admissionForm.date_of_birth || null,

      parent_name:
        admissionForm.parent_name.trim(),

      parent_phone:
        admissionForm.parent_phone.trim(),

      address:
        admissionForm.address.trim(),

      office_address:
        admissionForm.office_address.trim(),

      office_phone_1:
        admissionForm.office_phone_1.trim(),

      office_phone_2:
        admissionForm.office_phone_2.trim(),

      class:
        admissionForm.class.trim(),

      previous_qualification:
        admissionForm.previous_qualification.trim(),

      course:
        admissionForm.course.trim(),

      subjects:
        admissionForm.subjects
          .map((subject) => subject.trim())
          .filter(Boolean),

      school_college:
        admissionForm.school_college.trim(),

      hobbies:
        admissionForm.hobbies.trim(),

      photo_url:
        admissionForm.photo_url || '',

      reference_number:
        admissionForm.reference_number.trim(),

      message:
        admissionForm.message.trim(),

      status:
        admissionForm.status,

      updated_at:
        new Date().toISOString(),
    };

    let error;

    // CREATE
    if (editingType === 'new-admission') {
      const response = await (
        supabase.from('admissions') as any
      ).insert([payload]);

      error = response.error;
    }

    // UPDATE
    else if (
      editingType === 'admission' &&
      editingId
    ) {
      const response = await (
        supabase.from('admissions') as any
      )
        .update(payload)
        .eq('id', editingId);

      error = response.error;
    }

    if (error) {
      throw error;
    }

    toast({
      title:
        editingType === 'new-admission'
          ? 'Admission Created'
          : 'Admission Updated',

      description:
        editingType === 'new-admission'
          ? 'New admission application has been added.'
          : 'Admission application has been updated successfully.',
    });

    setAdmissionForm(emptyAdmissionForm);

    setEditingId(null);
    setEditingType(null);

    await loadData();

  } catch (error) {
    console.error(
      'Admission save error:',
      error
    );

    toast({
      title: 'Error',
      description:
        error instanceof Error
          ? error.message
          : 'Failed to save admission.',
      variant: 'destructive',
    });

  } finally {
    setIsSubmitting(false);
  }
};
  const handleUpdateAdmissionStatus = async () => {
    setIsSubmitting(true);
    try {
      const { error } = await (supabase.from('admissions') as any).update({ status: admissionStatusForm.status }).eq('id', admissionStatusForm.id);
      if (error) throw error;
      toast({ title: 'Success', description: 'Admission status updated' });
      setAdmissionStatusForm({ id: '', status: 'pending' });
      loadData();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (item: any, type: string) => {
    setEditingId(item.id);
    setEditingType(type);
  if (type === 'course') {
  setCourseForm({
    title: item.title || '',
    description: item.description || '',
    image_url: item.image_url || '',
    duration: item.duration || 'Flexible',
    fee: item.fee || '',
    featured: item.featured || false,
    category:
      item.category || '',
  });
}else if (type === 'notice') {
      setNoticeForm({ title: item.title, content: item.content || '', priority: item.priority || 'medium', is_active: item.is_active !== false });
    } else if (type === 'student') {
  const subjectsString = Array.isArray(item.subjects)
    ? item.subjects.join(', ')
    : item.subjects || '';

  setStudentForm({
    full_name: item.full_name || '',
    email: item.email || '',
    enrollment_number: item.enrollment_number || '',
    course: item.course || '',
    phone: item.phone || '',
    class_grade: item.class_grade || '',
    address: item.address || '',
    subjects: subjectsString,
  });
}else if (type === 'admission') {
  const subjects = Array.isArray(item.subjects)
    ? item.subjects
    : [];

  setAdmissionForm({
    student_name:
      item.student_name || '',

    email:
      item.email || '',

    phone:
      item.phone || '',

    date_of_birth:
      item.date_of_birth || '',

    parent_name:
      item.parent_name || '',

    parent_phone:
      item.parent_phone || '',

    address:
      item.address || '',

    office_address:
      item.office_address || '',

    office_phone_1:
      item.office_phone_1 || '',

    office_phone_2:
      item.office_phone_2 || '',

    class:
      item.class || '',

    previous_qualification:
      item.previous_qualification || '',

    course:
      item.course || '',

    subjects: [
      subjects[0] || '',
      subjects[1] || '',
      subjects[2] || '',
      subjects[3] || '',
    ],

    school_college:
      item.school_college || '',

    hobbies:
      item.hobbies || '',

    photo_url:
      item.photo_url || '',

    reference_number:
      item.reference_number || '',

    message:
      item.message || '',

    status:
      item.status || 'pending',
  });

  setActiveTab('admissions');
}
  };
  const handleNewAdmission = () => {
  setAdmissionForm(emptyAdmissionForm);

  setEditingId(null);

  setEditingType('new-admission');

  setActiveTab('admissions');
};
const handleViewAdmission = (admission: any) => {
  setViewingAdmission(admission);
  setShowAdmissionView(true);
};
  const handleDelete = async () => {
    if (!deleteId || !deleteType) return;
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!session) {
        throw new Error(
          'You are not logged in. Please login again to delete items.'
        );
      }

      const { data, error, status, statusText } = await (supabase
        .from(deleteType) as any)
        .delete({ count: 'exact' })
        .eq('id', deleteId)
        .select();

      if (error) throw error;
      const deletedCount: number = Array.isArray(data) ? data.length : 0;
      if (deletedCount === 0) {
        console.warn(
          `[handleDelete] No row deleted for ${deleteType} id=${deleteId} status=${status} statusText=${statusText}`
        );
        throw new Error(
          'No row was deleted. The record may not exist or you may not have permission.'
        );
      }

      toast({
        title: 'Success',
        description: `${deletedCount} item deleted.`,
      });
      setDeleteId(null);
      setDeleteType(null);
      setShowDeleteDialog(false);
      await loadData();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to delete';
      console.error(`[handleDelete] ${deleteType} id=${deleteId}:`, error);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingType(null);
  setCourseForm({
  title: '',
  description: '',
  image_url: '',
  duration: 'Flexible',
  fee: '',
  featured: false,
  category: '',
});
    setNoticeForm({ title: '', content: '', priority: 'medium', is_active: true });
    setStudentForm({ full_name: '', email: '', enrollment_number: '', course: '', phone: '', class_grade: '', address: '', subjects: '' });
    setAdmissionForm(emptyAdmissionForm);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/auth/login');
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to logout', variant: 'destructive' });
    }
  };

  const confirmDelete = (id: string, type: string) => {
    setDeleteId(id);
    setDeleteType(type);
    setShowDeleteDialog(true);
  };

const filteredStudents = students.filter((student) => {
  const searchLower =
    studentSearchQuery.trim().toLowerCase();

  const studentName =
    student.full_name?.toLowerCase() || '';

  const studentEmail =
    student.email?.toLowerCase() || '';

  const enrollmentNumber =
    student.enrollment_number?.toLowerCase() || '';

  const matchesSearch =
    !searchLower ||
    studentName.includes(searchLower) ||
    studentEmail.includes(searchLower) ||
    enrollmentNumber.includes(searchLower);

  const matchesCourse =
    studentFilterCourse === 'all' ||
    student.course === studentFilterCourse;

  const matchesClass =
    studentFilterClass === 'all' ||
    student.class_grade === studentFilterClass;

  const matchesStatus =
    studentStatusFilter === 'all' ||
    (studentStatusFilter === 'approved'
      ? student.is_approved === true
      : student.is_approved === false);

  return (
    matchesSearch &&
    matchesCourse &&
    matchesClass &&
    matchesStatus
  );
});

const uniqueCourses = Array.from(
  new Set(
    students
      .map((student) => student.course)
      .filter(
        (course): course is string =>
          Boolean(course)
      )
  )
);

const uniqueClasses = Array.from(
  new Set(
    students
      .map((student) => student.class_grade)
      .filter(
        (classGrade): classGrade is string =>
          Boolean(classGrade)
      )
  )
);

const pendingStudents = students.filter(
  (student) => student.is_approved === false
);

const approvedStudents = students.filter(
  (student) => student.is_approved === true
);

if (authLoading || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-b from-yellow-50 to-blue-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user || role !== 'admin') return null;

  const inputClass = 'border-blue-100 focus:border-blue-400 focus:ring-blue-400';

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 via-white to-blue-50">
      <header className="border-b border-blue-100 bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-3 py-3 sm:px-4 sm:py-4 lg:px-8">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-blue-600">
                <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg font-bold text-gray-900 sm:text-xl lg:text-2xl truncate">Admin Dashboard</h1>
                <p className="text-xs text-gray-500 truncate">Starlight Academy</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <span className="hidden text-xs sm:text-sm text-gray-500 sm:inline truncate max-w-[120px] sm:max-w-none">{user.email}</span>
              <Button variant="outline" size="sm" onClick={handleLogout} className="gap-1 sm:gap-2 border-blue-200 text-blue-700 hover:bg-blue-50">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl min-w-0 px-3 py-6 sm:px-4 sm:py-8 lg:px-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="min-w-0 w-full">
          <TabsList className="mb-4 flex h-auto w-full justify-start gap-1.5 overflow-x-auto rounded-xl bg-blue-50 p-1.5 sm:mb-6">
            <TabsTrigger value="courses" className="shrink-0 gap-1.5 whitespace-nowrap px-2 py-1.5 text-xs data-[state=active]:bg-blue-600 data-[state=active]:text-white sm:px-3 sm:text-sm">
              <BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Courses <span className="ml-1 rounded-full bg-white/20 px-1.5 text-[10px] sm:text-xs">{courses.length}</span>
            </TabsTrigger>
            <TabsTrigger value="blogs" className="shrink-0 gap-1.5 whitespace-nowrap px-2 py-1.5 text-xs data-[state=active]:bg-blue-600 data-[state=active]:text-white sm:px-3 sm:text-sm">
              <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Blogs
            </TabsTrigger>
            <TabsTrigger value="notices" className="shrink-0 gap-1.5 whitespace-nowrap px-2 py-1.5 text-xs data-[state=active]:bg-blue-600 data-[state=active]:text-white sm:px-3 sm:text-sm">
              <Bell className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Notices <span className="ml-1 rounded-full bg-white/20 px-1.5 text-[10px] sm:text-xs">{notices.length}</span>
            </TabsTrigger>
            <TabsTrigger value="students" className="shrink-0 gap-1.5 whitespace-nowrap px-2 py-1.5 text-xs data-[state=active]:bg-blue-600 data-[state=active]:text-white sm:px-3 sm:text-sm">
              <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Students <span className="ml-1 rounded-full bg-white/20 px-1.5 text-[10px] sm:text-xs">{students.length}</span>
            </TabsTrigger>
            <TabsTrigger value="leads" className="shrink-0 gap-1.5 whitespace-nowrap px-2 py-1.5 text-xs data-[state=active]:bg-blue-600 data-[state=active]:text-white sm:px-3 sm:text-sm">
              <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Contact <span className="ml-1 rounded-full bg-white/20 px-1.5 text-[10px] sm:text-xs">{leads.length}</span>
            </TabsTrigger>
           
            <TabsTrigger
  value="gallery"
  className="shrink-0 gap-1.5 whitespace-nowrap px-2 py-1.5 text-xs data-[state=active]:bg-blue-600 data-[state=active]:text-white sm:px-3 sm:text-sm"
>
  <ImageIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
  Gallery
</TabsTrigger>
            <TabsTrigger value="quizzes" className="shrink-0 gap-1.5 whitespace-nowrap px-2 py-1.5 text-xs data-[state=active]:bg-blue-600 data-[state=active]:text-white sm:px-3 sm:text-sm">
              <HelpCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Quizzes
            </TabsTrigger>
            <TabsTrigger value="users" className="shrink-0 gap-1.5 whitespace-nowrap px-2 py-1.5 text-xs data-[state=active]:bg-blue-600 data-[state=active]:text-white sm:px-3 sm:text-sm">
              <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Users
            </TabsTrigger>
          </TabsList>

          {/* ==================== COURSES ==================== */}
          <TabsContent value="courses" className="space-y-6">
            <Card className="border-blue-100 shadow-sm">
              <CardHeader className="px-4 sm:px-6">
                <CardTitle className="text-blue-900">{editingType === 'course' ? 'Edit Course' : 'Add New Course'}</CardTitle>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                <form onSubmit={handleSubmitCourse} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="course-title">Course Title *</Label>
                    <Input id="course-title" value={courseForm.title} onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })} required placeholder="e.g., Web Development" className={inputClass} />
                  </div>
                  <div className="space-y-2">
  <Label htmlFor="course-category">
    Course Category *
  </Label>

  <Select
    value={courseForm.category}
    onValueChange={(value) =>
      setCourseForm({
        ...courseForm,
        category: value as StudentCategory,
      })
    }
  >
    <SelectTrigger
      id="course-category"
      className={inputClass}
    >
      <SelectValue placeholder="Select course category" />
    </SelectTrigger>

    <SelectContent>
      <SelectItem value="government_exams">
        Government Exams
      </SelectItem>

      <SelectItem value="nios">
        NIOS
      </SelectItem>

      <SelectItem value="open_schooling">
        Open Schooling
      </SelectItem>

      <SelectItem value="computer_courses">
        Computer Courses
      </SelectItem>
    </SelectContent>
  </Select>
</div>
                  <div className="space-y-2">
                    <Label htmlFor="course-desc">Description *</Label>
                    <Textarea id="course-desc" value={courseForm.description} onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })} required placeholder="Course description" rows={3} className={inputClass} />
                  </div>
                  <div className="space-y-2">
                    <Label>Course Image</Label>
                    <ImageUpload value={courseForm.image_url} onChange={(url) => setCourseForm({ ...courseForm, image_url: url || '' })} bucket="courses" folder="uploads" />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Duration</Label>
                      <Input value={courseForm.duration} onChange={(e) => setCourseForm({ ...courseForm, duration: e.target.value })} placeholder="e.g., 3 months, Flexible" className={inputClass} />
                    </div>
                    <div className="space-y-2">
                      <Label>Fee</Label>
                      <Input value={courseForm.fee} onChange={(e) => setCourseForm({ ...courseForm, fee: e.target.value })} placeholder="e.g., ₹5000, Contact Us" className={inputClass} />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="course-featured" 
                      checked={courseForm.featured} 
                      onChange={(e) => setCourseForm({ ...courseForm, featured: e.target.checked })} 
                      className="h-4 w-4 text-blue-600" 
                    />
                    <Label htmlFor="course-featured" className="mb-0 cursor-pointer">Featured Course</Label>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 text-white hover:bg-blue-700 sm:w-auto">
                      {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : editingType === 'course' ? 'Update Course' : 'Add Course'}
                    </Button>
                    {editingType === 'course' && <Button type="button" variant="outline" onClick={cancelEdit} className="w-full border-blue-200 text-blue-700 hover:bg-blue-50 sm:w-auto">Cancel</Button>}
                  </div>
                </form>
              </CardContent>
            </Card>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <Card key={course.id} className="border-blue-100 transition-all hover:shadow-md hover:shadow-blue-100/50 overflow-hidden">
                  {course.image_url ? (
                    <div className="relative h-40 w-full">
                      <Image src={course.image_url} alt={course.title} fill className="object-cover" />
                    </div>
                  ) : (
                    <div className="flex h-24 items-center justify-center bg-gradient-to-br from-yellow-50 to-blue-50">
                      <span className="text-4xl font-bold text-blue-200">{course.title.charAt(0)}</span>
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="line-clamp-2 text-lg">{course.title}</CardTitle>
                    <CardDescription className="line-clamp-3">{course.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(course, 'course')} className="border-yellow-200 text-yellow-700 hover:bg-yellow-50"><Edit2 className="h-4 w-4" /></Button>
                      <Button size="sm" variant="destructive" onClick={() => confirmDelete(course.id, 'courses')}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* ==================== BLOGS ==================== */}
          <TabsContent value="blogs" className="space-y-6">
            <BlogCMS />
          </TabsContent>

          {/* ==================== NOTICES ==================== */}
          <TabsContent value="notices" className="space-y-6">
            <Card className="border-blue-100 shadow-sm">
              <CardHeader className="px-4 sm:px-6">
                <CardTitle className="text-blue-900">{editingType === 'notice' ? 'Edit Notice' : 'Add New Notice'}</CardTitle>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                <form onSubmit={handleSubmitNotice} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="notice-title">Notice Title *</Label>
                    <Input id="notice-title" value={noticeForm.title} onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })} required placeholder="Notice title" className={inputClass} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notice-content">Content *</Label>
                    <Textarea id="notice-content" value={noticeForm.content} onChange={(e) => setNoticeForm({ ...noticeForm, content: e.target.value })} required placeholder="Notice content" rows={3} className={inputClass} />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Priority *</Label>
                      <Select value={noticeForm.priority} onValueChange={(v) => setNoticeForm({ ...noticeForm, priority: v })}>
                        <SelectTrigger className={inputClass}><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select value={noticeForm.is_active ? 'active' : 'inactive'} onValueChange={(v) => setNoticeForm({ ...noticeForm, is_active: v === 'active' })}>
                        <SelectTrigger className={inputClass}><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 text-white hover:bg-blue-700 sm:w-auto">
                      {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : editingType === 'notice' ? 'Update Notice' : 'Add Notice'}
                    </Button>
                    {editingType === 'notice' && <Button type="button" variant="outline" onClick={cancelEdit} className="w-full border-blue-200 text-blue-700 hover:bg-blue-50 sm:w-auto">Cancel</Button>}
                  </div>
                </form>
              </CardContent>
            </Card>
            <div className="space-y-4">
              {notices.map((notice) => (
                <Card key={notice.id} className="border-blue-100 transition-all hover:shadow-md hover:shadow-blue-100/50">
                  <CardHeader>
                    <div className="flex flex-col items-start justify-between gap-4 sm:flex-row">
                      <div className="min-w-0">
                        <CardTitle className="truncate">{notice.title}</CardTitle>
                        <CardDescription>
                          Priority: <span className={`font-semibold capitalize ${notice.priority === 'high' ? 'text-red-600' : notice.priority === 'medium' ? 'text-yellow-600' : 'text-blue-600'}`}>{notice.priority}</span>
                          {' | '}Status: <span className={notice.is_active ? 'text-green-600' : 'text-gray-400'}>{notice.is_active ? 'Active' : 'Inactive'}</span>
                        </CardDescription>
                      </div>
                      <div className="flex w-full shrink-0 gap-2 sm:w-auto">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(notice, 'notice')} className="border-yellow-200 text-yellow-700 hover:bg-yellow-50"><Edit2 className="h-4 w-4" /></Button>
                        <Button size="sm" variant="destructive" onClick={() => confirmDelete(notice.id, 'notices')}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent><p className="text-gray-600">{notice.content}</p></CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* ==================== STUDENTS ==================== */}
          <TabsContent value="students" className="space-y-6">
            <StudentsSection />
          </TabsContent>

          {/* ==================== CONTACT / LEADS ==================== */}
          <TabsContent value="leads" className="space-y-6">
            <Card className="border-blue-100 shadow-sm overflow-hidden">
              <CardHeader>
                <CardTitle className="text-blue-900">Contact Form Submissions</CardTitle>
                <CardDescription>Enquiries submitted through the Contact Us form</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="min-w-[680px] w-full border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-blue-100 bg-blue-50">
                        <th className="px-4 py-3 text-left font-semibold text-blue-900">Name</th>
                        <th className="px-4 py-3 text-left font-semibold text-blue-900">Phone</th>
                        <th className="hidden px-4 py-3 text-left font-semibold text-blue-900 md:table-cell">Email</th>
                        <th className="px-4 py-3 text-left font-semibold text-blue-900">Course</th>
                        <th className="hidden px-4 py-3 text-left font-semibold text-blue-900 lg:table-cell">Message</th>
                        <th className="px-4 py-3 text-left font-semibold text-blue-900">Date</th>
                        <th className="px-4 py-3 text-left font-semibold text-blue-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leads.map((lead) => (
                        <tr key={lead.id} className="border-b border-blue-50 hover:bg-yellow-50/30">
                          <td className="px-4 py-3 font-medium">{lead.name}</td>
                          <td className="px-4 py-3">{lead.phone}</td>
                          <td className="hidden px-4 py-3 text-gray-600 md:table-cell">{lead.email || '-'}</td>
                          <td className="px-4 py-3"><span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">{lead.course}</span></td>
                          <td className="hidden max-w-[200px] truncate px-4 py-3 text-gray-500 lg:table-cell">{lead.message || '-'}</td>
                          <td className="px-4 py-3 text-sm text-gray-400">{new Date(lead.created_at).toLocaleDateString()}</td>
                          <td className="px-4 py-3">
                            <Button size="sm" variant="destructive" onClick={() => confirmDelete(lead.id, 'leads')} className="h-8 w-8 p-0"><Trash2 className="h-3.5 w-3.5" /></Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {leads.length === 0 && <div className="py-12 text-center text-gray-400">No contact submissions yet.</div>}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
                      {/* ==================== GALLERY ==================== */}
<TabsContent value="gallery" className="space-y-6">
  <GallerySection />
</TabsContent>

          {/* ==================== QUIZZES ==================== */}
          <TabsContent value="quizzes" className="space-y-6">
            <QuizSection />
          </TabsContent>

          {/* ==================== USERS ==================== */}
          <TabsContent value="users" className="space-y-6">
            <UsersSection />
          </TabsContent>

        </Tabs>
      </main>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-md border-blue-100">
          <DialogHeader>
            <DialogTitle className="text-blue-900">Delete Item</DialogTitle>
            <DialogDescription>Are you sure you want to delete this item? This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} className="w-full border-blue-200 text-blue-700 hover:bg-blue-50 sm:w-auto">Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} className="w-full sm:w-auto">Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
