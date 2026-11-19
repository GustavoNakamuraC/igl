import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/Button';
import { playerColorVar, type Player } from '../../lib/types';
import { PlayerAvatar } from './PlayerAvatar';
import { PlayerModal } from './PlayerModal';
import { usePlayerStore } from './playerStore';
import { LineSelector } from '../line/LineSelector';

export function PlayersPage() {
  const players = usePlayerStore((s) => s.players);
  const loaded = usePlayerStore((s) => s.loaded);
  // undefined = fechado, null = novo jogador.
  const [open, setOpen] = useState<Player | null | undefined>(undefined);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link to="/" className="text-sm text-muted hover:text-text">
            ← Mapas
          </Link>
          <h1 className="mt-1 text-3xl font-black tracking-tight">Jogadores</h1>
          <p className="mt-1 text-sm text-muted">Quem joga com você e quais granadas cada um sabe.</p>
        </div>
        <Button variant="primary" onClick={() => setOpen(null)}>
          + Cadastrar jogador
        </Button>
      </header>

      {loaded && players.length === 0 ? (
        <div className="flex flex-col items-center rounded-xl border border-dashed border-border px-6 py-16 text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-surface-2 text-2xl text-muted">?</div>
          <p className="font-semibold">Nenhum jogador cadastrado</p>
          <p className="mt-1 max-w-sm text-sm text-muted">
            Cadastre os jogadores do grupo para vincular granadas a eles e montar a line atual.
          </p>
          <Button variant="primary" className="mt-5" onClick={() => setOpen(null)}>
            + Cadastrar o primeiro jogador
          </Button>
        </div>
      ) : (
        <>
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {players.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => setOpen(p)}
                  className="group flex w-full flex-col items-center rounded-xl border border-border bg-surface px-3 py-5 transition hover:-translate-y-0.5"
                >
                  <PlayerAvatar player={p} size="lg" className="transition group-hover:scale-105" />
                  <span className="mt-3 max-w-full truncate font-semibold">{p.name}</span>
                  <span className="text-xs" style={{ color: playerColorVar(p.color) }}>
                    {p.role ?? '—'}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          {players.length > 0 && (
            <section className="mt-10">
              <LineSelector />
            </section>
          )}
        </>
      )}

      {open !== undefined && <PlayerModal player={open} onClose={() => setOpen(undefined)} />}
    </div>
  );
}
