/*
# Full Database Setup

This migration brings the database to the complete state expected by the application.
Only 3 early migrations were previously applied (basic courses, leads, blogs, notices).
This applies ALL remaining schema changes in dependency order:

1. Courses table: add slug, duration, fee, featured columns
2. Leads table: add status column
3. Students table: create with full fields + updated_at trigger
4. Admissions table: create with all fields including paper-form extensions
5. Production Blog System: categories, tags, blogs (rebuild), blog_categories, blog_tags, blog_faqs
6. Gallery table + gallery storage bucket
7. Student Auth tables: user_roles, student_profiles
8. Quiz System tables: quiz_subjects, quizzes, quiz_questions, quiz_attempts, quiz_answers
9. Storage buckets: images, courses, blogs, gallery
10. RLS policies on all tables (public read where needed, admin write, student self-access)
11. Indexes for performance
12. Triggers for auto-updating updated_at columns
*/

-- ============================================================
-- STEP 1: Add missing columns to courses table
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'slug') THEN
    ALTER TABLE courses ADD COLUMN slug text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'duration') THEN
    ALTER TABLE courses ADD COLUMN duration text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'fee') THEN
    ALTER TABLE courses ADD COLUMN fee text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'featured') THEN
    ALTER TABLE courses ADD COLUMN featured boolean DEFAULT false;
  END IF;
END $$;

