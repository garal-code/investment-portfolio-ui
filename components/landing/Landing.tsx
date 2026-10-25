import Link from 'next/link'
import { squarify } from '@/lib/squarify'
import { groupPositions } from '@/lib/portfolio-calc'
import { formatEur, formatFecha, treemapColor } from '@/lib/utils'
import { SAMPLE_MOVEMENTS, SAMPLE_POSITIONS } from './sample-portfolio'
import { ValueSample } from './ValueSample'
import { CompositionSample } from './CompositionSample'
import { PositionsSample } from './PositionsSample'
import { FrontierSample } from './FrontierSample'
import { Reveal } from './Reveal'
import './landing.css'

// Width/height ratio of the treemap set into the hero headline (in em).
const INLINE_W = 260
const INLINE_H = 78

function InlineTreemap() {
  const groups = groupPositions(SAMPLE_POSITIONS, 'posicion')
  const rects = squarify(groups.map(g => ({ ...g, v: g.valor })), 0, 0, INLINE_W, INLINE_H)
  return (
    <span className="lp-inline" aria-hidden="true">
      <span className="lp-inline__inner">
        {rects.map((r, i) => (
          <span
            key={r.key}
            className="lp-inline__tile"
            style={{
              left: `${(r.x / INLINE_W) * 100}%`,
              top: `${(r.y / INLINE_H) * 100}%`,
              width: `${(r.w / INLINE_W) * 100}%`,
              height: `${(r.h / INLINE_H) * 100}%`,
            }}
          >
            <span style={{ background: treemapColor(i).bg }} />
          </span>
        ))}
      </span>
    </span>
  )
}

function MovementsSample() {
  return (
    <div data-ui className="lp-ui lp-moves">
      <div className="lp-moves__head" aria-hidden="true">
        <span>Instrumento</span>
        <span>Tipo</span>
        <span>Fecha</span>
        <span>Cantidad</span>
        <span>Precio</span>
      </div>
      <ul aria-label="Movimientos de ejemplo">
        {SAMPLE_MOVEMENTS.map(m => (
          <li key={`${m.fecha}-${m.ticker}`} className="lp-moves__row">
            <span className="lp-moves__name">
              <strong>{m.nombre}</strong>
              <small>{m.ticker}</small>
            </span>
            <span>
              <span className={m.tipo === 'compra' ? 'lp-moves__buy' : 'lp-moves__sell'}>{m.tipo}</span>
            </span>
            <span>{formatFecha(m.fecha)}</span>
            <span>{m.cantidad}</span>
            <span>
              {formatEur(m.precio)}
              {m.comision > 0 && <small>comisión {formatEur(m.comision)}</small>}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

interface FeatureProps {
  id: string
  title: string
  children: React.ReactNode
  proof: React.ReactNode
  caption?: string
  layout?: 'split' | 'wide' | 'flip'
}

function Feature({ id, title, children, proof, caption, layout = 'split' }: FeatureProps) {
  return (
    <section className={layout === 'split' ? 'lp-feature' : `lp-feature lp-feature--${layout}`} aria-labelledby={id}>
      <div className="lp-feature__text">
        <h3 id={id} data-reveal>{title}</h3>
        <div data-reveal>{children}</div>
      </div>
      <figure className="lp-feature__proof" data-reveal>
        {proof}
        {caption && <figcaption>{caption}</figcaption>}
      </figure>
    </section>
  )
}

export function Landing() {
  return (
    <div className="lp">
      <Reveal />
      <header className="lp-nav">
        <Link href="/" className="lp-nav__brand">Garal · Cartera</Link>
        <nav aria-label="Principal" className="lp-nav__links">
          <a href="#funciones">Qué hace</a>
          <Link href="/login" className="lp-btn lp-btn--primary">Entrar</Link>
        </nav>
      </header>

      <main>
        <section className="lp-hero">
          <h1 className="lp-hero__title">
            <span className="lp-hero__line lp-hero__line--one">
              Tu cartera,<InlineTreemap />
            </span>{' '}
            <span className="lp-hero__line lp-hero__line--two">de un vistazo</span>
          </h1>
          <div className="lp-hero__foot">
            <p className="lp-hero__lede">
              Una herramienta para seguir tus inversiones: cuánto vale tu cartera, cómo está repartida y cómo va
              cada posición, en una sola pantalla.
            </p>
          </div>
        </section>

        <section id="funciones" className="lp-features" aria-labelledby="funciones-title">
          <h2 id="funciones-title" className="lp-features__title" data-reveal>Lo que ves al entrar</h2>

          <Feature
            id="f-valor"
            title="Cuánto vale y cuánto ganaste"
            proof={<ValueSample />}
            caption="Cartera de ejemplo. Prueba otro periodo."
          >
            <p>
              Arriba de todo, el valor de tu cartera y lo que ganaste o perdiste, en euros y en porcentaje.
              Elige el periodo: el último mes, lo que va de año o desde la primera compra.
            </p>
          </Feature>

          <Feature
            id="f-composicion"
            title="Cómo está repartida"
            layout="wide"
            proof={<CompositionSample height={380} />}
            caption="Pasa el cursor por un bloque para ver su peso."
          >
            <p>
              Cada posición es un bloque del tamaño de su peso en la cartera. Agrúpalos por sector, país o
              tipo de activo para ver dónde se concentra tu dinero.
            </p>
          </Feature>

          <Feature id="f-posiciones" title="Cada posición, en su moneda" layout="flip" proof={<PositionsSample />}>
            <p>
              El precio en la moneda en la que cotiza, el valor en euros y la rentabilidad de cada posición.
              Abre una fila para ver el precio medio, el coste, el sector o el ISIN.
            </p>
            <p>
              Si miras la cartera en público, el modo privacidad oculta todos los importes.
            </p>
          </Feature>

          <Feature id="f-movimientos" title="Tus compras y ventas" proof={<MovementsSample />}>
            <p>
              Registras cada compra y venta con su fecha, cantidad, precio y comisión. Con eso se calculan el
              precio medio, la plusvalía realizada y todo lo demás.
            </p>
          </Feature>

          <Feature id="f-frontera" title="Hacia una cartera eficiente" layout="flip" proof={<FrontierSample />}>
            <p>
              Con el modelo de Markowitz ves dónde está tu cartera frente a la frontera eficiente, y qué
              comprar o vender para llegar al nivel de riesgo que elijas.
            </p>
          </Feature>
        </section>

        <section className="lp-close" aria-labelledby="close-title">
          <h2 id="close-title" className="lp-close__title" data-reveal>¿Ya tienes cuenta?</h2>
          <div className="lp-close__choice" data-reveal>
            <Link href="/login" className="lp-btn lp-btn--light lp-btn--lg">Entrar</Link>
            <span className="lp-close__or">o</span>
            <Link href="/register" className="lp-btn lp-btn--ghost-light lp-btn--lg">Crear cuenta</Link>
          </div>
          <p className="lp-close__note" data-reveal>Al entrar vas directo al resumen de tu cartera.</p>
        </section>
      </main>

      <footer className="lp-footer">
        <div className="lp-footer__row">
          <span>Garal · Cartera</span>
          <span>Seguimiento de tu cartera de inversión</span>
        </div>
      </footer>
    </div>
  )
}
