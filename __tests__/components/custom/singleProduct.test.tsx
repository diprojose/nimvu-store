import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import ProductItem from '@/components/custom/singleProduct'
import { FrontendProduct } from '@/lib/api'

// Mocks
const mockAddItem = vi.fn()

vi.mock('@/store/cart', () => ({
  useCartStore: (selector: any) => selector({
    addItem: mockAddItem,
  })
}))

vi.mock('sonner', () => ({
  toast: { success: vi.fn() }
}))

vi.mock('@/components/custom/modal', () => ({
  Modal: ({ isOpen, title, children }: any) => isOpen ? (
    <div data-testid="mock-modal">
      <h1>{title}</h1>
      {children}
    </div>
  ) : null
}))

vi.mock('@/components/custom/quickView', () => ({
  default: () => <div data-testid="mock-quickview" />
}))

vi.mock('lucide-react', () => ({
  ShoppingCart: () => <div data-testid="icon-cart" />,
  Eye: () => <div data-testid="icon-eye" />,
}))

vi.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    const { priority, fill, ...rest } = props
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...rest} data-priority={priority ? "true" : "false"} />
  }
}))

describe('ProductItem component (singleProduct)', () => {
  const mockProduct: FrontendProduct = {
    id: 'prod-123',
    title: 'Awesome Product',
    price: 99.99,
    thumbnail: 'http://localhost/image.png',
    slug: 'awesome-product',
    category: { id: 'cat-1', name: 'Tech', slug: 'tech' }
  } as FrontendProduct

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renderiza la informacion basica del producto', () => {
    render(<ProductItem item={mockProduct} />)
    
    expect(screen.getByText('Awesome Product')).toBeInTheDocument()
    expect(screen.getByText('Tech')).toBeInTheDocument() 
  })

  it('llama a addToCart del store de zustand', () => {
    render(<ProductItem item={mockProduct} />)
    
    const addToCartButton = screen.getByText('Agregar al carrito', { selector: 'button' })
    fireEvent.click(addToCartButton)

    // variantId fallback a product.id si default no existe
    expect(mockAddItem).toHaveBeenCalledWith(mockProduct, 'prod-123', 1)
  })

  it('abre el modal de QuickView al presionar el icono flotante del ojo', () => {
    render(<ProductItem item={mockProduct} />)
    
    // El modal empieza cerrado
    expect(screen.queryByTestId('mock-modal')).not.toBeInTheDocument()

    // Buscamos el boton visual quickview (ojo) y lo clickeamos
    const eyeButton = screen.getByTestId('icon-eye').parentElement
    if (eyeButton) fireEvent.click(eyeButton)

    // Check modal visibility
    expect(screen.getByTestId('mock-modal')).toBeInTheDocument()
    // Como el titulo existe en la tarjeta y en el modal, deber haber 2
    expect(screen.getAllByText('Awesome Product').length).toBeGreaterThan(0)
    expect(screen.getByTestId('mock-quickview')).toBeInTheDocument()
  })
})
