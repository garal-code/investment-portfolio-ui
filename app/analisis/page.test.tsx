import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import AnalisisPage from './page'
import { server } from '@/test/mocks/server'
import { fronteraEficienteFixture } from '@/test/mocks/fixtures/fronteraEficiente'
import { formatFecha } from '@/lib/utils'
import type { FronteraEficiente } from '@/types'

const useActiveCarteraMock = vi.fn()

vi.mock('@/contexts/CarteraContext', () => ({
  useActiveCartera: () => useActiveCarteraMock(),
}))

// Shell chrome needs auth/router context this test isn't about (see
// app/dashboard/page.test.tsx); stub it to a passthrough.
vi.mock('@/components/layout/AppShell', () => ({
  AppShell: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))
vi.mock('@/components/layout/Topbar', () => ({ Topbar: () => null }))

const FRONTERA_URL = '/api/v1/carteras/:id/frontera-eficiente'

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <AnalisisPage />
    </QueryClientProvider>,
  )
}

function respondWith(body: FronteraEficiente) {
  server.use(http.get(FRONTERA_URL, () => HttpResponse.json(body)))
}

beforeEach(() => {
  useActiveCarteraMock.mockReturnValue({ carteraId: 1, carteras: [], isLoading: false })
})

afterEach(() => {
  vi.clearAllMocks()
})

describe('AnalisisPage — result', () => {
  it('shows the analysed window, monthly observations and the monthly-figures note', async () => {
    renderPage()

    expect(await screen.findByText(/13 observaciones mensuales/)).toBeInTheDocument()
    expect(screen.getByText(new RegExp(`${formatFecha('2025-09-01')} – ${formatFecha('2026-09-30')}`))).toBeInTheDocument()
    expect(screen.getByText(/no anualizadas/)).toBeInTheDocument()
  })

  it('lists current vs minimum-variance weights and EUR value per ticker', async () => {
    renderPage()

    const aapl = await screen.findByRole('row', { name: /AAPL/ })
    expect(within(aapl).getByText('5.200,00 €')).toBeInTheDocument()
    expect(within(aapl).getByText('52,0 %')).toBeInTheDocument()
    expect(within(aapl).getByText('62,0 %')).toBeInTheDocument()

    const san = screen.getByRole('row', { name: /SAN\.MC/ })
    expect(within(san).getByText('17,0 %')).toBeInTheDocument()
    expect(within(san).getByText('12,0 %')).toBeInTheDocument()
  })

  it('shows key figures for the current and minimum-variance portfolios', async () => {
    renderPage()

    const figures = await screen.findByRole('region', { name: 'Cifras clave' })
    expect(within(figures).getByText('+1,79 %')).toBeInTheDocument()
    expect(within(figures).getByText('4,37 %')).toBeInTheDocument()
    expect(within(figures).getByText('+1,82 %')).toBeInTheDocument()
    expect(within(figures).getByText('4,36 %')).toBeInTheDocument()
  })

  it('shows the exclusions notice with a label per reason and the excluded share', async () => {
    respondWith({
      ...fronteraEficienteFixture,
      excluidos: [
        { ticker: 'IE00B4L5Y983', motivo: 'sin_ticker' },
        { ticker: 'XYZ', motivo: 'sin_precio_actual' },
        { ticker: 'NEW', motivo: 'sin_historico' },
        { ticker: 'IPO', motivo: 'historico_insuficiente' },
      ],
      peso_excluido: 0.25,
    })
    renderPage()

    const notice = await screen.findByRole('region', { name: 'Activos excluidos del cálculo' })
    expect(within(notice).getByText(/25,0 %/)).toBeInTheDocument()
    expect(within(notice).getByText('IE00B4L5Y983').parentElement).toHaveTextContent('sin ticker')
    expect(within(notice).getByText('XYZ').parentElement).toHaveTextContent('sin precio actual')
    expect(within(notice).getByText('NEW').parentElement).toHaveTextContent('sin histórico de precios')
    expect(within(notice).getByText('IPO').parentElement).toHaveTextContent('histórico insuficiente (< 12 meses)')
  })

  it('renders the calculation detail below the result', async () => {
    renderPage()

    const detalle = await screen.findByRole('region', { name: 'Detalle del cálculo' })
    const pesos = screen.getByRole('region', { name: 'Pesos por activo' })
    expect(pesos.compareDocumentPosition(detalle) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(within(detalle).getByText('Matriz de correlaciones')).toBeInTheDocument()
  })

  it('hides the exclusions notice when nothing was excluded', async () => {
    respondWith({ ...fronteraEficienteFixture, excluidos: [], peso_excluido: 0 })
    renderPage()

    await screen.findByText(/13 observaciones mensuales/)
    expect(screen.queryByRole('region', { name: 'Activos excluidos del cálculo' })).not.toBeInTheDocument()
  })
})

describe('AnalisisPage — years selector', () => {
  it('defaults to 5 years and refetches with the selected `anios`', async () => {
    const requested: (string | null)[] = []
    server.use(
      http.get(FRONTERA_URL, ({ request }) => {
        requested.push(new URL(request.url).searchParams.get('anios'))
        return HttpResponse.json(fronteraEficienteFixture)
      }),
    )
    renderPage()

    await screen.findByText(/13 observaciones mensuales/)
    expect(requested).toEqual(['5'])
    expect(screen.getByRole('tab', { name: '5 años' })).toHaveAttribute('aria-selected', 'true')

    fireEvent.click(screen.getByRole('tab', { name: '10 años' }))

    await waitFor(() => expect(requested).toEqual(['5', '10']))
    expect(screen.getByRole('tab', { name: '10 años' })).toHaveAttribute('aria-selected', 'true')
  })
})

describe('AnalisisPage — error and empty states', () => {
  it('shows the backend detail on 400 (insufficient data)', async () => {
    const detail = 'No hay suficientes activos con histórico para calcular la frontera.'
    server.use(http.get(FRONTERA_URL, () => HttpResponse.json({ detail }, { status: 400 })))
    renderPage()

    expect(await screen.findByText(detail)).toBeInTheDocument()
    // The selector stays available so another horizon can be tried.
    expect(screen.getByRole('tab', { name: '3 años' })).toBeInTheDocument()
  })

  it('shows the price-provider message on 503', async () => {
    server.use(http.get(FRONTERA_URL, () => HttpResponse.json({ detail: 'upstream' }, { status: 503 })))
    renderPage()

    expect(
      await screen.findByText('El proveedor de precios no está disponible. Prueba de nuevo en unos minutos.'),
    ).toBeInTheDocument()
  })

  it('shows the no-cartera state without requesting the frontier', async () => {
    const requested: string[] = []
    server.use(
      http.get(FRONTERA_URL, ({ request }) => {
        requested.push(request.url)
        return HttpResponse.json(fronteraEficienteFixture)
      }),
    )
    useActiveCarteraMock.mockReturnValue({ carteraId: null, carteras: [], isLoading: false })
    renderPage()

    expect(screen.getByText(/No tenés carteras todavía/)).toBeInTheDocument()
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument()
    await new Promise(resolve => setTimeout(resolve, 20))
    expect(requested).toHaveLength(0)
  })
})
