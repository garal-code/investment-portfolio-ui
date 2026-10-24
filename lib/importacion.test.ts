import { describe, expect, it } from 'vitest'
import type { InspeccionCsv, PlantillaImportacion } from '@/types'
import {
  borradorDesdePlantilla,
  borradorVacio,
  clasificarValor,
  configDesdeBorrador,
  mensajeErrorApi,
  muestraDeColumna,
  validarBorrador,
  type BorradorPlantilla,
} from './importacion'

const inspeccion: InspeccionCsv = {
  delimitador: ',',
  columnas: ['Action', 'Time', 'ISIN', 'Shares', 'Price', 'Fee', 'Tax', 'FX', 'Currency', 'ID'],
  filas_muestra: [
    ['Deposit', '2025-02-01', '', '', '', '', '', '', 'EUR', 'D1'],
    ['Market buy', '2025-02-04 08:00:01', 'ES0000000001', '10', '11.5', '0.1', '', '1', 'EUR', 'B1'],
  ],
  valores_distintos: { Action: ['Deposit', 'Market buy', 'Market sell'], Currency: ['EUR', 'USD'] },
}

function borradorCompleto(): BorradorPlantilla {
  return {
    ...borradorVacio(inspeccion),
    nombre: '  Mi broker  ',
    columnas: {
      fecha: 'Time',
      isin: 'ISIN',
      tipo: 'Action',
      cantidad: 'Shares',
      precio: 'Price',
      comision: ['Fee', 'Tax'],
      tipo_cambio: 'FX',
      moneda_precio: 'Currency',
      referencia: '',
    },
    valores_compra: ['Market buy'],
    valores_venta: ['Market sell'],
  }
}

describe('borradorVacio', () => {
  it('starts with the detected delimiter, point decimals, ISO dates and no mapping', () => {
    expect(borradorVacio(inspeccion)).toEqual({
      nombre: '',
      delimitador: ',',
      separador_decimal: '.',
      formato_fecha: '',
      columnas: {
        fecha: '', isin: '', tipo: '', cantidad: '', precio: '',
        comision: [], tipo_cambio: '', moneda_precio: '', referencia: '',
      },
      valores_compra: [],
      valores_venta: [],
      invertir_tipo_cambio: false,
    })
  })
})

describe('configDesdeBorrador', () => {
  it('trims the name and turns empty optional fields into null', () => {
    expect(configDesdeBorrador(borradorCompleto())).toEqual({
      nombre: 'Mi broker',
      config: {
        delimitador: ',',
        separador_decimal: '.',
        formato_fecha: null,
        columnas: {
          fecha: 'Time',
          isin: 'ISIN',
          tipo: 'Action',
          cantidad: 'Shares',
          precio: 'Price',
          comision: ['Fee', 'Tax'],
          tipo_cambio: 'FX',
          moneda_precio: 'Currency',
          referencia: null,
        },
        valores_compra: ['Market buy'],
        valores_venta: ['Market sell'],
        invertir_tipo_cambio: false,
      },
    })
  })

  it('keeps a custom date format', () => {
    const b = { ...borradorCompleto(), formato_fecha: ' %d/%m/%Y ' }
    expect(configDesdeBorrador(b).config.formato_fecha).toBe('%d/%m/%Y')
  })
})

describe('borradorDesdePlantilla', () => {
  it('round-trips a saved template through the editor', () => {
    const { nombre, config } = configDesdeBorrador(borradorCompleto())
    const plantilla: PlantillaImportacion = {
      id: 3, nombre, config, created_at: '2026-10-22T00:00:00', updated_at: '2026-10-22T00:00:00',
    }
    expect(configDesdeBorrador(borradorDesdePlantilla(plantilla))).toEqual({ nombre, config })
  })
})

