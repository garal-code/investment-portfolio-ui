'use client'
import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { INITIAL_DIMENSION } from '../initialDimension'
import { formatPeso } from '@/lib/utils'
import type { PosicionRow } from '@/lib/detalle-calculo'
import { axisTick, tooltipStyle } from './Leyenda'

interface PosicionesBarChartProps {
  data: PosicionRow[]
  // Already privacy-aware: masks the amount when privacy mode is on.
  formatEur: (value: number) => string
}

// Horizontal bars: length = EUR value of the position, label = value · weight.
export function PosicionesBarChart({ data, formatEur }: PosicionesBarChartProps) {
  const max = Math.max(...data.map(row => row.valor), 0)
  const label = (row: PosicionRow) => `${formatEur(row.valor)} · ${formatPeso(row.peso)}`
  const rows = data.map(row => ({ ...row, etiqueta: label(row) }))

  return (
    <div
      className="min-w-0"
      style={{ height: Math.max(120, data.length * 44 + 16) }}
      role="img"
      aria-label="Gráfico de barras horizontales del valor actual de cada posición"
    >
      <ResponsiveContainer width="100%" height="100%" initialDimension={INITIAL_DIMENSION} minWidth={0}>
        <BarChart data={rows} layout="vertical" margin={{ top: 4, right: 16, bottom: 4, left: 8 }}>
          {/* Headroom on the right so the value labels fit outside the bar. */}
          <XAxis type="number" hide domain={[0, max * 1.6 || 1]} />
          <YAxis type="category" dataKey="ticker" tick={axisTick} stroke="#ece7e1" width={72} />
          <Tooltip
            {...tooltipStyle}
            cursor={{ fill: '#f5f0eb' }}
            formatter={(_, __, item) => [item.payload.etiqueta, 'Posición']}
          />
          <Bar dataKey="valor" radius={[0, 3, 3, 0]} isAnimationActive={false}>
            {rows.map(row => <Cell key={row.ticker} fill={row.color} />)}
            <LabelList dataKey="etiqueta" position="right" fill="#221e1a" fontSize={12} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
