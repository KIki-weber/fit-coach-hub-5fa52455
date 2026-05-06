
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS progress_public boolean NOT NULL DEFAULT false;
ALTER TABLE public.progress_tracking ADD COLUMN IF NOT EXISTS previous_photo_url text;

CREATE OR REPLACE FUNCTION public.is_progress_public(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE((SELECT progress_public FROM public.profiles WHERE user_id = _user_id), false)
$$;

DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;
CREATE POLICY "Admins can update profiles"
ON public.profiles
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Public can view featured profiles" ON public.profiles;
CREATE POLICY "Public can view featured profiles"
ON public.profiles
FOR SELECT
USING (progress_public = true);

DROP POLICY IF EXISTS "Public can view featured progress" ON public.progress_tracking;
CREATE POLICY "Public can view featured progress"
ON public.progress_tracking
FOR SELECT
USING (public.is_progress_public(user_id));
