import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import CheckoutPage from '@/app/checkout/page'
import { useAuthStore } from '@/store/authStore'
import { useCartStore } from '@/store/cart'
import { addresses } from '@/lib/api'

/**
 * Regresion: tres clientes reportaron el 2026-09-23 que no podian comprar.
 *
 * Al guardar una direccion nueva, el checkout seleccionaba la fila CRUDA que
 * devuelve el backend (street/state/zip) en vez del formato de la tienda
 * (address_1/province). La direccion se veia completa en la tarjeta —esa sale
 * de la lista ya traducida— pero el bloque de pago la daba por incompleta y
 * bloqueaba el boton, sin salida posible: una direccion guardada no se puede
 * editar desde el checkout.
 */

vi.mock('@/store/authStore', () => ({ useAuthStore: vi.fn() }))
vi.mock('@/store/cart', () => ({ useCartStore: vi.fn() }))
vi.mock('next/navigation', () => ({ useRouter: vi.fn(() => ({ push: vi.fn() })) }))
vi.mock('sonner', () => ({ toast: { error: vi.fn(), success: vi.fn() } }))

vi.mock('@/lib/api', () => ({
  addresses: { create: vi.fn() },
  orders: { create: vi.fn(), createGuest: vi.fn() },
  shipping: { calculate: vi.fn().mockResolvedValue({ price: 12000 }) },
  discounts: { validate: vi.fn() },
  checkoutLeads: { capture: vi.fn() },
}))

// Stub del paso 2: dispara onSaveNew con lo que el cliente escribio en el
// formulario, sin montar el modal ni los Select de Radix.
const DATOS_FORMULARIO = {
  first_name: 'Catalina',
  last_name: 'Gomez',
  address_1: 'Av calle 116 #21-73',
  company: '',
  postal_code: '110111',
  city: 'Bogotá',
  country_code: 'Colombia',
  province: 'Cundinamarca',
  phone: '3213394617',
}

vi.mock('@/components/custom/checkout/CheckoutAddress', () => ({
  CheckoutAddress: ({
    onSaveNew,
  }: {
    onSaveNew: (data: typeof DATOS_FORMULARIO) => Promise<void>
  }) => (
    <button onClick={() => onSaveNew(DATOS_FORMULARIO)}>guardar-direccion</button>
  ),
}))

describe('CheckoutPage - guardar una direccion nueva', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('habilita el pago tras guardar la direccion', async () => {
    const cliente = { id: 'us-1', first_name: 'Catalina', email: 'cata@correo.com', addresses: [] }

    // Lo que devuelve POST /addresses: columnas del backend, sin address_1.
    ;(addresses.create as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'add-9',
      userId: 'us-1',
      street: 'Av calle 116 #21-73',
      city: 'Bogotá',
      state: 'Cundinamarca',
      zip: '110111',
      country: 'Colombia',
      phone: '3213394617',
    })

    // Tras el sync, el store ya la tiene traducida al formato del checkout.
    const traducida = { id: 'add-9', ...DATOS_FORMULARIO }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(useAuthStore as any).getState = () => ({
      customer: { ...cliente, addresses: [traducida] },
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(useAuthStore as any).mockReturnValue({ customer: cliente, syncWithBackend: vi.fn() })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(useCartStore as any).mockReturnValue({
      items: [{ id: 'item-1', title: 'Portavaso', price: 40000, quantity: 1, unit_price: 40000, productId: 'prod-1', thumbnail: '/p.png' }],
      getCartTotal: () => 40000,
      getCartSubtotal: () => 40000,
      clearCart: vi.fn(),
    })

    render(<CheckoutPage />)
    fireEvent.click(screen.getByText('guardar-direccion'))

    // Señal positiva primero: sin esperar a que el guardado termine, las
    // comprobaciones de abajo pasan por vacias (se evaluan antes de que la
    // pagina se actualice) y el test da por bueno el bug.
    await waitFor(() => {
      expect(screen.getAllByText(/52\.000/).length).toBeGreaterThan(0)
    })

    expect(screen.queryByText(/Tu dirección está incompleta/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/Completa los datos de envío/i)).not.toBeInTheDocument()
  })
})
