-- ==============================================================================
-- Supabase Migration: Add topic_limit to users table
-- Description: Adds a per-user topic submission limit, controllable by admin
-- Run this in your Supabase SQL Editor
-- ==============================================================================

-- 1. Add topic_limit column with default of 5
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS topic_limit INTEGER NOT NULL DEFAULT 5;

-- 2. Add a check constraint so the limit must be at least 1
ALTER TABLE public.users
  DROP CONSTRAINT IF EXISTS users_topic_limit_check;

ALTER TABLE public.users
  ADD CONSTRAINT users_topic_limit_check CHECK (topic_limit >= 1);

-- 3. Backfill existing rows (already covered by DEFAULT 5, but explicit is safer)
UPDATE public.users
  SET topic_limit = 5
  WHERE topic_limit IS NULL;
