import { SIDE_LABELS, sideColorVar, type GrenadeSide } from '../../lib/types';

/** Etiqueta CT (azul), TR (amarelo) ou Ambos (meio a meio). */
export function SideBadge({ side, className = '' }: { side: GrenadeSide; className?: string }) {
  const background =
    side === 'both'
      ? `linear-gradient(90deg, ${sideColorVar('ct')} 50%, ${sideColorVar('tr')} 50%)`
      : sideColorVar(side);
  return (
    <span
      className={`inline-flex items-center rounded px-1.5 py-0.5 text-[11px] leading-none font-bold tracking-wide text-black ${className}`}
      style={{ background }}
    >
      {SIDE_LABELS[side]}
    </span>
  );
}

/** Fundo do anel do marcador no mapa: cor do lado, ou metade/metade se misto ou "Ambos". */
export function sideRingBackground(sides: GrenadeSide[]): string {
  const set = new Set(sides);
  if (set.size === 1 && !set.has('both')) return sideColorVar([...set][0] as 'ct' | 'tr');
  return `conic-gradient(${sideColorVar('ct')} 0 50%, ${sideColorVar('tr')} 50% 100%)`;
}
