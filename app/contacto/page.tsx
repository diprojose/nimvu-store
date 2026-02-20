"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// Assuming Textarea exists or I will use standard textarea if import fails. 
// Safest to use standard HTML for Textarea if I am not sure, but I'll see list_dir output.
// Actually, I'll use standard HTML elements styled like the Register page to be safe and consistent.
import { Loader2 } from "lucide-react";

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setLoading(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-4xl font-italiana mb-6">Mensaje Enviado</h1>
        <p className="text-gray-600 mb-8 max-w-md">
          Gracias por contactarnos. Hemos recibido tu mensaje y nuestro equipo te responderá lo antes posible.
        </p>
        <Button onClick={() => setSubmitted(false)} variant="outline">
          Enviar otro mensaje
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white text-black font-sans min-h-screen">
      <div className="max-w-4xl mx-auto px-6 py-24">
        <header className="mb-16 text-center">
          <h1 className="text-5xl md:text-6xl font-italiana">Contactanos</h1>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className="space-y-8 py-4">
            <div>
              <h3 className="font-italiana text-2xl mb-2">Oficina</h3>
              <p className="text-gray-600">
                Bogotá, Colombia<br />
                110221
              </p>
            </div>
            <div>
              <h3 className="font-italiana text-2xl mb-2">Email</h3>
              <p className="text-gray-600">nimvustore@gmail.com</p>
            </div>
            <div>
              <h3 className="font-italiana text-2xl mb-2">Redes Sociales</h3>
              <div className="flex gap-4 underline text-gray-500">
                <a href="https://www.instagram.com/nimvustore/" className="hover:text-black">Instagram</a>
                <a href="https://www.tiktok.com/@nimvustore" className="hover:text-black">TikTok</a>
                <a href="https://www.facebook.com/profile.php?id=61584617187657" className="hover:text-black">Facebook</a>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Nombre Completo</label>
              <input
                type="text"
                required
                className="w-full border-b border-gray-300 py-3 focus:outline-none focus:border-black transition-colors bg-transparent placeholder-gray-400"
                placeholder="Jane Doe"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Correo Electrónico</label>
              <input
                type="email"
                required
                className="w-full border-b border-gray-300 py-3 focus:outline-none focus:border-black transition-colors bg-transparent placeholder-gray-400"
                placeholder="jane@example.com"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Asunto</label>
              <input
                type="text"
                required
                className="w-full border-b border-gray-300 py-3 focus:outline-none focus:border-black transition-colors bg-transparent placeholder-gray-400"
                placeholder="Colaboración, Pedido, etc."
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Mensaje</label>
              <textarea
                required
                rows={4}
                className="w-full border-b border-gray-300 py-3 focus:outline-none focus:border-black transition-colors bg-transparent placeholder-gray-400 resize-none"
                placeholder="¿En qué podemos ayudarte?"
              ></textarea>
            </div>

            <Button type="submit" disabled={loading} className="w-full bg-black text-white uppercase tracking-widest text-xs font-bold py-6 hover:bg-zinc-800">
              {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : "Enviar Mensaje"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
