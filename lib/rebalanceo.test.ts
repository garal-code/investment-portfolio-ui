import { describe, expect, it } from 'vitest'
import { HOLD_THRESHOLD, computeRebalancingMoves, defaultFrontierIndex } from './rebalanceo'
import { fronteraEficienteFixture as fixture } from '@/test/mocks/fixtures/fronteraEficiente'
import type { PuntoCartera } from '@/types'

const valoresEur = fixture.detalle.cartera_actual.valores_eur

function punto(volatilidad: number, rentabilidad: number): PuntoCartera {
  return { volatilidad, rentabilidad, varianza: volatilidad ** 2, pesos: {} }
}

describe('computeRebalancingMoves', () => {
  it('returns one row per ticker in `tickers` order with weights, delta, EUR amount and action', () => {
    const moves = computeRebalancingMoves(
      fixture.tickers,
      fixture.cartera_actual.pesos,
      fixture.frontera[0].pesos,
      valoresEur,
    )

    expect(moves.map(m => m.ticker)).toEqual(['AAPL', 'MSFT', 'SAN.MC'])
    const [aapl, msft, san] = moves
    expect(aapl.pesoActual).toBeCloseTo(0.52)
    expect(aapl.pesoObjetivo).toBeCloseTo(0.62)
    expect(aapl.diferencia).toBeCloseTo(0.1)
    expect(aapl.importeEur).toBeCloseTo(1000)
    expect(aapl.accion).toBe('comprar')
    expect(msft.importeEur).toBeCloseTo(-500)
    expect(msft.accion).toBe('vender')
    expect(san.importeEur).toBeCloseTo(-500)
    expect(san.accion).toBe('vender')
  })

  it('is self-financing: the EUR amounts add up to ~0', () => {
    for (const target of fixture.frontera) {
      const moves = computeRebalancingMoves(fixture.tickers, fixture.cartera_actual.pesos, target.pesos, valoresEur)
      const net = moves.reduce((sum, m) => sum + m.importeEur, 0)
      expect(net).toBeCloseTo(0, 6)
    }
  })

  it('treats a weight missing on either side as 0', () => {
    const moves = computeRebalancingMoves(
      ['A', 'B', 'C'],
      { A: 0.6, B: 0.4 },
      { A: 0.5, C: 0.5 },
      { A: 600, B: 400 },
    )

    expect(moves.map(m => [m.pesoActual, m.pesoObjetivo])).toEqual([[0.6, 0.5], [0.4, 0], [0, 0.5]])
    expect(moves[1].importeEur).toBeCloseTo(-400)
    expect(moves[1].accion).toBe('vender')
    expect(moves[2].importeEur).toBeCloseTo(500)
    expect(moves[2].accion).toBe('comprar')
  })

  it('only sums the EUR value of the analysed tickers (excluded positions are not moved)', () => {
    const moves = computeRebalancingMoves(['A', 'B'], { A: 0.5, B: 0.5 }, { A: 0.6, B: 0.4 }, { A: 500, B: 500, EXCL: 9000 })
    expect(moves[0].importeEur).toBeCloseTo(100)
    expect(moves[1].importeEur).toBeCloseTo(-100)
  })

  it(`marks deltas below ${HOLD_THRESHOLD * 100} pp as "mantener" but keeps the exact amount`, () => {
    expect(HOLD_THRESHOLD).toBe(0.005)
    const moves = computeRebalancingMoves(
      ['A', 'B', 'C', 'D'],
      { A: 0.25, B: 0.25, C: 0.25, D: 0.25 },
      { A: 0.254, B: 0.246, C: 0.256, D: 0.244 },
      { A: 250, B: 250, C: 250, D: 250 },
    )

    expect(moves.map(m => m.accion)).toEqual(['mantener', 'mantener', 'comprar', 'vender'])
    expect(moves[0].importeEur).toBeCloseTo(4)
    expect(moves[1].importeEur).toBeCloseTo(-4)
  })

  it('returns no rows when there are no tickers', () => {
    expect(computeRebalancingMoves([], {}, {}, {})).toEqual([])
  })
})

describe('defaultFrontierIndex', () => {
  it('picks the frontier point whose volatility is closest to the current portfolio', () => {
    expect(defaultFrontierIndex(fixture.frontera, fixture.cartera_actual)).toBe(0)
    expect(defaultFrontierIndex(fixture.frontera, punto(0.056, 0.01))).toBe(3)
    expect(defaultFrontierIndex(fixture.frontera, punto(0.2, 0.01))).toBe(4)
  })

  it('breaks volatility ties towards the higher return', () => {
    const frontera = [punto(0.04, 0.01), punto(0.06, 0.02), punto(0.06, 0.03), punto(0.08, 0.04)]
    expect(defaultFrontierIndex(frontera, punto(0.06, 0))).toBe(2)
    // Equidistant points on both sides: the higher-return one wins.
    expect(defaultFrontierIndex([punto(0.25, 0.01), punto(0.75, 0.02)], punto(0.5, 0))).toBe(1)
  })

  it('returns null for an empty frontier', () => {
    expect(defaultFrontierIndex([], fixture.cartera_actual)).toBeNull()
  })
})
