import type { ReactNode } from 'react'
import { ChevronRight } from 'lucide-react'

// Id of the collapsible element, so the page header can open it and scroll to it.
export const METODOLOGIA_ID = 'metodologia'

// Plain-language summary of what garal-screener does (app/services/markowitz.py,
// precios.py). Keep it in sync with the backend when the method changes.
const PASOS: { title: string; body: ReactNode }[] = [
  {
    title: 'Qué es',
    body: (
      <p>
        La teoría de carteras de Markowitz (media-varianza) busca, para cada nivel de rentabilidad esperada, la
        combinación de tus activos con el menor riesgo posible. El conjunto de esas combinaciones es la frontera
        eficiente.
      </p>
    ),
  },
  {
    title: 'Qué activos entran',
    body: (
      <p>
        Las posiciones abiertas de la cartera. Se excluyen, y aparecen en el aviso de activos excluidos, las que no
        tienen ticker, no tienen precio actual, no tienen histórico de precios o tienen menos de 12 meses de
        histórico. Hacen falta al menos 2 activos válidos.
      </p>
    ),
  },
  {
    title: 'Datos',
    body: (
      <p>
        Cierre mensual ajustado (incluye dividendos y splits) de cada activo, en su moneda original: no se modela el
        riesgo de tipo de cambio. La ventana son los últimos 3, 5 o 10 años según el selector y termina en el último
        mes completo; el mes en curso nunca se usa.
      </p>
    ),
  },
  {
    title: 'Rentabilidades',
    body: (
      <p>
        Rentabilidad simple mensual = cierre del mes / cierre del mes anterior − 1. Solo se usan los meses con dato
        para todos los activos y hacen falta al menos 12 meses comunes.
      </p>
    ),
  },
  {
    title: 'Estadísticas',
    body: (
      <p>
        Rentabilidad esperada = media de las rentabilidades mensuales. Riesgo = volatilidad, la desviación típica
        mensual. La matriz de varianzas-covarianzas es muestral (divide entre n − 1) y de ella se derivan las
        correlaciones.
      </p>
    ),
  },
  {
    title: 'Cartera',
    body: (
      <>
        <ul className="list-disc pl-5">
          <li>Rentabilidad = Σ peso × rentabilidad esperada</li>
          <li>Varianza = Σ Σ pesoᵢ × pesoⱼ × covarianzaᵢⱼ</li>
          <li>Volatilidad = raíz cuadrada de la varianza</li>
        </ul>
        <p>Tu cartera actual usa como pesos el valor de mercado en EUR de cada posición incluida.</p>
      </>
    ),
  },
  {
    title: 'Frontera eficiente',
    body: (
      <p>
        Solo posiciones largas, sin ventas en corto ni apalancamiento: cada peso va del 0 % al 100 % y todos suman
        100 %. Se calcula la cartera de mínima varianza y, para 20 rentabilidades objetivo equiespaciadas entre la de
        mínima varianza y la del activo más rentable, se busca numéricamente la combinación de menor varianza.
      </p>
    ),
  },
  {
    title: 'Movimientos',
    body: (
      <p>
        Al elegir un punto, importe = (peso objetivo − peso actual) × valor total en EUR de las posiciones analizadas.
        Compras y ventas se compensan, así que no hace falta aportar dinero. Las diferencias menores de 0,5 puntos se
        marcan como «Mantener». Las posiciones excluidas no se tocan y no se calcula el número de acciones.
      </p>
    ),
  },
  {
    title: 'Limitaciones',
    body: (
      <p>
        Todas las cifras son mensuales, sin anualizar. Se basa en datos históricos: la rentabilidad pasada no
        garantiza la futura y las estimaciones cambian bastante según la ventana elegida. No tiene en cuenta
        comisiones, impuestos ni tipo de cambio. Es una herramienta orientativa, no una recomendación de inversión.
      </p>
    ),
  },
]

export function Metodologia() {
  return (
    <section
      aria-labelledby="metodologia-title"
      style={{ background: '#fff', border: '1px solid #ece7e1', borderRadius: 14, padding: '6px 24px' }}
    >
      <details id={METODOLOGIA_ID} className="group" style={{ scrollMarginTop: 20 }}>
        <summary className="flex cursor-pointer list-none items-start gap-2 py-4 [&::-webkit-details-marker]:hidden">
          <ChevronRight
            aria-hidden
            size={18}
            className="mt-1 shrink-0 transition-transform group-open:rotate-90"
            style={{ color: 'var(--color-muted)' }}
          />
          <span className="flex flex-col gap-0.5 min-w-0">
            <h2 id="metodologia-title" className="font-serif" style={{ fontSize: 20, fontWeight: 700 }}>
              ¿Cómo se calcula?
            </h2>
            <span style={{ fontSize: 13, color: 'var(--color-muted)' }}>
              El método paso a paso: qué datos se usan, cómo se obtiene la frontera y qué limitaciones tiene.
            </span>
          </span>
        </summary>

        <ol className="flex flex-col gap-4 pb-5" style={{ maxWidth: '72ch' }}>
          {PASOS.map(({ title, body }, i) => (
            <li key={title} className="flex flex-col gap-1" style={{ borderTop: '1px solid #ece7e1', paddingTop: 12 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600 }}>
                <span aria-hidden style={{ color: 'var(--color-muted)' }}>
                  {i + 1}.{' '}
                </span>
                {title}
              </h3>
              <div className="flex flex-col gap-1" style={{ fontSize: 13, lineHeight: 1.55, color: 'var(--color-ink-2)' }}>
                {body}
              </div>
            </li>
          ))}
        </ol>
      </details>
    </section>
  )
}
