import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import MovimientosPage from './page'
import type { Movimiento } from '@/types'

const movimientosMock: { data: Movimiento[] } = { data: [] }

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}))
vi.mock('@/contexts/CarteraContext', () => ({
  useActiveCartera: () => ({ carteraId: 4, isLoading: false }),
}))
vi.mock('@/hooks/useCartera', () => ({
  useMovimientos: () => ({ data: movimientosMock.data, isLoading: false, isError: false }),
  useEliminarMovimiento: () => ({ mutate: vi.fn() }),
}))
vi.mock('@/components/layout/AppShell', () => ({
  AppShell: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))
vi.mock('@/components/layout/Topbar', () => ({ Topbar: () => null }))
vi.mock('@/components/forms/MovimientoForm', () => ({ MovimientoForm: () => <p>movement form</p> }))
vi.mock('@/components/importacion/ImportarCsv', () => ({
  ImportarCsv: ({ carteraId, onClose }: { carteraId: number; onClose: () => void }) => (
    <div>
      <p>import panel for {carteraId}</p>
      <button onClick={onClose}>close import</button>
    </div>
  ),
}))

describe('MovimientosPage — CSV import', () => {
  afterEach(() => { movimientosMock.data = [] })

  it('opens the import panel for the active portfolio from the movements section', () => {
    render(<MovimientosPage />)

    fireEvent.click(screen.getByRole('button', { name: 'Importar CSV' }))

    expect(screen.getByText('import panel for 4')).toBeInTheDocument()
    expect(screen.queryByText('movement form')).not.toBeInTheDocument()
  })

  it('shows one panel at a time: the manual form replaces the import panel', () => {
    render(<MovimientosPage />)
    fireEvent.click(screen.getByRole('button', { name: 'Importar CSV' }))

    fireEvent.click(screen.getByRole('button', { name: 'Nuevo movimiento' }))

    expect(screen.getByText('movement form')).toBeInTheDocument()
    expect(screen.queryByText('import panel for 4')).not.toBeInTheDocument()
  })

  it('closes the import panel when the import asks to', () => {
    render(<MovimientosPage />)
    fireEvent.click(screen.getByRole('button', { name: 'Importar CSV' }))

    fireEvent.click(screen.getByRole('button', { name: 'close import' }))

    expect(screen.queryByText('import panel for 4')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Importar CSV' })).toBeInTheDocument()
  })

  it('keeps the manual form toggle working', () => {
    render(<MovimientosPage />)

    fireEvent.click(screen.getByRole('button', { name: 'Nuevo movimiento' }))
    expect(screen.getByText('movement form')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(screen.queryByText('movement form')).not.toBeInTheDocument()
  })

  it('hides the stored movements while importing so they are not mixed up with the preview', () => {
    movimientosMock.data = [{
      id: 1, cartera_id: 4, tipo: 'compra', fecha: '2025-03-03', cantidad: 2, precio: 48.1, comision: 0,
      created_at: '2025-03-03T00:00:00Z', instrumento: { id: 1, isin: 'ES0148396007', nombre: 'Inditex' },
    }]
    render(<MovimientosPage />)
    expect(screen.getByText('Inditex')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Importar CSV' }))
    expect(screen.queryByText('Inditex')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'close import' }))
    expect(screen.getByText('Inditex')).toBeInTheDocument()
  })

  it('hides the empty-movements message while importing', () => {
    render(<MovimientosPage />)
    expect(screen.getByText('No hay movimientos aún. Añade tu primera operación.')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Importar CSV' }))

    expect(screen.queryByText('No hay movimientos aún. Añade tu primera operación.')).not.toBeInTheDocument()
  })
})
