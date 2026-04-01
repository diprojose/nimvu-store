import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import StarRating from '@/components/custom/starRating'

describe('StarRating component', () => {
  it('renderiza 5 estrellas en total', () => {
    const { container } = render(<StarRating rating={3} />)
    const stars = container.querySelectorAll('svg')
    expect(stars.length).toBe(5)
  })

  it('colorea correctamente las estrellas activas vs inactivas', () => {
    const { container } = render(<StarRating rating={4} />)
    const stars = container.querySelectorAll('svg')
    expect(stars[0]).toHaveClass('text-yellow-400')
    expect(stars[3]).toHaveClass('text-yellow-400')
    expect(stars[4]).toHaveClass('text-gray-300') 
  })
})
