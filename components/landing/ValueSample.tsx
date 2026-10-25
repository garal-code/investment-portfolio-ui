'use client'
import { useState } from 'react'
import { SegmentedControl, type SegmentedControlOption } from '@/components/ui/SegmentedControl'
import { PERIODO_DESCRIPCION, type PeriodoSeleccionado } from '@/components/dashboard/ValueBlock'
import { formatEur, formatEurSigned, formatPct } from '@/lib/utils'
import { SAMPLE_INVERTIDO, SAMPLE_PERIODS, SAMPLE_PLUSVALIA_REALIZADA, SAMPLE_TOTAL } from './sample-portfolio'

const OPTIONS: SegmentedControlOption<PeriodoSeleccionado>[] = [
  { value: '1m', label: '1M' },
  { value: '3m', label: '3M' },
  { value: '6m', label: '6M' },
  { value: 'ytd', label: 'YTD' },
  { value: '1y', label: '1A' },
  { value: 'total', label: 'Total' },
]

// The dashboard's value block, fed with the sample portfolio. Amounts are
// sample data, so privacy mode does not apply here.
export function ValueSample() {
  const [periodo, setPeriodo] = useState<PeriodoSeleccionado>('ytd')
  const { plus, pct } = SAMPLE_PERIODS[periodo]
  const negativo = formatPct(pct).startsWith('−')
  const color = negativo ? '#8a3a6a' : '#2D6A5A'

  return (
    <div data-ui className="lp-ui lp-value">
      <div className="lp-value__main">
        <p className="lp-ui__label">Valor de la cartera</p>
        <p className="font-serif lp-value__total">{formatEur(SAMPLE_TOTAL)}</p>
        <p className="lp-value__gain" aria-live="polite">
          <span style={{ color, fontWeight: 700, fontSize: 18 }}>{formatEurSigned(plus)}</span>
          <span
            className="lp-value__pill"
            style={{ color, background: negativo ? '#f6ebf1' : '#eaf2ee' }}
          >
            {formatPct(pct)}
          </span>
          <span className="font-lora italic lp-value__sub">{PERIODO_DESCRIPCION[periodo]}</span>
        </p>
      </div>
      <div className="lp-value__side">
        <SegmentedControl options={OPTIONS} value={periodo} onChange={setPeriodo} aria-label="Periodo" />
        <dl className="lp-value__metrics">
          <div>
            <dt>Invertido</dt>
            <dd>{formatEur(SAMPLE_INVERTIDO)}</dd>
          </div>
          <div>
            <dt>Plusvalía realizada</dt>
            <dd>{formatEur(SAMPLE_PLUSVALIA_REALIZADA)}</dd>
          </div>
        </dl>
      </div>
    </div>
  )
}
