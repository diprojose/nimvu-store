import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

const clearCart = vi.fn()
const trackPurchase = vi.fn()
const paymentStatus = vi.fn()
let params = new URLSearchParams()

vi.mock('next/navigation', () => ({ useSearchParams: () => params }))
vi.mock('@/store/cart', () => ({ useCartStore: () => ({ clearCart }) }))
vi.mock('@/lib/analytics', () => ({ trackPurchase: (...a: unknown[]) => trackPurchase(...a) }))
vi.mock('@/lib/api', () => ({ orders: { paymentStatus: (...a: unknown[]) => paymentStatus(...a) } }))

import OrderConfirmedPage from '@/app/order/page'

const ORDER_ID = '06c72040-899e-4d3c-96c6-04dac165e2c7'

describe('página de regreso de Wompi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    sessionStorage.clear()
    params = new URLSearchParams({ id: '1369030-tx', env: 'prod', internalOrderId: ORDER_ID })
  })

  it('con el pago rechazado no confirma, no vacía el carrito ni cuenta la venta', async () => {
    paymentStatus.mockResolvedValue({ status: 'declined', total: 72000 })
    render(<OrderConfirmedPage />)

    expect(await screen.findByText('Tu pago no se completó')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Intentar de nuevo' })).toHaveAttribute('href', '/checkout')
    expect(screen.queryByText('¡Pedido Confirmado!')).not.toBeInTheDocument()
    expect(clearCart).not.toHaveBeenCalled()
    expect(trackPurchase).not.toHaveBeenCalled()
  })

  it('con el pago aprobado confirma, vacía el carrito y cuenta la venta una vez', async () => {
    paymentStatus.mockResolvedValue({ status: 'approved', total: 72000 })
    render(<OrderConfirmedPage />)

    expect(await screen.findByText('¡Pedido Confirmado!')).toBeInTheDocument()
    await waitFor(() => expect(clearCart).toHaveBeenCalled())
    expect(trackPurchase).toHaveBeenCalledTimes(1)
    expect(trackPurchase.mock.calls[0][0]).toMatchObject({ orderId: ORDER_ID, value: 72000 })
  })

  it('mientras el webhook no llega, muestra que está confirmando', async () => {
    paymentStatus.mockResolvedValue({ status: 'pending', total: 72000 })
    render(<OrderConfirmedPage />)

    expect(screen.getByText('Confirmando tu pago...')).toBeInTheDocument()
    await waitFor(() => expect(paymentStatus).toHaveBeenCalledWith(ORDER_ID))
    expect(clearCart).not.toHaveBeenCalled()
  })

  it('el pago contra entrega se confirma sin consultar la pasarela', async () => {
    params = new URLSearchParams({ id: ORDER_ID, status: 'success', method: 'cod' })
    render(<OrderConfirmedPage />)

    expect(screen.getByText('¡Pedido Confirmado!')).toBeInTheDocument()
    expect(paymentStatus).not.toHaveBeenCalled()
  })
})
