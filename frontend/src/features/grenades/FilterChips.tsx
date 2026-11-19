import { GRENADE_LABELS, GRENADE_TYPES, SIDE_LABELS, TEAM_SIDES, sideColorVar } from '../../lib/types';
import { useGrenadeStore } from './grenadeStore';
import { GrenadeIcon } from './GrenadeIcon';

interface Props {
  /** Quantas granadas de cada tipo (já filtradas por line e lado). */
  counts: Record<string, number>;
  /** Quantas granadas de cada lado (já filtradas por line e tipo; "Ambos" conta nos dois). */
  sideCounts: Record<string, number>;
}

export function FilterChips({ counts, sideCounts }: Props) {
  const activeTypes = useGrenadeStore((s) => s.activeTypes);
  const activeSides = useGrenadeStore((s) => s.activeSides);
  const toggleType = useGrenadeStore((s) => s.toggleType);
  const onlyType = useGrenadeStore((s) => s.onlyType);
  const toggleSide = useGrenadeStore((s) => s.toggleSide);
  const onlySide = useGrenadeStore((s) => s.onlySide);
  const allTypes = useGrenadeStore((s) => s.allTypes);
  const allActive = activeTypes.length === GRENADE_TYPES.length && activeSides.length === TEAM_SIDES.length;

  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filtro de granadas">
      <div className="flex items-center gap-1.5" role="group" aria-label="Filtro por lado">
        {TEAM_SIDES.map((side) => {
          const active = activeSides.includes(side);
          return (
            <button
              key={side}
              type="button"
              aria-pressed={active}
              title="Clique: liga/desliga · Duplo clique: só este"
              onClick={() => toggleSide(side)}
              onDoubleClick={() => onlySide(side)}
              className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-sm font-semibold transition ${
                active ? 'bg-surface-2' : 'border-border/60 opacity-50'
              }`}
              style={{ borderColor: active ? sideColorVar(side) : undefined, color: active ? sideColorVar(side) : undefined }}
            >
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: sideColorVar(side) }} />
              {SIDE_LABELS[side]}
              <span className="text-xs font-normal text-muted">{sideCounts[side] ?? 0}</span>
            </button>
          );
        })}
      </div>
      <span className="mx-1 h-5 w-px bg-border" aria-hidden="true" />
      {GRENADE_TYPES.map((type) => {
        const active = activeTypes.includes(type);
        return (
          <div
            key={type}
            className={`group flex items-center rounded-full border transition ${
              active ? 'border-border bg-surface-2' : 'border-border/60 bg-transparent opacity-50'
            }`}
          >
            <button
              type="button"
              aria-pressed={active}
              title="Clique: liga/desliga · Duplo clique: só este"
              onClick={() => toggleType(type)}
              onDoubleClick={() => onlyType(type)}
              className="flex items-center gap-1.5 py-1 pr-2 pl-1 text-sm"
            >
              <GrenadeIcon type={type} size={20} />
              {GRENADE_LABELS[type]}
              <span className="text-xs text-muted">{counts[type] ?? 0}</span>
            </button>
            <button
              type="button"
              onClick={() => onlyType(type)}
              className="mr-1 hidden rounded-full px-1.5 text-xs text-muted group-hover:inline hover:text-accent"
              title={`Mostrar só ${GRENADE_LABELS[type]}`}
            >
              só este
            </button>
          </div>
        );
      })}
      {!allActive && (
        <button type="button" onClick={allTypes} className="text-xs text-accent hover:underline">
          mostrar todos
        </button>
      )}
    </div>
  );
}
