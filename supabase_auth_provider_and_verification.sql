-- ==============================================================================
-- Supabase Migration: Auth Provider Separation & Email Verification
-- Description:
--   1. Adds `auth_provider` to track whether account was created via 'google' or 'credentials'.
--   2. Adds `is_verified` to track email confirmation status.
-- ==============================================================================

-- 1. Add columns to public.users
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS auth_provider TEXT NOT NULL DEFAULT 'credentials',
  ADD COLUMN IF NOT EXISTS is_verified BOOLEAN NOT NULL DEFAULT true;

-- 2. Mark existing Google users (users with no password or previous Google logins) as 'google'
UPDATE public.users
SET auth_provider = 'google'
WHERE (password IS NULL OR password = '') AND auth_provider = 'credentials';

-- 3. Ensure all existing accounts are marked as verified so current users are not locked out
UPDATE public.users
SET is_verified = true
WHERE is_verified IS NULL;
