'use client';

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { sdk } from "../lib/sdk"
import { Button } from "@/components/ui/button"
import { FetchError } from "@medusajs/js-sdk"

export default function AuthPage() {
  const [loading, setLoading] = useState(false)
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null);

  const handleRegistration = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault()
    if (!firstName || !lastName || !email || !password) {
      return
    }
    setLoading(true)

    try {
      await sdk.auth.register("customer", "emailpass", {
        email,
        password,
      })
    } catch (error) {
      const fetchError = error as FetchError
      setError(error);
      if (fetchError.statusText !== "Unauthorized" || fetchError.message !== "Identity with email already exists") {
        alert(`An error occurred while creating account: ${fetchError}`)
        return
      }
      // another identity (for example, admin user)
      // exists with the same email. So, use the auth
      // flow to login and create a customer.
      const loginResponse = (await sdk.auth.login("customer", "emailpass", {
        email,
        password,
      }).catch((e) => {
        alert(`An error occurred while creating account: ${e}`)
      }))

      if (!loginResponse) {
        return
      }

      if (typeof loginResponse !== "string") {
        alert("Authentication requires more actions, which isn't supported by this flow.")
        return
      }
    }

    // create customer
    try {
      const { customer } = await sdk.store.customer.create({
        first_name: firstName,
        last_name: lastName,
        email,
      })
  
      setLoading(false)

      console.log(customer)
      // TODO redirect to login page
    } catch (error) {
      console.error(error)
      alert("Error: " + error)
      return
    }
  }


  return (
    <section className="min-h-[80vh] flex items-center justify-center bg-white py-20">
      <div className="w-full max-w-350 mx-auto px-16">
        
        <h1 className="text-3xl md:text-4xl text-center mb-16 text-black font-italiana">
          Mi Cuenta
        </h1>

        {/* Mensaje de Error Global */}
        {error && (
          <div className="bg-red-50 text-red-600 p-4 mb-8 text-center text-sm border border-red-100">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 relative">
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-gray-200 -translate-x-1/2"></div>

          {/* ================= LOGIN ================= */}
          <div className="flex flex-col">
            <h2 className="text-xl font-italiana tracking-wide mb-6 text-gray-900">
              Iniciar Sesión
            </h2>

            <form  className="flex flex-col gap-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">
                  Correo electrónico <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors rounded-none"
                  onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">
                  Contraseña <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors rounded-none"
                  onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                />
              </div>

              <div className="flex items-center justify-between text-sm mt-2">
                <label className="flex items-center gap-2 cursor-pointer select-none text-gray-600 hover:text-gray-900">
                  <input type="checkbox" className="w-4 h-4 rounded-sm border-gray-300 accent-black" />
                  <span>Recuérdame</span>
                </label>
                <Link href="/forgot-password" className="text-gray-500 underline hover:text-black">
                  ¿Olvidaste la contraseña?
                </Link>
              </div>

              <Button 
                type="submit" 
                disabled={loading}
                className="mt-4 bg-black text-white uppercase font-bold text-xs tracking-widest py-4 px-8 transition-colors w-full md:w-auto self-start disabled:opacity-50 cursor-pointer"
              >
                {loading ? "Cargando..." : "Acceder"}
              </Button>
            </form>
          </div>

          {/* ================= REGISTRO (Adaptado para Medusa) ================= */}
          <div className="flex flex-col">
            <h2 className="text-xl font-italiana tracking-wide mb-6 text-gray-900">
              Registrarse
            </h2>

            <form className="flex flex-col gap-5">
              
              {/* Campos Nombre y Apellido (Necesarios para Medusa) */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">
                    Nombre <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-black rounded-none"
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">
                    Apellido <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-black rounded-none"
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">
                  Correo electrónico <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-black rounded-none"
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* Campo Password Agregado */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">
                  Contraseña <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-black rounded-none"
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="text-sm text-gray-500 leading-relaxed space-y-4 my-2">
                <p>
                  Tus datos personales se utilizarán para procesar tu pedido y mejorar tu experiencia según nuestra <Link href="/privacy" className="underline text-gray-700 hover:text-black">política de privacidad</Link>.
                </p>
              </div>

              <Button 
                type="submit" 
                disabled={loading}
                onClick={handleRegistration}
                className="mt-2 bg-black text-white border uppercase font-bold text-xs tracking-widest py-4 px-8 transition-colors w-full md:w-auto self-start disabled:opacity-50 cursor-pointer"
              >
                {loading ? "Creando cuenta..." : "Registrarse"}
              </Button>
            </form>
          </div>

        </div>
      </div>
    </section>
  );
}