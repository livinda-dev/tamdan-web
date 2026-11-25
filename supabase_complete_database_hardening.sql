-- ============================================================================
-- TAMDAN COMPLETE DATABASE HARDENING & DATA DELETION PREVENTION
-- ============================================================================
-- This script ensures ALL tables have Row Level Security (RLS) enabled.
-- It strictly forbids unauthorized users from deleting or altering database records
-- even if an attacker has your public Supabase URL and anon key.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. SECURE TOPICS TABLE (User News Interests)
-- ----------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.topics ENABLE ROW LEVEL SECURITY;

-- Allow users to view only their own topics
DROP POLICY IF EXISTS "Users can view own topics" ON public.topics;
CREATE POLICY "Users can view own topics"
ON public.topics FOR SELECT
TO authenticated
USING (
  user_id IN (SELECT id FROM public.users WHERE email = auth.jwt() ->> 'email')
  OR EXISTS (SELECT 1 FROM public.admin WHERE admin.email = auth.jwt() ->> 'email' AND admin.is_active IS NOT FALSE)
);

-- Allow users to insert/update only their own topics
DROP POLICY IF EXISTS "Users can insert own topics" ON public.topics;
CREATE POLICY "Users can insert own topics"
ON public.topics FOR INSERT
TO authenticated
WITH CHECK (
  user_id IN (SELECT id FROM public.users WHERE email = auth.jwt() ->> 'email')
);

DROP POLICY IF EXISTS "Users can update own topics" ON public.topics;
CREATE POLICY "Users can update own topics"
ON public.topics FOR UPDATE
TO authenticated
USING (
  user_id IN (SELECT id FROM public.users WHERE email = auth.jwt() ->> 'email')
)
WITH CHECK (
  user_id IN (SELECT id FROM public.users WHERE email = auth.jwt() ->> 'email')
);

-- BLOCK all public/regular users from deleting topics. ONLY active admins can delete.
DROP POLICY IF EXISTS "Only admins can delete topics" ON public.topics;
CREATE POLICY "Only admins can delete topics"
ON public.topics FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.admin
    WHERE admin.email = auth.jwt() ->> 'email'
    AND admin.is_active IS NOT FALSE
  )
);

-- ----------------------------------------------------------------------------
-- 2. SECURE NEWS_LETTERS TABLE (Historical editions and AI digests)
-- ----------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.news_letters ENABLE ROW LEVEL SECURITY;

-- Allow users to read news letters
DROP POLICY IF EXISTS "Anyone can read news letters" ON public.news_letters;
CREATE POLICY "Anyone can read news letters"
ON public.news_letters FOR SELECT
TO public
USING (true);

-- BLOCK any public or regular client from inserting, updating, or DELETING news.
-- Only backend service_role (bypasses RLS) and active admins can modify news.
DROP POLICY IF EXISTS "Only admins can delete news_letters" ON public.news_letters;
CREATE POLICY "Only admins can delete news_letters"
ON public.news_letters FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.admin
    WHERE admin.email = auth.jwt() ->> 'email'
    AND admin.is_active IS NOT FALSE
  )
);

-- ----------------------------------------------------------------------------
-- 3. SECURE TELEGRAM_TOKENS TABLE (Account linking security)
-- ----------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.telegram_tokens ENABLE ROW LEVEL SECURITY;

-- Deny all direct client-side deletions and modifications from anonymous users
DROP POLICY IF EXISTS "Block public deletion of telegram tokens" ON public.telegram_tokens;
CREATE POLICY "Block public deletion of telegram tokens"
ON public.telegram_tokens FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.admin
    WHERE admin.email = auth.jwt() ->> 'email'
    AND admin.is_active IS NOT FALSE
  )
);

-- ----------------------------------------------------------------------------
-- 4. ENSURE USERS TABLE CANNOT BE WIPED OUT
-- ----------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY;

-- Deny regular users from deleting records from the users table.
-- Only superadmins can delete user accounts.
DROP POLICY IF EXISTS "Only admins can delete users" ON public.users;
CREATE POLICY "Only admins can delete users"
ON public.users FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.admin
    WHERE admin.email = auth.jwt() ->> 'email'
    AND admin.is_active IS NOT FALSE
  )
);
