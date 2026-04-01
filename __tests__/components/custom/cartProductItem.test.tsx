import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import CartProductItem from '@/components/custom/cartProductItem'
import { CartItem } from '@/store/cart'

const mockRemoveItem = vi.fn()
const mockUpdateQuantity = vi.fn()

// Mockeamos el hook de Zustand
vi.mock('@/store/cart', () => ({
  useCartStore: (selector: any) => selector({
    removeItem: mockRemoveItem,
    updateQuantity: mockUpdateQuantity,
  })
}))

// Mockeamos la libería de toast (sonner)
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}))

// Mockeamos lucide-react (svgs) para que sea trivial buscarlos o localizarlos
vi.mock('lucide-react', () => ({
  Minus: () => <div data-testid="minus-icon" />,
  Plus: () => <div data-testid="plus-icon" />,
  X: () => <div data-testid="x-icon" />
}))

// Mock para Next/Image
vi.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />
  },
}))

const mockItem: CartItem = {
  id: 'item-123',
  variantId: 'var-123',
  productId: 'prod-123',
  title: 'Test Product',
  thumbnail: '',
  price: 50,
  unit_price: 50,
  quantity: 2,
}

describe('CartProductItem component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('Debe renderizar la información básica del componente', () => {
    render(<CartProductItem item={mockItem} cart={true} />)
    
    // El titulo renderiza
    expect(screen.getByText('Test Product')).toBeInTheDocument()
    // La cantidad base es 2
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('Debe llamar al store removeItem cuando se presiona la X', () => {
    render(<CartProductItem item={mockItem} cart={true} />)
    
    const removeButton = screen.getByTestId('x-icon').parentElement
    if (removeButton) fireEvent.click(removeButton)
    
    expect(mockRemoveItem).toHaveBeenCalledWith('item-123')
  })

  it('Debe invocar updateQuantity interactuando con + y -', () => {
    render(<CartProductItem item={mockItem} cart={true} />)
    
    const incButton = screen.getByLabelText('Increase quantity')
    const decButton = screen.getByLabelText('Decrease quantity')

    // Al incrementar, la cantidad base que es 2, sube a 3
    fireEvent.click(incButton)
    expect(mockUpdateQuantity).toHaveBeenCalledWith('item-123', 3) 

    // Al decrementar, va restando a la base (la base del render es 2, seria 1)
    fireEvent.click(decButton)
    expect(mockUpdateQuantity).toHaveBeenCalledWith('item-123', 1) 
  })

  it('Debe ocultar los controles de suma/resta si cart = false (ej. Vista rápida)', () => {
    render(<CartProductItem item={mockItem} cart={false} />)
    
    // Decrease / Increase targets should disappear
    const incButton = screen.queryByLabelText('Increase quantity')
    expect(incButton).not.toBeInTheDocument()
    
    // The quantity should just be plain text
    expect(screen.getByText('2')).toBeInTheDocument()
  })
})
