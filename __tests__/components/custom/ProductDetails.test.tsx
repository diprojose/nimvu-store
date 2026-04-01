import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import ProductDetails from '@/components/custom/ProductDetails'
import { useCartStore } from '@/store/cart'
import { FrontendProduct } from '@/lib/api'

// Mock de Zustand store
vi.mock('@/store/cart', () => ({
  useCartStore: vi.fn(),
}))

vi.mock('sonner', () => ({
  toast: { success: vi.fn() }
}))

const mockProduct: FrontendProduct = {
  id: "prod-1",
  title: "Taza 3D Star Wars",
  description: "Una taza épica",
  slug: "taza-3d",
  thumbnail: "/taza.jpg",
  price: 50000,
  images: [{ id: "img-1", url: "/taza.jpg" }],
  variants: [
    { id: "var-1", title: "Blanco", sku: "BL-001", inventory_quantity: 10, price: 50000, images: ["/blanco.jpg"] },
    { id: "var-2", title: "Negro", sku: "NG-001", inventory_quantity: 5, price: 55000, images: ["/negro.jpg"] }
  ]
}

describe('ProductDetails component', () => {
  it('renderiza la información básica del producto', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(useCartStore as unknown as any).mockReturnValue(vi.fn())

    render(<ProductDetails product={mockProduct} />)
    expect(screen.getByText('Taza 3D Star Wars')).toBeInTheDocument()
    expect(screen.getByText('Una taza épica')).toBeInTheDocument()
    expect(screen.getByText('Variantes:')).toBeInTheDocument()
  })

  it('permite cambiar visualmente la variante haciendo click', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(useCartStore as unknown as any).mockReturnValue(vi.fn())
    render(<ProductDetails product={mockProduct} />)
    
    const variantButton = screen.getByTitle('Negro')
    fireEvent.click(variantButton)
    
    expect(screen.getByText('Negro', { selector: 'span' })).toBeInTheDocument()
  })

  it('permite agregar al carrito enviando los ids correctos', () => {
    const mockAddItem = vi.fn()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(useCartStore as unknown as any).mockReturnValue(mockAddItem)
    
    render(<ProductDetails product={mockProduct} />)
    
    const addToCartButton = screen.getByText('Agregar al Carrito', { exact: false })
    fireEvent.click(addToCartButton)
    
    expect(mockAddItem).toHaveBeenCalledWith(mockProduct, "var-1", 1)
  })
})
