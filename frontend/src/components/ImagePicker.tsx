import { useRef, useState, type ReactNode } from 'react';
import { errorMessage } from '../lib/api';
import { uploadImage } from '../lib/image';

/** Comprime e envia arquivos de imagem, controlando quantos ainda estão subindo. */
export function useImageUpload(maxSize: number, onUploaded: (ids: string[]) => void) {
  const [busy, setBusy] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const upload = async (files: File[]) => {
    if (files.length === 0) return;
    setError(null);
    setBusy((b) => b + files.length);
    const ids: string[] = [];
    for (const f of files) {
      try {
        ids.push(await uploadImage(f, maxSize));
      } catch (e) {
        setError(errorMessage(e));
      }
      setBusy((b) => b - 1);
    }
    if (ids.length) onUploaded(ids);
  };

  return { busy, error, upload };
}

interface Props {
  multiple?: boolean;
  upload: (files: File[]) => Promise<void>;
  children: (open: () => void) => ReactNode;
}

/** Abre o seletor de arquivos; o visual do botão vem do chamador. */
export function ImagePicker({ multiple, upload, children }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <>
      {children(() => inputRef.current?.click())}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        className="hidden"
        data-testid="image-input"
        onChange={(e) => {
          const files = [...(e.target.files ?? [])];
          e.target.value = '';
          void upload(files);
        }}
      />
    </>
  );
}

/** Extrai imagens coladas (Ctrl+V de um print). */
export function imagesFromClipboard(e: React.ClipboardEvent): File[] {
  return [...e.clipboardData.items]
    .filter((i) => i.kind === 'file' && i.type.startsWith('image/'))
    .map((i) => i.getAsFile())
    .filter((f): f is File => f !== null);
}
