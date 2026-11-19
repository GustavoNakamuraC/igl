import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Modal } from '../../components/Modal';
import { Button } from '../../components/Button';
import { ImagePicker, imagesFromClipboard, useImageUpload } from '../../components/ImagePicker';
import { Thumbnails } from '../../components/Thumbnails';
import { errorMessage } from '../../lib/api';
import { PRINT_MAX } from '../../lib/image';
import { GRENADE_LABELS, GRENADE_TYPES, type GrenadeInput, type GrenadeType, type LabeledPoint } from '../../lib/types';
import { GrenadeIcon } from './GrenadeIcon';
import { usePlayerStore } from '../players/playerStore';
import { PlayerAvatar } from '../players/PlayerAvatar';

/** Máximo de prints por granada (mesmo limite do backend). */
const MAX_IMAGES = 10;

interface Props {
  title: string;
  initial: {
    type: GrenadeType | null;
    start: LabeledPoint;
    end: LabeledPoint;
    howTo: string;
    notes?: string | null;
    playerIds?: string[];
    imageIds?: string[];
  };
  onSave: (input: GrenadeInput) => Promise<unknown>;
  onCancel: () => void;
}

const inputClass =
  'w-full rounded-md border border-border bg-bg-2 px-3 py-2 text-sm text-text placeholder:text-muted/60 focus:border-accent focus:outline-none';

