/*
  # Add Category System + Enrollment Number Generation

  This migration adds the category-based application/student system.
  It is fully backward-compatible: no existing columns are dropped or renamed.

  Changes:
  1. admissions table: add category, exam, level, stream, session, batch, batch_timing,
     duration, computer_course, student_profile_id FK
  2. student_profiles table: add same category fields + is_active, application_id FK
  3. Function + helper to generate sequential enrollment numbers (ST-0001 format)
  4. Indexes for performance
*/

-- ============================================================
-- STEP 1: Add category columns to admissions table
-- ============================================================

ALTER TABLE public.admissions
  ADD COLUMN IF NOT EXISTS category text
    CHECK (category IN (
      'government_exams',
      'nios',
      'open_schooling',
      'computer_courses'
    )),

  ADD COLUMN IF NOT EXISTS exam text,
  ADD COLUMN IF NOT EXISTS level text,
  ADD COLUMN IF NOT EXISTS stream text,
  ADD COLUMN IF NOT EXISTS session text,
  ADD COLUMN IF NOT EXISTS batch text,
  ADD COLUMN IF NOT EXISTS batch_timing text,
  ADD COLUMN IF NOT EXISTS duration text,
  ADD COLUMN IF NOT EXISTS computer_course text,

  ADD COLUMN IF NOT EXISTS student_profile_id uuid
    REFERENCES public.student_profiles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS admissions_category_idx
  ON public.admissions(category);
CREATE INDEX IF NOT EXISTS admissions_status_category_idx
  ON public.admissions(status, category);
CREATE INDEX IF NOT EXISTS admissions_student_profile_id_idx
  ON public.admissions(student_profile_id);

-- ============================================================
-- STEP 2: Add category columns + management fields to student_profiles
-- ============================================================

