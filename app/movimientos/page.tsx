'use client'
import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import { Topbar } from '@/components/layout/Topbar'
import { MovimientoForm } from '@/components/forms/MovimientoForm'
import { ImportarCsv } from '@/components/importacion/ImportarCsv'
import { Loading, EmptyState } from '@/components/ui/Loading'
import { useMovimientos, useEliminarMovimiento } from '@/hooks/useCartera'
import { useActiveCartera } from '@/contexts/CarteraContext'
import { CabeceraOrdenable, COLUMNAS_MOVIMIENTOS } from '@/components/movimientos/CabeceraOrdenable'
import { ORDEN_INICIAL, ordenarMovimientos, siguienteOrden, type OrdenMovimientos } from '@/lib/movimientos-orden'
import { formatCurrency, formatEur, formatFecha } from '@/lib/utils'
import { filterMovimientosPorIsin } from '@/lib/movimientos-filter'
import { Trash2, Plus, X, Upload } from 'lucide-react'

// `useSearchParams` requires a Suspense boundary for static builds (Next.js
// App Router) — see node_modules/next/dist/docs/.../use-search-params.md
// ("Missing Suspense boundary with useSearchParams"). The shell renders
// immediately from the fallback; the isin-aware content streams in once
// search params are available.
export default function MovimientosPage() {
  return (
    <Suspense
      fallback={
        <AppShell>
          <Topbar title="Movimientos" subtitle="Historial de operaciones" />
          <div className="flex-1 p-5">
            <Loading text="Cargando movimientos..." />
          </div>
        </AppShell>
      }
    >
      <MovimientosPageContent />
    </Suspense>
  )
}

