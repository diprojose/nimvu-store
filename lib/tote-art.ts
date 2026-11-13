/**
 * Arte del tote bag personalizable: reglas de la frase y cómo se acomoda
 * dentro del recuadro.
 *
 * Este archivo tiene un gemelo en el admin
 * (nimvu-react-admin/src/lib/tote-art.ts) que genera el archivo de impresión.
 * Los dos deben acomodar la frase igual: si aquí cambia una medida o la forma
 * de partir las líneas, hay que cambiarla allá, o el cliente recibe un bolso
 * distinto al que vio. Las reglas de validación también viven en el backend
 * (nimvu-be-nest/src/orders/custom-text.ts), que es quien tiene la última
 * palabra.
 */

export const CUSTOM_TEXT_MAX_LENGTH = 60;
export const CUSTOM_TEXT_MAX_LINES = 6;

const ALLOWED = /^[\p{L}\p{N} .,;:!?¡¿'"()\-&#@%+/\n]+$/u;

/**
 * Medidas del recuadro estampado, en unidades propias (1000 de ancho). Salen
 * de medir el tote "nadie me cae bien." para que el personalizado sea
 * indistinguible de los de la colección.
 */
export const TOTE_ART = {
  width: 1000,
  height: 1292,
  radius: 96,
  color: "#C5572E",
  textColor: "#FBF3E7",
  dotColor: "#141414",
  /** Margen izquierdo del texto; el derecho es el mismo. */
  textX: 100,
  /** Línea base del primer renglón, con la letra a tamaño completo. */
  firstBaseline: 254,
  /** Hasta dónde puede bajar el texto sin tocar el isologo. */
  textBottom: 1050,
  fontSize: 168,
  minFontSize: 96,
  fontStep: 6,
  lineHeight: 1.1,
  fontWeight: 600,
  /** Punto negro que cierra la frase, en proporción al tamaño de letra. */
  dotRadius: 0.092,
  dotGap: 0.14,
  /**
   * Isologo: esquina superior izquierda y escala sobre su trazado de 800. La
   * tienda no lo dibuja (ya viene en la foto); lo usa el arte de impresión.
   */
  logoX: 790,
  logoY: 1113,
  logoScale: 0.144,
} as const;

/**
 * Deja la frase como se va a estampar: sin espacios sobrantes, sin líneas
 * vacías y sin punto final, porque el diseño siempre cierra con el punto negro
 * de Nimvu y escribirlo daría dos.
 */
export function normalizeCustomText(raw: string): string {
  return raw
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join("\n")
    .replace(/\.+$/, "")
    .trim();
}

/** Mensaje de error para mostrarle al cliente, o `null` si la frase sirve. */
export function customTextError(raw: string): string | null {
  const text = normalizeCustomText(raw);
  if (!text) return "Escribe tu frase para verla en el bolso.";
  if (text.length > CUSTOM_TEXT_MAX_LENGTH) {
    return `La frase puede tener máximo ${CUSTOM_TEXT_MAX_LENGTH} caracteres.`;
  }
  if (text.split("\n").length > CUSTOM_TEXT_MAX_LINES) {
    return `La frase puede tener máximo ${CUSTOM_TEXT_MAX_LINES} líneas.`;
  }
  if (!ALLOWED.test(text)) {
    return "Usa solo letras, números y signos de puntuación (sin emojis).";
  }
  return null;
}

export interface ToteLayout {
  fontSize: number;
  lines: string[];
  /** Ancho del último renglón, para saber dónde va el punto negro. */
  lastLineWidth: number;
}

/**
 * Ancho de un texto en "em" (múltiplos del tamaño de letra). Lo da quien
 * dibuja, porque depende de la tipografía ya cargada en el navegador.
 */
export type MeasureEm = (text: string) => number;

/**
 * Acomoda la frase en el recuadro: parte los renglones por palabras y, si no
 * cabe, baja el tamaño de letra hasta que quepa. Devuelve `null` si ni con la
 * letra más pequeña entra (una palabra larguísima, por ejemplo).
 *
 * `text` debe venir normalizado. Los saltos de línea del cliente se respetan.
 */
export function layoutToteText(text: string, measure: MeasureEm): ToteLayout | null {
  const { fontSize, minFontSize, fontStep, lineHeight, textX, width } = TOTE_ART;
  const maxWidth = width - textX * 2;
  const maxHeight = TOTE_ART.textBottom - TOTE_ART.firstBaseline;
  // El punto negro ocupa sitio al final del último renglón.
  const dotEm = TOTE_ART.dotGap + TOTE_ART.dotRadius * 2;
  const paragraphs = text.split("\n");

  for (let size = fontSize; size >= minFontSize; size -= fontStep) {
    const limit = maxWidth / size;
    const lines: string[] = [];
    let fits = true;

    paragraphs.forEach((paragraph, p) => {
      const isLastParagraph = p === paragraphs.length - 1;
      const words = paragraph.split(" ");
      let current = "";

      words.forEach((word, w) => {
        const isLastWord = isLastParagraph && w === words.length - 1;
        const candidate = current ? `${current} ${word}` : word;
        const extra = isLastWord ? dotEm : 0;

        if (measure(candidate) + extra <= limit) {
          current = candidate;
          return;
        }
        if (current) lines.push(current);
        current = word;
        if (measure(word) + extra > limit) fits = false;
      });

      if (current) lines.push(current);
    });

    const height = (lines.length - 1) * size * lineHeight;
    if (fits && height <= maxHeight) {
      return {
        fontSize: size,
        lines,
        lastLineWidth: measure(lines[lines.length - 1]) * size,
      };
    }
  }

  return null;
}
