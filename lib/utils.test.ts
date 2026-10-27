import { AxiosError, AxiosHeaders, type AxiosResponse } from 'axios'
import { describe, expect, it } from 'vitest'
import {
  formatEur, formatCurrency, formatPct, formatPeso, formatRatioPct, formatNum, formatMes, maskAmount,
  formatPp, formatEurSigned,
  TREEMAP_COLORS, treemapColor,
  getErrorMessage, getErrorStatus, getFronteraErrorMessage,
} from './utils'

describe('formatEur — es-ES currency formatting', () => {
  it('formats a positive amount with thousands grouping and comma decimals', () => {
    expect(formatEur(15852.0)).toBe('15.852,00 €')
  })

  it('uses U+2212 (minus sign) instead of ASCII hyphen for negative amounts', () => {
    const result = formatEur(-5.2)
    expect(result).toContain('−')
    expect(result).not.toContain('-')
  })

  it('returns an em dash placeholder for null/undefined', () => {
    expect(formatEur(null)).toBe('—')
    expect(formatEur(undefined)).toBe('—')
  })
})

describe('formatCurrency — es-ES currency formatting for any currency', () => {
  it('applies grouping and U+2212 minus for a non-EUR currency', () => {
    expect(formatCurrency(1234.5, 'USD')).toBe('1.234,50 US$')
    const negative = formatCurrency(-1234.5, 'USD')
    expect(negative).toContain('−')
    expect(negative).not.toContain('-')
  })
})

describe('formatPct — es-ES percentage formatting', () => {
  it('formats a positive percentage with a leading + and space before %', () => {
    expect(formatPct(34.25)).toBe('+34,25 %')
  })

  it('formats a negative percentage with U+2212 and space before %', () => {
    expect(formatPct(-5.2)).toBe('−5,20 %')
  })

  it('returns an em dash placeholder for null/undefined', () => {
    expect(formatPct(null)).toBe('—')
    expect(formatPct(undefined)).toBe('—')
  })
})

describe('formatPeso — 1-decimal weight percentage', () => {
  it('converts a 0-1 fraction into a 1-decimal es-ES percentage', () => {
    expect(formatPeso(0.184)).toBe('18,4 %')
  })

  it('returns an em dash placeholder for null/undefined', () => {
    expect(formatPeso(null)).toBe('—')
    expect(formatPeso(undefined)).toBe('—')
  })
})

describe('formatRatioPct — unsigned fraction as a 2-decimal percentage', () => {
  it('converts a 0-1 fraction into a 2-decimal es-ES percentage without sign', () => {
    expect(formatRatioPct(0.043625)).toBe('4,36 %')
  })

  it('accepts a custom number of decimals', () => {
    expect(formatRatioPct(0.043625, 3)).toBe('4,363 %')
  })

  it('uses U+2212 for negative fractions', () => {
    expect(formatRatioPct(-0.012)).toBe('−1,20 %')
  })

  it('returns an em dash placeholder for null/undefined', () => {
    expect(formatRatioPct(null)).toBe('—')
    expect(formatRatioPct(undefined)).toBe('—')
  })
})

describe('formatPp — signed weight delta in percentage points', () => {
  it('converts a 0-1 fraction delta into signed 1-decimal points', () => {
    expect(formatPp(0.1)).toBe('+10,0 pp')
    expect(formatPp(-0.0525)).toBe('−5,3 pp')
  })

  it('renders zero, or a delta that rounds to zero, without sign', () => {
    expect(formatPp(0)).toBe('0,0 pp')
    expect(formatPp(-0.0004)).toBe('0,0 pp')
  })
})

describe('formatEurSigned — EUR amount with explicit sign', () => {
  it('prefixes positive amounts with "+" and keeps U+2212 for negatives', () => {
    expect(formatEurSigned(1250)).toBe('+1.250,00 €')
    expect(formatEurSigned(-3100)).toBe('−3.100,00 €')
  })

  it('renders an amount that rounds to zero without sign', () => {
    expect(formatEurSigned(0.001)).toBe('0,00 €')
    expect(formatEurSigned(-0.001)).toBe('0,00 €')
  })
})

describe('formatNum — plain es-ES number', () => {
  it('formats with the requested fixed decimals, never scientific notation', () => {
    expect(formatNum(0.00084885, 6)).toBe('0,000849')
    expect(formatNum(1, 2)).toBe('1,00')
  })

  it('uses U+2212 for negatives and drops the sign when rounding to zero', () => {
    expect(formatNum(-0.2287, 2)).toBe('−0,23')
    expect(formatNum(-0.001, 2)).toBe('0,00')
  })
})

describe('formatMes — short month and year', () => {
  it('renders a YYYY-MM-DD date as an es-ES month label', () => {
    expect(formatMes('2024-01-01')).toBe('ene 2024')
    expect(formatMes('2026-12-31')).toBe('dic 2026')
  })
})

describe('maskAmount — privacy-mode currency placeholder', () => {
  it('masks a EUR amount without revealing digits', () => {
    expect(maskAmount('EUR')).toBe('••••• €')
  })

  it('masks a non-EUR amount using that currency symbol', () => {
    expect(maskAmount('USD')).toBe('••••• US$')
  })

  it('defaults to EUR when no currency is given', () => {
    expect(maskAmount()).toBe('••••• €')
  })
})

