update public.cms_entries
set
  content = content || '{"href":"/app"}'::jsonb,
  updated_at = now()
where collection = 'projects'
  and slug = 'web-applications';

update public.cms_entries
set
  content = content || '{"href":"/websites"}'::jsonb,
  updated_at = now()
where collection = 'projects'
  and slug = 'websites';

update public.cms_entries
set
  slug = 'ai-implementation',
  title = 'Wdrażanie AI',
  summary = 'Wdrażamy AI, które automatyzuje pracę i wspiera rozwój firmy.',
  image_url = 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=85',
  content = content || '{"href":"/ai"}'::jsonb,
  sort_order = 3,
  updated_at = now()
where collection = 'projects'
  and slug = 'digital-products';

delete from public.cms_entries
where collection = 'projects'
  and slug = 'design-ux';

insert into public.cms_entries (
  collection, slug, title, summary, image_url, content, published, sort_order
) values
  (
    'pages',
    'app',
    'APLIKACJE, KTÓRE UŁATWIAJĄ ROZWÓJ',
    'Tworzymy aplikacje webowe i mobilne dopasowane do klientów oraz procesów Twojej firmy.',
    '',
    '{
      "sectionTitle":"APLIKACJE, KTÓRE UŁATWIAJĄ ROZWÓJ",
      "body":"Tworzymy aplikacje webowe i mobilne dopasowane do klientów oraz procesów Twojej firmy.",
      "features":[
        {"title":"Pomysł i plan","description":"Ustalamy cele produktu, potrzeby użytkowników i zakres pierwszej wersji."},
        {"title":"Projekt i development","description":"Budujemy bezpieczne, szybkie aplikacje, które działają na różnych urządzeniach."},
        {"title":"Rozwój i integracje","description":"Łączymy aplikację z narzędziami, z których korzysta Twoja firma."}
      ]
    }'::jsonb,
    true,
    10
  ),
  (
    'pages',
    'ai',
    'AI, KTÓRE PRACUJE DLA TWOJEJ FIRMY',
    'Wdrażamy praktyczne rozwiązania AI i automatyzacje dopasowane do codziennych zadań Twojego zespołu.',
    'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1800&q=85',
    '{
      "sectionTitle":"AI, KTÓRE PRACUJE DLA TWOJEJ FIRMY",
      "body":"Wdrażamy praktyczne rozwiązania AI i automatyzacje dopasowane do codziennych zadań Twojego zespołu.",
      "features":[
        {"title":"Analiza procesów","description":"Szukamy zadań, które można bezpiecznie usprawnić lub zautomatyzować."},
        {"title":"Integracje AI","description":"Łączymy modele AI z danymi i narzędziami używanymi w Twojej firmie."},
        {"title":"Wdrożenie i rozwój","description":"Testujemy rozwiązanie, wdrażamy je i pomagamy zespołowi z niego korzystać."}
      ]
    }'::jsonb,
    true,
    11
  )
on conflict (collection, slug, locale) do nothing;
