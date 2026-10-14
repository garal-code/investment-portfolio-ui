import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Metodologia } from './Metodologia'

function summary() {
  return screen.getByText('¿Cómo se calcula?', { selector: 'summary *' })
}

describe('Metodologia', () => {
  it('renders the summary collapsed by default', () => {
    render(<Metodologia />)

    expect(screen.getByRole('region', { name: '¿Cómo se calcula?' })).toBeInTheDocument()
    expect(summary().closest('details')).not.toHaveAttribute('open')
    expect(screen.getByText(/al menos 12 meses comunes/)).not.toBeVisible()
  })

  it('shows the method step by step once opened', async () => {
    render(<Metodologia />)

    fireEvent.click(summary())

    await waitFor(() => expect(summary().closest('details')).toHaveAttribute('open'))
    const region = screen.getByRole('region', { name: '¿Cómo se calcula?' })
    expect(within(region).getAllByRole('heading', { level: 3 })).toHaveLength(9)
    expect(within(region).getByText(/al menos 12 meses comunes/)).toBeVisible()
    expect(within(region).getByText(/n − 1/)).toBeVisible()
    expect(within(region).getByText(/sin ventas en corto/)).toBeVisible()
    expect(within(region).getByText(/no tienen tipo de cambio actual/)).toBeVisible()
    expect(within(region).getByText(/no una recomendación de inversión/)).toBeVisible()
  })
})
