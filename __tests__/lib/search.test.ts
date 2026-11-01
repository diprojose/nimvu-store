import { describe, it, expect } from 'vitest';
import { normalize, queryTokens, searchProducts, splitHighlights, SearchItem } from '@/lib/search';

const item = (title: string, extra: Partial<SearchItem> = {}): SearchItem => ({
  id: title,
  title,
  slug: title.toLowerCase().replace(/\s+/g, '-'),
  thumbnail: '',
  price: 50000,
  stock: 5,
  variants: [],
  ...extra,
});

const catalog: SearchItem[] = [
  item('Portavasos Planta Monstera de Mesa Set X6', {
    category: 'Portavasos',
    universe: 'Hogar',
    variants: ['Verde Blanca', 'Azul', 'Verde Rosada', 'Morado'],
  }),
  item('Portavasos Anturio De Mesa Set X6', { category: 'Portavasos', universe: 'Hogar' }),
  item('Lámpara Aura — Colección de Iluminación Nimvu', { category: 'Iluminación', universe: 'Hogar' }),
  item('Lámpara Luma — Colección de Iluminación Nimvu', { category: 'Iluminación', universe: 'Hogar', stock: 0 }),
  item('Soporte Army Bomb - Logo BTS', { category: 'Exhibidores', universe: 'Kpop' }),
  item('Soporte Para Control Ps5 Gamer Accesorio Para Mando', { category: 'Controles', universe: 'Gamer' }),
  item('Portavaso Psyduck', { category: 'Setup', universe: 'Gamer' }),
];

const titles = (q: string) => searchProducts(catalog, q).map((r) => r.item.title);

describe('normalize', () => {
  it('quita tildes sin cambiar el largo del texto', () => {
    expect(normalize('Lámpara Iluminación')).toBe('lampara iluminacion');
    expect(normalize('Lámpara').length).toBe('Lámpara'.length);
  });
});

describe('queryTokens', () => {
  it('ignora palabras vacías y pasa a singular', () => {
    expect(queryTokens('soporte para controles')).toEqual(['soporte', 'control']);
    expect(queryTokens('Lámparas')).toEqual(['lampara']);
  });

  it('une k-pop en una sola palabra', () => {
    expect(queryTokens('K-POP')).toEqual(['kpop']);
  });
});

describe('searchProducts', () => {
  it('encuentra sin tildes ni mayúsculas', () => {
    expect(titles('lampara')).toHaveLength(2);
  });

  it('encuentra mientras se escribe', () => {
    expect(titles('monst')[0]).toMatch(/Monstera/);
  });

  it('busca en los colores de las variantes', () => {
    expect(titles('rosada')).toEqual(['Portavasos Planta Monstera de Mesa Set X6']);
  });

  it('exige todas las palabras', () => {
    expect(titles('monstera verde')).toEqual(['Portavasos Planta Monstera de Mesa Set X6']);
    expect(titles('anturio verde')).toEqual([]);
  });

  it('tolera un error de dedo', () => {
    expect(titles('monsterra')[0]).toMatch(/Monstera/);
    expect(titles('anturo')[0]).toMatch(/Anturio/);
  });

  it('entiende sinónimos', () => {
    expect(titles('posavasos').length).toBeGreaterThan(0);
    expect(titles('kpop')).toEqual(['Soporte Army Bomb - Logo BTS']);
    expect(titles('pokemon')).toEqual(['Portavaso Psyduck']);
  });

  it('pone primero lo que tiene stock', () => {
    expect(titles('lampara')).toEqual([
      'Lámpara Aura — Colección de Iluminación Nimvu',
      'Lámpara Luma — Colección de Iluminación Nimvu',
    ]);
  });

  it('no devuelve nada con una búsqueda vacía', () => {
    expect(titles('   ')).toEqual([]);
  });

  it('resalta la parte del título que coincide', () => {
    const [first] = searchProducts(catalog, 'lamp');
    const parts = splitHighlights(first.item.title, first.highlights);
    expect(parts[0]).toEqual({ text: 'Lámp', match: true });
  });
});
