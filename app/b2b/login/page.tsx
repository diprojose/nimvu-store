'use client';

import { useState } from "react";
import { useAuthStore } from '@/store/authStore';
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useAuthRedirect } from "@/lib/hooks/redirect-if-authenticated";

export default function B2BLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const loginB2B = useAuthStore((state) => state.loginB2B);

  const { isChecking } = useAuthRedirect({
    redirectTo: "/b2b",
    condition: "ifAuthenticated",
  });

  if (isChecking) {
    return <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">Cargando...</div>;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) return;

    setLoading(true);
    setError(null);

    try {
      await loginB2B(loginEmail, loginPassword);
      router.refresh();
      router.push("/b2b");
    } catch (error: any) {
      console.error(error);
      const errorMessage = error.response?.data?.message || "Ocurrió un error al iniciar sesión.";
      setError(Array.isArray(errorMessage) ? errorMessage[0] : errorMessage);
      setLoading(false);
    }
  };

  return (
    <section className="min-h-[85vh] flex items-center justify-center bg-[#F8F9FA] py-20">
      <div className="w-full max-w-md mx-auto px-6">

        <div className="bg-white p-10 rounded-xl shadow-sm border border-gray-100">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">
              Nimvu <span className="text-blue-600">Enterprise</span>
            </h1>
            <p className="text-sm text-gray-500">
              Inicia sesión en tu cuenta corporativa
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 mb-8 text-center text-sm rounded-md border border-red-100 font-medium">
              {error}
            </div>
          )}

          <form className="flex flex-col gap-6" onSubmit={handleLogin}>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                Correo corporativo
              </label>
              <input
                type="email"
                required
                placeholder="ejemplo@empresa.com"
                className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all rounded-md"
                onChange={(e) => setLoginEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-gray-700">
                  Contraseña
                </label>
              </div>
              <input
                type="password"
                required
                className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all rounded-md"
                onChange={(e) => setLoginPassword(e.target.value)}
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-md transition-colors w-full disabled:opacity-50"
            >
              {loading ? "Accediendo..." : "Acceder a Enterprise"}
            </Button>

            <p className="text-center text-sm text-gray-500 mt-4">
              ¿No tienes una cuenta corporativa? <a href="mailto:ventas@nimvu.com" className="text-blue-600 hover:underline">Contacta ventas</a>
            </p>
          </form>
        </div>

      </div>
    </section>
  );
}
