import { describe, expect, it } from 'vitest'
import { cantidadPorcentaje, PORCENTAJES_VENTA } from './venta'

describe('cantidadPorcentaje', () => {
  it('offers 25, 50, 75 and 100 %', () => {
    expect(PORCENTAJES_VENTA).toEqual([25, 50, 75, 100])
  })

  it('returns the whole position at 100 %', () => {
    expect(cantidadPorcentaje(14, 100)).toBe(14)
    expect(cantidadPorcentaje(210.537, 100)).toBe(210.537)
  })

  it('rounds down to whole shares when the position is a whole number', () => {
    expect(cantidadPorcentaje(14, 25)).toBe(3)
    expect(cantidadPorcentaje(14, 50)).toBe(7)
    expect(cantidadPorcentaje(14, 75)).toBe(10)
    expect(cantidadPorcentaje(1, 25)).toBe(0)
  })

  it('keeps up to 6 decimals, rounded down, for fractional positions', () => {
    expect(cantidadPorcentaje(210.5, 25)).toBe(52.625)
    expect(cantidadPorcentaje(0.1234567, 50)).toBe(0.061728)
  })
})
