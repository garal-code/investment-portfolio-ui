import { describe, expect, it } from 'vitest'
import { readMetodologia } from './metodologia'

const FORBIDDEN = /\.py\b|numpy|scipy|yfinance|SLSQP|pandas|\/api\/|garal-screener|:\d+\)|endpoint|\.tsx?\b|`/i

describe('metodologia-markowitz.md', () => {
  it('has no code, library or file references an analyst would not know', async () => {
    const doc = await readMetodologia()
    expect(doc).not.toMatch(FORBIDDEN)
  })

  it('lists the five exclusion reasons as the UI shows them', async () => {
    const doc = await readMetodologia()
    for (const reason of ['sin ticker', 'sin precio actual', 'sin tipo de cambio', 'sin histórico de precios', 'histórico insuficiente']) {
      expect(doc).toContain(reason)
    }
  })

  it('includes the key formulas', async () => {
    const doc = await readMetodologia()
    expect(doc).toContain('\\frac{P_{i,t}}{P_{i,t-1}} - 1')
    expect(doc).toContain('n-1')
    expect(doc).toContain('w^{\\top}\\mu')
    expect(doc).toContain('w^{\\top}\\Sigma\\, w')
    expect(doc).toContain('\\sum_i w_i = 1')
    expect(doc).toMatch(/\(w_i\^\{\\text\{objetivo\}\} - w_i\^\{\\text\{actual\}\}\)/)
  })

  it('is notably shorter than the backend document', async () => {
    const doc = await readMetodologia()
    expect(doc.split('\n').length).toBeLessThan(250)
  })
})
