import { formatPct, formatRatioPct } from '@/lib/utils'
import type { PuntoCartera } from '@/types'

interface CifrasClaveProps {
  actual: PuntoCartera
  minimaVarianza: PuntoCartera
}

function Cifra({ label, rentabilidad, volatilidad, color }: {
  label: string
  rentabilidad: number
  volatilidad: number
  color: string
}) {
  return (
    <div className="flex flex-col gap-2" style={{ padding: '14px 16px', borderRadius: 10, background: '#faf7f3' }}>
      <span className="text-[12px] font-bold" style={{ color }}>{label}</span>
      <dl className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-1 text-[13px]">
        <dt style={{ color: 'var(--color-muted)' }}>Rentabilidad esperada</dt>
        <dd className="text-right font-medium">{formatPct(rentabilidad * 100)}</dd>
        <dt style={{ color: 'var(--color-muted)' }}>Volatilidad</dt>
        <dd className="text-right font-medium">{formatRatioPct(volatilidad)}</dd>
      </dl>
    </div>
  )
}

export function CifrasClave({ actual, minimaVarianza }: CifrasClaveProps) {
  return (
    <section
      aria-labelledby="cifras-title"
      className="flex flex-col gap-4"
      style={{ background: '#fff', border: '1px solid #ece7e1', borderRadius: 14, padding: 24 }}
    >
      <div>
        <h2 id="cifras-title" className="font-serif" style={{ fontSize: 20, fontWeight: 700 }}>Cifras clave</h2>
        <p style={{ fontSize: 13, color: 'var(--color-muted)' }}>Valores mensuales</p>
      </div>
      <Cifra
        label="Cartera actual"
        rentabilidad={actual.rentabilidad}
        volatilidad={actual.volatilidad}
        color="#8a3a6a"
      />
      <Cifra
        label="Mínima varianza"
        rentabilidad={minimaVarianza.rentabilidad}
        volatilidad={minimaVarianza.volatilidad}
        color="#c4956a"
      />
    </section>
  )
}
