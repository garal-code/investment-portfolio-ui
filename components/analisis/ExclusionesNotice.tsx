import { TriangleAlert } from 'lucide-react'
import { formatPeso } from '@/lib/utils'
import type { ActivoExcluido, MotivoExclusion } from '@/types'

export const MOTIVO_EXCLUSION_LABEL: Record<MotivoExclusion, string> = {
  sin_ticker: 'sin ticker',
  sin_precio_actual: 'sin precio actual',
  sin_tipo_cambio: 'sin tipo de cambio',
  sin_historico: 'sin histórico de precios',
  historico_insuficiente: 'histórico insuficiente (< 12 meses)',
}

interface ExclusionesNoticeProps {
  excluidos: ActivoExcluido[]
  pesoExcluido: number
}

export function ExclusionesNotice({ excluidos, pesoExcluido }: ExclusionesNoticeProps) {
  if (excluidos.length === 0) return null

  return (
    <section
      aria-labelledby="exclusiones-title"
      className="flex gap-3"
      style={{
        background: '#fdf6ee',
        border: '1px solid rgba(196,149,106,.35)',
        borderRadius: 14,
        padding: '16px 20px',
      }}
    >
      <TriangleAlert size={16} className="shrink-0 mt-0.5" style={{ color: 'var(--color-amber)' }} aria-hidden="true" />
      <div className="min-w-0 flex flex-col gap-1.5">
        <h2 id="exclusiones-title" className="text-[13px] font-bold" style={{ color: 'var(--color-ink)' }}>
          Activos excluidos del cálculo
        </h2>
        <p className="text-[12px]" style={{ color: 'var(--color-ink-2)' }}>
          Representan el {formatPeso(pesoExcluido)} del valor de la cartera, que queda fuera del análisis.
        </p>
        <ul className="flex flex-col gap-0.5 text-[12px]" style={{ color: 'var(--color-ink-2)' }}>
          {excluidos.map(({ ticker, motivo }) => (
            <li key={ticker}>
              <span className="font-medium" style={{ color: 'var(--color-ink)' }}>{ticker}</span>
              {' — '}
              {MOTIVO_EXCLUSION_LABEL[motivo] ?? motivo}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
