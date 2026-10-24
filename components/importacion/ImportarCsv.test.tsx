import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { describe, expect, it, vi } from 'vitest'
import { server } from '@/test/mocks/server'
import type {
  InspeccionCsv,
  PlantillaConfig,
  PlantillaImportacion,
  PrevisualizacionImportacion,
} from '@/types'
import { ImportarCsv } from './ImportarCsv'

const CSV = [
  'Action,Time,ISIN,Shares,Price,Fee,ID',
  'Market buy,2025-02-04 08:00:01,ES0000000001,10,11.5,0.1,B1',
  'Deposit,2025-02-05,,,,,D1',
].join('\n')

const config: PlantillaConfig = {
  delimitador: ',',
  separador_decimal: '.',
  formato_fecha: null,
  columnas: {
    fecha: 'Time', isin: 'ISIN', tipo: 'Action', cantidad: 'Shares', precio: 'Price',
    comision: ['Fee'], tipo_cambio: null, moneda_precio: null, referencia: 'ID',
  },
  valores_compra: ['Market buy'],
  valores_venta: ['Market sell'],
  invertir_tipo_cambio: false,
}

const plantilla: PlantillaImportacion = {
  id: 7, nombre: 'Mi broker', config, created_at: '2026-10-22T00:00:00', updated_at: '2026-10-22T00:00:00',
}

const previsualizacion: PrevisualizacionImportacion = {
  huella: 'abc123',
  resumen: { total: 2, importar: 1, omitir: 1 },
  filas: [
    {
      linea: 2, estado: 'importar', motivo: null, tipo: 'compra', fecha: '2025-02-04',
      isin: 'ES0000000001', nombre: 'Alpha', cantidad: 10, precio: 11.5, comision: 0.1,
      tipo_cambio: null, referencia: 'B1',
    },
    {
      linea: 3, estado: 'omitir', motivo: 'Tipo "Deposit" no es compra ni venta', tipo: null,
      fecha: null, isin: null, nombre: null, cantidad: null, precio: null, comision: null,
      tipo_cambio: null, referencia: null,
    },
  ],
}

const inspeccion: InspeccionCsv = {
  delimitador: ',',
  columnas: ['Action', 'Time', 'ISIN', 'Shares', 'Price', 'Fee', 'ID'],
  filas_muestra: [
    ['Market buy', '2025-02-04 08:00:01', 'ES0000000001', '10', '11.5', '0.1', 'B1'],
    ['Deposit', '2025-02-05', '', '', '', '', 'D1'],
  ],
  valores_distintos: { Action: ['Deposit', 'Market buy', 'Market sell'] },
}

interface Peticiones {
  previsualizar: unknown[]
  confirmar: unknown[]
  inspeccionar: unknown[]
  crearPlantilla: unknown[]
  eliminarPlantilla: string[]
}

function mockBackend(opts: {
  plantillas?: PlantillaImportacion[]
  confirmar?: () => Response
  previsualizar?: () => Response
} = {}): Peticiones {
  const peticiones: Peticiones = {
    previsualizar: [], confirmar: [], inspeccionar: [], crearPlantilla: [], eliminarPlantilla: [],
  }
  server.use(
    http.get('/api/v1/plantillas-importacion', () => HttpResponse.json(opts.plantillas ?? [plantilla])),
    http.post('/api/v1/plantillas-importacion', async ({ request }) => {
      const body = await request.json() as { nombre: string; config: PlantillaConfig }
      peticiones.crearPlantilla.push(body)
      return HttpResponse.json({ ...body, id: 9, created_at: 'x', updated_at: 'x' })
    }),
    http.delete('/api/v1/plantillas-importacion/:id', ({ params }) => {
      peticiones.eliminarPlantilla.push(params.id as string)
      return HttpResponse.json({ ok: true })
    }),
    http.post('/api/v1/importaciones/inspeccionar', async ({ request }) => {
      peticiones.inspeccionar.push(await request.json())
      return HttpResponse.json(inspeccion)
    }),
    http.post('/api/v1/carteras/:id/importaciones/previsualizar', async ({ request }) => {
      peticiones.previsualizar.push(await request.json())
      return opts.previsualizar ? opts.previsualizar() : HttpResponse.json(previsualizacion)
    }),
    http.post('/api/v1/carteras/:id/importaciones', async ({ request }) => {
      peticiones.confirmar.push(await request.json())
      return opts.confirmar ? opts.confirmar() : HttpResponse.json({ importados: 1, omitidos: 1 })
    }),
  )
  return peticiones
}

