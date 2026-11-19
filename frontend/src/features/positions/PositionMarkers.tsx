import { centroid } from '../../lib/geometry';
import type { PlayerPosition, Player, Region, TeamSide } from '../../lib/types';
import { anchorStyle } from '../maps/MapCanvas';
import { PlayerAvatar } from '../players/PlayerAvatar';

interface Props {
  positions: PlayerPosition[];
  regions: Region[];
  players: Player[];
  side: TeamSide;
  scale: number;
}

/** Avatares dos jogadores sobre o centro de cada região onde ficam (no lado escolhido). */
export function PositionMarkers({ positions, regions, players, side, scale }: Props) {
  return (
    <>
      {regions.map((region) => {
        const here = positions
          .filter((p) => p.side === side && p.regionId === region.id)
          .map((p) => players.find((pl) => pl.id === p.playerId))
          .filter((p) => p !== undefined);
        if (here.length === 0) return null;
        return (
          <div key={region.id} style={anchorStyle(centroid(region.points), scale)} data-testid="position-marker">
            {/* Logo abaixo do rótulo da região. */}
            <div className="mt-9 flex -space-x-1.5">
              {here.map((p) => (
                <span key={p.id} title={`${p.name} · ${region.name}`} className="pointer-events-auto">
                  <PlayerAvatar player={p} size="xs" className="ring-2 ring-black" />
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </>
  );
}
