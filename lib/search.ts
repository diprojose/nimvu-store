/**
 * Búsqueda de productos del header.
 *
 * El catálogo es corto (decenas de productos), así que se busca en el
 * navegador sobre un índice liviano que se descarga una sola vez: cada tecla
 * responde al instante y el backend no recibe una petición por letra.
 * Las mismas funciones filtran /productos?q= en el servidor, para que "Ver
 * todos los resultados" muestre exactamente lo mismo que el panel.
 */

import type { FrontendProduct } from "@/lib/api";

export interface SearchItem {
  id: string;
  title: string;
  slug: string;
  thumbnail: string;
  price: number;
  discountPrice?: number;
  discountEndDate?: string | null;
  stock: number;
  category?: string;
  universe?: string;
  /** Nombres de las variantes (casi siempre colores: "Verde Rosada", "Morada"). */
  variants: string[];
}

export interface SearchResult {
  item: SearchItem;
  score: number;
  /** Rangos [inicio, fin) del título que coinciden con la búsqueda, para resaltarlos. */
  highlights: [number, number][];
}

/** Solo los campos que el buscador usa: el índice completo pesa pocos KB. */
export function toSearchItem(p: FrontendProduct): SearchItem {
  return {
    id: p.id,
    title: p.title,
    slug: p.slug || p.id,
    thumbnail: p.thumbnail,
    price: p.price,
    discountPrice: p.discountPrice,
    discountEndDate: p.discountEndDate,
    stock: p.stock,
    category: p.category?.name,
    universe: p.universe?.name,
    variants: p.variants.map((v) => v.title).filter(Boolean),
  };
}

// Palabras que no ayudan a encontrar nada: "soporte para control" debe
// comportarse igual que "soporte control".
const STOP_WORDS = new Set([
  "de", "del", "la", "las", "el", "los", "un", "una", "para", "por", "con",
  "y", "o", "en", "a", "al", "x", "set",
]);

// Cómo lo escribe la gente -> cómo aparece en el catálogo. Ya normalizado
// (sin tildes, en minúscula y en singular).
const SYNONYMS: Record<string, string[]> = {
  posavaso: ["portavaso"],
  vaso: ["portavaso"],
  kpop: ["kpop", "bts", "army", "lightstick"],
  army: ["army", "bts"],
  luz: ["lampara", "iluminacion"],
  mando: ["control", "mando"],
  joystick: ["control"],
  pokemon: ["psyduck", "squirtle"],
  diadema: ["audifono"],
  auricular: ["audifono"],
  headset: ["audifono"],
  matera: ["monstera", "anturio", "cactus", "planta"],
  maceta: ["monstera", "anturio", "cactus", "planta"],
  planta: ["planta", "monstera", "anturio", "cactus"],
  flor: ["anturio"],
  rosa: ["rosada", "rosa"],
  rosado: ["rosada"],
  morado: ["morada", "morado"],
  blanco: ["blanca", "blanco"],
  servilleta: ["servilletero"],
};

const COMBINING_MARKS = /[̀-ͯ]/g;

/**
 * Minúsculas y sin tildes, carácter por carácter, para que cada posición del
 * texto normalizado corresponda a la misma posición del original. Eso permite
 * resaltar el título real ("Lámpara") a partir de una búsqueda sin tilde.
 */
export function normalize(text: string): string {
  let out = "";
  for (const ch of text) {
    const base = ch.normalize("NFD").replace(COMBINING_MARKS, "").toLowerCase();
    // Hay caracteres que en minúscula cambian de largo; se conservan tal cual
    // para no desalinear los índices.
    out += base.length === ch.length ? base : ch;
  }
  return out;
}

/** Plural simple del español: "lamparas" -> "lampara", "controles" -> "control". */
function singular(word: string): string {
  if (word.length > 5 && /[lrndz]es$/.test(word)) return word.slice(0, -2);
  if (word.length > 3 && word.endsWith("s") && !word.endsWith("ss")) return word.slice(0, -1);
  return word;
}

interface Word {
  text: string;
  start: number;
}

function words(normalized: string): Word[] {
  const out: Word[] = [];
  for (const m of normalized.matchAll(/[a-z0-9ñ]+/g)) {
    out.push({ text: m[0], start: m.index ?? 0 });
  }
  return out;
}

export function queryTokens(query: string): string[] {
  const normalized = normalize(query).replace(/k[\s-]?pop/g, "kpop");
  const all = words(normalized).map((w) => w.text);
  const meaningful = all.filter((t) => !STOP_WORDS.has(t));
  // Si alguien escribe solo "set" o "de", mejor buscar eso que nada.
  return (meaningful.length ? meaningful : all).map(singular);
}

