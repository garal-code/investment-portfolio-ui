export interface LeyendaItem {
  label: string
  color: string
  // Dashed line swatch instead of a filled square.
  dashed?: boolean
}

// HTML legend shared by the calculation charts (same pattern as FronteraChart).
export function Leyenda({ items }: { items: LeyendaItem[] }) {
  return (
    <ul aria-label="Leyenda" className="flex flex-wrap gap-x-5 gap-y-1.5 text-[12px]" style={{ color: '#6a5a4a' }}>
      {items.map(item => (
        <li key={item.label} className="flex items-center gap-2">
          <span
            aria-hidden="true"
            style={{
              width: item.dashed ? 16 : 9,
              height: item.dashed ? 0 : 9,
              borderTop: item.dashed ? `2px dashed ${item.color}` : undefined,
              background: item.dashed ? undefined : item.color,
              borderRadius: 1,
            }}
          />
          {item.label}
        </li>
      ))}
    </ul>
  )
}

export const axisTick = { fill: '#a09080', fontSize: 11 }

export const tooltipStyle = {
  contentStyle: { background: '#fff', border: '1px solid #ece7e1', borderRadius: 8, fontSize: 12 },
  labelStyle: { color: '#a09080', marginBottom: 4 },
}
