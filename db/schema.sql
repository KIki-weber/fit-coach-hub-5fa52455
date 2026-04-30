-- VitalityHub — Full Postgres schema for VPS / self-host deploys
-- Apply once on a fresh Postgres database that has the Supabase auth schema
-- (i.e. self-hosted Supabase). Idempotent where possible.

-- ============== ENUMS ==============
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ============== SHARED TRIGGER FN ==============
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- ============== PROFILES ==============
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  email text,
  full_name text,
  phone_number text,
  age integer,
  gender text,
  height numeric,
  height_unit text DEFAULT 'cm',
  weight numeric,
  weight_unit text DEFAULT 'kg',
  exercise_plan text,
  language text DEFAULT 'en',
  photo_url text,
  photo_description text,
  photo_uploaded_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ============== USER ROLES ==============
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL DEFAULT 'user',
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- ============== HANDLE NEW USER (auth trigger) ==============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name, phone_number)
  VALUES (NEW.id, NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone_number', ''));
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============== BOOKINGS ==============
CREATE TABLE IF NOT EXISTS public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  service_type text NOT NULL,
  booking_date date NOT NULL,
  booking_time time NOT NULL,
  notes text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- ============== EVENTS ==============
CREATE TABLE IF NOT EXISTS public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  content text NOT NULL,
  event_date date,
  event_time time,
  image_url text,
  created_by uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- ============== MESSAGES ==============
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  sent_by uuid NOT NULL,
  subject text NOT NULL,
  content text NOT NULL,
  reply_to uuid,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- ============== NUTRITION ==============
CREATE TABLE IF NOT EXISTS public.nutrition (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  created_by uuid NOT NULL,
  title text NOT NULL,
  description text,
  calories numeric,
  protein numeric,
  carbs numeric,
  fats numeric,
  vitamins text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.nutrition ENABLE ROW LEVEL SECURITY;

-- ============== SCHEDULES ==============
CREATE TABLE IF NOT EXISTS public.schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  created_by uuid NOT NULL,
  title text NOT NULL,
  description text,
  date date NOT NULL,
  time time,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;

-- ============== PROGRESS TRACKING ==============
CREATE TABLE IF NOT EXISTS public.progress_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  height numeric,
  height_unit text DEFAULT 'cm',
  weight numeric,
  weight_unit text DEFAULT 'kg',
  photo_url text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.progress_tracking ENABLE ROW LEVEL SECURITY;

-- ============== RLS POLICIES ==============
-- profiles
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- user_roles
CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert roles" ON public.user_roles FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- bookings
CREATE POLICY "Users view own bookings" ON public.bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create own bookings" ON public.bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own bookings" ON public.bookings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own bookings" ON public.bookings FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins view all bookings" ON public.bookings FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update all bookings" ON public.bookings FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- events
CREATE POLICY "Everyone can view events" ON public.events FOR SELECT USING (true);
CREATE POLICY "Admins create events" ON public.events FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update events" ON public.events FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete events" ON public.events FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- messages
CREATE POLICY "Users view own messages" ON public.messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users send messages to admins" ON public.messages FOR INSERT WITH CHECK (auth.uid() = sent_by);
CREATE POLICY "Users update read status" ON public.messages FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins view all messages" ON public.messages FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins send messages" ON public.messages FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- nutrition
CREATE POLICY "Users view own nutrition" ON public.nutrition FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins view all nutrition" ON public.nutrition FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins create nutrition" ON public.nutrition FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update nutrition" ON public.nutrition FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete nutrition" ON public.nutrition FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- schedules
CREATE POLICY "Users view own schedules" ON public.schedules FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins view all schedules" ON public.schedules FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins create schedules" ON public.schedules FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update schedules" ON public.schedules FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete schedules" ON public.schedules FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- progress_tracking
CREATE POLICY "Users view own progress" ON public.progress_tracking FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own progress" ON public.progress_tracking FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own progress" ON public.progress_tracking FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own progress" ON public.progress_tracking FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins view all progress" ON public.progress_tracking FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- ============== STORAGE BUCKETS ==============
INSERT INTO storage.buckets (id, name, public) VALUES
  ('profile-photos', 'profile-photos', true),
  ('progress-photos', 'progress-photos', true),
  ('event-photos', 'event-photos', true)
ON CONFLICT (id) DO NOTHING;
