import type { CSSProperties } from 'react'
import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react'
import type { ColumnaOrden, OrdenMovimientos } from '@/lib/movimientos-orden'

export const COLUMNAS_MOVIMIENTOS: { label: string; orden: ColumnaOrden | null }[] = [
  { label: 'Instrumento', orden: 'instrumento' },
  { label: 'Tipo', orden: 'tipo' },
  { label: 'Fecha', orden: 'fecha' },
  { label: 'Cantidad', orden: 'cantidad' },
  { label: 'Precio', orden: 'precio' },
  { label: 'Comisión', orden: 'comision' },
  { label: '', orden: null },
]

interface CabeceraOrdenableProps {
  label: string
  // null for a column that cannot be sorted (row actions)
  columna: ColumnaOrden | null
  orden: OrdenMovimientos
  onOrdenar: (columna: ColumnaOrden) => void
  style: CSSProperties
}

// Header cell that sorts its column on click: an arrow on the sorted column,
// a faint up-down mark on the others.
export function CabeceraOrdenable({ label, columna, orden, onOrdenar, style }: CabeceraOrdenableProps) {
  if (columna === null) return <th style={style}>{label}</th>
  const activa = orden.columna === columna
  const Icono = !activa ? ChevronsUpDown : orden.direccion === 'asc' ? ArrowUp : ArrowDown
  return (
    <th
      aria-sort={activa ? (orden.direccion === 'asc' ? 'ascending' : 'descending') : 'none'}
      style={style}
    >
      <button
        type="button"
        onClick={() => onOrdenar(columna)}
        className="inline-flex items-center gap-1 uppercase transition-colors hover:text-[var(--color-ink)]"
        style={{ color: activa ? 'var(--color-ink)' : undefined }}
      >
        {label}
        <Icono size={11} aria-hidden style={{ opacity: activa ? 1 : 0.5 }} />
      </button>
    </th>
  )
}
