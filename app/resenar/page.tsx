import type { Metadata } from 'next';
import Link from 'next/link';
import { NO_INDEX } from '@/lib/seo';
import { reviewInvites, type ReviewInvite } from '@/lib/api';
import InviteReviewForm from '@/components/custom/reviews/InviteReviewForm';

// Página personal a la que se llega por un enlace firmado: no debe indexarse.
export const metadata: Metadata = {
  title: 'Deja tu reseña',
  ...NO_INDEX,
};

// Cada token es distinto, así que no tiene sentido cachear nada aquí.
export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ token?: string }>;
}

function Aviso({ titulo, texto }: { titulo: string; texto: string }) {
  return (
    <div className="mx-auto max-w-lg px-5 py-24 text-center">
      <h1 className="font-source-serif text-2xl font-semibold text-gray-900">{titulo}</h1>
      <p className="mt-3 text-sm text-gray-600">{texto}</p>
      <Link
        href="/productos"
        className="mt-6 inline-block text-sm font-medium text-black underline hover:text-gray-600"
      >
        Ver la tienda
      </Link>
    </div>
  );
}

export default async function ResenarPage({ searchParams }: PageProps) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <Aviso
        titulo="Falta el enlace"
        texto="Abre el enlace tal como te llegó en el correo, sin recortarlo."
      />
    );
  }

  let invite: ReviewInvite = { valid: false };
  try {
    invite = await reviewInvites.retrieve(token);
  } catch (err) {
    // Que falle el servicio no debe verse como "tu enlace es inválido": son
    // cosas distintas y el cliente no tiene por qué cargar con la confusión.
    console.error('No se pudo validar el enlace de reseña', err);
    return (
      <Aviso
        titulo="No pudimos cargar tu reseña"
        texto="Hubo un problema de nuestro lado. Intenta de nuevo en unos minutos."
      />
    );
  }

  if (!invite.valid || !invite.product) {
    return (
      <Aviso
        titulo="Este enlace ya no sirve"
        texto="Puede que haya vencido (duran 90 días) o que la compra ya no permita dejar reseña. Si quieres opinar, escríbenos y te ayudamos."
      />
    );
  }

  if (invite.alreadyReviewed) {
    return (
      <Aviso
        titulo="Ya dejaste tu reseña"
        texto={`Gracias por opinar sobre ${invite.product.name}. La revisamos antes de publicarla.`}
      />
    );
  }

  return (
    <div className="mx-auto max-w-lg px-5 py-16">
      <h1 className="font-source-serif text-2xl font-semibold text-gray-900">
        ¿Qué te pareció?
      </h1>
      <p className="mt-2 text-sm text-gray-600">
        Hola {invite.authorName}, cuéntanos cómo te fue con tu compra.
      </p>

      <InviteReviewForm
        token={token}
        productName={invite.product.name}
        productImage={invite.product.images?.[0]}
      />
    </div>
  );
}
