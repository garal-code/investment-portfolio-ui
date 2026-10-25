import type { Movimiento } from '@/types'

export type ColumnaOrden = 'instrumento' | 'tipo' | 'fecha' | 'cantidad' | 'precio' | 'comision'
export type DireccionOrden = 'asc' | 'desc'

export interface OrdenMovimientos {
  columna: ColumnaOrden
  direccion: DireccionOrden
}

// Same order the backend returns: newest first
export const ORDEN_INICIAL: OrdenMovimientos = { columna: 'fecha', direccion: 'desc' }

const nombres = new Intl.Collator('es', { sensitivity: 'base', numeric: true })

function comparar(a: Movimiento, b: Movimiento, columna: ColumnaOrden): number {
  switch (columna) {
    case 'instrumento':
      return nombres.compare(a.instrumento.nombre || a.instrumento.isin, b.instrumento.nombre || b.instrumento.isin)
    case 'tipo':
      return a.tipo.localeCompare(b.tipo)
    case 'fecha':
      return a.fecha.localeCompare(b.fecha)
    default:
      return a[columna] - b[columna]
  }
}

// Ties fall back to newest first (date, then id), so rows never jump around
// between clicks. Prices are compared as stored, in each instrument's currency.
export function ordenarMovimientos(movimientos: Movimiento[], orden: OrdenMovimientos): Movimiento[] {
  const signo = orden.direccion === 'asc' ? 1 : -1
  return [...movimientos].sort(
    (a, b) =>
      signo * comparar(a, b, orden.columna) ||
      -comparar(a, b, 'fecha') ||
      b.id - a.id,
  )
}

// A new column sorts ascending first; the same column toggles its direction
export function siguienteOrden(actual: OrdenMovimientos, columna: ColumnaOrden): OrdenMovimientos {
  if (actual.columna !== columna) return { columna, direccion: 'asc' }
  return { columna, direccion: actual.direccion === 'asc' ? 'desc' : 'asc' }
}
