import { cloneElement, isValidElement, type ReactElement, type ReactNode } from 'react'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { PreferencesProvider } from '@/lib/preferences'
import { DetalleCalculo } from './DetalleCalculo'
import { fronteraEficienteFixture as frontera } from '@/test/mocks/fixtures/fronteraEficiente'

// jsdom has no layout, so ResponsiveContainer measures 0x0 and recharts draws
// nothing. Give the charts a fixed size so labels and legends are rendered.
vi.mock('recharts', async importOriginal => {
  const actual = await importOriginal<typeof import('recharts')>()
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: ReactNode }) =>
      isValidElement(children)
        ? cloneElement(children as ReactElement<{ width: number; height: number }>, { width: 600, height: 300 })
        : null,
  }
})

const STORAGE_KEY = 'garal.preferences.v1'

const PASOS = [
  'Precios mensuales',
  'Rentabilidades mensuales',
  'Estadísticas por activo',
  'Matriz de correlaciones',
  'Matriz de varianzas-covarianzas',
  'Valor actual por posición',
]

function renderDetalle(data = frontera) {
  return render(
    <PreferencesProvider>
      <DetalleCalculo frontera={data} />
    </PreferencesProvider>,
  )
}

function paso(title: string) {
  return screen.getByRole('region', { name: title })
}

// Clicks the "Ver datos" toggle of a step and returns its table.
function verDatos(title: string) {
  fireEvent.click(within(paso(title)).getByRole('button', { name: /ver datos/i }))
  return within(paso(title)).getByRole('table', { name: title })
}

describe('DetalleCalculo — visual steps', () => {
  it('shows the section and every step title without expanding anything', () => {
    renderDetalle()

    expect(screen.getByRole('region', { name: 'Detalle del cálculo' })).toBeInTheDocument()
    for (const title of PASOS) {
      expect(screen.getByRole('heading', { name: title })).toBeVisible()
    }
    expect(document.querySelector('details')).toBeNull()
  })

  it('gives every step a chart with an accessible name', () => {
    renderDetalle()

    for (const title of PASOS) {
      expect(within(paso(title)).getAllByRole('img').length).toBeGreaterThan(0)
    }
    expect(within(paso('Precios mensuales')).getByRole('img', { name: /base 100/i })).toBeInTheDocument()
  })

  it('explains each step and the base 100 rebasing', () => {
    renderDetalle()

    expect(screen.getByText(/cierre del mes \/ cierre del mes anterior − 1/)).toBeInTheDocument()
    expect(within(paso('Precios mensuales')).getByText(/base 100/i, { selector: 'p' })).toBeInTheDocument()
  })

  it('hides every table until "Ver datos" is clicked', () => {
    renderDetalle()

    expect(screen.queryByRole('table')).not.toBeInTheDocument()
    for (const title of PASOS) {
      expect(within(paso(title)).getByRole('button', { name: /ver datos/i })).toHaveAttribute('aria-expanded', 'false')
    }
  })

  it('toggles a table open and closed from its button', () => {
    renderDetalle()

    verDatos('Precios mensuales')
    const boton = within(paso('Precios mensuales')).getByRole('button', { name: /datos/i })
    expect(boton).toHaveAttribute('aria-expanded', 'true')
    expect(boton).toHaveAccessibleName(/ocultar datos/i)

    fireEvent.click(boton)
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
    expect(boton).toHaveAttribute('aria-expanded', 'false')
  })
})

