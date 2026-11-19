import { useState } from 'react';
import { Button } from '../../components/Button';
import { errorMessage } from '../../lib/api';
import type { Region } from '../../lib/types';
import { useRegionStore } from './regionStore';

interface Props {
  highlightedId: string | null;
  onHighlight: (id: string | null) => void;
  onRename: (region: Region) => void;
  onEditShape: (region: Region) => void;
  onClose: () => void;
}

export function RegionPanel({ highlightedId, onHighlight, onRename, onEditShape, onClose }: Props) {
  const regions = useRegionStore((s) => s.regions);
  const remove = useRegionStore((s) => s.remove);
  const showLabels = useRegionStore((s) => s.showLabels);
  const toggleLabels = useRegionStore((s) => s.toggleLabels);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <aside className="flex w-72 shrink-0 flex-col border-l border-border bg-surface">
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold">Regiões ({regions.length})</h2>
        <button type="button" onClick={onClose} aria-label="Fechar painel" className="text-lg leading-none text-muted hover:text-text">
          ×
        </button>
      </header>
      <label className="flex items-center gap-2 border-b border-border px-4 py-2 text-sm text-muted">
        <input type="checkbox" checked={showLabels} onChange={toggleLabels} className="accent-[var(--color-accent)]" />
        Mostrar nomes no mapa
      </label>
      <ul className="flex-1 overflow-y-auto p-2">
        {regions.length === 0 && (
          <li className="px-2 py-4 text-sm text-muted">Nenhuma região. Use “Nomear região” para desenhar uma.</li>
        )}
        {regions.map((r) => (
          <li
            key={r.id}
            onMouseEnter={() => onHighlight(r.id)}
            onMouseLeave={() => onHighlight(null)}
            className={`rounded-md px-2 py-2 ${highlightedId === r.id ? 'bg-surface-2' : ''}`}
          >
            <div className="truncate text-sm font-medium">{r.name}</div>
            {confirming === r.id ? (
              <div className="mt-1 flex items-center gap-1 text-xs">
                <span className="text-muted">Excluir região?</span>
                <Button
                  variant="danger"
                  className="!px-2 !py-0.5 !text-xs"
                  onClick={async () => {
                    try {
                      await remove(r.id);
                      setConfirming(null);
                    } catch (e) {
                      setError(errorMessage(e));
                    }
                  }}
                >
                  Sim
                </Button>
                <Button variant="ghost" className="!px-2 !py-0.5 !text-xs" onClick={() => setConfirming(null)}>
                  Não
                </Button>
              </div>
            ) : (
              <div className="mt-1 flex gap-3 text-xs text-muted">
                <button type="button" className="hover:text-accent" onClick={() => onRename(r)}>
                  Renomear
                </button>
                <button type="button" className="hover:text-accent" onClick={() => onEditShape(r)}>
                  Editar forma
                </button>
                <button type="button" className="hover:text-danger" onClick={() => setConfirming(r.id)}>
                  Excluir
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
      {error && <p className="px-4 pb-3 text-sm text-danger">{error}</p>}
    </aside>
  );
}
