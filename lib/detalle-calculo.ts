import { treemapColor } from './utils'

// Data transforms behind the "Detalle del cálculo" charts.

// Chart rows are keyed by series index, not ticker: recharts reads a dataKey
// as a property path, so "SAN.MC" would resolve to `SAN` -> `MC`.
export const CLAVE_CARTERA = 'cartera'
export const claveSerie = (index: number) => `serie${index}`

export type SerieRow = { fecha: string } & Record<string, number | string | null>

// Every column of `precios` ([month][ticker]) divided by its first month, x100.
// A column whose first price is not a positive number has no base: all null.
export function rebaseBase100(precios: number[][]): (number | null)[][] {
  if (precios.length === 0) return []
  const base = precios[0]
  return precios.map(row => row.map((precio, j) => (base[j] > 0 ? (precio / base[j]) * 100 : null)))
}

export function preciosBase100Rows(fechas: string[], precios: number[][]): SerieRow[] {
  const rebased = rebaseBase100(precios)
  return fechas.map((fecha, i) => {
    const row: SerieRow = { fecha }
    rebased[i].forEach((valor, j) => { row[claveSerie(j)] = valor })
    return row
  })
}

// Monthly returns as percentages; the current portfolio goes last when given.
export function rentabilidadesRows(fechas: string[], rentabilidades: number[][], cartera?: number[]): SerieRow[] {
  return fechas.map((fecha, i) => {
    const row: SerieRow = { fecha }
    rentabilidades[i].forEach((valor, j) => { row[claveSerie(j)] = valor * 100 })
    if (cartera) row[CLAVE_CARTERA] = cartera[i] * 100
    return row
  })
}

export interface EstadisticaRow {
  ticker: string
  rentabilidad: number  // %
  volatilidad: number   // %
}

export function estadisticasRows(tickers: string[], rentabilidades: number[], volatilidades: number[]): EstadisticaRow[] {
  return tickers.map((ticker, i) => ({
    ticker,
    rentabilidad: rentabilidades[i] * 100,
    volatilidad: volatilidades[i] * 100,
  }))
}

export interface PosicionRow {
  ticker: string
  valor: number  // EUR
  peso: number   // 0-1
  color: string
}

export function posicionesRows(
  tickers: string[],
  valoresEur: Record<string, number>,
  pesos: Record<string, number>,
): PosicionRow[] {
  return tickers.map((ticker, i) => ({
    ticker,
    valor: valoresEur[ticker] ?? 0,
    peso: pesos[ticker] ?? 0,
    color: colorActivo(i),
  }))
}

// One colour per asset, shared by every chart of the section.
export const colorActivo = (index: number) => treemapColor(index).bg

const POSITIVE_RGB = '45, 106, 90' // --color-primary #2D6A5A
const NEGATIVE_RGB = '138, 58, 106' // --color-plum #8a3a6a

// Diverging scale: plum for -1, transparent for 0, Garal green for +1. Alpha
// is capped so the ink text stays readable on every cell.
export function colorCorrelacion(value: number): string {
  const r = Math.max(-1, Math.min(1, value))
  return `rgba(${r < 0 ? NEGATIVE_RGB : POSITIVE_RGB}, ${(Math.abs(r) * 0.45).toFixed(3)})`
}

export function rangoMatriz(matrix: number[][]): { min: number; max: number } {
  const values = matrix.flat()
  return { min: Math.min(...values), max: Math.max(...values) }
}

// Sequential scale: green with alpha from 0.05 (smallest value) to 0.5
// (largest). A flat matrix has no spread, so it gets the lightest shade.
export function colorSecuencial(value: number, min: number, max: number): string {
  const t = max > min ? (value - min) / (max - min) : 0
  return `rgba(${POSITIVE_RGB}, ${(0.05 + t * 0.45).toFixed(3)})`
}
