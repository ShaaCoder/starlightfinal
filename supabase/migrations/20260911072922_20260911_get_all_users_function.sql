/*
# Get All Users Function

1. New Functions
- `get_all_users()` — SECURITY DEFINER function that returns all users with their role, email (from auth.users), full name (from student_profiles or user_metadata), and approval status.
- This allows admin users to see names and emails for ALL users, including admins who don't have student_profiles rows.
2. Security
- SECURITY DEFINER so it can read from auth.users (which the anon/authenticated role cannot access directly).
- Checks is_admin() internally and returns empty array for non-admins.
- Grants EXECUTE to authenticated.
*/

CREATE OR REPLACE FUNCTION public.get_all_users()
RETURNS TABLE (
  user_id uuid,
  role text,
  email text,
  full_name text,
  is_approved boolean,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    ur.user_id,
    ur.role::text,
    COALESCE(sp.email, au.email) AS email,
    COALESCE(sp.full_name, au.raw_user_meta_data->>'full_name', au.raw_user_meta_data->>'name', '') AS full_name,
    COALESCE(sp.is_approved, ur.role = 'admin') AS is_approved,
    ur.created_at
  FROM public.user_roles ur
  LEFT JOIN public.student_profiles sp ON sp.user_id = ur.user_id
  LEFT JOIN auth.users au ON au.id = ur.user_id
  ORDER BY ur.created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_all_users() TO authenticated;
