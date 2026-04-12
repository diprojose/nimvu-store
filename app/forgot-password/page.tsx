'use client';

import { useState } from "react";
import Link from "next/link";
import { auth } from "@/lib/api";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError(null);

    try {
      await auth.forgotPassword(email);
      setSubmitted(true);
    } catch {
      setError("Ocurrió un error. Por favor intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-[80vh] flex items-center justify-center bg-white py-20">
      <div className="w-full max-w-350 mx-auto px-16">

        <h1 className="text-3xl md:text-4xl text-center mb-4 text-black font-italiana">
          Restablecer Contraseña
        </h1>

        <p className="text-center text-gray-500 text-sm mb-12">
          Ingresa tu correo y te enviaremos un enlace para crear una nueva contraseña.
        </p>

        {submitted ? (
          <div className="max-w-[400px] mx-auto text-center">
            <div className="bg-green-50 border border-green-200 text-green-700 p-6 mb-8 text-sm leading-relaxed">
              <p className="font-semibold mb-2">Revisa tu correo</p>
              <p>
                Si <strong>{email}</strong> está registrado, recibirás un enlace para
                restablecer tu contraseña en los próximos minutos.
              </p>
              <p className="mt-3 text-green-600">Recuerda revisar tu carpeta de spam.</p>
            </div>
            <Link
              href="/register"
              className="text-sm text-gray-500 underline hover:text-black"
            >
              Volver a Iniciar Sesión
            </Link>
          </div>
        ) : (
          <div className="flex justify-center">
            <form onSubmit={handleSubmit} className="w-[400px] flex flex-col gap-5">

              {error && (
                <div className="bg-red-50 text-red-600 p-4 text-center text-sm border border-red-100">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">
                  Correo electrónico <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tucorreo@ejemplo.com"
                  className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors rounded-none"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="mt-2 bg-black text-white uppercase font-bold text-xs tracking-widest py-4 px-8 transition-colors w-full disabled:opacity-50 cursor-pointer"
              >
                {loading ? "Enviando..." : "Enviar enlace"}
              </Button>

              <div className="text-center">
                <Link
                  href="/register"
                  className="text-sm text-gray-500 underline hover:text-black"
                >
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
