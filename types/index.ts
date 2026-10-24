// ── Autenticación ─────────────────────────────────────────────────────────────

export interface User {
  id: number
  email: string
  nombre?: string
  created_at: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  email: string
  password: string
  nombre?: string
}

export interface ResetPasswordPayload {
  token: string
  password: string
}

// ── Entidades base ────────────────────────────────────────────────────────────

export interface Cartera {
  id: number
  nombre: string
  descripcion?: string
  created_at: string
}

export interface Instrumento {
  id: number
  isin: string
  ticker?: string
  nombre?: string
  tipo?: string       // accion | etf | fondo | otro
  sector?: string
  pais?: string
  moneda?: string
  exchange?: string
}

export interface Movimiento {
  id: number
  cartera_id: number
  instrumento: Instrumento
  tipo: 'compra' | 'venta'
  fecha: string
  cantidad: number
  precio: number
  comision: number
  tipo_cambio?: number
  notas?: string
  created_at: string
}

// ── Datos calculados ──────────────────────────────────────────────────────────

export interface Posicion {
  instrumento: Instrumento
  cantidad_actual: number
  coste_total: number
  precio_medio: number
  plusvalia_realizada: number
  // null when there is no current price. With a native price but no current
  // EUR/currency FX rate, only the native fields are set: the EUR ones and
  // fx_actual are null.
  precio_actual?: number | null
  valor_actual?: number | null
  plusvalia_latente?: number | null
  rentabilidad_pct?: number | null
  plusvalia_total?: number | null
  precio_actual_eur?: number | null
  precio_actual_nativo?: number | null
  valor_actual_eur?: number | null
  valor_actual_nativo?: number | null
  moneda_nativa?: string
  fx_actual?: number | null
}

export interface ResumenCartera {
  cartera: Cartera
  valor_total: number
  coste_total: number
  plusvalia_latente: number
  plusvalia_realizada: number
  plusvalia_total: number
  rentabilidad_pct: number
  num_posiciones: number
  posiciones: Posicion[]
}

export type PeriodoRentabilidad = '1m' | '2m' | '3m' | '6m' | '1y' | '2y' | '3y' | 'ytd'

export interface PosicionRentabilidad {
  instrumento: Instrumento
  cantidad_actual: number
  coste_total: number
  valor_actual?: number | null      // null without current price or FX rate
  plusvalia_latente?: number | null
  plusvalia_realizada: number
  plusvalia_total: number
  rentabilidad_pct: number
  moneda_nativa?: string
}

export interface RentabilidadCartera {
  periodo: PeriodoRentabilidad
  fecha_inicio: string
  fecha_fin: string
  valor_total: number
  coste_total: number
  plusvalia_latente: number
  plusvalia_realizada: number
  plusvalia_total: number
  rentabilidad_pct: number
  posiciones: PosicionRentabilidad[]
  tickers_sin_dato: string[]
}

// ── Frontera eficiente (Markowitz) ────────────────────────────────────────────
// All figures are monthly (not annualised). Arrays and matrices are ordered by
// `FronteraEficiente.tickers`.

export interface PuntoCartera {
  rentabilidad: number
  volatilidad: number
  varianza: number
  pesos: Record<string, number>   // ticker -> weight, sums to 1
}

export type MotivoExclusion =
  | 'sin_ticker'
  | 'sin_precio_actual'
  | 'sin_tipo_cambio'
  | 'sin_historico'
  | 'historico_insuficiente'

export interface ActivoExcluido {
  ticker: string      // ISIN when the instrument has no ticker
  motivo: MotivoExclusion
}

export interface DatosEntradaFrontera {
  fechas_precios: string[]       // one more month than `fechas`
  precios: number[][]            // [fechas_precios][tickers], native currency
  fechas: string[]
  rentabilidades: number[][]     // [fechas][tickers]
}

export interface EstadisticasActivos {
  varianzas: number[]
  volatilidades: number[]
  matriz_correlaciones: number[][]
}

export interface DetalleCarteraActual {
  valores_eur: Record<string, number>
  rentabilidades: number[]       // one per `fechas` month
}

export interface DetalleCalculoFrontera {
  datos: DatosEntradaFrontera
  estadisticas: EstadisticasActivos
  cartera_actual: DetalleCarteraActual
}

export interface FronteraEficiente {
  fecha_inicio: string
  fecha_fin: string
  frecuencia: 'mensual'
  n_observaciones: number
  tickers: string[]
  rentabilidades_esperadas: number[]
  matriz_covarianzas: number[][]
  frontera: PuntoCartera[]       // ascending return; first = min variance
  cartera_minima_varianza: PuntoCartera
  cartera_actual: PuntoCartera
  excluidos: ActivoExcluido[]
  peso_excluido: number          // [0, 1] share of EUR value left out
  detalle: DetalleCalculoFrontera
}

// ── Formularios ───────────────────────────────────────────────────────────────

export interface MovimientoCreate {
  cartera_id: number
  isin: string
  tipo: 'compra' | 'venta'
  fecha: string
  cantidad: number
  precio: number
  comision?: number
  tipo_cambio?: number
  notas?: string
}

export interface CarteraCreate {
  nombre: string
  descripcion?: string
}

export interface InstrumentoUpdate {
  ticker?: string
  nombre?: string
  tipo?: string
  sector?: string
  pais?: string
  moneda?: string
  exchange?: string
}

// ── Importación CSV ───────────────────────────────────────────────────────────
// Contract: garal-screener docs/importacion.md

export type DelimitadorCsv = ',' | ';' | '\t' | '|'
export type SeparadorDecimal = '.' | ','

export interface ColumnasImportacion {
  fecha: string
  isin: string
  tipo: string
  cantidad: string
  precio: string
  // Commission = sum of these columns
  comision: string[]
  tipo_cambio: string | null
  // Currency of the price column; EUR rows get tipo_cambio 1.0
  moneda_precio: string | null
  // Broker transaction ID used to skip rows already imported
  referencia: string | null
}

export interface PlantillaConfig {
  // null = detect it from the file
  delimitador: DelimitadorCsv | null
  separador_decimal: SeparadorDecimal
  // null = ISO date or datetime; else a strptime format such as %d/%m/%Y
  formato_fecha: string | null
  columnas: ColumnasImportacion
  valores_compra: string[]
  valores_venta: string[]
  invertir_tipo_cambio: boolean
}

export interface PlantillaImportacion {
  id: number
  nombre: string
  config: PlantillaConfig
  created_at: string
  updated_at: string
}

export interface PlantillaImportacionIn {
  nombre: string
  config: PlantillaConfig
}

export interface InspeccionCsv {
  delimitador: DelimitadorCsv
  columnas: string[]
  // Up to 5 rows, values in the order of `columnas`
  filas_muestra: string[][]
  // Only columns with 1-20 distinct non-empty values
  valores_distintos: Record<string, string[]>
}

export interface FilaImportacion {
  linea: number
  estado: 'importar' | 'omitir'
  motivo: string | null
  // Rows skipped while reading have every data field null
  tipo: 'compra' | 'venta' | null
  fecha: string | null
  isin: string | null
  nombre: string | null
  cantidad: number | null
  precio: number | null
  comision: number | null
  tipo_cambio: number | null
  referencia: string | null
}

export interface PrevisualizacionImportacion {
  huella: string
  resumen: { total: number; importar: number; omitir: number }
  filas: FilaImportacion[]
}

export interface ResultadoImportacion {
  importados: number
  omitidos: number
}
