import Link from 'next/link';
import Image from 'next/image';

const B2BFooter = () => {
  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
      <div className="mx-auto xl:max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-8 mb-16">
          {/* Logo & Info */}
          <div className="col-span-1 md:col-span-1 lg:col-span-2">
            <Link href="/b2b" className="inline-block mb-6 bg-white p-2 rounded-lg">
              <Image
                src="/nimvu-logo.png"
                alt="Nimvu B2B logo"
                width={120}
                height={24}
                className="opacity-90 grayscale-0"
              />
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
              Fabricación 3D corporativa para la era industrial moderna.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4">Plataforma</h3>
            <ul className="space-y-3">
              <li><Link href="/b2b/integrations" className="text-sm text-gray-500 hover:text-blue-600">Integraciones</Link></li>
              <li><Link href="/b2b/api" className="text-sm text-gray-500 hover:text-blue-600">API para Desarrolladores</Link></li>
              <li><Link href="/b2b/pricing" className="text-sm text-gray-500 hover:text-blue-600">Planes de Precios</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4">Empresa</h3>
            <ul className="space-y-3">
              <li><Link href="/b2b/about" className="text-sm text-gray-500 hover:text-blue-600">Nosotros</Link></li>
              <li><Link href="/b2b/careers" className="text-sm text-gray-500 hover:text-blue-600">Empleos</Link></li>
              <li><Link href="/b2b/contact" className="text-sm text-gray-500 hover:text-blue-600">Contacto</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4">Legal</h3>
            <ul className="space-y-3">
              <li><Link href="/b2b/privacy" className="text-sm text-gray-500 hover:text-blue-600">Política de Privacidad</Link></li>
              <li><Link href="/b2b/terms" className="text-sm text-gray-500 hover:text-blue-600">Términos de Servicio</Link></li>
              <li><Link href="/b2b/security" className="text-sm text-gray-500 hover:text-blue-600">Seguridad</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} Nimvu Technologies S.A.S. Todos los derechos reservados.
          </p>
          <div className="flex gap-4">
            <Link href="#" className="text-xs text-gray-400 hover:text-gray-900">Twitter</Link>
            <Link href="#" className="text-xs text-gray-400 hover:text-gray-900">LinkedIn</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default B2BFooter;
