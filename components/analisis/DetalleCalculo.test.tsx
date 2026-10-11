import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PreferencesProvider } from '@/lib/preferences'
import { DetalleCalculo } from './DetalleCalculo'
import { fronteraEficienteFixture as frontera } from '@/test/mocks/fixtures/fronteraEficiente'

const STORAGE_KEY = 'garal.preferences.v1'

const PASOS = [
  'Precios mensuales',
  'Rentabilidades mensuales',
  'Estadísticas por activo',
  'Matriz de correlaciones',
  'Matriz de varianzas-covarianzas',
  'Valor actual por posición',
]

function renderDetalle() {
  return render(
    <PreferencesProvider>
      <DetalleCalculo frontera={frontera} />
    </PreferencesProvider>,
  )
}

// Opens the step whose summary reads `title` and returns its table. The body
// mounts on the `toggle` event, which fires asynchronously after the click.
function expandir(title: string) {
  fireEvent.click(screen.getByText(title, { selector: 'summary *' }))
  return screen.findByRole('table', { name: title })
}

describe('DetalleCalculo — collapsible steps', () => {
  it('renders every step summary collapsed by default', () => {
    renderDetalle()

    expect(screen.getByRole('region', { name: 'Detalle del cálculo' })).toBeInTheDocument()
    for (const title of PASOS) {
      const details = screen.getByText(title, { selector: 'summary *' }).closest('details')
      expect(details).not.toBeNull()
      expect(details).not.toHaveAttribute('open')
    }
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })

  it('explains each step in one line', () => {
    renderDetalle()

    expect(screen.getByText(/cierre del mes \/ cierre del mes anterior − 1/)).toBeInTheDocument()
  })

  it('opens a step when its summary is clicked', async () => {
    renderDetalle()

    await expandir('Precios mensuales')
    expect(screen.getByText('Precios mensuales', { selector: 'summary *' }).closest('details')).toHaveAttribute('open')
  })
})

describe('DetalleCalculo — monthly prices', () => {
  it('has one row per price month and one column per ticker', async () => {
    renderDetalle()

    const table = await expandir('Precios mensuales')
    const rows = within(table).getAllByRole('row')
    // Header row + one row per month.
    expect(rows).toHaveLength(frontera.detalle.datos.fechas_precios.length + 1)
    const headers = within(rows[0]).getAllByRole('columnheader').map(th => th.textContent)
    expect(headers).toEqual(['Mes', ...frontera.tickers])

    const first = within(table).getByRole('row', { name: /ago 2025/ })
    expect(within(first).getByText('232,10')).toBeInTheDocument()
    expect(within(first).getByText('506,70')).toBeInTheDocument()
    expect(within(first).getByText('7,42')).toBeInTheDocument()
  })
})

describe('DetalleCalculo — monthly returns', () => {
  it('includes the current portfolio column and distinguishes negative returns', async () => {
    renderDetalle()

    const table = await expandir('Rentabilidades mensuales')
    const headers = within(within(table).getAllByRole('row')[0]).getAllByRole('columnheader').map(th => th.textContent)
    expect(headers).toEqual(['Mes', ...frontera.tickers, 'Cartera actual'])
    expect(within(table).getAllByRole('row')).toHaveLength(frontera.detalle.datos.fechas.length + 1)

    const enero = within(table).getByRole('row', { name: /ene 2026/ })
    // AAPL −4,24 %, MSFT −11,02 %, SAN.MC −2,62 %, portfolio −6,07 %.
    expect(within(enero).getByText('−11,02 %')).toHaveClass('rent-neg')
    expect(within(enero).getByText('−6,07 %')).toHaveClass('rent-neg')

    const septiembre = within(table).getByRole('row', { name: /sept 2025/ })
    expect(within(septiembre).getByText('9,69 %')).not.toHaveClass('rent-neg')
    expect(within(septiembre).getByText('8,68 %')).toBeInTheDocument()
  })
})

describe('DetalleCalculo — per-asset statistics', () => {
  it('shows expected return, raw variance and volatility per ticker', async () => {
    renderDetalle()

    const table = await expandir('Estadísticas por activo')
    const aapl = within(table).getByRole('row', { name: /AAPL/ })
    expect(within(aapl).getByText('2,18 %')).toBeInTheDocument()
    expect(within(aapl).getByText('0,002052')).toBeInTheDocument()
    expect(within(aapl).getByText('4,53 %')).toBeInTheDocument()
  })
})

describe('DetalleCalculo — matrices', () => {
  it('shows 1,00 on the correlation diagonal', async () => {
    renderDetalle()

    const table = await expandir('Matriz de correlaciones')
    frontera.tickers.forEach((ticker, i) => {
      const cells = within(within(table).getByRole('row', { name: new RegExp(`^${ticker.replace('.', '\\.')}`) })).getAllByRole('cell')
      expect(cells).toHaveLength(frontera.tickers.length)
      expect(cells[i]).toHaveTextContent('1,00')
    })
    const msft = within(table).getByRole('row', { name: /^MSFT/ })
    expect(within(msft).getByText('0,23')).toBeInTheDocument()
  })

  it('colours negative correlations apart from positive ones', async () => {
    const conNegativa = structuredClone(frontera)
    conNegativa.detalle.estadisticas.matriz_correlaciones[0][1] = -0.4
    render(
      <PreferencesProvider>
        <DetalleCalculo frontera={conNegativa} />
      </PreferencesProvider>,
    )

    const table = await expandir('Matriz de correlaciones')
    const aapl = within(table).getByRole('row', { name: /^AAPL/ })
    const negativa = within(aapl).getByText('−0,40')
    const positiva = within(aapl).getByText('0,63')
    expect(negativa.style.background).not.toBe('')
    expect(negativa.style.background).not.toBe(positiva.style.background)
  })

  it('shows raw covariances in fixed notation', async () => {
    renderDetalle()

    const table = await expandir('Matriz de varianzas-covarianzas')
    const san = within(table).getByRole('row', { name: /^SAN\.MC/ })
    expect(within(san).getByText('0,001878')).toBeInTheDocument()
    expect(within(san).getByText('0,000849')).toBeInTheDocument()
    expect(within(san).getByText('0,004322')).toBeInTheDocument()
  })
})

describe('DetalleCalculo — current value per position', () => {
  it('shows EUR value and weight per ticker', async () => {
    renderDetalle()

    const table = await expandir('Valor actual por posición')
    const msft = within(table).getByRole('row', { name: /MSFT/ })
    expect(within(msft).getByText('3.100,00 €')).toBeInTheDocument()
    expect(within(msft).getByText('31,0 %')).toBeInTheDocument()
    const total = within(table).getByRole('row', { name: /Total/ })
    expect(within(total).getByText('10.000,00 €')).toBeInTheDocument()
    expect(within(total).getByText('100,0 %')).toBeInTheDocument()
  })

  it('masks EUR values in privacy mode but keeps weights', async () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ privacy: true }))
    renderDetalle()

    const table = await expandir('Valor actual por posición')
    await waitFor(() => expect(within(table).getAllByText('••••• €')).toHaveLength(frontera.tickers.length + 1))
    expect(within(table).queryByText('3.100,00 €')).not.toBeInTheDocument()
    expect(within(table).queryByText('10.000,00 €')).not.toBeInTheDocument()
    expect(within(table).getByText('31,0 %')).toBeInTheDocument()
  })
})
