import { centroid } from '../../lib/geometry';
import type { Point, Region } from '../../lib/types';
import { anchorStyle, NO_PAN } from '../maps/MapCanvas';

const pointsAttr = (pts: Point[]) => pts.map((p) => `${p.x},${p.y}`).join(' ');

export function RegionShapes({ regions, highlightedId, hiddenId, px }: { regions: Region[]; highlightedId: string | null; hiddenId?: string; px: number }) {
  return (
    <g>
      {regions
        .filter((r) => r.id !== hiddenId)
        .map((r) => {
          const hl = r.id === highlightedId;
          return (
            <polygon
              key={r.id}
              points={pointsAttr(r.points)}
              fill="var(--color-region)"
              fillOpacity={hl ? 0.28 : 0.1}
              stroke="var(--color-region)"
              strokeOpacity={hl ? 1 : 0.55}
              strokeWidth={(hl ? 2 : 1.25) * px}
              strokeLinejoin="round"
            />
          );
        })}
    </g>
  );
}

export function RegionLabels({ regions, scale, hiddenId }: { regions: Region[]; scale: number; hiddenId?: string }) {
  return (
    <>
      {regions
        .filter((r) => r.id !== hiddenId)
        .map((r) => (
          <div
            key={r.id}
            style={anchorStyle(centroid(r.points), scale)}
            className="rounded bg-black/55 px-1.5 py-0.5 text-[11px] font-semibold whitespace-nowrap text-[var(--color-region)] shadow"
          >
            {r.name}
          </div>
        ))}
    </>
  );
}

/** Polígono em construção (modo "Nomear região"). */
export function DraftPolygon({ points, cursor, closed, px }: { points: Point[]; cursor: Point | null; closed?: boolean; px: number }) {
  if (points.length === 0) return null;
  const path = closed || !cursor ? points : [...points, cursor];
  return (
    <g>
      {closed || points.length < 2 ? null : (
        <polygon points={pointsAttr(points)} fill="var(--color-accent)" fillOpacity={0.12} stroke="none" />
      )}
      {closed ? (
        <polygon
          points={pointsAttr(points)}
          fill="var(--color-accent)"
          fillOpacity={0.2}
          stroke="var(--color-accent)"
          strokeWidth={2 * px}
        />
      ) : (
        <polyline
          points={pointsAttr(path)}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth={2 * px}
          strokeDasharray={`${6 * px} ${4 * px}`}
        />
      )}
    </g>
  );
}

interface VerticesProps {
  points: Point[];
  scale: number;
  /** Destaca o primeiro vértice (fechar polígono). */
  highlightFirst?: boolean;
  /** Se definido, os vértices podem ser arrastados. */
  onMove?: (index: number, p: Point) => void;
  onRemove?: (index: number) => void;
}

export function Vertices({ points, scale, highlightFirst, onMove, onRemove }: VerticesProps) {
  const startDrag = (index: number) => (e: React.PointerEvent<HTMLDivElement>) => {
    if (!onMove) return;
    e.stopPropagation();
    const el = e.currentTarget;
    const surface = el.closest('[data-testid="map-surface"]') as HTMLElement;
    el.setPointerCapture(e.pointerId);
    const move = (ev: PointerEvent) => {
      const rect = surface.getBoundingClientRect();
      onMove(index, {
        x: Math.min(1, Math.max(0, (ev.clientX - rect.left) / rect.width)),
        y: Math.min(1, Math.max(0, (ev.clientY - rect.top) / rect.height)),
      });
    };
    const up = () => {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up);
    };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
  };

  return (
    <>
      {points.map((p, i) => {
        const first = highlightFirst && i === 0 && points.length >= 3;
        return (
          <div
            key={i}
            style={anchorStyle(p, scale)}
            onPointerDown={startDrag(i)}
            onDoubleClick={(e) => {
              e.stopPropagation();
              onRemove?.(i);
            }}
            title={onMove ? 'Arraste para mover · duplo clique para remover' : first ? 'Clique para fechar' : undefined}
            className={`${onMove ? `${NO_PAN} pointer-events-auto cursor-grab` : ''} rounded-full border-2 border-black ${
              first ? 'h-4 w-4 bg-white ring-2 ring-accent' : 'h-3 w-3 bg-accent'
            }`}
          />
        );
      })}
    </>
  );
}