export function GrenadeFormModal({ title, initial, onSave, onCancel }: Props) {
  const [type, setType] = useState<GrenadeType | null>(initial.type);
  const [startLabel, setStartLabel] = useState(initial.start.label ?? '');
  const [endLabel, setEndLabel] = useState(initial.end.label ?? '');
  const [howTo, setHowTo] = useState(initial.howTo);
  const [notes, setNotes] = useState(initial.notes ?? '');
  const [playerIds, setPlayerIds] = useState<string[]>(initial.playerIds ?? []);
  const [imageIds, setImageIds] = useState<string[]>(initial.imageIds ?? []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const players = usePlayerStore((s) => s.players);
  const prints = useImageUpload(PRINT_MAX, (ids) => setImageIds((cur) => [...cur, ...ids].slice(0, MAX_IMAGES)));
  const roomForImages = MAX_IMAGES - imageIds.length - prints.busy;

  const addPrints = (files: File[]) => void prints.upload(files.slice(0, Math.max(0, roomForImages)));
  const togglePlayer = (id: string) =>
    setPlayerIds((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));

  const valid = type !== null && howTo.trim().length > 0 && prints.busy === 0;

  const submit = async (e?: FormEvent) => {
    e?.preventDefault();
    if (!valid || saving) return;
    setSaving(true);
    setError(null);
    try {
      await onSave({
        type: type!,
        start: { ...initial.start, label: startLabel.trim() || null },
        end: { ...initial.end, label: endLabel.trim() || null },
        howTo: howTo.trim(),
        notes: notes.trim() || null,
        playerIds,
        imageIds,
      });
    } catch (err) {
      setError(errorMessage(err));
      setSaving(false);
    }
  };

  return (
    <Modal
      title={title}
      onClose={onCancel}
      footer={
        <>
          <Button variant="ghost" onClick={onCancel}>
            Cancelar
          </Button>
          <Button variant="primary" disabled={!valid || saving} onClick={() => void submit()}>
            {saving ? 'Salvando…' : prints.busy > 0 ? 'Enviando prints…' : 'Salvar'}
          </Button>
        </>
      }
    >
      <form
        onSubmit={submit}
        className="space-y-4"
        onPaste={(e) => {
          const files = imagesFromClipboard(e);
          if (files.length) {
            e.preventDefault();
            addPrints(files);
          }
        }}
      >
        <fieldset>
          <legend className="mb-2 text-xs font-medium tracking-wide text-muted uppercase">Tipo de granada *</legend>
          <div className="grid grid-cols-4 gap-2">
            {GRENADE_TYPES.map((t) => (
              <button
                key={t}
                type="button"
                aria-pressed={type === t}
                onClick={() => setType(t)}
                className={`flex flex-col items-center gap-1 rounded-lg border px-2 py-2 text-xs transition ${
                  type === t ? 'border-accent bg-accent/10 text-text' : 'border-border text-muted hover:border-muted'
                }`}
              >
                <GrenadeIcon type={t} size={26} />
                {GRENADE_LABELS[t]}
              </button>
            ))}
          </div>
        </fieldset>

        <label className="block">
          <span className="mb-1 block text-xs font-medium tracking-wide text-muted uppercase">Ponto de início</span>
          <input
            className={inputClass}
            value={startLabel}
            maxLength={80}
            placeholder="Ex.: Varanda"
            onChange={(e) => setStartLabel(e.target.value)}
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-medium tracking-wide text-muted uppercase">Onde cai</span>
          <input
            className={inputClass}
            value={endLabel}
            maxLength={80}
            placeholder="Ex.: Meio"
            onChange={(e) => setEndLabel(e.target.value)}
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-medium tracking-wide text-muted uppercase">Como fazer *</span>
          <textarea
            className={`${inputClass} min-h-28 resize-y`}
            value={howTo}
            maxLength={4000}
            placeholder="Ex.: Encostar no canto da caixa, mirar na ponta da antena, jump throw."
            onChange={(e) => setHowTo(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) void submit();
            }}
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-medium tracking-wide text-muted uppercase">Informações adicionais</span>
          <textarea
            className={`${inputClass} min-h-16 resize-y`}
            value={notes}
            maxLength={4000}
            placeholder="Ex.: só funciona no lado TR, cuidado com o timing do rotate…"
            onChange={(e) => setNotes(e.target.value)}
          />
        </label>

        <fieldset>
          <legend className="mb-2 text-xs font-medium tracking-wide text-muted uppercase">Quem sabe fazer</legend>
          {players.length === 0 ? (
            <p className="text-sm text-muted">
              Nenhum jogador cadastrado.{' '}
              <Link to="/jogadores" className="text-accent hover:underline">
                Cadastrar jogadores
              </Link>
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {players.map((p) => {
                const on = playerIds.includes(p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => togglePlayer(p.id)}
                    className={`flex items-center gap-1.5 rounded-full border py-0.5 pr-3 pl-0.5 text-sm transition ${
                      on ? 'border-accent bg-accent/10 text-text' : 'border-border text-muted hover:border-muted'
                    }`}
                  >
                    <PlayerAvatar player={p} size="xs" dimmed={!on} />
                    {p.name}
                  </button>
                );
              })}
            </div>
          )}
        </fieldset>

        <fieldset>
          <legend className="mb-2 text-xs font-medium tracking-wide text-muted uppercase">
            Prints ({imageIds.length}/{MAX_IMAGES})
          </legend>
          <div className="flex flex-wrap items-center gap-2">
            <Thumbnails imageIds={imageIds} onRemove={(id) => setImageIds((cur) => cur.filter((x) => x !== id))} />
            {Array.from({ length: prints.busy }, (_, i) => (
              <div key={i} className="h-[72px] w-[72px] animate-pulse rounded-md border border-border bg-surface-2" />
            ))}
            {roomForImages > 0 && (
              <ImagePicker multiple upload={async (files) => addPrints(files)}>
                {(open) => (
                  <button
                    type="button"
                    onClick={open}
                    className="flex h-[72px] w-[72px] flex-col items-center justify-center rounded-md border border-dashed border-border text-xs text-muted hover:border-accent hover:text-accent"
                  >
                    <span className="text-xl leading-none">+</span>
                    adicionar
                  </button>
                )}
              </ImagePicker>
            )}
          </div>
          <p className="mt-1.5 text-xs text-muted">Ex.: onde ficar e o pixel da mira. Dá para colar um print com Ctrl+V.</p>
          {prints.error && <p className="mt-1 text-xs text-danger">{prints.error}</p>}
        </fieldset>

        {error && <p className="text-sm text-danger">{error}</p>}
      </form>
    </Modal>
  );
}
