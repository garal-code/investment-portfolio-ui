'use client'
import { useState } from 'react'
import { SegmentedControl, type SegmentedControlOption } from '@/components/ui/SegmentedControl'
import { Treemap } from '@/components/ui/Treemap'
import { groupPositions, type Grupo } from '@/lib/portfolio-calc'
import { SAMPLE_POSITIONS } from './sample-portfolio'

const OPTIONS: SegmentedControlOption<Grupo>[] = [
  { value: 'posicion', label: 'Posición' },
  { value: 'sector', label: 'Sector' },
  { value: 'pais', label: 'País' },
  { value: 'tipo', label: 'Tipo' },
]

export function CompositionSample({ height = 280 }: { height?: number }) {
  const [grupo, setGrupo] = useState<Grupo>('posicion')
  const [activeKey, setActiveKey] = useState<string | null>(null)
  const groups = groupPositions(SAMPLE_POSITIONS, grupo)

  return (
    <div data-ui className="lp-ui lp-composition">
      <div className="lp-ui__head">
        <p className="font-serif lp-ui__title">Composición</p>
        <SegmentedControl
          options={OPTIONS}
          value={grupo}
          onChange={g => {
            setGrupo(g)
            setActiveKey(null)
          }}
          aria-label="Agrupar por"
        />
      </div>
      <Treemap groups={groups} height={height} activeKey={activeKey} onHover={setActiveKey} />
    </div>
  )
}
