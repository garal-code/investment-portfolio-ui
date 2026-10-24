import { describe, expect, it } from 'vitest'
import type { Movimiento } from '@/types'
import { ORDEN_INICIAL, ordenarMovimientos, siguienteOrden } from './movimientos-orden'

function mov(id: number, nombre: string | undefined, isin: string, extra: Partial<Movimiento>): Movimiento {
  return {
    id,
    cartera_id: 1,
    instrumento: { id, isin, nombre },
    tipo: 'compra',
    fecha: '2025-01-01',
    cantidad: 1,
    precio: 1,
    comision: 0,
    created_at: '2025-01-01T00:00:00Z',
    ...extra,
  }
}

const movs: Movimiento[] = [
  mov(1, 'Iberdrola', 'ES0144580Y14', { fecha: '2024-06-14', cantidad: 200, precio: 11.95, comision: 3, tipo: 'compra' }),
  mov(2, 'apple Inc.', 'US0378331005', { fecha: '2025-03-03', cantidad: 2, precio: 172.4, comision: 0.52, tipo: 'venta' }),
  mov(3, undefined, 'IE00B4L5Y983', { fecha: '2025-03-03', cantidad: 25, precio: 88.3, comision: 2, tipo: 'compra' }),
  mov(4, 'Ácme', 'ES0000000001', { fecha: '2023-01-16', cantidad: 50, precio: 70.2, comision: 0, tipo: 'venta' }),
]

const ids = (lista: Movimiento[]) => lista.map(m => m.id)

describe('ordenarMovimientos', () => {
  it('starts newest first, newest id first within the same day', () => {
    expect(ORDEN_INICIAL).toEqual({ columna: 'fecha', direccion: 'desc' })
    expect(ids(ordenarMovimientos(movs, ORDEN_INICIAL))).toEqual([3, 2, 1, 4])
  })

  it('sorts by the shown name, ignoring case and accents, using the ISIN when there is no name', () => {
    // Shown names: Iberdrola, apple Inc., IE00B4L5Y983, Ácme
    expect(ids(ordenarMovimientos(movs, { columna: 'instrumento', direccion: 'asc' }))).toEqual([4, 2, 1, 3])
    expect(ids(ordenarMovimientos(movs, { columna: 'instrumento', direccion: 'desc' }))).toEqual([3, 1, 2, 4])
  })

  it('sorts numbers by value', () => {
    expect(ids(ordenarMovimientos(movs, { columna: 'cantidad', direccion: 'asc' }))).toEqual([2, 3, 4, 1])
    expect(ids(ordenarMovimientos(movs, { columna: 'precio', direccion: 'desc' }))).toEqual([2, 3, 4, 1])
    expect(ids(ordenarMovimientos(movs, { columna: 'comision', direccion: 'asc' }))).toEqual([4, 2, 3, 1])
  })

  it('groups by type and keeps newest first inside each group', () => {
    expect(ids(ordenarMovimientos(movs, { columna: 'tipo', direccion: 'asc' }))).toEqual([3, 1, 2, 4])
  })

  it('does not change the list it receives', () => {
    const copia = [...movs]
    ordenarMovimientos(movs, { columna: 'cantidad', direccion: 'asc' })
    expect(movs).toEqual(copia)
  })
})

describe('siguienteOrden', () => {
  it('sorts a new column ascending first', () => {
    expect(siguienteOrden(ORDEN_INICIAL, 'precio')).toEqual({ columna: 'precio', direccion: 'asc' })
  })

  it('toggles the direction when the same column is clicked again', () => {
    expect(siguienteOrden({ columna: 'precio', direccion: 'asc' }, 'precio')).toEqual({ columna: 'precio', direccion: 'desc' })
    expect(siguienteOrden(ORDEN_INICIAL, 'fecha')).toEqual({ columna: 'fecha', direccion: 'asc' })
  })
})
