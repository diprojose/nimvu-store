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
  stock: 10,
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
    // El título aparece en el encabezado y en el breadcrumb; apuntamos al heading.
    expect(screen.getByRole('heading', { name: 'Taza 3D Star Wars' })).toBeInTheDocument()
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

  it('agrega el producto base cuando no se eligió variante', () => {
    // Ninguna variante viene preseleccionada: el producto base es una opción
    // válida y es la de por defecto, así que el id que viaja es el del
    // producto. El test antes esperaba "var-1", de cuando la primera variante
    // se seleccionaba sola.
    const mockAddItem = vi.fn()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(useCartStore as unknown as any).mockReturnValue(mockAddItem)

    render(<ProductDetails product={mockProduct} />)

    fireEvent.click(screen.getByText('Agregar al Carrito', { exact: false }))

    expect(mockAddItem).toHaveBeenCalledWith(mockProduct, "prod-1", 1)
  })

  it('agrega la variante elegida cuando se selecciona una', () => {
    const mockAddItem = vi.fn()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(useCartStore as unknown as any).mockReturnValue(mockAddItem)

    render(<ProductDetails product={mockProduct} />)

    fireEvent.click(screen.getByTitle('Negro'))
    fireEvent.click(screen.getByText('Agregar al Carrito', { exact: false }))

    expect(mockAddItem).toHaveBeenCalledWith(mockProduct, "var-2", 1)
  })
})
