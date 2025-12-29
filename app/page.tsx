import Image from "next/image";

const category = [
  { nombre: 'Baño', img: '/bano.jpg', slug: 'Baño' },
  { nombre: 'Cocina', img: '/cocina.jpg', slug: 'Cocina' },
  { nombre: 'Cuarto', img: '/cuarto.jpg', slug: 'Cuarto' },
  { nombre: 'Oficina', img: '/oficina.jpg', slug: 'Oficina' },
  { nombre: 'Sala', img: '/sala.jpg', slug: 'Sala' },
];

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center font-sans dark:bg-black">
      <main className="flex min-h-screen w-full flex-col items-center py-16 px-16 bg-white dark:bg-black sm:items-start">
        <section className="banner-section w-full pb-[100px]">
          <div className="call-to-action bg-[url(/banner.jpg)] max-h-500 w-full bg-cover h-[600px] p-10 flex items-baseline grid-cols-1 flex-col justify-center">
            <h1 className="font-italiana text-5xl py-4">Diseño funcional que emociona</h1>
            <button className="bg-black text-white py-2 px-4">Ver más</button>
          </div>
        </section>
        <section className="collections-section w-full pb-[100px]">
          <h2 className="text-center text-4xl font-italiana">Top Collections</h2>
          <p className="text-center pb-[50px]">Express your style with our standout collection—fashion meets sophistication.</p>
          <div className="collections-container py-8 flex w-full gap-5">
            {category.map((cat) => (
              <div key={cat.slug} className="relative collection-item rounded-full pr-6 last:pr-0 flex-1 cursor-pointer">
                <div className="image-container w-full sm:h-[100px] md:h-[300px] bg-cover bg-center" style={{ backgroundImage: `url(${cat.img})` }}></div>
                <h3 className="text-center pt-2">{cat.nombre}</h3>
              </div>
            ))}
          </div>
        </section>
        <section className="top-products-section w-full pb-[100px]">
          <h2 className="text-center text-4xl font-italiana">Today&apos;s Popular Picks</h2>
          <p className="text-center pb-[50px]">Unmatched design—superior performance and customer satisfaction in one.</p>
          <div className="carousel-container">

          </div>
        </section>
      </main>
    </div>
  );
}
