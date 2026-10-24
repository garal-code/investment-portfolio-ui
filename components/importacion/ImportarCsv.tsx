'use client'
import { useEffect, useRef, useState } from 'react'
import { PlantillaEditor } from './PlantillaEditor'
import { PrevisualizacionTabla } from './PrevisualizacionTabla'
import {
  useConfirmarImportacion,
  useEliminarPlantilla,
  useGuardarPlantilla,
  useInspeccionarCsv,
  usePlantillas,
  usePrevisualizarImportacion,
} from '@/hooks/useImportacion'
import {
  MAX_CONTENIDO_CSV,
  borradorDesdePlantilla,
  borradorVacio,
  configDesdeBorrador,
  mensajeErrorApi,
  validarBorrador,
  type BorradorPlantilla,
} from '@/lib/importacion'
import { getErrorStatus } from '@/lib/utils'
import type {
  DelimitadorCsv,
  InspeccionCsv,
  PlantillaImportacion,
  PrevisualizacionImportacion,
  ResultadoImportacion,
} from '@/types'

interface ImportarCsvProps {
  carteraId: number
  onClose: () => void
}

type Paso = 'archivo' | 'columnas' | 'revision' | 'resultado'

const PASOS: { paso: Paso; label: string }[] = [
  { paso: 'archivo', label: 'Archivo' },
  { paso: 'columnas', label: 'Columnas' },
  { paso: 'revision', label: 'Revisión' },
]

const NUEVA = 'nueva'

function plural(n: number, singular: string, varios: string) {
  return `${n} ${n === 1 ? singular : varios}`
}