describe('DetalleCalculo — monthly prices', () => {
  it('draws one legend entry per ticker and keeps the raw prices in the table', () => {
    renderDetalle()

    const legend = within(paso('Precios mensuales')).getByRole('list', { name: 'Leyenda' })
    expect(within(legend).getAllByRole('listitem').map(li => li.textContent)).toEqual(frontera.tickers)

    const table = verDatos('Precios mensuales')
    const rows = within(table).getAllByRole('row')
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
  it('lists the current portfolio in the legend and its table column', () => {
    renderDetalle()

    const legend = within(paso('Rentabilidades mensuales')).getByRole('list', { name: 'Leyenda' })
    expect(within(legend).getAllByRole('listitem').map(li => li.textContent)).toEqual([
      ...frontera.tickers,
      'Cartera actual',
    ])

    const table = verDatos('Rentabilidades mensuales')
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
  it('charts expected return and volatility and keeps the variance in the table', () => {
    renderDetalle()

    const legend = within(paso('Estadísticas por activo')).getByRole('list', { name: 'Leyenda' })
    expect(within(legend).getAllByRole('listitem').map(li => li.textContent)).toEqual([
      'Rentabilidad esperada',
      'Volatilidad',
    ])

    const table = verDatos('Estadísticas por activo')
    const aapl = within(table).getByRole('row', { name: /AAPL/ })
    expect(within(aapl).getByText('2,18 %')).toBeInTheDocument()
    expect(within(aapl).getByText('0,002052')).toBeInTheDocument()
    expect(within(aapl).getByText('4,53 %')).toBeInTheDocument()
  })
})

describe('DetalleCalculo — matrices', () => {
  it('shows the formatted correlations inside the heatmap cells', () => {
    renderDetalle()

    const heatmap = within(paso('Matriz de correlaciones')).getByRole('img', { name: /mapa de calor.*correlaciones/i })
    // 3 diagonal cells at 1,00, plus each off-diagonal pair twice.
    expect(within(heatmap).getAllByText('1,00')).toHaveLength(frontera.tickers.length)
    expect(within(heatmap).getAllByText('0,23')).toHaveLength(2)
    expect(within(heatmap).getAllByText('0,63')).toHaveLength(2)
    for (const ticker of frontera.tickers) {
      expect(within(heatmap).getAllByText(ticker).length).toBeGreaterThan(0)
    }
  })

  it('colours negative correlations apart from positive ones', () => {
    const conNegativa = structuredClone(frontera)
    conNegativa.detalle.estadisticas.matriz_correlaciones[0][1] = -0.4
    renderDetalle(conNegativa)

    const heatmap = within(paso('Matriz de correlaciones')).getByRole('img')
    const negativa = within(heatmap).getByText('−0,40')
    const positiva = within(heatmap).getAllByText('0,63')[0]
    expect(negativa.style.background).not.toBe('')
    expect(negativa.style.background).not.toBe(positiva.style.background)
  })

  it('keeps the correlation table behind "Ver datos" with 1,00 on the diagonal', () => {
    renderDetalle()

    const table = verDatos('Matriz de correlaciones')
    frontera.tickers.forEach((ticker, i) => {
      const cells = within(within(table).getByRole('row', { name: new RegExp(`^${ticker.replace('.', '\\.')}`) })).getAllByRole('cell')
      expect(cells).toHaveLength(frontera.tickers.length)
      expect(cells[i]).toHaveTextContent('1,00')
    })
  })

  it('shows raw covariances in fixed notation in the heatmap and the table', () => {
    renderDetalle()

    const heatmap = within(paso('Matriz de varianzas-covarianzas')).getByRole('img', { name: /mapa de calor.*covarianzas/i })
    expect(within(heatmap).getAllByText('0,001878')).toHaveLength(2)
    expect(within(heatmap).getByText('0,004322')).toBeInTheDocument()

    const table = verDatos('Matriz de varianzas-covarianzas')
    const san = within(table).getByRole('row', { name: /^SAN\.MC/ })
    expect(within(san).getByText('0,001878')).toBeInTheDocument()
    expect(within(san).getByText('0,000849')).toBeInTheDocument()
    expect(within(san).getByText('0,004322')).toBeInTheDocument()
  })
})

describe('DetalleCalculo — current value per position', () => {
  it('labels each bar with EUR value and weight, and keeps them in the table', () => {
    renderDetalle()

    const chart = within(paso('Valor actual por posición')).getByRole('img')
    expect(within(chart).getByText('3.100,00 € · 31,0 %')).toBeInTheDocument()

    const table = verDatos('Valor actual por posición')
    const msft = within(table).getByRole('row', { name: /MSFT/ })
    expect(within(msft).getByText('3.100,00 €')).toBeInTheDocument()
    expect(within(msft).getByText('31,0 %')).toBeInTheDocument()
    const total = within(table).getByRole('row', { name: /Total/ })
    expect(within(total).getByText('10.000,00 €')).toBeInTheDocument()
    expect(within(total).getByText('100,0 %')).toBeInTheDocument()
  })

  it('masks EUR values in the chart and the table in privacy mode but keeps weights', async () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ privacy: true }))
    renderDetalle()

    const chart = within(paso('Valor actual por posición')).getByRole('img')
    await waitFor(() => expect(within(chart).getByText('••••• € · 31,0 %')).toBeInTheDocument())
    expect(within(chart).queryByText(/3\.100,00/)).not.toBeInTheDocument()

    const table = verDatos('Valor actual por posición')
    expect(within(table).getAllByText('••••• €')).toHaveLength(frontera.tickers.length + 1)
    expect(within(table).queryByText('3.100,00 €')).not.toBeInTheDocument()
    expect(within(table).queryByText('10.000,00 €')).not.toBeInTheDocument()
    expect(within(table).getByText('31,0 %')).toBeInTheDocument()
  })
})
