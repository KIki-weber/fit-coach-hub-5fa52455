-- Add phone_number to profiles table
ALTER TABLE public.profiles ADD COLUMN phone_number text;

-- Update RLS policies to allow phone_number access
-- (existing policies already cover this)