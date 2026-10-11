import { render, screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PreferencesProvider } from '@/lib/preferences'
import { MovimientosTable } from './MovimientosTable'
import { fronteraEficienteFixture as frontera } from '@/test/mocks/fixtures/fronteraEficiente'
import type { PuntoCartera } from '@/types'

const STORAGE_KEY = 'garal.preferences.v1'
const TITLE = 'Movimientos para llegar al punto elegido'

function renderTable(objetivo: PuntoCartera = frontera.frontera[2]) {
  return render(
    <PreferencesProvider>
      <MovimientosTable
        tickers={frontera.tickers}
        actual={frontera.cartera_actual}
        objetivo={objetivo}
        valoresEur={frontera.detalle.cartera_actual.valores_eur}
      />
    </PreferencesProvider>,
  )
}

describe('MovimientosTable', () => {
  it('lists per ticker the current and target weight, signed delta, signed EUR amount and action', async () => {
    renderTable()

    const table = screen.getByRole('table', { name: TITLE })
    const aapl = within(table).getByRole('row', { name: /AAPL/ })
    expect(within(aapl).getByText('52,0 %')).toBeInTheDocument()
    expect(within(aapl).getByText('64,5 %')).toBeInTheDocument()
    expect(within(aapl).getByText('+12,5 pp')).toBeInTheDocument()
    expect(await within(aapl).findByText('+1.250,00 €')).toBeInTheDocument()
    expect(within(aapl).getByText('Comprar')).toBeInTheDocument()

    const msft = within(table).getByRole('row', { name: /MSFT/ })
    expect(within(msft).getByText('0,0 %')).toBeInTheDocument()
    expect(within(msft).getByText('−31,0 pp')).toBeInTheDocument()
    expect(within(msft).getByText('−3.100,00 €')).toBeInTheDocument()
    expect(within(msft).getByText('Vender')).toBeInTheDocument()

    const san = within(table).getByRole('row', { name: /SAN\.MC/ })
    expect(within(san).getByText('+18,5 pp')).toBeInTheDocument()
    expect(within(san).getByText('+1.850,00 €')).toBeInTheDocument()
    expect(within(san).getByText('Comprar')).toBeInTheDocument()
  })

  it('marks tiny deltas as "Mantener"', () => {
    renderTable({
      ...frontera.cartera_actual,
      pesos: { AAPL: 0.522, MSFT: 0.308, 'SAN.MC': 0.17 },
    })

    const table = screen.getByRole('table', { name: TITLE })
    for (const ticker of [/AAPL/, /MSFT/, /SAN\.MC/]) {
      expect(within(within(table).getByRole('row', { name: ticker })).getByText('Mantener')).toBeInTheDocument()
    }
  })

  it('summarises return and volatility of the current portfolio and the chosen point', () => {
    renderTable()

    const resumen = screen.getByRole('list', { name: 'Comparación con el punto elegido' })
    const actual = within(resumen).getByText('Cartera actual').closest('li')!
    expect(actual).toHaveTextContent('+1,79 %')
    expect(actual).toHaveTextContent('4,37 %')
    const elegido = within(resumen).getByText('Punto elegido').closest('li')!
    expect(elegido).toHaveTextContent('+2,59 %')
    expect(elegido).toHaveTextContent('4,75 %')
  })

  it('explains that excluded positions are not moved and that this is not a recommendation', () => {
    renderTable()

    expect(screen.getByText(/posiciones excluidas del análisis no se mueven/)).toBeInTheDocument()
    expect(screen.getByText(/no una recomendación/)).toBeInTheDocument()
    expect(screen.getByText(/número de títulos/)).toBeInTheDocument()
  })

  it('masks EUR amounts in privacy mode but keeps weights and actions', async () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ privacy: true }))
    renderTable()

    const table = screen.getByRole('table', { name: TITLE })
    await waitFor(() => expect(within(table).getAllByText('••••• €')).toHaveLength(frontera.tickers.length))
    expect(within(table).queryByText('+1.250,00 €')).not.toBeInTheDocument()
    expect(within(table).queryByText('−3.100,00 €')).not.toBeInTheDocument()
    expect(within(table).getByText('+12,5 pp')).toBeInTheDocument()
    expect(within(table).getByText('Vender')).toBeInTheDocument()
  })
})
