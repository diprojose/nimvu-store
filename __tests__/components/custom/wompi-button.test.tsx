import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import WompiButton from '@/components/custom/wompi-button'
import { WompiCart } from '@/types/wompiCart'
import { Address } from '@/types/address'

const mockCart = {
  id: "cart-123",
  total: 50000,
  email: "test@nimvu.com"
} as unknown as WompiCart
const mockAddress = {
  id: "addr-1",
  first_name: "John",
  last_name: "Doe",
  address_1: "Calle 1",
  city: "Bogota",
  province: "Bogota",
  postal_code: "11001",
  country_code: "CO"
} as unknown as Address
const mockCustomer = {
  fullName: "John Doe",
  email: "test@nimvu.com",
  phone: "3123456789"
}

describe('WompiButton component', () => {
  it('renderiza el botón en estado deshabilitado inicialmente', () => {
    render(<WompiButton cart={mockCart} address={mockAddress} customer={mockCustomer} />)
    const btn = screen.getByRole('button')
    expect(btn).toBeDisabled()
    expect(btn).toHaveTextContent('Pagar con Wompi')
  })
})
