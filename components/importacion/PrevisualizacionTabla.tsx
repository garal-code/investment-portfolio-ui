'use client'
import { useState } from 'react'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { formatEur, formatFecha } from '@/lib/utils'
import type { FilaImportacion, PrevisualizacionImportacion } from '@/types'

type Filtro = 'todas' | 'importar' | 'omitir'

// Prices stay in the quote currency (unknown here), so no currency symbol
const cantidad = new Intl.NumberFormat('es-ES', { maximumFractionDigits: 6 })
const precio = new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 6 })

function formatNumero(value: number | null, formato: Intl.NumberFormat): string {
  return value == null ? '—' : formato.format(value)
}

const COLUMNAS: { label: string; numerica?: boolean }[] = [
  { label: 'Línea', numerica: true },
  { label: 'Estado' },
  { label: 'Fecha' },
  { label: 'Operación' },
  { label: 'Instrumento' },
  { label: 'Cantidad', numerica: true },
  { label: 'Precio', numerica: true },
  { label: 'Comisión', numerica: true },
  { label: 'Motivo' },
]

function Estado({ fila }: { fila: FilaImportacion }) {
  const importa = fila.estado === 'importar'
  return (
    <span
      className="inline-block whitespace-nowrap text-[11px] font-medium px-2 py-0.5 rounded"
      style={
        importa
          ? { background: '#eaf2ee', color: 'var(--color-primary)' }
          : { background: '#fdf6ee', color: 'var(--color-ink-2)' }
      }
    >
      {importa ? 'Se importa' : 'Se omite'}
    </span>
  )
}

export function PrevisualizacionTabla({ previsualizacion }: { previsualizacion: PrevisualizacionImportacion }) {
  const [filtro, setFiltro] = useState<Filtro>('todas')
  const { resumen } = previsualizacion
  const filas = previsualizacion.filas.filter(f => filtro === 'todas' || f.estado === filtro)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <p className="text-[13px]" style={{ color: 'var(--color-ink-2)' }}>
          <span className="font-serif text-[20px] font-bold tabular-nums" style={{ color: 'var(--color-ink)' }}>
            {resumen.importar}
          </span>{' '}
          de {resumen.total} {resumen.total === 1 ? 'fila se importará' : 'filas se importarán'}
        </p>
        <SegmentedControl<Filtro>
          options={[
            { value: 'todas', label: `Todas (${resumen.total})` },
            { value: 'importar', label: `Se importan (${resumen.importar})` },
            { value: 'omitir', label: `Se omiten (${resumen.omitir})` },
          ]}
          value={filtro}
          onChange={setFiltro}
          aria-label="Filtrar filas"
        />
      </div>

      <div className="rounded-[10px] border overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
        {/* As tall as the viewport allows, leaving room for the summary and the
            actions, so the header stays visible while scrolling many rows */}
        <div className="overflow-auto" style={{ maxHeight: 'max(320px, calc(100dvh - 200px))' }}>
          <table className="w-full text-[12px] border-collapse">
            <thead className="sticky top-0" style={{ background: 'var(--color-surface)' }}>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                {COLUMNAS.map(c => (
                  <th
                    key={c.label}
                    className="px-3 py-2.5 font-medium whitespace-nowrap"
                    style={{ color: 'var(--color-ink-2)', textAlign: c.numerica ? 'right' : 'left' }}
                  >
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filas.map(f => (
                <tr key={f.linea} style={{ borderBottom: '1px solid var(--color-border-2)' }}>
                  <td className="px-3 py-2 text-right tabular-nums" style={{ color: 'var(--color-ink-2)' }}>{f.linea}</td>
                  <td className="px-3 py-2"><Estado fila={f} /></td>
                  <td className="px-3 py-2 whitespace-nowrap tabular-nums" style={{ color: 'var(--color-ink-2)' }}>
                    {f.fecha ? formatFecha(f.fecha) : '—'}
                  </td>
                  <td className="px-3 py-2" style={{ color: 'var(--color-ink-2)' }}>{f.tipo ?? '—'}</td>
                  <td className="px-3 py-2 min-w-[160px]">
                    {f.isin ? (
                      <>
                        {f.nombre && (
                          <p className="font-medium truncate max-w-[220px]" style={{ color: 'var(--color-ink)' }}>{f.nombre}</p>
                        )}
                        <p className="text-[11px] font-mono" style={{ color: 'var(--color-ink-2)' }}>{f.isin}</p>
                      </>
                    ) : (
                      <span style={{ color: 'var(--color-ink-2)' }}>—</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums" style={{ color: 'var(--color-ink)' }}>{formatNumero(f.cantidad, cantidad)}</td>
                  <td className="px-3 py-2 text-right tabular-nums" style={{ color: 'var(--color-ink)' }}>{formatNumero(f.precio, precio)}</td>
                  <td className="px-3 py-2 text-right tabular-nums whitespace-nowrap" style={{ color: 'var(--color-ink-2)' }}>
                    {f.comision ? formatEur(f.comision) : '—'}
                  </td>
                  <td className="px-3 py-2 min-w-[200px]" style={{ color: f.motivo ? 'var(--color-ink)' : 'var(--color-ink-2)' }}>
                    {f.motivo ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
