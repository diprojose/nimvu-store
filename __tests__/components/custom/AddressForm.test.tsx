import { describe, it, expect, vi } from "vitest";
import { render, fireEvent, screen } from "@testing-library/react";
import AddressForm, { AddressFormData } from "@/components/custom/AddressForm";

/**
 * NOTA: este archivo tenia una prueba llamada "llama a onSubmit mock al hacer
 * submit nativo" que enviaba el formulario VACIO y esperaba que onSubmit se
 * llamara. Daba por buena justamente la falla que dejo pasar un pedido sin
 * ciudad, asi que se reemplazo por las pruebas de validacion de abajo.
 */

/**
 * Regresion: un pedido real llego sin ciudad. El `required` de los Select de
 * Radix no bloquea nada (monta un <select> oculto que solo incluye opcion vacia
 * cuando el valor es `undefined`, asi que con "" da por valida la primera
 * opcion de la lista). La validacion ahora es propia: estas pruebas fallan si
 * alguien vuelve a confiar en la validacion nativa.
 */
describe("AddressForm", () => {
  const llenarCamposDeTexto = (container: HTMLElement) => {
    const inputs = Array.from(container.querySelectorAll("input"));
    // Orden: nombre, apellido, telefono, empresa, direccion, apto, cod. postal
    const valores = ["Sergio", "Preciado", "3008167471", "", "Cra 50b #64-43", "", ""];
    inputs.forEach((el, i) => {
      if (valores[i]) fireEvent.change(el, { target: { value: valores[i] } });
    });
  };

  /** Solo los mensajes de error; los placeholders repiten el mismo texto. */
  const errores = (container: HTMLElement) =>
    Array.from(container.querySelectorAll('[role="alert"]')).map((e) => e.textContent);

  const enviar = (container: HTMLElement) =>
    fireEvent.submit(container.querySelector("form")!);

  it("se renderiza correctamente con el botón de guardar por defecto", () => {
    render(<AddressForm onSubmit={vi.fn()} />);
    expect(screen.getByText("Guardar Dirección")).toBeInTheDocument();
    expect(screen.getByText("Nombre *")).toBeInTheDocument();
  });

  it("no envia sin departamento ni ciudad", () => {
    const onSubmit = vi.fn();
    const { container } = render(<AddressForm onSubmit={onSubmit} />);

    llenarCamposDeTexto(container);
    enviar(container);

    expect(onSubmit).not.toHaveBeenCalled();
    expect(errores(container)).toContain("Selecciona un departamento");
    expect(errores(container)).toContain("Selecciona una ciudad");
  });

  it("no envia con departamento pero sin ciudad (el caso que llego a produccion)", () => {
    const onSubmit = vi.fn();
    const { container } = render(
      <AddressForm
        onSubmit={onSubmit}
        initialData={{
          province: "Cundinamarca",
          city: "",
          first_name: "Sergio",
          last_name: "Preciado",
          address_1: "Cra 50b #64-43",
          phone: "3008167471",
        }}
      />,
    );

    enviar(container);

    expect(onSubmit).not.toHaveBeenCalled();
    expect(errores(container)).toContain("Selecciona una ciudad");
  });

  it("no envia si la ciudad no pertenece al departamento elegido", () => {
    const onSubmit = vi.fn();
    const { container } = render(
      <AddressForm
        onSubmit={onSubmit}
        initialData={{
          province: "Cundinamarca",
          city: "Medellín", // es de Antioquia
          first_name: "Sergio",
          last_name: "Preciado",
          address_1: "Cra 50b #64-43",
          phone: "3008167471",
        }}
      />,
    );

    enviar(container);

    expect(onSubmit).not.toHaveBeenCalled();
    expect(errores(container)).toContain("Selecciona una ciudad de este departamento");
  });

  it("rechaza campos con solo espacios", () => {
    const onSubmit = vi.fn();
    const { container } = render(
      <AddressForm
        onSubmit={onSubmit}
        initialData={{
          province: "Cundinamarca",
          city: "Soacha",
          first_name: "   ",
          last_name: "Preciado",
          address_1: "   ",
          phone: "3008167471",
        }}
      />,
    );

    enviar(container);

    expect(onSubmit).not.toHaveBeenCalled();
    expect(errores(container)).toContain("Ingresa el nombre");
    expect(errores(container)).toContain("Ingresa la dirección");
  });

  it("envia cuando la direccion esta completa", () => {
    const onSubmit = vi.fn();
    const { container } = render(
      <AddressForm
        onSubmit={onSubmit}
        initialData={{
          province: "Cundinamarca",
          city: "Soacha",
          first_name: "Sergio",
          last_name: "Preciado",
          address_1: "Cra 50b #64-43",
          phone: "3008167471",
          postal_code: "111201",
        }}
      />,
    );

    enviar(container);

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const enviado = onSubmit.mock.calls[0][0] as AddressFormData;
    expect(enviado.city).toBe("Soacha");
    expect(enviado.province).toBe("Cundinamarca");
  });
});
