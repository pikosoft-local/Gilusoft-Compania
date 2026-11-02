create table if not exists public.cms_admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.cms_admins enable row level security;
revoke all on public.cms_admins from public, anon, authenticated;
grant all on public.cms_admins to service_role;

create table if not exists public.cms_entries (
  id uuid primary key default gen_random_uuid(),
  collection text not null check (
    collection in (
      'projects',
      'websites',
      'certificates',
      'blog',
      'team',
      'pages',
      'translations',
      'site'
    )
  ),
  slug text not null check (slug ~ '^[a-z0-9][a-z0-9_-]{0,119}$'),
  locale text not null default 'all' check (locale in ('all', 'pl', 'en', 'de', 'fr')),
  title text not null default '',
  summary text not null default '',
  image_url text not null default '',
  content jsonb not null default '{}'::jsonb check (jsonb_typeof(content) = 'object'),
  published boolean not null default false,
  sort_order integer not null default 0 check (sort_order >= 0),
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (collection, slug, locale)
);

create index if not exists cms_entries_public_lookup
  on public.cms_entries (collection, published, locale, sort_order);

alter table public.cms_entries enable row level security;
revoke all on public.cms_entries from public, anon, authenticated;
grant all on public.cms_entries to service_role;

insert into public.cms_entries (
  collection, slug, title, summary, image_url, content, published, sort_order
) values
  (
    'projects', 'web-applications', 'Aplikacje webowe',
    'Narzędzia, które usprawniają codzienną pracę.',
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=85',
    '{}', true, 1
  ),
  (
    'projects', 'websites', 'Strony internetowe',
    'Dopracowana obecność Twojej marki w sieci.',
    'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=900&q=85',
    '{}', true, 2
  ),
  (
    'projects', 'digital-products', 'Produkty cyfrowe',
    'Odważne pomysły przekute w dobre rozwiązania.',
    'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=900&q=85',
    '{}', true, 3
  ),
  (
    'projects', 'design-ux', 'Design i UX',
    'Proste doświadczenia, które lubią użytkownicy.',
    'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=900&q=85',
    '{}', true, 4
  ),
  (
    'websites', 'northline-architecture', 'Northline Architecture', 'Portfolio pracowni',
    'https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=1200&q=85',
    '{}', true, 1
  ),
  (
    'websites', 'morrow-objects', 'Morrow Objects', 'Sklep internetowy',
    'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=1200&q=85',
    '{}', true, 2
  ),
  (
    'websites', 'forma-studio', 'Forma Studio', 'Strona firmowa',
    'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=85',
    '{}', true, 3
  ),
  (
    'certificates', 'certificate-01', 'Nazwa certyfikatu', 'Organizacja / wystawca',
    '', '{"year":"ROK"}', true, 1
  ),
  (
    'certificates', 'certificate-02', 'Nazwa certyfikatu', 'Organizacja / wystawca',
    '', '{"year":"ROK"}', true, 2
  ),
  (
    'certificates', 'certificate-03', 'Nazwa certyfikatu', 'Organizacja / wystawca',
    '', '{"year":"ROK"}', true, 3
  ),
  (
    'site', 'global', 'Ustawienia strony', '',
    '', '{"contactEmail":"kontakt@gilusoft.pl"}', true, 0
  )
on conflict (collection, slug, locale) do nothing;

insert into public.cms_entries (
  collection, slug, title, summary, image_url, content, published, sort_order
) values
  (
    'blog', 'website-planning', 'Jak zaplanować dobrą stronę internetową',
    'Od celów biznesowych do struktury, która prowadzi użytkownika.',
    'https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=1200&q=85',
    '{"body":"Dodaj treść artykułu w panelu CMS.","status":"draft"}', false, 1
  ),
  (
    'blog', 'ux-starts-with-questions', 'Dlaczego projekt UX zaczyna się od pytań',
    'Poznaj potrzeby użytkowników, zanim zaczniesz wybierać kolory i komponenty.',
    'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=1200&q=85',
    '{"body":"Dodaj treść artykułu w panelu CMS.","status":"draft"}', false, 2
  ),
  (
    'blog', 'before-building-an-app', 'Co warto ustalić przed budową aplikacji',
    'Zakres, priorytety i dobry plan pomagają stworzyć właściwy produkt.',
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=85',
    '{"body":"Dodaj treść artykułu w panelu CMS.","status":"draft"}', false, 3
  ),
  (
    'team', 'product-strategy', 'Miejsce na członka zespołu', 'Strategia i produkt',
    '', '{"bio":"Uzupełnij dane zespołu przed publikacją."}', false, 1
  ),
  (
    'team', 'ux-ui-design', 'Miejsce na członka zespołu', 'Projektowanie UX/UI',
    '', '{"bio":"Uzupełnij dane zespołu przed publikacją."}', false, 2
  ),
  (
    'team', 'software-development', 'Miejsce na członka zespołu', 'Rozwój oprogramowania',
    '', '{"bio":"Uzupełnij dane zespołu przed publikacją."}', false, 3
  )
on conflict (collection, slug, locale) do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'cms-assets',
  'cms-assets',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can view CMS assets" on storage.objects;
create policy "Public can view CMS assets"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'cms-assets');
