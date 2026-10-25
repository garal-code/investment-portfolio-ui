import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import MovimientosPage from './page'
import type { Movimiento } from '@/types'

function movimiento(id: number, nombre: string, fecha: string, cantidad: number): Movimiento {
  return {
    id,
    cartera_id: 4,
    instrumento: { id, isin: `ES000000000${id}`, nombre, moneda: 'EUR' },
    tipo: 'compra',
    fecha,
    cantidad,
    precio: 10,
    comision: 0,
    created_at: `${fecha}T00:00:00Z`,
  }
}

const LARGO = 'iShares Core MSCI World UCITS ETF USD (Acc)'
const movimientos: Movimiento[] = [
  movimiento(1, 'Iberdrola, S.A.', '2024-06-14', 200),
  movimiento(2, LARGO, '2025-04-08', 25),
  movimiento(3, 'Banco Santander, S.A.', '2023-03-15', 1000),
]

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}))
vi.mock('@/contexts/CarteraContext', () => ({
  useActiveCartera: () => ({ carteraId: 4, isLoading: false }),
}))
vi.mock('@/hooks/useCartera', () => ({
  useMovimientos: () => ({ data: movimientos, isLoading: false, isError: false }),
  useEliminarMovimiento: () => ({ mutate: vi.fn() }),
}))
vi.mock('@/components/layout/AppShell', () => ({
  AppShell: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))
vi.mock('@/components/layout/Topbar', () => ({ Topbar: () => null }))

function nombresEnOrden() {
  const filas = screen.getAllByRole('row').slice(1)
  return filas.map(f => within(f).getAllByRole('cell')[0].querySelector('p')?.textContent)
}

function cabecera(nombre: string) {
  return screen.getByRole('columnheader', { name: new RegExp(nombre) })
}

describe('MovimientosPage — movements table', () => {
  it('shows the full instrument name, without cutting it', () => {
    render(<MovimientosPage />)
    const nombre = screen.getByText(LARGO)
    expect(nombre).not.toHaveClass('truncate')
  })

  it('starts newest first and marks the date column as sorted', () => {
    render(<MovimientosPage />)
    expect(nombresEnOrden()).toEqual([LARGO, 'Iberdrola, S.A.', 'Banco Santander, S.A.'])
    expect(cabecera('Fecha')).toHaveAttribute('aria-sort', 'descending')
    expect(cabecera('Cantidad')).toHaveAttribute('aria-sort', 'none')
  })

  it('sorts by a column when its header is clicked, and reverses on a second click', () => {
    render(<MovimientosPage />)

    fireEvent.click(within(cabecera('Cantidad')).getByRole('button'))
    expect(nombresEnOrden()).toEqual([LARGO, 'Iberdrola, S.A.', 'Banco Santander, S.A.'])
    expect(cabecera('Cantidad')).toHaveAttribute('aria-sort', 'ascending')
    expect(cabecera('Fecha')).toHaveAttribute('aria-sort', 'none')

    fireEvent.click(within(cabecera('Cantidad')).getByRole('button'))
    expect(nombresEnOrden()).toEqual(['Banco Santander, S.A.', 'Iberdrola, S.A.', LARGO])
    expect(cabecera('Cantidad')).toHaveAttribute('aria-sort', 'descending')
  })

  it('sorts by instrument name alphabetically', () => {
    render(<MovimientosPage />)

    fireEvent.click(within(cabecera('Instrumento')).getByRole('button'))

    expect(nombresEnOrden()).toEqual(['Banco Santander, S.A.', 'Iberdrola, S.A.', LARGO])
  })
})
