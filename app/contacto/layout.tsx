import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contacto',
  description:
    'Escríbenos por WhatsApp, correo o redes sociales. Estamos para ayudarte con tu pedido Nimvu.',
  alternates: { canonical: '/contacto' },
};

export default function ContactoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
