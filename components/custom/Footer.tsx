"use client"
import Link from 'next/link';
import Image from "next/image";
import { Phone, Mail, MapPin  } from "lucide-react";

const Footer = () => {
  
  return (
    <footer>
      <div className='flex items-center justify-center font-sans dark:bg-black'>
        <div className='max-w-350 w-full items-center py-5 px-5 md:px-16 bg-white dark:bg-black sm:items-start justify-between'>
          <div className="upper-part grid grid-cols-1 md:grid-cols-3 justify-between w-full">
            <div className="contact-info flex flex-col">
              <h3 className='text-2xl font-bold mb-7'>Ayuda y Soporte</h3>
              <p className='flex items-center pb-5'><MapPin className='mr-2'  /> Bogota, Colombia</p>
              <p className='flex items-center pb-5'><Phone className='mr-2' /> +583158204732</p>
              <p className='flex items-center pb-5'><Mail className='mr-2' /> nimvustore@gmail.com</p>
            </div>
            <div className="links-info flex flex-col">
              <h3 className='text-2xl font-bold mb-7'>Cuenta</h3>
              <Link href="/register" className="pb-5 text-black transition">Mi Cuenta</Link>
              <Link href="/about" className="pb-5 text-black transition">Carrito</Link>
              <Link href="/about" className="pb-5 text-black transition">Tienda</Link>
            </div>
            <div className="legal-info flex flex-col">
              <h3 className='text-2xl font-bold mb-7'>Politicas</h3>
              <Link href="/about" className="pb-5">Politicas de Privacidad</Link>
              <Link href="/about" className="pb-5">Politicas de Devoluciones</Link>
              <Link href="/about" className="pb-5">Terminos de uso</Link>
              <Link href="/about" className="pb-5">Preguntas Frecuentes</Link>
              <Link href="/about" className="pb-5">Contacto</Link>
            </div>
          </div>
        </div>
      </div>
      <div className='flex items-center justify-center font-sans dark:bg-black bg-gray-100 p-5'>
        <div className='flex max-w-[1400px] w-full py-5 px-16 justify-between'>
          <p className=''>© 2026. Todos los derechos reservados por Nimvu.</p>
          <div className="flex flex-wrap items-center gap-4">
            <p className="font-medium">Aceptamos</p>
            <div className="flex flex-wrap items-center gap-6">
              <a href="#" aria-label="payment system with visa card">
                <Image
                  src="/payment/payment-01.svg"
                  alt="visa card"
                  width={66}
                  height={22}
                />
              </a>
              <a href="#" aria-label="payment system with master card">
                <Image
                  src="/payment/payment-03.svg"
                  alt="master card"
                  width={33}
                  height={24}
                />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;