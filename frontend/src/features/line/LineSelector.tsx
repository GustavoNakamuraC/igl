import { Link } from 'react-router-dom';
import { usePlayerStore } from '../players/playerStore';
import { PlayerAvatar } from '../players/PlayerAvatar';
import { MAX_LINE, useLineStore } from './lineStore';

interface Props {
  /** Versão compacta para a barra de filtros do mapa. */
  compact?: boolean;
}

/** Escolhe quem está jogando agora (0 a 5). Vazio = todas as granadas. */
export function LineSelector({ compact }: Props) {
  const players = usePlayerStore((s) => s.players);
  const loaded = usePlayerStore((s) => s.loaded);
  const ids = useLineStore((s) => s.ids);
  const toggle = useLineStore((s) => s.toggle);
  const clear = useLineStore((s) => s.clear);
  const full = ids.length >= MAX_LINE;

  if (!loaded) return null;

  if (players.length === 0) {
    return (
      <div className={`text-sm text-muted ${compact ? '' : 'rounded-xl border border-dashed border-border px-4 py-3'}`}>
        {compact ? 'Line: ' : ''}Nenhum jogador cadastrado.{' '}
        <Link to="/jogadores" className="text-accent hover:underline">
          Cadastrar
        </Link>
      </div>
    );
  }

  return (
    <div
      className={compact ? 'flex flex-wrap items-center gap-2' : 'rounded-xl border border-border bg-surface px-4 py-3'}
      role="group"
      aria-label="Line atual"
    >
      <div className={`flex items-center gap-2 ${compact ? '' : 'mb-3'}`}>
        <span className="text-xs font-medium tracking-wide text-muted uppercase">
          Line {ids.length}/{MAX_LINE}
        </span>
        {!compact && (
          <span className="text-xs text-muted">
            {ids.length === 0 ? '· ninguém selecionado: mostrando todas as granadas' : '· mapas mostram só as granadas desses jogadores'}
          </span>
        )}
        {ids.length > 0 && (
          <button type="button" onClick={clear} className="text-xs text-accent hover:underline">
            limpar
          </button>
        )}
      </div>
      <ul className={`flex flex-wrap ${compact ? 'gap-1.5' : 'gap-3'}`}>
        {players.map((p) => {
          const selected = ids.includes(p.id);
          const disabled = !selected && full;
          return (
            <li key={p.id}>
              <button
                type="button"
                aria-pressed={selected}
                disabled={disabled}
                title={disabled ? 'A line já tem 5 jogadores' : selected ? `Tirar ${p.name} da line` : `Pôr ${p.name} na line`}
                onClick={() => toggle(p.id)}
                className={`flex items-center gap-1.5 rounded-full transition ${compact ? 'pr-2' : 'flex-col px-1'}`}
              >
                <PlayerAvatar
                  player={p}
                  size={compact ? 'xs' : 'md'}
                  selected={selected}
                  dimmed={ids.length > 0 && !selected}
                />
                <span className={`max-w-24 truncate text-xs ${selected ? 'text-text' : 'text-muted'}`}>{p.name}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
