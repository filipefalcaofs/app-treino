-- GainLog: Schema completo com RLS

-- Perfis de usuario
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text,
  age integer,
  weight_kg numeric(5,1),
  height_cm integer,
  body_fat_pct numeric(4,1),
  goal text,
  avatar_url text,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Usuarios veem apenas seu perfil"
  on public.profiles for select using (auth.uid() = id);
create policy "Usuarios editam apenas seu perfil"
  on public.profiles for update using (auth.uid() = id);
create policy "Usuarios criam seu perfil"
  on public.profiles for insert with check (auth.uid() = id);

-- Trigger para criar perfil automaticamente ao registrar
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Treinos (biblioteca)
create table if not exists public.workouts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  muscle_group text not null default '',
  created_at timestamptz default now()
);

alter table public.workouts enable row level security;

create policy "CRUD proprio" on public.workouts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Exercicios de cada treino
create table if not exists public.workout_exercises (
  id uuid default gen_random_uuid() primary key,
  workout_id uuid references public.workouts on delete cascade not null,
  exercise_name text not null,
  sets_count integer not null default 3,
  reps_min integer not null default 8,
  reps_max integer not null default 12,
  sort_order integer not null default 0
);

alter table public.workout_exercises enable row level security;

create policy "CRUD via workout owner" on public.workout_exercises
  for all using (
    exists (select 1 from public.workouts where workouts.id = workout_exercises.workout_id and workouts.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.workouts where workouts.id = workout_exercises.workout_id and workouts.user_id = auth.uid())
  );

-- Ciclos de treino
create table if not exists public.cycles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  duration_weeks integer not null default 4,
  start_date date,
  is_active boolean default false,
  created_at timestamptz default now()
);

alter table public.cycles enable row level security;

create policy "CRUD proprio" on public.cycles
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Dias do ciclo (configuracao semanal)
create table if not exists public.cycle_days (
  id uuid default gen_random_uuid() primary key,
  cycle_id uuid references public.cycles on delete cascade not null,
  day_of_week integer not null check (day_of_week between 1 and 7),
  workout_id uuid references public.workouts on delete set null,
  is_running boolean default false,
  is_rest boolean default false
);

alter table public.cycle_days enable row level security;

create policy "CRUD via cycle owner" on public.cycle_days
  for all using (
    exists (select 1 from public.cycles where cycles.id = cycle_days.cycle_id and cycles.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.cycles where cycles.id = cycle_days.cycle_id and cycles.user_id = auth.uid())
  );

-- Sessoes de treino (registros reais)
create table if not exists public.training_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  cycle_id uuid references public.cycles on delete set null,
  date date not null default current_date,
  workout_id uuid references public.workouts on delete set null,
  completed_at timestamptz
);

alter table public.training_sessions enable row level security;

create policy "CRUD proprio" on public.training_sessions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Sets individuais de cada sessao
create table if not exists public.training_sets (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references public.training_sessions on delete cascade not null,
  exercise_name text not null,
  set_number integer not null,
  weight_kg numeric(5,1),
  reps integer,
  note text
);

alter table public.training_sets enable row level security;

create policy "CRUD via session owner" on public.training_sets
  for all using (
    exists (select 1 from public.training_sessions where training_sessions.id = training_sets.session_id and training_sessions.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.training_sessions where training_sessions.id = training_sets.session_id and training_sessions.user_id = auth.uid())
  );

-- Registros de corrida
create table if not exists public.running_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  date date not null default current_date,
  description text,
  distance_km numeric(6,2),
  total_time interval,
  avg_pace text,
  moving_time interval,
  elevation_m numeric(6,1),
  elevation_gain_m numeric(6,1),
  steps integer,
  heart_rate integer,
  surface text,
  intensity text check (intensity in ('leve', 'moderado', 'forte')),
  note text
);

alter table public.running_logs enable row level security;

create policy "CRUD proprio" on public.running_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Fotos de evolucao
create table if not exists public.progress_photos (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  photo_url text not null,
  weight_kg numeric(5,1),
  body_fat_pct numeric(4,1),
  taken_at date not null default current_date
);

alter table public.progress_photos enable row level security;

create policy "CRUD proprio" on public.progress_photos
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
