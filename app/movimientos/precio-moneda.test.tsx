import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import MovimientosPage from './page'
import type { Movimiento } from '@/types'

// Bug: the movements table formatted every price as EUR, but `precio` is in
// the instrument's quote currency (garal-screener stores the native price and
// the FX rate apart). A USD buy at 172.40 showed "172,40 €". The commission
// is stored in EUR, so it stays in euros.

function movimiento(id: number, isin: string, nombre: string, moneda: string | undefined, precio: number): Movimiento {
  return {
    id,
    cartera_id: 4,
    instrumento: { id, isin, nombre, moneda },
    tipo: 'compra',
    fecha: '2025-03-03',
    cantidad: 2,
    precio,
    comision: 0.52,
    tipo_cambio: 1.0812,
    created_at: '2025-03-03T00:00:00Z',
  }
}

const movimientos: Movimiento[] = [
  movimiento(1, 'US0378331005', 'Apple Inc.', 'USD', 172.4),
  movimiento(2, 'ES0148396007', 'Inditex', 'EUR', 48.1),
  movimiento(3, 'XS0000000001', 'Sin moneda', undefined, 10),
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

function fila(nombre: string) {
  return screen.getByText(nombre).closest('tr') as HTMLElement
}

describe('MovimientosPage — price currency', () => {
  it('shows the price in the instrument quote currency', () => {
    render(<MovimientosPage />)
    expect(fila('Apple Inc.')).toHaveTextContent('172,40 US$')
    expect(fila('Apple Inc.')).not.toHaveTextContent('172,40 €')
  })

  it('keeps euros for EUR instruments and when the currency is unknown', () => {
    render(<MovimientosPage />)
    expect(fila('Inditex')).toHaveTextContent('48,10 €')
    expect(fila('Sin moneda')).toHaveTextContent('10,00 €')
  })

  it('keeps the commission in euros, as stored', () => {
    render(<MovimientosPage />)
    expect(fila('Apple Inc.')).toHaveTextContent('0,52 €')
  })
})