function levenshtein(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const curr = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
      rowMin = Math.min(rowMin, curr[j]);
    }
    if (rowMin > max) return max + 1;
    prev = curr;
  }
  return prev[b.length];
}

/**
 * Qué tan bien coincide un término con una palabra del producto:
 * 3 exacta, 2 empieza igual (mientras se escribe), 1 con un error de dedo, 0 nada.
 * Devuelve también cuántas letras de la palabra resaltar.
 */
function matchWord(term: string, word: string): { score: number; length: number } {
  const w = singular(word);
  if (w === term || word === term) return { score: 3, length: word.length };
  if (word.startsWith(term)) return { score: 2, length: term.length };
  if (term.length >= 5) {
    const max = term.length >= 8 ? 2 : 1;
    if (levenshtein(term, w, max) <= max) return { score: 1, length: word.length };
    // También mientras se escribe: "monsterr" contra el inicio de "monstera".
    if (word.length > term.length && levenshtein(term, word.slice(0, term.length), 1) <= 1) {
      return { score: 1, length: term.length };
    }
  }
  return { score: 0, length: 0 };
}

interface Field {
  words: Word[];
  weight: number;
  isTitle: boolean;
}

function fieldsOf(item: SearchItem): Field[] {
  return [
    { words: words(normalize(item.title)), weight: 3, isTitle: true },
    { words: words(normalize(`${item.category ?? ""} ${item.universe ?? ""}`)), weight: 2, isTitle: false },
    { words: words(normalize(item.variants.join(" "))), weight: 1, isTitle: false },
  ];
}

function scoreItem(item: SearchItem, tokens: string[]): SearchResult | null {
  const fields = fieldsOf(item);
  const highlights: [number, number][] = [];
  let total = 0;

  for (const token of tokens) {
    const alternatives = [token, ...(SYNONYMS[token] ?? [])];
    let best = 0;
    for (const term of alternatives) {
      for (const field of fields) {
        for (const word of field.words) {
          const { score, length } = matchWord(term, word.text);
          if (!score) continue;
          // El término tal cual pesa más que su sinónimo.
          const weighted = score * field.weight * (term === token ? 1 : 0.8);
          best = Math.max(best, weighted);
          if (field.isTitle) highlights.push([word.start, word.start + length]);
        }
      }
    }
    // Todas las palabras de la búsqueda deben aparecer: "monstera verde"
    // muestra solo lo que tiene las dos.
    if (!best) return null;
    total += best;
  }

  return { item, score: total, highlights: mergeRanges(highlights) };
}

function mergeRanges(ranges: [number, number][]): [number, number][] {
  const sorted = [...ranges].sort((a, b) => a[0] - b[0]);
  const out: [number, number][] = [];
  for (const r of sorted) {
    const last = out[out.length - 1];
    if (last && r[0] <= last[1]) last[1] = Math.max(last[1], r[1]);
    else out.push([r[0], r[1]]);
  }
  return out;
}

export function searchProducts(items: SearchItem[], query: string): SearchResult[] {
  const tokens = queryTokens(query);
  if (!tokens.length) return [];

  const phrase = normalize(query.trim());
  return items
    .map((item, index) => ({ result: scoreItem(item, tokens), index }))
    .filter((r): r is { result: SearchResult; index: number } => r.result !== null)
    .map(({ result, index }) => {
      // Si el título empieza con lo escrito, es casi seguro lo que busca.
      if (normalize(result.item.title).startsWith(phrase)) result.score += 5;
      return { result, index };
    })
    .sort(
      (a, b) =>
        b.result.score - a.result.score ||
        // A igual relevancia, primero lo que se puede comprar ya.
        Number(b.result.item.stock > 0) - Number(a.result.item.stock > 0) ||
        a.index - b.index,
    )
    .map(({ result }) => result);
}

/** Parte un título en trozos normales y resaltados según los rangos. */
export function splitHighlights(
  text: string,
  ranges: [number, number][],
): { text: string; match: boolean }[] {
  const parts: { text: string; match: boolean }[] = [];
  let cursor = 0;
  for (const [start, end] of ranges) {
    if (start > cursor) parts.push({ text: text.slice(cursor, start), match: false });
    parts.push({ text: text.slice(start, end), match: true });
    cursor = end;
  }
  if (cursor < text.length) parts.push({ text: text.slice(cursor), match: false });
  return parts;
}
