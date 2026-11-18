import { useState, type FormEvent } from 'react';
import { Modal } from '../../components/Modal';
import { Button } from '../../components/Button';
import { errorMessage } from '../../lib/api';

interface Props {
  title: string;
  initialName?: string;
  onSave: (name: string) => Promise<unknown>;
  onCancel: () => void;
}

export function RegionNameModal({ title, initialName = '', onSave, onCancel }: Props) {
  const [name, setName] = useState(initialName);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e?: FormEvent) => {
    e?.preventDefault();
    if (!name.trim() || saving) return;
    setSaving(true);
    try {
      await onSave(name.trim());
    } catch (err) {
      setError(errorMessage(err));
      setSaving(false);
    }
  };

  return (
    <Modal
      title={title}
      onClose={onCancel}
      width="max-w-sm"
      footer={
        <>
          <Button variant="ghost" onClick={onCancel}>
            Cancelar
          </Button>
          <Button variant="primary" disabled={!name.trim() || saving} onClick={() => void submit()}>
            Salvar
          </Button>
        </>
      }
    >
      <form onSubmit={submit}>
        <label className="block">
          <span className="mb-1 block text-xs font-medium tracking-wide text-muted uppercase">Nome da região</span>
          <input
            className="w-full rounded-md border border-border bg-bg-2 px-3 py-2 text-sm focus:border-accent focus:outline-none"
            value={name}
            maxLength={80}
            placeholder="Ex.: Meio, L, Varanda"
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        {error && <p className="mt-2 text-sm text-danger">{error}</p>}
      </form>
    </Modal>
  );
}