function renderImportar(onClose = vi.fn()) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const invalidate = vi.spyOn(queryClient, 'invalidateQueries')
  render(
    <QueryClientProvider client={queryClient}>
      <ImportarCsv carteraId={4} onClose={onClose} />
    </QueryClientProvider>,
  )
  return { onClose, invalidate }
}

async function elegirArchivo(contenido = CSV) {
  const file = new File([contenido], 'broker.csv', { type: 'text/csv' })
  fireEvent.change(screen.getByLabelText('Archivo CSV'), { target: { files: [file] } })
  expect(await screen.findByText('broker.csv')).toBeInTheDocument()
}

describe('ImportarCsv — with a saved template', () => {
  it('previews the file with the selected template and explains every row', async () => {
    const peticiones = mockBackend()
    renderImportar()
    await elegirArchivo()
    await waitFor(() => expect(screen.getByLabelText('Plantilla')).toHaveValue('7'))

    fireEvent.click(screen.getByRole('button', { name: 'Previsualizar' }))

    expect(await screen.findByText('Tipo "Deposit" no es compra ni venta')).toBeInTheDocument()
    expect(peticiones.previsualizar).toEqual([{ contenido: CSV, plantilla_id: 7 }])
    expect(screen.getByText('Alpha')).toBeInTheDocument()
    expect(screen.getByText('Se importa')).toBeInTheDocument()
    expect(screen.getByText('Se omite')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Importar 1 movimiento' })).toBeEnabled()
  })

  it('brings the panel to the top so the preview can use the whole screen', async () => {
    mockBackend()
    const scrollIntoView = vi.fn()
    Element.prototype.scrollIntoView = scrollIntoView
    renderImportar()
    await elegirArchivo()
    await waitFor(() => expect(screen.getByLabelText('Plantilla')).toHaveValue('7'))
    expect(scrollIntoView).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: 'Previsualizar' }))

    await screen.findByText('Alpha')
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' })
    // jsdom has no scrollIntoView; do not leak the mock into other tests
    delete (Element.prototype as { scrollIntoView?: unknown }).scrollIntoView
  })

  it('filters the preview to the skipped rows', async () => {
    mockBackend()
    renderImportar()
    await elegirArchivo()
    await waitFor(() => expect(screen.getByLabelText('Plantilla')).toHaveValue('7'))
    fireEvent.click(screen.getByRole('button', { name: 'Previsualizar' }))
    await screen.findByText('Alpha')

    fireEvent.click(screen.getByRole('tab', { name: 'Se omiten (1)' }))

    expect(screen.queryByText('Alpha')).not.toBeInTheDocument()
    expect(screen.getByText('Tipo "Deposit" no es compra ni venta')).toBeInTheDocument()
  })

  it('confirms with the preview fingerprint, refreshes the portfolio and reports the result', async () => {
    const peticiones = mockBackend()
    const { invalidate } = renderImportar()
    await elegirArchivo()
    await waitFor(() => expect(screen.getByLabelText('Plantilla')).toHaveValue('7'))
    fireEvent.click(screen.getByRole('button', { name: 'Previsualizar' }))

    fireEvent.click(await screen.findByRole('button', { name: 'Importar 1 movimiento' }))

    expect(await screen.findByText('Se ha importado 1 movimiento.')).toBeInTheDocument()
    expect(screen.getByText('1 fila omitida.')).toBeInTheDocument()
    expect(peticiones.confirmar).toEqual([{ contenido: CSV, plantilla_id: 7, huella: 'abc123' }])
    for (const key of ['movimientos', 'resumen', 'frontera', 'rentabilidad']) {
      expect(invalidate).toHaveBeenCalledWith({ queryKey: [key, 4] })
    }
  })

  it('asks to preview again when the data changed since the preview (409)', async () => {
    const peticiones = mockBackend({
      confirmar: () => HttpResponse.json(
        { detail: 'La previsualización ya no coincide con los datos actuales. Vuelve a previsualizar.' },
        { status: 409 },
      ),
    })
    renderImportar()
    await elegirArchivo()
    await waitFor(() => expect(screen.getByLabelText('Plantilla')).toHaveValue('7'))
    fireEvent.click(screen.getByRole('button', { name: 'Previsualizar' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Importar 1 movimiento' }))

    expect(await screen.findByText(
      'La previsualización ya no coincide con los datos actuales. Vuelve a previsualizar.',
    )).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Volver a previsualizar' }))
    await waitFor(() => expect(peticiones.previsualizar).toHaveLength(2))
    expect(screen.queryByText(/ya no coincide/)).not.toBeInTheDocument()
  })

  it('shows why the file cannot be read (400) and stays on the file step', async () => {
    mockBackend({
      previsualizar: () => HttpResponse.json(
        { detail: "La columna 'ID' de la plantilla no existe en el CSV" }, { status: 400 },
      ),
    })
    renderImportar()
    await elegirArchivo()
    await waitFor(() => expect(screen.getByLabelText('Plantilla')).toHaveValue('7'))

    fireEvent.click(screen.getByRole('button', { name: 'Previsualizar' }))

    expect(await screen.findByText("La columna 'ID' de la plantilla no existe en el CSV")).toBeInTheDocument()
    expect(screen.getByLabelText('Archivo CSV')).toBeInTheDocument()
  })

  it('disables the import when no row would be imported', async () => {
    mockBackend({
      previsualizar: () => HttpResponse.json({
        ...previsualizacion,
        resumen: { total: 1, importar: 0, omitir: 1 },
        filas: [previsualizacion.filas[1]],
      }),
    })
    renderImportar()
    await elegirArchivo()
    await waitFor(() => expect(screen.getByLabelText('Plantilla')).toHaveValue('7'))
    fireEvent.click(screen.getByRole('button', { name: 'Previsualizar' }))

    expect(await screen.findByRole('button', { name: 'No hay filas que importar' })).toBeDisabled()
  })

  it('edits the selected template with its saved mapping and replaces it', async () => {
    const peticiones = mockBackend()
    const actualizadas: unknown[] = []
    server.use(
      http.put('/api/v1/plantillas-importacion/:id', async ({ params, request }) => {
        const body = await request.json() as object
        actualizadas.push({ id: params.id, ...body })
        return HttpResponse.json({ ...body, id: 7, created_at: 'x', updated_at: 'x' })
      }),
    )
    renderImportar()
    await elegirArchivo()
    await waitFor(() => expect(screen.getByLabelText('Plantilla')).toHaveValue('7'))

    fireEvent.click(screen.getByRole('button', { name: 'Editar plantilla' }))

    expect(await screen.findByLabelText('Nombre de la plantilla')).toHaveValue('Mi broker')
    expect(peticiones.inspeccionar).toEqual([{ contenido: CSV, delimitador: ',' }])
    expect(screen.getByLabelText('Columna de Precio')).toHaveValue('Price')
    fireEvent.change(screen.getByLabelText('Nombre de la plantilla'), { target: { value: 'Broker 2' } })
    fireEvent.click(screen.getByRole('button', { name: 'Guardar plantilla y previsualizar' }))

    expect(await screen.findByText('Alpha')).toBeInTheDocument()
    expect(actualizadas).toEqual([{ id: '7', nombre: 'Broker 2', config }])
    expect(peticiones.crearPlantilla).toEqual([])
  })

  it('deletes a template after confirming', async () => {
    const peticiones = mockBackend()
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    renderImportar()
    await waitFor(() => expect(screen.getByLabelText('Plantilla')).toHaveValue('7'))

    fireEvent.click(screen.getByRole('button', { name: 'Eliminar plantilla' }))

    await waitFor(() => expect(peticiones.eliminarPlantilla).toEqual(['7']))
    expect(window.confirm).toHaveBeenCalledWith('¿Eliminar la plantilla "Mi broker"?')
  })

  it('rejects a file larger than the backend accepts without calling it', async () => {
    const peticiones = mockBackend()
    renderImportar()
    await elegirArchivo('x'.repeat(2_000_001))
    await waitFor(() => expect(screen.getByLabelText('Plantilla')).toHaveValue('7'))

    fireEvent.click(screen.getByRole('button', { name: 'Previsualizar' }))

    expect(await screen.findByText('El archivo es demasiado grande (máximo 2.000.000 caracteres).')).toBeInTheDocument()
    expect(peticiones.previsualizar).toEqual([])
  })
})

describe('ImportarCsv — new template', () => {
  async function abrirEditor() {
    const peticiones = mockBackend({ plantillas: [] })
    renderImportar()
    await elegirArchivo()
    await waitFor(() => expect(screen.getByLabelText('Plantilla')).toHaveValue('nueva'))
    fireEvent.click(screen.getByRole('button', { name: 'Configurar columnas' }))
    await screen.findByLabelText('Nombre de la plantilla')
    return peticiones
  }

  it('inspects the file and offers its headers with a sample value', async () => {
    const peticiones = await abrirEditor()

    expect(peticiones.inspeccionar).toEqual([{ contenido: CSV, delimitador: null }])
    const fecha = screen.getByLabelText('Columna de Fecha')
    expect(within(fecha).getAllByRole('option').map(o => o.textContent)).toEqual([
      'Elige una columna', 'Action', 'Time', 'ISIN', 'Shares', 'Price', 'Fee', 'ID',
    ])
    fireEvent.change(fecha, { target: { value: 'Time' } })
    expect(screen.getByText('Ej.: 2025-02-04 08:00:01')).toBeInTheDocument()
  })

  it('lists what is missing and saves nothing', async () => {
    const peticiones = await abrirEditor()

    fireEvent.click(screen.getByRole('button', { name: 'Guardar plantilla y previsualizar' }))

    expect(screen.getByText('Ponle un nombre a la plantilla')).toBeInTheDocument()
    expect(screen.getByText('Marca al menos un valor de venta')).toBeInTheDocument()
    expect(peticiones.crearPlantilla).toEqual([])
  })

  it('saves the mapping as a template and previews with it', async () => {
    const peticiones = await abrirEditor()

    fireEvent.change(screen.getByLabelText('Nombre de la plantilla'), { target: { value: 'Mi broker' } })
    fireEvent.change(screen.getByLabelText('Columna de Fecha'), { target: { value: 'Time' } })
    fireEvent.change(screen.getByLabelText('Columna de ISIN'), { target: { value: 'ISIN' } })
    fireEvent.change(screen.getByLabelText('Columna de Tipo de operación'), { target: { value: 'Action' } })
    fireEvent.change(screen.getByLabelText('Columna de Cantidad'), { target: { value: 'Shares' } })
    fireEvent.change(screen.getByLabelText('Columna de Precio'), { target: { value: 'Price' } })
    fireEvent.click(screen.getByRole('checkbox', { name: 'Fee' }))
    fireEvent.change(screen.getByLabelText('Columna de ID de la operación'), { target: { value: 'ID' } })
    fireEvent.click(within(screen.getByRole('tablist', { name: 'Market buy' })).getByRole('tab', { name: 'Compra' }))
    fireEvent.click(within(screen.getByRole('tablist', { name: 'Market sell' })).getByRole('tab', { name: 'Venta' }))

    fireEvent.click(screen.getByRole('button', { name: 'Guardar plantilla y previsualizar' }))

    expect(await screen.findByText('Alpha')).toBeInTheDocument()
    expect(peticiones.crearPlantilla).toEqual([{ nombre: 'Mi broker', config }])
    expect(peticiones.previsualizar).toEqual([{ contenido: CSV, plantilla_id: 9 }])
  })
})
