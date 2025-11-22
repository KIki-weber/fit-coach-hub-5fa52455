-- Create admin user account
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'hab@hab.com',
  crypt('kikihabesha', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Admin User"}',
  now(),
  now(),
  '',
  '',
  '',
  ''
);

-- Assign admin role to the admin user
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email = 'hab@hab.com';

-- Add photo description and timestamp fields to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS photo_description TEXT,
ADD COLUMN IF NOT EXISTS photo_uploaded_at TIMESTAMP WITH TIME ZONE;

-- Update storage policies to allow admins to view all profile photos
CREATE POLICY "Admins can view all profile photos"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'profile-photos' AND
  has_role(auth.uid(), 'admin'::app_role)
);

-- Update AdminUserList RLS to show all profile data including photos
CREATE POLICY "Admins can view all profile photos metadata"
ON public.profiles
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));