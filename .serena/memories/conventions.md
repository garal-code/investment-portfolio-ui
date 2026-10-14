# Conventions

- Container/presentational split: `app/*/page.tsx` are thin containers using hooks (`useResumen`, `useAnalisis`, `useRentabilidad`, `useCartera`); components under `components/` are presentational.
- Tests colocated next to source (`X.test.ts(x)`), including pure helpers in `lib/`. Strict TDD was used for features.
- Business math/format lives in `lib/portfolio-calc.ts`, `lib/utils.ts` (not in components).
- Spanish domain naming (`movimientos`, `cartera`, `tipo_cambio`); foreign-currency instruments require `tipo_cambio > 0`.
- Commits: conventional commits, no AI attribution/Co-Authored-By.
- Stacked/chained PRs when over ~400 changed lines.
