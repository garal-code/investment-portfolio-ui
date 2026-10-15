'use client'
import { useId } from 'react'
import {
  CartesianGrid, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis, ZAxis,
} from 'recharts'
import { INITIAL_DIMENSION } from './initialDimension'
import { formatNum, formatPct, formatPeso, formatRatioPct } from '@/lib/utils'
import type { PuntoCartera } from '@/types'

export type SerieFrontera = 'frontera' | 'minima' | 'actual' | 'elegido'

export interface FronteraChartPoint {
  volatilidad: number   // monthly, in %
  rentabilidad: number  // monthly, in %
  serie: SerieFrontera
  punto: PuntoCartera
}

const SERIES: Record<SerieFrontera, { label: string; tooltip: string; color: string }> = {
  frontera: { label: 'Frontera eficiente', tooltip: 'Cartera de la frontera', color: '#2D6A5A' },
  minima: { label: 'Mínima varianza', tooltip: 'Mínima varianza', color: '#c4956a' },
  actual: { label: 'Cartera actual', tooltip: 'Cartera actual', color: '#8a3a6a' },
  elegido: { label: 'Punto elegido', tooltip: 'Punto elegido', color: '#221e1a' },
}

// Five-pointed star, matching recharts' `star` symbol in the HTML legend.
const STAR_CLIP_PATH =
  'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'

export function toChartPoint(punto: PuntoCartera, serie: SerieFrontera): FronteraChartPoint {
  return {
    volatilidad: punto.volatilidad * 100,
    rentabilidad: punto.rentabilidad * 100,
    serie,
    punto,
  }
}

interface FronteraTooltipProps {
  active?: boolean
  payload?: ReadonlyArray<{ payload?: FronteraChartPoint }>
  tickers: string[]
}

