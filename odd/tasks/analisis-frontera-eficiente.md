# Analysis Page: Markowitz Efficient Frontier

File locator: `odd/tasks/analisis-frontera-eficiente.md`
Engram mirror: `odd/analisis-frontera-eficiente/tasks`
Branch: `feat/analisis-frontera-eficiente` (from `develop` 8c72e7e)

## Objective

Turn `/analisis` into the efficient-frontier page of the active cartera and add it to the sidebar
as "Análisis". Show the result (risk/return chart, weights, exclusions) and the calculation detail
(the same steps as the reference spreadsheet "Markowitz - Cartera Eficiente.xlsx").

## Problem / Why

The backend (`garal-screener`, PRs #24-#27, merged) exposes
`GET /api/v1/carteras/{id}/frontera-eficiente?anios=5&puntos=20`, but nothing in the UI consumes it.
The current `/analisis` page (donuts + bar chart of composition) is orphaned: not in the sidebar,
not linked, and its content is already covered by the dashboard heatmap (`Treemap`).

## Decisions (user, 2026-10-10)

- Page: `/analisis`, sidebar entry "Análisis".
- Replace the old content: remove the donuts page and, if unused elsewhere, `DonutChart`, `BarrasPeso`,
  `useAnalisis` and `portfolio.analisis` (the backend `/analisis` endpoint stays untouched).
- Scope v1: result + full calculation detail.

## Backend contract (garal-screener develop c6fd927, `app/schemas.py` `FronteraEficienteCartera`)

- Root: `fecha_inicio`, `fecha_fin` (last day of the last completed month), `frecuencia: "mensual"`,
  `n_observaciones`, `tickers`, `rentabilidades_esperadas[tickers]`, `matriz_covarianzas[tickers][tickers]`,
  `frontera: Punto[]` (ascending return; first = min variance), `cartera_minima_varianza: Punto`,
  `cartera_actual: Punto`, `excluidos: {ticker, motivo}[]`
  (`sin_ticker | sin_precio_actual | sin_historico | historico_insuficiente`), `peso_excluido` in [0, 1].
- `Punto`: `rentabilidad`, `volatilidad`, `varianza` (monthly, not annualised), `pesos: {ticker: weight}`.
- `detalle.datos`: `fechas_precios`, `precios[fechas_precios][tickers]` (native currency),
  `fechas`, `rentabilidades[fechas][tickers]`.
- `detalle.estadisticas`: `varianzas`, `volatilidades`, `matriz_correlaciones`.
- `detalle.cartera_actual`: `valores_eur: {ticker: eur}`, `rentabilidades[fechas]`.
- Query params: `anios` 1..20 (default 5), `puntos` 2..100 (default 20).
- Errors: 400 insufficient data (Spanish `detail`, show it), 503 price provider down, 404 foreign cartera.

## Constraints

- Follow existing patterns: `lib/api.ts` client, `types/index.ts`, hooks in `hooks/useCartera.ts`
  (react-query keyed by cartera), charts in `components/charts/` with recharts, MSW in `test/mocks/`.
- Movement mutations already invalidate `['analisis', ...]`; the frontier query must be invalidated
  the same way so the page refreshes after a new movement.
- All figures are monthly; label them as such. No annualisation in v1.
- Code, identifiers, comments in English; UI copy in Spanish (existing convention).

## Tasks

- [x] T1 — Data layer: frontier types, `portfolio.fronteraEficiente(carteraId, anios)`, `useFronteraEficiente`
  hook (query key `['frontera', carteraId, anios]`, invalidated by movement mutations), MSW handler and
  fixture, tests; error detail extraction for 400/503.
- [x] T2 — Result view: replace `/analisis` page content, sidebar entry "Análisis", years selector
  (`SegmentedControl`), risk/return chart (frontier line, min-variance point, current portfolio point,
  tooltip with weights), weights table (current vs min variance), exclusions notice with `peso_excluido`,
  loading/empty/400/503 states; remove old donuts page and unused `DonutChart`/`BarrasPeso`/`useAnalisis`.
- [x] T3 — Calculation detail section: monthly prices and returns tables, per-asset stats
  (expected return, variance, volatility), correlation matrix (colour-scaled), covariance matrix,
  current portfolio EUR values and monthly return series; collapsible to keep the page readable.

- [x] T4 — Rebalancing moves (user request 2026-10-11): the user picks any frontier point (click on the chart,
  plus an accessible keyboard alternative such as a slider over the frontier points) and the page shows the
  moves to go from the current portfolio to that point: per ticker current weight, target weight, delta (pp),
  EUR amount = delta x total EUR value of included positions (sum of `detalle.cartera_actual.valores_eur`),
  action Comprar/Vender/Mantener (tiny deltas -> Mantener). Summary: current vs selected return/volatility.
  Default selection: frontier point with volatility closest to the current portfolio. EUR masked in privacy
  mode. Excluded positions are never moved. Out of scope: number of shares (needs current price per share
  and FX, not in the response). Pure calculation in `lib/` with unit tests.

## Checks

- Focused: `npx vitest run <touched test files>`.
- Task closure: `npm test`, `npx tsc --noEmit`, `npm run build` when routes change.
- Test-first: RED before GREEN where a deterministic test applies (hooks, components, page states).

## Delivery

- Forecast: T1 ~200, T2 ~350, T3 ~300 changed lines (incl. tests) -> over the ~400 budget;
  delivery strategy to be confirmed with the user before opening PRs (ask-on-risk).

## Progress / Evidence

- 2026-10-10: feature document created; branch created from develop 8c72e7e.
- 2026-10-10: T1 done (commit: see git log). Added frontier types in `types/index.ts`
  (`PuntoCartera`, `MotivoExclusion`, `ActivoExcluido`, `DatosEntradaFrontera`, `EstadisticasActivos`,
  `DetalleCarteraActual`, `DetalleCalculoFrontera`, `FronteraEficiente`),
  `portfolio.fronteraEficiente(carteraId, anios)`, `useFronteraEficiente(carteraId, anios)` (key
  `['frontera', carteraId, anios]`; no retry on 400/404/503, otherwise the app default single retry),
  `['frontera', id]` / `['frontera']` invalidation next to every `analisis` invalidation,
  `getErrorStatus` + `getFronteraErrorMessage` in `lib/utils.ts`, MSW default handler and fixture
  `test/mocks/fixtures/fronteraEficiente.ts` (3 tickers, 13 months, stats computed from prices).
  RED: 17 new tests failed (`portfolio.fronteraEficiente` / `useFronteraEficiente` /
  `getErrorStatus` / `getFronteraErrorMessage` not a function; `invalidateQueries` not called with
  `['frontera', …]`). GREEN: focused 3 files / 41 tests; `npm test` 22 files / 185 tests;
  `npx tsc --noEmit` clean.
- 2026-10-10: T2 done. `/analisis` now shows the frontier of the active cartera: header card with
  window (`fecha_inicio` – `fecha_fin`), `n_observaciones` monthly observations, "monthly, not
  annualised" note and a 3/5/10-year `SegmentedControl` (default 5, kept visible on loading/error);
  exclusions notice (`components/analisis/ExclusionesNotice.tsx`, Spanish label per `motivo` +
  `peso_excluido`); risk/return chart (`components/charts/FronteraChart.tsx`, recharts `ScatterChart`:
  frontier joint line, min-variance diamond, current-portfolio marker, HTML legend, tooltip with
  return/volatility/weights); key figures (`CifrasClave`) and weights table (`PesosTable`, current vs
  min-variance + EUR value, privacy-mode aware, horizontal scroll). 400/503 via
  `getFronteraErrorMessage`. Sidebar entry "Análisis" (`ChartScatter`) between Resumen and
  Movimientos. New `formatRatioPct` helper (2-decimal unsigned %). Removed `DonutChart.tsx`,
  `BarrasPeso.tsx`, `useAnalisis`, `portfolio.analisis`, `AnalisisCartera`/`GrupoAnalisis`, the
  `['analisis']` invalidations in `useCartera.ts` and the now-unused `CHART_COLORS`; AuthContext
  query-key comment updated. `components/layout/Topbar.tsx` still invalidates `['analisis', id]` on
  refresh (outside the T2 edit surface; harmless no-op). RED: 14 tests failed + chart test file failed
  to import (`formatRatioPct` not a function, no "Análisis" link, old page requested the unhandled
  `/analisis` endpoint, `./FronteraChart` missing). GREEN: focused 5 files / 55 tests; `npm test`
  25 files / 205 tests; `npx tsc --noEmit` clean; `npm run build` OK (`/analisis` static).
- 2026-10-10 T2 parent follow-up: `components/layout/Topbar.tsx` refresh button invalidated the removed `['analisis', id]` key; now invalidates `['frontera', id]`. `npx tsc --noEmit` clean, `npx vitest run` 205 passed.
- 2026-10-10: T3 done. "Detalle del cálculo" section (`components/analisis/DetalleCalculo.tsx`) below the
  weights table: six native `<details>` steps, collapsed by default, each with a one-line Spanish
  explanation in its `<summary>`; a step body mounts on first open (`toggle` event) so long series
  are not rendered until asked for. Steps: monthly prices (`fechas_precios` x tickers, native
  currency, 2 decimals), monthly returns (tickers + "Cartera actual", %, negatives with `rent-neg`),
  per-asset stats (expected return %, raw variance 6 decimals, volatility %), correlation matrix
  (2 decimals, diverging plum/green background from the palette, alpha capped for readable ink),
  covariance matrix (6 decimals, fixed notation), current value per position (EUR, privacy-masked
  like `PesosTable`, weight, total row). Shared `components/analisis/DetalleTable.tsx` (labelled
  rows, sticky header row and first column, both-axis scroll capped at 420px, `tabular-nums`).
  `lib/utils.ts`: new `formatMes` ("ene 2024"); `formatNum` now uses U+2212 for negatives (only
  other caller is the frontier chart axis). RED: 13 tests failed (`formatNum` returned ASCII
  `-0,23`, `formatMes` not a function, no "Detalle del cálculo" region/summaries in component and
  page tests). GREEN: focused 3 files / 53 tests; `npm test` 26 files / 220 tests;
  `npx tsc --noEmit` clean; `npm run build` OK.
- 2026-10-10 RDD: committed range develop..4a2141a (26 files, 1989 lines) assessed medium; one-lens
  reliability review approved and acknowledged (lineage `review-582b4b7380b80215`, authority burned).
  Non-blocking advisories (follow-ups): R3 WARNING `components/charts/FronteraChart.test.tsx:7-22` chart
  series rendering not proven by the test; R3 SUGGESTION `lib/utils.test.ts:93-96` `formatMes` depends on
  ICU month abbreviations ("sept" vs "sep").
- 2026-10-11: T4 done. `lib/rebalanceo.ts`: `computeRebalancingMoves(tickers, pesosActuales, pesosObjetivo,
  valoresEur)` (one row per ticker in `tickers` order; missing weights = 0; total = EUR value of the
  analysed tickers only, so excluded positions never move and amounts net to ~0; `HOLD_THRESHOLD` 0.005
  -> "mantener") and `defaultFrontierIndex(frontera, actual)` (closest volatility, ties -> higher return,
  `null` when empty). `lib/utils.ts`: `formatPp` (signed pp, 1 decimal) and `formatEurSigned`.
  `FronteraChart`: optional `selectedIndex`/`onSelect`; frontier points clickable (pointer cursor), chosen
  point drawn as a dark star on top and listed in the legend as "Punto elegido"; "Riesgo objetivo" range
  slider below the chart (`aria-valuetext` + `<output>` with monthly volatility/return). Page keeps the
  selection tied to the response it was made on, so a new response (horizon change, refetch after a
  movement) falls back to the default point. New `components/analisis/MovimientosTable.tsx` right after
  the chart: current vs chosen summary, Activo / Peso actual / Peso objetivo / Diferencia (pp) / Importe
  (signed EUR, privacy-masked) / Acción badge (movement-list buy/sell colours), footer note (excluded
  positions not moved, estimates not a recommendation, no number of shares). Chart clicks are tested in
  jsdom by mocking `ResponsiveContainer` to a fixed size. RED: 11 tests failed (`formatPp`/
  `formatEurSigned` not a function, no "Punto elegido"/slider/clickable points, no moves on the page) and
  2 suites failed to import (`lib/rebalanceo`, `MovimientosTable`; 14 tests). GREEN: focused 6 files /
  85 tests; `npm test` 28 files / 247 tests; `npx tsc --noEmit` clean; `npm run build` OK.
