"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

type RedirectCondition = "ifAuthenticated" | "ifUnauthenticated";

interface UseAuthRedirectProps {
  redirectTo: string;
  condition: RedirectCondition;
}

export function useAuthRedirect({ redirectTo, condition }: UseAuthRedirectProps) {
  const router = useRouter();
  const customer = useAuthStore((state) => state.customer);
  
  // Estado para saber si estamos validando (para mostrar loaders o null)
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Validamos la lógica según la condición
    const validate = () => {
      
      // CASO 1: Páginas de Login/Registro
      // Si la condición es "redirigir si está autenticado" Y existe el cliente...
      if (condition === "ifAuthenticated" && customer) {
        router.replace(redirectTo);
        return;
      }

      // CASO 2: Páginas Protegidas (Perfil)
      // Si la condición es "redirigir si NO está autenticado" Y NO existe el cliente...
      if (condition === "ifUnauthenticated" && !customer) {
        router.replace(redirectTo);
        return;
      }

      // Si no se cumple ninguna redirección, dejamos de cargar y mostramos la página
      setIsChecking(false);
    };

    validate();
  }, [customer, condition, redirectTo, router]);

  return { isChecking };
}