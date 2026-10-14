# Análisis page redesign: no duplicates, visual calculation data, analyst methodology page, collapsible sidebar

File locator: `odd/tasks/analisis-rediseno.md` · Engram mirror: `odd/analisis-rediseno/tasks`
Branch: `feat/analisis-rediseno`, stacked on `fix/sin-tipo-cambio` (34edd00) -> `feat/analisis-05-metodologia` (PR #35).

## Specs

- **S1 — No duplicated data, lighter page.** User: "esto es solo 100% visual nota la pagina muy carga y con datos
  que estan duplicads en varios sitios por ejemplo 'Cartera Actual' y 'Minima Varianza' estan dos veces esos
  datos." Accepted structure (verbatim):
  ```
  1. Cabecera: período + 3/5/10 años + enlace "Cómo se calcula" (abre otra pestaña)
  2. Gráfico de la frontera + riesgo objetivo
  3. Comparativa: Actual vs Punto elegido (una sola vez)
     Tabla: activo · valor · peso actual · peso objetivo · diferencia · importe · acción
     (mínima varianza = un punto más del gráfico, con un botón de acceso directo)
  4. Datos del cálculo, en gráficos visibles sin desplegar:
     - Precios: líneas en base 100
     - Rentabilidades mensuales: líneas/barras
     - Estadísticas por activo: barras de rentabilidad y volatilidad
     - Correlaciones y covarianzas: mapas de calor
     (cada gráfico con un "Ver datos" para abrir la tabla)
  ```
  Option description the user accepted: "Se eliminan 'Cifras clave' y 'Pesos por activo'. Mínima varianza pasa a
  ser un punto más que se elige en el gráfico."
- **S2 — "Cómo se calcula" opens a new browser page with an analyst document.** User: "Lo de 'Como se Calcula' no
  me termina de convenceer el formato me gustaria mas que se abriena una pagina nueva en el navegador donde se
  visualice el fichero de /docs que se ha creado". Refinement: "quizas ese documento es demsiado ya que incluye
  referencia a linea concretas de codigo y funciones de librerias python que eso un analista no sabe, para el
  analista se lo tenemos que traducir a lo que significa en su mundo, es decir, al analista le puede interesar la
  forumala matematica anlago a lo que calcula la funcion de pyhton pero no el nombre de la funcion ni los
  parametros"
- **S3 — Calculation data shown visually.** User: "y la parte de las rentabilidades, los precios, la matrices que
  fuesesn visuales directamente" (see S1 item 4).
- **S4 — Collapsible sidebar.** User: "Ademas como extra el slide bar quiero que sea colapsable"; clarified: "El
  menú lateral (sidebar verde)" ("Se pliega a una columna de iconos y la página gana ancho.").

## Tasks

- [x] T1 — S1: remove `CifrasClave` + `PesosTable`; comparison once; moves table gains `Valor`; min-variance
  shortcut selects frontier point 0; header link `Cómo se calcula` -> `/analisis/metodologia` in a new tab; drop
  the in-page `Metodologia` section. Route: worker. Commit: 9a1566a
- [ ] T2 — S3 (S1 item 4): calculation detail as always-visible charts (prices base 100, monthly returns, stats
  bars, correlation + covariance heatmaps, current value per position) with a "Ver datos" table toggle each.
  Route: worker. Commit: —
- [x] T3 — S2: analyst methodology `docs/metodologia-markowitz.md` (math, no code/function/parameter names)
  rendered at `/analisis/metodologia` with Markdown + KaTeX. Route: worker. Commit: ef528d9
- [x] T4 — S4: sidebar collapses to an icon rail, state persisted. Route: worker. Commit: 22a0156
- [ ] T5 — Visual check with Playwright + independent verify (new dependencies = risk item 5). Route: parent +
  gentle-ai-verify. Commit: —

## Log

- L1 (user, 2026-10-14, verbatim): "noo esto es solo 100% visual nota la pagina muy carga y con datos que estan
  duplicads en varios sitios por ejemplo 'Cartera Actual' y 'Minima Varianza' estan dos veces esos datos.
  Lo de 'Como se Calcula' no me termina de convenceer el formato me gustaria mas que se abriena una pagina nueva
  en el navegador donde se visualice el fichero de /docs que se ha creado
  y la parte de las rentabilidades, los precios, la matrices que fuesesn visuales directamente
  Ademas como extra el slide bar quiero que sea colapsable"
- L2 (user answers, verbatim): sidebar -> "El menú lateral (sidebar verde)"; doc -> "quizas ese documento es
  demsiado ya que incluye referencia a linea concretas de codigo y funciones de librerias python que eso un
  analista no sabe, para el analista se lo tenemos que traducir a lo que significa en su mundo, es decir, al
  analista le puede interesar la forumala matematica anlago a lo que calcula la funcion de pyhton pero no el nombre
  de la funcion ni los parametros"; structure -> "Sí, esta estructura"; branch -> "si hya cambios sin comitear
  comitea y sui hay cambios sin mergear a develop apilalos es decir, tomalo como continuacion de lo que estaba
  haciendo".
- L3 (decision, parent): the source technical doc is `garal-screener/docs/markowitz.md`; the analyst version lives
  in this repo (`docs/metodologia-markowitz.md`) because it is a different document for a different audience.
- L4 (evidence): uncommitted WIP was fx-fallback T2 (RED); finished and committed on `fix/sin-tipo-cambio`
  (e58dbb2, tooling 34edd00) before branching.
- L5 (decision, parent): exact pins react-markdown 10.1.0, remark-gfm 4.0.1, remark-math 6.0.0, rehype-katex
  7.0.1, katex 0.16.47. Accepted low advisory GHSA-238p-pmpm-9mq7 (katex < 0.18.2; rehype-katex requires ^0.16):
  the only input is a static repo-owned document, never user content.
- L6 (evidence) T4 22a0156: sidebar collapses to 64px rail from lg, state in localStorage `garal.sidebar.collapsed.v1`;
  RED = missing module/button; GREEN 15 tests. Parent fix: version text hidden only on the desktop rail (`lg:hidden`),
  not in the mobile drawer.
- L7 (evidence) T1 9a1566a: CifrasClave, PesosTable, in-page Metodologia removed; Valor column; "Mínima varianza"
  shortcut -> point 0 (card label switches); "¿Cómo se calcula?" is a new-tab link. RED 10 tests; GREEN 40 focused.
- L8 (evidence) T3 ef528d9: analyst doc (217 lines, no code refs) + /analisis/metodologia (Markdown + KaTeX).
  RED = missing modules; GREEN 7 tests. Playwright: page renders, KaTeX formulas and tables OK, 0 console warnings.
