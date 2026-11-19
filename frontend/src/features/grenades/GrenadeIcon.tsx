import type { GrenadeType } from '../../lib/types';

export const GRENADE_COLOR: Record<GrenadeType, string> = {
  smoke: 'var(--color-smoke)',
  molotov: 'var(--color-molotov)',
  flash: 'var(--color-flash)',
  he: 'var(--color-he)',
};

/** Glifos próprios (24x24) para cada tipo de granada. */
function Glyph({ type }: { type: GrenadeType }) {
  switch (type) {
    case 'smoke':
      return (
        <path
          d="M7 17.5a4 4 0 0 1-.6-7.96A5.5 5.5 0 0 1 17 8.2a4.5 4.5 0 0 1 .5 9.3H7Z"
          fill="currentColor"
        />
      );
    case 'molotov':
      return (
        <path
          d="M12 2.5c.6 3-1.8 4.6-3.2 6.6C7.6 10.8 7 12.3 7 14a5 5 0 0 0 10 0c0-2.2-1-3.8-2-5 .1 1.6-.5 2.7-1.6 3.2.3-3.3-.4-6.9-1.4-9.7Z"
          fill="currentColor"
        />
      );
    case 'flash':
      return (
        <path
          d="M12 2l1.8 6.2L20 6l-4.2 5 6.2 1-6.2 1.6L20 18l-6.2-2.2L12 22l-1.8-6.2L4 18l4.2-4.4L2 12l6.2-1L4 6l6.2 2.2Z"
          fill="currentColor"
        />
      );
    case 'he':
      return (
        <g fill="currentColor">
          <circle cx="12" cy="14" r="6.5" />
          <rect x="10" y="4" width="4" height="4" rx="1" />
          <path d="M14 5h3.5a1 1 0 0 1 0 2H14Z" />
        </g>
      );
  }
}

interface Props {
  type: GrenadeType;
  size?: number;
  className?: string;
}

/** Ícone redondo com a cor do tipo e o glifo escuro no centro. */
export function GrenadeIcon({ type, size = 28, className = '' }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={className}
      aria-hidden="true"
      style={{ color: '#111' }}
    >
      <circle cx="16" cy="16" r="15" fill={GRENADE_COLOR[type]} stroke="#0f1113" strokeWidth="2" />
      <g transform="translate(5.5 5.5) scale(0.875)">
        <Glyph type={type} />
      </g>
    </svg>
  );
}
