'use client'
import { colorCorrelacion, colorSecuencial, rangoMatriz } from '@/lib/detalle-calculo'
import { formatMes, formatNum, formatRatioPct } from '@/lib/utils'
import { Heatmap } from '@/components/charts/detalle/Heatmap'
import { DetalleTable, type DetalleCell, type DetalleRow } from './DetalleTable'
import { Seccion, VerDatos } from './detalle/Seccion'
import type { FronteraEficiente } from '@/types'

interface DetalleCalculoProps {
  frontera: FronteraEficiente
}

// Signed percentage cell; negatives use the loss colour, decided on the
// displayed (rounded) value so "0,00 %" is never coloured.
function pctCell(value: number): DetalleCell {
  const text = formatRatioPct(value)
  return { content: text, className: text.startsWith('−') ? 'rent-neg' : undefined }
}

function correlacionCell(value: number): DetalleCell {
  return {
    content: formatNum(Math.max(-1, Math.min(1, value)), 2),
    style: { background: colorCorrelacion(value), color: 'var(--color-ink)' },
  }
}

function matrixRows(tickers: string[], matrix: number[][], cell: (value: number) => DetalleCell): DetalleRow[] {
  return tickers.map((ticker, i) => ({ key: ticker, label: ticker, cells: matrix[i].map(cell) }))
}

const formatCovarianza = (value: number) => formatNum(value, 6)

// Matrices first and expanded; the raw monthly prices and returns below, side
// by side and collapsed.
export function DetalleCalculo({ frontera }: DetalleCalculoProps) {
  const { tickers, matriz_covarianzas, detalle } = frontera
  const { datos, estadisticas, cartera_actual } = detalle
  const rangoCovarianzas = rangoMatriz(matriz_covarianzas)

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
          Las matrices de la hoja de Markowitz y los datos mensuales de los que salen. Cifras mensuales.
        </p>
      </div>

      <Seccion
        title="Matriz de correlaciones"
        explanation="Covarianza de cada par dividida por el producto de sus volatilidades: de −1 (ciruela) a 1 (verde)."
        defaultOpen
      >
        <Heatmap
          ariaLabel="Mapa de calor de la matriz de correlaciones"
          tickers={tickers}
          matrix={estadisticas.matriz_correlaciones}
          formatValue={value => formatNum(Math.max(-1, Math.min(1, value)), 2)}
          colorFor={colorCorrelacion}
        />
        <VerDatos title="Matriz de correlaciones">
          <DetalleTable
            label="Matriz de correlaciones"
            cornerLabel="Activo"
            columns={tickers}
            rows={matrixRows(tickers, estadisticas.matriz_correlaciones, correlacionCell)}
          />
        </VerDatos>
      </Seccion>

      <Seccion
        title="Matriz de varianzas-covarianzas"
        explanation="Covarianza de las rentabilidades de cada par; la diagonal es la varianza de cada activo. Cuanto más intenso el verde, mayor el valor."
        defaultOpen
      >
        <Heatmap
          ariaLabel="Mapa de calor de la matriz de varianzas-covarianzas"
          tickers={tickers}
          matrix={matriz_covarianzas}
          formatValue={formatCovarianza}
          colorFor={value => colorSecuencial(value, rangoCovarianzas.min, rangoCovarianzas.max)}
        />
        <VerDatos title="Matriz de varianzas-covarianzas">
          <DetalleTable
            label="Matriz de varianzas-covarianzas"
            cornerLabel="Activo"
            columns={tickers}
            rows={matrixRows(tickers, matriz_covarianzas, value => ({ content: formatCovarianza(value) }))}
          />
        </VerDatos>
      </Seccion>

      <div className="grid gap-x-6 lg:grid-cols-2">
        <Seccion
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
        </Seccion>
        <Seccion
          title="Rentabilidades mensuales"
          explanation="Cierre del mes / cierre del mes anterior − 1. La cartera actual pondera cada activo por su peso actual."
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
        </Seccion>
      </div>
    </section>
  )
}
