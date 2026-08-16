import { render, screen, act, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Header from '@/components/custom/Header'

let mockCartState: any = {
  items: [],
  getCartSubtotal: () => 0,
  getCartTotal: () => 0
};

vi.mock('@/store/cart', () => ({
  useCartStore: (selector: any) => selector(mockCartState)
}))

vi.mock('@/store/authStore', () => ({
  useAuthStore: (selector: any) => selector({
    customer: null,
    logout: vi.fn(),
  })
}))

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
}))

// El Header dejó de pedirle las categorías a `@/lib/api`: ahora salen del
// contexto de universos, agrupadas por universo. Se mockea el contexto en vez
// de envolver en UniverseProvider porque el provider haría su propio trabajo de
// resolución por ruta, que no es lo que este test verifica.
const mockUniverse = {
  id: 'u-1',
  name: 'Hogar',
  slug: 'hogar',
  // Sin isActive el Header trata al universo como deshabilitado y no pinta sus
  // categorías: el menú solo muestra las de universos activos.
  isActive: true,
  comingSoon: false,
  primaryColor: null,
  secondaryColor: null,
  accentColor: null,
}

vi.mock('@/lib/universe-context', () => ({
  useUniverse: () => ({
    universes: [mockUniverse],
    categories: [{ id: '1', name: 'Zapatos', slug: 'zapatos' }],
    categoriesByUniverseId: { 'u-1': [{ id: '1', name: 'Zapatos', slug: 'zapatos' }] },
    currentUniverse: mockUniverse,
    currentCategories: [{ id: '1', name: 'Zapatos', slug: 'zapatos' }],
    isLoadingCategories: false,
  }),
  universeCssVars: () => ({}),
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
    mockCartState = {
      items: [],
      getCartSubtotal: () => 0,
      getCartTotal: () => 0
    };
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
    mockCartState = {
      items: [],
      getCartSubtotal: () => 0,
      getCartTotal: () => 0
    };
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

  it('Debe renderizar la barra de envío gratis y el botón de pagar cuando hay productos', async () => {
    mockCartState = {
      items: [
        { id: '1', variantId: 'v-1', productId: 'p-1', title: 'Soporte Perrito', price: 25000, quantity: 1, thumbnail: '' },
        { id: '2', variantId: 'v-2', productId: 'p-2', title: 'Organizador', price: 90000, quantity: 1, thumbnail: '' }
      ],
      getCartSubtotal: () => 115000,
      getCartTotal: () => 115000
    };

    render(<Header />)

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 50))
    })

    const cartBadge = screen.getByText('2', { selector: '.bg-black.text-white' })
    await act(async () => {
      fireEvent.click(cartBadge)
    })

    // Debe mostrar los productos
    expect(screen.getByText('Soporte Perrito')).toBeInTheDocument()
    expect(screen.getByText('Organizador')).toBeInTheDocument()

    // Debe mostrar la barra de progreso de envío gratis
    expect(screen.getByText(/para/i)).toBeInTheDocument()
    expect(screen.getAllByText(/Envío Gratis/i).length).toBeGreaterThan(0)

    // Debe mostrar el botón de ir a pagar
    expect(screen.getByRole('button', { name: /Ir a pagar/i })).toBeInTheDocument()
  })
})
