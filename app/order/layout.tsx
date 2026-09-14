import type { Metadata } from 'next';
import { NO_INDEX } from '@/lib/seo';

// Ruta transaccional/privada: no debe aparecer en resultados de búsqueda.
export const metadata: Metadata = {
  title: 'Tu pedido',
  ...NO_INDEX,
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
