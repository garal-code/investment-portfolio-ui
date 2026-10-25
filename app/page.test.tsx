import { fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Home from './page'

const cookieNames = new Set<string>()
vi.mock('next/headers', () => ({
  cookies: async () => ({ has: (name: string) => cookieNames.has(name) }),
}))

const redirect = vi.fn((url: string) => {
  throw new Error(`NEXT_REDIRECT ${url}`)
})
vi.mock('next/navigation', () => ({
  redirect: (url: string) => redirect(url),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}))

// jsdom has no layout observers; the landing's treemap, chart and entrance
// motion only need them to exist.
class MockObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

async function renderHome() {
  return render(await Home())
}

describe('Home (landing)', () => {
  beforeEach(() => {
    cookieNames.clear()
    redirect.mockClear()
    vi.stubGlobal('ResizeObserver', MockObserver)
    vi.stubGlobal('IntersectionObserver', MockObserver)
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: false,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    }))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('shows the landing with a login button to visitors without a session', async () => {
    await renderHome()

    expect(screen.getByRole('heading', { level: 1, name: 'Tu cartera, de un vistazo' })).toBeInTheDocument()
    const loginLinks = screen.getAllByRole('link', { name: 'Entrar' })
    expect(loginLinks.length).toBeGreaterThan(0)
    for (const link of loginLinks) expect(link).toHaveAttribute('href', '/login')
    for (const link of screen.getAllByRole('link', { name: 'Crear cuenta' })) {
      expect(link).toHaveAttribute('href', '/register')
    }
    expect(redirect).not.toHaveBeenCalled()
  })

  it('presents the app as a tool to follow your portfolio, in Spain Spanish', async () => {
    const { container } = await renderHome()
    const text = container.textContent ?? ''

    expect(text).not.toMatch(/gestor/i)
    expect(text).not.toMatch(/\b(tenés|probá|pasá|elegí|abrí|mirás|anotás)\b/i)
    expect(screen.getByRole('heading', { level: 2, name: '¿Ya tienes cuenta?' })).toBeInTheDocument()
  })

  it('offers each action once on the first screen: Entrar in the navigation, none under the headline', async () => {
    await renderHome()

    const nav = screen.getByRole('banner')
    expect(within(nav).getAllByRole('link', { name: 'Entrar' })).toHaveLength(1)
    expect(within(nav).queryByRole('link', { name: 'Crear cuenta' })).not.toBeInTheDocument()

    const hero = screen.getByRole('heading', { level: 1 }).closest('section')!
    expect(within(hero).queryAllByRole('link')).toHaveLength(0)
  })

  it('sends visitors with a session straight to the dashboard', async () => {
    cookieNames.add('access_token')

    await expect(Home()).rejects.toThrow('NEXT_REDIRECT /dashboard')
    expect(redirect).toHaveBeenCalledWith('/dashboard')
  })

  it('updates the sample portfolio figures when another period is chosen', async () => {
    await renderHome()
    const sample = screen.getByRole('region', { name: 'Cuánto vale y cuánto ganaste' })

    expect(within(sample).getByRole('tab', { name: 'YTD', selected: true })).toBeInTheDocument()
    expect(within(sample).getByText('+9,63 %')).toBeInTheDocument()
    expect(within(sample).getByText('en lo que va de año')).toBeInTheDocument()

    fireEvent.click(within(sample).getByRole('tab', { name: '1M' }))

    expect(within(sample).getByText('−0,71 %')).toBeInTheDocument()
    expect(within(sample).getByText('último mes')).toBeInTheDocument()
    expect(within(sample).queryByText('+9,63 %')).not.toBeInTheDocument()
  })
})
