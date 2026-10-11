'use client'
import { usePreferences } from '@/lib/preferences'
import { computeRebalancingMoves, type AccionRebalanceo } from '@/lib/rebalanceo'
import { formatEurSigned, formatPct, formatPeso, formatPp, formatRatioPct, maskAmount } from '@/lib/utils'
import type { PuntoCartera } from '@/types'

interface MovimientosTableProps {
  tickers: string[]
  actual: PuntoCartera
  objetivo: PuntoCartera
  valoresEur: Record<string, number>
}

const thStyle = {
  padding: '10px 16px',
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '.1em',
  textTransform: 'uppercase' as const,
  color: '#a09080',
  whiteSpace: 'nowrap' as const,
}

const tdStyle = { padding: '12px 16px', fontSize: 13, whiteSpace: 'nowrap' as const }

// Same buy/sell colours as the movements list; "mantener" stays neutral.
const ACCIONES: Record<AccionRebalanceo, { label: string; background: string; color: string }> = {
  comprar: { label: 'Comprar', background: 'var(--badge-accion-bg)', color: 'var(--badge-accion-fg)' },
  vender: { label: 'Vender', background: '#fdeef5', color: 'var(--color-plum)' },
  mantener: { label: 'Mantener', background: 'var(--badge-otro-bg)', color: 'var(--badge-otro-fg)' },
}

function Resumen({ label, punto, color }: { label: string; punto: PuntoCartera; color: string }) {
  return (
    <li className="flex flex-col gap-2" style={{ padding: '14px 16px', borderRadius: 10, background: '#faf7f3' }}>
      <span className="text-[12px] font-bold" style={{ color }}>{label}</span>
      <dl className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-1 text-[13px]">
        <dt style={{ color: 'var(--color-muted)' }}>Rentabilidad esperada</dt>
        <dd className="text-right font-medium">{formatPct(punto.rentabilidad * 100)}</dd>
        <dt style={{ color: 'var(--color-muted)' }}>Volatilidad</dt>
        <dd className="text-right font-medium">{formatRatioPct(punto.volatilidad)}</dd>
      </dl>
    </li>
  )
}

// Weight and EUR moves from the current portfolio to the chosen frontier
// point, over the analysed tickers only (see `computeRebalancingMoves`).
export function MovimientosTable({ tickers, actual, objetivo, valoresEur }: MovimientosTableProps) {
  const { privacy } = usePreferences()
  const moves = computeRebalancingMoves(tickers, actual.pesos, objetivo.pesos, valoresEur)

  return (
    <section
      aria-labelledby="movimientos-title"
      style={{ background: '#fff', border: '1px solid #ece7e1', borderRadius: 14, display: 'flex', flexDirection: 'column', minWidth: 0 }}
    >
      <div className="flex flex-col gap-4" style={{ padding: '22px 24px 14px' }}>
        <div>
          <h2 id="movimientos-title" className="font-serif" style={{ fontSize: 20, fontWeight: 700 }}>
            Movimientos para llegar al punto elegido
          </h2>
          <p style={{ fontSize: 13, color: 'var(--color-muted)' }}>
            Valores mensuales. Las diferencias de menos de 0,5 pp se marcan como Mantener.
          </p>
        </div>
        <ul aria-label="Comparación con el punto elegido" className="grid gap-3 sm:grid-cols-2">
          <Resumen label="Cartera actual" punto={actual} color="#8a3a6a" />
          <Resumen label="Punto elegido" punto={objetivo} color="#221e1a" />
        </ul>
      </div>
      <div className="overflow-x-auto">
        <table aria-labelledby="movimientos-title" className="w-full min-w-[620px]" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderTop: '1px solid #ece7e1', borderBottom: '1px solid #ece7e1' }}>
              <th scope="col" style={{ ...thStyle, textAlign: 'left', paddingLeft: 24 }}>Activo</th>
              <th scope="col" style={{ ...thStyle, textAlign: 'right' }}>Peso actual</th>
              <th scope="col" style={{ ...thStyle, textAlign: 'right' }}>Peso objetivo</th>
              <th scope="col" style={{ ...thStyle, textAlign: 'right' }}>Diferencia</th>
              <th scope="col" style={{ ...thStyle, textAlign: 'right' }}>Importe</th>
              <th scope="col" style={{ ...thStyle, textAlign: 'left', paddingRight: 24 }}>Acción</th>
            </tr>
          </thead>
          <tbody>
            {moves.map(move => {
              const accion = ACCIONES[move.accion]
              const deltaClass = move.accion === 'mantener' ? undefined : move.diferencia > 0 ? 'rent-pos' : 'rent-neg'
              return (
                <tr key={move.ticker} style={{ borderBottom: '1px solid #f5f0eb' }}>
                  <th scope="row" style={{ ...tdStyle, textAlign: 'left', fontWeight: 500, paddingLeft: 24 }}>{move.ticker}</th>
                  <td style={{ ...tdStyle, textAlign: 'right', color: '#6a5a4a' }}>{formatPeso(move.pesoActual)}</td>
                  <td style={{ ...tdStyle, textAlign: 'right', color: 'var(--color-primary)', fontWeight: 500 }}>
                    {formatPeso(move.pesoObjetivo)}
                  </td>
                  <td className={deltaClass} style={{ ...tdStyle, textAlign: 'right' }}>{formatPp(move.diferencia)}</td>
                  <td
                    className={deltaClass}
                    style={{ ...tdStyle, textAlign: 'right', color: deltaClass ? undefined : '#a09080' }}
                  >
                    {privacy ? maskAmount('EUR') : formatEurSigned(move.importeEur)}
                  </td>
                  <td style={{ ...tdStyle, paddingRight: 24 }}>
                    <span
                      className="text-[11px] font-bold px-2 py-0.5 rounded"
                      style={{ background: accion.background, color: accion.color }}
                    >
                      {accion.label}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <p style={{ padding: '14px 24px 20px', fontSize: 12, color: 'var(--color-muted)' }}>
        Las posiciones excluidas del análisis no se mueven. Las cifras son estimaciones basadas en
        rentabilidades históricas, no una recomendación. No se calcula el número de títulos.
      </p>
    </section>
  )
}
