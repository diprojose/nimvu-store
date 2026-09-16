import React, { FC, ReactElement } from "react";
import Image from "next/image";

/**
 * Barra minima del checkout: solo la marca.
 *
 * Sustituye al header completo, que se oculta en /checkout para que ningun
 * enlace del menu saque al cliente del embudo. Mantener el logo conserva la
 * senal de confianza justo donde el cliente va a poner su tarjeta.
 *
 * El logo NO es un enlace a proposito: convertirlo en uno reabriria la misma
 * salida que acabamos de cerrar. Para volver esta el enlace "Volver" al
 * carrito que la pagina ya tiene.
 */
export const CheckoutHeader: FC = (): ReactElement => {
  return (
    <header className="w-full border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-center px-4">
        <Image
          className="dark:invert"
          src="/isologo-nimvu.png"
          alt="Nimvu"
          width={44}
          height={44}
          priority
        />
      </div>
    </header>
  );
};

export default CheckoutHeader;
