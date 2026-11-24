-- ============================================================================
-- ROW LEVEL SECURITY (RLS) FOR public.notification_chanels
-- ============================================================================

-- 1. Enable Row Level Security (RLS)
ALTER TABLE IF EXISTS public.notification_chanels ENABLE ROW LEVEL SECURITY;

-- 2. Policy: Anyone (authenticated users and public visitors) can READ notifications
DROP POLICY IF EXISTS "Public can view notifications" ON public.notification_chanels;
CREATE POLICY "Public can view notifications"
ON public.notification_chanels
FOR SELECT
TO public
USING (true);

-- 3. Policy: Only authenticated ADMINS can INSERT new notifications
DROP POLICY IF EXISTS "Admins can insert notifications" ON public.notification_chanels;
CREATE POLICY "Admins can insert notifications"
ON public.notification_chanels
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.admin
    WHERE admin.email = auth.jwt() ->> 'email'
    AND admin.is_active IS NOT FALSE
  )
);

-- 4. Policy: Only authenticated ADMINS can UPDATE notifications
DROP POLICY IF EXISTS "Admins can update notifications" ON public.notification_chanels;
CREATE POLICY "Admins can update notifications"
ON public.notification_chanels
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.admin
    WHERE admin.email = auth.jwt() ->> 'email'
    AND admin.is_active IS NOT FALSE
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.admin
    WHERE admin.email = auth.jwt() ->> 'email'
    AND admin.is_active IS NOT FALSE
  )
);

-- 5. Policy: Only authenticated ADMINS can DELETE notifications
DROP POLICY IF EXISTS "Admins can delete notifications" ON public.notification_chanels;
CREATE POLICY "Admins can delete notifications"
ON public.notification_chanels
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.admin
    WHERE admin.email = auth.jwt() ->> 'email'
    AND admin.is_active IS NOT FALSE
  )
);