describe('validarBorrador', () => {
  it('accepts a complete mapping', () => {
    expect(validarBorrador(borradorCompleto(), inspeccion.columnas)).toEqual([])
  })

  it('lists every missing piece of an empty draft', () => {
    expect(validarBorrador(borradorVacio(inspeccion), inspeccion.columnas)).toEqual([
      'Ponle un nombre a la plantilla',
      'Elige la columna de Fecha',
      'Elige la columna de ISIN',
      'Elige la columna de Tipo de operación',
      'Elige la columna de Cantidad',
      'Elige la columna de Precio',
      'Marca al menos un valor de compra',
      'Marca al menos un valor de venta',
    ])
  })

  it('rejects a mapped column that is not in this CSV', () => {
    const b = borradorCompleto()
    b.columnas.comision = ['Fee', 'Old fee']
    expect(validarBorrador(b, inspeccion.columnas)).toEqual([
      'La columna "Old fee" no existe en este CSV',
    ])
  })

  it('skips the column check when there is no file to compare with', () => {
    const b = borradorCompleto()
    b.columnas.comision = ['Old fee']
    expect(validarBorrador(b, null)).toEqual([])
  })

  it('rejects a value marked as both buy and sell, ignoring case', () => {
    const b = { ...borradorCompleto(), valores_venta: ['market BUY'] }
    expect(validarBorrador(b, inspeccion.columnas)).toEqual([
      'Un valor no puede ser de compra y venta a la vez: market BUY',
    ])
  })

  it('rejects a delimiter equal to the decimal separator', () => {
    const b: BorradorPlantilla = { ...borradorCompleto(), separador_decimal: ',' }
    expect(validarBorrador(b, inspeccion.columnas)).toEqual([
      'El delimitador no puede ser igual al separador decimal',
    ])
  })

  it('rejects a date format without strptime directives', () => {
    const b = { ...borradorCompleto(), formato_fecha: 'dd/mm/yyyy' }
    expect(validarBorrador(b, inspeccion.columnas)).toEqual([
      'El formato de fecha debe usar directivas, por ejemplo %d/%m/%Y',
    ])
  })
})

describe('clasificarValor', () => {
  it('moves a type value between buy, sell and ignored', () => {
    const b = borradorCompleto()
    const venta = clasificarValor(b, 'Market buy', 'venta')
    expect(venta.valores_compra).toEqual([])
    expect(venta.valores_venta).toEqual(['Market sell', 'Market buy'])

    const ignorado = clasificarValor(venta, 'Market buy', 'ignorar')
    expect(ignorado.valores_compra).toEqual([])
    expect(ignorado.valores_venta).toEqual(['Market sell'])
  })
})

describe('muestraDeColumna', () => {
  it('returns the first non-empty sample value of a column', () => {
    expect(muestraDeColumna(inspeccion, 'ISIN')).toBe('ES0000000001')
    expect(muestraDeColumna(inspeccion, 'Tax')).toBeNull()
    expect(muestraDeColumna(inspeccion, 'Missing')).toBeNull()
  })
})

describe('mensajeErrorApi', () => {
  function axiosError(status: number, detail: unknown) {
    return { response: { status, data: { detail } } }
  }

  it('shows a string detail as is', () => {
    expect(mensajeErrorApi(axiosError(400, 'El CSV está vacío'), 'x')).toBe('El CSV está vacío')
  })

  it('joins 422 validation messages without the pydantic prefix', () => {
    const detail = [
      { loc: ['body', 'config'], msg: 'Value error, Un valor no puede ser de compra y venta a la vez: A' },
      { loc: ['body', 'contenido'], msg: 'String should have at most 2000000 characters' },
    ]
    expect(mensajeErrorApi(axiosError(422, detail), 'x')).toBe(
      'Un valor no puede ser de compra y venta a la vez: A. String should have at most 2000000 characters',
    )
  })

  it('falls back when there is no detail', () => {
    expect(mensajeErrorApi(new Error('Network Error'), 'No se pudo leer el CSV')).toBe(
      'No se pudo leer el CSV',
    )
  })
})
