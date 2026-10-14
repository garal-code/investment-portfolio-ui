// Colour scales of the "Detalle del cálculo" heatmaps.

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
