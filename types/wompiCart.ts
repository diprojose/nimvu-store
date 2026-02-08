export interface WompiCart {
  id: string
  total: number
  email: string
  region: {
    currency_code: string
  }
  shipping_address?: {
    first_name?: string | null
    metadata?: string | null
    phone?: string | null
  } | null
}