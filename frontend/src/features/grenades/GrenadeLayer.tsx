import type { Group } from '../../lib/geometry';
import { GRENADE_LABELS, SIDE_LABELS, type Grenade } from '../../lib/types';
import { anchorStyle, NO_PAN } from '../maps/MapCanvas';
import { GRENADE_COLOR, GrenadeIcon } from './GrenadeIcon';
import { sideRingBackground } from './SideBadge';

export function GrenadeLines({ grenades, px }: { grenades: Grenade[]; px: number }) {
  return (
    <g>
      {grenades.map((g) => (
        <g key={g.id}>
          <line
            x1={g.start.x}
            y1={g.start.y}
            x2={g.end.x}
            y2={g.end.y}
            stroke={GRENADE_COLOR[g.type]}
            strokeWidth={2 * px}
            strokeDasharray={`${5 * px} ${4 * px}`}
          />
        </g>
      ))}
    </g>
  );
}

export function StartMarkers({ grenades, scale }: { grenades: Grenade[]; scale: number }) {
  return (
    <>
      {grenades.map((g) => (
        <div
          key={g.id}
          style={{ ...anchorStyle(g.start, scale), borderColor: GRENADE_COLOR[g.type] }}
          className="h-3 w-3 rounded-full border-2 bg-black"
        />
      ))}
    </>
  );
}

interface Props {
  groups: Group<Grenade>[];
  scale: number;
  interactive: boolean;
  hovered: Group<Grenade> | null;
  onHover: (group: Group<Grenade> | null) => void;
  onOpen: (group: Group<Grenade>) => void;
}

export function GrenadeMarkers({ groups, scale, interactive, hovered, onHover, onOpen }: Props) {
  return (
    <>
      {groups.map((group) => {
        const first = group.items[0];
        const types = [...new Set(group.items.map((g) => g.type))];
        const isHovered = hovered === group;
        const label = group.items
          .map((g) => `${GRENADE_LABELS[g.type]} ${SIDE_LABELS[g.side]}${g.end.label ? ` · ${g.end.label}` : ''}`)
          .join('\n');
        return (
          <button
            key={group.items.map((g) => g.id).join()}
            type="button"
            title={label}
            aria-label={`${group.items.length} granada(s): ${label}`}
            data-testid="grenade-marker"
            style={anchorStyle(group.center, scale)}
            disabled={!interactive}
            onMouseEnter={() => onHover(group)}
            onMouseLeave={() => onHover(null)}
            onClick={(e) => {
              e.stopPropagation();
              onOpen(group);
            }}
            className={`${NO_PAN} ${interactive ? 'pointer-events-auto' : 'pointer-events-none'} rounded-full`}
          >
            <span
              className="relative block transition-transform duration-150"
              style={{
                transform: isHovered ? 'scale(1.3)' : undefined,
                filter: isHovered ? `drop-shadow(0 0 6px ${GRENADE_COLOR[first.type]})` : 'drop-shadow(0 1px 2px #000)',
              }}
            >
              {/* Anel na cor do lado (CT azul, TR amarelo; metade/metade se misto ou "Ambos"). */}
              <span
                data-testid="side-ring"
                className="block rounded-full p-[3px]"
                style={{ background: sideRingBackground(group.items.map((g) => g.side)) }}
              >
                <GrenadeIcon type={first.type} size={26} />
              </span>
              {types.length > 1 && (
                <span className="absolute -bottom-1 -left-1 flex">
                  {types.slice(1).map((t) => (
                    <span key={t} className="-ml-1 h-2.5 w-2.5 rounded-full border border-black" style={{ background: GRENADE_COLOR[t] }} />
                  ))}
                </span>
              )}
              {group.items.length > 1 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-black">
                  {group.items.length}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </>
  );
}
