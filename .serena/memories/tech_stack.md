# Tech stack

- Next.js 16.2.6 (App Router, `output: 'standalone'`), React 19.2, TypeScript 5, npm.
- Data: `@tanstack/react-query` v5, `axios`. Charts: `recharts` 3 plus custom `Treemap`/`squarify`.
- Styling: Tailwind v4 via `@tailwindcss/postcss`; `lucide-react` icons.
- Analytics: `@vercel/analytics` (`<Analytics />` in `app/layout.tsx`).
- Tests: vitest 4 + jsdom + Testing Library + `msw`; globals enabled, setup in `vitest.setup.ts`, tsconfig paths resolved.
- Env: `BACKEND_API_URL` (default `http://localhost:8000`), server-side only.
- Node 22+ built-in `localStorage` can shadow jsdom's Storage in vitest; guard storage access in tests.
- Next 16: `useSearchParams` needs a `<Suspense>` boundary for static build (split server page + client component).
