/*
# Admin User Management

1. Create is_admin() helper function (SECURITY DEFINER) so RLS policies can check admin status.
2. Update user_roles RLS: admins can read/update/delete ALL user_roles, users can read their own.
3. Update student_profiles RLS: admins can read/update ALL student_profiles, users manage their own.
4. Grant necessary permissions.
*/

-- ============================================================
-- STEP 1: is_admin() helper function
-- ============================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role = 'admin'
  );
$$;

-- ============================================================
-- STEP 2: Update user_roles RLS policies
-- ============================================================

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_roles_select_own" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_insert_own" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_update_own" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_delete_own" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_admin_all" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_select_all" ON public.user_roles;

-- Users can read their own role; admins can read all roles
CREATE POLICY "user_roles_select_own_or_admin" ON public.user_roles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

-- Users can insert their own role row (for signup); admins can insert any
CREATE POLICY "user_roles_insert_own_or_admin" ON public.user_roles
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() OR public.is_admin());

-- Only admins can update roles
CREATE POLICY "user_roles_admin_update" ON public.user_roles
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Only admins can delete roles
CREATE POLICY "user_roles_admin_delete" ON public.user_roles
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- ============================================================
-- STEP 3: Update student_profiles RLS policies
-- ============================================================

ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "student_profiles_select_own" ON public.student_profiles;
DROP POLICY IF EXISTS "student_profiles_insert_own" ON public.student_profiles;
DROP POLICY IF EXISTS "student_profiles_update_own" ON public.student_profiles;
DROP POLICY IF EXISTS "student_profiles_admin_read" ON public.student_profiles;
DROP POLICY IF EXISTS "student_profiles_admin_update" ON public.student_profiles;

-- Users can read their own profile; admins can read all
CREATE POLICY "student_profiles_select_own_or_admin" ON public.student_profiles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

-- Users can insert their own profile; admins can insert any
CREATE POLICY "student_profiles_insert_own_or_admin" ON public.student_profiles
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() OR public.is_admin());

-- Users can update their own profile; admins can update all
CREATE POLICY "student_profiles_update_own_or_admin" ON public.student_profiles
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR public.is_admin())
  WITH CHECK (user_id = auth.uid() OR public.is_admin());

-- Only admins can delete profiles
CREATE POLICY "student_profiles_admin_delete" ON public.student_profiles
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- ============================================================
-- STEP 4: Grant permissions
-- ============================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.user_roles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.student_profiles TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
