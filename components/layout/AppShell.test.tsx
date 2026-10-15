import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { AppShell } from './AppShell'

vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
}))

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: 1, email: 'demo@example.com', nombre: 'Demo', created_at: '' } }),
}))

describe('AppShell', () => {
  it('renders the page content next to a collapsible sidebar', () => {
    render(
      <AppShell>
        <p>Contenido</p>
      </AppShell>,
    )

    expect(screen.getByText('Contenido')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Contraer menú' }))
    expect(screen.getByRole('complementary')).toHaveAttribute('data-collapsed', 'true')
    expect(screen.getByText('Contenido')).toBeInTheDocument()
  })
})
