import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { importacion } from '@/lib/api'
import type { DelimitadorCsv, PlantillaImportacionIn } from '@/types'

const PLANTILLAS_KEY = ['plantillas-importacion']

export function usePlantillas() {
  return useQuery({
    queryKey: PLANTILLAS_KEY,
    queryFn: importacion.listarPlantillas,
  })
}

// Creates the template, or replaces it when `id` is given
export function useGuardarPlantilla() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id?: number; data: PlantillaImportacionIn }) =>
      id === undefined ? importacion.crearPlantilla(data) : importacion.actualizarPlantilla(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: PLANTILLAS_KEY }),
  })
}

export function useEliminarPlantilla() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => importacion.eliminarPlantilla(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: PLANTILLAS_KEY }),
  })
}

export function useInspeccionarCsv() {
  return useMutation({
    mutationFn: ({ contenido, delimitador }: { contenido: string; delimitador?: DelimitadorCsv | null }) =>
      importacion.inspeccionar(contenido, delimitador ?? null),
  })
}

export function usePrevisualizarImportacion(carteraId: number) {
  return useMutation({
    mutationFn: ({ contenido, plantillaId }: { contenido: string; plantillaId: number }) =>
      importacion.previsualizar(carteraId, contenido, plantillaId),
  })
}

export function useConfirmarImportacion(carteraId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ contenido, plantillaId, huella }: { contenido: string; plantillaId: number; huella: string }) =>
      importacion.confirmar(carteraId, contenido, plantillaId, huella),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['movimientos', carteraId] })
      qc.invalidateQueries({ queryKey: ['resumen', carteraId] })
      qc.invalidateQueries({ queryKey: ['frontera', carteraId] })
      qc.invalidateQueries({ queryKey: ['rentabilidad', carteraId] })
    },
  })
}
