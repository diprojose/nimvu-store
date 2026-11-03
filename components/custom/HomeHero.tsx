"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";

const PRODUCT_IMG = "https://rnhwvaurswbnnxyedzsx.storage.supabase.co/storage/v1/object/public/products/";

type Slide = {
  tab: string;
  /** Dos líneas exactas: el titular nunca pasa de dos renglones. */
  title: [string, string];
  text: string;
  cta: { label: string; href: string };
  /** Una foto, o dos con etiqueta para el selector (planta / en la mesa). */
  shots: { label?: string; src: string; alt: string; position?: string }[];
  /** El punto del isologo: texto corto arriba y valor abajo. */
  dot: [string, string];
  card: string;
};

// El hero vende colecciones; los productos sueltos van en las secciones de
// abajo. Los "Desde" salen del precio más bajo de cada colección: si cambian
// los precios, hay que actualizarlos aquí.
const SLIDES: Slide[] = [
  {
    tab: "Totes",
    title: ["Dilo sin", "decir nada"],
    text: "Frases con sarcasmo y arte botánico, en totes para cargar con todo lo del día.",
    cta: { label: "Ver tote bags", href: "/categorias/tote-bags" },
    shots: [{ src: "/home/hero-totes.jpg", alt: "Seis tote bags Nimvu colgadas en un tablero de madera" }],
    dot: ["Desde", "$55.000"],
    card: "#F3E2D7",
  },
  {
    tab: "Portavasos",
    title: ["Se guarda", "en maceta"],
    text: "Monstera, anturio, otoño y cactus: plantas de mesa cuyas hojas son portavasos. Después del café vuelven a su maceta.",
    cta: { label: "Ver portavasos", href: "/categorias/portavasos" },
    shots: [
      { label: "Planta", src: PRODUCT_IMG + "1771254304282-portaplant.jpg", alt: "Monstera de portavasos armada en su maceta sobre una mesa auxiliar" },
      { label: "En la mesa", src: PRODUCT_IMG + "1771254300393-plantabei.jpg", alt: "Las hojas de la monstera usadas como portavasos bajo una taza de café" },
    ],
    dot: ["Desde", "$40.000"],
    card: "#F9E6D4",
  },
  {
    tab: "Lámparas",
    title: ["Una luz", "más cálida"],
    text: "Aura, Duna, Cala y Luma: cuatro lámparas de mesa para darle luz cálida a tu espacio.",
    cta: { label: "Ver lámparas", href: "/coleccion/lamparas-decorativas" },
    shots: [{ src: "/banner-lamparas-mobile.jpg", alt: "Lámparas Aura, Duna y Cala sobre pedestales de piedra y madera" }],
    dot: ["Desde", "$89.000"],
    card: "#EEEAE4",
  },
  {
    tab: "K-POP",
    title: ["Exhibe tu", "Army Bomb"],
    text: "Soportes, repisas y accesorios de diseño para tu lightstick y tus figuras de BTS.",
    cta: { label: "Ver colección", href: "/coleccion/bts" },
    shots: [{ src: "/bts21-3.jpg", alt: "Soportes Nimvu con forma de personajes BT21", position: "object-bottom" }],
    dot: ["Desde", "$20.000"],
    card: "#EDE5F5",
  },
];

const AUTOPLAY_MS = 7000;

// "Reducir movimiento" se lee como fuente externa: así sigue los cambios del
// sistema y no hace falta un setState dentro de un efecto.
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
const prefersReducedMotion = () => matchMedia(REDUCED_MOTION).matches;
const subscribeReducedMotion = (onChange: () => void) => {
  const mq = matchMedia(REDUCED_MOTION);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
};

const btn =
  "font-medium text-white bg-[#B55934] hover:bg-[#9A4929] active:bg-[#7F3C21] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B55934] py-3 px-6 text-base transition-colors w-fit inline-block";

