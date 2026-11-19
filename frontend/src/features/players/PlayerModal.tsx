import { useEffect, useState, type FormEvent } from 'react';
import { Modal } from '../../components/Modal';
import { Button } from '../../components/Button';
import { ImagePicker, useImageUpload } from '../../components/ImagePicker';
import { api, errorMessage } from '../../lib/api';
import { PHOTO_MAX } from '../../lib/image';
import {
  PLAYER_COLORS,
  SIDE_LABELS,
  TEAM_SIDES,
  playerColorVar,
  sideColorVar,
  type Player,
  type PlayerColor,
  type PlayerPositionView,
} from '../../lib/types';
import { MAPS } from '../../data/maps';
import { PlayerAvatar } from './PlayerAvatar';
import { usePlayerStore } from './playerStore';

const inputClass =
  'w-full rounded-md border border-border bg-bg-2 px-3 py-2 text-sm text-text placeholder:text-muted/60 focus:border-accent focus:outline-none';

const ROLE_SUGGESTIONS = ['IGL', 'Entry', 'AWP', 'Suporte', 'Lurker', 'Rifler', 'Âncora'];

interface Props {
  /** null = cadastro de novo jogador. */
  player: Player | null;
  onClose: () => void;
}

export function PlayerModal({ player, onClose }: Props) {
  const [editing, setEditing] = useState(player === null);
  if (editing) {
    return (
      <PlayerForm
        player={player}
        onCancel={() => (player ? setEditing(false) : onClose())}
        onSaved={() => (player ? setEditing(false) : onClose())}
      />
    );
  }
  return <PlayerView player={player!} onEdit={() => setEditing(true)} onClose={onClose} />;
}

