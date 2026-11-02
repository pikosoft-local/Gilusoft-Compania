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
   Tworzy ona tabelę profili z polityką RLS i uzupełnia profile istniejących
   kont; nowe konta dostają profil automatycznie.
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
   Jeśli migracje CMS były już wcześniej zastosowane, uruchom również
   `../supabase/migrations/20261102173000_update_services.sql`, aby zmienić
   ofertę na aplikacje, strony WWW i wdrażanie AI.
2. Uruchom
   `../supabase/migrations/20261102180000_client_products.sql` po migracji
   profili. Tworzy ona prywatne rekordy produktów przypisywane do kont klientów.
3. Nie ma wspólnego ani domyślnego hasła administratora. Utwórz własne konto
   przez `/login` (adres e-mail i hasło są przechowywane przez Supabase Auth),
   a następnie potwierdź adres, jeśli projekt tego wymaga. W SQL Editorze
   Supabase nadaj temu kontu uprawnienia administratora:

   ```sql
   insert into public.cms_admins (user_id)
   select id
   from auth.users
   where email = 'TWOJ_ADRES_EMAIL'
   on conflict (user_id) do nothing;
   ```

   Zastąp `TWOJ_ADRES_EMAIL` adresem użytym przy rejestracji. Alternatywnie
   możesz ustawić listę zaufanych UUID w `CMS_ADMIN_USER_IDS`. Użytkownicy
   nie mogą sami nadać sobie roli administratora. Na `/admin` administrator
   loguje się nazwą użytkownika z profilu i hasłem; backend mapuje login na
   konto Supabase, więc formularz panelu nie wymaga adresu e-mail.
4. Skopiuj `backend/.env.example` do `backend/.env` i wpisz `SUPABASE_URL`,
   **sekretny** `SUPABASE_SERVICE_ROLE_KEY` oraz adres frontendowy. Klucz
   service-role może być używany wyłącznie przez backend; nigdy nie umieszczaj
   go w zmiennych `VITE_*` ani w kodzie przeglądarki.
5. W osobnych terminalach uruchom:

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

6. Zaloguj się na konto administratora i otwórz `/admin`. Panel zarządza
   projektami, stronami, certyfikatami, wpisami bloga, zespołem, stronami
   informacyjnymi, tłumaczeniami i ustawieniami witryny. Można publikować szkice,
   ustawiać kolejność, przypisywać język i wgrywać obrazy. W sekcji
   „Produkty klientów” administrator może przypisać do profilu klienta
   aplikację, stronę internetową lub integrację AI, opisać status prac i podać
   opcjonalny link. Zalogowany klient zobaczy przypisane pozycje w panelu
   „Moje produkty”; API zwraca wyłącznie rekordy należące do jego konta.

W kolekcji „Treści stron” utwórz wpis o identyfikatorze `apps`, aby opublikować
nową stronę pod `/apps`. Tytuł i opis uzupełnij w formularzu; w JSON możesz
dodać `body`, `sectionTitle`, `additionalBody` oraz listę `features` w formacie
`[{"title":"Funkcja","description":"Opis"}]`. Zapisz wpis jako opublikowany.
Adresy takie jak `/app`, `/ai`, `/about` czy `/projects` mają już własne widoki;
ich treść jest edytowana przez istniejące wpisy CMS i nie zostanie zastąpiona
przez stronę o takim samym identyfikatorze. W kolekcjach „Projekty” i „Strony
internetowe” dodaj osobne wpisy, aby pokazać aplikację albo witrynę na listach;
pole „Adres docelowy” przyjmuje adres zewnętrzny lub lokalną ścieżkę, np.
`/apps`.

Treści strony pozostają wbudowanym szablonem, dopóki backend nie jest
skonfigurowany; po konfiguracji publiczne kolekcje pobierają opublikowane wpisy
z Supabase. W kolekcji „Tłumaczenia” wybierz język, wczytaj teksty bazowe, edytuj
tylko potrzebne pola i opublikuj wpis. Obrazki strony można zarządzać w
„Ustawieniach witryny”: `hero-1`, `hero-2`, `hero-3`, `showcase-image` i
`process-image`; pole `imageUrl` wpisu przechowuje ich adres. Wpis `global`
ustawia m.in. e-mail kontaktowy.

Aby dodać klikalny kafelek promujący aplikację, utwórz opublikowany wpis w
kolekcji „Projekty” i ustaw w polu „Dodatkowe pola (JSON)” adres docelowy, np.
`{"href":"https://twoja-aplikacja.pl"}`. Wpis pojawi się w sekcji aplikacji oraz
na stronie projektów. Wpisy w kolekcji „Strony internetowe” z takim polem
również będą widoczne w publicznym portfolio `/websites` i otworzą adres strony
w nowej karcie. Podaj rzeczywisty adres witryny; wpisy bez zewnętrznego adresu
nie są prezentowane jako ukończone realizacje. Do kafelka dodaj tytuł, opis i
obraz w panelu CMS.

Endpoint publicznej treści: `GET /api/content/:collection`. Panel korzysta z
`/api/admin/*` i wymaga tokenu Supabase oraz administratora z tabeli
`cms_admins`. Produkty klienta są pobierane przez `GET /api/client/products`;
administratorzy zarządzają nimi przez `/api/admin/client-products`. Te endpointy
wymagają migracji tabeli produktów. `/api/health` sprawdza konfigurację i
dostępność tabeli CMS.

## Wdrożenie na Vercel

Frontend i API wdrażaj jako **dwa projekty Vercel** z tego samego repozytorium:

1. **API:** utwórz projekt Vercel z Root Directory `backend`. Plik
   `backend/vercel.json` konfiguruje NestJS jako funkcję serverless i używa
   pustego `backend/public/` jako wymaganego katalogu wyjściowego Vercel. Dodaj w Vercel
   Environment Variables: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`,
   `CMS_STORAGE_BUCKET=cms-assets` oraz `FRONTEND_ORIGINS` z dozwolonym
   originem frontendu, np. `https://gilusoft.vercel.app`. Po wdrożeniu sprawdź
   `https://<adres-api>/api/health`.
2. **Frontend:** utwórz drugi projekt z Root Directory `frontend`. Plik
   `frontend/vercel.json` kieruje ścieżki SPA (np. `/admin` i `/blog/post`)
   do `index.html`. Ustaw `VITE_SUPABASE_URL`,
   `VITE_SUPABASE_PUBLISHABLE_KEY` i `VITE_API_URL=https://<adres-api>/api`.
3. Dodaj adres domeny frontendu w Supabase Auth jako dozwolony site URL i
   URL przekierowania logowania. Zastosuj obie migracje Supabase i przyznaj
   swoje konto `cms_admins`, jak opisano wyżej.

Klucz `SUPABASE_SERVICE_ROLE_KEY` dodawaj wyłącznie w zmiennych środowiskowych
projektu API na Vercel. Nigdy nie dodawaj go do projektu frontendu ani do
zmiennej `VITE_*`. Zmiana zmiennych Vercel wymaga ponownego wdrożenia projektu.

## Ścieżki

- `/` — strona główna
- `/about` — o studiu
- `/projects` — realizacje
- `/app` — tworzenie aplikacji i systemów webowych
- `/websites` — strony internetowe
- `/ai` — wdrażanie AI i automatyzacje
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
