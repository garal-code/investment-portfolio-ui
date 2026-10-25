'use client'
import { useState } from 'react'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { CAMPO, Selector } from './Campo'
import {
  COLUMNAS_OBLIGATORIAS,
  COLUMNAS_OPCIONALES,
  clasificacionDe,
  clasificarValor,
  columnasDeBorrador,
  muestraDeColumna,
  type BorradorPlantilla,
  type Clasificacion,
} from '@/lib/importacion'
import type { DelimitadorCsv, InspeccionCsv, SeparadorDecimal } from '@/types'

interface PlantillaEditorProps {
  // null when editing a saved template without a file: columns and type
  // values are typed by hand instead of picked from the file
  inspeccion: InspeccionCsv | null
  borrador: BorradorPlantilla
  onChange: (borrador: BorradorPlantilla) => void
  // A new delimiter changes the headers, so the parent inspects the file again
  onDelimitadorChange: (delimitador: DelimitadorCsv | null) => void
}

const DELIMITADORES: { value: string; label: string }[] = [
  { value: '', label: 'Detectar automáticamente' },
  { value: ',', label: 'Coma ( , )' },
  { value: ';', label: 'Punto y coma ( ; )' },
  { value: '\t', label: 'Tabulador' },
  { value: '|', label: 'Barra vertical ( | )' },
]

const SEPARADORES: { value: SeparadorDecimal; label: string }[] = [
  { value: '.', label: 'Punto · 1234.56' },
  { value: ',', label: 'Coma · 1234,56' },
]

const CLASIFICACIONES: { value: Clasificacion; label: string }[] = [
  { value: 'compra', label: 'Compra' },
  { value: 'venta', label: 'Venta' },
  { value: 'ignorar', label: 'Ignorar' },
]

const LISTA_COLUMNAS = 'plantilla-columnas-conocidas'

function Muestra({ inspeccion, columna }: { inspeccion: InspeccionCsv | null; columna: string }) {
  const muestra = inspeccion && columna ? muestraDeColumna(inspeccion, columna) : null
  if (!muestra) return null
  return (
    <p className="mt-1 text-[12px] truncate" style={{ color: 'var(--color-ink-2)' }}>
      {`Ej.: ${muestra}`}
    </p>
  )
}

// Comma-separated values typed by hand: type values when the file is missing
// or has too many distinct values to list (the backend returns up to 20), and
// commission columns when there is no file.
function ValoresTexto({ label, valores, onChange, placeholder = 'Market buy, Limit buy' }: {
  label: string
  valores: string[]
  onChange: (valores: string[]) => void
  placeholder?: string
}) {
  const [texto, setTexto] = useState(valores.join(', '))
  return (
    <div>
      <label className="section-label" htmlFor={`valores-${label}`}>{label}</label>
      <input
        id={`valores-${label}`}
        className={CAMPO}
        placeholder={placeholder}
        value={texto}
        onChange={e => {
          setTexto(e.target.value)
          onChange(e.target.value.split(',').map(v => v.trim()).filter(Boolean))
        }}
      />
    </div>
  )
}

// A file offers its headers to pick from; without one the header is typed,
// with the template's current columns as suggestions.
function CampoColumna({ id, etiqueta, valor, vacio, columnasCsv, onChange }: {
  id: string
  etiqueta: string
  valor: string
  vacio: string
  columnasCsv: string[] | null
  onChange: (valor: string) => void
}) {
  if (columnasCsv === null) {
    return (
      <input
        id={id}
        aria-label={`Columna de ${etiqueta}`}
        className={CAMPO}
        list={LISTA_COLUMNAS}
        placeholder={vacio}
        value={valor}
        onChange={e => onChange(e.target.value)}
      />
    )
  }
  return (
    <Selector
      id={id}
      aria-label={`Columna de ${etiqueta}`}
      value={valor}
      onChange={e => onChange(e.target.value)}
    >
      <option value="">{vacio}</option>
      {columnasCsv.map(c => <option key={c} value={c}>{c}</option>)}
    </Selector>
  )
}

