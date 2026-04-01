import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import TestimonialItem from '@/components/custom/testimonialItem'
import { TestimonialsModel } from '@/types/testimonials'

const mockTestimonial = {
  id: 1, // Changed to number
  name: "Jane Doe",
  text: "Amazing product!",
  stars: 5,
  photo: "/jane.jpg"
} as unknown as TestimonialsModel

describe('TestimonialItem component', () => {
  it('renderiza nombre y comentario correctamente', () => {
    render(<TestimonialItem item={mockTestimonial} />)
    expect(screen.getByText('Jane Doe')).toBeInTheDocument()
    expect(screen.getByText('Amazing product!')).toBeInTheDocument()
  })
})
