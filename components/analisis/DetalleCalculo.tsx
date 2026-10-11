'use client'
import { useState, type ReactNode } from 'react'
import { ChevronRight } from 'lucide-react'
import { usePreferences } from '@/lib/preferences'
import { formatEur, formatMes, formatNum, formatPeso, formatRatioPct, maskAmount } from '@/lib/utils'
import { DetalleTable, type DetalleCell, type DetalleRow } from './DetalleTable'
import type { FronteraEficiente } from '@/types'

interface DetalleCalculoProps {
  frontera: FronteraEficiente
}

// Collapsible step. The body mounts on first open only: price and return
// series grow with the horizon (10 years = 120 rows per ticker) and most
// visits never expand them.
function Paso({ title, explanation, children }: { title: string; explanation: string; children: ReactNode }) {
  const [opened, setOpened] = useState(false)

  return (
    <details
      className="group"
      style={{ borderTop: '1px solid #ece7e1' }}
      onToggle={event => {
        if (event.currentTarget.open) setOpened(true)
      }}
    >
      <summary
        className="flex cursor-pointer list-none items-start gap-2 py-3 [&::-webkit-details-marker]:hidden"
      >
        <ChevronRight
          aria-hidden
          size={16}
          className="mt-0.5 shrink-0 transition-transform group-open:rotate-90"
          style={{ color: 'var(--color-muted)' }}
        />
        <span className="flex flex-col gap-0.5 min-w-0">
          <span style={{ fontSize: 15, fontWeight: 600 }}>{title}</span>
          <span style={{ fontSize: 12, color: 'var(--color-muted)' }}>{explanation}</span>
        </span>
      </summary>
      {opened && <div className="pb-4">{children}</div>}
    </details>
  )
}

// Signed percentage cell; negatives use the loss colour, decided on the
// displayed (rounded) value so "0,00 %" is never coloured.
function pctCell(value: number): DetalleCell {
  const text = formatRatioPct(value)
  return { content: text, className: text.startsWith('−') ? 'rent-neg' : undefined }
}

// Diverging scale over the palette: plum for -1, transparent for 0, Garal
// green for +1. Alpha is capped so the ink text stays readable on every cell.
const POSITIVE_RGB = '45, 106, 90' // --color-primary #2D6A5A
const NEGATIVE_RGB = '138, 58, 106' // --color-plum #8a3a6a

function correlacionCell(value: number): DetalleCell {
  const r = Math.max(-1, Math.min(1, value))
  const alpha = (Math.abs(r) * 0.45).toFixed(3)
  return {
    content: formatNum(r, 2),
    style: { background: `rgba(${r < 0 ? NEGATIVE_RGB : POSITIVE_RGB}, ${alpha})`, color: 'var(--color-ink)' },
  }
}

function matrixRows(tickers: string[], matrix: number[][], cell: (value: number) => DetalleCell): DetalleRow[] {
  return tickers.map((ticker, i) => ({ key: ticker, label: ticker, cells: matrix[i].map(cell) }))
}

