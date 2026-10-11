import type { CSSProperties, ReactNode } from 'react'

export interface DetalleCell {
  content: ReactNode
  className?: string
  style?: CSSProperties
}

export interface DetalleRow {
  key: string
  label: string
  cells: DetalleCell[]
}

interface DetalleTableProps {
  // Accessible name of the table (the step title).
  label: string
  cornerLabel: string
  columns: string[]
  rows: DetalleRow[]
}

const thStyle: CSSProperties = {
  padding: '8px 14px',
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '.08em',
  textTransform: 'uppercase',
  color: '#a09080',
  whiteSpace: 'nowrap',
  textAlign: 'right',
  background: '#fff',
  position: 'sticky',
  top: 0,
  zIndex: 1,
}

const rowHeaderStyle: CSSProperties = {
  padding: '7px 14px',
  fontSize: 13,
  fontWeight: 500,
  whiteSpace: 'nowrap',
  textAlign: 'left',
  background: '#fff',
  position: 'sticky',
  left: 0,
  zIndex: 1,
}

const tdStyle: CSSProperties = { padding: '7px 14px', fontSize: 13, whiteSpace: 'nowrap', textAlign: 'right' }

// Numeric table shared by every calculation step (series and matrices alike):
// labelled rows, one cell per column, scrolling both ways with the header row
// and the label column kept in view.
export function DetalleTable({ label, cornerLabel, columns, rows }: DetalleTableProps) {
  return (
    <div className="overflow-auto max-h-[420px]" style={{ border: '1px solid #ece7e1', borderRadius: 10 }}>
      <table aria-label={label} className="w-full tabular-nums" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
        <thead>
          <tr>
            <th scope="col" style={{ ...thStyle, textAlign: 'left', left: 0, zIndex: 2, borderBottom: '1px solid #ece7e1' }}>
              {cornerLabel}
            </th>
            {columns.map(column => (
              <th key={column} scope="col" style={{ ...thStyle, borderBottom: '1px solid #ece7e1' }}>{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row.key}>
              <th scope="row" style={{ ...rowHeaderStyle, borderBottom: '1px solid #f5f0eb' }}>{row.label}</th>
              {row.cells.map((cell, i) => (
                <td
                  key={columns[i] ?? i}
                  className={cell.className}
                  style={{ ...tdStyle, borderBottom: '1px solid #f5f0eb', ...cell.style }}
                >
                  {cell.content}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
