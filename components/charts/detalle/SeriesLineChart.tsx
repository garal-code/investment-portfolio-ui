'use client'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { INITIAL_DIMENSION } from '../initialDimension'
import { formatMes } from '@/lib/utils'
import type { SerieRow } from '@/lib/detalle-calculo'
import { axisTick, Leyenda, tooltipStyle } from './Leyenda'

export interface SerieLinea {
  // Key of the value inside each row (see `claveSerie`).
  dataKey: string
  label: string
  color: string
  // Emphasised dashed line, used for the current portfolio.
  destacada?: boolean
}

interface SeriesLineChartProps {
  ariaLabel: string
  data: SerieRow[]
  series: SerieLinea[]
  formatValue: (value: number) => string
}

// Multi-line chart over months. The container has an explicit height and
// `min-w-0` so ResponsiveContainer never measures a -1 size inside a flex/grid
// parent.
export function SeriesLineChart({ ariaLabel, data, series, formatValue }: SeriesLineChartProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="h-[240px] md:h-[300px] min-w-0" role="img" aria-label={ariaLabel}>
        <ResponsiveContainer width="100%" height="100%" initialDimension={INITIAL_DIMENSION} minWidth={0}>
          <LineChart data={data} margin={{ top: 8, right: 16, bottom: 4, left: 8 }}>
            <CartesianGrid stroke="#f5f0eb" />
            <XAxis
              dataKey="fecha"
              tickFormatter={formatMes}
              tick={axisTick}
              stroke="#ece7e1"
              minTickGap={32}
            />
            <YAxis tickFormatter={formatValue} tick={axisTick} stroke="#ece7e1" width={64} domain={['auto', 'auto']} />
            <Tooltip
              {...tooltipStyle}
              labelFormatter={label => formatMes(String(label))}
              formatter={(value, name) => [typeof value === 'number' ? formatValue(value) : value, name]}
            />
            {series.map(serie => (
              <Line
                key={serie.dataKey}
                type="linear"
                dataKey={serie.dataKey}
                name={serie.label}
                stroke={serie.color}
                strokeWidth={serie.destacada ? 2.5 : 1.75}
                strokeDasharray={serie.destacada ? '5 4' : undefined}
                dot={false}
                connectNulls
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <Leyenda items={series.map(({ label, color, destacada }) => ({ label, color, dashed: destacada }))} />
    </div>
  )
}