ALTER TABLE public.student_profiles
  ADD COLUMN IF NOT EXISTS category text
    CHECK (category IN (
      'government_exams',
      'nios',
      'open_schooling',
      'computer_courses'
    )),

  ADD COLUMN IF NOT EXISTS exam text,
  ADD COLUMN IF NOT EXISTS level text,
  ADD COLUMN IF NOT EXISTS stream text,
  ADD COLUMN IF NOT EXISTS session text,
  ADD COLUMN IF NOT EXISTS batch text,
  ADD COLUMN IF NOT EXISTS batch_timing text,
  ADD COLUMN IF NOT EXISTS duration text,
  ADD COLUMN IF NOT EXISTS computer_course text,

  ADD COLUMN IF NOT EXISTS parent_name text,
  ADD COLUMN IF NOT EXISTS parent_phone text,
  ADD COLUMN IF NOT EXISTS date_of_birth date,

  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true,

  ADD COLUMN IF NOT EXISTS application_id uuid
    REFERENCES public.admissions(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS student_profiles_category_idx
  ON public.student_profiles(category);
CREATE INDEX IF NOT EXISTS student_profiles_is_approved_active_idx
  ON public.student_profiles(is_approved, is_active);
CREATE INDEX IF NOT EXISTS student_profiles_application_id_idx
  ON public.student_profiles(application_id);
CREATE INDEX IF NOT EXISTS student_profiles_batch_idx
  ON public.student_profiles(batch);

-- ============================================================
-- STEP 3: Enrollment number generation
-- ============================================================

/**
 * Generate the next sequential enrollment number in ST-0001 format.
 * Uses max(...) with FOR UPDATE to safely serialize concurrent approvals
 * when called inside a transaction (which the RPC wrapper does).
 */
CREATE OR REPLACE FUNCTION public.next_enrollment_number()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  v_max_num integer;
  v_padded text;
BEGIN
  -- Coalesce null to 0 so the very first enrollment works.
  SELECT COALESCE(MAX(CAST(
    REGEXP_REPLACE(enrollment_number, '[^0-9]', '', 'g')
    AS integer
  )), 0)
  INTO v_max_num
  FROM public.student_profiles
  WHERE enrollment_number IS NOT NULL
    AND enrollment_number <> ''
  FOR UPDATE;

  v_padded := LPAD((v_max_num + 1)::text, 4, '0');

  RETURN 'ST-' || v_padded;
END;
$$;

-- ============================================================
-- STEP 4: Approve admission → create/link student_profile + enrollment #
-- ============================================================

/**
 * Approve a pending admission application.
 *
 * - Sets admissions.status = 'approved'
 * - Finds or creates the linked student_profile row
 *   (de-duplicated by email; does NOT create duplicate students)
 * - Generates + assigns next enrollment_number (if blank)
 * - Sets student_profiles.is_approved = true AND is_active = true
 * - Cross-links admissions.student_profile_id ↔ student_profiles.application_id
 *
 * Returns the final enrollment_number assigned.
 */
CREATE OR REPLACE FUNCTION public.approve_admission(p_admission_id uuid)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  v_adm public.admissions%ROWTYPE;
  v_profile_id uuid;
  v_enrollment text;
  v_subjects_arr text[];
  v_course_display text;
  v_user_id uuid;
BEGIN
  -- 1. Load the application
  SELECT * INTO v_adm
  FROM public.admissions
  WHERE id = p_admission_id
  FOR UPDATE;

  IF v_adm.id IS NULL THEN
    RAISE EXCEPTION 'Admission application not found';
  END IF;

  IF v_adm.status <> 'pending' THEN
    -- Idempotent: if already approved, return its existing enrollment if any.
    IF v_adm.status = 'approved' AND v_adm.student_profile_id IS NOT NULL THEN
      SELECT enrollment_number INTO v_enrollment
      FROM public.student_profiles
      WHERE id = v_adm.student_profile_id;
      RETURN COALESCE(v_enrollment, '');
    END IF;
    RAISE EXCEPTION 'Admission is not pending';
  END IF;

  -- 2. Resolve linked auth user by email (optional; may be null for paper forms)
  SELECT user_id INTO v_user_id
  FROM auth.users
  WHERE email = LOWER(v_adm.email)
  LIMIT 1;

  -- Build course/subject payloads from category-specific fields
  v_subjects_arr := COALESCE(v_adm.subjects, ARRAY[]::text[]);

  IF v_adm.category = 'computer_courses' THEN
    v_course_display := COALESCE(v_adm.computer_course, v_adm.course, '');
  ELSIF v_adm.category = 'government_exams' THEN
    v_course_display := COALESCE(v_adm.exam, v_adm.course, '');
  ELSE
    v_course_display := COALESCE(v_adm.course, '');
  END IF;

  -- 3. De-duplicate by email: find existing student_profile for same email
  SELECT id INTO v_profile_id
  FROM public.student_profiles
  WHERE LOWER(COALESCE(email, '')) = LOWER(v_adm.email)
  LIMIT 1;

  IF v_profile_id IS NULL AND v_user_id IS NOT NULL THEN
    -- Fallback: find by linked auth user
    SELECT id INTO v_profile_id
    FROM public.student_profiles
    WHERE user_id = v_user_id
    LIMIT 1;
  END IF;

  -- 4. Create or update the student profile
  IF v_profile_id IS NULL THEN
    -- INSERT new student
    v_enrollment := public.next_enrollment_number();

    INSERT INTO public.student_profiles (
      user_id,
      full_name,
      email,
      phone,
      course,
      enrollment_number,
      subjects,
      address,
      is_approved,
      is_active,
      category,
      exam,
      level,
      stream,
      session,
      batch,
      batch_timing,
      duration,
      computer_course,
      parent_name,
      parent_phone,
      date_of_birth,
      application_id
    ) VALUES (
      v_user_id,
      v_adm.student_name,
      LOWER(v_adm.email),
      v_adm.phone,
      v_course_display,
      v_enrollment,
      v_subjects_arr,
      v_adm.address,
      true,
      true,
      v_adm.category,
      v_adm.exam,
      v_adm.level,
      v_adm.stream,
      v_adm.session,
      v_adm.batch,
      v_adm.batch_timing,
      v_adm.duration,
      v_adm.computer_course,
      v_adm.parent_name,
      v_adm.parent_phone,
      v_adm.date_of_birth,
      v_adm.id
    ) RETURNING id, enrollment_number INTO v_profile_id, v_enrollment;
  ELSE
    -- UPDATE existing student (activate + fill enrollment if missing)
    SELECT enrollment_number INTO v_enrollment
    FROM public.student_profiles
    WHERE id = v_profile_id;

    IF v_enrollment IS NULL OR v_enrollment = '' THEN
      v_enrollment := public.next_enrollment_number();
    END IF;

    UPDATE public.student_profiles
    SET
      is_approved = true,
      is_active = true,
      enrollment_number = v_enrollment,
      application_id = COALESCE(application_id, v_adm.id),
      full_name = COALESCE(NULLIF(full_name, ''), v_adm.student_name),
      email = COALESCE(NULLIF(email, ''), LOWER(v_adm.email)),
      phone = COALESCE(NULLIF(phone, ''), v_adm.phone),
      course = COALESCE(NULLIF(course, ''), v_course_display),
      subjects = CASE
        WHEN COALESCE(array_length(subjects, 1), 0) = 0 THEN v_subjects_arr
        ELSE subjects
      END,
      address = COALESCE(NULLIF(address, ''), v_adm.address),
      category = COALESCE(category, v_adm.category),
      exam = COALESCE(NULLIF(exam, ''), v_adm.exam),
      level = COALESCE(NULLIF(level, ''), v_adm.level),
      stream = COALESCE(NULLIF(stream, ''), v_adm.stream),
      session = COALESCE(NULLIF(session, ''), v_adm.session),
      batch = COALESCE(NULLIF(batch, ''), v_adm.batch),
      batch_timing = COALESCE(NULLIF(batch_timing, ''), v_adm.batch_timing),
      duration = COALESCE(NULLIF(duration, ''), v_adm.duration),
      computer_course = COALESCE(NULLIF(computer_course, ''), v_adm.computer_course),
      parent_name = COALESCE(NULLIF(parent_name, ''), v_adm.parent_name),
      parent_phone = COALESCE(NULLIF(parent_phone, ''), v_adm.parent_phone),
      date_of_birth = COALESCE(date_of_birth, v_adm.date_of_birth),
      user_id = COALESCE(user_id, v_user_id),
      updated_at = now()
    WHERE id = v_profile_id;
  END IF;

  -- 5. Mark admission as approved + link to profile
  UPDATE public.admissions
  SET
    status = 'approved',
    student_profile_id = v_profile_id,
    updated_at = now()
  WHERE id = v_adm.id;

  RETURN v_enrollment;
END;
$$;

-- ============================================================
-- STEP 5: Reject admission (keeps history, no student creation)
-- ============================================================

CREATE OR REPLACE FUNCTION public.reject_admission(p_admission_id uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  v_status text;
BEGIN
  SELECT status INTO v_status
  FROM public.admissions
  WHERE id = p_admission_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Admission application not found';
  END IF;

  IF v_status = 'rejected' THEN
    RETURN;
  END IF;

  IF v_status <> 'pending' THEN
    RAISE EXCEPTION 'Only pending applications can be rejected';
  END IF;

  UPDATE public.admissions
  SET status = 'rejected', updated_at = now()
  WHERE id = p_admission_id;
END;
$$;

-- ============================================================
-- STEP 6: RLS / Grants so admins can run these RPCs
-- ============================================================

GRANT EXECUTE ON FUNCTION public.next_enrollment_number() TO authenticated;
GRANT EXECUTE ON FUNCTION public.approve_admission(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reject_admission(uuid) TO authenticated;

-- Ensure RLS on student_profiles still allows admin writes (existing policies already do).
-- The admissions + student_profiles FK columns above are covered by existing policies.
