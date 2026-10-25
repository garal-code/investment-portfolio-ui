# Import Movements from a Broker CSV — frontend (issue #36)

File locator: `odd/tasks/importar-csv.md` · Engram mirror: `odd/importar-csv-ui/tasks` · branch `feat/importar-csv`
(from `main` 57fc558). Backend contract and specs S1-S8: `garal-screener/odd/tasks/importar-csv.md` (D7) and
`garal-screener/docs/importacion.md`, backend branch `feat/importar-csv` (not merged yet).

## Specs

- **S1** — "el back ya tiene implementadad la parte de importacion por CSV ahora añadelo tu en la seccion de
  movimiento": the import lives in `/movimientos`, next to "Nuevo movimiento", not in a separate page.
- **S2** — Backend S2: "leer el CSV y dejar que el usuario matche el CSV con las columnas que requerimos y lo pueda
  guardar ya par ausarlo siempre": pick a saved template or map the CSV columns and save a new one.
- **S3** — Backend S3: "pero no limites todo el diseño e implmentacion a estas dos plantillas": the mapping editor is
  generic (any header, any type values), no broker presets.
- **S4** — Backend S4: "antes de importar se le avisa al usuaario de lo que el ha apsado lo que se va ameter y lo que
  no y por que.": show the preview (summary + every row with its state and reason) before confirming.
- **S5** — Confirm sends the preview `huella`; a 409 asks to preview again; after importing, the movements, summary,
  frontier and returns refresh.

## Tasks

- [x] T1 — S1-S5 · Types, API client, hooks, pure template helpers, import panel (file, template, mapping editor,
  preview, confirm, result) in `/movimientos` + tests · inline · commits `7ff26f5` (client, hooks, helpers; PR 3)
  and `69a8b7b` (panel + page; PR 4), with follow-ups `738dec3`, `599f1e8`, `6207723`, `60fc6d4`, `9363efb` (L4-L9)
- [x] T2 — S1-S5 · Visual check with Playwright against the local backend on `feat/importar-csv` · inline ·
  evidence: L2

## Log

- **L1** (2026-10-24, user): "el back ya tiene implementadad la parte de importacion por CSV ahora añadelo tu en la
  seccion de movimiento"
- **L2** (evidence): RED observed for helpers (missing module) and page (3 failing); GREEN 31 focused tests, full suite
  38 files / 336 tests, `tsc --noEmit` clean (no ESLint config in the repo). Playwright on a scratch copy of
  `cartera.db` migrated to `b7e4c2a91d05` (the user's DB untouched), agent test user, synthetic CSV (deposit, buys,
  sell, row without ISIN, dividend, duplicated ID): new template saved, preview 3 import / 4 skip with the backend
  reasons, import added 3 movements and the table refreshed; re-import of the same file showed "Ya importada (ID …)"
  and disabled the button.
- **L3** (slices): commit 1 = 586 lines (client, hooks, helpers + tests); commit 2 = panel, page and tests. Over the
  ~400-line guide because each slice is one indivisible layer with its tests.
- **L4** (2026-10-24, user): "en la presvisualizcion de los movimientos haz que la ventana ocupe todo ahora mismo se me
  queda a medias que ocupe todo el espacio que tenga" → `d3c4f8a`: preview table up to the viewport height
  (`max(320px, 100dvh - 200px)`, sticky header) and the panel scrolls to the top on the review step. RED/GREEN on the
  scroll test; 337 tests pass. Playwright 1440x900, 41-row CSV: table 700px, actions visible without scrolling.
- **L5** (finding, open): the backend requires at least one sell value (`valores_venta` min 1), and the classifier only
  lists values present in the file, so a CSV with only buys cannot be saved as a template. Decision pending.
- **L6** (2026-10-24, user): "no me gusta la edicion de la plantillas solo puedo cambiarla cuando añado un fichero, pero
  imaginate que solo quiero cambiar el nombre de la plantilla ahi no puedo" → `fe5f6a9`: without a file, "Editar
  plantilla" opens the editor in text mode (columns with the template's own as suggestions, comma-separated type values
  and commission columns) and saves without previewing; with a file nothing changes. RED 3 / GREEN; 340 tests pass.
  Playwright (agent test user): renamed a template without a file, mapping kept, notice shown; temp template deleted.
- **L7** (2026-10-24, user): "lo que aparezcan los movimiento abajo en la presvisualizacion no me convence, puede llevar
  a confusion" → the stored movements table (and its loading/empty/error states) is hidden while the import panel is
  open; it comes back on close, already refreshed. RED 2 / GREEN; 342 tests pass.
- **L8** (2026-10-24, user): "el box selector de las plantillas es mas pequeño que el de introducir el fichero no queda
  bien" → measured 36px (native select) vs 37.5px (file input). `components/importacion/Campo.tsx`: every field in the
  import panel is 38px and selects use the app look with a chevron (global `.input-dark` untouched). Playwright: 38 / 38.
- **L9** (2026-10-24, user): "benga perfecto genera las ramas y PR necesarias stackeadas". The backend was already
  delivered by another session as garal-code/garal-screener #40-#44 (`70ea203` there lets a template have only buy or
  only sell values, closing L5); `9363efb` aligns the editor validation ("Marca al menos un valor de compra o de
  venta"). Frontend delivered as one stacked chain on `main`, commits cherry-picked from the local `feat/importar-csv`
  (hashes above are the delivered ones): 1 `fix/precio-moneda-movimientos` (74 lines) → 2 `feat/movimientos-ordenar`
  (265) → 3 `feat/importar-csv-01-cliente` (586) → 4 `feat/importar-csv-02-panel` (1,555: ≈1,000 code, ≈500 tests,
  56 docs; no cohesive split, the editor and preview components are tested through the panel). 353 tests pass at the
  tip.
