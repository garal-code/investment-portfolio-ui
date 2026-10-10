import type { PuntoCartera } from '@/types'

// Weight deltas smaller than this (0.5 percentage points) are reported as
// "mantener": not worth a trade, although the exact amount is kept.
export const HOLD_THRESHOLD = 0.005

export type AccionRebalanceo = 'comprar' | 'vender' | 'mantener'

export interface MovimientoRebalanceo {
  ticker: string
  pesoActual: number
  pesoObjetivo: number
  diferencia: number   // pesoObjetivo - pesoActual, 0-1 fraction
  importeEur: number   // diferencia x total EUR value of the analysed tickers
  accion: AccionRebalanceo
}

// Moves to go from the current weights to the target ones, one row per
// ticker in `tickers` order. Only the analysed tickers are summed, so
// positions excluded from the frontier are never moved; as both weight sets
// add up to 1 the amounts are self-financing (they net to ~0).
export function computeRebalancingMoves(
  tickers: string[],
  pesosActuales: Record<string, number>,
  pesosObjetivo: Record<string, number>,
  valoresEur: Record<string, number>,
): MovimientoRebalanceo[] {
  const total = tickers.reduce((sum, ticker) => sum + (valoresEur[ticker] ?? 0), 0)

  return tickers.map(ticker => {
    const pesoActual = pesosActuales[ticker] ?? 0
    const pesoObjetivo = pesosObjetivo[ticker] ?? 0
    const diferencia = pesoObjetivo - pesoActual
    const accion: AccionRebalanceo =
      Math.abs(diferencia) < HOLD_THRESHOLD ? 'mantener' : diferencia > 0 ? 'comprar' : 'vender'
    return { ticker, pesoActual, pesoObjetivo, diferencia, importeEur: diferencia * total, accion }
  })
}

// Default target: the frontier point with the volatility closest to the
// current portfolio (same risk, best return). Ties go to the higher return.
export function defaultFrontierIndex(frontera: PuntoCartera[], actual: PuntoCartera): number | null {
  let best: number | null = null
  let bestDistance = Infinity

  for (const [index, punto] of frontera.entries()) {
    const distance = Math.abs(punto.volatilidad - actual.volatilidad)
    const tieWithHigherReturn =
      distance === bestDistance && best !== null && punto.rentabilidad > frontera[best].rentabilidad
    if (distance < bestDistance || tieWithHigherReturn) {
      best = index
      bestDistance = distance
    }
  }

  return best
}