function MovimientosPageContent() {
  // One panel at a time: the manual form or the CSV import
  const [panel, setPanel] = useState<'nuevo' | 'importar' | null>(null)
  const showForm = panel === 'nuevo'
  const { carteraId, isLoading: carteraLoading } = useActiveCartera()
  const { data: movs, isLoading, isError } = useMovimientos(carteraId)
  const { mutate: eliminar } = useEliminarMovimiento(carteraId)
  const router = useRouter()
  const searchParams = useSearchParams()
  const isinFiltro = searchParams.get('isin')
  const [orden, setOrden] = useState<OrdenMovimientos>(ORDEN_INICIAL)
  const movsFiltrados = movs ? ordenarMovimientos(filterMovimientosPorIsin(movs, isinFiltro), orden) : movs

  return (
    <AppShell>
      <Topbar title="Movimientos" subtitle="Historial de operaciones" />

      <div className="flex-1 overflow-y-auto p-5 space-y-4">

        {carteraLoading && <Loading text="Cargando carteras..." />}
        {!carteraLoading && carteraId === null && (
          <EmptyState text="No tienes carteras todavía. La gestión de carteras llega próximamente en Ajustes." />
        )}

        {carteraId !== null && (
        <>
        {/* Filtro activo por instrumento (deep link desde Posiciones) */}
        {isinFiltro && (
          <div
            className="flex items-center justify-between gap-2 px-3.5 py-2 rounded-lg text-[12px]"
            style={{ background: '#eef5f2', color: 'var(--color-primary)' }}
          >
            <span>Filtrando por {isinFiltro}</span>
            <button
              onClick={() => router.push('/movimientos')}
              className="font-medium underline underline-offset-2 hover:opacity-80"
            >
              Ver todos
            </button>
          </div>
        )}

        {/* Añadir: a mano o desde el CSV del broker */}
        <div className="flex justify-end gap-2">
          {panel !== 'importar' && (
            <button onClick={() => setPanel('importar')} className="btn-ghost flex items-center gap-2">
              <Upload size={14} />
              Importar CSV
            </button>
          )}
          <button
            onClick={() => setPanel(showForm ? null : 'nuevo')}
            className={showForm ? 'btn-ghost flex items-center gap-2' : 'btn-primary flex items-center gap-2'}
          >
            {showForm ? <X size={14} /> : <Plus size={14} />}
            {showForm ? 'Cancelar' : 'Nuevo movimiento'}
          </button>
        </div>

        {/* Formulario */}
        {showForm && (
          <div className="card p-5">
            <p className="section-label mb-4">Añadir movimiento</p>
            <MovimientoForm
              carteraId={carteraId}
              onSuccess={() => setPanel(null)}
            />
          </div>
        )}

        {panel === 'importar' && (
          <ImportarCsv carteraId={carteraId} onClose={() => setPanel(null)} />
        )}

        {/* Tabla */}
        {isLoading && <Loading text="Cargando movimientos..." />}

        {movsFiltrados && movsFiltrados.length > 0 && (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
            <table className="w-full text-[12px] border-collapse">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                  {COLUMNAS_MOVIMIENTOS.map(({ label, orden: columna }) => (
                    <CabeceraOrdenable
                      key={label}
                      label={label}
                      columna={columna}
                      orden={orden}
                      onOrdenar={c => setOrden(o => siguienteOrden(o, c))}
                      style={{
                        padding: '10px 14px',
                        fontSize: 9,
                        fontWeight: 700,
                        letterSpacing: '0.10em',
                        textTransform: 'uppercase',
                        color: 'var(--color-muted)',
                        textAlign: 'left',
                        whiteSpace: 'nowrap',
                      }}
                    />
                  ))}
                </tr>
              </thead>
              <tbody>
                {movsFiltrados.map(mov => (
                  <tr
                    key={mov.id}
                    style={{ borderBottom: '1px solid var(--color-border-2)' }}
                    className="transition-colors hover:bg-[#faf8f5]"
                  >
                    {/* Instrumento */}
                    <td className="px-3.5 py-[9px]">
                      <p className="font-medium min-w-[220px]" style={{ color: 'var(--color-ink)' }}>
                        {mov.instrumento.nombre || mov.instrumento.isin}
                      </p>
                      <p className="text-[10px] font-mono" style={{ color: 'var(--color-muted)' }}>
                        {mov.instrumento.isin}
                      </p>
                    </td>

                    {/* Tipo compra/venta */}
                    <td className="px-2 py-[9px]">
                      <span
                        className="text-[9px] font-bold px-2 py-0.5 rounded"
                        style={
                          mov.tipo === 'compra'
                            ? { background: 'var(--badge-accion-bg)', color: 'var(--badge-accion-fg)' }
                            : { background: '#fdeef5', color: 'var(--color-plum)' }
                        }
                      >
                        {mov.tipo}
                      </span>
                    </td>

                    <td className="px-3.5 py-[9px]" style={{ color: 'var(--color-ink-2)' }}>
                      {formatFecha(mov.fecha)}
                    </td>
                    <td className="px-3.5 py-[9px]" style={{ color: 'var(--color-ink-2)' }}>
                      {mov.cantidad}
                    </td>
                    <td className="px-3.5 py-[9px]" style={{ color: 'var(--color-ink-2)' }}>
                      {/* Native quote-currency price; the commission is stored in EUR */}
                      {formatCurrency(mov.precio, mov.instrumento.moneda || 'EUR')}
                    </td>
                    <td className="px-3.5 py-[9px]" style={{ color: 'var(--color-muted)' }}>
                      {mov.comision > 0 ? formatEur(mov.comision) : '—'}
                    </td>

                    {/* Eliminar */}
                    <td className="px-3.5 py-[9px]">
                      <button
                        onClick={() => {
                          if (window.confirm('¿Eliminar este movimiento? Esta acción no se puede deshacer.')) {
                            eliminar(mov.id)
                          }
                        }}
                        className="p-1 transition-colors hover:text-[var(--color-plum)]"
                        style={{ color: 'var(--color-muted)' }}
                        title="Eliminar movimiento"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        )}

        {isError && (
          <EmptyState text="Error al cargar los movimientos. Verificá la conexión con el backend." />
        )}
        {!isLoading && !isError && movs?.length === 0 && (
          <EmptyState text="No hay movimientos aún. Añade tu primera operación." />
        )}
        {!isLoading && !isError && movs && movs.length > 0 && movsFiltrados?.length === 0 && (
          <EmptyState text={`No hay movimientos para ${isinFiltro}.`} />
        )}
        </>
        )}
      </div>
    </AppShell>
  )
}
