import { describe, expect, it } from 'vitest';
import { groupByProximity, normalizePoint, pointInPolygon, regionNameAt, polygonArea } from './geometry';

const square = [
  { x: 0.1, y: 0.1 },
  { x: 0.5, y: 0.1 },
  { x: 0.5, y: 0.5 },
  { x: 0.1, y: 0.5 },
];

describe('normalizePoint', () => {
  it('converte para 0..1 relativo ao retângulo, em qualquer escala', () => {
    const rect = { left: 100, top: 50, width: 400, height: 400 };
    expect(normalizePoint(300, 250, rect)).toEqual({ x: 0.5, y: 0.5 });
    expect(normalizePoint(100, 50, rect)).toEqual({ x: 0, y: 0 });
    const zoomed = { left: -200, top: -100, width: 1600, height: 1600 };
    expect(normalizePoint(600, 700, zoomed)).toEqual({ x: 0.5, y: 0.5 });
  });

  it('limita ao intervalo 0..1', () => {
    const rect = { left: 0, top: 0, width: 100, height: 100 };
    expect(normalizePoint(-10, 150, rect)).toEqual({ x: 0, y: 1 });
  });
});

describe('pointInPolygon', () => {
  it('detecta pontos dentro e fora', () => {
    expect(pointInPolygon({ x: 0.3, y: 0.3 }, square)).toBe(true);
    expect(pointInPolygon({ x: 0.6, y: 0.3 }, square)).toBe(false);
    expect(pointInPolygon({ x: 0.3, y: 0.05 }, square)).toBe(false);
  });

  it('funciona com polígono côncavo', () => {
    const l = [
      { x: 0, y: 0 },
      { x: 0.4, y: 0 },
      { x: 0.4, y: 0.2 },
      { x: 0.2, y: 0.2 },
      { x: 0.2, y: 0.4 },
      { x: 0, y: 0.4 },
    ];
    expect(pointInPolygon({ x: 0.1, y: 0.3 }, l)).toBe(true);
    expect(pointInPolygon({ x: 0.3, y: 0.3 }, l)).toBe(false);
  });

  it('polígono com menos de 3 pontos nunca contém', () => {
    expect(pointInPolygon({ x: 0, y: 0 }, [{ x: 0, y: 0 }])).toBe(false);
  });
});

describe('regionNameAt', () => {
  it('sugere a menor região que contém o ponto', () => {
    const regions = [
      { name: 'Bombsite A', points: square },
      {
        name: 'Varanda',
        points: [
          { x: 0.2, y: 0.2 },
          { x: 0.3, y: 0.2 },
          { x: 0.3, y: 0.3 },
          { x: 0.2, y: 0.3 },
        ],
      },
    ];
    expect(regionNameAt({ x: 0.25, y: 0.25 }, regions)).toBe('Varanda');
    expect(regionNameAt({ x: 0.45, y: 0.45 }, regions)).toBe('Bombsite A');
    expect(regionNameAt({ x: 0.9, y: 0.9 }, regions)).toBeNull();
  });

  it('calcula área', () => {
    expect(polygonArea(square)).toBeCloseTo(0.16);
  });
});

describe('groupByProximity', () => {
  const at = (x: number, y: number, id: string) => ({ id, p: { x, y } });

  it('agrupa pontos a menos de 1,5% e separa os distantes', () => {
    const items = [at(0.5, 0.5, 'a'), at(0.51, 0.5, 'b'), at(0.8, 0.8, 'c')];
    const groups = groupByProximity(items, (i) => i.p);
    expect(groups).toHaveLength(2);
    const big = groups.find((g) => g.items.length === 2)!;
    expect(big.items.map((i) => i.id).sort()).toEqual(['a', 'b']);
    expect(big.center.x).toBeCloseTo(0.505);
  });

  it('agrupa em cadeia', () => {
    const items = [at(0.5, 0.5, 'a'), at(0.51, 0.5, 'b'), at(0.52, 0.5, 'c')];
    expect(groupByProximity(items, (i) => i.p)).toHaveLength(1);
  });

  it('lista vazia', () => {
    expect(groupByProximity([], () => ({ x: 0, y: 0 }))).toEqual([]);
  });
});
