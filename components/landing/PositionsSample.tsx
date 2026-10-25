'use client'
import { useState } from 'react'
import { PositionRow } from '@/components/ui/PositionRow'
import { groupPositions } from '@/lib/portfolio-calc'
import { treemapColor } from '@/lib/utils'
import { SAMPLE_POSITIONS } from './sample-portfolio'

// Three rows of the dashboard's positions table: a foreign-currency stock,
// a fund at a loss and a local stock, so both colours and both units show.
const SHOWN = ['US5949181045', 'IE00B18GC888', 'ES0113900J37']

export function PositionsSample() {
  const [open, setOpen] = useState<string | null>(null)
  const order = groupPositions(SAMPLE_POSITIONS, 'posicion').map(g => g.key)
  const rows = SHOWN.map(isin => SAMPLE_POSITIONS.find(p => p.isin === isin)!)

  return (
    <div data-ui className="lp-ui lp-positions">
      <div className="lp-positions__head" aria-hidden="true">
        <span>Instrumento</span>
        <span>Precio · Cantidad</span>
        <span>Valor</span>
        <span>Rentabilidad</span>
        <span />
      </div>
      {rows.map(p => (
        <PositionRow
          key={p.isin}
          position={p}
          color={treemapColor(order.indexOf(p.isin)).bg}
          open={open === p.isin}
          onToggle={() => setOpen(prev => (prev === p.isin ? null : p.isin))}
          onHover={() => {}}
          active
        />
      ))}
    </div>
  )
}
