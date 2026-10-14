'use client'
import { usePreferences } from '@/lib/preferences'
import {
  CLAVE_CARTERA, claveSerie, colorActivo, colorCorrelacion, colorSecuencial, estadisticasRows,
  posicionesRows, preciosBase100Rows, rangoMatriz, rentabilidadesRows,
} from '@/lib/detalle-calculo'
import { formatEur, formatMes, formatNum, formatPeso, formatRatioPct, maskAmount } from '@/lib/utils'
import { EstadisticasBarChart } from '@/components/charts/detalle/EstadisticasBarChart'
import { Heatmap } from '@/components/charts/detalle/Heatmap'
import { PosicionesBarChart } from '@/components/charts/detalle/PosicionesBarChart'
import { SeriesLineChart, type SerieLinea } from '@/components/charts/detalle/SeriesLineChart'
import { DetalleTable, type DetalleCell, type DetalleRow } from './DetalleTable'
import { Paso } from './detalle/Paso'
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
const formatAxisBase100 = (value: number) => formatNum(value, 0)
const formatAxisPct = (value: number) => `${formatNum(value, 1)} %`

export function DetalleCalculo({ frontera }: DetalleCalculoProps) {
  const { privacy } = usePreferences()
  const { tickers, rentabilidades_esperadas, matriz_covarianzas, detalle } = frontera
  const { datos, estadisticas, cartera_actual } = detalle
  const pesos = frontera.cartera_actual.pesos

  const eur = (value: number) => (privacy ? maskAmount('EUR') : formatEur(value))
  const totalEur = tickers.reduce((sum, ticker) => sum + (cartera_actual.valores_eur[ticker] ?? 0), 0)
  const totalPeso = tickers.reduce((sum, ticker) => sum + (pesos[ticker] ?? 0), 0)

  const seriesActivos: SerieLinea[] = tickers.map((ticker, i) => ({
    dataKey: claveSerie(i),
    label: ticker,
    color: colorActivo(i),
  }))
  const serieCartera: SerieLinea = { dataKey: CLAVE_CARTERA, label: 'Cartera actual', color: '#221e1a', destacada: true }
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
          Los pasos de la hoja de Markowitz, de los precios a la matriz de covarianzas. Cifras mensuales.
        </p>
      </div>

      <Paso
        title="Precios mensuales"
        explanation="Cierre ajustado de cada mes en la moneda de cotización del activo. El gráfico usa base 100: cada activo parte de 100 en el primer mes, así se comparan sus evoluciones aunque coticen a precios muy distintos."
        chart={
          <SeriesLineChart
            ariaLabel="Gráfico de líneas de precios mensuales en base 100"
            data={preciosBase100Rows(datos.fechas_precios, datos.precios)}
            series={seriesActivos}
            formatValue={formatAxisBase100}
          />
        }
        table={
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
        }
      />

      <Paso
        title="Rentabilidades mensuales"
        explanation="Rentabilidad simple: cierre del mes / cierre del mes anterior − 1. La cartera actual pondera cada activo por su peso actual."
        chart={
          <SeriesLineChart
            ariaLabel="Gráfico de líneas de rentabilidades mensuales por activo y de la cartera actual"
            data={rentabilidadesRows(datos.fechas, datos.rentabilidades, cartera_actual.rentabilidades)}
            series={[...seriesActivos, serieCartera]}
            formatValue={formatAxisPct}
          />
        }
        table={
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
        }
      />

      <Paso
        title="Estadísticas por activo"
        explanation="Rentabilidad esperada: media de las rentabilidades mensuales; volatilidad: raíz cuadrada de la varianza."
        chart={<EstadisticasBarChart data={estadisticasRows(tickers, rentabilidades_esperadas, estadisticas.volatilidades)} />}
        table={
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
        }
      />

      <Paso
        title="Matriz de correlaciones"
        explanation="Covarianza de cada par dividida por el producto de sus volatilidades: de −1 (ciruela) a 1 (verde)."
        chart={
          <Heatmap
            ariaLabel="Mapa de calor de la matriz de correlaciones"
            tickers={tickers}
            matrix={estadisticas.matriz_correlaciones}
            formatValue={value => formatNum(Math.max(-1, Math.min(1, value)), 2)}
            colorFor={colorCorrelacion}
          />
        }
        table={
          <DetalleTable
            label="Matriz de correlaciones"
            cornerLabel="Activo"
            columns={tickers}
            rows={matrixRows(tickers, estadisticas.matriz_correlaciones, correlacionCell)}
          />
        }
      />

      <Paso
        title="Matriz de varianzas-covarianzas"
        explanation="Covarianza de las rentabilidades de cada par; la diagonal es la varianza de cada activo. Cuanto más intenso el verde, mayor el valor."
        chart={
          <Heatmap
            ariaLabel="Mapa de calor de la matriz de varianzas-covarianzas"
            tickers={tickers}
            matrix={matriz_covarianzas}
            formatValue={formatCovarianza}
            colorFor={value => colorSecuencial(value, rangoCovarianzas.min, rangoCovarianzas.max)}
          />
        }
        table={
          <DetalleTable
            label="Matriz de varianzas-covarianzas"
            cornerLabel="Activo"
            columns={tickers}
            rows={matrixRows(tickers, matriz_covarianzas, value => ({ content: formatCovarianza(value) }))}
          />
        }
      />

      <Paso
        title="Valor actual por posición"
        explanation="Valor de mercado de cada posición en EUR; su parte del total es el peso de la cartera actual."
        chart={<PosicionesBarChart data={posicionesRows(tickers, cartera_actual.valores_eur, pesos)} formatEur={eur} />}
        table={
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
        }
      />
    </section>
  )
}
