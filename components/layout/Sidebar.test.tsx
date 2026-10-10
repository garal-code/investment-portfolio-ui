import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Sidebar } from './Sidebar'

const usePathnameMock = vi.fn()

vi.mock('next/navigation', () => ({
  usePathname: () => usePathnameMock(),
}))

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: 1, email: 'demo@example.com', nombre: 'Demo', created_at: '' } }),
}))

describe('Sidebar — navigation', () => {
  it('lists "Análisis" between Resumen and Movimientos, linking to /analisis', () => {
    usePathnameMock.mockReturnValue('/dashboard')
    render(<Sidebar />)

    const links = screen.getAllByRole('link')
    expect(links.map(l => l.textContent)).toEqual(['Resumen', 'Análisis', 'Movimientos', 'Ajustes'])
    expect(screen.getByRole('link', { name: 'Análisis' })).toHaveAttribute('href', '/analisis')
  })

  it('marks "Análisis" as active on /analisis', () => {
    usePathnameMock.mockReturnValue('/analisis')
    render(<Sidebar />)

    expect(screen.getByRole('link', { name: 'Análisis' })).toHaveClass('font-medium')
    expect(screen.getByRole('link', { name: 'Resumen' })).not.toHaveClass('font-medium')
  })
})
