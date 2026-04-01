import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock de matchMedia (utilizado a veces por componentes RadixUI como Radix Dialog / Sheet)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mocks estándar para hooks de Next.js App Router
vi.mock('next/navigation', () => {
  return {
    usePathname: () => '/',
    useRouter: () => ({
      push: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
    }),
  }
})
