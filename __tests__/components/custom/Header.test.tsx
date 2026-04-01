import { render, screen, act, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Header from '@/components/custom/Header'

// Mocks simples para zustand
vi.mock('@/store/cart', () => ({
  useCartStore: (selector: any) => selector({
    items: [],
    getCartSubtotal: () => 0,
    getCartTotal: () => 0
  })
}))

vi.mock('@/store/authStore', () => ({
  useAuthStore: (selector: any) => selector({
    customer: null,
    logout: vi.fn(),
  })
}))

// Mock API
vi.mock('@/lib/api', () => ({
  categories: {
    list: vi.fn(() => Promise.resolve([{ id: '1', name: 'Zapatos', slug: 'zapatos' }]))
  }
}))

// Sustituir next/image para el entorno vitest/jsdom
vi.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    const { priority, ...rest } = props
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...rest} data-priority={priority ? "true" : "false"} />
  },
}))

describe('Header component', () => {
  it('Debe renderizar el logo y los enlaces de navegación', async () => {
    render(<Header />)
    
    // Verificamos visualmente el logo
    expect(screen.getByAltText('Nimvu logo')).toBeInTheDocument()
    
    // Enlaces visibles
    expect(screen.getByText('Nosotros')).toBeInTheDocument()
    expect(screen.getByText('Tienda')).toBeInTheDocument()
    
    // Dejamos que los efectos asíncronos procesen
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 50))
    })

    // Chequeamos que la categoría "Zapatos" simulada se cargó al renderizar el dropdown
    const categoriesDesktop = screen.getAllByText('Zapatos', { selector: 'a' })
    expect(categoriesDesktop.length).toBeGreaterThan(0)
  })

  it('Debe abrir el carrito interactivo y mostrar el Sheet vacío', async () => {
    render(<Header />)
    
    // Asegurar montado inicial del trigger (isMounted effect)
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 50))
    })

    // Como el carrito empieza vacío, buscará el Badge con "0"
    const cartBadge = screen.getByText('0', { selector: '.bg-black.text-white' })
    
    // Simulamos el click que invoca a Shadcn UI "SheetTrigger"
    await act(async () => {
      fireEvent.click(cartBadge)
    })

    // Verificar si el Sheet está en pantalla
    expect(screen.getByText('No hay productos')).toBeInTheDocument()
    expect(screen.getByText('Subtotal:')).toBeInTheDocument()
  })
})
