-- ============================================================================
-- TAMDAN USER QUESTIONS & ADMIN REPLIES SCHEMA
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_question (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    user_id BIGINT REFERENCES public.users(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer TEXT,
    answered_at TIMESTAMPTZ,
    answered_by TEXT,
    status TEXT DEFAULT 'pending' -- 'pending' | 'answered'
);

-- Ensure all columns exist if the table was previously created with minimal schema
ALTER TABLE public.user_question ADD COLUMN IF NOT EXISTS answer TEXT;
ALTER TABLE public.user_question ADD COLUMN IF NOT EXISTS answered_at TIMESTAMPTZ;
ALTER TABLE public.user_question ADD COLUMN IF NOT EXISTS answered_by TEXT;
ALTER TABLE public.user_question ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';

-- Index for fast user queries and admin status filtering
CREATE INDEX IF NOT EXISTS idx_user_question_user_id ON public.user_question(user_id);
CREATE INDEX IF NOT EXISTS idx_user_question_status ON public.user_question(status);
CREATE INDEX IF NOT EXISTS idx_user_question_created_at ON public.user_question(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.user_question ENABLE ROW LEVEL SECURITY;

-- 1. Users can read their own questions and replies
DROP POLICY IF EXISTS "Users can view their own questions" ON public.user_question;
CREATE POLICY "Users can view their own questions"
ON public.user_question FOR SELECT
TO authenticated
USING (
    user_id IN (
        SELECT id FROM public.users WHERE email = auth.jwt() ->> 'email'
    )
);

-- 2. Users can insert questions for themselves
DROP POLICY IF EXISTS "Users can insert their own questions" ON public.user_question;
CREATE POLICY "Users can insert their own questions"
ON public.user_question FOR INSERT
TO authenticated
WITH CHECK (
    user_id IN (
        SELECT id FROM public.users WHERE email = auth.jwt() ->> 'email'
    )
);

-- 3. Service role and administrators can view and update all questions
DROP POLICY IF EXISTS "Admins can view and update all questions" ON public.user_question;
CREATE POLICY "Admins can view and update all questions"
ON public.user_question FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.admin WHERE email = auth.jwt() ->> 'email' AND is_active = true
    )
);

-- Grant access to service_role and authenticated
GRANT ALL ON public.user_question TO service_role;
GRANT SELECT, INSERT ON public.user_question TO authenticated;
GRANT ALL ON SEQUENCE public.user_question_id_seq TO authenticated, service_role;
