import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import StarRating from "@/components/custom/reviews/StarRating";

/**
 * Este componente reemplazó al antiguo `components/custom/starRating.tsx`, que
 * solo sabía pintar estrellas enteras. Las dos primeras pruebas vienen de aquel
 * archivo para no perder la cobertura de los testimonios, que ahora usan este.
 */
describe("StarRating", () => {
  describe("modo lectura", () => {
    it("renderiza 5 estrellas en total", () => {
      const { container } = render(<StarRating value={3} />);
      // Cada estrella son dos SVG superpuestos (base + relleno parcial).
      expect(container.querySelectorAll("svg")).toHaveLength(10);
    });

    it("colorea las activas distinto de las inactivas", () => {
      const { container } = render(<StarRating value={4} />);
      const anchos = Array.from(container.querySelectorAll("span[style]")).map(
        (el) => (el as HTMLElement).style.width,
      );
      expect(anchos).toEqual(["100%", "100%", "100%", "100%", "0%"]);
    });

    it("anuncia el promedio para lectores de pantalla", () => {
      render(<StarRating value={4.3} />);
      expect(
        screen.getByRole("img", { name: "4.3 de 5 estrellas" }),
      ).toBeInTheDocument();
    });

    it("no pinta botones: no es seleccionable", () => {
      const { container } = render(<StarRating value={3} />);
      expect(container.querySelectorAll("button")).toHaveLength(0);
    });

    it("rellena parcialmente, sin redondear el promedio", () => {
      const { container } = render(<StarRating value={4.3} />);
      const anchos = Array.from(container.querySelectorAll("span[style]")).map(
        (el) => (el as HTMLElement).style.width,
      );

      // Un 4.3 debe verse distinto de un 4.0: es lo que comunica el promedio.
      expect(anchos).toEqual(["100%", "100%", "100%", "100%", "30%"]);
    });

    it("no se sale del rango con valores extremos", () => {
      const { container } = render(<StarRating value={0} />);
      const anchos = Array.from(container.querySelectorAll("span[style]")).map(
        (el) => (el as HTMLElement).style.width,
      );
      expect(anchos).toEqual(["0%", "0%", "0%", "0%", "0%"]);
    });
  });

  describe("modo selección", () => {
    it("pinta cinco botones accesibles", () => {
      render(<StarRating value={0} onChange={vi.fn()} />);
      expect(
        screen.getByRole("button", { name: "1 estrella" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "5 estrellas" }),
      ).toBeInTheDocument();
    });

    it("informa la calificación elegida", () => {
      const onChange = vi.fn();
      render(<StarRating value={0} onChange={onChange} />);

      fireEvent.click(screen.getByRole("button", { name: "4 estrellas" }));

      expect(onChange).toHaveBeenCalledWith(4);
    });
  });
});