export function PlantillaEditor({ inspeccion, borrador, onChange, onDelimitadorChange }: PlantillaEditorProps) {
  const { columnas } = borrador
  const setColumna = (campo: keyof BorradorPlantilla['columnas'], valor: string) =>
    onChange({ ...borrador, columnas: { ...columnas, [campo]: valor } })
  const toggleComision = (columna: string) =>
    onChange({
      ...borrador,
      columnas: {
        ...columnas,
        comision: columnas.comision.includes(columna)
          ? columnas.comision.filter(c => c !== columna)
          : [...columnas.comision, columna],
      },
    })
  const columnasCsv = inspeccion?.columnas ?? null
  const valoresTipo = inspeccion && columnas.tipo ? inspeccion.valores_distintos[columnas.tipo] : undefined
  // Computed once per opening: suggestions must not shrink while typing
  const [conocidas] = useState(() => columnasDeBorrador(borrador))

  return (
    <div className="space-y-6">
      {!inspeccion && (
        <p className="text-[13px] px-3.5 py-3 rounded-[10px]" style={{ background: '#fdf6ee', color: 'var(--color-ink)' }}>
          Estás editando sin archivo: escribe los nombres de columna tal como aparecen en la cabecera del CSV. Si
          subes un archivo, podrás elegirlos de una lista y ver ejemplos.
        </p>
      )}
      <datalist id={LISTA_COLUMNAS}>
        {conocidas.map(c => <option key={c} value={c} />)}
      </datalist>
      <div>
        <label className="section-label" htmlFor="plantilla-nombre">Nombre de la plantilla</label>
        <input
          id="plantilla-nombre"
          className={CAMPO}
          placeholder="Ej.: mi broker"
          maxLength={100}
          value={borrador.nombre}
          onChange={e => onChange({ ...borrador, nombre: e.target.value })}
        />
      </div>

      {/* Cómo se lee el archivo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="section-label" htmlFor="plantilla-delimitador">Separador de columnas</label>
          <Selector
            id="plantilla-delimitador"
            value={borrador.delimitador ?? ''}
            onChange={e => onDelimitadorChange((e.target.value || null) as DelimitadorCsv | null)}
          >
            {DELIMITADORES.map(d => <option key={d.label} value={d.value}>{d.label}</option>)}
          </Selector>
        </div>
        <div>
          <span className="section-label">Separador decimal</span>
          <SegmentedControl
            options={SEPARADORES}
            value={borrador.separador_decimal}
            onChange={separador_decimal => onChange({ ...borrador, separador_decimal })}
            aria-label="Separador decimal"
          />
        </div>
        <div>
          <label className="section-label" htmlFor="plantilla-fecha">Formato de fecha</label>
          <input
            id="plantilla-fecha"
            className={`${CAMPO} font-mono`}
            placeholder="Vacío = 2025-02-04"
            value={borrador.formato_fecha}
            onChange={e => onChange({ ...borrador, formato_fecha: e.target.value })}
          />
          <p className="mt-1 text-[12px]" style={{ color: 'var(--color-ink-2)' }}>
            Por ejemplo <span className="font-mono">%d/%m/%Y</span> para 04/02/2025.
          </p>
        </div>
      </div>

      {/* Columnas obligatorias */}
      <div>
        <p className="text-[13px] font-medium mb-3" style={{ color: 'var(--color-ink)' }}>
          ¿Qué columna tiene cada dato?
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {COLUMNAS_OBLIGATORIAS.map(({ campo, etiqueta }) => (
            <div key={campo}>
              <label className="section-label" htmlFor={`columna-${campo}`}>{etiqueta}</label>
              <CampoColumna
                id={`columna-${campo}`}
                etiqueta={etiqueta}
                valor={columnas[campo]}
                vacio="Elige una columna"
                columnasCsv={columnasCsv}
                onChange={valor => setColumna(campo, valor)}
              />
              <Muestra inspeccion={inspeccion} columna={columnas[campo]} />
            </div>
          ))}
        </div>
      </div>

      {/* Tipo de operación: qué valores son compra y venta */}
      <div>
        <p className="text-[13px] font-medium" style={{ color: 'var(--color-ink)' }}>
          ¿Qué valores de la columna de tipo son compras y ventas?
        </p>
        <p className="text-[12px] mb-3" style={{ color: 'var(--color-ink-2)' }}>
          Lo que no sea compra ni venta (depósitos, dividendos, intereses…) no se importa.
        </p>
        {inspeccion && !columnas.tipo && (
          <p className="text-[12px] px-3 py-2 rounded-lg border border-dashed" style={{ color: 'var(--color-ink-2)', borderColor: 'var(--color-border)' }}>
            Elige antes la columna de Tipo de operación.
          </p>
        )}
        {columnas.tipo && valoresTipo && (
          <ul className="rounded-[10px] border divide-y" style={{ borderColor: 'var(--color-border)' }}>
            {valoresTipo.map(valor => (
              <li key={valor} className="flex items-center justify-between gap-3 px-3.5 py-2" style={{ borderColor: 'var(--color-border-2)' }}>
                <span className="text-[13px] font-mono truncate" style={{ color: 'var(--color-ink)' }}>{valor}</span>
                <SegmentedControl
                  options={CLASIFICACIONES}
                  value={clasificacionDe(borrador, valor)}
                  onChange={clase => onChange(clasificarValor(borrador, valor, clase))}
                  aria-label={valor}
                />
              </li>
            ))}
          </ul>
        )}
        {(!inspeccion || (columnas.tipo && !valoresTipo)) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <ValoresTexto
              key={`compra-${columnas.tipo}`}
              label="Valores de compra"
              valores={borrador.valores_compra}
              onChange={valores_compra => onChange({ ...borrador, valores_compra })}
            />
            <ValoresTexto
              key={`venta-${columnas.tipo}`}
              label="Valores de venta"
              valores={borrador.valores_venta}
              onChange={valores_venta => onChange({ ...borrador, valores_venta })}
            />
          </div>
        )}
      </div>

      {/* Opcionales */}
      <div>
        <p className="text-[13px] font-medium mb-3" style={{ color: 'var(--color-ink)' }}>
          Datos opcionales
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {COLUMNAS_OPCIONALES.map(({ campo, etiqueta, ayuda }) => (
            <div key={campo}>
              <label className="section-label" htmlFor={`columna-${campo}`}>{etiqueta}</label>
              <CampoColumna
                id={`columna-${campo}`}
                etiqueta={etiqueta}
                valor={columnas[campo]}
                vacio="Sin columna"
                columnasCsv={columnasCsv}
                onChange={valor => setColumna(campo, valor)}
              />
              <Muestra inspeccion={inspeccion} columna={columnas[campo]} />
              <p className="mt-1 text-[12px]" style={{ color: 'var(--color-ink-2)' }}>{ayuda}</p>
            </div>
          ))}
        </div>
        {columnas.tipo_cambio && (
          <label className="mt-3 flex items-center gap-2 text-[13px]" style={{ color: 'var(--color-ink-2)' }}>
            <input
              type="checkbox"
              checked={borrador.invertir_tipo_cambio}
              onChange={e => onChange({ ...borrador, invertir_tipo_cambio: e.target.checked })}
            />
            Mi broker da los euros que vale 1 unidad de la moneda (hay que invertirlo)
          </label>
        )}
      </div>

      {/* Comisión: suma de columnas */}
      <fieldset>
        <legend className="text-[13px] font-medium" style={{ color: 'var(--color-ink)' }}>Comisión</legend>
        <p className="text-[12px] mb-3" style={{ color: 'var(--color-ink-2)' }}>
          {inspeccion
            ? 'Marca las columnas de gastos: se suman en euros. Sin ninguna, la comisión es 0.'
            : 'Escribe las columnas de gastos separadas por comas: se suman en euros. Sin ninguna, la comisión es 0.'}
        </p>
        {!inspeccion && (
          <ValoresTexto
            label="Columnas de comisión"
            placeholder="Fee, Tax"
            valores={columnas.comision}
            onChange={comision => onChange({ ...borrador, columnas: { ...columnas, comision } })}
          />
        )}
        {inspeccion && (
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          {inspeccion.columnas.map(c => (
            <label key={c} className="flex items-center gap-2 text-[13px]" style={{ color: 'var(--color-ink)' }}>
              <input
                type="checkbox"
                checked={columnas.comision.includes(c)}
                onChange={() => toggleComision(c)}
              />
              {c}
            </label>
          ))}
        </div>
        )}
      </fieldset>
    </div>
  )
}