export function DetalleCalculo({ frontera }: DetalleCalculoProps) {
  const { privacy } = usePreferences()
  const { tickers, rentabilidades_esperadas, matriz_covarianzas, detalle } = frontera
  const { datos, estadisticas, cartera_actual } = detalle
  const pesos = frontera.cartera_actual.pesos

  const eur = (value: number) => (privacy ? maskAmount('EUR') : formatEur(value))
  const totalEur = tickers.reduce((sum, ticker) => sum + (cartera_actual.valores_eur[ticker] ?? 0), 0)
  const totalPeso = tickers.reduce((sum, ticker) => sum + (pesos[ticker] ?? 0), 0)

  return (
    <section
      aria-labelledby="detalle-title"
      className="flex flex-col"
      style={{ background: '#fff', border: '1px solid #ece7e1', borderRadius: 14, padding: '22px 24px 8px' }}
    >
      <div className="pb-4">
        <h2 id="detalle-title" className="font-serif" style={{ fontSize: 20, fontWeight: 700 }}>
          Detalle del cálculo
        </h2>
        <p style={{ fontSize: 13, color: 'var(--color-muted)' }}>
          Los pasos de la hoja de Markowitz, de los precios a la matriz de covarianzas. Cifras mensuales.
        </p>
      </div>

      <Paso
        title="Precios mensuales"
        explanation="Cierre ajustado de cada mes en la moneda de cotización del activo."
      >
        <DetalleTable
          label="Precios mensuales"
          cornerLabel="Mes"
          columns={tickers}
          rows={datos.fechas_precios.map((fecha, i) => ({
            key: fecha,
            label: formatMes(fecha),
            cells: datos.precios[i].map(precio => ({ content: formatNum(precio, 2) })),
          }))}
        />
      </Paso>

      <Paso
        title="Rentabilidades mensuales"
        explanation="Rentabilidad simple: cierre del mes / cierre del mes anterior − 1. La cartera actual pondera cada activo por su peso actual."
      >
        <DetalleTable
          label="Rentabilidades mensuales"
          cornerLabel="Mes"
          columns={[...tickers, 'Cartera actual']}
          rows={datos.fechas.map((fecha, i) => ({
            key: fecha,
            label: formatMes(fecha),
            cells: [...datos.rentabilidades[i], cartera_actual.rentabilidades[i]].map(pctCell),
          }))}
        />
      </Paso>

      <Paso
        title="Estadísticas por activo"
        explanation="Rentabilidad esperada: media de las rentabilidades mensuales; volatilidad: raíz cuadrada de la varianza."
      >
        <DetalleTable
          label="Estadísticas por activo"
          cornerLabel="Activo"
          columns={['Rentabilidad esperada', 'Varianza', 'Volatilidad']}
          rows={tickers.map((ticker, i) => ({
            key: ticker,
            label: ticker,
            cells: [
              pctCell(rentabilidades_esperadas[i]),
              { content: formatNum(estadisticas.varianzas[i], 6) },
              { content: formatRatioPct(estadisticas.volatilidades[i]) },
            ],
          }))}
        />
      </Paso>

      <Paso
        title="Matriz de correlaciones"
        explanation="Covarianza de cada par dividida por el producto de sus volatilidades: de −1 (ciruela) a 1 (verde)."
      >
        <DetalleTable
          label="Matriz de correlaciones"
          cornerLabel="Activo"
          columns={tickers}
          rows={matrixRows(tickers, estadisticas.matriz_correlaciones, correlacionCell)}
        />
      </Paso>

      <Paso
        title="Matriz de varianzas-covarianzas"
        explanation="Covarianza de las rentabilidades de cada par; la diagonal es la varianza de cada activo."
      >
        <DetalleTable
          label="Matriz de varianzas-covarianzas"
          cornerLabel="Activo"
          columns={tickers}
          rows={matrixRows(tickers, matriz_covarianzas, value => ({ content: formatNum(value, 6) }))}
        />
      </Paso>

      <Paso
        title="Valor actual por posición"
        explanation="Valor de mercado de cada posición en EUR; su parte del total es el peso de la cartera actual."
      >
        <DetalleTable
          label="Valor actual por posición"
          cornerLabel="Activo"
          columns={['Valor actual', 'Peso']}
          rows={[
            ...tickers.map(ticker => ({
              key: ticker,
              label: ticker,
              cells: [
                { content: eur(cartera_actual.valores_eur[ticker] ?? 0) },
                { content: formatPeso(pesos[ticker] ?? 0) },
              ],
            })),
            {
              key: 'total',
              label: 'Total',
              cells: [
                { content: eur(totalEur), style: { fontWeight: 600 } },
                { content: formatPeso(totalPeso), style: { fontWeight: 600 } },
              ],
            },
          ]}
        />
      </Paso>
    </section>
  )
}
