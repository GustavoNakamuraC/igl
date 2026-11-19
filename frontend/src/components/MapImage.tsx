import { useState, type ImgHTMLAttributes } from 'react';
import type { GameMap } from '../data/maps';

/** Mostra public/maps/<slug>.png; se não existir, usa o placeholder SVG. */
export function MapImage({ map, ...rest }: { map: GameMap } & ImgHTMLAttributes<HTMLImageElement>) {
  const [src, setSrc] = useState(map.imageUrl);
  return (
    <img
      src={src}
      alt={`Radar de ${map.name}`}
      draggable={false}
      onError={() => setSrc(map.placeholderUrl)}
      {...rest}
    />
  );
}
