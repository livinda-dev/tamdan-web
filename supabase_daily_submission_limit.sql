-- ==============================================================================
-- Supabase Migration: Add Daily Topic Submission Limit
-- Description:
--   Limits users to a maximum of 3 topic submissions per day to prevent spam.
-- ==============================================================================

-- 1. Add tracking columns to public.users
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS daily_submission_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_submission_date DATE DEFAULT CURRENT_DATE;

-- 2. Backfill existing rows with defaults
UPDATE public.users
SET
  daily_submission_count = COALESCE(daily_submission_count, 0),
  last_submission_date = COALESCE(last_submission_date, CURRENT_DATE)
WHERE daily_submission_count IS NULL OR last_submission_date IS NULL;
