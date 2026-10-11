'use client'
import { usePreferences } from '@/lib/preferences'
import { formatEur, formatPeso, maskAmount } from '@/lib/utils'
import type { PuntoCartera } from '@/types'

interface PesosTableProps {
  tickers: string[]
  actual: PuntoCartera
  minimaVarianza: PuntoCartera
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

// One row per analysed ticker: current weight vs minimum-variance weight,
// plus the current EUR value the current weights were derived from.
export function PesosTable({ tickers, actual, minimaVarianza, valoresEur }: PesosTableProps) {
  const { privacy } = usePreferences()

  return (
    <section
      aria-labelledby="pesos-title"
      style={{ background: '#fff', border: '1px solid #ece7e1', borderRadius: 14, display: 'flex', flexDirection: 'column', minWidth: 0 }}
    >
      <div style={{ padding: '22px 24px 14px' }}>
        <h2 id="pesos-title" className="font-serif" style={{ fontSize: 20, fontWeight: 700 }}>Pesos por activo</h2>
        <p style={{ fontSize: 13, color: 'var(--color-muted)' }}>Cartera actual frente a la de mínima varianza</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[460px]" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderTop: '1px solid #ece7e1', borderBottom: '1px solid #ece7e1' }}>
              <th scope="col" style={{ ...thStyle, textAlign: 'left', paddingLeft: 24 }}>Activo</th>
              <th scope="col" style={{ ...thStyle, textAlign: 'right' }}>Valor actual</th>
              <th scope="col" style={{ ...thStyle, textAlign: 'right' }}>Cartera actual</th>
              <th scope="col" style={{ ...thStyle, textAlign: 'right', paddingRight: 24 }}>Mínima varianza</th>
            </tr>
          </thead>
          <tbody>
            {tickers.map(ticker => (
              <tr key={ticker} style={{ borderBottom: '1px solid #f5f0eb' }}>
                <th scope="row" style={{ ...tdStyle, textAlign: 'left', fontWeight: 500, paddingLeft: 24 }}>{ticker}</th>
                <td style={{ ...tdStyle, textAlign: 'right', color: '#6a5a4a' }}>
                  {privacy ? maskAmount('EUR') : formatEur(valoresEur[ticker])}
                </td>
                <td style={{ ...tdStyle, textAlign: 'right' }}>{formatPeso(actual.pesos[ticker] ?? 0)}</td>
                <td style={{ ...tdStyle, textAlign: 'right', paddingRight: 24, color: 'var(--color-primary)', fontWeight: 500 }}>
                  {formatPeso(minimaVarianza.pesos[ticker] ?? 0)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
