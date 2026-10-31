import Image from "next/image";
import Link from "next/link";

/**
 * Cierre del home: una frase grande sobre una foto del producto en uso (dos
 * piezas del anturio usadas como portavasos). La frase es la de la ficha; la
 * pared clara de la foto deja espacio para ella sin necesidad de velo.
 */
export default function HomeStatement() {
  return (
    <section className="home-statement w-full">
      <div className="relative overflow-hidden rounded-md bg-[#EFDFC6] flex flex-col lg:block lg:aspect-[16/9]">
        <div className="relative order-2 aspect-[4/5] sm:aspect-[16/10] lg:aspect-auto lg:absolute lg:inset-0">
          <Image
            src="/home/cierre.jpg"
            alt="Anturio de portavasos Nimvu en su maceta, con una flor bajo un vaso de agua y una hoja bajo una taza de café"
            fill
            sizes="(max-width: 1024px) 100vw, 1300px"
            className="object-cover object-right lg:object-left"
          />
        </div>
        <div className="relative z-10 order-1 px-5 pt-12 pb-10 md:px-10 lg:h-full lg:px-16 lg:py-16 flex flex-col items-start lg:justify-center">
          <h2 className="font-source-serif font-semibold text-[2rem] md:text-5xl xl:text-[3.25rem] leading-[1] tracking-tight text-gray-900 lg:whitespace-nowrap">
            ¿Decoración o
            <br />
            portavasos? Ambos.
          </h2>
          <Link
            href="/categorias/portavasos"
            className="mt-8 text-base md:text-lg text-gray-900 underline underline-offset-4 hover:text-[#B55934]"
          >
            Conoce las plantas que se usan
          </Link>
        </div>
      </div>
    </section>
  );
}