-- Backfill slug for existing courses
UPDATE courses SET slug = lower(regexp_replace(regexp_replace(title, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g')) WHERE slug IS NULL;

CREATE INDEX IF NOT EXISTS courses_slug_idx ON courses(slug);

-- ============================================================
-- STEP 2: Add status column to leads table
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'status') THEN
    ALTER TABLE leads ADD COLUMN status text DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'converted', 'closed'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS leads_status_idx ON leads(status);
CREATE INDEX IF NOT EXISTS leads_created_at_idx ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS leads_course_idx ON leads(course);

-- ============================================================
-- STEP 3: Create updated_at trigger function (idempotent)
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- ============================================================
-- STEP 4: Create students table
-- ============================================================

CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  enrollment_number text UNIQUE NOT NULL DEFAULT '',
  course text DEFAULT '',
  phone text DEFAULT '',
  class text DEFAULT '',
  reference_number text DEFAULT '',
  subjects text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE students ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view students" ON students;
DROP POLICY IF EXISTS "Admins can insert students" ON students;
DROP POLICY IF EXISTS "Admins can update students" ON students;
DROP POLICY IF EXISTS "Admins can delete students" ON students;

CREATE POLICY "Admins can view students" ON students FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can insert students" ON students FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can update students" ON students FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can delete students" ON students FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL);

CREATE INDEX IF NOT EXISTS students_email_idx ON students(email);
CREATE INDEX IF NOT EXISTS students_enrollment_number_idx ON students(enrollment_number);
CREATE INDEX IF NOT EXISTS students_created_at_idx ON students(created_at DESC);
CREATE INDEX IF NOT EXISTS students_course_idx ON students(course);

DROP TRIGGER IF EXISTS update_students_updated_at ON students;
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- STEP 5: Create admissions table (with all fields)
-- ============================================================

CREATE TABLE IF NOT EXISTS admissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  course text NOT NULL,
  class text,
  subjects text,
  reference_number text,
  parent_name text,
  parent_phone text,
  address text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  message text,
  date_of_birth date,
  office_address text,
  office_phone_1 text,
  office_phone_2 text,
  previous_qualification text,
  school_college text,
  hobbies text,
  photo_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE admissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can submit admissions" ON admissions;
DROP POLICY IF EXISTS "Admins can view admissions" ON admissions;
DROP POLICY IF EXISTS "Admins can update admissions" ON admissions;
DROP POLICY IF EXISTS "Admins can delete admissions" ON admissions;

CREATE POLICY "Public can submit admissions" ON admissions FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins can view admissions" ON admissions FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can update admissions" ON admissions FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can delete admissions" ON admissions FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL);

CREATE INDEX IF NOT EXISTS admissions_email_idx ON admissions(email);
CREATE INDEX IF NOT EXISTS admissions_status_idx ON admissions(status);
CREATE INDEX IF NOT EXISTS admissions_created_at_idx ON admissions(created_at DESC);
CREATE INDEX IF NOT EXISTS admissions_course_idx ON admissions(course);
CREATE INDEX IF NOT EXISTS admissions_date_of_birth_idx ON admissions(date_of_birth);

DROP TRIGGER IF EXISTS update_admissions_updated_at ON admissions;
CREATE TRIGGER update_admissions_updated_at BEFORE UPDATE ON admissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- STEP 6: Production Blog System
-- ============================================================

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text DEFAULT '',
  parent_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Tags table
CREATE TABLE IF NOT EXISTS tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Drop old blogs table and recreate with full SEO fields
DROP TABLE IF EXISTS blogs CASCADE;

CREATE TABLE blogs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL DEFAULT '',
  content text DEFAULT '',
  excerpt text DEFAULT '',
  featured_image text DEFAULT '',
  image_alt text DEFAULT '',
  author text DEFAULT '',
  meta_title text DEFAULT '',
  meta_description text DEFAULT '',
  focus_keyword text DEFAULT '',
  canonical_url text DEFAULT '',
  og_image text DEFAULT '',
  reading_time integer DEFAULT 0,
  views integer DEFAULT 0,
  featured boolean DEFAULT false,
  published boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Blog-Categories junction table
CREATE TABLE IF NOT EXISTS blog_categories (
  blog_id uuid REFERENCES blogs(id) ON DELETE CASCADE,
  category_id uuid REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (blog_id, category_id)
);

-- Blog-Tags junction table
CREATE TABLE IF NOT EXISTS blog_tags (
  blog_id uuid REFERENCES blogs(id) ON DELETE CASCADE,
  tag_id uuid REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (blog_id, tag_id)
);

-- Blog FAQs table
CREATE TABLE IF NOT EXISTS blog_faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_id uuid REFERENCES blogs(id) ON DELETE CASCADE,
  question text NOT NULL,
  answer text DEFAULT '',
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all blog tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_faqs ENABLE ROW LEVEL SECURITY;

-- Categories policies
DROP POLICY IF EXISTS "Public can view categories" ON categories;
DROP POLICY IF EXISTS "Authenticated can manage categories" ON categories;
DROP POLICY IF EXISTS "Authenticated can update categories" ON categories;
DROP POLICY IF EXISTS "Authenticated can delete categories" ON categories;

CREATE POLICY "Public can view categories" ON categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Authenticated can manage categories" ON categories FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated can update categories" ON categories FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated can delete categories" ON categories FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL);

-- Tags policies
DROP POLICY IF EXISTS "Public can view tags" ON tags;
DROP POLICY IF EXISTS "Authenticated can manage tags" ON tags;
DROP POLICY IF EXISTS "Authenticated can update tags" ON tags;
DROP POLICY IF EXISTS "Authenticated can delete tags" ON tags;

CREATE POLICY "Public can view tags" ON tags FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Authenticated can manage tags" ON tags FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated can update tags" ON tags FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated can delete tags" ON tags FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL);

-- Blogs policies
DROP POLICY IF EXISTS "Public can view published blogs" ON blogs;
DROP POLICY IF EXISTS "Authenticated can view all blogs" ON blogs;
DROP POLICY IF EXISTS "Authenticated can create blogs" ON blogs;
DROP POLICY IF EXISTS "Authenticated can update blogs" ON blogs;
DROP POLICY IF EXISTS "Authenticated can delete blogs" ON blogs;
DROP POLICY IF EXISTS "Public can read blogs" ON blogs;
DROP POLICY IF EXISTS "Admins can insert blogs" ON blogs;
DROP POLICY IF EXISTS "Admins can update blogs" ON blogs;
DROP POLICY IF EXISTS "Admins can delete blogs" ON blogs;
DROP POLICY IF EXISTS "Public can view all blogs" ON blogs;

CREATE POLICY "Public can view published blogs" ON blogs FOR SELECT TO anon, authenticated USING (published = true OR auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated can create blogs" ON blogs FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated can update blogs" ON blogs FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated can delete blogs" ON blogs FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL);

-- Blog categories policies
DROP POLICY IF EXISTS "Public can view blog categories" ON blog_categories;
DROP POLICY IF EXISTS "Authenticated can manage blog categories" ON blog_categories;
DROP POLICY IF EXISTS "Authenticated can update blog categories" ON blog_categories;
DROP POLICY IF EXISTS "Authenticated can delete blog categories" ON blog_categories;

CREATE POLICY "Public can view blog categories" ON blog_categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Authenticated can manage blog categories" ON blog_categories FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated can update blog categories" ON blog_categories FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated can delete blog categories" ON blog_categories FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL);

-- Blog tags policies
DROP POLICY IF EXISTS "Public can view blog tags" ON blog_tags;
DROP POLICY IF EXISTS "Authenticated can manage blog tags" ON blog_tags;
DROP POLICY IF EXISTS "Authenticated can update blog tags" ON blog_tags;
DROP POLICY IF EXISTS "Authenticated can delete blog tags" ON blog_tags;

CREATE POLICY "Public can view blog tags" ON blog_tags FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Authenticated can manage blog tags" ON blog_tags FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated can update blog tags" ON blog_tags FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated can delete blog tags" ON blog_tags FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL);

-- Blog FAQs policies
DROP POLICY IF EXISTS "Public can view blog faqs" ON blog_faqs;
DROP POLICY IF EXISTS "Authenticated can manage blog faqs" ON blog_faqs;
DROP POLICY IF EXISTS "Authenticated can update blog faqs" ON blog_faqs;
DROP POLICY IF EXISTS "Authenticated can delete blog faqs" ON blog_faqs;

CREATE POLICY "Public can view blog faqs" ON blog_faqs FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Authenticated can manage blog faqs" ON blog_faqs FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated can update blog faqs" ON blog_faqs FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated can delete blog faqs" ON blog_faqs FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL);

-- Blog indexes
CREATE INDEX IF NOT EXISTS blogs_slug_idx ON blogs(slug);
CREATE INDEX IF NOT EXISTS blogs_published_idx ON blogs(published);
CREATE INDEX IF NOT EXISTS blogs_created_at_idx ON blogs(created_at DESC);
CREATE INDEX IF NOT EXISTS blogs_featured_idx ON blogs(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS blogs_author_idx ON blogs(author);
CREATE INDEX IF NOT EXISTS blogs_views_idx ON blogs(views DESC);
CREATE INDEX IF NOT EXISTS categories_slug_idx ON categories(slug);
CREATE INDEX IF NOT EXISTS categories_parent_id_idx ON categories(parent_id);
CREATE INDEX IF NOT EXISTS tags_slug_idx ON tags(slug);
CREATE INDEX IF NOT EXISTS blog_categories_blog_id_idx ON blog_categories(blog_id);
CREATE INDEX IF NOT EXISTS blog_categories_category_id_idx ON blog_categories(category_id);
CREATE INDEX IF NOT EXISTS blog_tags_blog_id_idx ON blog_tags(blog_id);
CREATE INDEX IF NOT EXISTS blog_tags_tag_id_idx ON blog_tags(tag_id);
CREATE INDEX IF NOT EXISTS blog_faqs_blog_id_idx ON blog_faqs(blog_id);

DROP TRIGGER IF EXISTS update_blogs_updated_at ON blogs;
CREATE TRIGGER update_blogs_updated_at BEFORE UPDATE ON blogs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- STEP 7: Fix courses RLS (public read, admin write)
-- ============================================================

DROP POLICY IF EXISTS "Authenticated users can view courses" ON courses;
DROP POLICY IF EXISTS "Authenticated users can create courses" ON courses;
DROP POLICY IF EXISTS "Authenticated users can update courses" ON courses;
DROP POLICY IF EXISTS "Authenticated users can delete courses" ON courses;
DROP POLICY IF EXISTS "Public can view courses" ON courses;
DROP POLICY IF EXISTS "Admins can insert courses" ON courses;
DROP POLICY IF EXISTS "Admins can update courses" ON courses;
DROP POLICY IF EXISTS "Admins can delete courses" ON courses;
DROP POLICY IF EXISTS "Public can view active notices" ON notices;

CREATE POLICY "Public can view courses" ON courses FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins can insert courses" ON courses FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can update courses" ON courses FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can delete courses" ON courses FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL);

-- ============================================================
-- STEP 8: Fix leads RLS (public insert, admin read)
-- ============================================================

DROP POLICY IF EXISTS "Anyone can submit leads" ON leads;
DROP POLICY IF EXISTS "Authenticated users can view leads" ON leads;
DROP POLICY IF EXISTS "Authenticated users can create leads" ON leads;
DROP POLICY IF EXISTS "Authenticated users can update leads" ON leads;
DROP POLICY IF EXISTS "Authenticated users can delete leads" ON leads;
DROP POLICY IF EXISTS "Public can submit leads" ON leads;
DROP POLICY IF EXISTS "Admins can view leads" ON leads;
DROP POLICY IF EXISTS "Admins can delete leads" ON leads;

CREATE POLICY "Public can submit leads" ON leads FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins can view leads" ON leads FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can update leads" ON leads FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can delete leads" ON leads FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL);

-- ============================================================
-- STEP 9: Fix notices RLS (public read active, admin full)
-- ============================================================

DROP POLICY IF EXISTS "Authenticated users can view notices" ON notices;
DROP POLICY IF EXISTS "Authenticated users can create notices" ON notices;
DROP POLICY IF EXISTS "Authenticated users can update notices" ON notices;
DROP POLICY IF EXISTS "Authenticated users can delete notices" ON notices;
DROP POLICY IF EXISTS "Public can read active notices" ON notices;
DROP POLICY IF EXISTS "Admins can read all notices" ON notices;
DROP POLICY IF EXISTS "Admins can insert notices" ON notices;
DROP POLICY IF EXISTS "Admins can update notices" ON notices;
DROP POLICY IF EXISTS "Admins can delete notices" ON notices;

CREATE POLICY "Public can read active notices" ON notices FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY "Admins can read all notices" ON notices FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can insert notices" ON notices FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can update notices" ON notices FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can delete notices" ON notices FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL);

CREATE INDEX IF NOT EXISTS notices_created_at_idx ON notices(created_at DESC);
CREATE INDEX IF NOT EXISTS notices_priority_idx ON notices(priority);
CREATE INDEX IF NOT EXISTS notices_is_active_idx ON notices(is_active);

DROP TRIGGER IF EXISTS update_notices_updated_at ON notices;
CREATE TRIGGER update_notices_updated_at BEFORE UPDATE ON notices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- STEP 10: Gallery table
-- ============================================================

CREATE TABLE IF NOT EXISTS public.gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_url VARCHAR(500) NOT NULL,
  image_path VARCHAR(500) NOT NULL,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "gallery_public_read_active" ON public.gallery;
DROP POLICY IF EXISTS "gallery_authenticated_insert" ON public.gallery;
DROP POLICY IF EXISTS "gallery_authenticated_update" ON public.gallery;
DROP POLICY IF EXISTS "gallery_authenticated_delete" ON public.gallery;

CREATE POLICY "gallery_public_read_active" ON public.gallery FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY "gallery_authenticated_insert" ON public.gallery FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "gallery_authenticated_update" ON public.gallery FOR UPDATE TO authenticated USING (auth.uid() = created_by) WITH CHECK (auth.uid() = created_by);
CREATE POLICY "gallery_authenticated_delete" ON public.gallery FOR DELETE TO authenticated USING (auth.uid() = created_by);

CREATE INDEX IF NOT EXISTS idx_gallery_sort_order ON public.gallery(sort_order ASC);
CREATE INDEX IF NOT EXISTS idx_gallery_is_active ON public.gallery(is_active);
CREATE INDEX IF NOT EXISTS idx_gallery_created_at ON public.gallery(created_at DESC);

-- ============================================================
-- STEP 11: Student Auth tables (user_roles, student_profiles)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'student' CHECK (role IN ('admin', 'student')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_roles_select_own" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_insert_own" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_update_own" ON public.user_roles;

CREATE POLICY "user_roles_select_own" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_roles_insert_own" ON public.user_roles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_roles_update_own" ON public.user_roles FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.student_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  email text,
  phone text,
  course text,
  class_grade text,
  enrollment_number text,
  subjects text[] DEFAULT '{}',
  address text,
  is_approved boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "student_profiles_select_own" ON public.student_profiles;
DROP POLICY IF EXISTS "student_profiles_insert_own" ON public.student_profiles;
DROP POLICY IF EXISTS "student_profiles_update_own" ON public.student_profiles;

CREATE POLICY "student_profiles_select_own" ON public.student_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "student_profiles_insert_own" ON public.student_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "student_profiles_update_own" ON public.student_profiles FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP TRIGGER IF EXISTS update_student_profiles_updated_at ON public.student_profiles;
CREATE TRIGGER update_student_profiles_updated_at BEFORE UPDATE ON public.student_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- STEP 12: Quiz System tables
-- ============================================================

CREATE TABLE IF NOT EXISTS public.quiz_subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  slug text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id uuid REFERENCES public.quiz_subjects(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  duration_minutes integer DEFAULT 30,
  passing_score integer DEFAULT 40,
  is_active boolean DEFAULT false,
  slug text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  option_a text DEFAULT '',
  option_b text DEFAULT '',
  option_c text DEFAULT '',
  option_d text DEFAULT '',
  correct_answer char(1) DEFAULT 'a' CHECK (correct_answer IN ('a', 'b', 'c', 'd')),
  explanation text DEFAULT '',
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid REFERENCES public.quizzes(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  student_name text DEFAULT '',
  student_email text,
  score integer DEFAULT 0,
  total_questions integer DEFAULT 0,
  percentage numeric DEFAULT 0,
  passed boolean DEFAULT false,
  time_taken_seconds integer,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

CREATE TABLE IF NOT EXISTS public.quiz_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id uuid REFERENCES public.quiz_attempts(id) ON DELETE CASCADE,
  question_id uuid REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
  selected_answer char(1) CHECK (selected_answer IN ('a', 'b', 'c', 'd')),
  is_correct boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all quiz tables
ALTER TABLE public.quiz_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_answers ENABLE ROW LEVEL SECURITY;

-- Quiz subjects policies
DROP POLICY IF EXISTS "quiz_subjects_read_all" ON public.quiz_subjects;
DROP POLICY IF EXISTS "quiz_subjects_admin_write" ON public.quiz_subjects;

CREATE POLICY "quiz_subjects_read_all" ON public.quiz_subjects FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "quiz_subjects_admin_write" ON public.quiz_subjects FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));
CREATE POLICY "quiz_subjects_admin_update" ON public.quiz_subjects FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')) WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));
CREATE POLICY "quiz_subjects_admin_delete" ON public.quiz_subjects FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- Quizzes policies
DROP POLICY IF EXISTS "quizzes_read_active" ON public.quizzes;
DROP POLICY IF EXISTS "quizzes_admin_write" ON public.quizzes;

CREATE POLICY "quizzes_read_active" ON public.quizzes FOR SELECT TO anon, authenticated USING (is_active = true OR EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));
CREATE POLICY "quizzes_admin_insert" ON public.quizzes FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));
CREATE POLICY "quizzes_admin_update" ON public.quizzes FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')) WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));
CREATE POLICY "quizzes_admin_delete" ON public.quizzes FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- Quiz questions policies
DROP POLICY IF EXISTS "quiz_questions_read_active_quiz" ON public.quiz_questions;
DROP POLICY IF EXISTS "quiz_questions_admin_write" ON public.quiz_questions;

CREATE POLICY "quiz_questions_read_active_quiz" ON public.quiz_questions FOR SELECT TO anon, authenticated USING (EXISTS (SELECT 1 FROM public.quizzes q WHERE q.id = quiz_id AND (q.is_active = true OR EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'))));
CREATE POLICY "quiz_questions_admin_insert" ON public.quiz_questions FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));
CREATE POLICY "quiz_questions_admin_update" ON public.quiz_questions FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')) WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));
CREATE POLICY "quiz_questions_admin_delete" ON public.quiz_questions FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- Quiz attempts policies
DROP POLICY IF EXISTS "quiz_attempts_own" ON public.quiz_attempts;
DROP POLICY IF EXISTS "quiz_attempts_admin_read" ON public.quiz_attempts;
DROP POLICY IF EXISTS "quiz_attempts_insert_own" ON public.quiz_attempts;

CREATE POLICY "quiz_attempts_own" ON public.quiz_attempts FOR SELECT TO authenticated USING (auth.uid() = user_id OR student_email = (auth.jwt() ->> 'email'));
CREATE POLICY "quiz_attempts_admin_read" ON public.quiz_attempts FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));
CREATE POLICY "quiz_attempts_insert_own" ON public.quiz_attempts FOR INSERT TO authenticated WITH CHECK ((user_id IS NOT NULL AND auth.uid() = user_id) OR (student_email IS NOT NULL AND student_email = (auth.jwt() ->> 'email')));

-- Quiz answers policies
DROP POLICY IF EXISTS "quiz_answers_own" ON public.quiz_answers;
DROP POLICY IF EXISTS "quiz_answers_admin_read" ON public.quiz_answers;
DROP POLICY IF EXISTS "quiz_answers_insert_own" ON public.quiz_answers;

CREATE POLICY "quiz_answers_own" ON public.quiz_answers FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.quiz_attempts qa WHERE qa.id = attempt_id AND (qa.user_id = auth.uid() OR qa.student_email = (auth.jwt() ->> 'email'))));
CREATE POLICY "quiz_answers_admin_read" ON public.quiz_answers FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));
CREATE POLICY "quiz_answers_insert_own" ON public.quiz_answers FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.quiz_attempts qa WHERE qa.id = attempt_id AND ((qa.user_id IS NOT NULL AND auth.uid() = qa.user_id) OR (qa.student_email IS NOT NULL AND qa.student_email = (auth.jwt() ->> 'email')))));

