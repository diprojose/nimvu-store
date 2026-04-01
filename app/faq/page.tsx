import React, { FC, ReactElement } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FaqPage: FC = (): ReactElement => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 mt-16 min-h-[60vh] text-gray-800">
      <h1 className="text-4xl font-bold mb-4">Preguntas Frecuentes (FAQ) - Nimvu</h1>
      <p className="text-sm text-gray-500 mb-10">Última actualización: 31 de marzo de 2026</p>

      <Accordion type="single" collapsible className="w-full space-y-4">
        <AccordionItem value="item-1" className="border rounded-lg px-4 bg-white shadow-sm">
          <AccordionTrigger className="font-semibold text-lg hover:no-underline text-left">
            1. ¿De qué material están hechos los productos?
          </AccordionTrigger>
          <AccordionContent className="text-gray-600 leading-relaxed text-base pt-2">
            La mayoría de nuestros productos, como los soportes para controles y artículos decorativos, están fabricados en PLA (Ácido Poliláctico) de alta calidad. Es un material resistente, ligero y que permite un acabado detallado y colorido.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-2" className="border rounded-lg px-4 bg-white shadow-sm">
          <AccordionTrigger className="font-semibold text-lg hover:no-underline text-left">
            2. ¿Qué es el PLA?
          </AccordionTrigger>
          <AccordionContent className="text-gray-600 leading-relaxed text-base pt-2">
            El PLA es un bioplástico obtenido a partir de recursos renovables como el almidón de maíz o la caña de azúcar. A diferencia de los plásticos derivados del petróleo, es biodegradable bajo condiciones específicas y mucho más amigable con el medio ambiente, lo que lo hace ideal para artículos de decoración y uso en interiores.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-3" className="border rounded-lg px-4 bg-white shadow-sm">
          <AccordionTrigger className="font-semibold text-lg hover:no-underline text-left">
            3. ¿Los productos se pueden mojar?
          </AccordionTrigger>
          <AccordionContent className="text-gray-600 leading-relaxed text-base pt-2">
            Sí, el PLA es resistente al agua fría o ambiente, por lo que puedes limpiar tus piezas sin problema. Sin embargo, no recomendamos sumergirlos de forma prolongada ni usar agua muy caliente, ya que esto podría afectar la estructura o el color a largo plazo.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-4" className="border rounded-lg px-4 bg-white shadow-sm">
          <AccordionTrigger className="font-semibold text-lg hover:no-underline text-left">
            4. ¿Cómo debo cuidar mis productos de Nimvu?
          </AccordionTrigger>
          <AccordionContent className="text-gray-600 leading-relaxed text-base pt-2 space-y-2">
            <p>Para asegurar que tus piezas duren mucho tiempo, sigue estos consejos:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Evita el calor extremo:</strong> No dejes tus productos dentro de un carro bajo el sol o cerca de fuentes de calor intenso. El PLA puede empezar a ablandarse o deformarse a partir de los 55°C-60°C.</li>
              <li><strong>Limpieza:</strong> Usa un paño húmedo con agua tibia y jabón suave. Evita químicos fuertes o abrasivos.</li>
              <li><strong>Uso interior:</strong> Aunque son resistentes, están diseñados principalmente para uso en interiores.</li>
            </ul>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-5" className="border rounded-lg px-4 bg-white shadow-sm">
          <AccordionTrigger className="font-semibold text-lg hover:no-underline text-left">
            5. ¿Hacen diseños personalizados?
          </AccordionTrigger>
          <AccordionContent className="text-gray-600 leading-relaxed text-base pt-2">
            ¡Sí! En Nimvu nos encanta dar vida a tus ideas. Si buscas un color específico para tus sets o un diseño único que no ves en el catálogo, contáctanos por WhatsApp o Instagram para evaluar tu proyecto y darte una cotización.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-6" className="border rounded-lg px-4 bg-white shadow-sm">
          <AccordionTrigger className="font-semibold text-lg hover:no-underline text-left">
            6. ¿Por qué se ven pequeñas líneas en la superficie del producto?
          </AccordionTrigger>
          <AccordionContent className="text-gray-600 leading-relaxed text-base pt-2">
            Esa es la "huella digital" de la impresión 3D. Nuestros productos se crean capa por capa, lo que genera una textura única. Estas líneas son normales en el proceso de fabricación FDM y no afectan la resistencia ni la funcionalidad del artículo; al contrario, le dan ese carácter tecnológico y artesanal que nos define.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-7" className="border rounded-lg px-4 bg-white shadow-sm">
          <AccordionTrigger className="font-semibold text-lg hover:no-underline text-left">
            7. ¿Cuánto tiempo tarda en llegar mi pedido?
          </AccordionTrigger>
          <AccordionContent className="text-gray-600 leading-relaxed text-base pt-2 space-y-2">
            <p>Al ser muchos de nuestros productos fabricados bajo pedido para garantizar la mejor calidad:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Producción:</strong> Tardamos entre algunos días hábiles en tener listo tu pedido (dependiendo de la demanda y el modelo).</li>
              <li><strong>Envío:</strong> Una vez despachado, el tiempo de entrega en Bogotá es de 1 a 2 días hábiles, y para el resto de Colombia de 3 a 5 días hábiles.</li>
            </ul>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-8" className="border rounded-lg px-4 bg-white shadow-sm">
          <AccordionTrigger className="font-semibold text-lg hover:no-underline text-left">
            8. ¿Venden al por mayor para tiendas físicas?
          </AccordionTrigger>
          <AccordionContent className="text-gray-600 leading-relaxed text-base pt-2">
            ¡Claro que sí! Si tienes una tienda y quieres contar con nuestros productos, escríbenos a nuestro correo de contacto para conocer nuestras tarifas y condiciones para distribuidores.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-9" className="border rounded-lg px-4 bg-white shadow-sm">
          <AccordionTrigger className="font-semibold text-lg hover:no-underline text-left">
            9. ¿Los soportes son compatibles con todos los controles?
          </AccordionTrigger>
          <AccordionContent className="text-gray-600 leading-relaxed text-base pt-2">
            Nuestros stands están diseñados para ser universales y funcionan perfectamente con controles de PlayStation (PS4/PS5), Xbox (One/Series) y la mayoría de controles estándar del mercado. Si tienes un modelo muy específico, no dudes en consultarnos.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default FaqPage;
