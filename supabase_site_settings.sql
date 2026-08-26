-- ==============================================================================
-- Supabase Schema: site_settings Table
-- Description: Stores dynamic configuration for website footer, logos, and contacts
-- ==============================================================================

-- 1. Create table
CREATE TABLE IF NOT EXISTS public.site_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    logo_url TEXT NOT NULL DEFAULT '/image/LogoTamdan.png',
    footer_logo_url TEXT NOT NULL DEFAULT '/image/footerLogo.png',
    address TEXT NOT NULL DEFAULT 'Bridge 2, National Road 6A, Sangkat Prek Leap, Khan Chroy Changva, Phnom Penh',
    address_map_url TEXT NOT NULL DEFAULT 'https://maps.app.goo.gl/aKbjnkyvMnWQCgsT6',
    email TEXT NOT NULL DEFAULT 'tamdan.cadt@gmail.com',
    copyright TEXT NOT NULL DEFAULT '©2025 All Rights Reserved | Capstone 2, Group 7, Generation 9 of Cambodia Academy of Digital Technology',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Allow public read access (for anon & authenticated users)
CREATE POLICY "Allow public read site settings"
ON public.site_settings
FOR SELECT
TO public
USING (true);

-- 4. Policy: Allow service role / authenticated admins update access (optional)
CREATE POLICY "Allow authenticated update site settings"
ON public.site_settings
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- 5. Insert initial seed data if table is empty
INSERT INTO public.site_settings (
    logo_url,
    footer_logo_url,
    address,
    address_map_url,
    email,
    copyright
)
SELECT
    '/image/LogoTamdan.png',
    '/image/footerLogo.png',
    'Bridge 2, National Road 6A, Sangkat Prek Leap, Khan Chroy Changva, Phnom Penh',
    'https://maps.app.goo.gl/aKbjnkyvMnWQCgsT6',
    'tamdan.cadt@gmail.com',
    '©2025 All Rights Reserved | Capstone 2, Group 7, Generation 9 of Cambodia Academy of Digital Technology'
WHERE NOT EXISTS (
    SELECT 1 FROM public.site_settings
);
