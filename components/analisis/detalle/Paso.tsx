'use client'
import { useId, useState, type ReactNode } from 'react'
import { ChevronRight } from 'lucide-react'

interface PasoProps {
  title: string
  explanation: string
  chart: ReactNode
  // Rendered only while "Ver datos" is open: price and return series grow with
  // the horizon (10 years = 120 rows per ticker).
  table: ReactNode
}

// One calculation step: title and explanation, the chart always visible, and
// the source table behind a "Ver datos" toggle.
export function Paso({ title, explanation, chart, table }: PasoProps) {
  const [open, setOpen] = useState(false)
  const headingId = useId()
  const tableId = useId()

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-3 py-4" style={{ borderTop: '1px solid #ece7e1' }}>
      <div className="flex flex-col gap-0.5">
        <h3 id={headingId} style={{ fontSize: 15, fontWeight: 600 }}>{title}</h3>
        <p style={{ fontSize: 12, color: 'var(--color-muted)' }}>{explanation}</p>
      </div>
      {chart}
      <div className="flex flex-col gap-2">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={tableId}
          aria-label={`${open ? 'Ocultar' : 'Ver'} datos de ${title}`}
          onClick={() => setOpen(value => !value)}
          className="flex w-fit cursor-pointer items-center gap-1 rounded-md px-1 py-0.5 text-[12px] font-medium"
          style={{ color: 'var(--color-primary)' }}
        >
          <ChevronRight
            aria-hidden
            size={14}
            className="transition-transform"
            style={{ transform: open ? 'rotate(90deg)' : undefined }}
          />
          {open ? 'Ocultar datos' : 'Ver datos'}
        </button>
        <div id={tableId}>{open && table}</div>
      </div>
    </section>
  )
}
