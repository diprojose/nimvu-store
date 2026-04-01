import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import AddressForm from '@/components/custom/AddressForm'

describe('AddressForm component', () => {
  it('se renderiza correctamente con el botón de guardar por defecto', () => {
    const mockSubmit = vi.fn()
    render(<AddressForm onSubmit={mockSubmit} />)
    expect(screen.getByText('Guardar Dirección')).toBeInTheDocument()
    expect(screen.getByText('Nombre *')).toBeInTheDocument()
  })

  it('llama a onSubmit mock al hacer submit nativo', () => {
    const mockSubmit = vi.fn()
    render(<AddressForm onSubmit={mockSubmit} />)
    
    // Simulate filing the form
    const form = screen.getByRole('button', { name: "Guardar Dirección" }).closest('form')
    if (form) fireEvent.submit(form)
    
    expect(mockSubmit).toHaveBeenCalled()
  })
})
