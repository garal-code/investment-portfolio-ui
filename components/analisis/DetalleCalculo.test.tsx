import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PreferencesProvider } from '@/lib/preferences'
import { DetalleCalculo } from './DetalleCalculo'
import { fronteraEficienteFixture as frontera } from '@/test/mocks/fixtures/fronteraEficiente'

const SECCIONES = [
  'Matriz de correlaciones',
  'Matriz de varianzas-covarianzas',
  'Precios mensuales',
  'Rentabilidades mensuales',
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

// The section's own collapse toggle: its accessible name is the section title.
function toggle(title: string) {
  return within(paso(title)).getByRole('button', { name: title })
}

// Clicks the "Ver datos" toggle of a matrix and returns its table.
function verDatos(title: string) {
  fireEvent.click(within(paso(title)).getByRole('button', { name: /ver datos/i }))
  return within(paso(title)).getByRole('table', { name: title })
}

// Expands a collapsed section and returns its table.
function desplegar(title: string) {
  fireEvent.click(toggle(title))
  return within(paso(title)).getByRole('table', { name: title })
}

describe('DetalleCalculo — layout', () => {
  it('shows the matrices first, then prices and returns, and nothing else', () => {
    renderDetalle()

    const titulos = within(screen.getByRole('region', { name: 'Detalle del cálculo' }))
      .getAllByRole('heading', { level: 3 })
      .map(h => h.textContent)
    expect(titulos).toEqual(SECCIONES)
    expect(screen.queryByText('Estadísticas por activo')).not.toBeInTheDocument()
    expect(screen.queryByText('Valor actual por posición')).not.toBeInTheDocument()
    // Only the two heatmaps remain as images: the price and return charts are gone.
    expect(screen.getAllByRole('img').map(img => img.getAttribute('aria-label'))).toEqual([
      'Mapa de calor de la matriz de correlaciones',
      'Mapa de calor de la matriz de varianzas-covarianzas',
    ])
  })

  it('shows the matrices expanded by default and lets them collapse', () => {
    renderDetalle()

    for (const title of SECCIONES.slice(0, 2)) {
      expect(toggle(title)).toHaveAttribute('aria-expanded', 'true')
      expect(within(paso(title)).getByRole('img')).toBeVisible()
    }

    fireEvent.click(toggle('Matriz de correlaciones'))
    expect(toggle('Matriz de correlaciones')).toHaveAttribute('aria-expanded', 'false')
    expect(within(paso('Matriz de correlaciones')).queryByRole('img')).not.toBeInTheDocument()
  })

  it('shows prices and returns collapsed by default, side by side', () => {
    renderDetalle()

    for (const title of SECCIONES.slice(2)) {
      expect(toggle(title)).toHaveAttribute('aria-expanded', 'false')
      expect(within(paso(title)).queryByRole('table')).not.toBeInTheDocument()
    }
    const columnas = paso('Precios mensuales').parentElement!
    expect(columnas).toBe(paso('Rentabilidades mensuales').parentElement)
    expect(columnas).toHaveClass('lg:grid-cols-2')
  })
})

describe('DetalleCalculo — monthly prices', () => {
  it('lists the raw monthly prices per ticker once expanded', () => {
    renderDetalle()

    const table = desplegar('Precios mensuales')
    expect(toggle('Precios mensuales')).toHaveAttribute('aria-expanded', 'true')
    const rows = within(table).getAllByRole('row')
    expect(rows).toHaveLength(frontera.detalle.datos.fechas_precios.length + 1)
    const headers = within(rows[0]).getAllByRole('columnheader').map(th => th.textContent)
    expect(headers).toEqual(['Mes', ...frontera.tickers])

    const first = within(table).getByRole('row', { name: /ago 2025/ })
    expect(within(first).getByText('232,10')).toBeInTheDocument()
    expect(within(first).getByText('506,70')).toBeInTheDocument()
    expect(within(first).getByText('7,42')).toBeInTheDocument()

    fireEvent.click(toggle('Precios mensuales'))
    expect(within(paso('Precios mensuales')).queryByRole('table')).not.toBeInTheDocument()
  })
})

describe('DetalleCalculo — monthly returns', () => {
  it('lists the monthly returns with the current portfolio column once expanded', () => {
    renderDetalle()

    const table = desplegar('Rentabilidades mensuales')
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
