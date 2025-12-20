-- Add new columns to profiles table for units and exercise plan
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS height_unit text DEFAULT 'cm',
ADD COLUMN IF NOT EXISTS weight_unit text DEFAULT 'kg',
ADD COLUMN IF NOT EXISTS exercise_plan text DEFAULT NULL;

-- Create progress_tracking table
CREATE TABLE public.progress_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  photo_url TEXT,
  height NUMERIC,
  height_unit TEXT DEFAULT 'cm',
  weight NUMERIC,
  weight_unit TEXT DEFAULT 'kg',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.progress_tracking ENABLE ROW LEVEL SECURITY;

-- Users can view their own progress
CREATE POLICY "Users can view their own progress" 
ON public.progress_tracking 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can insert their own progress
CREATE POLICY "Users can insert their own progress" 
ON public.progress_tracking 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can update their own progress
CREATE POLICY "Users can update their own progress" 
ON public.progress_tracking 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Users can delete their own progress
CREATE POLICY "Users can delete their own progress" 
ON public.progress_tracking 
FOR DELETE 
USING (auth.uid() = user_id);

-- Admins can view all progress
CREATE POLICY "Admins can view all progress" 
ON public.progress_tracking 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_progress_tracking_updated_at
BEFORE UPDATE ON public.progress_tracking
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for progress photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('progress-photos', 'progress-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for progress photos
CREATE POLICY "Users can upload their own progress photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'progress-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own progress photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'progress-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own progress photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'progress-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admins can view all progress photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'progress-photos' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Public can view progress photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'progress-photos');