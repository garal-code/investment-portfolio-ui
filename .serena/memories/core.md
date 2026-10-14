# investment-portfolio-ui

Frontend (Next.js 16 App Router) of a personal investment portfolio manager ("Garal · Cartera"). Consumes `garal-screener` (sibling repo, Python backend). Workspace root is not a git repo; this repo is.

- AGENTS.md warns: Next 16 has breaking changes. Read `node_modules/next/dist/docs/` before writing Next code (e.g. `middleware.ts` is now `proxy.ts`).
- UI/domain language is Spanish (routes `dashboard`, `movimientos`, `analisis`, `ajustes`; "cartera" = portfolio). Code artifacts in English.
- Branching: feature branches off `develop`, PRs target `develop`; `main` is release.

## Source map
- `app/` routes: `login`, `register`, `forgot-password`, `reset-password` (public); `dashboard`, `movimientos`, `analisis`, `ajustes` (protected). `app/providers.tsx` wires contexts + React Query.
- `components/{auth,charts,dashboard,forms,layout,settings,ui}` presentational pieces; pages stay thin containers.
- `contexts/` Auth, Cartera (active portfolio), Sidebar. `hooks/useCartera.ts` data hooks. `lib/` api client, pure calc/format helpers, preferences.
- `proxy.ts` route guard; `next.config.ts` rewrites `/api/v1/*` to backend.
- `design_handoff_tu_cartera/`, `openspec/`, `.atl/`: design reference, SDD specs, skill registry (tooling-generated; `.atl` files change on their own, do not commit them as part of feature work).

Details: stack `mem:tech_stack`, commands `mem:suggested_commands`, code style `mem:conventions`, done checklist `mem:task_completion`.

## Invariants
- Browser calls stay same-origin via the rewrite; backend session is an httpOnly cookie `access_token`. `BACKEND_API_URL` is server-only (no `NEXT_PUBLIC_`).
- `proxy.ts` only checks cookie presence (no JWT verify); backend is the real auth boundary.
- Logout must `resetQueries` (not `clear()`) and clear active cartera selection, else cross-user cache leaks.
