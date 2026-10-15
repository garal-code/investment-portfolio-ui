'use client'
import { useId, useState, type ReactNode } from 'react'
import { ChevronRight } from 'lucide-react'

interface SeccionProps {
  title: string
  explanation: string
  defaultOpen?: boolean
  // Mounted only while open: price and return series grow with the horizon
  // (10 years = 120 rows per ticker) and most visits never expand them.
  children: ReactNode
}

// Collapsible block of the calculation detail. The toggle lives inside the
// heading (disclosure pattern), so its accessible name is the title.
export function Seccion({ title, explanation, defaultOpen = false, children }: SeccionProps) {
  const [open, setOpen] = useState(defaultOpen)
  const headingId = useId()
  const bodyId = useId()

  return (
    <section aria-labelledby={headingId} className="flex min-w-0 flex-col gap-3 py-4" style={{ borderTop: '1px solid #ece7e1' }}>
      <div className="flex flex-col gap-0.5">
        <h3 id={headingId} style={{ fontSize: 15, fontWeight: 600 }}>
          <button
            type="button"
            aria-expanded={open}
            aria-controls={bodyId}
            onClick={() => setOpen(value => !value)}
            className="flex cursor-pointer items-center gap-1.5 text-left"
          >
            <ChevronRight
              aria-hidden
              size={16}
              className="shrink-0 transition-transform"
              style={{ color: 'var(--color-muted)', transform: open ? 'rotate(90deg)' : undefined }}
            />
            {title}
          </button>
        </h3>
        <p style={{ fontSize: 12, color: 'var(--color-muted)', paddingLeft: 22 }}>{explanation}</p>
      </div>
      <div id={bodyId} className="min-w-0">
        {open && children}
      </div>
    </section>
  )
}

// "Ver datos" toggle that reveals a matrix's source table under its heatmap.
export function VerDatos({ title, children }: { title: string; children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const tableId = useId()

  return (
    <div className="mt-3 flex flex-col gap-2">
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
      <div id={tableId}>{open && children}</div>
    </div>
  )
}
