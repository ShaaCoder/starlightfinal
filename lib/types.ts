export type StudentCategory =
  | 'government_exams'
  | 'nios'
  | 'open_schooling'
  | 'computer_courses';

export const CATEGORY_LABELS: Record<StudentCategory, string> = {
  government_exams: 'Government Exams',
  nios: 'NIOS',
  open_schooling: 'Open Schooling',
  computer_courses: 'Computer Courses',
};

export const GOVERNMENT_EXAMS: string[] = [
  'SSC',
  'SSC CGL',
  'SSC CHSL',
  'Delhi Police',
  'Constable',
  'Head Constable',
  'MTS / GD',
  'CPO',
  'Banking',
  'CLAT',
  'NDA',
  'CUET',
  'CTET',
  'DSSSB',
  'PRT',
  'TGT',
  'PGT',
  'KVS',
  'NVS',
  'D.El.Ed',
  'B.Ed',
  'Class 11th',
  'Class 12th',
];

export const COMPUTER_COURSES: string[] = [
  'Basic Computer',
  'Advanced Computer',
  'Web Designing',
  'Python Programming',
  'AI Tools & Prompt Engineering',
  'Full Stack Web Development',
];

export const NIOS_LEVELS: string[] = ['10th', '12th'];
export const OPEN_SCHOOLING_LEVELS: string[] = ['10th', '11th', '12th'];
export const STREAMS: string[] = ['Science', 'Commerce', 'Arts', 'Humanities'];
export const SESSIONS: string[] = [
  'January - April 2026',
  'May - August 2026',
  'September - December 2026',
  '2025-2026',
  '2026-2027',
];
export const BATCHES: string[] = [
  'Morning',
  'Evening',
  'Weekend',
  'Weekday',
  'Regular',
  'Crash Course',
];
export const BATCH_TIMINGS: string[] = [
  '7:00 AM - 9:00 AM',
  '9:00 AM - 11:00 AM',
  '4:00 PM - 6:00 PM',
  '6:00 PM - 8:00 PM',
  'Sat-Sun 10:00 AM - 1:00 PM',
  'Custom',
];
export const COMPUTER_DURATIONS: string[] = [
  '3 Months',
  '6 Months',
  '12 Months',
  '18 Months',
  '24 Months',
  'Flexible',
];

export interface Course {
  id: string;
  title: string;
  slug?: string;
  description: string;
  image_url?: string;
  image?: string;
  duration?: string;
  fee?: string;
  price?: number;
  featured?: boolean;
  created_at: string;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  course: string;
  message: string | null;
  created_at: string;
}

export interface CourseFormData {
  title: string;
  description: string;
  image?: File;
}

export interface LeadFormData {
  name: string;
  phone: string;
  email?: string;
  course: string;
  message?: string;
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featured_image: string;
  image_alt: string;
  author: string;
  meta_title: string;
  meta_description: string;
  focus_keyword: string;
  canonical_url: string;
  og_image: string;
  reading_time: number;
  views: number;
  featured: boolean;
  published: boolean;
  created_at: string;
  updated_at: string;
  categories?: BlogCategory[];
  tags?: BlogTag[];
  faqs?: BlogFAQ[];
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  parent_id: string | null;
  created_at: string;
}

export interface BlogTag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface BlogFAQ {
  id: string;
  blog_id: string;
  question: string;
  answer: string;
  sort_order: number;
  created_at: string;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  enrollment_number: string;
  course: string | null;
  phone: string | null;
  class: string | null;
  reference_number: string | null;
  subjects: string | null;
  created_at: string;
  updated_at: string;
}

export interface StudentFormData {
  full_name: string;
  email: string;
  enrollment_number: string;
  course: string;
  phone: string;
  class_grade: string;
  address: string;
  subjects: string;
}

export type StudentProfile = {
  id: string;
  user_id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  course: string | null;
  class_grade: string | null;
  enrollment_number: string | null;
  subjects: string[];
  address: string | null;
  is_approved: boolean;
  is_active: boolean;
  category: StudentCategory | null;
  exam: string | null;
  level: string | null;
  stream: string | null;
  session: string | null;
  batch: string | null;
  batch_timing: string | null;
  duration: string | null;
  computer_course: string | null;
  parent_name: string | null;
  parent_phone: string | null;
  date_of_birth: string | null;
  application_id: string | null;
  created_at: string;
  updated_at: string;
};

export interface Admission {
  id: string;
  student_name: string;
  email: string;
  phone: string;
  course: string;
  class: string | null;
  subjects: string[] | null;
  reference_number: string | null;
  parent_name: string | null;
  parent_phone: string | null;
  address: string | null;
  status: 'pending' | 'approved' | 'rejected';
  message: string | null;
  category: StudentCategory | null;
  exam: string | null;
  level: string | null;
  stream: string | null;
  session: string | null;
  batch: string | null;
  batch_timing: string | null;
  duration: string | null;
  computer_course: string | null;
  date_of_birth: string | null;
  student_profile_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdmissionFormData {
  student_name: string;
  email: string;
  phone: string;
  course: string;
  class: string;
  subjects: string;
  reference_number: string;
  parent_name: string;
  parent_phone: string;
  address: string;
  message: string;
  category: StudentCategory | '';
  exam: string;
  level: string;
  stream: string;
  session: string;
  batch: string;
  batch_timing: string;
  duration: string;
  computer_course: string;
  date_of_birth: string;
}

export interface DynamicStudentFormData {
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





export interface QuizSubject {
  id: string;
  name: string;
  description: string;
  slug: string | null;
  created_at: string;
}

export interface Quiz {
  id: string;
  subject_id: string;
  title: string;
  description: string;
  duration_minutes: number;
  passing_score: number;
  is_active: boolean;
  slug: string | null;
  created_at: string;
  questions_count?: number;
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: 'a' | 'b' | 'c' | 'd';
  explanation: string;
  sort_order: number;
  created_at: string;
}

export interface QuizAttempt {
  id: string;
  quiz_id: string;
  user_id: string | null;
  student_name: string;
  student_email: string | null;
  score: number;
  total_questions: number;
  percentage: number;
  passed: boolean;
  time_taken_seconds: number | null;
  started_at: string;
  completed_at: string;
}

export interface LibraryPayment {
  id: string;
  amount: number;
  payment_date: string;
  payment_type: string;
  status: string;
}

export interface LibraryStudent {
  id: string;
  name: string;
  phone: string;
  membership_type: string;
  membership_start: string;
  membership_end: string;
}
