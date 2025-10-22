-- ==========================
-- Get Your Fit Together — Seed Data (fixed)
-- ==========================

-- ==========================
-- Profiles (1:1) — create AFTER auth user exists
-- ==========================
INSERT INTO public.profiles (id, full_name, avatar_url)
VALUES 
  ('ac4dc4fd-f0ef-479f-bfd4-ea28022e22a8', 'Zoe Pineda', 'https://i.pravatar.cc/150?img=12')
ON CONFLICT (id) DO NOTHING;

-- ==========================
-- Workouts (owned by Zoe)
-- ==========================
INSERT INTO public.workouts (id, owner, title, description, difficulty, is_public)
VALUES
  ('00000000-0000-0000-0000-000000000101', 'ac4dc4fd-f0ef-479f-bfd4-ea28022e22a8', 'Full Body Blast', 'A balanced full-body routine for strength and endurance.', 'Intermediate', true),
  ('00000000-0000-0000-0000-000000000102', 'ac4dc4fd-f0ef-479f-bfd4-ea28022e22a8', 'Core Crusher', 'An intense abs-focused workout.', 'Advanced', true),
  ('00000000-0000-0000-0000-000000000103', 'ac4dc4fd-f0ef-479f-bfd4-ea28022e22a8', 'Morning Stretch', 'A light morning mobility and stretch session.', 'Beginner', true)
ON CONFLICT (id) DO NOTHING;

-- ==========================
-- Exercises (1:N)
-- ==========================
INSERT INTO public.exercises (id, workout_id, name, sets, reps, notes)
VALUES
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000101', 'Push-ups', 3, '12-15', 'Keep core tight'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000101', 'Squats', 3, '15-20', 'Use proper depth'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000102', 'Plank', 3, '60s', 'Maintain straight line'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000102', 'Mountain Climbers', 3, '40', 'Fast pace'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000103', 'Neck Rotations', 2, '10', 'Gentle movements'),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000103', 'Hamstring Stretch', 2, '30s', 'Hold each side');

-- ==========================
-- Favorites (M:N)
-- ==========================
INSERT INTO public.favorites (id, user_id, workout_id)
VALUES
  (gen_random_uuid(), 'ac4dc4fd-f0ef-479f-bfd4-ea28022e22a8', '00000000-0000-0000-0000-000000000101'),
  (gen_random_uuid(), 'ac4dc4fd-f0ef-479f-bfd4-ea28022e22a8', '00000000-0000-0000-0000-000000000102');

-- ==========================
-- Tags (optional)
-- ==========================
INSERT INTO public.tags (id, name)
VALUES
  (gen_random_uuid(), 'Strength'),
  (gen_random_uuid(), 'Mobility'),
  (gen_random_uuid(), 'Core')
ON CONFLICT (name) DO NOTHING;

-- ==========================
-- Workout ↔ Tags (M:N)
-- ==========================
INSERT INTO public.workout_tags (workout_id, tag_id)
SELECT w.id, t.id
FROM public.workouts w
JOIN public.tags t ON 
  (w.title = 'Full Body Blast' AND t.name = 'Strength')
  OR (w.title = 'Core Crusher' AND t.name = 'Core')
  OR (w.title = 'Morning Stretch' AND t.name = 'Mobility');

-- ==========================
-- User ↔ Workouts (M:N user_workouts)
-- ==========================
INSERT INTO public.user_workouts (user_id, workout_id)
SELECT 'ac4dc4fd-f0ef-479f-bfd4-ea28022e22a8', id FROM public.workouts;

