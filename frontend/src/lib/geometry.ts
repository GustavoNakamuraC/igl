import type { Point } from './types';

/** Raio de agrupamento dos pontos finais, em fração da largura do mapa (1,5%). */
export const GROUP_RADIUS = 0.015;

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** Converte uma posição de tela para coordenada normalizada (0..1) dentro do retângulo do mapa. */
export function normalizePoint(clientX: number, clientY: number, rect: DOMRect | { left: number; top: number; width: number; height: number }): Point {
  return {
    x: clamp01((clientX - rect.left) / rect.width),
    y: clamp01((clientY - rect.top) / rect.height),
  };
}

export function distance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/** Ray casting: o ponto está dentro do polígono? */
export function pointInPolygon(p: Point, polygon: Point[]): boolean {
  if (polygon.length < 3) return false;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const a = polygon[i];
    const b = polygon[j];
    const crosses = a.y > p.y !== b.y > p.y && p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x;
    if (crosses) inside = !inside;
  }
  return inside;
}

/** Nome da primeira região (a menor, se houver sobreposição) que contém o ponto. */
export function regionNameAt<R extends { name: string; points: Point[] }>(p: Point, regions: R[]): string | null {
  const hits = regions.filter((r) => pointInPolygon(p, r.points));
  if (hits.length === 0) return null;
  hits.sort((a, b) => polygonArea(a.points) - polygonArea(b.points));
  return hits[0].name;
}

export function polygonArea(points: Point[]): number {
  let sum = 0;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    sum += (points[j].x + points[i].x) * (points[j].y - points[i].y);
  }
  return Math.abs(sum / 2);
}

export function centroid(points: Point[]): Point {
  if (points.length === 0) return { x: 0, y: 0 };
  const sx = points.reduce((s, p) => s + p.x, 0);
  const sy = points.reduce((s, p) => s + p.y, 0);
  return { x: sx / points.length, y: sy / points.length };
}

export interface Group<T> {
  /** Posição do ícone (média dos pontos do grupo). */
  center: Point;
  items: T[];
}

/**
 * Agrupa itens cujo ponto está a menos de `radius` de algum item do grupo
 * (ligação simples: A perto de B e B perto de C ficam juntos).
 */
export function groupByProximity<T>(items: T[], getPoint: (item: T) => Point, radius = GROUP_RADIUS): Group<T>[] {
  const n = items.length;
  const parent = Array.from({ length: n }, (_, i) => i);
  const find = (i: number): number => (parent[i] === i ? i : (parent[i] = find(parent[i])));

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (distance(getPoint(items[i]), getPoint(items[j])) < radius) {
        parent[find(i)] = find(j);
      }
    }
  }

  const buckets = new Map<number, T[]>();
  items.forEach((item, i) => {
    const root = find(i);
    const list = buckets.get(root);
    if (list) list.push(item);
    else buckets.set(root, [item]);
  });

  return [...buckets.values()].map((groupItems) => ({
    items: groupItems,
    center: centroid(groupItems.map(getPoint)),
  }));
}
