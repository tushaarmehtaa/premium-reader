-- Premium Reader Database Schema
-- Run this in Supabase SQL editor

-- Users table (extends Supabase auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  plan text default 'free' check (plan in ('free', 'premium')),
  settings jsonb default '{"theme": "light", "fontSize": "medium", "defaultMode": "read", "emailDigest": "none"}'::jsonb,
  created_at timestamp with time zone default now()
);

-- Folders table (create before articles for foreign key)
create table if not exists public.folders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  created_at timestamp with time zone default now()
);

-- Articles table
create table if not exists public.articles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  url text not null,
  title text not null,
  author text,
  site_name text,
  content text not null,
  enhanced_content text,
  insights jsonb default '[]'::jsonb,
  saved_at timestamp with time zone default now(),
  read_at timestamp with time zone,
  folder_id uuid references public.folders(id) on delete set null,
  tags text[] default '{}'::text[]
);

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.articles enable row level security;
alter table public.folders enable row level security;

-- Drop existing policies if they exist (for clean re-run)
drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;
drop policy if exists "Users can view own articles" on public.articles;
drop policy if exists "Users can insert own articles" on public.articles;
drop policy if exists "Users can update own articles" on public.articles;
drop policy if exists "Users can delete own articles" on public.articles;
drop policy if exists "Users can manage own folders" on public.folders;

-- RLS Policies for profiles
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- RLS Policies for articles
create policy "Users can view own articles"
  on public.articles for select
  using (auth.uid() = user_id);

create policy "Users can insert own articles"
  on public.articles for insert
  with check (auth.uid() = user_id);

create policy "Users can update own articles"
  on public.articles for update
  using (auth.uid() = user_id);

create policy "Users can delete own articles"
  on public.articles for delete
  using (auth.uid() = user_id);

-- RLS Policies for folders
create policy "Users can manage own folders"
  on public.folders for all
  using (auth.uid() = user_id);

-- Create profile on signup (trigger function)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

-- Drop existing trigger if it exists
drop trigger if exists on_auth_user_created on auth.users;

-- Create trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Indexes for performance
create index if not exists articles_user_id_idx on public.articles(user_id);
create index if not exists articles_saved_at_idx on public.articles(saved_at desc);
create index if not exists articles_url_idx on public.articles(url);
create index if not exists articles_user_url_idx on public.articles(user_id, url);
create index if not exists folders_user_id_idx on public.folders(user_id);

-- Full text search index on articles
create index if not exists articles_title_content_idx on public.articles
  using gin(to_tsvector('english', title || ' ' || coalesce(content, '')));
