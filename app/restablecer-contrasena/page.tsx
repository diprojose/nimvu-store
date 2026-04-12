'use client';

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { auth } from "@/lib/api";
import { Button } from "@/components/ui/button";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError("El enlace no es válido. Por favor solicita uno nuevo.");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    if (!token) return;

    setLoading(true);

    try {
      await auth.resetPassword(token, password);
      setSuccess(true);
      setTimeout(() => router.push("/register"), 3000);
    } catch (err: any) {
      const msg = err.response?.data?.message || "El enlace es inválido o ha expirado. Solicita uno nuevo.";
      setError(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-[80vh] flex items-center justify-center bg-white py-20">
      <div className="w-full max-w-350 mx-auto px-16">

        <h1 className="text-3xl md:text-4xl text-center mb-4 text-black font-italiana">
          Nueva Contraseña
        </h1>

        <p className="text-center text-gray-500 text-sm mb-12">
          Elige una contraseña segura para tu cuenta.
        </p>

        {success ? (
          <div className="max-w-[400px] mx-auto text-center">
            <div className="bg-green-50 border border-green-200 text-green-700 p-6 mb-8 text-sm leading-relaxed">
              <p className="font-semibold mb-2">¡Contraseña actualizada!</p>
              <p>Tu contraseña ha sido cambiada correctamente. Serás redirigido al inicio de sesión en unos segundos.</p>
            </div>
            <Link href="/register" className="text-sm text-gray-500 underline hover:text-black">
              Ir a Iniciar Sesión
            </Link>
          </div>
        ) : (
          <div className="flex justify-center">
            <form onSubmit={handleSubmit} className="w-[400px] flex flex-col gap-5">

              {error && (
                <div className="bg-red-50 text-red-600 p-4 text-center text-sm border border-red-100">
                  {error}
                  {!token && (
                    <div className="mt-3">
                      <Link href="/forgot-password" className="underline font-semibold">
                        Solicitar nuevo enlace
                      </Link>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">
                  Nueva contraseña <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  disabled={!token}
                  className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors rounded-none disabled:bg-gray-100"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">
                  Confirmar contraseña <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Repite tu nueva contraseña"
                  disabled={!token}
                  className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors rounded-none disabled:bg-gray-100"
                />
              </div>

              <Button
                type="submit"
                disabled={loading || !token}
                className="mt-2 bg-black text-white uppercase font-bold text-xs tracking-widest py-4 px-8 transition-colors w-full disabled:opacity-50 cursor-pointer"
              >
                {loading ? "Guardando..." : "Guardar contraseña"}
              </Button>

              <div className="text-center">
                <Link href="/register" className="text-sm text-gray-500 underline hover:text-black">
                  Volver a Iniciar Sesión
                </Link>
              </div>
            </form>
          </div>
        )}

      </div>
    </section>
  );
}

export default function RestablecerContrasenaPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Cargando...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
