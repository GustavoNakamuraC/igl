import { api } from './api';
import { tracked } from './statusStore';

export const imageUrl = (id: string) => `/api/images/${id}`;

/** Tamanhos máximos (maior lado, em px) usados ao comprimir. */
export const PHOTO_MAX = 512;
export const PRINT_MAX = 1600;

/** Dimensões finais mantendo a proporção, sem nunca aumentar a imagem. */
export function fitWithin(width: number, height: number, max: number): { width: number; height: number } {
  const scale = Math.min(1, max / Math.max(width, height));
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) };
}

/**
 * Reduz e converte a imagem para WebP no navegador antes de enviar,
 * para não pesar no banco (um print 1600px fica tipicamente entre 100 e 250 KB).
 */
export async function compressImage(file: File, max: number, quality = 0.8): Promise<Blob> {
  if (!file.type.startsWith('image/')) throw new Error('O arquivo escolhido não é uma imagem.');
  const bitmap = await createImageBitmap(file);
  const { width, height } = fitWithin(bitmap.width, bitmap.height, max);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Não foi possível processar a imagem.');
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', quality));
  if (!blob) throw new Error('Não foi possível comprimir a imagem.');
  return blob;
}

/** Comprime e envia; devolve o id da imagem salva. */
export async function uploadImage(file: File, max: number): Promise<string> {
  const blob = await compressImage(file, max);
  const form = new FormData();
  form.append('file', blob, 'image.webp');
  const res = await tracked(() => api<{ id: string }>('/images', { method: 'POST', body: form }));
  return res.id;
}
