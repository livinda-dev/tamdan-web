-- ==============================================================================
-- Supabase Migration: User & Admin Authentication Separation & RBAC Security
-- Description:
--   1. Ensures schema consistency for `public.admin` and `public.users`.
--   2. Enforces Role-Based Access Control (RBAC) and Row Level Security (RLS).
--   3. Prevents normal public users from reading/modifying administrative data.
--   4. Provides stored procedures to safely create/promote admin accounts.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Table Schema Integrity & Role Column Setup
-- ------------------------------------------------------------------------------

-- Ensure `role` and `is_active` exist on public.admin
ALTER TABLE IF EXISTS public.admin
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'admin',
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS phone_number TEXT;

-- Ensure `role` exists on public.users
ALTER TABLE IF EXISTS public.users
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user',
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

-- Ensure email uniqueness across tables for safe lookups
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'admin_email_unique'
  ) THEN
    ALTER TABLE public.admin ADD CONSTRAINT admin_email_unique UNIQUE (email);
  END IF;
EXCEPTION
  WHEN duplicate_table THEN NULL;
  WHEN others THEN NULL;
END $$;

-- ------------------------------------------------------------------------------
-- 2. Security Functions (is_admin helper)
-- ------------------------------------------------------------------------------

-- Function to check if the currently authenticated Supabase user is an active admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin
    WHERE LOWER(email) = LOWER(auth.jwt() ->> 'email')
      AND is_active = true
  );
$$;

-- Function to check if the currently authenticated Supabase user is a superadmin
CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin
    WHERE LOWER(email) = LOWER(auth.jwt() ->> 'email')
      AND LOWER(role) = 'superadmin'
      AND is_active = true
  );
$$;

-- Grant execute permissions to authenticated and service_role
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_superadmin() TO authenticated, service_role;

-- ------------------------------------------------------------------------------
-- 3. Row Level Security (RLS) on public.admin
-- ------------------------------------------------------------------------------

ALTER TABLE public.admin ENABLE ROW LEVEL SECURITY;

-- Drop existing overlapping policies if any
DROP POLICY IF EXISTS "Admins can view admin accounts" ON public.admin;
DROP POLICY IF EXISTS "Admins can insert admin accounts" ON public.admin;
DROP POLICY IF EXISTS "Admins can update admin accounts" ON public.admin;
DROP POLICY IF EXISTS "Superadmins can delete admin accounts" ON public.admin;
DROP POLICY IF EXISTS "Allow authenticated read admin" ON public.admin;
DROP POLICY IF EXISTS "Allow all for authenticated on admin" ON public.admin;

-- Only active admins can view admin table
CREATE POLICY "Admins can view admin accounts"
  ON public.admin
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Only active admins can create new admin records
CREATE POLICY "Admins can insert admin accounts"
  ON public.admin
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- Only active admins can update admin records
CREATE POLICY "Admins can update admin accounts"
  ON public.admin
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Only superadmins can delete admin records
CREATE POLICY "Superadmins can delete admin accounts"
  ON public.admin
  FOR DELETE
  TO authenticated
  USING (public.is_superadmin());

-- ------------------------------------------------------------------------------
-- 4. Row Level Security (RLS) on public.users
-- ------------------------------------------------------------------------------

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins full access to users" ON public.users;
DROP POLICY IF EXISTS "Users can read own record" ON public.users;
DROP POLICY IF EXISTS "Users can update own record" ON public.users;
DROP POLICY IF EXISTS "Allow public insert into users" ON public.users;

-- Admins have full access to view, edit, and delete regular app users
CREATE POLICY "Admins full access to users"
  ON public.users
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Regular users can view their own profile
CREATE POLICY "Users can read own record"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (LOWER(email) = LOWER(auth.jwt() ->> 'email'));

-- Regular users can update their own profile
CREATE POLICY "Users can update own record"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (LOWER(email) = LOWER(auth.jwt() ->> 'email'))
  WITH CHECK (LOWER(email) = LOWER(auth.jwt() ->> 'email'));

-- Allow public registration (for anon/public signups from web app)
CREATE POLICY "Allow public insert into users"
  ON public.users
  FOR INSERT
  TO public
  WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- 5. Helper Stored Procedure: Upsert Admin User
-- Example usage in SQL Editor:
--   SELECT public.upsert_admin_user('admin@example.com', 'SuperAdmin', 'superadmin', '+85512345678');
-- ------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.upsert_admin_user(
  p_email TEXT,
  p_username TEXT,
  p_role TEXT DEFAULT 'admin',
  p_phone TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.admin (email, username, role, phone_number, is_active, created_at)
  VALUES (LOWER(TRIM(p_email)), TRIM(p_username), LOWER(TRIM(p_role)), p_phone, true, NOW())
  ON CONFLICT (email)
  DO UPDATE SET
    username = EXCLUDED.username,
    role = EXCLUDED.role,
    phone_number = COALESCE(EXCLUDED.phone_number, public.admin.phone_number),
    is_active = true;
END;
$$;
