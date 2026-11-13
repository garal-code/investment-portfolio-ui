export const PORCENTAJES_VENTA = [25, 50, 75, 100] as const

// Quantity to sell for a percentage of a position. 100 % is always the exact
// position. Otherwise it rounds down (never sells more than the percentage):
// to whole shares when the position is whole, to 6 decimals when fractional
// (fund participations).
export function cantidadPorcentaje(total: number, pct: number): number {
  if (pct >= 100) return total
  const bruto = (total * pct) / 100
  const escala = Number.isInteger(total) ? 1 : 1e6
  // The epsilon absorbs float noise such as 52.625 being computed as 52.62499…
  return Math.floor(bruto * escala + 1e-6) / escala
}
