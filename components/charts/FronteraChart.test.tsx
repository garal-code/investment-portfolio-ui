import { cloneElement, isValidElement, type ReactElement, type ReactNode } from 'react'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { FronteraChart, FronteraTooltip, toChartPoint } from './FronteraChart'
import { fronteraEficienteFixture as fixture } from '@/test/mocks/fixtures/fronteraEficiente'

// jsdom has no layout, so ResponsiveContainer measures 0x0 and recharts draws
// nothing. Give the chart a fixed size so the SVG points exist and can be
// clicked.
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

function renderChart(props: { selectedIndex?: number; onSelect?: (index: number) => void } = {}) {
  return render(
    <FronteraChart
      frontera={fixture.frontera}
      minimaVarianza={fixture.cartera_minima_varianza}
      actual={fixture.cartera_actual}
      tickers={fixture.tickers}
      {...props}
    />,
  )
}

describe('FronteraChart', () => {
  it('renders with fixture data and a legend for the three series', () => {
    render(
      <FronteraChart
        frontera={fixture.frontera}
        minimaVarianza={fixture.cartera_minima_varianza}
        actual={fixture.cartera_actual}
        tickers={fixture.tickers}
      />,
    )

    const legend = screen.getByRole('list', { name: 'Leyenda' })
    expect(within(legend).getByText('Frontera eficiente')).toBeInTheDocument()
    expect(within(legend).getByText('Mínima varianza')).toBeInTheDocument()
    expect(within(legend).getByText('Cartera actual')).toBeInTheDocument()
  })
})

describe('FronteraChart — point selection', () => {
  it('highlights the selected frontier point and documents it in the legend', () => {
    const { container } = renderChart({ selectedIndex: 2, onSelect: vi.fn() })

    const legend = screen.getByRole('list', { name: 'Leyenda' })
    expect(within(legend).getByText('Punto elegido')).toBeInTheDocument()
    expect(container.querySelectorAll('.frontera-elegido .recharts-symbols')).toHaveLength(1)
  })

  it('has no selection marker or slider when the chart is not selectable', () => {
    const { container } = renderChart()

    expect(screen.queryByText('Punto elegido')).not.toBeInTheDocument()
    expect(screen.queryByRole('slider')).not.toBeInTheDocument()
    expect(container.querySelector('.frontera-elegido')).toBeNull()
  })

  it('calls onSelect with the frontier index when a frontier point is clicked', () => {
    const onSelect = vi.fn()
    const { container } = renderChart({ selectedIndex: 0, onSelect })

    const points = container.querySelectorAll('.frontera-puntos .recharts-symbols')
    expect(points).toHaveLength(fixture.frontera.length)
    expect(container.querySelector('.frontera-puntos [cursor="pointer"]')).not.toBeNull()
    fireEvent.click(points[3])

    expect(onSelect).toHaveBeenCalledWith(3)
  })

  it('offers a keyboard-operable "Riesgo objetivo" slider over the frontier points', () => {
    const onSelect = vi.fn()
    renderChart({ selectedIndex: 2, onSelect })

    const slider = screen.getByRole('slider', { name: 'Riesgo objetivo' })
    expect(slider).toHaveAttribute('min', '0')
    expect(slider).toHaveAttribute('max', String(fixture.frontera.length - 1))
    expect(slider).toHaveValue('2')
    expect(slider).toHaveAttribute('aria-valuetext', 'Volatilidad mensual 4,75 %, rentabilidad +2,59 %')
    expect(screen.getByText(/Volatilidad mensual 4,75 %/, { selector: 'output' })).toBeInTheDocument()

    fireEvent.change(slider, { target: { value: '4' } })
    expect(onSelect).toHaveBeenCalledWith(4)
  })
})

describe('toChartPoint', () => {
  it('maps monthly fractions to percentage axes and keeps the source point', () => {
    const point = toChartPoint(fixture.cartera_actual, 'actual')
    expect(point.volatilidad).toBeCloseTo(4.3726)
    expect(point.rentabilidad).toBeCloseTo(1.7868)
    expect(point.punto).toBe(fixture.cartera_actual)
  })
})

describe('FronteraTooltip', () => {
  it('shows return, volatility and the weights of the hovered point', () => {
    const point = toChartPoint(fixture.cartera_actual, 'actual')
    render(<FronteraTooltip active payload={[{ payload: point }]} tickers={fixture.tickers} />)

    expect(screen.getByText('Cartera actual')).toBeInTheDocument()
    expect(screen.getByText('+1,79 %')).toBeInTheDocument()
    expect(screen.getByText('4,37 %')).toBeInTheDocument()
    expect(screen.getByText('AAPL').nextSibling).toHaveTextContent('52,0 %')
    expect(screen.getByText('MSFT').nextSibling).toHaveTextContent('31,0 %')
    expect(screen.getByText('SAN.MC').nextSibling).toHaveTextContent('17,0 %')
  })

  it('labels points on the frontier line as frontier portfolios', () => {
    const point = toChartPoint(fixture.frontera[2], 'frontera')
    render(<FronteraTooltip active payload={[{ payload: point }]} tickers={fixture.tickers} />)

    expect(screen.getByText('Cartera de la frontera')).toBeInTheDocument()
    expect(screen.getByText('MSFT').nextSibling).toHaveTextContent('0,0 %')
  })

  it('renders nothing when inactive', () => {
    const { container } = render(<FronteraTooltip active={false} payload={[]} tickers={fixture.tickers} />)
    expect(container).toBeEmptyDOMElement()
  })
})
