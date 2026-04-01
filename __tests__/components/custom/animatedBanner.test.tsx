import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import AnimatedBanner from '@/components/custom/animatedBanner'

describe('AnimatedBanner component', () => {
  it('renderiza la cabecera y el enlace inicial hacia productos', () => {
    render(<AnimatedBanner />)
    expect(screen.getByText('Diseño funcional que emociona')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: "Ver más" })).toHaveAttribute('href', '/productos')
  })
})
