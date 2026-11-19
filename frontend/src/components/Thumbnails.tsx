import { useState } from 'react';
import { imageUrl } from '../lib/image';
import { Lightbox } from './Lightbox';

interface Props {
  imageIds: string[];
  /** Se definido, mostra um × em cada miniatura. */
  onRemove?: (id: string) => void;
  size?: number;
}

export function Thumbnails({ imageIds, onRemove, size = 72 }: Props) {
  const [open, setOpen] = useState<number | null>(null);
  if (imageIds.length === 0) return null;
  return (
    <>
      <ul className="flex flex-wrap gap-2">
        {imageIds.map((id, i) => (
          <li key={id} className="relative">
            <button
              type="button"
              onClick={() => setOpen(i)}
              className="block overflow-hidden rounded-md border border-border hover:border-accent"
              style={{ width: size, height: size }}
              aria-label={`Ver imagem ${i + 1}`}
            >
              <img src={imageUrl(id)} alt="" className="h-full w-full object-cover" loading="lazy" />
            </button>
            {onRemove && (
              <button
                type="button"
                onClick={() => onRemove(id)}
                aria-label={`Remover imagem ${i + 1}`}
                className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full border border-border bg-surface text-xs text-muted hover:text-danger"
              >
                ×
              </button>
            )}
          </li>
        ))}
      </ul>
      {open !== null && <Lightbox imageIds={imageIds} startIndex={open} onClose={() => setOpen(null)} />}
    </>
  );
}