-- Quiz indexes
CREATE INDEX IF NOT EXISTS quiz_subjects_slug_idx ON public.quiz_subjects(slug);
CREATE INDEX IF NOT EXISTS quizzes_subject_id_idx ON public.quizzes(subject_id);
CREATE INDEX IF NOT EXISTS quizzes_is_active_idx ON public.quizzes(is_active);
CREATE INDEX IF NOT EXISTS quiz_questions_quiz_id_idx ON public.quiz_questions(quiz_id);
CREATE INDEX IF NOT EXISTS quiz_attempts_quiz_id_idx ON public.quiz_attempts(quiz_id);
CREATE INDEX IF NOT EXISTS quiz_attempts_user_id_idx ON public.quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS quiz_answers_attempt_id_idx ON public.quiz_answers(attempt_id);

-- ============================================================
-- STEP 13: Storage buckets
-- ============================================================

INSERT INTO storage.buckets (id, name, public) VALUES ('images', 'images', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('courses', 'courses', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('blogs', 'blogs', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('gallery', 'gallery', true) ON CONFLICT (id) DO NOTHING;

-- Images bucket policies
DROP POLICY IF EXISTS "Public read access for images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update images" ON storage.objects;

CREATE POLICY "Public read access for images" ON storage.objects FOR SELECT TO public USING (bucket_id = 'images');
CREATE POLICY "Authenticated users can upload images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'images');
CREATE POLICY "Authenticated users can delete images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'images');
CREATE POLICY "Authenticated users can update images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'images') WITH CHECK (bucket_id = 'images');

-- Courses bucket policies
DROP POLICY IF EXISTS "courses_public_read" ON storage.objects;
DROP POLICY IF EXISTS "courses_authenticated_upload" ON storage.objects;
DROP POLICY IF EXISTS "courses_authenticated_update" ON storage.objects;
DROP POLICY IF EXISTS "courses_authenticated_delete" ON storage.objects;

CREATE POLICY "courses_public_read" ON storage.objects FOR SELECT TO public USING (bucket_id = 'courses');
CREATE POLICY "courses_authenticated_upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'courses');
CREATE POLICY "courses_authenticated_update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'courses') WITH CHECK (bucket_id = 'courses');
CREATE POLICY "courses_authenticated_delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'courses');

-- Blogs bucket policies
DROP POLICY IF EXISTS "blogs_public_read" ON storage.objects;
DROP POLICY IF EXISTS "blogs_authenticated_upload" ON storage.objects;
DROP POLICY IF EXISTS "blogs_authenticated_update" ON storage.objects;
DROP POLICY IF EXISTS "blogs_authenticated_delete" ON storage.objects;

CREATE POLICY "blogs_public_read" ON storage.objects FOR SELECT TO public USING (bucket_id = 'blogs');
CREATE POLICY "blogs_authenticated_upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'blogs');
CREATE POLICY "blogs_authenticated_update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'blogs') WITH CHECK (bucket_id = 'blogs');
CREATE POLICY "blogs_authenticated_delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'blogs');

-- Gallery bucket policies
DROP POLICY IF EXISTS "gallery_public_read" ON storage.objects;
DROP POLICY IF EXISTS "gallery_authenticated_upload" ON storage.objects;
DROP POLICY IF EXISTS "gallery_authenticated_update" ON storage.objects;
DROP POLICY IF EXISTS "gallery_authenticated_delete" ON storage.objects;

CREATE POLICY "gallery_public_read" ON storage.objects FOR SELECT TO public USING (bucket_id = 'gallery');
CREATE POLICY "gallery_authenticated_upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'gallery');
CREATE POLICY "gallery_authenticated_update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'gallery') WITH CHECK (bucket_id = 'gallery');
CREATE POLICY "gallery_authenticated_delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'gallery');

-- ============================================================
-- STEP 14: Grant permissions
-- ============================================================

GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT SELECT ON TABLE public.courses TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.leads TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.students TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.admissions TO authenticated;
GRANT SELECT ON TABLE public.blogs TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.blogs TO authenticated;
GRANT SELECT ON TABLE public.categories TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.categories TO authenticated;
GRANT SELECT ON TABLE public.tags TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.tags TO authenticated;
GRANT SELECT ON TABLE public.blog_categories TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.blog_categories TO authenticated;
GRANT SELECT ON TABLE public.blog_tags TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.blog_tags TO authenticated;
GRANT SELECT ON TABLE public.blog_faqs TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.blog_faqs TO authenticated;
GRANT SELECT ON TABLE public.notices TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.notices TO authenticated;
GRANT SELECT ON TABLE public.gallery TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.gallery TO authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.user_roles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.student_profiles TO authenticated;
GRANT SELECT ON TABLE public.quiz_subjects TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.quiz_subjects TO authenticated;
GRANT SELECT ON TABLE public.quizzes TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.quizzes TO authenticated;
GRANT SELECT ON TABLE public.quiz_questions TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.quiz_questions TO authenticated;
GRANT SELECT, INSERT ON TABLE public.quiz_attempts TO authenticated, anon;
GRANT SELECT, INSERT ON TABLE public.quiz_answers TO authenticated, anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated, anon;
