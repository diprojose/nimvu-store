import { render, screen, waitFor } from '@testing-library/react'
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

const calculateShipping = vi.fn()

vi.mock('@/lib/api', () => ({
  shipping: { calculate: (...args: unknown[]) => calculateShipping(...args) },
  orders: { create: vi.fn(), createGuest: vi.fn() },
  addresses: { create: vi.fn(), list: vi.fn() },
  discounts: { validate: vi.fn() },
}))

describe('CheckoutPage Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('ofrece checkout como invitado cuando no hay sesión', () => {
    // Antes este test buscaba "Para continuar, necesitas identificarte.": el
    // checkout bloqueaba a quien no tuviera cuenta. Hoy la primera opción es
    // comprar como invitado dejando el correo, así que ese texto ya no existe.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(useAuthStore as any).mockReturnValue({ customer: null, syncWithBackend: vi.fn() });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(useCartStore as any).mockReturnValue({ 
      items: [], getCartTotal: () => 0, getCartSubtotal: () => 0, clearCart: vi.fn() 
    });

    render(<CheckoutPage />)
    expect(screen.getByLabelText('Continuar como invitado')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('tu@correo.com')).toBeInTheDocument()
    expect(screen.getByText(/O si ya tienes cuenta/i)).toBeInTheDocument()
  })

  it('renderiza paso 1 y 2 cuando hay sesión, cobrando la tarifa que cotiza el backend', async () => {
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

    // La tarifa real la manda el backend; antes el front mostraba un respaldo
    // fijo de 15.000 y la orden se creaba con esta, así que el cliente veía un
    // total y la pasarela le cobraba otro.
    calculateShipping.mockResolvedValue({ id: 'rate-1', country: 'Colombia', price: 19900 })

    render(<CheckoutPage />)

    expect(screen.getByText('Sesión iniciada como Bruce')).toBeInTheDocument()
    expect(screen.getByText(/Medellin/i)).toBeInTheDocument()

    // 20.000 de subtotal + 19.900 cotizados = 39.900
    await waitFor(() => {
      expect(screen.getAllByText(/39\.900/).length).toBeGreaterThan(0)
    })
    expect(screen.queryByText(/35\.000/)).not.toBeInTheDocument()
  })

  it('bloquea el pago mientras la cotización de envío está en vuelo', async () => {
    // El bug medido en producción: el botón de pago quedaba habilitado con el
    // respaldo de 15.000 en pantalla, y quien alcanzaba a tocarlo antes de que
    // respondiera `shipping/calculate` llegaba a Wompi con el total corregido
    // por el backend: veía $55.000 y la pasarela le pedía $59.900.
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

    // Cotización que nunca resuelve: el cliente con red lenta vive en este estado.
    let resolveRate: (rate: { price: number }) => void = () => {};
    calculateShipping.mockReturnValue(new Promise(resolve => { resolveRate = resolve }))

    render(<CheckoutPage />)

    await waitFor(() => {
      expect(screen.getAllByText(/Calculando el costo de envío/i).length).toBeGreaterThan(0)
    })
    // Sin tarifa no hay total que cobrar, y menos uno inventado.
    expect(screen.queryByText(/35\.000/)).not.toBeInTheDocument()

    resolveRate({ price: 19900 })

    await waitFor(() => {
      expect(screen.queryByText(/Calculando el costo de envío/i)).not.toBeInTheDocument()
    })
    expect(screen.getAllByText(/39\.900/).length).toBeGreaterThan(0)
  })

  it('no cobra envío en el total mientras no haya dirección', () => {
    // El bug: `shippingCost` arranca en 15.000 como respaldo y se sumaba al
    // total aunque la fila de envío dijera "calculado al ingresar la
    // dirección". El cliente veía subtotal 120.000 y total 135.000, sin
    // ninguna línea que explicara los 15.000 de diferencia.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(useAuthStore as any).mockReturnValue({ customer: null, syncWithBackend: vi.fn() });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(useCartStore as any).mockReturnValue({
      items: [{ id: "item-1", title: "Portavasos", price: 60000, quantity: 2, unit_price: 60000, productId: "prod-1", thumbnail: "/p.png" }],
      getCartTotal: () => 120000,
      getCartSubtotal: () => 120000,
      clearCart: vi.fn()
    });

    render(<CheckoutPage />)

    expect(screen.getAllByText(/120\.000/).length).toBeGreaterThan(0)
    expect(screen.queryByText(/135\.000/)).not.toBeInTheDocument()
    expect(
      screen.getAllByText(/Calculado al ingresar la dirección/i).length
    ).toBeGreaterThan(0)
  })
})
