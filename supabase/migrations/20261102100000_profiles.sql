create table if not exists public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique
    check (username ~ '^[a-z0-9_]{3,24}$'),
  display_name text not null default '',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can read their own profile"
  on public.profiles
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create or replace function public.create_profile_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  requested_username text := lower(new.raw_user_meta_data ->> 'username');
begin
  if requested_username is null
    or requested_username !~ '^[a-z0-9_]{3,24}$' then
    raise exception 'Username must be 3-24 characters (letters, numbers, underscores)';
  end if;

  insert into public.profiles (user_id, username, display_name)
  values (
    new.id,
    requested_username,
    coalesce(nullif(new.raw_user_meta_data ->> 'display_name', ''), requested_username)
  );

  return new;
end;
$$;

revoke all on function public.create_profile_for_new_user() from public, anon, authenticated;

create or replace trigger on_auth_user_created_create_profile
  after insert on auth.users
  for each row execute procedure public.create_profile_for_new_user();

do $$
declare
  existing_user record;
  base_username text;
  candidate_username text;
  suffix integer;
begin
  for existing_user in
    select u.id, u.email, u.raw_user_meta_data
    from auth.users u
    left join public.profiles p on p.user_id = u.id
    where p.user_id is null
    order by u.created_at, u.id
  loop
    base_username := lower(existing_user.raw_user_meta_data ->> 'username');

    if base_username is null or base_username !~ '^[a-z0-9_]{3,24}$' then
      base_username := regexp_replace(
        lower(split_part(coalesce(existing_user.email, ''), '@', 1)),
        '[^a-z0-9_]+',
        '_',
        'g'
      );
      base_username := trim(both '_' from base_username);

      if length(base_username) < 3 then
        base_username := 'user';
      end if;
    end if;

    base_username := left(base_username, 24);
    candidate_username := base_username;
    suffix := 0;

    while exists (
      select 1
      from public.profiles
      where username = candidate_username
    ) loop
      suffix := suffix + 1;
      candidate_username :=
        left(base_username, 23 - length(suffix::text)) || '_' || suffix::text;
    end loop;

    insert into public.profiles (user_id, username, display_name)
    values (
      existing_user.id,
      candidate_username,
      coalesce(
        nullif(existing_user.raw_user_meta_data ->> 'display_name', ''),
        candidate_username
      )
    )
    on conflict (user_id) do nothing;
  end loop;
end;
$$;

grant select on public.profiles to authenticated;
