import type {
  DelimitadorCsv,
  InspeccionCsv,
  PlantillaImportacion,
  PlantillaImportacionIn,
  SeparadorDecimal,
} from '@/types'

// Editable form of an import template. Optional columns and the date format
// use '' for "not set"; `configDesdeBorrador` turns them into the API's null.
export interface BorradorPlantilla {
  nombre: string
  delimitador: DelimitadorCsv | null
  separador_decimal: SeparadorDecimal
  formato_fecha: string
  columnas: {
    fecha: string
    isin: string
    tipo: string
    cantidad: string
    precio: string
    comision: string[]
    tipo_cambio: string
    moneda_precio: string
    referencia: string
  }
  valores_compra: string[]
  valores_venta: string[]
  invertir_tipo_cambio: boolean
}

export type ColumnaObligatoria = 'fecha' | 'isin' | 'tipo' | 'cantidad' | 'precio'
export type ColumnaOpcional = 'tipo_cambio' | 'moneda_precio' | 'referencia'
export type Clasificacion = 'compra' | 'venta' | 'ignorar'

export const COLUMNAS_OBLIGATORIAS: { campo: ColumnaObligatoria; etiqueta: string }[] = [
  { campo: 'fecha', etiqueta: 'Fecha' },
  { campo: 'isin', etiqueta: 'ISIN' },
  { campo: 'tipo', etiqueta: 'Tipo de operación' },
  { campo: 'cantidad', etiqueta: 'Cantidad' },
  { campo: 'precio', etiqueta: 'Precio' },
]

export const COLUMNAS_OPCIONALES: { campo: ColumnaOpcional; etiqueta: string; ayuda: string }[] = [
  {
    campo: 'tipo_cambio',
    etiqueta: 'Tipo de cambio',
    ayuda: 'Unidades de la moneda por 1 EUR. Sin columna, la operación se guarda sin tipo de cambio.',
  },
  {
    campo: 'moneda_precio',
    etiqueta: 'Moneda del precio',
    ayuda: 'Si la fila dice EUR, el tipo de cambio es 1.',
  },
  {
    campo: 'referencia',
    etiqueta: 'ID de la operación',
    ayuda: 'Evita importar dos veces la misma operación.',
  },
]

// Largest CSV the backend accepts (MAX_CONTENIDO_CSV, characters)
export const MAX_CONTENIDO_CSV = 2_000_000

export function borradorVacio(inspeccion: InspeccionCsv): BorradorPlantilla {
  return {
    nombre: '',
    delimitador: inspeccion.delimitador,
    separador_decimal: '.',
    formato_fecha: '',
    columnas: {
      fecha: '', isin: '', tipo: '', cantidad: '', precio: '',
      comision: [], tipo_cambio: '', moneda_precio: '', referencia: '',
    },
    valores_compra: [],
    valores_venta: [],
    invertir_tipo_cambio: false,
  }
}

export function borradorDesdePlantilla(plantilla: PlantillaImportacion): BorradorPlantilla {
  const { config } = plantilla
  return {
    nombre: plantilla.nombre,
    delimitador: config.delimitador,
    separador_decimal: config.separador_decimal,
    formato_fecha: config.formato_fecha ?? '',
    columnas: {
      ...config.columnas,
      comision: [...config.columnas.comision],
      tipo_cambio: config.columnas.tipo_cambio ?? '',
      moneda_precio: config.columnas.moneda_precio ?? '',
      referencia: config.columnas.referencia ?? '',
    },
    valores_compra: [...config.valores_compra],
    valores_venta: [...config.valores_venta],
    invertir_tipo_cambio: config.invertir_tipo_cambio,
  }
}

function opcional(valor: string): string | null {
  const limpio = valor.trim()
  return limpio === '' ? null : limpio
}

export function configDesdeBorrador(b: BorradorPlantilla): PlantillaImportacionIn {
  return {
    nombre: b.nombre.trim(),
    config: {
      delimitador: b.delimitador,
      separador_decimal: b.separador_decimal,
      formato_fecha: opcional(b.formato_fecha),
      columnas: {
        fecha: b.columnas.fecha,
        isin: b.columnas.isin,
        tipo: b.columnas.tipo,
        cantidad: b.columnas.cantidad,
        precio: b.columnas.precio,
        comision: b.columnas.comision,
        tipo_cambio: opcional(b.columnas.tipo_cambio),
        moneda_precio: opcional(b.columnas.moneda_precio),
        referencia: opcional(b.columnas.referencia),
      },
      valores_compra: b.valores_compra,
      valores_venta: b.valores_venta,
      // Only meaningful with an FX column; never saved on without one
      invertir_tipo_cambio: b.columnas.tipo_cambio !== '' && b.invertir_tipo_cambio,
    },
  }
}

