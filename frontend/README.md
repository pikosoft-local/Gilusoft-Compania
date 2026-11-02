# Gilusoft

Responsywna strona studia cyfrowego z animacjami sterowanymi przewijaniem,
oddzielnymi podstronami i panelem klienta opartym na Supabase Auth.

## Uruchomienie

```powershell
Set-Location frontend
npm install
npm run dev
```

## Supabase: logowanie i panel klienta

1. Utwórz projekt w [Supabase](https://supabase.com/).
2. Skopiuj `frontend/.env.example` do `frontend/.env.local` i wpisz URL projektu oraz klucz
   **publishable** (ewentualnie starszy klucz `anon`):

   ```dotenv
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your-public-publishable-key
   VITE_API_URL=http://localhost:3000/api
   ```

   Klucz publishable jest przeznaczony do aplikacji przeglądarkowej. Nigdy nie
   dodawaj klucza `service_role` ani sekretnego klucza do zmiennych `VITE_*`.

3. Wykonaj migrację
   `../supabase/migrations/20261102100000_profiles.sql` w SQL Editorze projektu.
   Tworzy ona tabelę profili z polityką RLS i profil powiązany z nowym kontem.
4. W panelu Supabase włącz Email Auth i dodaj adres `http://localhost:5173/login`
   do dozwolonych URL-i przekierowania (oraz odpowiedni adres produkcyjny).
5. Zrestartuj serwer Vite po zmianie `.env.local`.

Rejestracja wymaga unikalnej nazwy użytkownika (3–24 małe litery, cyfry lub
podkreślenia). Jeśli w projekcie włączono potwierdzanie e-maila, użytkownik
musi potwierdzić adres przed pierwszym logowaniem.

## Backend NestJS i panel CMS

1. Wykonaj także migrację
   `../supabase/migrations/20261102140000_cms.sql`. Tworzy ona treści CMS,
   administratorów, przykładowe wpisy oraz publiczny bucket obrazów.
2. Zaloguj się do witryny i skopiuj swój UUID z `Authentication → Users`
   w Supabase. Przyznaj dostęp do panelu, wykonując w SQL Editorze:

   ```sql
   insert into public.cms_admins (user_id)
   values ('UUID_UŻYTKOWNIKA');
   ```

   Alternatywnie możesz ustawić listę zaufanych UUID w `CMS_ADMIN_USER_IDS`.
   Użytkownicy nie mogą sami nadać sobie roli administratora.
3. Skopiuj `backend/.env.example` do `backend/.env` i wpisz `SUPABASE_URL`,
   **sekretny** `SUPABASE_SERVICE_ROLE_KEY` oraz adres frontendowy. Klucz
   service-role może być używany wyłącznie przez backend; nigdy nie umieszczaj
   go w zmiennych `VITE_*` ani w kodzie przeglądarki.
4. W osobnych terminalach uruchom:

   ```powershell
   Set-Location backend
   npm install
   npm run start:dev
   ```

   ```powershell
   Set-Location frontend
   npm install
   npm run dev
   ```

5. Zaloguj się na konto administratora i otwórz `/admin`. Panel zarządza
   projektami, stronami, certyfikatami, wpisami bloga, zespołem, stronami
   informacyjnymi, tłumaczeniami i ustawieniami witryny. Można publikować szkice,
   ustawiać kolejność, przypisywać język i wgrywać obrazy.

Treści strony pozostają wbudowanym szablonem, dopóki backend nie jest
skonfigurowany; po konfiguracji publiczne kolekcje pobierają opublikowane wpisy
z Supabase. W kolekcji „Tłumaczenia” wybierz język, wczytaj teksty bazowe, edytuj
tylko potrzebne pola i opublikuj wpis. Obrazki strony można zarządzać w
„Ustawieniach witryny”: `hero-1`, `hero-2`, `hero-3`, `showcase-image` i
`process-image`; pole `imageUrl` wpisu przechowuje ich adres. Wpis `global`
ustawia m.in. e-mail kontaktowy.

Endpoint publicznej treści: `GET /api/content/:collection`. Panel korzysta z
`/api/admin/*` i wymaga tokenu Supabase oraz administratora z tabeli
`cms_admins`. `/api/health` sprawdza konfigurację i dostępność tabeli CMS.

## Ścieżki

- `/` — strona główna
- `/about` — o studiu
- `/projects` — realizacje
- `/websites` — strony internetowe
- `/certificates` — certyfikaty
- `/login` — logowanie i rejestracja
- `/panel/:username` — panel chroniony sesją Supabase
- `/team` i `/blog` — zespół i artykuły
- `/settings` — język i preferencje prywatności
- `/cookie-settings`, `/cookie-policy`, `/privacy-policy`, `/marketing-policy` — ustawienia i informacje prawne

Język strony można ustawić na polski, niemiecki, angielski lub francuski. Wybór
jest zapamiętywany lokalnie w przeglądarce. Poprzednie polskie ścieżki są
przekierowywane na odpowiedniki angielskie.

Zgoda jest zapisywana w niezbędnym pliku cookie `SameSite=Lax`. Sesję
uwierzytelniania przechowuje klient Supabase; nie jest ona używana do analityki.

## Animacje

Animacje wejścia i przejść oraz wartości powiązane z przewijaniem korzystają
z biblioteki Motion for React. Sekcja „filmowa” jest przypięta do widoku:
przewijanie steruje kolejnymi scenami i ich postępem. Przy włączonej redukcji
ruchu zastępuje ją statyczny opis.

## Kontrola jakości

```powershell
npm run build
npm run lint
```
