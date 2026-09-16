import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, fireEvent, act } from "@testing-library/react";
import { CheckoutAccount } from "@/components/custom/checkout/CheckoutAccount";

/**
 * El paso 1 ya no tiene boton "Continuar": avanza solo cuando detecta un correo
 * valido. La espera evita dar el paso por bueno a media escritura.
 */
describe("CheckoutAccount - avance automatico por correo", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  const montar = () => {
    const setGuestEmail = vi.fn();
    const { container } = render(
      <CheckoutAccount customer={null} guestEmail="" setGuestEmail={setGuestEmail} />,
    );
    const input = container.querySelector("#guest-email") as HTMLInputElement;
    return { setGuestEmail, input, container };
  };

  const escribir = (input: HTMLInputElement, valor: string) =>
    act(() => {
      fireEvent.change(input, { target: { value: valor } });
    });

  const avanzarReloj = (ms: number) =>
    act(() => {
      vi.advanceTimersByTime(ms);
    });

  it("no muestra boton Continuar", () => {
    const { container } = montar();
    const textos = Array.from(container.querySelectorAll("button")).map((b) => b.textContent);
    expect(textos).not.toContain("Continuar");
  });

  it("avanza solo cuando el correo es valido", () => {
    const { setGuestEmail, input } = montar();

    escribir(input, "jose@gmail.com");
    expect(setGuestEmail).not.toHaveBeenCalled(); // aun esperando

    avanzarReloj(800);
    expect(setGuestEmail).toHaveBeenCalledWith("jose@gmail.com");
  });

  it("no avanza con un correo incompleto", () => {
    const { setGuestEmail, input } = montar();

    escribir(input, "jose@gmail"); // sin dominio de primer nivel
    avanzarReloj(2000);
    expect(setGuestEmail).not.toHaveBeenCalled();

    escribir(input, "jose@");
    avanzarReloj(2000);
    expect(setGuestEmail).not.toHaveBeenCalled();
  });

  it("no avanza a medio escribir el dominio", () => {
    const { setGuestEmail, input } = montar();

    // "jose@gmail.co" es valido de por si, pero el cliente sigue escribiendo.
    escribir(input, "jose@gmail.co");
    avanzarReloj(300);
    escribir(input, "jose@gmail.com");
    avanzarReloj(800);

    expect(setGuestEmail).toHaveBeenCalledTimes(1);
    expect(setGuestEmail).toHaveBeenCalledWith("jose@gmail.com");
  });

  it("recorta espacios sobrantes", () => {
    const { setGuestEmail, input } = montar();

    escribir(input, "  jose@gmail.com  ");
    avanzarReloj(800);

    expect(setGuestEmail).toHaveBeenCalledWith("jose@gmail.com");
  });

  it("marca el error solo despues de salir del campo", () => {
    const { input, container } = montar();
    const errores = () =>
      Array.from(container.querySelectorAll('[role="alert"]')).map((e) => e.textContent);

    escribir(input, "jose@");
    expect(errores()).toHaveLength(0); // aun escribiendo, sin regañar

    act(() => {
      fireEvent.blur(input);
    });
    expect(errores()).toContain("Revisa el correo: parece incompleto.");
  });
});
