import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
  return (
    <div className="bg-white text-black font-sans">
      {/* HEADER SECTION */}
      <header className="py-24 px-6 md:px-16 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
        <div className="max-w-xl">
          <p className="text-xs tracking-[0.2em] text-black uppercase mb-4 font-bold">Est. 2025 — Elevando lo Cotidiano</p>
          <h1 className="text-7xl md:text-9xl font-italiana leading-[0.8]">
            LA ESENCIA<br />
            <span className="italic font-light opacity-60 ml-12">DEL ESPACIO</span>
          </h1>
        </div>
        <div className="max-w-xs mt-8 md:mt-24 text-sm leading-relaxed text-gray-600">
          <p>
            En Nimvu creemos que tu hogar es una extensión de quien eres. No creamos simples objetos; diseñamos piezas con carácter, texturas y formas pensadas para romper la monotonía y despertar conversaciones.
          </p>
        </div>
      </header>

      {/* TIMELINE SECTION */}
      <section className="relative max-w-7xl mx-auto px-6 md:px-16 py-12">
        {/* Vertical Line */}
        <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-gray-200 -z-10 hidden md:block"></div>

        {/* SECTION 1: The First Extrusion */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-32">
          <div className="text-left md:text-right md:pr-16 order-2 md:order-1 pt-12 md:pt-0">
            <span className="text-xs font-bold text-black uppercase tracking-widest mb-2 block">01. Nuestra visión</span>
            <h2 className="text-4xl font-italiana mb-6">Más que Decoración</h2>
            <p className="text-gray-600 text-sm leading-relaxed max-w-sm ml-auto">
              Todo comienza con una pregunta: ¿Cómo podemos hacer que un objeto cotidiano se sienta extraordinario? Nimvu nace de la búsqueda de la geometría perfecta. Nos alejamos de lo convencional para explorar siluetas orgánicas y modernas que juegan con la luz de tu habitación, creando sombras y matices que cambian a lo largo del día.
            </p>
          </div>
          <div className="relative h-[500px] bg-gray-100 order-1 md:order-2">
            <Image
              src="/about/anturia-morada.jpeg"
              alt="Anturia Morada"
              fill
              className="object-cover grayscale hover:grayscale-0 transition-all duration-700"
            />
          </div>
        </div>

        {/* SECTION 2: Polymers & Passion */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-32">
          <div className="relative h-[500px] bg-gray-100">
            <Image
              src="/about/monstera-verde.jfif"
              alt="Polymers and Materials"
              fill
              className="object-cover grayscale hover:grayscale-0 transition-all duration-700"
            />
          </div>
          <div className="text-left md:pl-16 pt-12 md:pt-0">
            <span className="text-xs font-bold text-black uppercase tracking-widest mb-2 block">02. DISEÑO CONSCIENTE</span>
            <h2 className="text-4xl font-italiana mb-6">La Belleza de la Textura</h2>
            <p className="text-gray-600 text-sm leading-relaxed max-w-sm">
              En un mundo de superficies lisas y frías, nosotros apostamos por el tacto. Nuestras piezas tienen una identidad visual única, marcada por líneas finas y acabados mate que invitan a ser tocados. Cada objeto es producido bajo demanda, una filosofía de "Slow Design" que valora la exclusividad y respeta el medio ambiente.
            </p>
          </div>
        </div>

        {/* SECTION 3: Architectural Scale (Full Width) */}
        <div className="text-center mb-16 relative">
          <span className="text-xs font-bold text-black uppercase tracking-widest mb-4 block">03. ESTILO DE VIDA</span>
          <h2 className="text-5xl md:text-6xl font-italiana mb-12 italic">Curaduría para el Hogar Moderno</h2>
          <div className="relative w-full h-[600px] bg-gray-100 mb-12">
            <Image
              src="/about/living.jpg"
              alt="Architectural Model"
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* VALUES GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-gray-200 pt-16 pb-32">
          <div className="p-4">
            <span className="text-3xl font-italiana text-gray-300 block mb-4">01.</span>
            <h3 className="font-bold uppercase tracking-widest text-sm mb-4">Originalidad</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Nos rebelamos contra lo genérico. Cada diseño es una propuesta propia que no encontrarás en las grandes cadenas.
            </p>
          </div>
          <div className="p-4">
            <span className="text-3xl font-italiana text-gray-300 block mb-4">02.</span>
            <h3 className="font-bold uppercase tracking-widest text-sm mb-4">Producción Ética</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Creamos solo lo que se necesita. Sin stocks masivos, sin desperdicio innecesario. Un lujo responsable.
            </p>
          </div>
          <div className="p-4">
            <span className="text-3xl font-italiana text-gray-300 block mb-4">03.</span>
            <h3 className="font-bold uppercase tracking-widest text-sm mb-4">Versatilidad</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Piezas camaleónicas diseñadas para brillar tanto en una oficina ejecutiva como en la mesa de centro de tu sala.
            </p>
          </div>
        </div>
      </section>

      {/* TEAM SECTION */}
      <section className="py-24 bg-zinc-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6 md:px-16">
          <h2 className="text-5xl font-italiana mb-24">El Estudio Creativo</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Member 1 */}
            <div className="group">
              <div className="relative aspect-[3/4] bg-gray-200 mb-6 overflow-hidden">
                <Image src="/team/member-01.jpg" alt="Team Member" fill className="object-cover grayscale hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs text-center p-4">Foto Miembro 1</div>
              </div>
              <h3 className="font-italiana text-xl mb-1">José Parejo Tovar</h3>
              <p className="text-[10px] tracking-widest uppercase text-black">CEO & Fundador</p>
            </div>
            {/* Member 2 */}
            <div className="group">
              <div className="relative aspect-[3/4] bg-gray-200 mb-6 overflow-hidden">
                <Image src="/team/member-02.jpg" alt="Team Member" fill className="object-cover grayscale hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs text-center p-4">Foto Miembro 2</div>
              </div>
              <h3 className="font-italiana text-xl mb-1">Oriana Hernández</h3>
              <p className="text-[10px] tracking-widest uppercase text-black">CEO & Fundador</p>
            </div>
            {/* Member 3 */}
            <div className="group">
              <div className="relative aspect-[3/4] bg-gray-200 mb-6 overflow-hidden">
                <Image src="/team/member-03.jpg" alt="Team Member" fill className="object-cover grayscale hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs text-center p-4">Foto Miembro 3</div>
              </div>
              <h3 className="font-italiana text-xl mb-1">José Parejo Hernández</h3>
              <p className="text-[10px] tracking-widest uppercase text-black">Director de Calidad</p>
            </div>
            {/* Member 4 */}
            <div className="group">
              <div className="relative aspect-[3/4] bg-gray-200 mb-6 overflow-hidden">
                <Image src="/team/member-04.jpg" alt="Team Member" fill className="object-cover grayscale hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs text-center p-4">Foto Miembro 4</div>
              </div>
              <h3 className="font-italiana text-xl mb-1">Emma Parejo</h3>
              <p className="text-[10px] tracking-widest uppercase text-black">Jefe de Ventas</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-32 bg-white text-center">
        <h2 className="text-4xl md:text-5xl font-italiana mb-6">Redefine tu entorno</h2>
        <p className="text-gray-500 text-sm mb-12 max-w-md mx-auto">
          Encuentra esa pieza que le falta a tu espacio para sentirse completo.
        </p>
        <Link href="/products">
          <Button className="bg-black text-white px-8 py-6 uppercase tracking-widest text-xs font-bold hover:bg-zinc-800">
            Explorar Colección
          </Button>
        </Link>
      </section>
    </div>
  );
}
