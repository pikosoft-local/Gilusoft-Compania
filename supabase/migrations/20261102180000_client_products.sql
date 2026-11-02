create table if not exists public.client_products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (user_id) on delete cascade,
  name text not null check (char_length(name) between 1 and 200),
  category text not null check (category in ('app', 'website', 'ai_integration')),
  description text not null default '' check (char_length(description) <= 2000),
  status text not null default 'planning' check (
    status in ('planning', 'in_progress', 'review', 'live', 'maintenance')
  ),
  url text not null default '',
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists client_products_user_lookup
  on public.client_products (user_id, updated_at desc);

alter table public.client_products enable row level security;
revoke all on public.client_products from public, anon, authenticated;
grant all on public.client_products to service_role;
