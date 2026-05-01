
ALTER TABLE public.nutrition ADD COLUMN IF NOT EXISTS pdf_url TEXT;
ALTER TABLE public.schedules ADD COLUMN IF NOT EXISTS pdf_url TEXT;

INSERT INTO storage.buckets (id, name, public)
VALUES ('plan-pdfs', 'plan-pdfs', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Plan PDFs are publicly readable" ON storage.objects;
CREATE POLICY "Plan PDFs are publicly readable"
ON storage.objects FOR SELECT
USING (bucket_id = 'plan-pdfs');

DROP POLICY IF EXISTS "Admins can upload plan PDFs" ON storage.objects;
CREATE POLICY "Admins can upload plan PDFs"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'plan-pdfs' AND public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can update plan PDFs" ON storage.objects;
CREATE POLICY "Admins can update plan PDFs"
ON storage.objects FOR UPDATE
USING (bucket_id = 'plan-pdfs' AND public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can delete plan PDFs" ON storage.objects;
CREATE POLICY "Admins can delete plan PDFs"
ON storage.objects FOR DELETE
USING (bucket_id = 'plan-pdfs' AND public.has_role(auth.uid(), 'admin'::app_role));
