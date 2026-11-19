import { useEffect, useState } from 'react';
import { imageUrl } from '../lib/image';
import { useEscape } from '../lib/useEscape';

interface Props {
  imageIds: string[];
  startIndex: number;
  onClose: () => void;
}

/** Visualizador de imagem em tela cheia. Esc fecha, setas navegam. */
export function Lightbox({ imageIds, startIndex, onClose }: Props) {
  const [index, setIndex] = useState(startIndex);
  const many = imageIds.length > 1;
  const go = (delta: number) => setIndex((i) => (i + delta + imageIds.length) % imageIds.length);

  useEscape(onClose);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <div
      role="dialog"
      aria-label="Imagem ampliada"
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 p-6"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <img src={imageUrl(imageIds[index])} alt="" className="max-h-full max-w-full rounded-lg shadow-2xl" />
      <button
        type="button"
        onClick={onClose}
        aria-label="Fechar"
        className="absolute top-4 right-5 text-3xl leading-none text-white/70 hover:text-white"
      >
        ×
      </button>
      {many && (
        <>
          <button
            type="button"
            aria-label="Anterior"
            onClick={() => go(-1)}
            className="absolute top-1/2 left-4 -translate-y-1/2 rounded-full bg-white/10 px-3 py-2 text-2xl text-white hover:bg-white/20"
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="Próxima"
            onClick={() => go(1)}
            className="absolute top-1/2 right-4 -translate-y-1/2 rounded-full bg-white/10 px-3 py-2 text-2xl text-white hover:bg-white/20"
          >
            ›
          </button>
          <span className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm text-white/70">
            {index + 1} / {imageIds.length}
          </span>
        </>
      )}
    </div>
  );
}