// Import flow: pick the file and a template (or map a new one), review what
// would be imported and why, then confirm with the preview's fingerprint.
export function ImportarCsv({ carteraId, onClose }: ImportarCsvProps) {
  const [paso, setPaso] = useState<Paso>('archivo')
  const [archivo, setArchivo] = useState<{ nombre: string; contenido: string | null } | null>(null)
  const [seleccion, setSeleccion] = useState<string>('')
  const [inspeccion, setInspeccion] = useState<InspeccionCsv | null>(null)
  const [borrador, setBorrador] = useState<BorradorPlantilla | null>(null)
  // Template being edited; undefined while creating a new one
  const [editandoId, setEditandoId] = useState<number | undefined>(undefined)
  const [erroresBorrador, setErroresBorrador] = useState<string[]>([])
  const [plantillaId, setPlantillaId] = useState<number | null>(null)
  const [previsualizacion, setPrevisualizacion] = useState<PrevisualizacionImportacion | null>(null)
  const [resultado, setResultado] = useState<ResultadoImportacion | null>(null)
  const [error, setError] = useState('')
  // Quiet confirmation after saving a template without a file
  const [aviso, setAviso] = useState('')
  const [obsoleta, setObsoleta] = useState(false)

  const panelRef = useRef<HTMLDivElement>(null)

  // The review needs the whole screen: bring the panel to the top so the
  // preview table can fill the viewport
  useEffect(() => {
    if (paso !== 'revision') return
    const reducido = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    panelRef.current?.scrollIntoView?.({ behavior: reducido ? 'auto' : 'smooth', block: 'start' })
  }, [paso])

  const { data: plantillas, isLoading: cargandoPlantillas } = usePlantillas()
  const inspeccionar = useInspeccionarCsv()
  const guardar = useGuardarPlantilla()
  const eliminar = useEliminarPlantilla()
  const previsualizar = usePrevisualizarImportacion(carteraId)
  const confirmar = useConfirmarImportacion(carteraId)

  // Default to the first saved template, or to a new one when there are none.
  // '' means "not chosen yet" (first load, or the chosen one was deleted).
  useEffect(() => {
    if (plantillas && seleccion === '') setSeleccion(plantillas[0] ? String(plantillas[0].id) : NUEVA)
  }, [plantillas, seleccion])

  const plantillaElegida = plantillas?.find(p => String(p.id) === seleccion)
  const contenido = archivo?.contenido ?? null

  async function leerArchivo(file: File | undefined) {
    setError('')
    setAviso('')
    if (!file) {
      setArchivo(null)
      return
    }
    const texto = await file.text()
    if (texto.length > MAX_CONTENIDO_CSV) {
      setArchivo({ nombre: file.name, contenido: null })
      setError('El archivo es demasiado grande (máximo 2.000.000 caracteres).')
      return
    }
    setArchivo({ nombre: file.name, contenido: texto })
  }

  async function lanzarPrevisualizacion(id: number) {
    if (contenido === null) return
    setError('')
    setObsoleta(false)
    try {
      const datos = await previsualizar.mutateAsync({ contenido, plantillaId: id })
      setPlantillaId(id)
      setPrevisualizacion(datos)
      setPaso('revision')
    } catch (e) {
      setError(mensajeErrorApi(e, 'No se pudo previsualizar el archivo.'))
    }
  }

  async function abrirEditor(delimitador: DelimitadorCsv | null, base: BorradorPlantilla | null, id?: number) {
    if (contenido === null) return
    setError('')
    setAviso('')
    try {
      const datos = await inspeccionar.mutateAsync({ contenido, delimitador })
      setInspeccion(datos)
      setBorrador(base ?? borradorVacio(datos))
      setEditandoId(id)
      setErroresBorrador([])
      setPaso('columnas')
    } catch (e) {
      setError(mensajeErrorApi(e, 'No se pudo leer el archivo.'))
    }
  }

  // With a file, the editor reads it with the template's delimiter to offer its
  // headers; without one, the saved values are edited by hand.
  async function editarPlantilla(plantilla: PlantillaImportacion) {
    const base = borradorDesdePlantilla(plantilla)
    if (contenido !== null) return abrirEditor(plantilla.config.delimitador, base, plantilla.id)
    setError('')
    setAviso('')
    setInspeccion(null)
    setBorrador(base)
    setEditandoId(plantilla.id)
    setErroresBorrador([])
    setPaso('columnas')
  }

  async function cambiarDelimitador(delimitador: DelimitadorCsv | null) {
    if (!borrador) return
    if (contenido === null) {
      setBorrador({ ...borrador, delimitador })
      return
    }
    setError('')
    try {
      const datos = await inspeccionar.mutateAsync({ contenido, delimitador })
      setInspeccion(datos)
      setBorrador({ ...borrador, delimitador })
    } catch (e) {
      setError(mensajeErrorApi(e, 'No se pudo leer el archivo con ese separador.'))
    }
  }

  async function guardarYPrevisualizar() {
    if (!borrador) return
    const errores = validarBorrador(borrador, inspeccion?.columnas ?? null)
    setErroresBorrador(errores)
    if (errores.length > 0) return
    setError('')
    try {
      const guardada = await guardar.mutateAsync({ id: editandoId, data: configDesdeBorrador(borrador) })
      setSeleccion(String(guardada.id))
      if (contenido === null) {
        setAviso(`Plantilla "${guardada.nombre}" guardada.`)
        setPaso('archivo')
        return
      }
      await lanzarPrevisualizacion(guardada.id)
    } catch (e) {
      setError(mensajeErrorApi(e, 'No se pudo guardar la plantilla.'))
    }
  }

  async function eliminarPlantilla() {
    if (!plantillaElegida) return
    if (!window.confirm(`¿Eliminar la plantilla "${plantillaElegida.nombre}"?`)) return
    setError('')
    try {
      await eliminar.mutateAsync(plantillaElegida.id)
      setSeleccion('')
    } catch (e) {
      setError(mensajeErrorApi(e, 'No se pudo eliminar la plantilla.'))
    }
  }

  async function importar() {
    if (contenido === null || plantillaId === null || !previsualizacion) return
    setError('')
    try {
      const datos = await confirmar.mutateAsync({ contenido, plantillaId, huella: previsualizacion.huella })
      setResultado(datos)
      setPaso('resultado')
    } catch (e) {
      setObsoleta(getErrorStatus(e) === 409)
      setError(mensajeErrorApi(e, 'No se pudo importar el archivo.'))
    }
  }

  function empezarDeNuevo() {
    setArchivo(null)
    setPrevisualizacion(null)
    setResultado(null)
    setError('')
    setObsoleta(false)
    setPaso('archivo')
  }

  const ocupado = inspeccionar.isPending || previsualizar.isPending || guardar.isPending || confirmar.isPending

  return (
    <div ref={panelRef} className="card p-5 space-y-5 scroll-mt-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-serif text-[17px] font-bold" style={{ color: 'var(--color-ink)' }}>Importar desde CSV</p>
        {paso !== 'resultado' && (
          <ol className="flex gap-3 text-[12px]" aria-label="Pasos">
            {PASOS.map(({ paso: p, label }, i) => (
              <li
                key={p}
                aria-current={p === paso ? 'step' : undefined}
                style={{ color: p === paso ? 'var(--color-ink)' : 'var(--color-ink-2)', fontWeight: p === paso ? 500 : 400 }}
              >
                {i + 1}. {label}
              </li>
            ))}
          </ol>
        )}
      </div>

      {paso === 'archivo' && (
        <div className="space-y-4">
          <p className="text-[13px]" style={{ color: 'var(--color-ink-2)' }}>
            Sube el CSV de operaciones que exporta tu broker. La plantilla indica qué columna tiene cada dato; la
            configuras una vez y la reutilizas en cada importación.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="section-label" htmlFor="importar-archivo">Archivo CSV</label>
              <input
                id="importar-archivo"
                type="file"
                accept=".csv,text/csv"
                className="input-dark text-[13px] file:mr-3 file:border-0 file:bg-transparent file:p-0 file:font-medium file:text-primary file:cursor-pointer"
                onChange={e => leerArchivo(e.target.files?.[0])}
              />
              {archivo && (
                <p className="mt-1 text-[12px] font-mono truncate" style={{ color: 'var(--color-ink-2)' }}>
                  {archivo.nombre}
                </p>
              )}
            </div>
            <div>
              <label className="section-label" htmlFor="importar-plantilla">Plantilla</label>
              <select
                id="importar-plantilla"
                className="input-dark"
                value={seleccion}
                disabled={cargandoPlantillas}
                onChange={e => setSeleccion(e.target.value)}
              >
                {plantillas?.map(p => <option key={p.id} value={String(p.id)}>{p.nombre}</option>)}
                <option value={NUEVA}>Nueva plantilla…</option>
              </select>
              {plantillaElegida && (
                <div className="mt-1.5 flex gap-4 text-[12px]">
                  <button
                    type="button"
                    className="font-medium underline underline-offset-2 disabled:opacity-40"
                    style={{ color: 'var(--color-primary)' }}
                    disabled={ocupado}
                    onClick={() => editarPlantilla(plantillaElegida)}
                  >
                    Editar plantilla
                  </button>
                  <button
                    type="button"
                    className="font-medium underline underline-offset-2 disabled:opacity-40"
                    style={{ color: 'var(--color-plum)' }}
                    disabled={eliminar.isPending}
                    onClick={eliminarPlantilla}
                  >
                    Eliminar plantilla
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {paso === 'archivo' && aviso && (
        <p role="status" className="text-[13px]" style={{ color: 'var(--color-primary)' }}>{aviso}</p>
      )}

      {paso === 'columnas' && borrador && (
        <PlantillaEditor
          inspeccion={inspeccion}
          borrador={borrador}
          onChange={setBorrador}
          onDelimitadorChange={cambiarDelimitador}
        />
      )}

      {paso === 'revision' && previsualizacion && (
        <PrevisualizacionTabla previsualizacion={previsualizacion} />
      )}

      {paso === 'resultado' && resultado && (
        <div className="space-y-1">
          <p className="font-serif text-[20px] font-bold" style={{ color: 'var(--color-ink)' }}>
            {resultado.importados === 1
              ? 'Se ha importado 1 movimiento.'
              : `Se han importado ${resultado.importados} movimientos.`}
          </p>
          {resultado.omitidos > 0 && (
            <p className="text-[13px]" style={{ color: 'var(--color-ink-2)' }}>
              {plural(resultado.omitidos, 'fila omitida', 'filas omitidas')}.
            </p>
          )}
        </div>
      )}

      {erroresBorrador.length > 0 && paso === 'columnas' && (
        <ul className="text-[13px] space-y-1 px-3.5 py-3 rounded-[10px]" style={{ background: '#fdf6ee', color: 'var(--color-ink)' }}>
          {erroresBorrador.map(e => <li key={e}>{e}</li>)}
        </ul>
      )}

      {error && (
        <p role="alert" className="text-[13px]" style={{ color: 'var(--color-plum)' }}>{error}</p>
      )}

      {/* Acciones del paso */}
      <div className="flex flex-wrap justify-end gap-2">
        {paso === 'archivo' && (
          <>
            <button type="button" className="btn-ghost" onClick={onClose}>Cancelar</button>
            {seleccion === NUEVA ? (
              <button
                type="button"
                className="btn-primary"
                disabled={contenido === null || ocupado}
                onClick={() => abrirEditor(null, null)}
              >
                {inspeccionar.isPending ? 'Leyendo…' : 'Configurar columnas'}
              </button>
            ) : (
              <button
                type="button"
                className="btn-primary"
                disabled={contenido === null || !plantillaElegida || ocupado}
                onClick={() => plantillaElegida && lanzarPrevisualizacion(plantillaElegida.id)}
              >
                {previsualizar.isPending ? 'Leyendo…' : 'Previsualizar'}
              </button>
            )}
          </>
        )}

        {paso === 'columnas' && (
          <>
            <button type="button" className="btn-ghost" onClick={() => setPaso('archivo')}>Atrás</button>
            <button type="button" className="btn-primary" disabled={ocupado} onClick={guardarYPrevisualizar}>
              {guardar.isPending || previsualizar.isPending
                ? 'Guardando…'
                : contenido === null ? 'Guardar plantilla' : 'Guardar plantilla y previsualizar'}
            </button>
          </>
        )}

        {paso === 'revision' && previsualizacion && (
          <>
            <button type="button" className="btn-ghost" onClick={() => { setError(''); setPaso('archivo') }}>
              Atrás
            </button>
            {obsoleta ? (
              <button
                type="button"
                className="btn-primary"
                disabled={ocupado}
                onClick={() => plantillaId !== null && lanzarPrevisualizacion(plantillaId)}
              >
                Volver a previsualizar
              </button>
            ) : (
              <button
                type="button"
                className="btn-primary"
                disabled={previsualizacion.resumen.importar === 0 || ocupado}
                onClick={importar}
              >
                {previsualizacion.resumen.importar === 0
                  ? 'No hay filas que importar'
                  : confirmar.isPending
                    ? 'Importando…'
                    : `Importar ${plural(previsualizacion.resumen.importar, 'movimiento', 'movimientos')}`}
              </button>
            )}
          </>
        )}

        {paso === 'resultado' && (
          <>
            <button type="button" className="btn-ghost" onClick={empezarDeNuevo}>Importar otro archivo</button>
            <button type="button" className="btn-primary" onClick={onClose}>Cerrar</button>
          </>
        )}
      </div>
    </div>
  )
}
