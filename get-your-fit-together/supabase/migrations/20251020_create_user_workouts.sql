-- Create RLS policies for user_workouts table
alter table public.user_workouts enable row level security;

create policy "Users can insert their own favorites"
  on public.user_workouts for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own favorites"
  on public.user_workouts for delete
  using (auth.uid() = user_id);

create policy "Users can view all favorites"
  on public.user_workouts for select
  using (true);