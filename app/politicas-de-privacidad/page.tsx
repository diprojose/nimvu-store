import React, { FC, ReactElement } from "react";

const PrivacyPolicy: FC = (): ReactElement => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 mt-16 min-h-[60vh] text-gray-800">
      <h1 className="text-4xl font-bold mb-4">Política de Privacidad de Nimvu</h1>
      <p className="text-sm text-gray-500 mb-10">Última actualización: 31 de marzo de 2026</p>

      <div className="space-y-8 leading-relaxed">
        <section>
          <p>
            En Nimvu, valoramos tu privacidad y estamos comprometidos con la protección de tus datos personales. Esta Política de Privacidad explica cómo recopilamos, usamos, compartimos y protegemos la información que nos proporcionas cuando visitas nuestro sitio web y adquieres nuestros productos.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">1. Información que recopilamos</h2>
          <p className="mb-4">Para poder procesar tus pedidos y ofrecerte la mejor experiencia posible, recopilamos los siguientes datos personales cuando interactúas con nuestra tienda:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Información de contacto y envío:</strong> Nombre completo, dirección de correo electrónico, número de teléfono, dirección de envío y dirección de facturación.</li>
            <li><strong>Información de pago:</strong> Datos necesarios para procesar tus compras (nota: los pagos se procesan a través de pasarelas de pago seguras y nosotros no almacenamos directamente los números de tus tarjetas de crédito o débito).</li>
            <li><strong>Información de navegación:</strong> Datos sobre cómo interactúas con nuestro sitio web, dirección IP, tipo de navegador y tiempos de acceso, recopilados a través de cookies o tecnologías similares para mejorar la funcionalidad de la tienda.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">2. Uso de tu información</h2>
          <p className="mb-4">Utilizamos la información recopilada para los siguientes propósitos:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Procesar, preparar y enviar tus pedidos.</li>
            <li>Enviarte confirmaciones de compra, actualizaciones de envío y responder a tus consultas de servicio al cliente.</li>
            <li>Mejorar nuestro sitio web, productos y la experiencia de usuario.</li>
            <li>Cumplir con nuestras obligaciones legales y fiscales.</li>
            <li>Enviarte comunicaciones promocionales (solo si has dado tu consentimiento previo para recibirlas), de las cuales puedes darte de baja en cualquier momento.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">3. Compartir tu información</h2>
          <p className="mb-4">En Nimvu no vendemos ni alquilamos tus datos personales a terceros. Solo compartimos tu información con proveedores de servicios de confianza que nos ayudan a operar nuestro negocio, bajo estrictos acuerdos de confidencialidad:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Empresas de logística y mensajería:</strong> Para poder entregar tus productos en la dirección indicada.</li>
            <li><strong>Pasarelas de pago:</strong> Para procesar las transacciones de manera segura.</li>
            <li><strong>Plataformas de servicios web:</strong> Para el alojamiento de la tienda y la gestión de bases de datos.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">4. Tus derechos sobre tus datos (Habeas Data)</h2>
          <p className="mb-4">De acuerdo con la legislación vigente en materia de protección de datos (Ley Estatutaria 1581 de 2012), tienes derecho a:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Conocer, actualizar y rectificar tus datos personales.</li>
            <li>Solicitar prueba de la autorización otorgada para el tratamiento de tus datos.</li>
            <li>Ser informado sobre el uso que le hemos dado a tu información.</li>
            <li>Revocar la autorización y/o solicitar la supresión de tus datos cuando consideres que no se han respetado los principios, derechos y garantías constitucionales y legales.</li>
            <li>Acceder en forma gratuita a tus datos personales que hayan sido objeto de tratamiento.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">5. Seguridad de los datos</h2>
          <p>Implementamos medidas de seguridad técnicas y administrativas diseñadas para proteger tu información personal contra accesos no autorizados, pérdida, alteración o destrucción.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">6. Cambios en esta Política de Privacidad</h2>
          <p>Nos reservamos el derecho de actualizar esta Política de Privacidad en cualquier momento para reflejar cambios en nuestras prácticas operativas o legales. Te notificaremos sobre cualquier cambio significativo publicando la nueva política en esta misma página y actualizando la fecha en la parte superior.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">7. Contacto</h2>
          <p className="mb-4">Si tienes alguna pregunta, inquietud o deseas ejercer tus derechos sobre tus datos personales, puedes contactarnos a través de:</p>
          <ul className="space-y-2 border-l-4 border-gray-300 pl-4 py-2 bg-gray-50 rounded-r-lg inline-block pr-8">
            <li><strong>Correo electrónico:</strong> <a href="mailto:nimvustore@gmail.com" className="text-blue-600 hover:underline">nimvustore@gmail.com</a></li>
            <li><strong>Teléfono/WhatsApp:</strong> <a href="https://wa.me/573123478307" className="text-blue-600 hover:underline">+57 312 347 8307</a></li>
            <li><strong>Dirección:</strong> Bogotá, Colombia</li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
