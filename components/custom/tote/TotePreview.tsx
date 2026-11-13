"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Open_Sans } from "next/font/google";
import {
  MeasureEm,
  TOTE_ART,
  ToteLayout,
  layoutToteText,
  normalizeCustomText,
} from "@/lib/tote-art";

// Tipografía del estampado. Se declara aquí y no en el layout raíz para que
// solo la descarguen las páginas que muestran el personalizador.
const toteFont = Open_Sans({ subsets: ["latin"], weight: ["600"], display: "swap" });

/**
 * Foto del bolso con el recuadro y el isologo ya estampados, pero sin frase, y
 * dónde cae el recuadro en ella, en píxeles de una foto de 1000×1000. Si se
 * cambia la foto, se vuelven a medir estos tres números y nada más.
 */
const MOCKUP = {
  src: "/personalizable/tote-base.jpg",
  size: 1000,
  patchX: 359,
  patchY: 482,
  patchWidth: 291,
};

/** Lo que se ve en el bolso mientras el cliente no ha escrito nada. */
const PLACEHOLDER = "tu frase aquí";

/** Ancho aproximado, para antes de que cargue la tipografía. */
const estimateMeasure: MeasureEm = (text) => text.length * 0.57;

/** Ancho real, medido con la tipografía del estampado ya cargada. */
function canvasMeasure(): MeasureEm {
  const ctx = document.createElement("canvas").getContext("2d");
  if (!ctx) return estimateMeasure;
  ctx.font = `${TOTE_ART.fontWeight} 100px ${toteFont.style.fontFamily}`;
  return (text) => ctx.measureText(text).width / 100;
}

/**
 * Acomoda la frase en el recuadro. Mide con la tipografía real en cuanto el
 * navegador la tiene; antes (y en el servidor) usa un ancho aproximado, que
 * solo dura un instante y evita que el recuadro aparezca vacío.
 */
function useToteLayout(rawText: string): { layout: ToteLayout | null; isPlaceholder: boolean } {
  const [fontReady, setFontReady] = useState(false);

  useEffect(() => {
    let active = true;
    const font = `${TOTE_ART.fontWeight} 100px ${toteFont.style.fontFamily}`;
    document.fonts
      .load(font)
      .catch(() => undefined)
      .then(() => {
        if (active) setFontReady(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const measure = useMemo(() => (fontReady ? canvasMeasure() : estimateMeasure), [fontReady]);

  const text = normalizeCustomText(rawText);
  const layout = useMemo(() => layoutToteText(text || PLACEHOLDER, measure), [text, measure]);

  return { layout, isPlaceholder: !text };
}

interface TotePreviewProps {
  /** Lo que el cliente lleva escrito, sin normalizar. */
  text: string;
  /**
   * Avisa cómo quedó partida la frase: los renglones tal como se ven, `[]` si
   * aún no hay frase, o `null` si no cabe. Solo quien dibuja puede saberlo.
   */
  onLinesChange?: (lines: string[] | null) => void;
  priority?: boolean;
  sizes?: string;
}

/** El bolso con la frase del cliente dibujada encima, tal como se estampa. */
export default function TotePreview({ text, onLinesChange, priority, sizes }: TotePreviewProps) {
  const { layout, isPlaceholder } = useToteLayout(text);
  // Se compara como texto para no avisar en cada render con un arreglo nuevo.
  const linesKey = !layout ? null : isPlaceholder ? "" : layout.lines.join("\n");

  useEffect(() => {
    onLinesChange?.(linesKey === null ? null : linesKey ? linesKey.split("\n") : []);
  }, [linesKey, onLinesChange]);

  const scale = MOCKUP.patchWidth / TOTE_ART.width;
  const label = layout && !isPlaceholder
    ? `Vista previa del bolso con la frase: ${layout.lines.join(" ")}.`
    : "Vista previa del bolso personalizable";

  return (
    <div className="relative w-full aspect-square bg-gray-100 rounded-lg overflow-hidden">
      <Image
        src={MOCKUP.src}
        alt=""
        fill
        priority={priority}
        sizes={sizes}
        className="object-cover"
      />
      <svg
        viewBox={`0 0 ${MOCKUP.size} ${MOCKUP.size}`}
        className="absolute inset-0 h-full w-full"
        role="img"
        aria-label={label}
      >
        <g transform={`translate(${MOCKUP.patchX} ${MOCKUP.patchY}) scale(${scale})`}>
          <ToteArt layout={layout} isPlaceholder={isPlaceholder} />
        </g>
      </svg>
    </div>
  );
}

/**
 * La frase y su punto, en las unidades de TOTE_ART. El recuadro y el isologo
 * no se dibujan: son los de la foto, con la textura real de la tela.
 */
function ToteArt({ layout, isPlaceholder }: { layout: ToteLayout | null; isPlaceholder?: boolean }) {
  const a = TOTE_ART;
  const lineStep = layout ? layout.fontSize * a.lineHeight : 0;
  const lastBaseline = layout ? a.firstBaseline + (layout.lines.length - 1) * lineStep : 0;
  const dotR = layout ? layout.fontSize * a.dotRadius : 0;

  return (
    <>
      {layout && (
        <g opacity={isPlaceholder ? 0.45 : 1}>
          <text
            fill={a.textColor}
            fontSize={layout.fontSize}
            fontWeight={a.fontWeight}
            style={{ fontFamily: toteFont.style.fontFamily }}
          >
            {layout.lines.map((line, i) => (
              <tspan key={i} x={a.textX} y={a.firstBaseline + i * lineStep}>
                {line}
              </tspan>
            ))}
          </text>
          <circle
            cx={a.textX + layout.lastLineWidth + layout.fontSize * a.dotGap + dotR}
            cy={lastBaseline - dotR}
            r={dotR}
            fill={a.dotColor}
          />
        </g>
      )}
    </>
  );
}
