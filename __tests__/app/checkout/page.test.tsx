import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import CheckoutPage from '@/app/checkout/page'
import { useAuthStore } from '@/store/authStore'
import { useCartStore } from '@/store/cart'

vi.mock('@/store/authStore', () => ({
  useAuthStore: vi.fn(),
}))

vi.mock('@/store/cart', () => ({
  useCartStore: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({ push: vi.fn() }))
}))

vi.mock('sonner', () => ({
  toast: { error: vi.fn(), success: vi.fn() }
}))

describe('CheckoutPage Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renderiza la vista bloqueada para usuario no autenticado', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(useAuthStore as any).mockReturnValue({ customer: null, syncWithBackend: vi.fn() });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(useCartStore as any).mockReturnValue({ 
      items: [], getCartTotal: () => 0, getCartSubtotal: () => 0, clearCart: vi.fn() 
    });

    render(<CheckoutPage />)
    expect(screen.getByText('Para continuar, necesitas identificarte.')).toBeInTheDocument()
  })

  it('renderiza paso 1 y 2 cuando hay sesión, sumando costos de envío por defecto', () => {
    const mockCustomer = {
      id: "us-1",
      first_name: "Bruce",
      email: "bruce@wayne.com",
      addresses: [{
        id: "add-1", first_name: "Bruce", last_name: "Wayne", city: "Medellin", province: "Antioquia", address_1: "Cave 1", postal_code: "000", phone: "123", company: "Wayne Ent"
      }]
    };
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(useAuthStore as any).mockReturnValue({ customer: mockCustomer, syncWithBackend: vi.fn() });
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(useCartStore as any).mockReturnValue({ 
      items: [{ id: "item-1", title: "BatiTaza", price: 20000, quantity: 1, unit_price: 20000, productId: "prod-1", thumbnail: "/taza.png" }], 
      getCartTotal: () => 20000, 
      getCartSubtotal: () => 20000, 
      clearCart: vi.fn() 
    });

    render(<CheckoutPage />)
    
    expect(screen.getByText('Sesión iniciada como Bruce')).toBeInTheDocument()
    expect(screen.getByText(/Medellin/i)).toBeInTheDocument()
    
    // Renderiza el summary total con el shipping cost de Wompi (20k subtotal + 15k shipping) = 35.000
    const totalAmounts = screen.getAllByText(/35\.000/i)
    expect(totalAmounts.length).toBeGreaterThan(0)
  })
})
