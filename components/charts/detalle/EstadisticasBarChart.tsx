'use client'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { INITIAL_DIMENSION } from '../initialDimension'
import { formatNum, formatPct } from '@/lib/utils'
import type { EstadisticaRow } from '@/lib/detalle-calculo'
import { axisTick, Leyenda, tooltipStyle } from './Leyenda'

const RENTABILIDAD_COLOR = '#2D6A5A'
const VOLATILIDAD_COLOR = '#c4956a'

const formatAxisPct = (value: number) => `${formatNum(value, 1)} %`

// Expected monthly return and monthly volatility side by side per asset; both
// are monthly percentages, so they share one axis.
export function EstadisticasBarChart({ data }: { data: EstadisticaRow[] }) {
  return (
    <div className="flex flex-col gap-3">
      <div
        className="h-[240px] md:h-[280px] min-w-0"
        role="img"
        aria-label="Gráfico de barras de rentabilidad esperada y volatilidad mensual por activo"
      >
        <ResponsiveContainer width="100%" height="100%" initialDimension={INITIAL_DIMENSION} minWidth={0}>
          <BarChart data={data} margin={{ top: 8, right: 16, bottom: 4, left: 8 }}>
            <CartesianGrid stroke="#f5f0eb" vertical={false} />
            <XAxis dataKey="ticker" tick={axisTick} stroke="#ece7e1" />
            <YAxis tickFormatter={formatAxisPct} tick={axisTick} stroke="#ece7e1" width={64} />
            <Tooltip
              {...tooltipStyle}
              cursor={{ fill: '#f5f0eb' }}
              formatter={(value, name) => [typeof value === 'number' ? formatPct(value) : value, name]}
            />
            <Bar dataKey="rentabilidad" name="Rentabilidad esperada" fill={RENTABILIDAD_COLOR} radius={[3, 3, 0, 0]} isAnimationActive={false} />
            <Bar dataKey="volatilidad" name="Volatilidad" fill={VOLATILIDAD_COLOR} radius={[3, 3, 0, 0]} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <Leyenda
        items={[
          { label: 'Rentabilidad esperada', color: RENTABILIDAD_COLOR },
          { label: 'Volatilidad', color: VOLATILIDAD_COLOR },
        ]}
      />
    </div>
  )
}
