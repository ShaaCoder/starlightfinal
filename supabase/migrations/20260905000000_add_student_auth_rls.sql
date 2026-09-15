-- ============================================================
-- Student Auth System: RLS Policies and Helpers
-- Tables: user_roles, student_profiles
-- ============================================================

-- ------------------------------------------------------------
-- 1. Ensure RLS is enabled on user_roles and student_profiles
-- ------------------------------------------------------------
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- 2. Policies for: user_roles
-- ------------------------------------------------------------

-- Drop existing if any (safe with IF EXISTS)
DROP POLICY IF EXISTS "user_roles_select_own" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_insert_own" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_update_own" ON public.user_roles;

-- Users can read their own role
CREATE POLICY "user_roles_select_own"
  ON public.user_roles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own role row (during signup)
CREATE POLICY "user_roles_insert_own"
  ON public.user_roles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own role row (usually never needed, but safe to allow)
CREATE POLICY "user_roles_update_own"
  ON public.user_roles
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ------------------------------------------------------------
-- 3. Policies for: student_profiles
-- ------------------------------------------------------------

DROP POLICY IF EXISTS "student_profiles_select_own" ON public.student_profiles;
DROP POLICY IF EXISTS "student_profiles_insert_own" ON public.student_profiles;
DROP POLICY IF EXISTS "student_profiles_update_own" ON public.student_profiles;

-- Students can read their own profile
CREATE POLICY "student_profiles_select_own"
  ON public.student_profiles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Students can insert their own profile (during signup)
CREATE POLICY "student_profiles_insert_own"
  ON public.student_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Students can update their own profile
CREATE POLICY "student_profiles_update_own"
  ON public.student_profiles
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ------------------------------------------------------------
-- 4. Policies for: quiz_attempts (students read/write their own)
-- ------------------------------------------------------------
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "quiz_attempts_select_own" ON public.quiz_attempts;
DROP POLICY IF EXISTS "quiz_attempts_insert_own" ON public.quiz_attempts;

CREATE POLICY "quiz_attempts_select_own"
  ON public.quiz_attempts
  FOR SELECT
  USING (auth.uid() = user_id OR student_email = auth.jwt() ->> 'email');

CREATE POLICY "quiz_attempts_insert_own"
  ON public.quiz_attempts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id OR student_email = auth.jwt() ->> 'email');

-- ------------------------------------------------------------
-- 5. Grant usage on public schema for authenticated users
-- ------------------------------------------------------------
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.user_roles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.student_profiles TO authenticated;
GRANT SELECT, INSERT ON TABLE public.quiz_attempts TO authenticated;
