// Sample portfolio shown on the public landing. It is run through the same
// calculations as the dashboard (buildPositionViewModels / groupPositions),
// so every figure on the landing adds up the way it would in the app.
import { buildPositionViewModels, type PositionViewModel } from '@/lib/portfolio-calc'
import type { PeriodoSeleccionado } from '@/components/dashboard/ValueBlock'
import type { Posicion, PuntoCartera } from '@/types'

interface SampleHolding {
  isin: string
  ticker: string
  nombre: string
  tipo: string
  sector: string
  pais: string
  moneda: string
  cantidad: number
  precioMedio: number
  precioEur: number
  precioNativo?: number
}

const HOLDINGS: SampleHolding[] = [
  { isin: 'IE00B4L5Y983', ticker: 'IWDA', nombre: 'iShares Core MSCI World', tipo: 'ETF', sector: 'Global', pais: 'Irlanda', moneda: 'EUR', cantidad: 120, precioMedio: 78.4, precioEur: 104.6 },
  { isin: 'US5949181045', ticker: 'MSFT', nombre: 'Microsoft', tipo: 'Acción', sector: 'Tecnología', pais: 'EE. UU.', moneda: 'USD', cantidad: 14, precioMedio: 289.5, precioEur: 401.3, precioNativo: 436.2 },
  { isin: 'IE00B18GC888', ticker: 'VGBI', nombre: 'Vanguard Global Bond Index', tipo: 'Fondo', sector: 'Renta fija', pais: 'Irlanda', moneda: 'EUR', cantidad: 210.5, precioMedio: 21.3, precioEur: 20.85 },
  { isin: 'ES0113900J37', ticker: 'SAN', nombre: 'Banco Santander', tipo: 'Acción', sector: 'Financiero', pais: 'España', moneda: 'EUR', cantidad: 600, precioMedio: 3.62, precioEur: 5.48 },
  { isin: 'US02079K3059', ticker: 'GOOGL', nombre: 'Alphabet', tipo: 'Acción', sector: 'Tecnología', pais: 'EE. UU.', moneda: 'USD', cantidad: 18, precioMedio: 118.4, precioEur: 164.6, precioNativo: 178.9 },
  { isin: 'ES0148396007', ticker: 'ITX', nombre: 'Inditex', tipo: 'Acción', sector: 'Consumo', pais: 'España', moneda: 'EUR', cantidad: 45, precioMedio: 41.2, precioEur: 38.9 },
]

const cents = (value: number) => Math.round(value * 100) / 100

function toPosicion(h: SampleHolding, id: number): Posicion {
  const extranjera = h.moneda !== 'EUR'
  return {
    instrumento: { id, isin: h.isin, ticker: h.ticker, nombre: h.nombre, tipo: h.tipo, sector: h.sector, pais: h.pais, moneda: h.moneda },
    cantidad_actual: h.cantidad,
    coste_total: cents(h.cantidad * h.precioMedio),
    precio_medio: h.precioMedio,
    plusvalia_realizada: 0,
    precio_actual_eur: h.precioEur,
    valor_actual_eur: cents(h.cantidad * h.precioEur),
    moneda_nativa: h.moneda,
    precio_actual_nativo: extranjera ? h.precioNativo : null,
  }
}

const posiciones = HOLDINGS.map((h, i) => toPosicion(h, i + 1))

export const SAMPLE_TOTAL = cents(posiciones.reduce((sum, p) => sum + (p.valor_actual_eur ?? 0), 0))
export const SAMPLE_INVERTIDO = cents(posiciones.reduce((sum, p) => sum + p.coste_total, 0))
export const SAMPLE_PLUSVALIA_REALIZADA = 842.1

export const SAMPLE_POSITIONS: PositionViewModel[] = buildPositionViewModels(posiciones, SAMPLE_TOTAL)

// Gain over each period. Every percentage is the gain over the portfolio's
// value at the start of that period (SAMPLE_TOTAL − plus).
export const SAMPLE_PERIODS: Record<PeriodoSeleccionado, { plus: number; pct: number }> = {
  '1m': { plus: -218.4, pct: -0.71 },
  '3m': { plus: 1104.8, pct: 3.75 },
  '6m': { plus: 2031.1, pct: 7.12 },
  ytd: { plus: 2684.4, pct: 9.63 },
  '1y': { plus: 3912.7, pct: 14.68 },
  total: {
    plus: cents(SAMPLE_TOTAL - SAMPLE_INVERTIDO),
    pct: (SAMPLE_TOTAL / SAMPLE_INVERTIDO - 1) * 100,
  },
}

export interface SampleMovement {
  fecha: string
  tipo: 'compra' | 'venta'
  nombre: string
  ticker: string
  cantidad: string
  precio: number
  comision: number
}

export const SAMPLE_MOVEMENTS: SampleMovement[] = [
  { fecha: '2026-10-06', tipo: 'compra', nombre: 'iShares Core MSCI World', ticker: 'IWDA', cantidad: '20 títulos', precio: 101.85, comision: 2 },
  { fecha: '2026-09-15', tipo: 'venta', nombre: 'Inditex', ticker: 'ITX', cantidad: '15 títulos', precio: 40.1, comision: 2 },
  { fecha: '2026-07-01', tipo: 'compra', nombre: 'Vanguard Global Bond Index', ticker: 'VGBI', cantidad: '50 part.', precio: 20.92, comision: 0 },
  { fecha: '2026-05-12', tipo: 'compra', nombre: 'Alphabet', ticker: 'GOOGL', cantidad: '6 títulos', precio: 141.3, comision: 1.5 },
]

// Efficient frontier for the sample: monthly volatility and return as
// fractions, weights moving from the bond fund towards equities.
const FRONTIER_TICKERS = ['IWDA', 'MSFT', 'VGBI', 'SAN', 'GOOGL', 'ITX']

function frontierPoint(step: number, steps: number): PuntoCartera {
  const t = step / (steps - 1)
  const volatilidad = 0.021 + 0.039 * t
  const rentabilidad = 0.0032 + 0.0084 * Math.sqrt(t)
  const bonos = 0.62 * (1 - t)
  const resto = 1 - bonos
  return {
    volatilidad,
    rentabilidad,
    varianza: volatilidad ** 2,
    pesos: {
      VGBI: bonos,
      IWDA: resto * 0.46,
      MSFT: resto * 0.22,
      GOOGL: resto * 0.16,
      SAN: resto * 0.1,
      ITX: resto * 0.06,
    },
  }
}

export const SAMPLE_FRONTIER = {
  tickers: FRONTIER_TICKERS,
  frontera: Array.from({ length: 12 }, (_, i) => frontierPoint(i, 12)),
  minimaVarianza: frontierPoint(0, 12),
  actual: {
    volatilidad: 0.043,
    rentabilidad: 0.0071,
    varianza: 0.043 ** 2,
    pesos: Object.fromEntries(SAMPLE_POSITIONS.map(p => [p.ticker, p.peso])),
  } satisfies PuntoCartera,
}
