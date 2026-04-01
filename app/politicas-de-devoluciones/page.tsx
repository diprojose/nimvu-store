import React, { FC, ReactElement } from "react";

const ReturnPolicy: FC = (): ReactElement => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 mt-16 min-h-[60vh] text-gray-800">
      <h1 className="text-4xl font-bold mb-4">Políticas de Cambios y Devoluciones de Nimvu</h1>
      <p className="text-sm text-gray-500 mb-10">Última actualización: 31 de marzo de 2026</p>

      <div className="space-y-8 leading-relaxed">
        <section>
          <p>
            En Nimvu queremos que estés completamente satisfecho con tus compras. Si por alguna razón no estás conforme con tu pedido, a continuación te detallamos nuestras políticas de cambios, devoluciones y garantías, diseñadas de acuerdo con el Estatuto del Consumidor de Colombia (Ley 1480 de 2011).
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">1. Derecho de Retracto</h2>
          <p className="mb-4">
            De acuerdo con la ley colombiana para ventas por comercio electrónico, tienes derecho a ejercer el Derecho de Retracto dentro de los <strong>cinco (5) días hábiles</strong> siguientes a la entrega del producto.
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Para ejercer este derecho, el producto debe ser devuelto a Nimvu en las mismas condiciones en las que lo recibiste: sin uso, en su empaque original y con todas sus etiquetas y accesorios.</li>
            <li>Los costos de transporte y los demás que conlleve la devolución del producto serán cubiertos por el cliente.</li>
            <li>Una vez recibido y verificado el estado del producto, te reembolsaremos el dinero de la compra (excluyendo los costos de envío original) en un plazo máximo de treinta (30) días calendario.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">2. Excepciones al Derecho de Retracto y Devoluciones</h2>
          <p className="mb-4">Dado el proceso de fabricación de Nimvu, <strong>no se aceptan cambios ni devoluciones</strong> en los siguientes casos:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Productos personalizados o hechos a la medida:</strong> Cualquier artículo que haya sido fabricado con especificaciones particulares del cliente (nombres, colores por encargo especial, dimensiones modificadas o diseños exclusivos).</li>
            <li>Productos que presenten desgaste por uso normal, mala manipulación, caídas o exposición a condiciones extremas (como calor excesivo que pueda deformar el material).</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">3. Garantía por Defectos de Fabricación</h2>
          <p className="mb-4">Nuestros productos pasan por una revisión de calidad antes de ser enviados. Sin embargo, si recibes un artículo con un defecto de fabricación, ofrecemos una garantía de <strong>30 días calendario</strong> desde la recepción del pedido.</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>¿Qué cubre la garantía?</strong> Defectos estructurales graves, piezas incompletas o errores evidentes en la impresión que afecten la funcionalidad del producto.</li>
            <li><strong>¿Qué NO cubre la garantía?</strong> Es importante tener en cuenta que, debido a la naturaleza de la impresión 3D, los productos pueden presentar ligeras líneas de capa, pequeñas texturas o variaciones mínimas en la superficie. Estas son características normales del proceso de fabricación y no se consideran defectos de calidad o garantía. Tampoco se cubren daños por uso inadecuado o accidentes.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">4. Proceso para solicitar un Cambio, Devolución o Garantía</h2>
          <p className="mb-4">Si tu caso cumple con las condiciones anteriores, sigue estos pasos:</p>
          <ol className="list-decimal pl-6 space-y-2 mb-4">
            <li>
              Escríbenos a <a href="mailto:nimvustore@gmail.com" className="text-blue-600 hover:underline">nimvustore@gmail.com</a> o contáctanos vía WhatsApp al <a href="https://wa.me/573123478307" className="text-blue-600 hover:underline">+57 312 347 8307</a> en los plazos establecidos.
            </li>
            <li>
              Incluye en tu mensaje:
              <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-700">
                <li>Tu nombre completo y número de pedido.</li>
                <li>El motivo del cambio, devolución o garantía.</li>
                <li>Fotografías o videos claros del producto donde se evidencie su estado o el defecto reportado.</li>
              </ul>
            </li>
          </ol>
          <p>
            Nuestro equipo revisará tu solicitud y te dará respuesta en un plazo máximo de <strong>3 a 5 días hábiles</strong>, indicándote los pasos a seguir para el envío del artículo de vuelta a nuestras instalaciones en Bogotá.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">5. Reembolsos</h2>
          <p>
            Si se aprueba un reembolso (ya sea por retracto o por una garantía donde no sea posible el reemplazo), el dinero será devuelto al mismo método de pago utilizado en la compra inicial, o mediante transferencia bancaria, en un plazo máximo de <strong>15 a 30 días calendario</strong>, dependiendo de los tiempos de procesamiento de tu entidad bancaria.
          </p>
        </section>
      </div>
    </div>
  );
};

export default ReturnPolicy;
