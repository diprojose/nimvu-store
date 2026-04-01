import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Footer from '@/components/custom/Footer'

// Mock Pathname
vi.mock('next/navigation', () => {
  return {
    usePathname: () => '/',
  }
})

describe('Footer component', () => {
  it('renderiza toda la información de contacto correctamente', () => {
    render(<Footer />)
    expect(screen.getByText('Ayuda y Soporte')).toBeInTheDocument()
    expect(screen.getByText('Bogota, Colombia', { exact: false })).toBeInTheDocument()
    expect(screen.getByText('nimvustore@gmail.com', { exact: false })).toBeInTheDocument()
  })

  it('renderiza todos los links de Cuenta y Tienda hacia sus paths correctos', () => {
    render(<Footer />)
    // Buscamos los anchors usando su texto y validamos sus links
    const miCuentaLink = screen.getByText('Mi Cuenta').closest('a')
    expect(miCuentaLink).toHaveAttribute('href', '/register')

    const carritoLink = screen.getByText('Carrito').closest('a')
    expect(carritoLink).toHaveAttribute('href', '/cart')

    const tiendaLink = screen.getByText('Tienda').closest('a')
    expect(tiendaLink).toHaveAttribute('href', '/productos')
  })

  it('renderiza todos los links de de Políticas generados', () => {
    render(<Footer />)
    
    expect(screen.getByText('Políticas de Privacidad').closest('a')).toHaveAttribute('href', '/politicas-de-privacidad')
    expect(screen.getByText('Políticas de Devoluciones').closest('a')).toHaveAttribute('href', '/politicas-de-devoluciones')
    expect(screen.getByText('Términos de uso').closest('a')).toHaveAttribute('href', '/terminos-de-uso')
    expect(screen.getByText('Preguntas Frecuentes').closest('a')).toHaveAttribute('href', '/faq')
    expect(screen.getByText('Contacto').closest('a')).toHaveAttribute('href', '/contacto')
  })
})