export function FronteraTooltip({ active, payload, tickers }: FronteraTooltipProps) {
  const point = payload?.[0]?.payload
  if (!active || !point) return null
  const { punto, serie } = point

  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #ece7e1',
        borderRadius: 8,
        boxShadow: '0 2px 8px rgba(0,0,0,.06)',
        padding: '10px 12px',
        fontSize: 12,
        minWidth: 170,
      }}
    >
      <p style={{ fontWeight: 700, color: SERIES[serie].color, marginBottom: 6 }}>{SERIES[serie].tooltip}</p>
      <dl style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '2px 12px', color: '#221e1a' }}>
        <dt style={{ color: '#a09080' }}>Rentabilidad</dt>
        <dd style={{ textAlign: 'right', fontWeight: 500 }}>{formatPct(punto.rentabilidad * 100)}</dd>
        <dt style={{ color: '#a09080' }}>Volatilidad</dt>
        <dd style={{ textAlign: 'right', fontWeight: 500 }}>{formatRatioPct(punto.volatilidad)}</dd>
      </dl>
      <dl
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          gap: '2px 12px',
          marginTop: 6,
          paddingTop: 6,
          borderTop: '1px solid #f5f0eb',
          color: '#6a5a4a',
        }}
      >
        {tickers.map(ticker => (
          <div key={ticker} style={{ display: 'contents' }}>
            <dt>{ticker}</dt>
            <dd style={{ textAlign: 'right' }}>{formatPeso(punto.pesos[ticker] ?? 0)}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

const axisTick = { fill: '#a09080', fontSize: 11 }
const axisLabel = { fill: '#a09080', fontSize: 11 }
const formatAxisPct = (value: number) => `${formatNum(value, 1)} %`

interface FronteraChartProps {
  frontera: PuntoCartera[]
  minimaVarianza: PuntoCartera
  actual: PuntoCartera
  tickers: string[]
  // Index into `frontera` of the chosen target portfolio. Selection (click on
  // a frontier point, "Riesgo objetivo" slider, highlighted marker) is only
  // enabled when `onSelect` is provided.
  selectedIndex?: number | null
  onSelect?: (index: number) => void
}

// Risk/return plane: X = monthly volatility, Y = expected monthly return,
// both in %. The frontier is drawn as a joint line through its points, with
// the min-variance and current portfolios as distinct markers on top.
export function FronteraChart({
  frontera, minimaVarianza, actual, tickers, selectedIndex, onSelect,
}: FronteraChartProps) {
  const sliderId = useId()
  const fronteraData = frontera.map(p => toChartPoint(p, 'frontera'))
  const minimaData = [toChartPoint(minimaVarianza, 'minima')]
  const actualData = [toChartPoint(actual, 'actual')]
  const elegido = onSelect && selectedIndex != null ? frontera[selectedIndex] : undefined
  const elegidoText = elegido
    ? `Volatilidad mensual ${formatRatioPct(elegido.volatilidad)}, rentabilidad ${formatPct(elegido.rentabilidad * 100)}`
    : ''
  const series = (Object.keys(SERIES) as SerieFrontera[]).filter(serie => serie !== 'elegido' || elegido)

  return (
    <div className="flex flex-col gap-3">
      <div className="h-[260px] md:h-[340px]" role="img" aria-label="Gráfico de riesgo y rentabilidad mensual">
        <ResponsiveContainer width="100%" height="100%" initialDimension={INITIAL_DIMENSION}>
          <ScatterChart margin={{ top: 8, right: 16, bottom: 24, left: 8 }}>
            <CartesianGrid stroke="#f5f0eb" />
            <XAxis
              type="number"
              dataKey="volatilidad"
              name="Volatilidad"
              domain={['auto', 'auto']}
              tickFormatter={formatAxisPct}
              tick={axisTick}
              stroke="#ece7e1"
              label={{ value: 'Volatilidad mensual (%)', position: 'insideBottom', offset: -16, ...axisLabel }}
            />
            <YAxis
              type="number"
              dataKey="rentabilidad"
              name="Rentabilidad"
              domain={['auto', 'auto']}
              tickFormatter={formatAxisPct}
              tick={axisTick}
              stroke="#ece7e1"
              width={64}
              label={{ value: 'Rentabilidad mensual (%)', angle: -90, position: 'insideLeft', dy: 70, ...axisLabel }}
            />
            <ZAxis range={[36, 36]} />
            <ZAxis zAxisId="marker" range={[150, 150]} />
            <ZAxis zAxisId="elegido" range={[300, 300]} />
            <Tooltip
              cursor={{ strokeDasharray: '3 3', stroke: '#a09080' }}
              content={props => <FronteraTooltip active={props.active} payload={props.payload} tickers={tickers} />}
            />
            <Scatter
              name={SERIES.frontera.label}
              data={fronteraData}
              fill={SERIES.frontera.color}
              line={{ stroke: SERIES.frontera.color, strokeWidth: 2 }}
              lineType="joint"
              className="frontera-puntos"
              cursor={onSelect ? 'pointer' : undefined}
              onClick={onSelect ? (_, index) => onSelect(index) : undefined}
              isAnimationActive={false}
            />
            <Scatter
              name={SERIES.minima.label}
              data={minimaData}
              zAxisId="marker"
              fill={SERIES.minima.color}
              shape="diamond"
              isAnimationActive={false}
            />
            <Scatter
              name={SERIES.actual.label}
              data={actualData}
              zAxisId="marker"
              fill={SERIES.actual.color}
              shape="circle"
              isAnimationActive={false}
            />
            {elegido && (
              <Scatter
                name={SERIES.elegido.label}
                data={[toChartPoint(elegido, 'elegido')]}
                zAxisId="elegido"
                fill={SERIES.elegido.color}
                shape="star"
                className="frontera-elegido"
                isAnimationActive={false}
              />
            )}
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {elegido && selectedIndex != null && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[13px]">
          <label htmlFor={sliderId} className="font-medium">Riesgo objetivo</label>
          <input
            id={sliderId}
            type="range"
            min={0}
            max={frontera.length - 1}
            step={1}
            value={selectedIndex}
            onChange={event => onSelect?.(Number(event.target.value))}
            aria-valuetext={elegidoText}
            className="min-w-[160px] flex-1"
            style={{ accentColor: 'var(--color-primary)', cursor: 'pointer' }}
          />
          <output htmlFor={sliderId} className="tabular-nums" style={{ fontSize: 12, color: '#6a5a4a' }}>
            {elegidoText}
          </output>
          {/* frontera[0] is the minimum-variance portfolio */}
          <button
            type="button"
            onClick={() => onSelect?.(0)}
            className="rounded-md px-2.5 py-1 text-[12px] font-semibold"
            style={{ border: '1px solid var(--color-border)', color: 'var(--color-primary)', cursor: 'pointer' }}
          >
            Mínima varianza
          </button>
        </div>
      )}

      <ul aria-label="Leyenda" className="flex flex-wrap gap-x-5 gap-y-1.5 text-[12px]" style={{ color: '#6a5a4a' }}>
        {series.map(serie => (
          <li key={serie} className="flex items-center gap-2">
            <span
              aria-hidden="true"
              style={{
                width: serie === 'frontera' ? 16 : serie === 'elegido' ? 12 : 9,
                height: serie === 'frontera' ? 2 : serie === 'elegido' ? 12 : 9,
                background: SERIES[serie].color,
                borderRadius: serie === 'actual' ? '50%' : 1,
                transform: serie === 'minima' ? 'rotate(45deg)' : undefined,
                clipPath: serie === 'elegido' ? STAR_CLIP_PATH : undefined,
              }}
            />
            {SERIES[serie].label}
          </li>
        ))}
      </ul>
    </div>
  )
}
