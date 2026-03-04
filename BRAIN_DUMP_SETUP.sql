-- Create the brain_dump table
CREATE TABLE public.brain_dump (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.brain_dump ENABLE ROW LEVEL SECURITY;

-- Create policy for users to see only their own ideas
CREATE POLICY "Users can view their own brain dumps" 
ON public.brain_dump 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create policy for users to insert their own ideas
CREATE POLICY "Users can insert their own brain dumps" 
ON public.brain_dump 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create policy for users to delete their own ideas
CREATE POLICY "Users can delete their own brain dumps" 
ON public.brain_dump 
FOR DELETE 
USING (auth.uid() = user_id);