describe('TREEMAP_COLORS / treemapColor — 9-entry palette with wraparound', () => {
  it('has exactly 9 background/text color pairs in weight order', () => {
    expect(TREEMAP_COLORS).toHaveLength(9)
    expect(TREEMAP_COLORS[0]).toEqual({ bg: '#2D6A5A', text: '#fff' })
    expect(TREEMAP_COLORS[8]).toEqual({ bg: '#a09080', text: '#221e1a' })
  })

  it('wraps around every 9 entries', () => {
    expect(treemapColor(9)).toBe(treemapColor(0))
    expect(treemapColor(11)).toBe(treemapColor(2))
  })

  it('returns distinct colors for distinct indices within the palette', () => {
    expect(treemapColor(0)).not.toBe(treemapColor(1))
  })
})

describe('sign after rounding', () => {
  it('formatPct shows a positive-style zero for sub-rounding negatives', () => {
    expect(formatPct(-0.001)).toBe('+0,00 %')
    expect(formatPct(-0)).toBe('+0,00 %')
    expect(formatPct(0)).toBe('+0,00 %')
  })

  it('formatPct keeps the minus once the rounded value is non-zero', () => {
    expect(formatPct(-0.005)).toBe('−0,01 %')
    expect(formatPct(-12.5)).toBe('−12,50 %')
  })

  it('formatEur / formatCurrency never render a minus on a rounded zero', () => {
    expect(formatEur(-0.001)).toMatch(/^0,00\s€$/)
    expect(formatEur(-0.004, 2)).toMatch(/^0,00\s€$/)
    expect(formatEur(-0.4, 0)).toMatch(/^0\s€$/)
    expect(formatCurrency(-0.001, 'USD')).not.toContain('−')
  })

  it('formatEur keeps the minus for non-zero rounded values', () => {
    expect(formatEur(-0.01)).toMatch(/^−0,01\s€$/)
  })
})

function axiosError(status: number, data: unknown): AxiosError {
  const response = {
    status, data, statusText: '', headers: {}, config: { headers: new AxiosHeaders() },
  } as AxiosResponse
  return new AxiosError(`Request failed with status code ${status}`, 'ERR_BAD_RESPONSE', undefined, undefined, response)
}

describe('getErrorMessage — always returns text', () => {
  const fallback = 'No se pudo crear la cuenta'

  it('returns a string detail as is', () => {
    expect(getErrorMessage(axiosError(409, { detail: 'El email ya está en uso' }), fallback)).toBe(
      'El email ya está en uso',
    )
  })

  it('falls back when the string detail is empty or blank', () => {
    expect(getErrorMessage(axiosError(400, { detail: '' }), fallback)).toBe(fallback)
    expect(getErrorMessage(axiosError(400, { detail: '   ' }), fallback)).toBe(fallback)
    expect(getErrorMessage(axiosError(400, { detail: '\n\t' }), fallback)).toBe(fallback)
  })

  it('falls back when detail is a list (422 validation errors come in English)', () => {
    const detail = [
      { loc: ['body', 'email'], msg: 'value is not a valid email address', type: 'value_error' },
      { loc: ['body', 'password'], msg: 'String should have at least 8 characters', type: 'string_too_short' },
    ]
    expect(getErrorMessage(axiosError(422, { detail }), fallback)).toBe(fallback)
    expect(getErrorMessage(axiosError(422, { detail: [] }), fallback)).toBe(fallback)
  })

  it('falls back when detail is neither text nor a list', () => {
    expect(getErrorMessage(axiosError(400, { detail: { code: 'bad_request' } }), fallback)).toBe(fallback)
    expect(getErrorMessage(axiosError(400, { detail: 400 }), fallback)).toBe(fallback)
    expect(getErrorMessage(axiosError(400, { detail: true }), fallback)).toBe(fallback)
  })

  it('falls back when there is no response detail at all', () => {
    expect(getErrorMessage(new Error('Network Error'), fallback)).toBe(fallback)
    expect(getErrorMessage(axiosError(500, 'Internal Server Error'), fallback)).toBe(fallback)
    expect(getErrorMessage(null, fallback)).toBe(fallback)
  })
})

describe('getErrorStatus', () => {
  it('returns the HTTP status of an axios error', () => {
    expect(getErrorStatus(axiosError(503, {}))).toBe(503)
  })

  it('returns undefined for errors without a response', () => {
    expect(getErrorStatus(new Error('Network Error'))).toBeUndefined()
    expect(getErrorStatus(null)).toBeUndefined()
  })
})

describe('getFronteraErrorMessage — user-facing frontier error copy', () => {
  it('shows the backend detail for insufficient-data errors (400)', () => {
    const detail = 'No hay suficientes datos: se necesitan al menos 2 activos con histórico'
    expect(getFronteraErrorMessage(axiosError(400, { detail }))).toBe(detail)
  })

  it('shows a provider-unavailable message for 503, regardless of detail', () => {
    expect(getFronteraErrorMessage(axiosError(503, { detail: 'yfinance timeout' }))).toBe(
      'El proveedor de precios no está disponible. Prueba de nuevo en unos minutos.',
    )
  })

  it('falls back to a generic message for unknown errors', () => {
    const generic = 'No se pudo calcular la frontera eficiente.'
    expect(getFronteraErrorMessage(new Error('Network Error'))).toBe(generic)
    expect(getFronteraErrorMessage(axiosError(500, 'Internal Server Error'))).toBe(generic)
  })

  it('ignores non-string details (e.g. 422 validation arrays)', () => {
    const error = axiosError(422, { detail: [{ loc: ['query', 'anios'], msg: 'too large' }] })
    expect(getFronteraErrorMessage(error)).toBe('No se pudo calcular la frontera eficiente.')
  })
})
