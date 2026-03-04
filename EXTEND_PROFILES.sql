-- Add gender and birth_date to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS gender TEXT,
ADD COLUMN IF NOT EXISTS birth_date DATE;

-- Update RLS if needed (usually already covered by user_id = auth.uid())
