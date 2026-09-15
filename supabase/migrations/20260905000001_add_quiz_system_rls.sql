-- ============================================================
-- Quiz System: RLS Policies and Permissions
-- Tables: quiz_subjects, quizzes, quiz_questions
-- ============================================================

-- ------------------------------------------------------------
-- 1. Enable RLS on all quiz tables
-- ------------------------------------------------------------
ALTER TABLE public.quiz_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_answers ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- 2. Policies for quiz_subjects
--    Admin: full access (via role check if auth.uid has admin role)
--    Public/Authenticated read-only for active subject browsing
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "quiz_subjects_read_all" ON public.quiz_subjects;
DROP POLICY IF EXISTS "quiz_subjects_admin_write" ON public.quiz_subjects;

CREATE POLICY "quiz_subjects_read_all"
  ON public.quiz_subjects
  FOR SELECT
  USING (true);

CREATE POLICY "quiz_subjects_admin_write"
  ON public.quiz_subjects
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ------------------------------------------------------------
-- 3. Policies for quizzes
--    Admin: full CRUD
--    Public/Authenticated: read only if quiz.is_active = true
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "quizzes_read_active" ON public.quizzes;
DROP POLICY IF EXISTS "quizzes_admin_write" ON public.quizzes;

CREATE POLICY "quizzes_read_active"
  ON public.quizzes
  FOR SELECT
  USING (
    is_active = true
    OR
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "quizzes_admin_write"
  ON public.quizzes
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ------------------------------------------------------------
-- 4. Policies for quiz_questions
--    Admin: full CRUD
--    Public/Authenticated: read only if parent quiz is active
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "quiz_questions_read_active_quiz" ON public.quiz_questions;
DROP POLICY IF EXISTS "quiz_questions_admin_write" ON public.quiz_questions;

CREATE POLICY "quiz_questions_read_active_quiz"
  ON public.quiz_questions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.quizzes q
      WHERE q.id = quiz_id
        AND (q.is_active = true
          OR EXISTS (
              SELECT 1 FROM public.user_roles ur
              WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
            )
        )
    )
  );

CREATE POLICY "quiz_questions_admin_write"
  ON public.quiz_questions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ------------------------------------------------------------
-- 5. Policies for quiz_attempts (students see their own)
--    Admin: read all
--    Student/user: read/write their own attempts
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "quiz_attempts_own" ON public.quiz_attempts;
DROP POLICY IF EXISTS "quiz_attempts_admin_read" ON public.quiz_attempts;

CREATE POLICY "quiz_attempts_own"
  ON public.quiz_attempts
  FOR SELECT
  USING (
    auth.uid() = user_id
    OR student_email = (auth.jwt() ->> 'email')
  );

CREATE POLICY "quiz_attempts_admin_read"
  ON public.quiz_attempts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "quiz_attempts_insert_own" ON public.quiz_attempts;

CREATE POLICY "quiz_attempts_insert_own"
  ON public.quiz_attempts
  FOR INSERT
  WITH CHECK (
    (user_id IS NOT NULL AND auth.uid() = user_id)
    OR (student_email IS NOT NULL AND student_email = (auth.jwt() ->> 'email'))
  );

-- ------------------------------------------------------------
-- 6. Policies for quiz_answers (students see their own)
-- ------------------------------------------------------------
ALTER TABLE public.quiz_answers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "quiz_answers_own" ON public.quiz_answers;
DROP POLICY IF EXISTS "quiz_answers_admin_read" ON public.quiz_answers;

CREATE POLICY "quiz_answers_own"
  ON public.quiz_answers
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.quiz_attempts qa
      WHERE qa.id = attempt_id
        AND (qa.user_id = auth.uid()
          OR qa.student_email = (auth.jwt() ->> 'email'))
    )
  );

CREATE POLICY "quiz_answers_admin_read"
  ON public.quiz_answers
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "quiz_answers_insert_own" ON public.quiz_answers;

CREATE POLICY "quiz_answers_insert_own"
  ON public.quiz_answers
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.quiz_attempts qa
      WHERE qa.id = attempt_id
        AND (
          (qa.user_id IS NOT NULL AND auth.uid() = qa.user_id)
          OR
          (qa.student_email IS NOT NULL AND qa.student_email = (auth.jwt() ->> 'email'))
        )
    )
  );

-- ------------------------------------------------------------
-- 7. Grant permissions to authenticated and anon roles
-- ------------------------------------------------------------
GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.quiz_subjects TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.quizzes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.quiz_questions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.quiz_attempts TO authenticated, anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.quiz_answers TO authenticated, anon;

-- ------------------------------------------------------------
-- 8. Grants for USAGE on the sequence
-- ------------------------------------------------------------
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated, anon;
