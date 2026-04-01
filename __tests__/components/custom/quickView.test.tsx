import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import QuickView from '@/components/custom/quickView'
import { useCartStore } from '@/store/cart'
import { FrontendProduct } from '@/lib/api'

vi.mock('@/store/cart', () => ({
  useCartStore: vi.fn(),
}))

vi.mock('sonner', () => ({
  toast: { success: vi.fn() }
}))

const mockItem: FrontendProduct = {
  id: "prod-2",
  title: "Vaso Impreso",
  description: "Vaso de prueba",
  slug: "vaso",
  thumbnail: "/vaso.jpg",
  price: 20000,
  images: [{ id: "img-1", url: "/vaso.jpg" }],
  variants: []
}

describe('QuickView component', () => {
  it('renderiza la información del producto', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(useCartStore as unknown as any).mockReturnValue(vi.fn())

    render(<QuickView item={mockItem} />)
    expect(screen.getByText('Vaso Impreso')).toBeInTheDocument()
    expect(screen.getByText('Vaso de prueba')).toBeInTheDocument()
  })

  it('permite agregar al carrito', () => {
    const mockAddItem = vi.fn()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(useCartStore as unknown as any).mockReturnValue(mockAddItem)
    
    render(<QuickView item={mockItem} />)
    const btn = screen.getByText('Agregar al carrito', { exact: false })
    fireEvent.click(btn)
    expect(mockAddItem).toHaveBeenCalledWith(mockItem, "prod-2", 1)
  })
})
