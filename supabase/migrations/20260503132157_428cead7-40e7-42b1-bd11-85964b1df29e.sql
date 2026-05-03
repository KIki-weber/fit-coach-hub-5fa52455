
ALTER TABLE public.nutrition ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE public.schedules ADD COLUMN IF NOT EXISTS image_url text;
