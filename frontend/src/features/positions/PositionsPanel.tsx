import { useState } from 'react';
import { Link } from 'react-router-dom';
import { errorMessage } from '../../lib/api';
import { SIDE_LABELS, TEAM_SIDES, sideColorVar, type Player, type Region, type TeamSide } from '../../lib/types';
import { PlayerAvatar } from '../players/PlayerAvatar';
import { usePositionStore } from './positionStore';

interface Props {
  side: TeamSide;
  onSideChange: (side: TeamSide) => void;
  regions: Region[];
  /** Jogadores mostrados (todos, ou só a line atual). */
  players: Player[];
  filteredByLine: boolean;
  onHoverPlayer: (playerId: string | null) => void;
  onClose: () => void;
}

/** Painel lateral: em cada lado, em quais regiões cada jogador fica. */
export function PositionsPanel({ side, onSideChange, regions, players, filteredByLine, onHoverPlayer, onClose }: Props) {
  const positions = usePositionStore((s) => s.positions);
  const add = usePositionStore((s) => s.add);
  const remove = usePositionStore((s) => s.remove);
  const [error, setError] = useState<string | null>(null);
  const regionName = (id: string) => regions.find((r) => r.id === id)?.name ?? '?';

  const run = async (fn: () => Promise<void>) => {
    setError(null);
    try {
      await fn();
    } catch (e) {
      setError(errorMessage(e));
    }
  };

  return (
    <aside className="flex w-80 shrink-0 flex-col border-l border-border bg-surface" aria-label="Posições">
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold">Posições</h2>
        <button type="button" onClick={onClose} aria-label="Fechar painel" className="text-lg leading-none text-muted hover:text-text">
          ×
        </button>
      </header>

      <div className="flex border-b border-border" role="tablist">
        {TEAM_SIDES.map((s) => {
          const active = s === side;
          return (
            <button
              key={s}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onSideChange(s)}
              className={`flex-1 border-b-2 py-2 text-sm font-bold transition ${active ? '' : 'border-transparent text-muted hover:text-text'}`}
              style={active ? { borderColor: sideColorVar(s), color: sideColorVar(s) } : undefined}
            >
              {SIDE_LABELS[s]}
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {regions.length === 0 ? (
          <p className="px-1 py-3 text-sm text-muted">
            Desenhe regiões com “Nomear região” para definir onde cada jogador fica.
          </p>
        ) : players.length === 0 ? (
          <p className="px-1 py-3 text-sm text-muted">
            Nenhum jogador cadastrado.{' '}
            <Link to="/jogadores" className="text-accent hover:underline">
              Cadastrar jogadores
            </Link>
          </p>
        ) : (
          <>
            {filteredByLine && <p className="mb-2 px-1 text-xs text-muted">Mostrando só os jogadores da line atual.</p>}
            <ul className="space-y-2">
              {players.map((p) => {
                const mine = positions.filter((pos) => pos.playerId === p.id && pos.side === side);
                const available = regions.filter((r) => !mine.some((pos) => pos.regionId === r.id));
                return (
                  <li
                    key={p.id}
                    className="rounded-lg border border-border bg-bg-2 p-2.5"
                    onMouseEnter={() => onHoverPlayer(p.id)}
                    onMouseLeave={() => onHoverPlayer(null)}
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <PlayerAvatar player={p} size="xs" />
                      <span className="truncate text-sm font-semibold">{p.name}</span>
                      {p.role && <span className="truncate text-xs text-muted">{p.role}</span>}
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {mine.map((pos) => (
                        <span
                          key={pos.id}
                          className="flex items-center gap-1 rounded-full border py-0.5 pr-1 pl-2 text-xs"
                          style={{ borderColor: sideColorVar(side) }}
                        >
                          {regionName(pos.regionId)}
                          <button
                            type="button"
                            aria-label={`Remover ${p.name} de ${regionName(pos.regionId)}`}
                            onClick={() => void run(() => remove(pos.id))}
                            className="rounded-full px-1 text-muted hover:text-danger"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                      {available.length > 0 && (
                        <select
                          aria-label={`Adicionar posição de ${p.name}`}
                          value=""
                          onChange={(e) => {
                            const regionId = e.target.value;
                            if (regionId) void run(() => add(p.id, regionId, side));
                          }}
                          className="rounded-full border border-dashed border-border bg-transparent px-2 py-0.5 text-xs text-muted hover:border-accent focus:outline-none"
                        >
                          <option value="">+ adicionar</option>
                          {available.map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.name}
                            </option>
                          ))}
                        </select>
                      )}
                      {mine.length === 0 && available.length === 0 && <span className="text-xs text-muted">—</span>}
                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        )}
        {error && <p className="mt-3 text-sm text-danger">{error}</p>}
      </div>
    </aside>
  );
}
