import type { Metadata } from 'next';
import { NO_INDEX } from '@/lib/seo';

// Ruta transaccional/privada: no debe aparecer en resultados de búsqueda.
export const metadata: Metadata = {
  title: 'Mi perfil',
  ...NO_INDEX,
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
