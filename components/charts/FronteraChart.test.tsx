import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { FronteraChart, FronteraTooltip, toChartPoint } from './FronteraChart'
import { fronteraEficienteFixture as fixture } from '@/test/mocks/fixtures/fronteraEficiente'

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
