-- Create nutrition table for admin to upload nutrition plans
CREATE TABLE public.nutrition (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  protein NUMERIC,
  vitamins TEXT,
  calories NUMERIC,
  carbs NUMERIC,
  fats NUMERIC,
  notes TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.nutrition ENABLE ROW LEVEL SECURITY;

-- RLS Policies for nutrition
CREATE POLICY "Admins can view all nutrition plans"
ON public.nutrition
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can create nutrition plans"
ON public.nutrition
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update nutrition plans"
ON public.nutrition
FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete nutrition plans"
ON public.nutrition
FOR DELETE
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their own nutrition plans"
ON public.nutrition
FOR SELECT
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_nutrition_updated_at
BEFORE UPDATE ON public.nutrition
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Update messages table to support replies
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS reply_to UUID REFERENCES public.messages(id);

-- Add policy for users to send messages (replies to coach)
CREATE POLICY "Users can send messages to admins"
ON public.messages
FOR INSERT
WITH CHECK (auth.uid() = sent_by);