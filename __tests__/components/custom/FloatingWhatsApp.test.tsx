import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import FloatingWhatsApp from '@/components/custom/FloatingWhatsApp'

describe('FloatingWhatsApp component', () => {
  it('renderiza el enlace flotante hacia WhatsApp con link directo', () => {
    render(<FloatingWhatsApp />)
    const link = screen.getByLabelText('Chat on WhatsApp')
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', 'https://wa.link/qicquj')
  })
})