// Every CSV header the draft maps, without duplicates
export function columnasDeBorrador(b: BorradorPlantilla): string[] {
  const mapeadas = [
    ...COLUMNAS_OBLIGATORIAS.map(c => b.columnas[c.campo]),
    ...b.columnas.comision,
    ...COLUMNAS_OPCIONALES.map(c => b.columnas[c.campo]),
  ].filter(c => c !== '')
  return [...new Set(mapeadas)]
}

// Mirrors the backend rules (PlantillaConfig) so the user sees every problem
// at once, in plain words, before saving. `columnasCsv` is null when editing
// without a file: there is no header to check the columns against.
export function validarBorrador(b: BorradorPlantilla, columnasCsv: string[] | null): string[] {
  const errores: string[] = []
  if (b.nombre.trim() === '') errores.push('Ponle un nombre a la plantilla')

  for (const { campo, etiqueta } of COLUMNAS_OBLIGATORIAS) {
    if (b.columnas[campo] === '') errores.push(`Elige la columna de ${etiqueta}`)
  }

  for (const columna of columnasCsv ? columnasDeBorrador(b) : []) {
    if (!columnasCsv?.includes(columna)) errores.push(`La columna "${columna}" no existe en este CSV`)
  }

  if (b.valores_compra.length === 0) errores.push('Marca al menos un valor de compra')
  if (b.valores_venta.length === 0) errores.push('Marca al menos un valor de venta')
  const compra = new Set(b.valores_compra.map(v => v.toLowerCase()))
  const comunes = b.valores_venta.filter(v => compra.has(v.toLowerCase()))
  if (comunes.length > 0) {
    errores.push(`Un valor no puede ser de compra y venta a la vez: ${comunes.join(', ')}`)
  }

  if (b.delimitador !== null && b.delimitador === b.separador_decimal) {
    errores.push('El delimitador no puede ser igual al separador decimal')
  }
  if (b.formato_fecha.trim() !== '' && !/%[a-zA-Z]/.test(b.formato_fecha)) {
    errores.push('El formato de fecha debe usar directivas, por ejemplo %d/%m/%Y')
  }
  return errores
}

export function clasificacionDe(b: BorradorPlantilla, valor: string): Clasificacion {
  if (b.valores_compra.includes(valor)) return 'compra'
  if (b.valores_venta.includes(valor)) return 'venta'
  return 'ignorar'
}

export function clasificarValor(
  b: BorradorPlantilla,
  valor: string,
  clase: Clasificacion,
): BorradorPlantilla {
  const sin = (lista: string[]) => lista.filter(v => v !== valor)
  return {
    ...b,
    valores_compra: clase === 'compra' ? [...sin(b.valores_compra), valor] : sin(b.valores_compra),
    valores_venta: clase === 'venta' ? [...sin(b.valores_venta), valor] : sin(b.valores_venta),
  }
}

export function muestraDeColumna(inspeccion: InspeccionCsv, columna: string): string | null {
  const indice = inspeccion.columnas.indexOf(columna)
  if (indice === -1) return null
  for (const fila of inspeccion.filas_muestra) {
    const valor = fila[indice]?.trim()
    if (valor) return valor
  }
  return null
}

// The import endpoints answer 400/404/409 with a Spanish string `detail` and
// 422 with pydantic's list of errors; both are shown to the user as text.
export function mensajeErrorApi(error: unknown, fallback: string): string {
  const detail = (error as { response?: { data?: { detail?: unknown } } } | null)?.response?.data
    ?.detail
  if (typeof detail === 'string' && detail) return detail
  if (Array.isArray(detail)) {
    const mensajes = detail
      .map(d => (typeof d?.msg === 'string' ? d.msg.replace(/^Value error, /, '') : ''))
      .filter(Boolean)
    if (mensajes.length > 0) return mensajes.join('. ')
  }
  return fallback
}
