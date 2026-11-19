import { useEffect, useRef, useState, type ReactNode } from 'react';
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';
import type { GameMap } from '../../data/maps';
import { MapImage } from '../../components/MapImage';
import { normalizePoint } from '../../lib/geometry';
import type { Point } from '../../lib/types';

/** Classe usada em elementos que não devem iniciar pan ao serem arrastados (ícones, vértices). */
export const NO_PAN = 'no-pan';

export interface MapClick {
  point: Point;
  /** Pixels de tela por unidade normalizada (largura renderizada do mapa). */
  pxPerUnit: number;
}

interface Props {
  map: GameMap;
  cursor?: string;
  onMapClick?: (click: MapClick) => void;
  onPointerMoveMap?: (point: Point) => void;
  /**
   * Conteúdo SVG em coordenadas normalizadas (viewBox 0 0 1 1).
   * `px` = tamanho de 1 pixel de tela em unidades normalizadas (use em strokeWidth para espessura fixa).
   */
  svgLayer?: (px: number) => ReactNode;
  /** Conteúdo HTML posicionado em % (use counterScale para manter tamanho fixo na tela). */
  htmlLayer?: (scale: number) => ReactNode;
}

/** Estilo para posicionar um elemento HTML no ponto normalizado, com tamanho constante em qualquer zoom. */
export function anchorStyle(p: Point, scale: number): React.CSSProperties {
  return {
    position: 'absolute',
    left: `${p.x * 100}%`,
    top: `${p.y * 100}%`,
    transform: `translate(-50%, -50%) scale(${1 / scale})`,
  };
}

export function MapCanvas({ map, cursor, onMapClick, onPointerMoveMap, svgLayer, htmlLayer }: Props) {
  const [scale, setScale] = useState(1);
  const surfaceRef = useRef<HTMLDivElement>(null);
  const downAt = useRef<{ x: number; y: number } | null>(null);
  const [baseWidth, setBaseWidth] = useState(800);

  useEffect(() => {
    const el = surfaceRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setBaseWidth(el.offsetWidth || 800));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const toPoint = (clientX: number, clientY: number) => {
    const rect = surfaceRef.current!.getBoundingClientRect();
    return { point: normalizePoint(clientX, clientY, rect), pxPerUnit: rect.width };
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-bg-2">
      <TransformWrapper
        minScale={1}
        maxScale={10}
        centerOnInit
        limitToBounds
        doubleClick={{ disabled: true }}
        wheel={{ step: 0.1 }}
        panning={{ excluded: [NO_PAN], velocityDisabled: true }}
        onTransform={(_, state) => setScale(state.scale)}
      >
        <TransformComponent
          wrapperStyle={{ width: '100%', height: '100%' }}
          contentStyle={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <div
            ref={surfaceRef}
            data-testid="map-surface"
            className="relative aspect-square h-full max-h-full max-w-full select-none"
            style={{ cursor }}
            onPointerDown={(e) => (downAt.current = { x: e.clientX, y: e.clientY })}
            onPointerMove={(e) => onPointerMoveMap?.(toPoint(e.clientX, e.clientY).point)}
            onClick={(e) => {
              const start = downAt.current;
              downAt.current = null;
              // Ignora o "click" que encerra um arraste (pan).
              if (start && Math.hypot(e.clientX - start.x, e.clientY - start.y) > 5) return;
              if ((e.target as HTMLElement).closest(`.${NO_PAN}`)) return;
              onMapClick?.(toPoint(e.clientX, e.clientY));
            }}
          >
            <MapImage map={map} className="pointer-events-none absolute inset-0 h-full w-full object-contain" />
            <svg
              className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
              viewBox="0 0 1 1"
              preserveAspectRatio="none"
            >
              {svgLayer?.(1 / (baseWidth * scale))}
            </svg>
            <div className="pointer-events-none absolute inset-0">{htmlLayer?.(scale)}</div>
          </div>
        </TransformComponent>
      </TransformWrapper>
    </div>
  );
}
