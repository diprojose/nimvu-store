"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import dynamic from "next/dynamic";
import { useCartStore, cartItemId } from '@/store/cart';
import { CUSTOM_TEXT_MAX_LENGTH, customTextError, normalizeCustomText } from "@/lib/tote-art";
import { useAddedToCart } from "@/hooks/useAddedToCart";
import { FrontendProduct } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import { trackAddToCart } from "@/lib/analytics";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { useEffect, useCallback, useRef } from "react";

// Solo lo descargan los productos personalizables: trae su propia tipografía
// y no tiene por qué pesar en la ficha de una maceta.
const TotePreview = dynamic(() => import("@/components/custom/tote/TotePreview"), {
  ssr: false,
  loading: () => <div className="w-full aspect-square bg-gray-100 rounded-lg animate-pulse" />,
});

export interface ProductDetailsProps {
  product: FrontendProduct;
}

type VariantType = FrontendProduct["variants"][number];

export default function ProductDetails({ product }: ProductDetailsProps) {
  const [selectedVariant, setSelectedVariant] = useState<VariantType | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slideCount, setSlideCount] = useState(0);

  // Personalizable: la frase que el cliente escribe y si cabe en el recuadro.
  const isCustomizable = !!product.isCustomizable;
  const [customText, setCustomText] = useState("");
  // Renglones tal como los ve el cliente en el bolso; `null` = no cabe.
  const [toteLines, setToteLines] = useState<string[] | null>([]);
  const textFits = toteLines !== null;
  const [triedToAdd, setTriedToAdd] = useState(false);
  const customTextRef = useRef<HTMLTextAreaElement | null>(null);
  const normalizedText = normalizeCustomText(customText);
  const customError = !isCustomizable
    ? null
    : customTextError(customText) ??
      (textFits ? null : "Esa frase no cabe en el bolso. Prueba con palabras más cortas.");
  // El campo vacío no se marca en rojo hasta que intenten comprar.
  const showCustomError = !!customError && (normalizedText.length > 0 || triedToAdd);

  const addToCart = useCartStore((state) => state.addItem);
  const notifyAdded = useAddedToCart();

  // Stock disponible según la variante seleccionada (o el producto base)
  const currentStock = selectedVariant
    ? selectedVariant.inventory_quantity
    : product.stock;
  const isOutOfStock = currentStock <= 0;

  const category = product.category;
  // Las categorías de universos distintos a "hogar" viven en
  // /{universo}/categorias/{slug}; hogar (y sin universo) en /categorias/{slug}.
  const universeSlug = product.universe?.slug;
  const isHogar = !universeSlug || universeSlug === "hogar";
  const categoryHref = category
    ? isHogar
      ? `/categorias/${category.slug}`
      : `/${universeSlug}/categorias/${category.slug}`
    : null;

  // Segmento intermedio del breadcrumb: en hogar es la Tienda global; en otros
  // universos es el propio universo (para poder volver a él, no a hogar).
  const shopHref = isHogar ? "/productos" : `/${universeSlug}`;
  const shopLabel = isHogar ? "Tienda" : product.universe?.name ?? "Tienda";

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => {
      const next = prev + delta;
      const max = currentStock > 0 ? currentStock : 1;
      return Math.min(max, Math.max(1, next));
    });
  };

  // Resetear cantidad a 1 al cambiar de variante para no quedar arriba del stock
  useEffect(() => {
    setQuantity(1);
  }, [selectedVariant]);

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    const variantId = selectedVariant?.id || product.id;

    if (isCustomizable) {
      if (customError) {
        setTriedToAdd(true);
        customTextRef.current?.focus();
        return;
      }
      // Se guarda la frase con los saltos de renglón que el cliente vio, para
      // que el arte de impresión salga partido exactamente igual.
      const finalText = toteLines?.length ? toteLines.join("\n") : normalizedText;
      addToCart(product, variantId, quantity, finalText);
      trackAddToCart(product, quantity);
      notifyAdded(cartItemId(variantId, finalText));
      return;
    }

    addToCart(product, variantId, quantity);
    trackAddToCart(product, quantity);
    notifyAdded(variantId);
  };

  // Sync carousel dot indicators
  const onSelect = useCallback((api: CarouselApi) => {
    if (!api) return;
    setCurrentSlide(api.selectedScrollSnap());
    setSlideCount(api.scrollSnapList().length);
  }, []);

  useEffect(() => {
    if (!carouselApi) return;
    onSelect(carouselApi);
    carouselApi.on("select", () => onSelect(carouselApi));
    return () => { carouselApi.off("select", () => onSelect(carouselApi)); };
  }, [carouselApi, onSelect]);

  // Determine images to show
  const baseImages = (selectedVariant?.images && selectedVariant.images.length > 0)
    ? selectedVariant.images.map((url: string, index: number) => ({ id: `var-img-${index}`, url }))
    : product.images;
  // En un personalizable la primera foto es la portada del catálogo (el bolso
  // sin frase), y aquí ya la reemplaza la vista previa en vivo: mostrarla
  // debajo sería el mismo bolso dos veces. Las demás fotos sí se muestran.
  const currentImages = isCustomizable ? (baseImages ?? []).slice(1) : baseImages;
  // La vista previa cuenta como imagen: un personalizable nunca queda "sin fotos".
  const hasGallery = isCustomizable || (currentImages && currentImages.length > 0);

  // Helper to clean up HTML content styles
  const formatHtmlContent = (htmlContent: string) => {
    if (!htmlContent) return "";
    let clean = htmlContent.replace(/style="[^"]*"/gi, "");
    clean = clean.replace(/width="[^"]*"/gi, "").replace(/height="[^"]*"/gi, "");
    clean = clean.replace(/&nbsp;/g, " ");
    // Algunas descripciones listan con "- " en párrafos sueltos: se vuelven una
    // lista de verdad, y se quitan los párrafos vacíos que dejaban huecos.
    clean = clean.replace(/<p>\s*<\/p>/g, "");
    // Se marcan para envolver solo estos ítems: las listas que ya vienen como
    // <ul> del editor quedan intactas.
    clean = clean.replace(/<p>\s*[-–•]\s+([\s\S]*?)<\/p>/g, "<li data-dash>$1</li>");
    clean = clean.replace(/(?:<li data-dash>[\s\S]*?<\/li>)+/g, (items) =>
      `<ul>${items.replace(/<li data-dash>/g, "<li>")}</ul>`
    );
    return clean;
  };

  return (
    <div className="bg-white dark:bg-black pt-20 pb-16 px-4 sm:px-8 md:px-16">
      {/* Breadcrumb de navegación */}
      <div className="max-w-7xl mx-auto mb-4 md:mb-8">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Inicio</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={shopHref}>{shopLabel}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {category && categoryHref && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href={categoryHref}>{category.name}</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </>
            )}
            {/* En celular el nombre ya está en el título justo debajo: se omite
                para que la ruta quepa en una línea y la foto suba. */}
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem className="hidden md:inline-flex">
              <BreadcrumbPage className="line-clamp-1">{product.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 lg:gap-12">
        {/* Left Side: Images */}
        <div className="lg:col-span-7">
          {/* ── Mobile: Carrusel ──────────────────────────────────────── */}
          <div className="block lg:hidden">
            {hasGallery ? (
              <>
                <Carousel
                  setApi={setCarouselApi}
                  opts={{ align: "start", loop: false }}
                  className="w-full"
                >
                  <CarouselContent>
                    {isCustomizable && (
                      <CarouselItem key="tote-preview">
                        <TotePreview
                          text={customText}
                          onLinesChange={setToteLines}
                          priority
                          sizes="(max-width: 1024px) 100vw, 50vw"
                        />
                      </CarouselItem>
                    )}
                    {currentImages.map((img: { id: string; url: string }) => (
                      <CarouselItem key={img.id}>
                        <div className="relative w-full aspect-square bg-gray-100 rounded-lg overflow-hidden">
                          <Image
                            src={img.url}
                            alt={product.title}
                            fill
                            sizes="(max-width: 1024px) 100vw, 50vw"
                            className="object-cover"
                          />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                </Carousel>

                {/* Dot indicators */}
                {slideCount > 1 && (
                  <div className="flex justify-center gap-2 mt-3">
                    {Array.from({ length: slideCount }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => carouselApi?.scrollTo(i)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          i === currentSlide
                            ? "bg-black scale-125"
                            : "bg-gray-300"
                        }`}
                        aria-label={`Ir a imagen ${i + 1}`}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="w-full aspect-square bg-gray-100 flex items-center justify-center text-gray-400 rounded-lg">
                No Images
              </div>
            )}
          </div>

          {/* ── Desktop: Stack vertical ────────────────────────────────── */}
          <div className="hidden lg:flex flex-col gap-8">
            {isCustomizable && (
              <TotePreview text={customText} onLinesChange={setToteLines} priority sizes="58vw" />
            )}
            {currentImages?.map((img: { id: string; url: string }) => (
              <div key={img.id} className="relative w-full aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <Image
                  src={img.url}
                  alt={product.title}
                  fill
                  sizes="58vw"
                  className="object-cover"
                />
              </div>
            ))}
            {!hasGallery && (
              <div className="w-full aspect-square bg-gray-100 flex items-center justify-center text-gray-400">
                No Images
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Info (Sticky) */}
        {/* Orden pensado para el celular: lo que se necesita para comprar
            (nombre, precio, variante, botón) va antes que la descripción. */}
        <div className="lg:col-span-5 lg:sticky lg:top-28 h-fit flex flex-col gap-5 md:gap-8 reveal-stagger">
          <div>
            <div className="flex items-center gap-3 mb-2 md:mb-4 flex-wrap">
              <h1 className="text-[1.75rem] leading-tight md:text-4xl font-source-serif font-semibold dark:text-white">{product.title}</h1>
              {isOutOfStock && (
                <span className="text-sm font-semibold px-3 py-1 bg-red-100 text-red-700 rounded">
                  Agotado
                </span>
              )}
            </div>
            <div>
              {(() => {
                const basePrice = selectedVariant?.price || product.price;
                const discount = selectedVariant ? selectedVariant.discountPrice : product.discountPrice;
                const hasDiscount = discount && discount > 0 && discount < basePrice && (!product.discountEndDate || new Date(product.discountEndDate) >= new Date());

                return hasDiscount ? (
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-bold text-red-600 font-sans">{formatPrice(discount)}</span>
                    <span className="text-xl text-gray-400 line-through font-sans">{formatPrice(basePrice)}</span>
                  </div>
                ) : (
                  <p className="text-2xl font-bold font-sans dark:text-white">
                    {formatPrice(basePrice)}
                  </p>
                );
              })()}
            </div>
          </div>

          {/* Variants Selector */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Variante:{" "}
                <span className="font-medium text-gray-900 dark:text-white">
                  {selectedVariant ? selectedVariant.title : "Original"}
                </span>
              </p>
              {/* En celular, una sola fila con scroll horizontal en vez de dos
                  filas de miniaturas que empujan el botón hacia abajo. */}
              <div className="flex gap-3 overflow-x-auto snap-x scroll-px-4 -mx-4 px-4 pb-1 sm:mx-0 sm:px-0 sm:flex-wrap sm:overflow-visible">
                {/* Main Product Option */}
                <button
                  onClick={() => setSelectedVariant(null)}
                  className={`relative shrink-0 snap-start w-14 h-14 sm:w-16 sm:h-16 rounded-md overflow-hidden border-2 transition-all ${!selectedVariant ? 'border-black' : 'border-gray-200 hover:border-gray-400'
                    }`}
                  title="Original"
                  aria-label="Variante Original"
                  aria-pressed={!selectedVariant}
                >
                  {product.images && product.images.length > 0 ? (
                    <Image
                      src={product.images[0].url}
                      alt={product.title}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center text-xs text-gray-500">
                      Base
                    </div>
                  )}
                </button>
                {product.variants.map((variant: VariantType) => (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedVariant(variant)}
                    className={`relative shrink-0 snap-start w-14 h-14 sm:w-16 sm:h-16 rounded-md overflow-hidden border-2 transition-all ${selectedVariant?.id === variant.id ? 'border-black' : 'border-gray-200 hover:border-gray-400'
                      }`}
                    title={variant.title}
                    aria-label={`Variante ${variant.title}`}
                    aria-pressed={selectedVariant?.id === variant.id}
                  >
                    {variant.images && variant.images.length > 0 ? (
                      <Image
                        src={variant.images[0]}
                        alt={variant.title}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center text-xs text-gray-500">
                        {variant.title.slice(0, 2)}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Personalizador: la frase se dibuja en vivo sobre la primera foto */}
          {isCustomizable && (
            <div className="space-y-2">
              <div className="flex items-baseline justify-between gap-3">
                <label htmlFor="custom-text" className="text-sm font-medium text-gray-900 dark:text-white">
                  Tu frase
                </label>
                <span
                  className={`text-xs tabular-nums ${
                    normalizedText.length > CUSTOM_TEXT_MAX_LENGTH ? "text-red-600 font-medium" : "text-gray-500"
                  }`}
                >
                  {normalizedText.length}/{CUSTOM_TEXT_MAX_LENGTH}
                </span>
              </div>
              <textarea
                id="custom-text"
                ref={customTextRef}
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                // En celular la vista previa es la primera foto del carrusel:
                // se vuelve a ella para que el cliente vea lo que escribe.
                onFocus={() => carouselApi?.scrollTo(0)}
                rows={2}
                maxLength={CUSTOM_TEXT_MAX_LENGTH + 20}
                placeholder="nadie me cae bien"
                aria-invalid={showCustomError}
                aria-describedby="custom-text-help"
                className={`w-full resize-none rounded-md border bg-white px-3 py-2.5 text-base text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black/70 ${
                  showCustomError ? "border-red-500" : "border-gray-300"
                }`}
              />
              <p
                id="custom-text-help"
                className={`text-sm ${showCustomError ? "text-red-600 font-medium" : "text-gray-600 dark:text-gray-400"}`}
              >
                {showCustomError
                  ? customError
                  : "Mírala en el bolso mientras escribes. El punto final lo ponemos nosotros."}
              </p>
            </div>
          )}

          {/* Quantity and Add to Cart: siempre en una fila, también en celular */}
          <div className="flex flex-col gap-2">
            <div className="flex flex-row gap-3 sm:gap-4">
              <div className={`flex items-center border border-gray-300 rounded-md w-fit bg-white text-black ${isOutOfStock ? 'opacity-50' : ''}`}>
                <button
                  onClick={() => handleQuantityChange(-1)}
                  disabled={isOutOfStock}
                  className="p-3 hover:bg-gray-50 transition-colors disabled:cursor-not-allowed"
                  aria-label="Disminuir cantidad"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <button
                  onClick={() => handleQuantityChange(1)}
                  disabled={isOutOfStock || quantity >= currentStock}
                  className="p-3 hover:bg-gray-50 transition-colors disabled:cursor-not-allowed"
                  aria-label="Aumentar cantidad"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <Button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="flex-1 h-12 text-base shadow-none bg-black hover:bg-gray-800 text-white dark:bg-white dark:text-black dark:hover:bg-gray-200 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed disabled:shadow-none dark:disabled:bg-gray-700 dark:disabled:text-gray-400"
              >
                <ShoppingCart className="mr-2 w-5 h-5" />
                {isOutOfStock ? 'Agotado' : 'Agregar al Carrito'}
              </Button>
            </div>
            {isCustomizable && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Lo estampamos solo para ti, así que no tiene cambio ni devolución.{" "}
                <Link href="/politicas-de-devoluciones" className="underline underline-offset-2">
                  Ver política
                </Link>
              </p>
            )}
            {!isOutOfStock && currentStock <= 5 && (
              <p className="text-sm text-orange-700 font-medium">
                Solo quedan {currentStock} {currentStock === 1 ? 'unidad' : 'unidades'} disponibles
              </p>
            )}
          </div>

          {product.description && (
            <p className="text-base md:text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
              {product.description}
            </p>
          )}

          {/* Medidas en una línea: no hace falta una tabla con caja para tres datos */}
          {product.dimensions && (product.dimensions.width > 0 || product.dimensions.height > 0 || product.dimensions.length > 0) && (
            <p className="text-base text-gray-800 dark:text-gray-200">
              <span className="font-medium text-gray-900 dark:text-white">Medidas: </span>
              {[
                // Espacio duro entre número y unidad: "9 cm" nunca se parte en dos líneas
                product.dimensions.height > 0 && `Alto ${product.dimensions.height} cm`,
                product.dimensions.width > 0 && `Ancho ${product.dimensions.width} cm`,
                product.dimensions.length > 0 && `Largo ${product.dimensions.length} cm`,
              ].filter(Boolean).join(" · ")}
            </p>
          )}

          {/* Long Description (HTML) */}
          {product.longDescription && (
            <div className="mt-6 w-full reveal-on-scroll">
              <h2 className="text-2xl mb-4 font-source-serif font-semibold dark:text-white">Detalles del producto</h2>
              <div
                className="prose prose-sm sm:prose-base dark:prose-invert max-w-none
                  prose-p:mb-4 prose-p:leading-relaxed prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-li:text-gray-700
                  prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-white
                  prose-ul:list-disc prose-ul:pl-5 prose-li:mb-1
                  prose-ol:list-decimal prose-ol:pl-5
                  [&_p]:mb-4 [&_p]:leading-relaxed
                  [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-1
                  [&_ol]:list-decimal [&_ol]:pl-5"
                dangerouslySetInnerHTML={{ __html: formatHtmlContent(product.longDescription) }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
