import React, { FC, ReactElement } from "react";

const TermsOfUse: FC = (): ReactElement => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 mt-16 min-h-[60vh] text-gray-800">
      <h1 className="text-4xl font-bold mb-4">Términos y Condiciones de Uso</h1>
      <p className="text-sm text-gray-500 mb-10">Última actualización: 31 de marzo de 2026</p>

      <div className="space-y-8 leading-relaxed">
        <section>
          <p>
            Bienvenido a Nimvu. Al acceder y utilizar nuestro sitio web <a href="http://somosnimvu.com/" className="text-blue-600 hover:underline">http://somosnimvu.com/</a> y al adquirir nuestros productos, aceptas estar sujeto a los siguientes Términos y Condiciones. Te recomendamos leerlos detenidamente antes de realizar cualquier compra. Si no estás de acuerdo con estos términos, te sugerimos no utilizar nuestro sitio web.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">1. Información General</h2>
          <p>
            Este sitio web es operado por Nimvu, una empresa dedicada al diseño, fabricación y venta de productos mediante impresión 3D, con sede en Bogotá, Colombia. Los términos "nosotros", "nos" y "nuestro" se refieren a Nimvu.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">2. Uso del Sitio Web</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Al utilizar este sitio, declaras que tienes al menos la mayoría de edad en tu país o lugar de residencia, o que nos has dado tu consentimiento para permitir que cualquiera de tus dependientes menores use este sitio.</li>
            <li>No puedes usar nuestros productos para ningún propósito ilegal o no autorizado.</li>
            <li>No debes transmitir ningún virus, gusano o cualquier código de naturaleza destructiva.</li>
            <li>Nos reservamos el derecho de rechazar el servicio a cualquier persona, por cualquier motivo y en cualquier momento.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">3. Propiedad Intelectual</h2>
          <p className="mb-4">
            Todo el contenido incluido en este sitio web, como textos, gráficos, logotipos, imágenes, videos y, especialmente, los diseños tridimensionales (modelos 3D) y fotografías de los productos, son propiedad exclusiva de Nimvu o de sus proveedores de contenido, y están protegidos por las leyes de derechos de autor y propiedad intelectual de Colombia e internacionales.
          </p>
          <p>
            Queda estrictamente prohibida la reproducción, distribución, modificación o uso comercial no autorizado de nuestros diseños o imágenes sin nuestro consentimiento previo por escrito.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">4. Productos y Especificaciones</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Nos esforzamos por mostrar con la mayor precisión posible los colores y las imágenes de nuestros productos (incluyendo nuestros sets coloridos y soportes). Sin embargo, no podemos garantizar que la pantalla de tu monitor muestre los colores de manera exacta.</li>
            <li><strong>Naturaleza de la impresión 3D:</strong> Al ser productos fabricados mediante impresión 3D, es normal que presenten ligeras líneas de capa, texturas o variaciones mínimas propias del proceso de manufactura. Estas características no se consideran defectos de fábrica.</li>
            <li>Nos reservamos el derecho de limitar las cantidades de los productos que ofrecemos. Todas las descripciones de los productos o los precios están sujetos a cambios en cualquier momento sin previo aviso.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">5. Precios y Pagos</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Todos los precios mostrados en nuestro sitio web están en Pesos Colombianos (COP) y, a menos que se indique lo contrario, no incluyen los costos de envío. Los costos de envío se calcularán y se mostrarán al momento de finalizar la compra.</li>
            <li>Te comprometes a proporcionar información actual, completa y precisa para todas las compras realizadas en nuestra tienda.</li>
            <li>Nos reservamos el derecho de rechazar cualquier pedido que realices. Podemos, a nuestra discreción, limitar o cancelar las cantidades compradas por persona, por hogar o por pedido.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">6. Enlaces a Terceros</h2>
          <p>
            Ciertos contenidos, productos y servicios disponibles a través de nuestro sitio web pueden incluir materiales de terceros (por ejemplo, enlaces a nuestras pasarelas de pago o redes sociales). No somos responsables de examinar o evaluar el contenido o la exactitud de los sitios web de terceros y no asumimos ninguna responsabilidad por ellos.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">7. Limitación de Responsabilidad</h2>
          <p>
            En ningún caso Nimvu, nuestros directores, empleados o proveedores serán responsables por cualquier lesión, pérdida, reclamo o cualquier daño directo, indirecto, incidental, punitivo o consecuente de cualquier tipo, que surja de tu uso de nuestro sitio web o de cualquier producto adquirido a través del mismo.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">8. Legislación Aplicable</h2>
          <p>
            Estos Términos de Uso y cualquier acuerdo separado por el cual te proporcionemos servicios se regirán e interpretarán de acuerdo con las leyes de la República de Colombia. Cualquier disputa que surja en relación con este sitio web será sometida a la jurisdicción de los tribunales competentes en Bogotá.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">9. Cambios en los Términos de Uso</h2>
          <p>
            Puedes revisar la versión más reciente de los Términos de Uso en cualquier momento en esta página. Nos reservamos el derecho, a nuestra entera discreción, de actualizar, cambiar o reemplazar cualquier parte de estos Términos publicando las actualizaciones y los cambios en nuestro sitio web.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">10. Información de Contacto</h2>
          <p className="mb-4">Las preguntas sobre los Términos de Uso deben ser enviadas a:</p>
          <ul className="space-y-2 border-l-4 border-gray-300 pl-4 py-2 bg-gray-50 rounded-r-lg inline-block pr-8">
            <li><strong>Correo electrónico:</strong> <a href="mailto:nimvustore@gmail.com" className="text-blue-600 hover:underline">nimvustore@gmail.com</a></li>
            <li><strong>Teléfono/WhatsApp:</strong> <a href="https://wa.me/573123478307" className="text-blue-600 hover:underline">+57 312 347 8307</a></li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default TermsOfUse;
