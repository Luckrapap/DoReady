-- Create tasks table
create table tasks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  description text,
  date date not null default current_date,
  is_completed boolean not null default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Turn on RLS
alter table tasks enable row level security;

-- Create policy to allow users to see only their own tasks
create policy "Users can view their own tasks" on tasks
  for select using (auth.uid() = user_id);

-- Create policy to allow users to insert their own tasks
create policy "Users can insert their own tasks" on tasks
  for insert with check (auth.uid() = user_id);

-- Create policy to allow users to update their own tasks
create policy "Users can update their own tasks" on tasks
  for update using (auth.uid() = user_id);

-- Create policy to allow users to delete their own tasks
create policy "Users can delete their own tasks" on tasks
  for delete using (auth.uid() = user_id);
