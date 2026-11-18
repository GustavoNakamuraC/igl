import { GRENADE_LABELS, GRENADE_TYPES } from '../../lib/types';
import { useGrenadeStore } from './grenadeStore';
import { GrenadeIcon } from './GrenadeIcon';

export function FilterChips({ counts }: { counts: Record<string, number> }) {
  const activeTypes = useGrenadeStore((s) => s.activeTypes);
  const toggleType = useGrenadeStore((s) => s.toggleType);
  const onlyType = useGrenadeStore((s) => s.onlyType);
  const allTypes = useGrenadeStore((s) => s.allTypes);
  const allActive = activeTypes.length === GRENADE_TYPES.length;

  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filtro por tipo de granada">
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
