import { useMemo, useState } from 'react';
import { Modal } from '../../components/Modal';
import { Button } from '../../components/Button';
import { errorMessage } from '../../lib/api';
import { GRENADE_LABELS, type Grenade } from '../../lib/types';
import { Thumbnails } from '../../components/Thumbnails';
import { GrenadeIcon } from './GrenadeIcon';
import { SideBadge } from './SideBadge';
import { useGrenadeStore } from './grenadeStore';
import { usePlayerStore } from '../players/playerStore';
import { PlayerAvatar } from '../players/PlayerAvatar';

interface Props {
  grenadeIds: string[];
  onEdit: (grenade: Grenade) => void;
  onClose: () => void;
}

export function GrenadeDetailsModal({ grenadeIds, onEdit, onClose }: Props) {
  const all = useGrenadeStore((s) => s.grenades);
  const remove = useGrenadeStore((s) => s.remove);
  const players = usePlayerStore((s) => s.players);
  const grenades = useMemo(() => all.filter((g) => grenadeIds.includes(g.id)), [all, grenadeIds]);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const endLabel = grenades.find((g) => g.end.label)?.end.label;
  const title = endLabel ? `Granadas em ${endLabel}` : 'Granadas neste ponto';

  const doRemove = async (id: string) => {
    setError(null);
    try {
      await remove(id);
      setConfirming(null);
      if (grenades.length <= 1) onClose();
    } catch (e) {
      setError(errorMessage(e));
    }
  };

  return (
    <Modal title={title} onClose={onClose} width="max-w-xl">
      {grenades.length === 0 && <p className="text-sm text-muted">Nenhuma granada.</p>}
      <ul className="space-y-3">
        {grenades.map((g) => (
          <li key={g.id} className="rounded-lg border border-border bg-bg-2 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <GrenadeIcon type={g.type} size={24} />
                <span className="font-semibold">{GRENADE_LABELS[g.type]}</span>
                <SideBadge side={g.side} />
              </div>
              <div className="flex gap-1">
                {confirming === g.id ? (
                  <>
                    <span className="self-center pr-1 text-xs text-muted">Excluir?</span>
                    <Button variant="danger" onClick={() => void doRemove(g.id)}>
                      Sim
                    </Button>
                    <Button variant="ghost" onClick={() => setConfirming(null)}>
                      Não
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" onClick={() => onEdit(g)}>
                      Editar
                    </Button>
                    <Button variant="ghost" className="hover:!text-danger" onClick={() => setConfirming(g.id)}>
                      Excluir
                    </Button>
                  </>
                )}
              </div>
            </div>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
              <dt className="text-muted">Ponto de início:</dt>
              <dd>{g.start.label || <span className="text-muted italic">sem nome</span>}</dd>
              <dt className="text-muted">Onde cai:</dt>
              <dd>{g.end.label || <span className="text-muted italic">sem nome</span>}</dd>
              <dt className="text-muted">Como fazer:</dt>
              <dd className="whitespace-pre-wrap">{g.howTo}</dd>
              {g.notes && (
                <>
                  <dt className="text-muted">Informações:</dt>
                  <dd className="whitespace-pre-wrap">{g.notes}</dd>
                </>
              )}
              <dt className="text-muted">Quem sabe:</dt>
              <dd>
                {g.playerIds.length === 0 ? (
                  <span className="text-muted italic">ninguém vinculado</span>
                ) : (
                  <ul className="flex flex-wrap gap-x-3 gap-y-1">
                    {g.playerIds
                      .map((id) => players.find((p) => p.id === id))
                      .filter((p) => p !== undefined)
                      .map((p) => (
                        <li key={p.id} className="flex items-center gap-1.5">
                          <PlayerAvatar player={p} size="xs" />
                          {p.name}
                        </li>
                      ))}
                  </ul>
                )}
              </dd>
            </dl>
            {g.imageIds.length > 0 && (
              <div className="mt-3">
                <Thumbnails imageIds={g.imageIds} size={88} />
              </div>
            )}
          </li>
        ))}
      </ul>
      {error && <p className="mt-3 text-sm text-danger">{error}</p>}
    </Modal>
  );
}
