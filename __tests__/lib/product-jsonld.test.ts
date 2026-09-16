import { describe, it, expect } from "vitest";
import { buildProductJsonLd } from "@/lib/product-jsonld";
import type { FrontendProduct } from "@/lib/api";

const base: FrontendProduct = {
  id: "prod-1",
  title: "Portavasos Monstera",
  description: "Portavasos impreso en 3D",
  slug: "portavasos-monstera",
  thumbnail: "https://example.com/a.jpg",
  price: 60000,
  stock: 5,
  images: [{ id: "i1", url: "https://example.com/a.jpg" }],
  variants: [],
  ratingAverage: 0,
  ratingCount: 0,
};

describe("buildProductJsonLd - aggregateRating", () => {
  it("NO declara aggregateRating sin reseñas", () => {
    const ld = buildProductJsonLd(base) as Record<string, unknown>;

    // Declararlo en cero es motivo de penalización en Google, no un adorno.
    expect(ld.aggregateRating).toBeUndefined();
  });

  it("lo declara cuando hay reseñas aprobadas", () => {
    const ld = buildProductJsonLd({
      ...base,
      ratingAverage: 4.33,
      ratingCount: 3,
    }) as Record<string, any>;

    expect(ld.aggregateRating).toEqual({
      "@type": "AggregateRating",
      ratingValue: "4.3",
      reviewCount: 3,
      bestRating: 5,
      worstRating: 1,
    });
  });

  it("con una sola reseña también lo declara", () => {
    const ld = buildProductJsonLd({
      ...base,
      ratingAverage: 5,
      ratingCount: 1,
    }) as Record<string, any>;

    expect(ld.aggregateRating.reviewCount).toBe(1);
    expect(ld.aggregateRating.ratingValue).toBe("5.0");
  });

  it("no rompe el resto del schema", () => {
    const ld = buildProductJsonLd({
      ...base,
      ratingAverage: 4,
      ratingCount: 2,
    }) as Record<string, any>;

    expect(ld["@type"]).toBe("Product");
    expect(ld.offers.priceCurrency).toBe("COP");
    expect(ld.offers.availability).toBe("https://schema.org/InStock");
  });
});
