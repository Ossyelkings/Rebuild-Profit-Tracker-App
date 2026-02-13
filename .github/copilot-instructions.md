## Purpose
Provide concise, repo-specific guidance so an AI coding agent can be productive immediately.

## Quick start
- Install dependencies: `pnpm install` (project uses a `pnpm` override for `vite`).
- Run dev server: `pnpm dev` or `npm run dev` (scripts in package.json use Vite).
- Build: `pnpm build` or `npm run build`.

## Big picture
- This is a Vite + React (TypeScript) single-page app. Entry: [src/main.tsx](src/main.tsx).
- App orchestration lives in [src/app/App.tsx](src/app/App.tsx) (tab-driven UI, central state, migration flow).
- UI components are under [src/app/components](src/app/components) and shared primitives under [src/app/components/ui](src/app/components/ui).
- Styling: Tailwind CSS (configured in `vite.config.ts`); plugin alias `@` -> `src` is set in [vite.config.ts](vite.config.ts).

## Data & integrations
- Primary persistence: Supabase (optional/opt-in). Supabase client is at [src/utils/supabase/client.ts](src/utils/supabase/client.ts) and reads credentials from `/utils/supabase/info`.
- CRUD helpers and database surface are in [src/utils/supabase/database.ts](src/utils/supabase/database.ts).
- Auth helpers are in [src/utils/supabase/auth.ts](src/utils/supabase/auth.ts) and the React wrapper is `AuthProvider` in [src/contexts/AuthContext.tsx](src/contexts/AuthContext.tsx).
- Migration path: local LocalStorage -> Supabase migration is implemented at [src/utils/migration/migrateToSupabase.ts](src/utils/migration/migrateToSupabase.ts) and surfaced in the UI via [src/app/components/MigrationUI.tsx](src/app/components/MigrationUI.tsx).
- Local-only data: cost templates and some settings are intentionally stored in LocalStorage via [src/app/utils/storage.ts](src/app/utils/storage.ts) (these do not automatically sync).

## Project-specific patterns & conventions
- Tabbed single-file orchestration: `App.tsx` contains the high-level navigation state and calls into specific components (e.g., `VehiclesList`, `VehicleDetail`), so prefer adding high-level flows there.
- Async/supabase calls: helpers return domain objects (see `getVehicles`, `createVehicle` usage in `App.tsx`). Error handling is done with `try/catch` + `console.error` + `alert()` for user-facing failures—match this pattern for consistency.
- Migration-first safety: the app checks for local data to migrate and will show a migration UI; do not assume supabase is always active. See migration guard usage in [src/app/App.tsx](src/app/App.tsx).
- UI primitives: prefer re-using components under `src/app/components/ui` (Radix-based wrappers). Icons are `lucide-react`.
- File aliasing: import paths may use `@` for `src` (configured in `vite.config.ts`), or relative imports are used heavily inside `src/app`.

## Critical developer workflows
- Dev server: `pnpm dev` (or `npm run dev`) — open browser, check console for auth redirect/hash params.
- Supabase sign-up/debugging: App detects auth errors from URL hash; an expired confirmation link can produce an `error` in the URL — App suggests disabling "Confirm email" in Supabase for local testing. See the URL error handling in [src/app/App.tsx](src/app/App.tsx) (search for `error_description`).
- Where to add backend changes: extend [src/utils/supabase/database.ts](src/utils/supabase/database.ts) for new CRUD operations; update types in [src/utils/supabase/client.ts](src/utils/supabase/client.ts) if DB schema changes.

## Integration gotchas
- Supabase keys are referenced from `/utils/supabase/info`. Ensure `projectId` and `publicAnonKey` are present and not accidentally committed for public repos.
- Email confirmation: sign-up flows may fail locally due to expiring confirmation links; the app shows an explanatory alert recommending toggling Confirm Email in Supabase during testing.
- Assets: `vite.config.ts` allows raw import for `*.svg` and `*.csv` only; do not import `.css`, `.ts`, or `.tsx` as raw assets.

## Where to look for examples
- Adding a vehicle flow: see how `handleAddVehicle` calls `createVehicle` in [src/app/App.tsx](src/app/App.tsx).
- Auth + protected views: examine `AuthProvider` ([src/contexts/AuthContext.tsx](src/contexts/AuthContext.tsx)) and login UI at [src/app/components/SupabaseLogin.tsx](src/app/components/SupabaseLogin.tsx).
- Migration flow: [src/utils/migration/migrateToSupabase.ts](src/utils/migration/migrateToSupabase.ts) + [src/app/components/MigrationUI.tsx](src/app/components/MigrationUI.tsx).

## Minimal rules for AI agent edits
- Keep changes limited in scope: prefer focused edits to existing components rather than broad refactors.
- Preserve existing auth and migration checks—avoid removing migration guards in `App.tsx`.
- When adding Supabase schema usage, update the typed `Database` shape in [src/utils/supabase/client.ts](src/utils/supabase/client.ts).

## Questions / Next steps
If anything here is unclear or you'd like deeper details (API shapes, key locations, or test harnesses), tell me which area to expand.
