import { describe, expect, it } from 'vitest'
import { colorCorrelacion, colorSecuencial, rangoMatriz } from './detalle-calculo'

describe('colour scales', () => {
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
