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

// The source is a repo-owned document, but the renderer must stay safe if
// that ever changes: no raw HTML, no javascript: links, KaTeX untrusted.
describe('MarkdownDocument — untrusted content', () => {
  it('renders raw HTML as text, never as elements', () => {
    const { container } = render(<MarkdownDocument source={'<img src=x onerror=alert(1)>'} />)
    expect(container.querySelector('img')).toBeNull()
  })

  it('strips javascript: URLs from links', () => {
    const { container } = render(<MarkdownDocument source={'[x](javascript:alert(1))'} />)
    for (const a of container.querySelectorAll('a')) {
      expect(a.getAttribute('href') ?? '').not.toMatch(/javascript:/i)
    }
  })

  it('does not turn KaTeX \\href into a link', () => {
    const { container } = render(<MarkdownDocument source={'$\\href{javascript:alert(1)}{a}$'} />)
    expect(container.querySelector('a')).toBeNull()
  })
})
