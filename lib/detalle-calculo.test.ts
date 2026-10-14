import { describe, expect, it } from 'vitest'
import {
  CLAVE_CARTERA, claveSerie, colorActivo, colorCorrelacion, colorSecuencial, estadisticasRows,
  posicionesRows, preciosBase100Rows, rangoMatriz, rebaseBase100, rentabilidadesRows,
} from './detalle-calculo'

describe('rebaseBase100', () => {
  it('rebases every column to 100 at its first month', () => {
    const precios = [
      [200, 10],
      [220, 5],
      [180, 15],
    ]
    const expected = [[100, 100], [110, 50], [90, 150]]
    rebaseBase100(precios).forEach((row, i) => row.forEach((value, j) => expect(value).toBeCloseTo(expected[i][j])))
  })

  it('leaves a column empty when its first price cannot be a base', () => {
    expect(rebaseBase100([[0, 4], [3, 8]])).toEqual([[null, 100], [null, 200]])
  })

  it('returns an empty series for no prices', () => {
    expect(rebaseBase100([])).toEqual([])
  })
})

describe('chart rows', () => {
  it('builds price rows keyed by series index, since tickers may contain dots', () => {
    const rows = preciosBase100Rows(['2025-08-01', '2025-09-01'], [[50, 20], [55, 10]])
    expect(rows[0]).toEqual({ fecha: '2025-08-01', [claveSerie(0)]: 100, [claveSerie(1)]: 100 })
    expect(rows[1].fecha).toBe('2025-09-01')
    expect(rows[1][claveSerie(0)]).toBeCloseTo(110)
    expect(rows[1][claveSerie(1)]).toBeCloseTo(50)
  })

  it('builds return rows in percent and appends the portfolio series', () => {
    const rows = rentabilidadesRows(['2025-09-01', '2025-10-01'], [[0.05, -0.02], [0.01, 0.03]], [0.02, 0.0])
    expect(rows[0]).toEqual({ fecha: '2025-09-01', [claveSerie(0)]: 5, [claveSerie(1)]: -2, [CLAVE_CARTERA]: 2 })
    expect(rows[1][claveSerie(1)]).toBeCloseTo(3)
  })

  it('builds per-asset statistics in percent', () => {
    expect(estadisticasRows(['AAPL', 'SAN.MC'], [0.02, 0.03], [0.04, 0.06])).toEqual([
      { ticker: 'AAPL', rentabilidad: 2, volatilidad: 4 },
      { ticker: 'SAN.MC', rentabilidad: 3, volatilidad: 6 },
    ])
  })

  it('builds position rows with EUR value, weight and colour', () => {
    const rows = posicionesRows(['AAPL', 'MSFT'], { AAPL: 6000, MSFT: 4000 }, { AAPL: 0.6, MSFT: 0.4 })
    expect(rows).toEqual([
      { ticker: 'AAPL', valor: 6000, peso: 0.6, color: colorActivo(0) },
      { ticker: 'MSFT', valor: 4000, peso: 0.4, color: colorActivo(1) },
    ])
  })
})

describe('colour scales', () => {
  it('gives each asset a stable colour and wraps around the palette', () => {
    expect(colorActivo(0)).toBe('#2D6A5A')
    expect(colorActivo(9)).toBe(colorActivo(0))
  })

  it('paints correlations plum below zero and green above, transparent at zero', () => {
    expect(colorCorrelacion(-1)).toBe('rgba(138, 58, 106, 0.450)')
    expect(colorCorrelacion(1)).toBe('rgba(45, 106, 90, 0.450)')
    expect(colorCorrelacion(0)).toBe('rgba(45, 106, 90, 0.000)')
    expect(colorCorrelacion(7)).toBe(colorCorrelacion(1))
  })

  it('scales covariances from the smallest to the largest value of the matrix', () => {
    expect(rangoMatriz([[1, 3], [3, 5]])).toEqual({ min: 1, max: 5 })
    expect(colorSecuencial(1, 1, 5)).toBe('rgba(45, 106, 90, 0.050)')
    expect(colorSecuencial(5, 1, 5)).toBe('rgba(45, 106, 90, 0.500)')
    expect(colorSecuencial(3, 1, 5)).toBe('rgba(45, 106, 90, 0.275)')
    expect(colorSecuencial(2, 2, 2)).toBe('rgba(45, 106, 90, 0.050)')
  })
})
