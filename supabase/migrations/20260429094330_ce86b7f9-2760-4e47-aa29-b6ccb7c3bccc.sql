
-- 1. Add language preference to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS language text DEFAULT 'en';

-- 2. Add image to events
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS image_url text;

-- 3. Storage bucket for event photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('event-photos', 'event-photos', true)
ON CONFLICT (id) DO NOTHING;

-- 4. Storage policies
DROP POLICY IF EXISTS "Event photos public read" ON storage.objects;
CREATE POLICY "Event photos public read"
ON storage.objects FOR SELECT
USING (bucket_id = 'event-photos');

DROP POLICY IF EXISTS "Admins upload event photos" ON storage.objects;
CREATE POLICY "Admins upload event photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'event-photos' AND public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins update event photos" ON storage.objects;
CREATE POLICY "Admins update event photos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'event-photos' AND public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins delete event photos" ON storage.objects;
CREATE POLICY "Admins delete event photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'event-photos' AND public.has_role(auth.uid(), 'admin'));
