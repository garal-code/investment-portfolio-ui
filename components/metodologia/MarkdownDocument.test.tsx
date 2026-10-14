import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MarkdownDocument } from './MarkdownDocument'

const SAMPLE = `# Título del documento

## 1. Sección

Rentabilidad $r_t = P_t / P_{t-1} - 1$ y la varianza:

$$
\\sigma_p^2 = w^{\\top} \\Sigma w
$$

| Motivo | Significado |
|---|---|
| sin ticker | No tiene símbolo |
`

describe('MarkdownDocument', () => {
  it('renders headings and tables', () => {
    render(<MarkdownDocument source={SAMPLE} />)

    expect(screen.getByRole('heading', { level: 1, name: 'Título del documento' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: '1. Sección' })).toBeInTheDocument()
    const table = screen.getByRole('table')
    expect(within(table).getByRole('columnheader', { name: 'Motivo' })).toBeInTheDocument()
    expect(within(table).getByRole('cell', { name: 'sin ticker' })).toBeInTheDocument()
  })

  it('renders inline and display math with KaTeX', () => {
    const { container } = render(<MarkdownDocument source={SAMPLE} />)

    expect(container.querySelectorAll('.katex').length).toBeGreaterThanOrEqual(2)
    expect(container.querySelector('.katex-display')).toBeInTheDocument()
    expect(container.querySelector('.katex-error')).not.toBeInTheDocument()
  })

  it('wraps tables and display math in horizontal scroll containers', () => {
    render(<MarkdownDocument source={SAMPLE} />)

    expect(screen.getByRole('table').parentElement).toHaveStyle({ overflowX: 'auto' })
  })
})
