"use client";

import { createContext, useContext, useMemo, ReactNode } from "react";
import { usePathname } from "next/navigation";
import { BackendUniverse, BackendCategory } from "@/lib/api";

interface UniverseContextValue {
  universes: BackendUniverse[];
  categories: BackendCategory[];
  categoriesByUniverseId: Record<string, BackendCategory[]>;
  currentUniverse: BackendUniverse | null;
  currentCategories: BackendCategory[];
  /** Kept for API compatibility with previous version; always false now. */
  isLoadingCategories: boolean;
}

const UniverseContext = createContext<UniverseContextValue | null>(null);

function resolveCurrentUniverse(
  pathname: string,
  universes: BackendUniverse[],
): BackendUniverse | null {
  // First segment of the pathname (without leading slash)
  const firstSegment = pathname.split("/").filter(Boolean)[0]?.toLowerCase();

  // Routes that should NOT be treated as a universe slug
  const RESERVED = new Set([
    "productos",
    "categorias",
    "category",
    "coleccion",
    "cart",
    "checkout",
    "perfil",
    "register",
    "login",
    "forgot-password",
    "restablecer-contrasena",
    "contacto",
    "nosotros",
    "faq",
    "order",
    "b2b",
    "api",
    "terminos-de-uso",
    "politicas-de-devoluciones",
    "politicas-de-privacidad",
  ]);

  if (firstSegment && !RESERVED.has(firstSegment)) {
    const match = universes.find(
      (u) => u.slug.toLowerCase() === firstSegment && u.isActive && !u.comingSoon,
    );
    if (match) return match;
  }

  // Default to hogar at root or unmatched routes
  return universes.find((u) => u.slug === "hogar") ?? null;
}

export function UniverseProvider({
  initialUniverses,
  initialCategories,
  children,
}: {
  initialUniverses: BackendUniverse[];
  initialCategories: BackendCategory[];
  children: ReactNode;
}) {
  const pathname = usePathname();

  const value = useMemo<UniverseContextValue>(() => {
    const currentUniverse = resolveCurrentUniverse(pathname, initialUniverses);

    const categoriesByUniverseId: Record<string, BackendCategory[]> = {};
    for (const cat of initialCategories) {
      const uid = cat.universeId ?? cat.universe?.id;
      if (!uid) continue;
      if (!categoriesByUniverseId[uid]) categoriesByUniverseId[uid] = [];
      categoriesByUniverseId[uid].push(cat);
    }
    // Order each bucket by `order` ascending so the header reflects admin order.
    Object.values(categoriesByUniverseId).forEach((arr) =>
      arr.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    );

    const currentCategories = currentUniverse
      ? categoriesByUniverseId[currentUniverse.id] ?? []
      : [];

    return {
      universes: initialUniverses,
      categories: initialCategories,
      categoriesByUniverseId,
      currentUniverse,
      currentCategories,
      isLoadingCategories: false,
    };
  }, [pathname, initialUniverses, initialCategories]);

  return (
    <UniverseContext.Provider value={value}>{children}</UniverseContext.Provider>
  );
}

export function useUniverse() {
  const ctx = useContext(UniverseContext);
  if (!ctx) {
    throw new Error("useUniverse must be used within a UniverseProvider");
  }
  return ctx;
}

export function universeCssVars(universe: BackendUniverse | null): React.CSSProperties {
  if (!universe) return {};
  return {
    ["--universe-primary" as string]: universe.primaryColor || undefined,
    ["--universe-secondary" as string]: universe.secondaryColor || undefined,
    ["--universe-accent" as string]: universe.accentColor || undefined,
  };
}
