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
  preview, confirm, result) in `/movimientos` + tests · inline · commits `1696af7` (client, hooks, helpers) and
  the `feat(movimientos)` commit that follows it (panel + page)
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
