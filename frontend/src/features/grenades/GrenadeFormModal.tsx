import { useState, type FormEvent } from 'react';
import { Modal } from '../../components/Modal';
import { Button } from '../../components/Button';
import { errorMessage } from '../../lib/api';
import { GRENADE_LABELS, GRENADE_TYPES, type GrenadeInput, type GrenadeType, type LabeledPoint } from '../../lib/types';
import { GrenadeIcon } from './GrenadeIcon';

interface Props {
  title: string;
  initial: { type: GrenadeType | null; start: LabeledPoint; end: LabeledPoint; howTo: string };
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
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const valid = type !== null && howTo.trim().length > 0;

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
            {saving ? 'Salvando…' : 'Salvar'}
          </Button>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
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

        {error && <p className="text-sm text-danger">{error}</p>}
      </form>
    </Modal>
  );
}
