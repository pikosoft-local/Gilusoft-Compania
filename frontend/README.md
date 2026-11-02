# Gilusoft

Responsywna strona studia cyfrowego z animacjami sterowanymi przewijaniem,
oddzielnymi podstronami i panelem klienta opartym na Supabase Auth.

## Uruchomienie

```powershell
npm install
npm run dev
```

## Supabase: logowanie i panel klienta

1. Utwórz projekt w [Supabase](https://supabase.com/).
2. Skopiuj `.env.example` do `.env.local` i wpisz URL projektu oraz klucz
   **publishable** (ewentualnie starszy klucz `anon`):

   ```dotenv
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your-public-publishable-key
   ```

   Klucz publishable jest przeznaczony do aplikacji przeglądarkowej. Nigdy nie
   dodawaj klucza `service_role` ani sekretnego klucza do zmiennych `VITE_*`.

3. Wykonaj migrację
   `../supabase/migrations/20261102100000_profiles.sql` w SQL Editorze projektu.
   Tworzy ona tabelę profili z polityką RLS i profil powiązany z nowym kontem.
4. W panelu Supabase włącz Email Auth i dodaj adres `http://localhost:5173/logowanie`
   do dozwolonych URL-i przekierowania (oraz odpowiedni adres produkcyjny).
5. Zrestartuj serwer Vite po zmianie `.env.local`.

Rejestracja wymaga unikalnej nazwy użytkownika (3–24 małe litery, cyfry lub
podkreślenia). Jeśli w projekcie włączono potwierdzanie e-maila, użytkownik
musi potwierdzić adres przed pierwszym logowaniem.

## Ścieżki

- `/` — strona główna
- `/projekty` — realizacje
- `/strony-www` — strony internetowe
- `/certyfikaty` — certyfikaty
- `/logowanie` — logowanie i rejestracja
- `/panel/:username` — panel chroniony sesją Supabase
- `/cookies` — informacje i ustawienia zgody na cookies

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

