import { imageUrl } from '../../lib/image';
import { playerColorVar, type Player } from '../../lib/types';

const SIZES = { xs: 24, sm: 36, md: 56, lg: 88, xl: 128 } as const;

interface Props {
  player: Pick<Player, 'name' | 'color' | 'photoId'>;
  size?: keyof typeof SIZES;
  /** Destaque de "selecionado" (anel externo). */
  selected?: boolean;
  dimmed?: boolean;
  className?: string;
}

/** Círculo com a cor do jogador e a foto (ou a inicial do nome). */
export function PlayerAvatar({ player, size = 'md', selected, dimmed, className = '' }: Props) {
  const px = SIZES[size];
  const color = playerColorVar(player.color);
  const border = Math.max(2, Math.round(px / 18));
  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full font-bold text-black transition ${
        dimmed ? 'opacity-40 grayscale' : ''
      } ${className}`}
      style={{
        width: px,
        height: px,
        background: color,
        boxShadow: selected
          ? `0 0 0 ${border}px var(--color-bg), 0 0 0 ${border * 2}px ${color}`
          : `inset 0 0 0 ${border}px ${color}`,
        fontSize: px * 0.42,
      }}
      aria-hidden="true"
    >
      {player.photoId ? (
        <img
          src={imageUrl(player.photoId)}
          alt=""
          className="h-full w-full rounded-full object-cover"
          style={{ padding: border }}
          draggable={false}
        />
      ) : (
        player.name.trim().charAt(0).toUpperCase()
      )}
    </span>
  );
}
