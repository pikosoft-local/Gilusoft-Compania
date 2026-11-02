# Gilusoft

Gilusoft website, Supabase-backed authentication and a NestJS content-management
API.

- Frontend and local setup: [frontend/README.md](./frontend/README.md)
- CMS API: `backend/` (NestJS, runs on `http://localhost:3000`)
- Supabase schema and CMS setup: `supabase/migrations/`

The admin content manager is available at `/admin` after assigning the
administrator role in `public.cms_admins`. Never expose the Supabase
`service_role` key to the browser.
