interface HeatmapProps {
  ariaLabel: string
  tickers: string[]
  matrix: number[][]
  formatValue: (value: number) => string
  // CSS colour of the cell background for a value.
  colorFor: (value: number) => string
}

const headStyle = { fontSize: 11, fontWeight: 700, color: '#a09080', whiteSpace: 'nowrap' } as const

// Square matrix as a CSS grid: ticker headers on top and left, the formatted
// value inside each coloured cell.
export function Heatmap({ ariaLabel, tickers, matrix, formatValue, colorFor }: HeatmapProps) {
  return (
    <div className="overflow-x-auto min-w-0" style={{ border: '1px solid #ece7e1', borderRadius: 10, padding: 10 }}>
      <div
        role="img"
        aria-label={ariaLabel}
        className="grid gap-1 tabular-nums"
        style={{ gridTemplateColumns: `auto repeat(${tickers.length}, minmax(72px, 1fr))` }}
      >
        <div />
        {tickers.map(ticker => (
          <div key={ticker} className="px-1 text-center" style={headStyle}>{ticker}</div>
        ))}
        {tickers.map((ticker, i) => (
          <div key={ticker} className="contents">
            <div className="flex items-center pr-2" style={headStyle}>{ticker}</div>
            {matrix[i].map((value, j) => (
              <div
                key={tickers[j] ?? j}
                className="flex items-center justify-center rounded-md px-1 py-2.5"
                style={{ background: colorFor(value), color: 'var(--color-ink)', fontSize: 13 }}
              >
                {formatValue(value)}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