/**
 * Hero del home: un carrusel de colecciones. Cada slide muestra su foto dentro
 * del arco del isologo, con el punto convertido en el precio de entrada.
 *
 * Todo el contenido vive aquí, no en el backend: el home no hace ninguna
 * petición extra por el hero. Solo la primera foto carga con prioridad; las
 * demás esperan a que la página termine de cargar.
 */
export default function HomeHero() {
  const [cur, setCur] = useState(0);
  const [shot, setShot] = useState<number[]>(() => SLIDES.map(() => 0));
  const [paused, setPaused] = useState(false);
  const [stopped, setStopped] = useState(false);
  const reduce = useSyncExternalStore(subscribeReducedMotion, prefersReducedMotion, () => false);
  const [warm, setWarm] = useState(false);
  const touchX = useRef<number | null>(null);

  useEffect(() => {
    // Las fotos de los otros slides se piden cuando la página ya cargó, para
    // no competir con lo que se ve primero.
    const warmUp = () => setWarm(true);
    if (document.readyState === "complete") {
      const t = setTimeout(warmUp, 1200);
      return () => clearTimeout(t);
    }
    window.addEventListener("load", warmUp, { once: true });
    return () => window.removeEventListener("load", warmUp);
  }, []);

  const running = warm && !reduce && !paused && !stopped;
  useEffect(() => {
    if (!running) return;
    const t = setTimeout(() => {
      if (!document.hidden) setCur((c) => (c + 1) % SLIDES.length);
    }, AUTOPLAY_MS);
    return () => clearTimeout(t);
  }, [cur, running]);

  // Elegir a mano detiene el avance automático: quien eligió quiere mirar.
  const go = (i: number) => {
    setStopped(true);
    setWarm(true);
    setCur((i + SLIDES.length) % SLIDES.length);
  };
  const pickShot = (k: number) => {
    setStopped(true);
    setShot((s) => s.map((v, i) => (i === cur ? k : v)));
  };

  return (
    <div
      className="font-inter relative overflow-hidden w-full rounded-md transition-colors duration-700"
      style={{ backgroundColor: SLIDES[cur].card }}
      role="region"
      aria-roledescription="carrusel"
      aria-label="Colecciones destacadas"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 50) go(cur + (dx < 0 ? 1 : -1));
        touchX.current = null;
      }}
    >
      <div className="grid lg:grid-cols-12 lg:h-[600px]">
        <div className="lg:col-span-6 px-5 pt-6 pb-6 md:pt-8 md:pb-8 md:px-10 lg:pl-16 lg:pr-4 lg:py-14 flex flex-col">
          {/* Todos los slides apilados en la misma celda: la altura no salta al cambiar */}
          <div className="grid flex-1 items-center">
            {SLIDES.map((s, i) => {
              const active = i === cur;
              // Un solo h1 en la página: el del primer slide; los demás son h2.
              const Heading = i === 0 ? "h1" : "h2";
              return (
                <div
                  key={s.tab}
                  className={`[grid-area:1/1] transition-[opacity,transform] duration-500 ${active ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3 pointer-events-none"}`}
                  aria-hidden={!active}
                  inert={!active}
                >
                  {s.shots.length > 1 && (
                    <div className="hidden lg:flex mb-7" role="group" aria-label="Ver la planta como">
                      {s.shots.map((sh, k) => (
                        <button
                          key={sh.label}
                          type="button"
                          aria-pressed={shot[i] === k}
                          onClick={() => pickShot(k)}
                          className={`px-4 py-2.5 text-[15px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 ${
                            shot[i] === k ? "bg-gray-900 text-white" : "bg-gray-900/[.07] text-gray-900 hover:bg-gray-900/[.12]"
                          }`}
                        >
                          {sh.label}
                        </button>
                      ))}
                    </div>
                  )}
                  <Heading className="font-source-serif font-semibold text-[2.5rem] md:text-6xl lg:text-7xl leading-[0.95] tracking-tight text-gray-900 whitespace-nowrap">
                    {s.title[0]}
                    <br />
                    {s.title[1]}
                  </Heading>
                  <p className="text-base md:text-lg mt-4 mb-6 md:mt-6 md:mb-8 max-w-md text-gray-800">{s.text}</p>
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                    <Link href={s.cta.href} className={btn}>{s.cta.label}</Link>
                    <Link href="/productos" className="hidden md:inline text-base text-gray-900 underline underline-offset-4 hover:text-[#B55934]">
                      Explorar la tienda
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Navegación: los nombres de las colecciones, con el progreso del avance automático */}
          <div className="order-first lg:order-none mb-5 lg:mb-0 lg:mt-8" role="tablist" aria-label="Elegir colección">
            <div className="flex gap-4 sm:gap-6">
              {SLIDES.map((s, i) => (
                <button
                  key={s.tab}
                  type="button"
                  role="tab"
                  aria-selected={i === cur}
                  onClick={() => go(i)}
                  className={`relative pb-2 whitespace-nowrap text-sm sm:text-[15px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gray-900 ${
                    i === cur ? "text-gray-900" : "text-gray-900/60 hover:text-gray-900"
                  }`}
                >
                  {s.tab}
                  <span aria-hidden="true" className="absolute left-0 right-0 bottom-0 h-[3px] bg-gray-900/10" />
                  {i === cur && (
                    <span
                      key={`${cur}-${running}`}
                      aria-hidden="true"
                      className={`absolute left-0 right-0 bottom-0 h-[3px] bg-[#B55934] origin-left ${running ? "animate-[hero-progress_linear_both]" : ""}`}
                      style={running ? { animationDuration: `${AUTOPLAY_MS}ms` } : undefined}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* El arco nace del borde inferior de la tarjeta, como el isologo */}
        <div className="lg:col-span-6 relative flex items-end justify-center px-5 md:px-10 lg:px-0">
          <div className="relative w-[66%] max-w-[260px] md:w-full md:max-w-[340px] lg:max-w-none lg:w-[400px] xl:w-[432px] aspect-[4/5] lg:aspect-auto lg:h-[540px]">
            <div className="absolute inset-0 overflow-hidden rounded-t-full">
              {SLIDES.map((s, i) =>
                s.shots.map((sh, k) => {
                  const visible = i === cur && shot[i] === k;
                  const first = i === 0 && k === 0;
                  if (!first && !warm && !visible) return null;
                  return (
                    <Image
                      key={sh.src}
                      src={sh.src}
                      alt={visible ? sh.alt : ""}
                      aria-hidden={!visible}
                      fill
                      priority={first}
                      sizes="(max-width: 768px) 260px, (max-width: 1024px) 340px, 432px"
                      className={`object-cover ${sh.position ?? "object-center"} transition-[opacity,transform] duration-700 ${
                        visible ? "opacity-100 scale-100" : "opacity-0 scale-[1.04]"
                      }`}
                    />
                  );
                })
              )}
            </div>
            {SLIDES[cur].shots.length > 1 && (
              <div className="lg:hidden absolute left-1/2 -translate-x-1/2 bottom-3 z-10 flex" role="group" aria-label="Ver la planta como">
                {SLIDES[cur].shots.map((sh, k) => (
                  <button
                    key={sh.label}
                    type="button"
                    aria-pressed={shot[cur] === k}
                    onClick={() => pickShot(k)}
                    className={`px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 ${
                      shot[cur] === k ? "bg-gray-900 text-white" : "bg-white/90 text-gray-900"
                    }`}
                  >
                    {sh.label}
                  </button>
                ))}
              </div>
            )}
            {SLIDES.map((s, i) => (
              <span
                key={s.tab}
                aria-hidden={i !== cur}
                className={`absolute -right-8 bottom-16 lg:bottom-10 lg:-right-4 xl:-right-8 w-20 h-20 md:w-28 md:h-28 rounded-full bg-[#B55934] text-white flex flex-col items-center justify-center leading-tight transition-[opacity,transform] duration-500 ${
                  i === cur ? "opacity-100 scale-100 delay-300" : "opacity-0 scale-50"
                }`}
              >
                <span className="text-[13px]">{s.dot[0]}</span>
                <span className="text-base md:text-xl font-semibold">{s.dot[1]}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