function PlayerView({ player, onEdit, onClose }: { player: Player; onEdit: () => void; onClose: () => void }) {
  const remove = usePlayerStore((s) => s.remove);
  // O store tem a versão mais recente (após editar).
  const current = usePlayerStore((s) => s.players.find((p) => p.id === player.id)) ?? player;
  const [counts, setCounts] = useState<Record<string, number> | null>(null);
  const [positions, setPositions] = useState<PlayerPositionView[] | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<Record<string, number>>(`/players/${player.id}/grenade-counts`)
      .then(setCounts)
      .catch(() => setCounts({}));
  }, [player.id, current.updatedAt]);

  useEffect(() => {
    api<PlayerPositionView[]>(`/players/${player.id}/positions`)
      .then(setPositions)
      .catch(() => setPositions([]));
  }, [player.id]);

  const total = counts ? Object.values(counts).reduce((a, b) => a + b, 0) : 0;
  const colorLabel = PLAYER_COLORS.find((c) => c.value === current.color)?.label;

  return (
    <Modal
      title="Jogador"
      onClose={onClose}
      width="max-w-md"
      footer={
        confirming ? (
          <>
            <span className="mr-auto self-center text-sm text-muted">Excluir {current.name}? As granadas continuam.</span>
            <Button variant="ghost" onClick={() => setConfirming(false)}>
              Não
            </Button>
            <Button
              variant="danger"
              onClick={async () => {
                try {
                  await remove(current.id);
                  onClose();
                } catch (e) {
                  setError(errorMessage(e));
                }
              }}
            >
              Excluir
            </Button>
          </>
        ) : (
          <>
            <Button variant="ghost" className="mr-auto hover:!text-danger" onClick={() => setConfirming(true)}>
              Excluir
            </Button>
            <Button variant="primary" onClick={onEdit}>
              Editar
            </Button>
          </>
        )
      }
    >
      <div className="flex flex-col items-center text-center">
        <PlayerAvatar player={current} size="xl" />
        <h3 className="mt-3 text-xl font-bold">{current.name}</h3>
        <p className="mt-0.5 text-sm" style={{ color: playerColorVar(current.color) }}>
          {current.role ?? 'Sem função definida'}
          <span className="text-muted"> · {colorLabel}</span>
        </p>
        {current.secondaryRole && (
          <p className="mt-0.5 text-xs text-muted">
            Função secundária: <span className="text-text">{current.secondaryRole}</span>
          </p>
        )}
      </div>

      {current.notes && (
        <section className="mt-5">
          <h4 className="mb-1 text-xs font-medium tracking-wide text-muted uppercase">Informações</h4>
          <p className="text-sm whitespace-pre-wrap">{current.notes}</p>
        </section>
      )}

      <section className="mt-5">
        <h4 className="mb-2 text-xs font-medium tracking-wide text-muted uppercase">
          Granadas que sabe {counts && `(${total})`}
        </h4>
        {counts === null ? (
          <p className="text-sm text-muted">Carregando…</p>
        ) : total === 0 ? (
          <p className="text-sm text-muted">Nenhuma granada vinculada ainda.</p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {MAPS.filter((m) => counts[m.slug]).map((m) => (
              <li key={m.slug} className="rounded-full border border-border bg-bg-2 px-3 py-1 text-sm">
                {m.name} <span className="text-muted">{counts[m.slug]}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section className="mt-5">
        <h4 className="mb-2 text-xs font-medium tracking-wide text-muted uppercase">Posições</h4>
        <PositionsByMap positions={positions} />
      </section>
      {error && <p className="mt-3 text-sm text-danger">{error}</p>}
    </Modal>
  );
}

/** Posições do jogador agrupadas por mapa, uma linha por lado. */
function PositionsByMap({ positions }: { positions: PlayerPositionView[] | null }) {
  if (positions === null) return <p className="text-sm text-muted">Carregando…</p>;
  if (positions.length === 0) {
    return <p className="text-sm text-muted">Nenhuma posição definida. Defina na tela do mapa, em “Posições”.</p>;
  }
  return (
    <ul className="space-y-2">
      {MAPS.filter((m) => positions.some((p) => p.mapSlug === m.slug)).map((m) => (
        <li key={m.slug} className="rounded-lg border border-border bg-bg-2 px-3 py-2 text-sm">
          <div className="mb-1 font-semibold">{m.name}</div>
          {TEAM_SIDES.map((side) => {
            const names = positions.filter((p) => p.mapSlug === m.slug && p.side === side).map((p) => p.regionName);
            if (names.length === 0) return null;
            return (
              <div key={side} className="flex gap-2">
                <span className="w-7 shrink-0 font-bold" style={{ color: sideColorVar(side) }}>
                  {SIDE_LABELS[side]}
                </span>
                <span>{names.join(', ')}</span>
              </div>
            );
          })}
        </li>
      ))}
    </ul>
  );
}

function PlayerForm({ player, onCancel, onSaved }: { player: Player | null; onCancel: () => void; onSaved: () => void }) {
  const create = usePlayerStore((s) => s.create);
  const update = usePlayerStore((s) => s.update);
  const [name, setName] = useState(player?.name ?? '');
  const [role, setRole] = useState(player?.role ?? '');
  const [secondaryRole, setSecondaryRole] = useState(player?.secondaryRole ?? '');
  const [notes, setNotes] = useState(player?.notes ?? '');
  const [color, setColor] = useState<PlayerColor>(player?.color ?? 'blue');
  const [photoId, setPhotoId] = useState<string | null>(player?.photoId ?? null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const photo = useImageUpload(PHOTO_MAX, (ids) => setPhotoId(ids[0]));

  const valid = name.trim().length > 0 && photo.busy === 0;

  const submit = async (e?: FormEvent) => {
    e?.preventDefault();
    if (!valid || saving) return;
    setSaving(true);
    setError(null);
    const input = {
      name: name.trim(),
      role: role.trim() || null,
      secondaryRole: secondaryRole.trim() || null,
      notes: notes.trim() || null,
      color,
      photoId,
    };
    try {
      if (player) await update(player.id, input);
      else await create(input);
      onSaved();
    } catch (err) {
      setError(errorMessage(err));
      setSaving(false);
    }
  };

  return (
    <Modal
      title={player ? 'Editar jogador' : 'Novo jogador'}
      onClose={onCancel}
      width="max-w-md"
      footer={
        <>
          <Button variant="ghost" onClick={onCancel}>
            Cancelar
          </Button>
          <Button variant="primary" disabled={!valid || saving} onClick={() => void submit()}>
            {saving ? 'Salvando…' : 'Salvar'}
          </Button>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <div className="flex items-center gap-4">
          <PlayerAvatar player={{ name: name || '?', color, photoId }} size="lg" />
          <div className="flex flex-col items-start gap-1.5">
            <ImagePicker upload={photo.upload}>
              {(open) => (
                <Button onClick={open} disabled={photo.busy > 0}>
                  {photo.busy > 0 ? 'Enviando…' : photoId ? 'Trocar foto' : 'Adicionar foto'}
                </Button>
              )}
            </ImagePicker>
            {photoId && (
              <button type="button" className="text-xs text-muted hover:text-danger" onClick={() => setPhotoId(null)}>
                Remover foto
              </button>
            )}
            {photo.error && <p className="text-xs text-danger">{photo.error}</p>}
          </div>
        </div>

        <label className="block">
          <span className="mb-1 block text-xs font-medium tracking-wide text-muted uppercase">Nome *</span>
          <input className={inputClass} value={name} maxLength={40} placeholder="Nome ou apelido" onChange={(e) => setName(e.target.value)} />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1 block text-xs font-medium tracking-wide text-muted uppercase">Função principal</span>
            <input
              className={inputClass}
              value={role}
              maxLength={40}
              list="player-roles"
              placeholder="Ex.: Entry"
              onChange={(e) => setRole(e.target.value)}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium tracking-wide text-muted uppercase">Função secundária</span>
            <input
              className={inputClass}
              value={secondaryRole}
              maxLength={40}
              list="player-roles"
              placeholder="Ex.: Suporte"
              onChange={(e) => setSecondaryRole(e.target.value)}
            />
          </label>
          <datalist id="player-roles">
            {ROLE_SUGGESTIONS.map((r) => (
              <option key={r} value={r} />
            ))}
          </datalist>
        </div>

        <fieldset>
          <legend className="mb-2 text-xs font-medium tracking-wide text-muted uppercase">Cor</legend>
          <div className="flex gap-3" role="radiogroup">
            {PLAYER_COLORS.map((c) => (
              <button
                key={c.value}
                type="button"
                role="radio"
                aria-checked={color === c.value}
                aria-label={c.label}
                title={c.label}
                onClick={() => setColor(c.value)}
                className="h-8 w-8 rounded-full transition"
                style={{
                  background: playerColorVar(c.value),
                  boxShadow: color === c.value ? `0 0 0 3px var(--color-surface), 0 0 0 5px ${playerColorVar(c.value)}` : undefined,
                }}
              />
            ))}
          </div>
        </fieldset>

        <label className="block">
          <span className="mb-1 block text-xs font-medium tracking-wide text-muted uppercase">Informações adicionais</span>
          <textarea
            className={`${inputClass} min-h-20 resize-y`}
            value={notes}
            maxLength={2000}
            placeholder="Ex.: prefere jogar no bomb A, sensibilidade, bind de jump throw…"
            onChange={(e) => setNotes(e.target.value)}
          />
        </label>
        {error && <p className="text-sm text-danger">{error}</p>}
      </form>
    </Modal>
  );
}
